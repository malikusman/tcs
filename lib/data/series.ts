import { rng } from "@/lib/util";

export interface HourPoint {
  h: string;
  hour: number;
  [k: string]: number | string;
}

// Solar production shape (bell around midday)
function solarShape(hour: number) {
  if (hour < 5 || hour > 20) return 0;
  const x = (hour - 12.5) / 4.2;
  return Math.exp(-x * x);
}

// 24h portfolio production: actual (past hours), forecast + confidence band
export function productionDay(seed = 7) {
  const r = rng(seed);
  const nowHour = 14; // frozen "live" moment for the demo
  const data: HourPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const solar = solarShape(h) * 380;
    const wind = 60 + 55 * Math.sin((h / 24) * Math.PI * 2 + 1.9) + r() * 26;
    const base = solar + Math.max(wind, 12);
    const fc = base * (0.97 + r() * 0.06);
    const lo = fc * 0.9;
    const hi = fc * 1.1;
    const actual = h <= nowHour ? base * (0.94 + r() * 0.1) : NaN;
    data.push({
      h: `${String(h).padStart(2, "0")}:00`,
      hour: h,
      forecast: Math.round(fc * 10) / 10,
      band: Math.round((hi - lo) * 10) / 10,
      lo: Math.round(lo * 10) / 10,
      hi: Math.round(hi * 10) / 10,
      actual: Number.isNaN(actual) ? (null as unknown as number) : Math.round(actual * 10) / 10,
    });
  }
  return { data, nowHour };
}

// Day-ahead PUN + zonal price forecast
export function priceDay(seed = 21) {
  const r = rng(seed);
  const data: HourPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const duck = 96 - 34 * solarShape(h) + (h >= 18 && h <= 21 ? 38 : 0) + (h <= 5 ? -12 : 0);
    const pun = Math.max(duck + r() * 9 - 4.5, 1);
    data.push({
      h: `${String(h).padStart(2, "0")}:00`,
      hour: h,
      pun: Math.round(pun * 100) / 100,
      sud: Math.round((pun - 4 + r() * 5) * 100) / 100,
      sici: Math.round((pun + 6 + r() * 8) * 100) / 100,
      sard: Math.round((pun - 2 + r() * 6) * 100) / 100,
      p10: Math.round(pun * 0.82 * 100) / 100,
      p90: Math.round(pun * 1.21 * 100) / 100,
    });
  }
  return data;
}

// BESS SOC + dispatch schedule (optimizer output)
export function bessSchedule(seed = 33) {
  const r = rng(seed);
  const rows: HourPoint[] = [];
  let soc = 42;
  for (let h = 0; h < 24; h++) {
    // charge in solar belly (10-15), discharge evening peak (18-21), FCR reserve overnight
    let power = 0;
    if (h >= 10 && h <= 14) power = -32 - r() * 6; // charging
    else if (h >= 18 && h <= 21) power = 36 + r() * 4; // discharging
    else if (h >= 1 && h <= 5) power = -10; // cheap overnight charge
    soc = Math.min(95, Math.max(8, soc - power * 0.9));
    rows.push({
      h: `${String(h).padStart(2, "0")}:00`,
      hour: h,
      power: Math.round(power * 10) / 10,
      soc: Math.round(soc),
      price: 0,
    });
  }
  const prices = priceDay(21);
  rows.forEach((row, i) => (row.price = prices[i].pun as number));
  return rows;
}

// 7-day forecast accuracy trend per model
export function modelAccuracy() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const r = rng(91);
  return days.map((d) => ({
    d,
    lightgbm: Math.round((3.4 + r() * 1.2) * 100) / 100,
    tft: Math.round((2.6 + r() * 1.0) * 100) / 100,
    lstm: Math.round((3.9 + r() * 1.4) * 100) / 100,
    ensemble: Math.round((2.2 + r() * 0.7) * 100) / 100,
  }));
}

// Weather provider skill (nMAE %) used by Weather Quality Engine
export const WEATHER_PROVIDERS = [
  { name: "ECMWF HRES", horizon: "D-1", nmae: 3.1, weight: 0.38, status: "primary" },
  { name: "ICON-EU", horizon: "D-1", nmae: 3.6, weight: 0.24, status: "active" },
  { name: "Meteomatics", horizon: "Intraday", nmae: 2.4, weight: 0.22, status: "active" },
  { name: "Solcast (sat)", horizon: "Nowcast", nmae: 1.8, weight: 0.16, status: "active" },
  { name: "GFS 0.25°", horizon: "D-2+", nmae: 4.9, weight: 0.0, status: "benchmark" },
];

// Imbalance netting: standalone vs portfolio-level
export function imbalanceNetting() {
  const r = rng(55);
  const zones = ["NORD", "CNOR", "CSUD", "SUD", "SICI", "SARD"];
  return zones.map((z) => {
    const standalone = 8 + r() * 22;
    return {
      zone: z,
      standalone: Math.round(standalone * 10) / 10,
      netted: Math.round(standalone * (0.35 + r() * 0.2) * 10) / 10,
    };
  });
}

// Monthly revenue split
export function revenueMonths() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const r = rng(77);
  return months.map((m, i) => ({
    m,
    merchant: Math.round(2.1 + i * 0.22 + r() * 0.5),
    ppa: Math.round(1.4 + r() * 0.2),
    ancillary: Math.round(0.3 + i * 0.09 + r() * 0.2),
    incentive: Math.round(0.9 - i * 0.05 + r() * 0.1),
  }));
}

// Risk: Revenue-at-Risk distribution
export function rarDistribution() {
  const r = rng(101);
  const pts = [];
  for (let x = 60; x <= 140; x += 4) {
    const y = Math.exp(-Math.pow((x - 104) / 16, 2)) * (0.9 + r() * 0.2);
    pts.push({ x, y: Math.round(y * 1000) / 1000 });
  }
  return pts;
}

export function windRose(seed = 5) {
  const r = rng(seed);
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((dir) => ({
    dir,
    freq: Math.round((4 + r() * 18) * 10) / 10,
  }));
}
