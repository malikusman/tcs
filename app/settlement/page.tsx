import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { SETTLEMENT_ROWS } from "@/lib/data/platform";
import { fmtEUR } from "@/lib/util";

export default function SettlementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Risk & Finance · Settlement"
        title="From market results to cash"
        desc="Automated reconciliation of schedules, 2G meter data, GME invoices, imbalance charges, PPA deliveries and GSE incentive payments — with a Settlement Agent raising tickets on any mismatch."
        right={<Badge tone="amber">June: 1 exception open · FIN-2211</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="June revenue (prelim.)" value="€4.38" unit="M" foot="market + PPA + incentive" />
        <Stat label="Imbalance cost June" value="−€38.4" unit="k" tone="up" delta="0.88% of revenue" foot="target ≤ 2%" />
        <Stat label="Auto-matched lines" value="99.2" unit="%" tone="up" foot="1,412 of 1,423" />
        <Stat label="Days to close" value="4.5" foot="was 12 before automation" tone="solar" delta="▼ 62%" />
      </div>

      <Card title="Settlement periods" sub="Scheduled vs metered energy and revenue composition per month" pad={false}>
        <TableWrap>
          <thead>
            <tr>
              <Th>Period</Th><Th>Scheduled MWh</Th><Th>Metered MWh</Th><Th>Δ</Th>
              <Th>Market</Th><Th>PPA</Th><Th>Incentive</Th><Th>Imbalance</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {SETTLEMENT_ROWS.map((r) => {
              const d = r.actual - r.scheduled;
              return (
                <tr key={r.period}>
                  <Td><span className="font-medium">{r.period}</span></Td>
                  <Td><span className="font-mono tabular-nums">{r.scheduled.toLocaleString()}</span></Td>
                  <Td><span className="font-mono tabular-nums">{r.actual.toLocaleString()}</span></Td>
                  <Td><span className={`font-mono tabular-nums ${d >= 0 ? "text-up" : "text-down"}`}>{d > 0 ? "+" : ""}{d.toLocaleString()}</span></Td>
                  <Td><span className="font-mono tabular-nums">{fmtEUR(r.marketEUR)}</span></Td>
                  <Td><span className="font-mono tabular-nums">{fmtEUR(r.ppaEUR)}</span></Td>
                  <Td><span className="font-mono tabular-nums">{fmtEUR(r.incentiveEUR)}</span></Td>
                  <Td><span className="font-mono tabular-nums text-down">{fmtEUR(r.imbalanceEUR)}</span></Td>
                  <Td><Badge tone={r.status === "closed" ? "green" : "amber"}>{r.status}</Badge></Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {[
          { t: "GME market results", d: "MGP / MI-A / XBID accepted quantities and clearing prices ingested nightly via SFTP; matched to bid IDs automatically." },
          { t: "Terna imbalance charges", d: "Imbalance is settled against Terna on 15-minute settlement periods: zonal imbalance prices applied to schedule-vs-meter deltas per quarter-hour; sign convention validated by rule engine." },
          { t: "Exception workflow", d: "Mismatches route to finance with full lineage: bid → clearing → dispatch → meter → invoice line." },
        ].map((c) => (
          <Card key={c.t} title={c.t}><p className="text-[12.5px] text-muted leading-relaxed">{c.d}</p></Card>
        ))}
      </div>
    </>
  );
}
