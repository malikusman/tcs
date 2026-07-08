"use client";

// Signal ledger table: static seed rows plus session-created signals from the
// Gate Room, merged live via the paper store. Server-rendered output contains
// only the seed rows (store serverSnapshot is empty), so hydration is clean.
// Rows are clickable — expanding one reveals the full detail panel (canonical
// hash, gate timing, benchmark breakdown) without leaving the page.

import { useState, useSyncExternalStore } from "react";
import { ChevronRight } from "lucide-react";
import { Card, Badge, Th, Td, TableWrap } from "@/components/ui/kit";
import { PAPER_SIGNALS } from "@/lib/data/platform";
import { paperStore } from "@/lib/paper/store";
import { cls } from "@/lib/util";

// Common shape both the static seed rows and live session rows normalise into.
interface RowVM {
  id: string;
  locked: string;
  gateClose?: string;
  gate: string;
  market: string;
  zone: string;
  side: "SELL" | "BUY" | "HOLD";
  instruction: string;
  rationale: string;
  hash: string;
  hashFull?: string;
  volumeMWh?: number;
  baselineEUR?: number;
  clearedEUR?: number;
  deltaEUR: number | null;
  status: "settled" | "locked";
  sim: boolean;
}

function deriveSide(instruction: string): RowVM["side"] {
  const t = instruction.toLowerCase();
  if (t.includes("buy")) return "BUY";
  if (t.includes("hold")) return "HOLD";
  return "SELL";
}

const sideTone = { SELL: "text-down", BUY: "text-up", HOLD: "text-solar" } as const;

function Delta({ v }: { v: number | null }) {
  if (v === null) return <span className="font-mono text-[12px] text-dim">awaiting clearing</span>;
  return (
    <span className={cls("font-mono tabular-nums", v >= 0 ? "text-up" : "text-down")}>
      {v >= 0 ? "+" : "−"}€{Math.abs(v).toLocaleString()}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="font-mono text-[12px] text-fg break-words">{children}</div>
    </div>
  );
}

function DetailPanel({ r }: { r: RowVM }) {
  const capturePP =
    r.baselineEUR != null && r.clearedEUR != null && r.baselineEUR !== 0
      ? ((r.clearedEUR - r.baselineEUR) / r.baselineEUR) * 100
      : null;

  return (
    <div className="px-5 py-4 bg-raised/30 border-t border-linesoft">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Field label="Locked (pre-gate)">{r.locked}</Field>
        <Field label="Gate closure">{r.gateClose ?? r.gate}</Field>
        <Field label="Market · zone">{r.market} · {r.zone}</Field>
        <Field label="Side · volume">
          <span className={sideTone[r.side]}>{r.side}</span>
          {r.volumeMWh != null && <span className="text-muted"> · {Math.abs(r.volumeMWh).toLocaleString()} MWh</span>}
        </Field>
      </div>

      <div className="mb-4">
        <div className="eyebrow mb-1">Instruction · rationale</div>
        <div className="text-[13px] text-fg">{r.instruction}</div>
        <div className="text-[12px] text-dim mt-0.5">{r.rationale}</div>
      </div>

      {(r.baselineEUR != null || r.clearedEUR != null) && (
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Field label="Naive baseline">{r.baselineEUR != null ? `€${r.baselineEUR.toLocaleString()}` : "—"}</Field>
          <Field label="Cleared (actual GME)">{r.clearedEUR != null ? `€${r.clearedEUR.toLocaleString()}` : "—"}</Field>
          <Field label="Capture vs baseline">
            <span className={cls(r.deltaEUR != null && r.deltaEUR < 0 ? "text-down" : "text-up")}>
              <Delta v={r.deltaEUR} />
              {capturePP != null && <span className="text-muted"> · {capturePP >= 0 ? "+" : "−"}{Math.abs(capturePP).toFixed(2)}pp</span>}
            </span>
          </Field>
        </div>
      )}

      <div>
        <div className="eyebrow mb-1">Canonical bid-set hash (sha-256)</div>
        <div className="font-mono text-[11px] text-muted break-all">
          {r.hashFull ?? r.hash}
          {r.sim && (
            <span className="ml-2 px-1 py-px rounded border border-line bg-raised text-[9.5px] text-dim align-middle">sim</span>
          )}
        </div>
        <div className="font-mono text-[10.5px] text-dim mt-1">
          Hashed and written to the immutable audit log at {r.locked}, before the gate — the paper book cannot peek at outcomes.
        </div>
      </div>
    </div>
  );
}

