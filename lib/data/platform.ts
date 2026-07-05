// ---------- Trading ----------
export interface Bid {
  id: string;
  market: "MGP" | "MI-1" | "MI-2" | "MI-3" | "MSD";
  zone: string;
  hours: string;
  volumeMWh: number;
  priceEUR: number;
  status: "accepted" | "pending" | "rejected" | "draft";
  source: "AI · auto" | "AI · approved" | "Manual";
  asset: string;
}

export const BIDS: Bid[] = [
  { id: "B-88412", market: "MGP", zone: "SUD", hours: "H09–H16", volumeMWh: 2140, priceEUR: 0.0, status: "accepted", source: "AI · auto", asset: "Portfolio · SUD" },
  { id: "B-88413", market: "MGP", zone: "SICI", hours: "H10–H15", volumeMWh: 1260, priceEUR: 0.0, status: "accepted", source: "AI · auto", asset: "Portfolio · SICI" },
  { id: "B-88414", market: "MGP", zone: "SARD", hours: "H09–H17", volumeMWh: 840, priceEUR: 0.0, status: "accepted", source: "AI · approved", asset: "Portfolio · SARD" },
  { id: "B-88420", market: "MI-1", zone: "SUD", hours: "H14–H16", volumeMWh: -180, priceEUR: 71.4, status: "accepted", source: "AI · auto", asset: "WD-BAS-01" },
  { id: "B-88421", market: "MI-2", zone: "SICI", hours: "H18–H20", volumeMWh: 96, priceEUR: 128.0, status: "pending", source: "AI · approved", asset: "BE-SIC-01" },
  { id: "B-88422", market: "MSD", zone: "SICI", hours: "H00–H24", volumeMWh: 30, priceEUR: 41.2, status: "accepted", source: "Manual", asset: "BE-SIC-01" },
  { id: "B-88423", market: "MI-2", zone: "CNOR", hours: "H15–H17", volumeMWh: -64, priceEUR: 66.8, status: "draft", source: "AI · approved", asset: "PV-LAZ-01" },
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
    goal: "Re-optimize Gela BESS after MI-1 clearing",
    status: "running",
    started: "13:58 CET",
    steps: [
      { tool: "market.results", detail: "MI-1 cleared · SICI H18 at €131.20", state: "done" },
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
  { id: "A-1", sev: "critical", time: "13:51", title: "Curtailment order · Trapani Sole II", detail: "Terna dispatch order BDE limits export to 27 MW until 16:00.", action: "AI: shift 14 MWh to Gela BESS charge window and revise MI-2 offer.", module: "Grid" },
  { id: "A-2", sev: "warning", time: "13:22", title: "Forecast deviation > 8% · Benevento Eolico", detail: "Wind front arriving 90 min earlier than ECMWF run.", action: "AI: MI-2 sell 64 MWh H15–H17 at ≥ €66.80 to close position.", module: "Forecasting" },
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
  { ts: "13:44:07", user: "g.ferraro", action: "bid.approve", target: "B-88421 · MI-2 SICI", prev: "pending", next: "submitted", approval: "human" },
  { ts: "12:31:55", user: "trading-agent (svc)", action: "bid.draft", target: "6 × MGP zone bids", prev: "—", next: "draft v3", approval: "awaiting" },
  { ts: "11:30:41", user: "forecast-agent (svc)", action: "forecast.publish", target: "portfolio D-1", prev: "v2026-07-05.2", next: "v2026-07-05.3", approval: "auto" },
  { ts: "09:15:03", user: "settlement-agent (svc)", action: "ticket.raise", target: "PV-SIC-02 · Jun invoice", prev: "—", next: "FIN-2211", approval: "escalated" },
  { ts: "08:02:19", user: "l.moretti", action: "policy.update", target: "automation ceiling", prev: "L2", next: "L3", approval: "4-eyes" },
];

export const INTEGRATIONS = [
  { name: "Terna · MSD / dispatch orders", kind: "IEC 60870-5-104", state: "healthy", latency: "1.2 s" },
  { name: "GME · MGP / MI market results", kind: "REST + SFTP", state: "healthy", latency: "4 min" },
  { name: "SCADA fleet gateway", kind: "OPC-UA / MQTT", state: "healthy", latency: "900 ms" },
  { name: "ECMWF / ICON / Meteomatics", kind: "Weather APIs", state: "healthy", latency: "12 min" },
  { name: "SAP FI (settlement export)", kind: "IDoc", state: "degraded", latency: "38 min" },
  { name: "Azure Event Hubs backbone", kind: "Kafka protocol", state: "healthy", latency: "80 ms" },
];
