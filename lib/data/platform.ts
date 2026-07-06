// ---------- Trading ----------
export interface Bid {
  id: string;
  market: "MGP" | "MI-A1" | "MI-A2" | "MI-A3" | "XBID" | "MBR";
  zone: string;
  hours: string;
  volumeMWh: number;
  priceEUR: number;
  status: "accepted" | "pending" | "rejected" | "draft";
  source: "AI · auto" | "AI · approved" | "Manual";
  asset: string;
}

export const BIDS: Bid[] = [
  { id: "B-88412", market: "MGP", zone: "SUD", hours: "09:00–16:00 · 15-min MTUs", volumeMWh: 2140, priceEUR: 0.0, status: "accepted", source: "AI · auto", asset: "Portfolio · SUD" },
  { id: "B-88413", market: "MGP", zone: "SICI", hours: "10:00–15:00 · 15-min MTUs", volumeMWh: 1260, priceEUR: 0.0, status: "accepted", source: "AI · auto", asset: "Portfolio · SICI" },
  { id: "B-88414", market: "MGP", zone: "SARD", hours: "09:00–17:00 · 15-min MTUs", volumeMWh: 840, priceEUR: 0.0, status: "accepted", source: "AI · approved", asset: "Portfolio · SARD" },
  { id: "B-88420", market: "MI-A1", zone: "SUD", hours: "14:00–16:00 · 15-min MTUs", volumeMWh: -180, priceEUR: 71.4, status: "accepted", source: "AI · auto", asset: "WD-BAS-01" },
  { id: "B-88421", market: "MI-A2", zone: "SICI", hours: "18:00–20:00 · 15-min MTUs", volumeMWh: 96, priceEUR: 128.0, status: "pending", source: "AI · approved", asset: "BE-SIC-01" },
  { id: "B-88422", market: "MBR", zone: "SICI", hours: "00:00–24:00 · 15-min MTUs", volumeMWh: 30, priceEUR: 41.2, status: "accepted", source: "Manual", asset: "BE-SIC-01" },
  { id: "B-88423", market: "XBID", zone: "CNOR", hours: "15:00–17:00 · 15-min MTUs", volumeMWh: -64, priceEUR: 66.8, status: "draft", source: "AI · approved", asset: "PV-LAZ-01" },
];

export const AUTOMATION_LEVELS = [
  { level: "L0", name: "Manual trading", desc: "Trader composes and submits every order.", active: false },
  { level: "L1", name: "AI recommendations", desc: "Optimizer proposes bids; trader executes externally.", active: false },
  { level: "L2", name: "Operator approval", desc: "AI drafts orders; one-click human approval required.", active: false },
  { level: "L3", name: "Supervised auto-submit", desc: "AI submits within policy; desk monitors in real time.", active: true },
  { level: "L4", name: "Autonomous under policy", desc: "Full autonomy inside hard risk constraints.", active: false },
];

// ---------- AI Agents ----------
export interface AgentRun {
  id: string;
  agent: string;
  goal: string;
  status: "running" | "success" | "waiting-approval" | "failed";
  started: string;
  steps: { tool: string; detail: string; state: "done" | "active" | "queued" }[];
}

