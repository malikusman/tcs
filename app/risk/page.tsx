import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { RaRChart } from "@/components/charts/charts";
import { rarDistribution } from "@/lib/data/series";

export default function RiskPage() {
  const rar = rarDistribution();

  const matrix = [
    { risk: "Price volatility · merchant book", cat: "Market", metric: "σ 30d €14.2/MWh", level: "elevated", mit: "BESS shifting + MI hedging active" },
    { risk: "Negative prices · midday SUD/SICI", cat: "Market", metric: "P 11% H13", level: "elevated", mit: "Zero-cap offers, curtailment pre-armed" },
    { risk: "Forecast error · wind fleet", cat: "Forecast", metric: "nMAE 5.3%", level: "moderate", mit: "Intraday re-bidding at MI-1/MI-2" },
    { risk: "Single-asset outage", cat: "Operational", metric: "max 96 MW (Gela PV)", level: "moderate", mit: "Portfolio netting absorbs 61%" },
    { risk: "PPA counterparty · industrial", cat: "Financial", metric: "€8.6M annual", level: "low", mit: "Investment grade · monthly review" },
    { risk: "SAP settlement interface", cat: "Operational", metric: "38 min latency", level: "watch", mit: "Degraded — vendor ticket open" },
  ];

  const tone = { elevated: "amber", moderate: "gray", low: "green", watch: "red" } as const;

  return (
    <>
      <PageHeader
        eyebrow="Risk & Finance · Risk Management"
        title="Revenue at Risk"
        desc="Monte-Carlo over 4,000 weather × price scenarios from the digital twin. Risk limits are the hard constraints inside every optimizer run — not a report after the fact."
        right={<Badge tone="amber">Scenario set refreshed 06:00 CET</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Annual revenue P50" value="€104" unit="M" />
        <Stat label="RaR 95%" value="€84" unit="M" tone="down" delta="−€20M tail" foot="worst 5% of scenarios" />
        <Stat label="Imbalance budget used" value="38" unit="%" tone="up" foot="MTD vs €12k/day" />
        <Stat label="Hedge ratio" value="46" unit="%" foot="PPA + FiT + incentive floor" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="2026 revenue distribution" sub="Density across simulated scenarios · €M" className="lg:col-span-1">
          <RaRChart data={rar} />
        </Card>

        <Card className="lg:col-span-2" title="Risk register · live" sub="Quantified exposures with active mitigations" pad={false}>
          <TableWrap>
            <thead><tr><Th>Risk</Th><Th>Category</Th><Th>Metric</Th><Th>Level</Th><Th>Mitigation</Th></tr></thead>
            <tbody>
              {matrix.map((r) => (
                <tr key={r.risk}>
                  <Td><span className="text-[12.5px] font-medium">{r.risk}</span></Td>
                  <Td><span className="font-mono text-[11.5px] text-muted">{r.cat}</span></Td>
                  <Td><span className="font-mono text-[11.5px] tabular-nums">{r.metric}</span></Td>
                  <Td><Badge tone={tone[r.level as keyof typeof tone]}>{r.level}</Badge></Td>
                  <Td><span className="text-[12px] text-muted">{r.mit}</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}
