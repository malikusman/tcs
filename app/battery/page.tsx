import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { BessChart } from "@/components/charts/charts";
import { bessSchedule } from "@/lib/data/series";

export default function BatteryPage() {
  const sched = bessSchedule();

  const stack = [
    { s: "Energy arbitrage (MGP/MI)", eur: "€3,940", share: 46 },
    { s: "MSD · reserve capacity", eur: "€2,610", share: 30 },
    { s: "Imbalance absorption (portfolio)", eur: "€1,380", share: 16 },
    { s: "Frequency regulation (aFRR pilot)", eur: "€690", share: 8 },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Optimize · BESS Dispatch"
        title="Battery value stacking"
        desc="Deterministic MILP — not ML — decides when 65 MW of storage charges, discharges or holds reserve. The digital twin prices every plan against degradation before commit."
        right={<Badge tone="violet">Gela BESS I 62% · Cerignola 38% SOC</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Revenue today" value="€8.6k" tone="up" delta="▲ 22% vs static plan" foot="all value streams" />
        <Stat label="Round-trip efficiency" value="88.4" unit="%" foot="fleet 30-day" />
        <Stat label="Equivalent cycles" value="1.1" unit="/day" foot="limit 1.4 · warranty safe" tone="up" delta="within policy" />
        <Stat label="Degradation cost priced" value="€3.1" unit="/MWh" foot="in every dispatch decision" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="24h optimized schedule · Gela BESS I" sub="Charge in the solar belly, discharge into the evening peak, hold overnight reserve">
          <BessChart data={sched} />
        </Card>

        <div className="space-y-4">
          <Card title="Value stack · today" pad={false}>
            <TableWrap>
              <thead><tr><Th>Stream</Th><Th>€</Th><Th>Share</Th></tr></thead>
              <tbody>
                {stack.map((r) => (
                  <tr key={r.s}>
                    <Td><span className="text-[12.5px]">{r.s}</span></Td>
                    <Td><span className="font-mono tabular-nums">{r.eur}</span></Td>
                    <Td><span className="font-mono text-[12px] text-muted">{r.share}%</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>

          <Card title="Optimizer constraints">
            <ul className="text-[12.5px] text-muted space-y-2 leading-relaxed">
              <li><span className="text-fg font-mono">SOC ∈ [10%, 95%]</span> — warranty envelope</li>
              <li><span className="text-fg font-mono">|P| ≤ 40 MW</span> — PCS rating</li>
              <li><span className="text-fg font-mono">η_rt = 88%</span> — priced into spreads</li>
              <li><span className="text-fg font-mono">reserve ≥ 12 MWh</span> — MSD commitment H00–H24</li>
              <li><span className="text-fg font-mono">cycles ≤ 1.4/day</span> — degradation budget</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