export const AGENT_RUNS: AgentRun[] = [
  {
    id: "RUN-4471",
    agent: "Forecast Agent",
    goal: "Refresh D-1 production forecast · all zones",
    status: "success",
    started: "11:30 CET",
    steps: [
      { tool: "weather.fetch", detail: "Pulled ECMWF, ICON-EU, Meteomatics runs", state: "done" },
      { tool: "quality.rank", detail: "Solcast promoted for SICI nowcast (nMAE 1.8%)", state: "done" },
      { tool: "model.infer", detail: "TFT ensemble · 14 assets · 24h horizon", state: "done" },
      { tool: "forecast.publish", detail: "Published v2026-07-05.3 to trading engine", state: "done" },
    ],
  },
  {
    id: "RUN-4472",
    agent: "Trading Agent",
    goal: "Build MGP bid set for D+1 gate",
    status: "waiting-approval",
    started: "11:42 CET",
    steps: [
      { tool: "forecast.read", detail: "Loaded P50/P10/P90 production curves", state: "done" },
      { tool: "price.infer", detail: "PUN forecast σ=€8.4 · negative-price prob 3% H13", state: "done" },
      { tool: "optimizer.milp", detail: "Portfolio MILP solved in 41s · gap 0.2%", state: "done" },
      { tool: "bids.draft", detail: "6 zone bids drafted · awaiting desk approval", state: "active" },
    ],
  },
  {
    id: "RUN-4473",
    agent: "BESS Agent",
    goal: "Re-optimize Gela BESS after MI-A1 clearing",
    status: "running",
    started: "13:58 CET",
    steps: [
      { tool: "market.results", detail: "MI-A1 cleared · SICI H18 at €131.20", state: "done" },
      { tool: "twin.simulate", detail: "Cycling 3 dispatch plans in digital twin", state: "active" },
      { tool: "schedule.commit", detail: "Push revised SOC plan to SCADA", state: "queued" },
    ],
  },
  {
    id: "RUN-4474",
    agent: "Settlement Agent",
    goal: "Reconcile June invoices vs meter data",
    status: "failed",
    started: "09:15 CET",
    steps: [
      { tool: "meter.load", detail: "Loaded 2G meter data · 14 assets", state: "done" },
      { tool: "invoice.match", detail: "Mismatch €4,120 on PV-SIC-02 curtailment", state: "done" },
      { tool: "ticket.raise", detail: "Escalated to finance · human review needed", state: "done" },
    ],
  },
];

export const ML_MODELS = [
  { name: "solar-tft-v8", task: "PV production", algo: "Temporal Fusion Transformer", nmae: "2.4%", stage: "Production", drift: "stable" },
  { name: "wind-gbm-v12", task: "Wind production", algo: "LightGBM + NWP residuals", nmae: "5.3%", stage: "Production", drift: "stable" },
  { name: "pun-price-v6", task: "PUN price", algo: "CatBoost ensemble", nmae: "€6.8", stage: "Production", drift: "watch" },
  { name: "solar-tft-v9", task: "PV production", algo: "TFT + satellite nowcast", nmae: "2.1%", stage: "Staging", drift: "—" },
  { name: "imbalance-v3", task: "Imbalance sign", algo: "XGBoost classifier", nmae: "AUC 0.81", stage: "Production", drift: "drifting" },
];

// ---------- Paper Trading / Shadow Mode ----------
// Signals are hash-locked before the relevant market gate, then cleared against
// actual published GME/Terna results — no hindsight bias by construction.
export interface PaperSignal {
  id: string;
  locked: string; // when the signal was hash-locked (always before the gate)
  gate: string;
  market: Bid["market"];
  zone: string;
  instruction: string;
  rationale: string;
  hash: string;
  deltaEUR: number | null; // paper P&L vs naive baseline; null = awaiting clearing
  status: "settled" | "locked";
}

