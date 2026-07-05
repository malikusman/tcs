import { PageHeader, Card, Badge, Stat } from "@/components/ui/kit";
import { NettingBars, RevenueStack } from "@/components/charts/charts";
import { imbalanceNetting, revenueMonths } from "@/lib/data/series";

export default function PortfolioPage() {
  const netting = imbalanceNetting();
  const rev = revenueMonths();

  const constraints = [
    { k: "PPA delivery · Foggia Nord", v: "220 MWh/day firm", s: "satisfied" },
    { k: "PPA delivery · Oristano", v: "150 MWh/day firm", s: "satisfied" },
    { k: "Grid export cap · SICI cluster", v: "168 MW combined", s: "binding H12–H14" },
    { k: "Imbalance budget", v: "€12k/day portfolio", s: "38% used" },
    { k: "BESS warranty cycles", v: "≤ 1.4 eq. cycles/day", s: "1.1 planned" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Optimize · Portfolio"
        title="One portfolio, one objective function"
        desc="The optimizer treats 14 assets as a single economic entity: errors net across zones, batteries absorb solar risk, and PPAs are served before merchant upside is chased."
        right={<Badge tone="amber">MILP · 18,400 vars · solved 41 s · gap 0.2%</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Imbalance saved" value="−61" unit="%" tone="up" delta="netting effect" foot="vs per-asset bidding" />
        <Stat label="Weather diversification" value="0.43" foot="avg cross-zone error correlation" />
        <Stat label="Uplift attributed · MTD" value="€212k" tone="solar" delta="optimizer vs baseline" />
        <Stat label="Constraints active" value="2/14" foot="SICI export cap · PPA floor" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card title="Imbalance: standalone vs portfolio-netted" sub="Weekly imbalance cost by zone — the core financial case for portfolio bidding">
          <NettingBars data={netting} />
        </Card>
        <Card title="Revenue mix under optimization" sub="Merchant share grows as the platform earns trust · €M">
          <RevenueStack data={rev} />
        </Card>
      </div>

      <Card title="Constraint monitor" sub="Contractual and physical constraints the optimizer must honor before maximizing revenue" pad={false}>
        <div className="divide-y divide-linesoft">
          {constraints.map((c) => (
            <div key={c.k} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-medium">{c.k}</div>
                <div className="font-mono text-[12px] text-dim">{c.v}</div>
              </div>
              <Badge tone={c.s.includes("binding") ? "amber" : "green"}>{c.s}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
