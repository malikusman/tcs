# HELIOS · Renewable Commercialization OS

AI-driven energy commercialization platform demo — engineered by **First Boston Capital** for **Tages Capital SGR**.

A single operational brain for a 740 MW Italian renewable portfolio: forecasting, market intelligence, automated bidding (MGP / MI / MSD), portfolio & BESS optimization, VPP aggregation, risk, settlement, an AI copilot, agentic workflows and full governance — all on realistic static demo data.

## Modules

| Area | Pages |
|---|---|
| Operate | Command Center · Asset Registry (+ digital twin detail) · Live Monitoring |
| Intelligence | Forecasting Engine (P10/P50/P90, weather quality, SHAP) · Market Intelligence |
| Trade & Optimize | Trading Engine (L0–L4 automation ladder) · Portfolio Optimizer · BESS Dispatch · VPP |
| Risk & Finance | Risk (Revenue-at-Risk) · Settlement & reconciliation |
| AI Platform | Copilot (RAG + tool calls) · Agents & MLOps (model registry, drift) |
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

- The "live" moment is frozen at Saturday 05 Jul 2026, 14:00 CET for a coherent demo narrative; tickers and telemetry animate client-side.
- The Market Strip countdown targets the real MGP day-ahead gate closure (12:00 CET, D-1).

---
© 2026 First Boston Capital — demo environment, static data, not for operational use.
