// Deterministic Gate Room transcripts. buildRun(gate, ds) is PURE: everything —
// template variant, volumes, the risk-rejection round — derives from the gate id
// via the seeded mulberry32 RNG. Two runs of the same gate produce byte-identical
// transcripts; different gates differ. No Date, no Math.random.

import { rng } from "../util";
import type { Gate } from "../gates";
import type { GateDataSource } from "./datasource";

export type AgentName = "Forecast Agent" | "Trading Agent" | "Risk Agent";

export interface DraftBid {
  bidId: string;
  market: "MGP" | "MI-A1" | "MI-A2" | "MI-A3" | "XBID";
  zone: string;
  mtu: string;
  volumeMWh: number; // negative = buy
  limitEUR: number | null; // null = price-taker
  rationale: string;
}

export type RunEvent =
  | { kind: "agent"; agent: AgentName; note: string }
  | { kind: "tool"; agent: AgentName; name: string; args: string; result: string }
  | { kind: "note"; agent: AgentName; text: string }
  | { kind: "bid"; bid: DraftBid }
  | { kind: "reject"; bidId: string; reason: string }
  | { kind: "revise"; bidId: string; bid: DraftBid; change: string }
  | { kind: "approve"; text: string };

export interface GateRun {
  gateId: string;
  events: RunEvent[];
  bids: DraftBid[]; // final (post-revision) bid set that gets hash-locked
  rejected: boolean;
  summary: string; // one-line instruction for the paper ledger
  market: DraftBid["market"];
  zone: string;
  rationale: string;
}

export function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h = ((h ^ id.charCodeAt(i)) * 16777619) >>> 0;
  }
  return h >>> 0;
}

const eur = (v: number) => `€${v.toFixed(2)}`;
const vol = (v: number) => `${Math.abs(v).toLocaleString()} MWh`;