function LedgerRow({ r }: { r: RowVM }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className={cls("cursor-pointer transition-colors", open && "bg-raised/40", r.sim && "row-flash")}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
        }}
      >
        <Td className="!pr-0 w-6">
          <ChevronRight size={14} className={cls("text-dim transition-transform", open && "rotate-90")} />
        </Td>
        <Td><span className="font-mono text-[12px] text-muted">{r.id}</span></Td>
        <Td>
          <div className="font-mono text-[12px] tabular-nums">{r.locked}</div>
          <div className="font-mono text-[10.5px] text-dim">
            sha256 {r.hash}
            {r.sim && (
              <span className="ml-1.5 px-1 py-px rounded border border-line bg-raised text-[9.5px] text-dim align-middle">sim</span>
            )}
          </div>
        </Td>
        <Td><span className="font-mono text-[12px] text-muted">{r.gate}</span></Td>
        <Td><span className="font-mono text-[12px]">{r.zone}</span></Td>
        <Td><span className={cls("font-mono text-[12px] font-semibold", sideTone[r.side])}>{r.side}</span></Td>
        <Td>
          <div className="text-[13px]">{r.instruction}</div>
          <div className="text-[12px] text-dim">{r.rationale}</div>
        </Td>
        <Td><Delta v={r.deltaEUR} /></Td>
        <Td><Badge tone={r.status === "settled" ? "teal" : "amber"}>{r.status}</Badge></Td>
      </tr>
      {open && (
        <tr>
          <td colSpan={9} className="p-0">
            <DetailPanel r={r} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function SignalLedger() {
  const session = useSyncExternalStore(paperStore.subscribe, paperStore.snapshot, paperStore.serverSnapshot);

  const sessionRows: RowVM[] = session.map((s) => ({
    id: s.id, locked: s.locked, gate: s.gate, market: s.market, zone: s.zone,
    side: deriveSide(s.instruction), instruction: s.instruction, rationale: s.rationale,
    hash: s.hash, hashFull: s.hash, deltaEUR: s.deltaEUR, status: s.status, sim: true,
  }));
  const seedRows: RowVM[] = PAPER_SIGNALS.map((s) => ({
    id: s.id, locked: s.locked, gateClose: s.gateClose, gate: s.gate, market: s.market, zone: s.zone,
    side: s.side, instruction: s.instruction, rationale: s.rationale, hash: s.hash, hashFull: s.hashFull,
    volumeMWh: s.volumeMWh, baselineEUR: s.baselineEUR, clearedEUR: s.clearedEUR,
    deltaEUR: s.deltaEUR, status: s.status, sim: false,
  }));

  return (
    <Card
      className="mb-4"
      title="Signal ledger"
      sub="Timestamped agent recommendations, hash-locked before gate closure — the audit trail that rules out after-the-fact fitting. Click any row for the full detail."
      pad={false}
    >
      <TableWrap>
        <thead>
          <tr><Th /><Th>Signal</Th><Th>Locked (pre-gate)</Th><Th>Gate</Th><Th>Zone</Th><Th>Side</Th><Th>Instruction · rationale</Th><Th>vs baseline</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {sessionRows.length > 0 && (
            <tr>
              <Td className="!py-1.5" />
              <td colSpan={8} className="px-4 py-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
                this session — Gate Room runs
              </td>
            </tr>
          )}
          {sessionRows.map((r) => <LedgerRow key={r.id} r={r} />)}
          {seedRows.map((r) => <LedgerRow key={r.id} r={r} />)}
        </tbody>
      </TableWrap>
    </Card>
  );
}
