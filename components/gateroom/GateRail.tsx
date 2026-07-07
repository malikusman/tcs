"use client";

import { Card, Badge } from "@/components/ui/kit";
import { cls } from "@/lib/util";
import type { Gate } from "@/lib/gates";
import type { SessionSignal } from "@/lib/paper/store";

interface Props {
  mounted: boolean;
  calendar: Gate[];
  next: Gate | null;
  countdown: string;
  running: boolean;
  onSimulate: () => void;
  history: SessionSignal[];
}

export default function GateRail({ mounted, calendar, next, countdown, running, onSimulate, history }: Props) {
  return (
    <div className="space-y-4">
      <Card title="Next gate" sub="TIDE calendar · Europe/Rome" pad={false}>
        <div className="px-5 py-4 border-b border-linesoft">
          <div className="font-mono text-[28px] font-semibold tabular-nums text-solar leading-none">
            {mounted ? countdown : "--:--:--"}
          </div>
          <div className="text-[12.5px] text-muted mt-2">
            {mounted && next ? next.label : "…"}
          </div>
        </div>
        <div className="divide-y divide-linesoft">
          {mounted && next ? (
            calendar.map((g) => {
              const active = g.id === next.id;
              const past = g.at.getTime() < next.at.getTime() && !active;
              return (
                <div key={g.id} className={cls("px-5 py-2.5 flex items-center justify-between font-mono text-[12px]", active && "bg-solar/[0.06]")}>
                  <span className={cls(active ? "text-solar font-semibold" : past ? "text-dim line-through" : "text-muted")}>
                    {g.name === "CLEARING" ? "Clearing" : g.name}
                  </span>
                  <span className={cls("tabular-nums", active ? "text-solar" : "text-dim")}>
                    {String(g.at.getHours()).padStart(2, "0")}:{String(g.at.getMinutes()).padStart(2, "0")}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-3 font-mono text-[12px] text-dim">loading calendar…</div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-linesoft">
          <button
            type="button"
            onClick={onSimulate}
            disabled={!mounted || running}
            className="w-full rounded-lg bg-solar text-[#0A1220] text-[13px] font-semibold px-4 py-2.5 hover:brightness-110 transition disabled:opacity-50 disabled:hover:brightness-100"
          >
            {running ? "Agents deliberating…" : "Simulate next gate"}
          </button>
          <p className="text-[11px] text-dim mt-2 leading-relaxed">
            Runs the full agent cycle on simulated data — forecast, bid drafting, risk checks, hash-lock, clearing.
          </p>
        </div>
      </Card>

      <Card title="Runs this session" sub="Locked and cleared by the Gate Room" pad={false}>
        {history.length === 0 ? (
          <div className="px-5 py-4 text-[12px] font-mono text-dim">no runs yet</div>
        ) : (
          <div className="divide-y divide-linesoft">
            {history.map((s) => (
              <div key={s.id} className="px-5 py-2.5 flex items-center justify-between gap-2 font-mono text-[12px]">
                <div className="min-w-0">
                  <div className="text-fg truncate">{s.gate}</div>
                  <div className="text-dim text-[11px]">{s.id} · {s.locked}</div>
                </div>
                {s.status === "locked" ? (
                  <Badge tone="amber">locked</Badge>
                ) : (
                  <Badge tone={(s.deltaEUR ?? 0) >= 0 ? "green" : "red"}>
                    {(s.deltaEUR ?? 0) >= 0 ? "+" : "−"}€{Math.abs(s.deltaEUR ?? 0).toLocaleString()}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
