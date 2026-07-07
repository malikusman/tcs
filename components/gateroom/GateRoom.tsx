"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gateCalendar, nextGate, msUntil, fmtCountdown, fmtMmSs, type Gate } from "@/lib/gates";
import { buildRun, clearingOutcome, seedFromId, type GateRun } from "@/lib/agents/scripts";
import { SimulatedDataSource } from "@/lib/agents/datasource";
import { paperStore } from "@/lib/paper/store";
import { mulberry32 } from "@/lib/util";
import GateRail from "./GateRail";
import Transcript, { type LockInfo, type SettleInfo } from "./Transcript";

// Canonical JSON: recursively key-sorted, so the sha-256 is stable for a given bid set.
function canonicalJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson((v as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function romeStamp(d: Date, withDay: boolean): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    ...(withDay ? { day: "2-digit", month: "short" } : {}),
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  return fmt.format(d).replace(",", "");
}

function gateDisplay(gate: Gate): string {
  const d = gate.at;
  const mon = d.toLocaleString("en-GB", { month: "short" });
  return `${gate.name} ${String(d.getDate()).padStart(2, "0")} ${mon} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface ActiveRun {
  gate: Gate;
  data: GateRun;
  visible: number;
  lock: LockInfo | null;
  settled: SettleInfo | null;
}

export default function GateRoom() {
  const [now, setNow] = useState<Date | null>(null); // null until mount → static SSR shell
  const [run, setRun] = useState<ActiveRun | null>(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const history = useSyncExternalStore(paperStore.subscribe, paperStore.snapshot, paperStore.serverSnapshot);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    // Sweep: settle any lock left pending >60s by a previous visit (its timer died on unmount).
    paperStore.pendingOlderThan(60000, Date.now()).forEach((s) => {
      paperStore.settle(s.id, clearingOutcome(s.gateId).deltaEUR);
    });
    const timers = timersRef.current;
    return () => {
      clearInterval(t);
      timers.forEach(clearTimeout);
      if (clearingRef.current) clearTimeout(clearingRef.current);
    };
  }, []);

  const settleRun = (signalId: string, gateId: string) => {
    if (clearingRef.current) { clearTimeout(clearingRef.current); clearingRef.current = null; }
    const outcome = clearingOutcome(gateId);
    paperStore.settle(signalId, outcome.deltaEUR);
    setRun((prev) => (prev && prev.lock?.signalId === signalId ? { ...prev, settled: outcome } : prev));
  };

  const finalize = async (gate: Gate, data: GateRun) => {
    const hash = await sha256Hex(canonicalJson({ gate: gate.id, bids: data.bids, summary: data.summary }));
    const hashShort = `${hash.slice(0, 8)}…${hash.slice(-4)}`;
    const at = new Date();
    const signalId = paperStore.nextId();
    paperStore.add({
      id: signalId,
      gateId: gate.id,
      locked: romeStamp(at, true),
      lockedAtMs: at.getTime(),
      gate: gateDisplay(gate),
      market: data.market,
      zone: data.zone,
      instruction: data.summary,
      rationale: data.rationale,
      hash: hashShort,
      deltaEUR: null,
      status: "locked",
      sim: true,
    });
    setRun((prev) => (prev ? {
      ...prev,
      lock: { hashShort, time: romeStamp(at, false), before: fmtMmSs(msUntil(gate, at)), signalId },
    } : prev));
    setRunning(false);
    const r = mulberry32(seedFromId(gate.id) ^ 0x9e3779b9);
    clearingRef.current = setTimeout(() => settleRun(signalId, gate.id), 45000 + r() * 15000);
  };

  const simulate = () => {
    if (running) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    // Settle a still-pending previous run before starting a new one, so no signal is left locked.
    if (run?.lock && !run.settled) settleRun(run.lock.signalId, run.gate.id);
    else if (clearingRef.current) { clearTimeout(clearingRef.current); clearingRef.current = null; }

    const gate = nextGate(new Date(), { auctionsOnly: true });
    const data = buildRun(gate, new SimulatedDataSource());
    setRunning(true);

    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRun({ gate, data, visible: data.events.length, lock: null, settled: null });
      void finalize(gate, data);
      return;
    }

    setRun({ gate, data, visible: 0, lock: null, settled: null });
    const r = mulberry32(seedFromId(gate.id) ^ 0xabcdef);
    let acc = 250;
    data.events.forEach((_, i) => {
      acc += 300 + r() * 600; // 300–900 ms between events
      timersRef.current.push(setTimeout(() => {
        setRun((prev) => (prev && prev.gate.id === gate.id ? { ...prev, visible: i + 1 } : prev));
        if (i === data.events.length - 1) void finalize(gate, data);
      }, acc));
    });
  };

  const calendar = now ? gateCalendar(now) : [];
  const next = now ? nextGate(now, { auctionsOnly: true }) : null;
  const countdown = now && next ? fmtCountdown(msUntil(next, now)) : "--:--:--";

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <GateRail
        mounted={now !== null}
        calendar={calendar}
        next={next}
        countdown={countdown}
        running={running}
        onSimulate={simulate}
        history={history}
      />
      <div className="lg:col-span-2">
        <Transcript
          events={run ? run.data.events : null}
          visible={run ? run.visible : 0}
          lock={run?.lock ?? null}
          settled={run?.settled ?? null}
          running={running}
          gateLabel={run ? gateDisplay(run.gate) : null}
          onFastForward={() => run?.lock && settleRun(run.lock.signalId, run.gate.id)}
        />
      </div>
    </div>
  );
}
