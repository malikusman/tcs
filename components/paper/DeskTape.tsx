"use client";

import { Card, Badge } from "@/components/ui/kit";
import { cls } from "@/lib/util";
import { useDeskFeed, PaperFill } from "./useDeskFeed";

function Row({ f }: { f: PaperFill }) {
  return (
    <div className="tape-enter flex items-center gap-3 px-5 py-[7px] font-mono text-[12px] whitespace-nowrap">
      <span className="text-dim tabular-nums w-[62px] shrink-0">{f.time}</span>
      <span className="text-muted w-[104px] shrink-0 truncate">{f.agent}</span>
      <span className={cls("w-[38px] shrink-0 font-semibold", f.side === "BUY" ? "text-up" : "text-down")}>{f.side}</span>
      <span className="tabular-nums w-[70px] shrink-0 text-right">{f.mwh} MWh</span>
      <span className="text-muted w-[132px] shrink-0">{f.zone} · {f.mtu}</span>
      <span className="tabular-nums w-[64px] shrink-0 text-right">€{f.price.toFixed(2)}</span>
      <Badge tone={f.market === "XBID" ? "teal" : "amber"}>{f.market}</Badge>
      <span className="flex-1" />
      <Badge tone="violet">PAPER</Badge>
    </div>
  );
}

export default function DeskTape() {
  const { fills, stats, ready } = useDeskFeed(12);

  return (
    <Card
      className="h-full"
      title="Live paper desk"
      sub="Agents buying and selling paper electricity in real time — zero financial exposure"
      pad={false}
      right={
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-up tick" /> LIVE
        </span>
      }
    >
      <div className="px-5 py-3 border-b border-linesoft flex flex-wrap gap-x-6 gap-y-1 font-mono text-[12px]">
        <span className="text-dim">
          SESSION P&L{" "}
          <span className={cls("tabular-nums font-semibold", stats.pnlEUR >= 0 ? "text-up" : "text-down")}>
            {ready ? `${stats.pnlEUR >= 0 ? "+" : "−"}€${Math.abs(stats.pnlEUR).toLocaleString()}` : "—"}
          </span>
        </span>
        <span className="text-dim">
          BOUGHT <span className="text-fg tabular-nums">{ready ? `${stats.boughtMWh} MWh` : "—"}</span>
        </span>
        <span className="text-dim">
          SOLD <span className="text-fg tabular-nums">{ready ? `${stats.soldMWh} MWh` : "—"}</span>
        </span>
        <span className="text-dim">
          FILLS{" "}
          <span className="text-up tabular-nums">{ready ? `${stats.buyCount} BUY` : "—"}</span>
          <span className="text-dim"> · </span>
          <span className="text-down tabular-nums">{ready ? `${stats.sellCount} SELL` : "—"}</span>
        </span>
      </div>

      <div className="overflow-x-auto scrollthin">
        <div className="min-w-[620px] divide-y divide-linesoft">
          {ready ? (
            fills.map((f) => <Row key={f.id} f={f} />)
          ) : (
            <div className="px-5 py-6 font-mono text-[12px] text-dim">connecting to paper tape…</div>
          )}
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-linesoft text-[11px] font-mono text-dim leading-relaxed">
        Simulated prices (demo curve — live feed not connected) · intraday microstructure simulated ·
        all orders PAPER — nothing is submitted to any market.
      </div>
    </Card>
  );
}