export const PAPER_SIGNALS: PaperSignal[] = [
  { id: "SIG-2851", locked: "05 Jul 11:38:52", gate: "MGP 06 Jul · 12:00", market: "MGP", zone: "ALL", instruction: "D+1 bid set · commit P48 blend, shade H12–H14 SUD to P40", rationale: "Record solar in-feed forecast; neg-price prob 14% in solar belly", hash: "e3b7…41c9", deltaEUR: null, status: "locked" },
  { id: "SIG-2850", locked: "05 Jul 13:47:10", gate: "MI-A3 · 14:30", market: "MI-A3", zone: "SICI", instruction: "Hold BESS 96 MWh for H18–H20, floor €126", rationale: "Evening spread forecast +€38 vs day-ahead lock, 74% confidence", hash: "9f02…b7aa", deltaEUR: null, status: "locked" },
  { id: "SIG-2849", locked: "05 Jul 12:55:31", gate: "XBID · cont. (H15 lead 14:15)", market: "XBID", zone: "CNOR", instruction: "Sell 64 MWh H15–H17, floor €66.80", rationale: "Wind front 90 min earlier than ECMWF run; close long before delivery", hash: "77d1…03fe", deltaEUR: null, status: "locked" },
  { id: "SIG-2848", locked: "05 Jul 09:12:44", gate: "MI-A1 · 10:30", market: "MI-A1", zone: "SUD", instruction: "Buy back 180 MWh H14–H16", rationale: "Satellite nowcast −8% vs D-1 commit; convert imbalance into managed trade", hash: "c58a…d210", deltaEUR: 1140, status: "settled" },
  { id: "SIG-2847", locked: "04 Jul 11:41:22", gate: "MGP 05 Jul · 12:00", market: "MGP", zone: "SUD", instruction: "Commit P42 (not P50) in H12–H15 · 1,980 MWh", rationale: "Neg-price prob 11% H13; asymmetric imbalance penalty favors shading", hash: "1a9e…6f57", deltaEUR: 3140, status: "settled" },
  { id: "SIG-2846", locked: "04 Jul 11:41:22", gate: "MGP 05 Jul · 12:00", market: "MGP", zone: "SICI", instruction: "Commit P55 H10–H15 · 1,310 MWh", rationale: "High-confidence Solcast nowcast (nMAE 1.8%); sell above P50 into tight zone", hash: "b402…8811", deltaEUR: 1870, status: "settled" },
  { id: "SIG-2843", locked: "03 Jul 17:20:08", gate: "MI-A2 04 Jul · 13:30", market: "MI-A2", zone: "SARD", instruction: "Sell 60 MWh H16, floor €71.00", rationale: "Cable congestion signal; expected SARD premium did not materialize", hash: "f6c3…2d94", deltaEUR: -640, status: "settled" },
];

export interface PaperOrder {
  id: string;
  market: Bid["market"];
  zone: string;
  hours: string;
  volumeMWh: number;
  limitEUR: number; // 0 = price-taker
  clearedEUR: number | null; // actual published GME result
  deltaEUR: number | null; // vs naive baseline (sell P50 at MGP, no MI, no BESS)
  status: "filled" | "working" | "expired";
}

export const PAPER_ORDERS: PaperOrder[] = [
  { id: "P-7741", market: "MGP", zone: "SUD", hours: "09:00–16:00 · 15-min MTUs", volumeMWh: 1980, limitEUR: 0, clearedEUR: 88.1, deltaEUR: 3140, status: "filled" },
  { id: "P-7742", market: "MGP", zone: "SICI", hours: "10:00–15:00 · 15-min MTUs", volumeMWh: 1310, limitEUR: 0, clearedEUR: 99.65, deltaEUR: 1870, status: "filled" },
  { id: "P-7743", market: "MGP", zone: "SARD", hours: "09:00–17:00 · 15-min MTUs", volumeMWh: 840, limitEUR: 0, clearedEUR: 86.2, deltaEUR: 410, status: "filled" },
  { id: "P-7744", market: "MI-A1", zone: "SUD", hours: "14:00–16:00 · 15-min MTUs", volumeMWh: -180, limitEUR: 72.0, clearedEUR: 71.4, deltaEUR: 1140, status: "filled" },
  { id: "P-7745", market: "MI-A2", zone: "SARD", hours: "16:00–17:00 · 15-min MTUs", volumeMWh: 60, limitEUR: 71.0, clearedEUR: 68.3, deltaEUR: -640, status: "expired" },
  { id: "P-7746", market: "MI-A3", zone: "SICI", hours: "18:00–20:00 · 15-min MTUs", volumeMWh: 96, limitEUR: 126.0, clearedEUR: null, deltaEUR: null, status: "working" },
  { id: "P-7747", market: "MGP", zone: "ALL", hours: "00:00–24:00 · 15-min MTUs", volumeMWh: 4120, limitEUR: 0, clearedEUR: null, deltaEUR: null, status: "working" },
];

