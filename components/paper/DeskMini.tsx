"use client";

import Link from "next/link";
import { Card, Badge } from "@/components/ui/kit";
import { cls } from "@/lib/util";
import { useDeskFeed } from "./useDeskFeed";

export default function DeskMini() {
  const { fills, ready } = useDeskFeed(3);

  return (
    <Card
      title="Paper desk · live"
      sub="Agents trading paper electricity"
      pad={false}
      right={<Link href="/paper" className="text-[12px] font-mono text-solar hover:underline">tape →</Link>}
    >
      <div className="divide-y divide-linesoft">
        {ready ? (
          fills.map((f) => (
            <div key={f.id} className="tape-enter px-5 py-2 flex items-center gap-2.5 font-mono text-[12px] whitespace-nowrap overflow-hidden">
              <span className="text-dim tabular-nums">{f.time}</span>
              <span className={cls("font-semibold", f.side === "BUY" ? "text-up" : "text-down")}>{f.side}</span>
              <span className="tabular-nums">{f.mwh} MWh</span>
              <span className="text-muted">{f.zone}</span>
              <span className="tabular-nums ml-auto">€{f.price.toFixed(2)}</span>
              <Badge tone="violet">PAPER</Badge>
            </div>
          ))
        ) : (
          <div className="px-5 py-4 font-mono text-[12px] text-dim">connecting…</div>
        )}
      </div>
      <div className="px-5 py-2 border-t border-linesoft text-[10.5px] font-mono text-dim">
        simulated prices · paper only
      </div>
    </Card>
  );
}
