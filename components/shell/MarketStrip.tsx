"use client";

import { useEffect, useState } from "react";
import { Clock3, Zap, Gauge } from "lucide-react";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function cet(now: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

// MGP gate closure: 12:00 CET, day-ahead
function gateCountdown(now: Date) {
  const rome = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const gate = new Date(rome);
  gate.setHours(12, 0, 0, 0);
  if (rome >= gate) gate.setDate(gate.getDate() + 1);
  const ms = gate.getTime() - rome.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// tiny deterministic wiggle for tickers
function wiggle(now: Date, base: number, amp: number, period: number) {
  const t = now.getTime() / 1000;
  return base + Math.sin(t / period) * amp + Math.sin(t / (period * 0.37)) * amp * 0.4;
}

export default function MarketStrip() {
  const now = useNow();

  return (
    <header className="sticky top-[52px] md:top-0 z-40 border-b border-linesoft bg-[#0B1424]/90 backdrop-blur px-4 sm:px-5 lg:px-8">
      <div className="h-[52px] flex items-center gap-6 overflow-x-auto scrollthin font-mono text-[12px]">
        <div className="flex items-center gap-2 shrink-0">
          <Clock3 className="h-3.5 w-3.5 text-dim" />
          <span className="text-muted">CET</span>
          <span className="text-fg tabular-nums">{now ? cet(now) : "--:--:--"}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-solar tick" />
          <span className="text-muted">MGP GATE</span>
          <span className="text-solar tabular-nums font-semibold">{now ? gateCountdown(now) : "--:--:--"}</span>
        </div>

        <div className="h-5 w-px bg-line shrink-0" />

        <Tick label="PUN" value={now ? wiggle(now, 92.41, 0.35, 7) : 92.41} unit="€/MWh" delta={+1.8} />
        <Tick label="SUD" value={now ? wiggle(now, 88.12, 0.4, 9) : 88.12} unit="€/MWh" delta={-0.6} />
        <Tick label="SICI" value={now ? wiggle(now, 99.7, 0.5, 8) : 99.7} unit="€/MWh" delta={+3.2} />

        <div className="h-5 w-px bg-line shrink-0" />

        <div className="flex items-center gap-2 shrink-0">
          <Zap className="h-3.5 w-3.5 text-wind" />
          <span className="text-muted">PORTFOLIO</span>
          <span className="text-fg tabular-nums">{now ? wiggle(now, 414.9, 2.2, 6).toFixed(1) : "414.9"} MW</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Gauge className="h-3.5 w-3.5 text-battery" />
          <span className="text-muted">IMBALANCE D</span>
          <span className="text-up tabular-nums">−0.7%</span>
        </div>

        <div className="ml-auto shrink-0 hidden lg:flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-raised border border-line text-muted">Automation L3 · supervised</span>
          <span className="px-2 py-0.5 rounded bg-raised border border-line text-up">All feeds live</span>
        </div>
      </div>
    </header>
  );
}

function Tick({ label, value, unit, delta }: { label: string; value: number; unit: string; delta: number }) {
  const upv = delta >= 0;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-muted">{label}</span>
      <span className="text-fg tabular-nums">{value.toFixed(2)}</span>
      <span className="text-dim">{unit}</span>
      <span className={upv ? "text-up" : "text-down"}>{upv ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</span>
    </div>
  );
}