export interface GraduationStep {
  from: string;
  to: string;
  name: string;
  status: "unlocked" | "in-progress" | "locked";
  when: string;
  criteria: { name: string; target: string; actual: string; pct: number }[];
}

export const GRADUATION: GraduationStep[] = [
  {
    from: "L1", to: "L2", name: "Paper signals → operator-approved orders", status: "unlocked", when: "Unlocked 27 Apr 2026 · risk committee",
    criteria: [
      { name: "Paper capture vs naive baseline", target: "≥ +1.0pp · 8 consecutive wks", actual: "+2.3pp · 8/8 wks", pct: 100 },
      { name: "Paper imbalance ratio", target: "< 2.0% of traded volume", actual: "1.6%", pct: 100 },
      { name: "Pre-gate signal lock integrity", target: "100% hash-locked before gate", actual: "612/612 signals", pct: 100 },
    ],
  },
  {
    from: "L2", to: "L3", name: "Approved orders → supervised auto-submit", status: "unlocked", when: "Unlocked today 08:02 · 4-eyes · L. Moretti",
    criteria: [
      { name: "GME order acceptance rate", target: "≥ 97% over 10 wks", actual: "98.4%", pct: 100 },
      { name: "Live capture vs naive baseline", target: "≥ +1.5pp · 10 consecutive wks", actual: "+1.9pp · 10/10 wks", pct: 100 },
      { name: "Limit breaches / kill-switch events", target: "0", actual: "0", pct: 100 },
    ],
  },
  {
    from: "L3", to: "L4", name: "Supervised → autonomous under policy", status: "in-progress", when: "Window opened today · projected Oct 2026",
    criteria: [
      { name: "Supervised wks with zero policy breach", target: "12 wks", actual: "0/12 wks · started today", pct: 2 },
      { name: "RL intraday challenger ≥ champion (shadow)", target: "8 consecutive wks", actual: "3/8 wks", pct: 38 },
      { name: "Risk-committee mandate for L4", target: "Board sign-off", actual: "On September board agenda", pct: 10 },
    ],
  },
];

// ---------- Alerts ----------
export interface Alert {
  id: string;
  sev: "critical" | "warning" | "info";
  time: string;
  title: string;
  detail: string;
  action: string;
  module: string;
}

export const ALERTS: Alert[] = [
  { id: "A-1", sev: "critical", time: "13:51", title: "Curtailment order · Trapani Sole II", detail: "Terna dispatch order BDE limits export to 27 MW until 16:00.", action: "AI: shift 14 MWh to Gela BESS charge window and revise MI-A2 offer.", module: "Grid" },
  { id: "A-2", sev: "warning", time: "13:22", title: "Forecast deviation > 8% · Benevento Eolico", detail: "Wind front arriving 90 min earlier than ECMWF run.", action: "AI: XBID sell 64 MWh H15–H17 at ≥ €66.80 to close position.", module: "Forecasting" },
  { id: "A-3", sev: "warning", time: "12:40", title: "Negative price risk · H13–H14 SUD", detail: "P(price < 0) = 11% on solar oversupply.", action: "AI: cap MGP offer at €0.00 and pre-arm curtailment on FiT assets.", module: "Market" },
  { id: "A-4", sev: "info", time: "12:05", title: "MGP gate closes in 22h", detail: "D+1 bid set drafted by Trading Agent, pending approval.", action: "Review 6 zone bids in Trading → Approvals.", module: "Trading" },
  { id: "A-5", sev: "info", time: "10:18", title: "Model drift watch · pun-price-v6", detail: "7-day MAE up 0.9 € vs baseline; gas volatility regime shift.", action: "MLOps: retraining scheduled tonight 02:00 with June data.", module: "MLOps" },
];

