import { PageHeader, Card, Stat, Badge } from "@/components/ui/kit";
import { ForecastFan, PriceChart, RevenueStack } from "@/components/charts/charts";
import { productionDay, priceDay, revenueMonths } from "@/lib/data/series";
import { ASSETS, portfolioTotals, TECH_COLOR } from "@/lib/data/assets";
import { ALERTS, AGENT_RUNS } from "@/lib/data/platform";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { data, nowHour } = productionDay();
  const prices = priceDay();
  const rev = revenueMonths();
  const totals = portfolioTotals();
  const online = ASSETS.filter((a) => a.status === "online").length;

  return (
    <>
      <PageHeader
        eyebrow="Command Center · Saturday 05 Jul 2026"
        title="Portfolio operating picture"
        desc="Fleet-wide production, market position and AI recommendations for the Tages renewable portfolio — one operational brain across 14 assets in 6 bidding zones."
        right={
          <Link href="/copilot" className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-solar text-[#0A1220] text-[13px] font-semibold hover:brightness-110 transition">
            <Sparkles className="h-4 w-4" /> Ask HELIOS
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat label="Live output" value={totals.now.toFixed(1)} unit="MW" delta="▲ 4.2%" tone="up" foot="vs D-1 same hour" />
        <Stat label="Installed capacity" value={totals.cap.toFixed(0)} unit="MW" foot={`${online}/${totals.count} assets online`} />
        <Stat label="Energy today" value={totals.today.toLocaleString()} unit="MWh" delta="P50 track" tone="solar" />
        <Stat label="Revenue today" value="€248k" delta="▲ €31k vs plan" tone="up" foot="merchant + PPA + MSD" />
        <Stat label="Imbalance MTD" value="−0.7" unit="%" delta="target ≤ 2.0%" tone="up" foot="portfolio-netted" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card
          className="lg:col-span-2"
          title="Production · forecast vs actual"
          sub="Portfolio P50 with P10–P90 confidence band · TFT ensemble v2026-07-05.3"
          right={<Badge tone="amber">nMAE 2.2%</Badge>}
        >
          <ForecastFan data={data} nowHour={nowHour} />
        </Card>

        <Card title="Live alerts" sub="AI-triaged events with recommended actions" right={<Link href="/alerts" className="text-[12px] font-mono text-solar hover:underline">all →</Link>} pad={false}>
          <div className="divide-y divide-linesoft">
            {ALERTS.slice(0, 4).map((a) => (
              <div key={a.id} className="px-5 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={a.sev === "critical" ? "red" : a.sev === "warning" ? "amber" : "gray"}>{a.sev}</Badge>
                  <span className="font-mono text-[11px] text-dim">{a.time} CET</span>
                </div>
                <div className="text-[13px] font-medium">{a.title}</div>
                <div className="text-[12px] text-muted mt-0.5 leading-relaxed">{a.action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Day-ahead prices" sub="PUN + zonal forecast · CatBoost ensemble" right={<Link href="/market" className="text-[12px] font-mono text-solar hover:underline">market →</Link>}>
          <PriceChart data={prices} zones={false} />
        </Card>

        <Card title="Revenue by stream" sub="2026 YTD · €M per month">
          <RevenueStack data={rev} />
        </Card>

        <Card title="Agent activity" sub="Autonomous workflows in the last 6 hours" right={<Link href="/agents" className="text-[12px] font-mono text-solar hover:underline">agents →</Link>} pad={false}>
          <div className="divide-y divide-linesoft">
            {AGENT_RUNS.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium">{r.agent}</div>
                  <div className="text-[12px] text-muted">{r.goal}</div>
                </div>
                <Badge tone={r.status === "success" ? "green" : r.status === "running" ? "teal" : r.status === "waiting-approval" ? "amber" : "red"}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Fleet snapshot" sub="Output vs capacity per asset · click to open registry" pad={false}
        right={<Link href="/assets" className="text-[12px] font-mono text-solar hover:underline flex items-center gap-1">registry <ArrowUpRight className="h-3 w-3" /></Link>}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-linesoft">
          {ASSETS.map((a) => {
            const pct = Math.max(0, (a.currentMW / a.capacityMW) * 100);
            return (
              <Link key={a.id} href={`/assets/${a.id}`} className="bg-surface hover:bg-raised/60 transition-colors p-4 block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-dim">{a.id}</span>
                  <span className="font-mono text-[11px]" style={{ color: TECH_COLOR[a.tech] }}>{a.tech}</span>
                </div>
                <div className="text-[13px] font-medium truncate">{a.name}</div>
                <div className="mt-2 flex items-center justify-between font-mono text-[12px]">
                  <span className="text-fg tabular-nums">{a.currentMW.toFixed(1)} MW</span>
                  <span className="text-dim">/ {a.capacityMW.toFixed(0)}</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-raised overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: TECH_COLOR[a.tech] }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </>
  );
}
