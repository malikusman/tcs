import { PageHeader, Card, Badge, Th, Td, TableWrap, Stat } from "@/components/ui/kit";
import { ASSETS, TECH_COLOR, portfolioTotals } from "@/lib/data/assets";
import Link from "next/link";

const statusTone = { online: "green", curtailed: "amber", maintenance: "violet", offline: "red" } as const;
const regimeTone = { Merchant: "amber", PPA: "teal", FiT: "gray", "GSE Incentive": "gray" } as const;

export default function AssetsPage() {
  const t = portfolioTotals();
  const merchant = ASSETS.filter((a) => a.regime === "Merchant").reduce((s, a) => s + a.capacityMW, 0);
  return (
    <>
      <PageHeader
        eyebrow="Operate · Asset Registry"
        title="Single source of truth"
        desc="Technical, commercial and geographic master data for every asset. Every forecasting model, optimizer and settlement run reads from this registry."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Assets" value={String(t.count)} foot="PV · Wind · BESS · Hybrid" />
        <Stat label="Installed capacity" value={t.cap.toFixed(0)} unit="MW" />
        <Stat label="Merchant exposure" value={((merchant / t.cap) * 100).toFixed(0)} unit="%" foot={`${merchant.toFixed(0)} MW price-exposed`} tone="solar" delta="high AI value" />
        <Stat label="Bidding zones" value="6" foot="NORD → SICI / SARD" />
      </div>

      <Card title="Registry" sub="Click an asset for its digital twin, telemetry and commercial profile" pad={false}>
        <TableWrap>
          <thead>
            <tr>
              <Th>Asset</Th><Th>Tech</Th><Th>Capacity</Th><Th>Zone / Region</Th><Th>Regime</Th>
              <Th>SCADA</Th><Th>COD</Th><Th>Availability</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.id}>
                <Td>
                  <Link href={`/assets/${a.id}`} className="group">
                    <div className="font-medium group-hover:text-solar transition-colors">{a.name}</div>
                    <div className="font-mono text-[11px] text-dim">{a.id}</div>
                  </Link>
                </Td>
                <Td><span className="font-mono text-[12px]" style={{ color: TECH_COLOR[a.tech] }}>{a.tech}</span></Td>
                <Td><span className="font-mono tabular-nums">{a.capacityMW.toFixed(1)} MW</span></Td>
                <Td><span className="font-mono text-[12px]">{a.zone}</span> <span className="text-dim text-[12px]">· {a.region}</span></Td>
                <Td><Badge tone={regimeTone[a.regime]}>{a.regime}{a.ppaPrice ? ` €${a.ppaPrice}` : ""}</Badge></Td>
                <Td><span className="font-mono text-[11.5px] text-muted">{a.scada}</span></Td>
                <Td><span className="font-mono text-[12px] text-muted">{a.cod}</span></Td>
                <Td><span className="font-mono tabular-nums">{a.availability.toFixed(1)}%</span></Td>
                <Td><Badge tone={statusTone[a.status]}>{a.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