// ---------- Settlement ----------
export const SETTLEMENT_ROWS = [
  { period: "Jun 2026", scheduled: 41230, actual: 40510, imbalanceEUR: -38400, marketEUR: 3120000, ppaEUR: 861000, incentiveEUR: 402000, status: "reconciling" },
  { period: "May 2026", scheduled: 39880, actual: 39710, imbalanceEUR: -21900, marketEUR: 2874000, ppaEUR: 855000, incentiveEUR: 398000, status: "closed" },
  { period: "Apr 2026", scheduled: 36210, actual: 36540, imbalanceEUR: -45100, marketEUR: 2612000, ppaEUR: 849000, incentiveEUR: 405000, status: "closed" },
  { period: "Mar 2026", scheduled: 33400, actual: 33180, imbalanceEUR: -52800, marketEUR: 2431000, ppaEUR: 852000, incentiveEUR: 411000, status: "closed" },
];

// ---------- Governance ----------
export const USERS = [
  { name: "L. Moretti", role: "Administrator", email: "l.moretti@tagescapital.it", sso: "Entra ID", last: "2 min ago" },
  { name: "G. Ferraro", role: "Trader", email: "g.ferraro@tagescapital.it", sso: "Entra ID", last: "8 min ago" },
  { name: "S. Bianchi", role: "Portfolio Manager", email: "s.bianchi@tagescapital.it", sso: "Entra ID", last: "31 min ago" },
  { name: "M. Ricci", role: "Plant Operator", email: "m.ricci@tagescapital.it", sso: "Entra ID", last: "1 h ago" },
  { name: "A. Conti", role: "Analyst", email: "a.conti@tagescapital.it", sso: "Entra ID", last: "3 h ago" },
  { name: "First Boston Capital", role: "External Partner", email: "delivery@firstboston.capital", sso: "SAML", last: "Yesterday" },
];

export const AUDIT_LOG = [
  { ts: "13:58:12", user: "bess-agent (svc)", action: "schedule.commit queued", target: "BE-SIC-01", prev: "SOC plan v41", next: "SOC plan v42", approval: "policy L3" },
  { ts: "13:44:07", user: "g.ferraro", action: "bid.approve", target: "B-88421 · MI-A2 SICI", prev: "pending", next: "submitted", approval: "human" },
  { ts: "12:31:55", user: "trading-agent (svc)", action: "bid.draft", target: "6 × MGP zone bids", prev: "—", next: "draft v3", approval: "awaiting" },
  { ts: "11:30:41", user: "forecast-agent (svc)", action: "forecast.publish", target: "portfolio D-1", prev: "v2026-07-05.2", next: "v2026-07-05.3", approval: "auto" },
  { ts: "09:15:03", user: "settlement-agent (svc)", action: "ticket.raise", target: "PV-SIC-02 · Jun invoice", prev: "—", next: "FIN-2211", approval: "escalated" },
  { ts: "08:02:19", user: "l.moretti", action: "policy.update", target: "automation ceiling", prev: "L2", next: "L3", approval: "4-eyes" },
];

export const INTEGRATIONS = [
  { name: "Terna · MBR / dispatch orders", kind: "IEC 60870-5-104", state: "healthy", latency: "1.2 s" },
  { name: "GME · MGP / MI market results", kind: "REST + SFTP", state: "healthy", latency: "4 min" },
  { name: "SCADA fleet gateway", kind: "OPC-UA / MQTT", state: "healthy", latency: "900 ms" },
  { name: "ECMWF / ICON / Meteomatics", kind: "Weather APIs", state: "healthy", latency: "12 min" },
  { name: "SAP FI (settlement export)", kind: "IDoc", state: "degraded", latency: "38 min" },
  { name: "Azure Event Hubs backbone", kind: "Kafka protocol", state: "healthy", latency: "80 ms" },
];
