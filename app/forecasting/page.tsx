import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap, Bar } from "@/components/ui/kit";
import { ForecastFan, AccuracyChart } from "@/components/charts/charts";
import { productionDay, modelAccuracy, WEATHER_PROVIDERS } from "@/lib/data/series";

export default function ForecastingPage() {
  const { data, nowHour } = productionDay(11);
  const acc = modelAccuracy();

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Forecasting Engine"
        title="Probabilistic production forecasting"
        desc="Multi-horizon P10/P50/P90 forecasts per asset and zone. A weather quality engine weights four providers; a model ensemble (LightGBM · LSTM · TFT) beats every single model."
        right={<Badge tone="amber">version 2026-07-05.3 · published 11:30 CET</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Portfolio nMAE · D-1" value="2.2" unit="%" tone="up" delta="▼ 0.4pp vs Q1" foot="ensemble" />
        <Stat label="Intraday nMAE · 2h" value="1.4" unit="%" tone="up" foot="satellite nowcast" />
        <Stat label="Imbalance avoided" value="€96k" foot="MTD vs naive persistence" tone="solar" delta="attribution" />
        <Stat label="Horizons served" value="6" foot="15 min → seasonal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2" title="D-1 portfolio forecast" sub="P50 line · P10–P90 band feeds risk-aware bidding">
          <ForecastFan data={data} nowHour={nowHour} />
        </Card>

        <Card title="Weather Quality Engine" sub="Provider skill (nMAE) → live ensemble weights" pad={false}>
          <div className="divide-y divide-linesoft">
            {WEATHER_PROVIDERS.map((w) => (
              <div key={w.name} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium">{w.name}</span>
                  <Badge tone={w.status === "primary" ? "amber" : w.status === "benchmark" ? "gray" : "teal"}>{w.status}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1"><Bar pct={w.weight * 100 * 2.4} color={w.status === "primary" ? "#F5A623" : "#3FC8D4"} /></div>
                  <span className="font-mono text-[11px] text-muted w-24 text-right">w {w.weight.toFixed(2)} · {w.nmae}%</span>
                </div>
                <div className="font-mono text-[10.5px] text-dim mt-1">{w.horizon}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Model leaderboard · 7 days" sub="Daily nMAE % — the ensemble is the product, single models are inputs">
          <AccuracyChart data={acc} />
        </Card>

        <Card title="Explainability · today 14:00 forecast" sub="SHAP decomposition of the portfolio P50" pad={false}>
          <TableWrap>
            <thead><tr><Th>Driver</Th><Th>Contribution</Th><Th>Note</Th></tr></thead>
            <tbody>
              {[
                { d: "Baseline (clear-sky + power curve)", c: "+402 MW", n: "physics prior", up: true },
                { d: "Cloud cover front · SUD 13–16h", c: "−34 MW", n: "ECMWF + satellite agree", up: false },
                { d: "Wind ramp · Basilicata", c: "+18 MW", n: "ICON-EU upgraded 06z run", up: true },
                { d: "Ambient temp derating · SICI", c: "−9 MW", n: "38 °C module temp", up: false },
                { d: "Curtailment order · Trapani", c: "−14 MW", n: "Terna BDE until 16:00", up: false },
                { d: "Soiling & availability model", c: "−5 MW", n: "last wash 21 Jun", up: false },
              ].map((r) => (
                <tr key={r.d}>
                  <Td>{r.d}</Td>
                  <Td><span className={`font-mono tabular-nums ${r.up ? "text-up" : "text-down"}`}>{r.c}</span></Td>
                  <Td><span className="text-[12px] text-muted">{r.n}</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}
