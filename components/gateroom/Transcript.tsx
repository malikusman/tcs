"use client";

import { Card, Badge } from "@/components/ui/kit";
import { cls } from "@/lib/util";
import type { RunEvent, DraftBid } from "@/lib/agents/scripts";

const AGENT_DOT: Record<string, string> = {
  "Forecast Agent": "#3FC8D4",
  "Trading Agent": "#F5A623",
  "Risk Agent": "#9B8CFF",
};

export interface LockInfo { hashShort: string; time: string; before: string; signalId: string }
export interface SettleInfo { deltaEUR: number; note: string }

function BidRow({ bid, tone = "line" }: { bid: DraftBid; tone?: "line" | "revised" }) {
  const buy = bid.volumeMWh < 0;
  return (
    <div className={cls("rounded-lg border px-3.5 py-2.5", tone === "revised" ? "border-solar/40 bg-solar/[0.05]" : "border-line bg-raised/40")}>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
        <span className="text-dim">{bid.bidId}</span>
        <Badge tone={bid.market === "XBID" ? "teal" : "amber"}>{bid.market}</Badge>
        <span className="text-fg">{bid.zone}</span>
        <span className="text-dim">{bid.mtu}</span>
        <span className={cls("font-semibold tabular-nums", buy ? "text-down" : "text-up")}>
          {buy ? "BUY" : "SELL"} {Math.abs(bid.volumeMWh).toLocaleString()} MWh
        </span>
        <span className="tabular-nums text-muted">
          {bid.limitEUR === null ? "€0.00 (price-taker)" : `limit €${bid.limitEUR.toFixed(2)}`}
        </span>
      </div>
      <div className="text-[12px] text-muted mt-1 leading-relaxed">{bid.rationale}</div>
    </div>
  );
}

function EventRow({ e }: { e: RunEvent }) {
  switch (e.kind) {
    case "agent":
      return (
        <div className="flex items-center gap-2.5 pt-4 first:pt-0">
          <span className="h-2 w-2 rounded-full" style={{ background: AGENT_DOT[e.agent] }} />
          <span className="font-display text-[13.5px] font-semibold tracking-wide">{e.agent}</span>
          <span className="text-[12px] text-dim">{e.note}</span>
        </div>
      );
    case "tool":
      return (
        <div className="font-mono text-[12px] pl-4 leading-relaxed">
          <span className="text-dim">▸ </span>
          <span className="text-fg">{e.name}</span>
          <span className="text-dim">({e.args})</span>
          <span className="text-muted"> → {e.result}</span>
        </div>
      );
    case "note":
      return <div className="text-[12.5px] text-muted pl-4 leading-relaxed max-w-2xl">{e.text}</div>;
    case "bid":
      return <div className="pl-4"><BidRow bid={e.bid} /></div>;
    case "reject":
      return (
        <div className="ml-4 border-l-2 border-down bg-down/5 rounded-r-lg px-3.5 py-2.5">
          <Badge tone="red">REJECTED</Badge>
          <div className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{e.reason}</div>
        </div>
      );
    case "revise":
      return (
        <div className="ml-4 border-l-2 border-solar rounded-r-lg pl-3.5 py-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge tone="amber">REVISED</Badge>
            <span className="font-mono text-[12px] text-muted">{e.change}</span>
          </div>
          <BidRow bid={e.bid} tone="revised" />
        </div>
      );
    case "approve":
      return (
        <div className="pl-4 font-mono text-[12px] text-up">✓ {e.text}</div>
      );
  }
}

export default function Transcript({
  events, visible, lock, settled, running, gateLabel, onFastForward,
}: {
  events: RunEvent[] | null;
  visible: number;
  lock: LockInfo | null;
  settled: SettleInfo | null;
  running: boolean;
  gateLabel: string | null;
  onFastForward: () => void;
}) {
  return (
    <Card
      title="Deliberation transcript"
      sub={gateLabel ? `Run for ${gateLabel}` : "Forecast → Trading → Risk → hash-lock → clearing"}
      pad={false}
      right={running ? (
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-solar tick" /> RUNNING
        </span>
      ) : undefined}
    >
      <div className="px-5 py-4 space-y-2.5 min-h-[280px]">
        {!events ? (
          <div className="text-[13px] text-dim py-10 text-center font-mono">
            No run yet — press “Simulate next gate” to watch the agents deliberate, lock and clear a bid set.
          </div>
        ) : (
          <>
            {events.slice(0, visible).map((e, i) => (
              <div key={i} className="tape-enter"><EventRow e={e} /></div>
            ))}

            {lock && (
              <div
                className="tape-enter mt-3 rounded-lg border border-solar/50 bg-solar/[0.07] px-4 py-3"
                title="The sha-256 is computed in your browser over the canonical bid-set JSON — the hash is genuine even though the underlying data is simulated."
              >
                <div className="font-mono text-[12.5px]">
                  <span className="text-solar font-semibold">SIGNAL LOCKED</span>{" "}
                  <span className="text-fg">sha256 {lock.hashShort}</span>{" "}
                  <span className="text-muted">at {lock.time}</span>{" "}
                  <span className="text-dim">— {lock.before} before gate</span>
                </div>
                <div className="text-[12px] text-muted mt-1">
                  Appended to the <a href="/paper" className="text-solar hover:underline">paper ledger</a> as {lock.signalId}
                  {settled === null && " · clearing in under a minute"}
                </div>
                {settled === null && (
                  <button
                    type="button"
                    onClick={onFastForward}
                    className="mt-2 rounded-md border border-line bg-raised px-3 py-1.5 font-mono text-[11.5px] text-muted hover:text-fg transition"
                  >
                    fast-forward clearing →
                  </button>
                )}
              </div>
            )}

            {settled && lock && (
              <div className={cls(
                "tape-enter rounded-lg border px-4 py-3 font-mono text-[12.5px]",
                settled.deltaEUR >= 0 ? "border-up/40 bg-up/[0.06]" : "border-down/40 bg-down/[0.06]",
              )}>
                <span className={settled.deltaEUR >= 0 ? "text-up font-semibold" : "text-down font-semibold"}>
                  CLEARED {settled.deltaEUR >= 0 ? "+" : "−"}€{Math.abs(settled.deltaEUR).toLocaleString()} vs baseline
                </span>
                <span className="text-muted"> · {settled.note} · booked to {lock.signalId}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-5 py-2.5 border-t border-linesoft text-[11px] font-mono text-dim leading-relaxed">
        Simulated deliberation on demo data — agent reasoning, prices and weather are illustrative.
        In the pilot this cycle runs on live ENTSO-E/Open-Meteo data at the real gates with Claude-powered agents.
      </div>
    </Card>
  );
}
