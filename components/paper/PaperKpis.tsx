"use client";

// /paper header KPIs: static base numbers (same paperPnl() series the chart uses)
// plus live deltas from session-created Gate Room signals. SSR renders the base
// values; session additions appear after mount via the store subscription.

import { useSyncExternalStore } from "react";
import { Stat } from "@/components/ui/kit";
import { paperPnl } from "@/lib/data/series";
import { paperStore } from "@/lib/paper/store";

export default function PaperKpis() {
  const session = useSyncExternalStore(paperStore.subscribe, paperStore.snapshot, paperStore.serverSnapshot);

  const pnl = paperPnl();
  const last = pnl[pnl.length - 1];
  const settledEUR = session.reduce((a, s) => a + (s.status === "settled" ? (s.deltaEUR ?? 0) : 0), 0);
  const uplift = last.ai + settledEUR / 1000;
  const vsDesk = last.ai - last.desk + settledEUR / 1000;
  const lockedCount = 1240 + session.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Stat
        label="Paper uplift vs baseline"
        value={`+${settledEUR !== 0 ? uplift.toFixed(1) : Math.round(uplift)}`}
        unit="k€"
        tone="up"
        foot={settledEUR !== 0 ? `incl. session ${settledEUR >= 0 ? "+" : "−"}€${Math.abs(settledEUR).toLocaleString()}` : "18 wks cumulative · since 02 Mar"}
      />
      <Stat
        label="Paper book vs human desk"
        value={`+${settledEUR !== 0 ? vsDesk.toFixed(1) : Math.round(vsDesk)}`}
        unit="k€"
        tone="solar"
        foot="the measured value of automation"
      />
      <Stat label="Paper imbalance ratio" value="1.4" unit="%" tone="up" delta="threshold < 2.0%" />
      <Stat
        label="Signals locked pre-gate"
        value="100"
        unit="%"
        foot={`${lockedCount.toLocaleString()} of ${lockedCount.toLocaleString()} · sha-256 ledger`}
      />
    </div>
  );
}
