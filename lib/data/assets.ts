export type Tech = "PV" | "Wind" | "BESS" | "Hybrid";
export type Regime = "Merchant" | "PPA" | "FiT" | "GSE Incentive";

export interface Asset {
  id: string;
  name: string;
  tech: Tech;
  capacityMW: number;
  region: string;
  zone: string; // Italian bidding zone
  lat: number;
  lng: number;
  cod: string; // commercial operation date
  regime: Regime;
  availability: number; // %
  currentMW: number;
  todayMWh: number;
  forecastErrorPct: number;
  status: "online" | "curtailed" | "maintenance" | "offline";
  scada: "OPC-UA" | "IEC 60870-5-104" | "Modbus TCP" | "MQTT" | "IEC 61850";
  ppaPrice?: number;
  socPct?: number; // for BESS
}

export const ASSETS: Asset[] = [
  { id: "PV-APU-01", name: "Cerignola Solar Park", tech: "PV", capacityMW: 84.2, region: "Puglia", zone: "SUD", lat: 41.27, lng: 15.9, cod: "2021-06-14", regime: "Merchant", availability: 99.1, currentMW: 61.4, todayMWh: 356, forecastErrorPct: 2.1, status: "online", scada: "OPC-UA" },
  { id: "PV-APU-02", name: "Foggia Nord PV", tech: "PV", capacityMW: 52.6, region: "Puglia", zone: "SUD", lat: 41.51, lng: 15.55, cod: "2020-03-02", regime: "PPA", availability: 98.4, currentMW: 37.9, todayMWh: 221, forecastErrorPct: 2.8, status: "online", scada: "IEC 60870-5-104", ppaPrice: 68.5 },
  { id: "PV-SIC-01", name: "Gela Helios Field", tech: "PV", capacityMW: 96.0, region: "Sicilia", zone: "SICI", lat: 37.07, lng: 14.25, cod: "2022-09-30", regime: "Merchant", availability: 97.8, currentMW: 74.8, todayMWh: 402, forecastErrorPct: 1.9, status: "online", scada: "OPC-UA" },
  { id: "PV-SIC-02", name: "Trapani Sole II", tech: "PV", capacityMW: 41.3, region: "Sicilia", zone: "SICI", lat: 37.94, lng: 12.62, cod: "2019-05-18", regime: "GSE Incentive", availability: 96.9, currentMW: 27.2, todayMWh: 168, forecastErrorPct: 3.4, status: "curtailed", scada: "Modbus TCP" },
  { id: "PV-LAZ-01", name: "Montalto PV Cluster", tech: "PV", capacityMW: 63.7, region: "Lazio", zone: "CNOR", lat: 42.33, lng: 11.6, cod: "2023-04-12", regime: "Merchant", availability: 99.4, currentMW: 44.1, todayMWh: 259, forecastErrorPct: 2.3, status: "online", scada: "MQTT" },
  { id: "PV-SAR-01", name: "Oristano Sun Bay", tech: "PV", capacityMW: 38.9, region: "Sardegna", zone: "SARD", lat: 39.9, lng: 8.59, cod: "2021-11-05", regime: "PPA", availability: 98.8, currentMW: 26.6, todayMWh: 151, forecastErrorPct: 2.6, status: "online", scada: "OPC-UA", ppaPrice: 71.0 },
  { id: "PV-BAS-01", name: "Matera Ridge Solar", tech: "PV", capacityMW: 29.4, region: "Basilicata", zone: "SUD", lat: 40.67, lng: 16.6, cod: "2018-08-21", regime: "FiT", availability: 95.2, currentMW: 18.3, todayMWh: 112, forecastErrorPct: 4.1, status: "online", scada: "Modbus TCP" },
  { id: "WD-BAS-01", name: "Potenza Wind Ridge", tech: "Wind", capacityMW: 72.0, region: "Basilicata", zone: "SUD", lat: 40.64, lng: 15.8, cod: "2020-12-10", regime: "Merchant", availability: 97.2, currentMW: 41.8, todayMWh: 486, forecastErrorPct: 5.6, status: "online", scada: "IEC 61850" },
  { id: "WD-CAM-01", name: "Benevento Eolico", tech: "Wind", capacityMW: 54.0, region: "Campania", zone: "SUD", lat: 41.13, lng: 14.78, cod: "2019-02-27", regime: "GSE Incentive", availability: 96.5, currentMW: 22.7, todayMWh: 301, forecastErrorPct: 6.2, status: "online", scada: "IEC 60870-5-104" },
  { id: "WD-SAR-01", name: "Nurra Wind Farm", tech: "Wind", capacityMW: 48.3, region: "Sardegna", zone: "SARD", lat: 40.68, lng: 8.29, cod: "2022-01-19", regime: "Merchant", availability: 98.1, currentMW: 30.4, todayMWh: 322, forecastErrorPct: 5.1, status: "online", scada: "IEC 61850" },
  { id: "WD-SIC-01", name: "Caltanissetta Vento", tech: "Wind", capacityMW: 36.6, region: "Sicilia", zone: "SICI", lat: 37.49, lng: 14.06, cod: "2017-10-08", regime: "FiT", availability: 94.7, currentMW: 0, todayMWh: 118, forecastErrorPct: 7.0, status: "maintenance", scada: "Modbus TCP" },
  { id: "BE-SIC-01", name: "Gela BESS I", tech: "BESS", capacityMW: 40.0, region: "Sicilia", zone: "SICI", lat: 37.08, lng: 14.27, cod: "2024-07-01", regime: "Merchant", availability: 99.6, currentMW: -12.0, todayMWh: 96, forecastErrorPct: 0.4, status: "online", scada: "MQTT", socPct: 62 },
  { id: "BE-APU-01", name: "Cerignola BESS", tech: "BESS", capacityMW: 25.0, region: "Puglia", zone: "SUD", lat: 41.28, lng: 15.92, cod: "2025-02-15", regime: "Merchant", availability: 99.2, currentMW: 8.5, todayMWh: 54, forecastErrorPct: 0.6, status: "online", scada: "MQTT", socPct: 38 },
  { id: "HY-SAR-01", name: "Sulcis Hybrid Plant", tech: "Hybrid", capacityMW: 58.5, region: "Sardegna", zone: "SARD", lat: 39.16, lng: 8.52, cod: "2025-06-20", regime: "Merchant", availability: 98.9, currentMW: 33.2, todayMWh: 204, forecastErrorPct: 2.9, status: "online", scada: "OPC-UA", socPct: 71 },
];

export const TECH_COLOR: Record<Tech, string> = {
  PV: "#F5A623",
  Wind: "#3FC8D4",
  BESS: "#9B8CFF",
  Hybrid: "#7FD98F",
};

export const portfolioTotals = () => {
  const cap = ASSETS.reduce((s, a) => s + a.capacityMW, 0);
  const now = ASSETS.reduce((s, a) => s + Math.max(a.currentMW, 0), 0);
  const today = ASSETS.reduce((s, a) => s + a.todayMWh, 0);
  return { cap, now, today, count: ASSETS.length };
};

export function assetById(id: string) {
  return ASSETS.find((a) => a.id === id);
}
