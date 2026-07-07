// Data access boundary for the Gate Room agent cycle.
//
// The demo runs entirely on SimulatedDataSource, which wraps the same seeded mock
// series the rest of the app renders — so every number an agent quotes matches the
// forecasting and market pages. In the pilot, an EntsoeDataSource (ENTSO-E day-ahead
// prices) and an OpenMeteoDataSource (weather) implement this same interface and the
// real Claude-powered agent orchestration is swapped in behind it; no Gate Room code
// outside this module may import the mock series directly.

import { rng } from "../util";
import { productionDay, priceDay } from "../data/series";

export interface ZoneWeather {
  zone: string;
  cloudPct: number;
  tempC: number;
  windMs: number;
}

export interface ForecastPoint {
  hour: number;
  p10: number;
  p50: number;
  p90: number; // MW
}

export interface DaPricePoint {
  hour: number;
  pun: number;
  sud: number;
  sici: number;
  sard: number; // €/MWh
}

export interface GateDataSource {
  getWeather(zones: string[], seed: number): ZoneWeather[];
  getDaPrices(): DaPricePoint[];
  getForecast(): ForecastPoint[];
}

export class SimulatedDataSource implements GateDataSource {
  getWeather(zones: string[], seed: number): ZoneWeather[] {
    const r = rng(seed);
    return zones.map((zone) => ({
      zone,
      cloudPct: Math.round(6 + r() * 22),
      tempC: Math.round((29 + r() * 6) * 10) / 10,
      windMs: Math.round((3 + r() * 5) * 10) / 10,
    }));
  }

  getDaPrices(): DaPricePoint[] {
    return priceDay().map((p) => ({
      hour: p.hour as number,
      pun: p.pun as number,
      sud: p.sud as number,
      sici: p.sici as number,
      sard: p.sard as number,
    }));
  }

  getForecast(): ForecastPoint[] {
    return productionDay().data.map((p) => ({
      hour: p.hour as number,
      p10: p.lo as number,
      p50: p.forecast as number,
      p90: p.hi as number,
    }));
  }
}
