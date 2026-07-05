import { PageHeader, Card, Badge, Stat } from "@/components/ui/kit";
import { ForecastFan } from "@/components/charts/charts";
import { ASSETS, assetById, TECH_COLOR } from "@/lib/data/assets";
import { productionDay } from "@/lib/data/series";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return ASSETS.map((a) => ({ id: a.id }));
}

export default function AssetDetail({ params }: { params: { id: string } }) {
  const a = assetById(params.id);
  if (!a) return notFound();
  const { data, nowHour } = productionDay(a.id.length * 13 + a.capacityMW);

  const twin = [
    { k: "Grid connection", v: `${a.zone} · 150 kV node` },
    { k: "Transformer", v: "2 × 40 MVA ONAF" },
    { k: "Inverters / turbines", v: a.tech === "Wind" ? "12 × Vestas V150" : a.tech === "BESS" ? "10 × PCS 4 MW" : "168 × string 500 kW" },
    { k: "Curtailment limit", v: `${(a.capacityMW * 0.92).toFixed(0)} MW export cap` },
    { k: "Protocol", v: a.scada },
    { k: "Telemetry cadence", v: "4 s live · 1 min archive" },
  ];

  return (
    <>
      <Link href="/assets" className="inline-flex items-center gap-1.5 text-[12px] font-mono text-muted hover:text-solar mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Asset Registry
      </Link>
      <PageHeader
        eyebrow={`${a.id} · ${a.region} · ${a.zone}`}
        title={a.name}
        desc={`Commissioned ${a.cod} · ${a.regime}${a.ppaPrice ? ` at €${a.ppaPrice}/MWh` : ""} · digital twin synchronized 14:02 CET.`}
        right={<Badge tone={a.status === "online" ? "green" : a.status === "curtailed" ? "amber" : "violet"}>{a.status}</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat label="Live output" value={a.currentMW.toFixed(1)} unit="MW" foot={`of ${a.capacityMW.toFixed(1)} MW`} />
        <Stat label="Energy today" value={a.todayMWh.toLocaleString()} unit="MWh" />
        <Stat label="Availability" value={a.availability.toFixed(1)} unit="%" tone="up" delta="30-day" />
        <Stat label="Forecast error" value={a.forecastErrorPct.toFixed(1)} unit="%" foot="nMAE · D-1" tone="solar" />
        {a.socPct != null ? (
          <Stat label="State of charge" value={String(a.socPct)} unit="%" tone="solar" foot="BESS" />
        ) : (
          <Stat label="Revenue today" value={`€${Math.round(a.todayMWh * 0.089)}k`} foot="est. captured" />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Asset forecast vs actual" sub={`P50 with confidence band · model ${a.tech === "Wind" ? "wind-gbm-v12" : "solar-tft-v8"}`}
          right={<span className="font-mono text-[11px]" style={{ color: TECH_COLOR[a.tech] }}>{a.tech}</span>}>
          <ForecastFan data={data} nowHour={nowHour} />
        </Card>

        <Card title="Digital twin" sub="Physical + contractual configuration" pad={false}>
          <div className="divide-y divide-linesoft">
            {twin.map((r) => (
              <div key={r.k} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-[12px] text-muted">{r.k}</span>
                <span className="font-mono text-[12px] text-right">{r.v}</span>
              </div>
            ))}
            <div className="px-5 py-4">
              <div className="eyebrow mb-2">What-if simulation</div>
              <p className="text-[12px] text-muted leading-relaxed">
                Run cloud-front, outage and price-spike scenarios against this twin before committing dispatch changes.
              </p>
              <button className="mt-3 w-full py-2 rounded-lg border border-line text-[12.5px] font-mono text-solar hover:bg-raised transition">
                Open in simulator →
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
