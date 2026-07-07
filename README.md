# HELIOS · Renewable Commercialization OS

AI-driven energy commercialization platform demo — engineered by **First Boston Capital** for **Tages Capital SGR**.

A single operational brain for a 740 MW Italian renewable portfolio: forecasting, market intelligence, automated bidding (MGP / MI-A auctions / XBID continuous / MBR), paper-trading graduation gates, portfolio & BESS optimization, VPP aggregation, risk, settlement, an AI copilot, agentic workflows and full governance — all on realistic static demo data.

## Modules

| Area | Pages |
|---|---|
| Operate | Command Center · Asset Registry (+ digital twin detail) · Live Monitoring |
| Intelligence | Forecasting Engine (P10/P50/P90, weather quality, SHAP) · Market Intelligence |
| Trade & Optimize | Trading Engine (L0–L4 automation ladder) · Paper Trading / Shadow Mode (`/paper`) · Portfolio Optimizer · BESS Dispatch · VPP |
| Risk & Finance | Risk (Revenue-at-Risk) · Settlement & reconciliation |
| AI Platform | Copilot (RAG + tool calls) · Gate Room (`/agents-live`, simulated live agent gate cycle) · Agents & MLOps (model registry, drift) |
| Govern | Alerts with AI actions · Administration (RBAC, audit, integrations) |

## Run locally (dev)

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Run with Docker

```bash
docker compose up --build
# open http://localhost:3000
```

## Stack

Next.js 14 (App Router, standalone output) · React 18 · TypeScript · Tailwind CSS · Recharts · Lucide icons. No backend required — all data is deterministic mock data in `lib/data/`.

## Notes

- The "live" moment is frozen at Sunday 05 Jul 2026, 14:00 CET for a coherent demo narrative; tickers and telemetry animate client-side.
- The Market Strip countdown targets the real MGP day-ahead gate closure (12:00 CET, D-1).
- Market nomenclature is post-TIDE: MGP day-ahead, MI-A1/A2/A3 intraday auctions, XBID continuous intraday, MBR (Balancing & Redispatching Market) for Terna dispatching services, all on 15-minute MTUs.
- Automation is earned, not switched on: the `/paper` module shows the shadow-mode graduation gates — signals hash-locked before each market gate, cleared against published GME results, with L2 unlocked 27 Apr and L3 unlocked 05 Jul 08:02 in the demo narrative.
- The Live Paper Desk (top of `/paper`, plus a compact widget on the Command Center) shows agents buying and selling paper electricity in real time. It animates client-side around the same deterministic price curve as the rest of the demo and is honestly labelled: prices simulated, every order PAPER, nothing submitted to any market.
- The Gate Room (`/agents-live`) counts down to the real TIDE gates on the actual Rome clock (calendar in `lib/gates.ts`, shared with the Market Strip). "Simulate next gate" replays a deterministic multi-agent deliberation (Forecast → Trading → Risk, with a risk-rejection round in ~1 of 3 runs), hash-locks the bid set with a genuine browser-computed sha-256, and clears it into the `/paper` signal ledger (localStorage store in `lib/paper/store.ts`, session rows tagged "sim"). Labelled REPLAY MODE throughout. The pilot swaps `SimulatedDataSource` (`lib/agents/datasource.ts`) for live ENTSO-E/Open-Meteo sources and real Claude-powered agents behind the same `GateDataSource` interface.

---
© 2026 First Boston Capital — demo environment, static data, not for operational use.
