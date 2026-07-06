import { PageHeader, Card, Badge, Stat, Bar, Th, Td, TableWrap } from "@/components/ui/kit";
import { PaperPnlChart } from "@/components/charts/charts";
import { PAPER_SIGNALS, PAPER_ORDERS, GRADUATION } from "@/lib/data/platform";
import { paperPnl } from "@/lib/data/series";
import { cls } from "@/lib/util";

const orderTone = { filled: "green", working: "amber", expired: "gray" } as const;
const stepTone = { unlocked: "green", "in-progress": "amber", locked: "gray" } as const;

function DeltaEUR({ v }: { v: number | null }) {
  if (v === null) return <span className="font-mono text-[12px] text-dim">awaiting clearing</span>;
  return (
    <span className={cls("font-mono tabular-nums", v >= 0 ? "text-up" : "text-down")}>
      {v >= 0 ? "+" : "−"}€{Math.abs(v).toLocaleString()}
    </span>
  );
}

export default function PaperTradingPage() {
  const pnl = paperPnl();
  const last = pnl[pnl.length - 1];
  const vsDesk = last.ai - last.desk;

  return (
    <>
      <PageHeader
        eyebrow="Trade · Paper Trading"
        title="Shadow mode & strategy graduation"
        desc="Every agent recommendation is hash-locked before the market gate, then cleared against actual published GME and Terna results — forward-running, zero financial exposure, no hindsight bias. Sustained out-performance of the benchmark is what unlocks each automation level."
        right={<Badge tone="violet">PAPER · zero financial exposure</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Paper uplift vs baseline" value={`+${last.ai}`} unit="k€" tone="up" foot="18 wks cumulative · since 02 Mar" />
        <Stat label="Paper book vs human desk" value={`+${vsDesk}`} unit="k€" tone="solar" foot="the measured value of automation" />
        <Stat label="Paper imbalance ratio" value="1.4" unit="%" tone="up" delta="threshold < 2.0%" />
        <Stat label="Signals locked pre-gate" value="100" unit="%" foot="1,240 of 1,240 · sha-256 ledger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card
          className="lg:col-span-2"
          title="Cumulative paper P&L vs benchmark"
          sub="Paper strategy and human desk, both measured against the naive baseline: sell P50 at day-ahead, no intraday correction, no BESS shifting"
        >
          <PaperPnlChart data={pnl} />
          <p className="text-[12px] text-dim mt-3 leading-relaxed">
            Week of 13 Apr: Genoa-low storm bust — the one week the baseline won. Kept on the chart deliberately;
            the graduation criteria require sustained out-performance, not a perfect record.
          </p>
        </Card>

        <Card title="Graduation ladder" sub="Explicit thresholds unlock each automation level" pad={false}>
          <div className="divide-y divide-linesoft">
            {GRADUATION.map((g) => (
              <div key={g.to} className={cls("px-5 py-4", g.status === "in-progress" && "bg-solar/[0.06]")}>
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-mono text-[13px] font-semibold">{g.from} → {g.to}</span>
                  <Badge tone={stepTone[g.status]}>{g.status}</Badge>
                </div>
                <div className="text-[13px] font-medium">{g.name}</div>
                <div className="text-[11px] text-dim font-mono mt-0.5 mb-3">{g.when}</div>
                <div className="space-y-2.5">
                  {g.criteria.map((c) => (
                    <div key={c.name}>
                      <div className="flex items-baseline justify-between gap-2 text-[11.5px] mb-1">
                        <span className="text-muted">{c.name}</span>
                        <span className="font-mono text-dim shrink-0">{c.target}</span>
                      </div>
                      <Bar pct={c.pct} color={c.pct >= 100 ? "#45D483" : "#F5A623"} />
                      <div className="font-mono text-[11px] text-muted mt-1">{c.actual}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        className="mb-4"
        title="Signal ledger"
        sub="Timestamped agent recommendations, hash-locked before gate closure — the audit trail that rules out after-the-fact fitting"
        pad={false}
      >
        <TableWrap>
          <thead>
            <tr><Th>Signal</Th><Th>Locked (pre-gate)</Th><Th>Gate</Th><Th>Zone</Th><Th>Instruction · rationale</Th><Th>vs baseline</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {PAPER_SIGNALS.map((s) => (
              <tr key={s.id}>
                <Td><span className="font-mono text-[12px] text-muted">{s.id}</span></Td>
                <Td>
                  <div className="font-mono text-[12px] tabular-nums">{s.locked}</div>
                  <div className="font-mono text-[10.5px] text-dim">sha256 {s.hash}</div>
                </Td>
                <Td><span className="font-mono text-[12px] text-muted">{s.gate}</span></Td>
                <Td><span className="font-mono text-[12px]">{s.zone}</span></Td>
                <Td>
                  <div className="text-[13px]">{s.instruction}</div>
                  <div className="text-[12px] text-dim">{s.rationale}</div>
                </Td>
                <Td><DeltaEUR v={s.deltaEUR} /></Td>
                <Td><Badge tone={s.status === "settled" ? "teal" : "amber"}>{s.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Card
        className="mb-4"
        title="Paper order book"
        sub="Same lifecycle as the live Trading Engine — build → lock → clear — but flagged PAPER and settled against actual GME results"
        pad={false}
        right={<Badge tone="violet">PAPER</Badge>}
      >
        <TableWrap>
          <thead>
            <tr><Th>ID</Th><Th>Market</Th><Th>Zone</Th><Th>Hours</Th><Th>Volume</Th><Th>Limit</Th><Th>Cleared (actual GME)</Th><Th>vs baseline</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {PAPER_ORDERS.map((o) => (
              <tr key={o.id}>
                <Td><span className="font-mono text-[12px] text-muted">{o.id}</span></Td>
                <Td><span className="font-mono text-[12px]">{o.market}</span></Td>
                <Td><span className="font-mono text-[12px]">{o.zone}</span></Td>
                <Td><span className="font-mono text-[12px] text-muted">{o.hours}</span></Td>
                <Td><span className={cls("font-mono tabular-nums", o.volumeMWh < 0 ? "text-down" : "text-fg")}>{o.volumeMWh.toLocaleString()} MWh</span></Td>
                <Td><span className="font-mono tabular-nums">{o.limitEUR === 0 ? "€0.00 (price-taker)" : `€${o.limitEUR.toFixed(2)}`}</span></Td>
                <Td><span className="font-mono tabular-nums">{o.clearedEUR === null ? "—" : `€${o.clearedEUR.toFixed(2)}`}</span></Td>
                <Td><DeltaEUR v={o.deltaEUR} /></Td>
                <Td><Badge tone={orderTone[o.status]}>{o.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Card title="Methodology" sub="Why a risk committee can trust these numbers">
        <div className="grid md:grid-cols-3 gap-5 text-[13px] leading-relaxed text-muted">
          <div>
            <div className="eyebrow mb-1.5">No hindsight bias</div>
            Signals are sha-256 hashed and written to the immutable audit log before the relevant gate (MGP 12:00 D-1,
            each MI session close). Clearing uses only published GME prices and Terna imbalance settlements — the paper
            book cannot peek at outcomes. This differs from digital-twin backtesting, which replays history; shadow mode runs forward.
          </div>
          <div>
            <div className="eyebrow mb-1.5">Honest benchmarking</div>
            Two benchmarks, always shown together: the naive baseline (sell P50 at day-ahead, no intraday, no BESS)
            and the human desk&apos;s actual decisions. The delta against each is the product&apos;s value proposition, measured —
            including the weeks the AI lost.
          </div>
          <div>
            <div className="eyebrow mb-1.5">Graduation, not a switch</div>
            Automation levels unlock only on sustained, pre-agreed thresholds signed off by the risk committee —
            L2 on 27 Apr, L3 today at 08:02 (4-eyes, recorded in the audit log). The shadow book keeps running at L3:
            every strategy upgrade, including the RL intraday challenger, must beat the live champion here first.
          </div>
        </div>
      </Card>
    </>
  );
}