export function buildRun(gate: Gate, ds: GateDataSource): GateRun {
  const seed = seedFromId(gate.id);
  const r = rng(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length) % arr.length];
  const jitter = (base: number, pct: number) => Math.round(base * (1 - pct + r() * 2 * pct));

  const isMGP = gate.name === "MGP";
  const rejectRound = seed % 3 === 0; // ~1 in 3 runs, deterministic by gate id

  const fc = ds.getForecast();
  const p50 = Math.round(fc.reduce((a, p) => a + p.p50, 0));
  const p10 = Math.round(fc.reduce((a, p) => a + p.p10, 0));
  const p90 = Math.round(fc.reduce((a, p) => a + p.p90, 0));
  const px = ds.getDaPrices();
  const punAvg = px.reduce((a, p) => a + p.pun, 0) / 24;
  const siciPrem = px.reduce((a, p) => a + (p.sici - p.pun), 0) / 24;
  const sudDisc = px.reduce((a, p) => a + (p.pun - p.sud), 0) / 24;
  const wx = ds.getWeather(["SUD", "SICI", "SARD"], seed);

  const events: RunEvent[] = [];

  // ---- a) FORECAST AGENT -------------------------------------------------
  events.push({
    kind: "agent", agent: "Forecast Agent",
    note: pick([
      "Refreshing the production picture ahead of the gate.",
      "Re-running the ensemble on the latest weather vintage.",
      "Pulling nowcast-corrected forecasts before commitment.",
    ]),
  });
  wx.slice(0, 2 + (seed % 2)).forEach((w) => {
    events.push({
      kind: "tool", agent: "Forecast Agent", name: "get_weather_forecast",
      args: `zone="${w.zone}", horizon="${isMGP ? "D+1" : "intraday"}"`,
      result: `cloud ${w.cloudPct}% · ${w.tempC}°C · wind ${w.windMs} m/s`,
    });
  });
  events.push({
    kind: "tool", agent: "Forecast Agent", name: "get_production_forecast",
    args: `scope="portfolio", horizon="${isMGP ? "D+1" : "rest-of-day"}"`,
    result: `P50 ${p50.toLocaleString()} MWh · P10 ${p10.toLocaleString()} · P90 ${p90.toLocaleString()}`,
  });
  events.push({
    kind: "note", agent: "Forecast Agent",
    text: pick([
      `Clear-sky solar belly with a ${wx[0].cloudPct}% cloud fraction over Puglia; Sicilian nowcast confidence is high (Solcast nMAE 1.8%). Wind ramp fades after H09, so the widest band sits on SUD midday.`,
      `Ensemble spread is tight (${Math.round(((p90 - p10) / p50) * 100)}% P10–P90 vs P50). Main uncertainty is the Basilicata wind front timing; solar zones track climatology.`,
      `Nowcast lifts SICI vs the 00z run while SUD holds; band asymmetry favors committing above P50 only where satellite confidence is high.`,
    ]),
  });

  // ---- b) TRADING AGENT --------------------------------------------------
  events.push({
    kind: "agent", agent: "Trading Agent",
    note: pick([
      "Translating the forecast into an offer set.",
      "Building the bid curve against the price picture.",
      "Sizing commitments zone by zone.",
    ]),
  });
  events.push({
    kind: "tool", agent: "Trading Agent", name: "get_da_prices",
    args: `zones=["SUD","SICI","SARD"]`,
    result: `PUN avg ${eur(punAvg)} · SICI +${eur(siciPrem)} vs PUN · SUD −${eur(sudDisc)}`,
  });
  events.push({
    kind: "tool", agent: "Trading Agent", name: "get_price_stats",
    args: `metric="neg_price_prob", window="D+1"`,
    result: `P(price<0): 11% H13 SUD · 3% H13 SICI · evening peak spread +€38 H19`,
  });

  let bids: DraftBid[];
  let rejectTargetIdx: number;
  if (isMGP) {
    const sudV = jitter(1980, 0.06);
    const siciHi = jitter(1340, 0.04); // deliberately above P50 — the risk flag when rejectRound
    const siciOk = jitter(1240, 0.03);
    const sardV = jitter(820, 0.06);
    const buybackV = -jitter(160, 0.15);
    bids = [
      { bidId: "D-1", market: "MGP", zone: "SUD", mtu: "09:00–16:00 · 15-min MTUs", volumeMWh: sudV, limitEUR: null, rationale: "Must-run solar in liquid hours; shade H12–H15 toward P40 on the 11% negative-price probability." },
      { bidId: "D-2", market: "MGP", zone: "SICI", mtu: "10:00–15:00 · 15-min MTUs", volumeMWh: rejectRound ? siciHi : siciOk, limitEUR: null, rationale: rejectRound ? "High-confidence nowcast supports committing above P50 into the SICI premium." : "Commit P50 into the SICI premium; nowcast confidence high." },
      { bidId: "D-3", market: "MGP", zone: "SARD", mtu: "09:00–17:00 · 15-min MTUs", volumeMWh: sardV, limitEUR: null, rationale: "Standard P50 commitment; SARD spread near PUN, no shading required." },
      { bidId: "D-4", market: "MI-A1", zone: "SUD", mtu: "14:00–16:00 · 15-min MTUs", volumeMWh: buybackV, limitEUR: Math.round((punAvg - 20 + r() * 4) * 100) / 100, rationale: "Pre-planned buy-back window: converts wind-front forecast risk into a managed trade instead of imbalance." },
      { bidId: "D-5", market: "MI-A3", zone: "SICI", mtu: "18:00–20:00 · 15-min MTUs", volumeMWh: jitter(96, 0.1), limitEUR: Math.round((124 + r() * 5) * 100) / 100, rationale: "BESS holds the evening block: H19 spread forecast beats the day-ahead lock with 74% confidence." },
    ];
    rejectTargetIdx = 1;
  } else {
    const buyV = -jitter(140, 0.2);
    const xbidV = jitter(64, 0.15);
    const bessHi = jitter(40, 0.1);
    const bessOk = jitter(24, 0.1);
    bids = [
      { bidId: "D-1", market: gate.name as DraftBid["market"], zone: "SUD", mtu: "14:00–16:00 · 15-min MTUs", volumeMWh: buyV, limitEUR: Math.round((punAvg - 19 + r() * 5) * 100) / 100, rationale: "Buy back the nowcast shortfall vs the day-ahead commit; imbalance settlement would cost more than the spread." },
      { bidId: "D-2", market: "XBID", zone: "CNOR", mtu: "15:00–17:00 · 15-min MTUs", volumeMWh: xbidV, limitEUR: Math.round((punAvg - 25 + r() * 4) * 100) / 100, rationale: "Continuous sell to close the CNOR long from the early wind front." },
      { bidId: "D-3", market: gate.name as DraftBid["market"], zone: "SICI", mtu: "18:00–20:00 · 15-min MTUs", volumeMWh: rejectRound ? bessHi : bessOk, limitEUR: Math.round((116 + r() * 6) * 100) / 100, rationale: rejectRound ? "Discharge deeper into the evening premium while the spread holds." : "Partial BESS discharge into the evening premium; keep reserve intact." },
    ];
    rejectTargetIdx = 2;
  }
  bids.forEach((b) => events.push({ kind: "bid", bid: b }));

  // ---- c) RISK AGENT -----------------------------------------------------
  events.push({
    kind: "agent", agent: "Risk Agent",
    note: pick([
      "Checking the set against policy before lock.",
      "Running limits, exposure and asset-state checks.",
      "Validating every order against the risk mandate.",
    ]),
  });
  events.push({
    kind: "tool", agent: "Risk Agent", name: "get_risk_limits",
    args: `book="paper"`,
    result: "zonal short cap 200 MWh · imbalance budget €12k/day · SOC floor 10% · cycles ≤ 1.4/day",
  });
  events.push({
    kind: "tool", agent: "Risk Agent", name: "get_portfolio_state",
    args: `scope="positions"`,
    result: "open MI exposure −148 MWh · D+1 sold 4,240 MWh · imbalance MTD −0.7%",
  });
  events.push({
    kind: "tool", agent: "Risk Agent", name: "get_bess_state",
    args: `asset="BE-SIC-01"`,
    result: "SOC 62% · cycles today 1.1 · reserve 12 MWh committed (MBR)",
  });

  if (rejectRound) {
    const bad = bids[rejectTargetIdx];
    if (isMGP) {
      const projected = Math.abs(bad.volumeMWh) - 1240 + 132; // narrative arithmetic for the reason string
      events.push({
        kind: "reject", bidId: bad.bidId,
        reason: `${bad.bidId} rejected — committing ${vol(bad.volumeMWh)} in SICI projects a ${projected + 68} MWh zonal short vs P50 under adverse nowcast; the 200 MWh zonal short cap would be exceeded.`,
      });
      const revised: DraftBid = { ...bad, volumeMWh: jitter(1240, 0.02), rationale: "Revised to the P50 commitment: keeps the worst-case SICI short at 168 MWh, inside the 200 MWh cap." };
      bids[rejectTargetIdx] = revised;
      events.push({ kind: "revise", bidId: bad.bidId, bid: revised, change: `volume ${vol(bad.volumeMWh)} → ${vol(revised.volumeMWh)}` });
    } else {
      events.push({
        kind: "reject", bidId: bad.bidId,
        reason: `${bad.bidId} rejected — a ${vol(bad.volumeMWh)} discharge takes BE-SIC-01 to a projected 1.55 equivalent cycles today, above the 1.4/day warranty budget.`,
      });
      const revised: DraftBid = { ...bad, volumeMWh: jitter(24, 0.1), rationale: "Revised discharge stays within the 1.4 cycles/day warranty budget while keeping the evening premium." };
      bids[rejectTargetIdx] = revised;
      events.push({ kind: "revise", bidId: bad.bidId, bid: revised, change: `volume ${vol(bad.volumeMWh)} → ${vol(revised.volumeMWh)}` });
    }
  }

  events.push({
    kind: "approve",
    text: pick([
      `All ${bids.length} orders within policy · imbalance budget headroom €7.4k · lock authorized.`,
      `Limit checks green on ${bids.length}/${bids.length} orders · no kill-switch conditions · lock authorized.`,
      `Set complies with the L3 mandate (${bids.length} orders) · exposure inside zonal caps · lock authorized.`,
    ]),
  });

  const sells = bids.filter((b) => b.volumeMWh > 0).length;
  const buys = bids.length - sells;
  const summary = isMGP
    ? `MGP D+1 bid set · ${sells} sells + ${buys} buy-back · BESS evening hold`
    : `${gate.name} correction set · ${sells} sells + ${buys} buy-back`;

  return {
    gateId: gate.id,
    events,
    bids,
    rejected: rejectRound,
    summary,
    market: isMGP ? "MGP" : (gate.name as DraftBid["market"]),
    zone: isMGP ? "ALL" : "SUD",
    rationale: rejectRound
      ? "Locked after one risk-revision round; all orders inside policy caps."
      : "Locked first pass; all orders inside policy caps.",
  };
}

// Deterministic clearing outcome for a locked run: ~1 in 4 clearings is a loss.
export function clearingOutcome(gateId: string): { deltaEUR: number; note: string } {
  const r = rng(seedFromId(gateId) ^ 0x5f3759df);
  if (r() < 0.25) {
    const loss = -Math.round(280 + r() * 620);
    return { deltaEUR: loss, note: "one order expired below floor — baseline won the session" };
  }
  const gain = Math.round(420 + r() * 1980);
  return { deltaEUR: gain, note: "cleared against published results" };
}
