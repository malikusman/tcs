import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { BIDS, AUTOMATION_LEVELS } from "@/lib/data/platform";
import { cls } from "@/lib/util";

const stTone = { accepted: "green", pending: "amber", rejected: "red", draft: "gray" } as const;

export default function TradingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trade · Trading Engine"
        title="Bidding & market execution"
        desc="The optimizer turns probabilistic forecasts into zone-level bid curves for MGP, the MI-A intraday auctions, XBID continuous trading and MBR. Every automated order runs inside hard policy constraints with full audit."
        right={<Badge tone="amber">MGP D+1 gate · 6 bids awaiting approval</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Position D+1 · sold" value="4,240" unit="MWh" foot="MGP all zones" />
        <Stat label="Open MI exposure" value="−148" unit="MWh" tone="solar" delta="closing H15–H17" />
        <Stat label="Acceptance rate 30d" value="98.4" unit="%" tone="up" />
        <Stat label="Capture vs PUN 30d" value="103.1" unit="%" tone="up" delta="▲ 1.9pp with BESS shift" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2" title="Order book · today" sub="MGP / intraday / ancillary — source column shows who authored each order" pad={false}>
          <TableWrap>
            <thead>
              <tr><Th>ID</Th><Th>Market</Th><Th>Zone</Th><Th>Hours</Th><Th>Volume</Th><Th>Price</Th><Th>Source</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {BIDS.map((b) => (
                <tr key={b.id}>
                  <Td><span className="font-mono text-[12px] text-muted">{b.id}</span></Td>
                  <Td><span className="font-mono text-[12px]">{b.market}</span></Td>
                  <Td><span className="font-mono text-[12px]">{b.zone}</span></Td>
                  <Td><span className="font-mono text-[12px] text-muted">{b.hours}</span></Td>
                  <Td><span className={cls("font-mono tabular-nums", b.volumeMWh < 0 ? "text-down" : "text-fg")}>{b.volumeMWh.toLocaleString()} MWh</span></Td>
                  <Td><span className="font-mono tabular-nums">{b.priceEUR === 0 ? "€0.00 (price-taker)" : `€${b.priceEUR.toFixed(2)}`}</span></Td>
                  <Td><Badge tone={b.source === "Manual" ? "gray" : b.source === "AI · auto" ? "teal" : "amber"}>{b.source}</Badge></Td>
                  <Td><Badge tone={stTone[b.status]}>{b.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>

        <Card title="Automation ladder" sub="Current policy ceiling set by governance: L3" pad={false}>
          <div className="divide-y divide-linesoft">
            {AUTOMATION_LEVELS.map((l) => (
              <div key={l.level} className={cls("px-5 py-3.5 flex gap-3", l.active && "bg-solar/[0.06]")}>
                <span className={cls("font-mono text-[13px] font-semibold w-8", l.active ? "text-solar" : "text-dim")}>{l.level}</span>
                <div>
                  <div className={cls("text-[13px] font-medium", l.active && "text-solar")}>
                    {l.name} {l.active && <span className="font-mono text-[10px] tracking-widest ml-1">● ACTIVE</span>}
                  </div>
                  <div className="text-[12px] text-muted leading-relaxed">{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Optimizer rationale · MGP D+1 draft v3" sub="Why the Trading Agent structured tomorrow's bids this way">
        <div className="grid md:grid-cols-3 gap-5 text-[13px] leading-relaxed text-muted">
          <div>
            <div className="eyebrow mb-1.5">Volume strategy</div>
            Offer P50 in liquid hours; shade to P40 in H13–H15 SUD where negative-price probability is 11% and the
            downside of over-commitment exceeds the upside of the marginal MWh.
          </div>
          <div>
            <div className="eyebrow mb-1.5">Price strategy</div>
            Zero-price (price-taker) offers for must-run solar; Sicilian BESS holds 96 MWh for MI-A2 where the H19
            spread forecast (+€38) beats the day-ahead lock with 74% confidence.
          </div>
          <div>
            <div className="eyebrow mb-1.5">Risk constraints honored</div>
            Max zonal short 200 MWh · imbalance budget €12k/day · SOC floor 10% · warranty cycle limit 1.4/day.
            MILP solved to 0.2% gap in 41 s. Full trace in the audit log.
          </div>
        </div>
      </Card>
    </>
  );
}
