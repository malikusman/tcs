# CLAUDE.md — HELIOS project guide

Demo web app: AI renewable-energy commercialization platform ("HELIOS") built by First Boston Capital for Tages Capital SGR. Frontend-only; all data is static/deterministic mock data.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build` — production build (must stay green)
- `docker compose up --build` — production container

## Architecture
- Next.js 14 App Router, TypeScript strict, Tailwind, Recharts.
- `app/<route>/page.tsx` — one page per platform module. Server components by default; pages needing interactivity (`monitoring`, `copilot`) and all chart components are `"use client"`.
- `components/shell/` — Sidebar (desktop nav), MobileNav (phone top bar + drawer), MarketStrip (sticky ticker header). Add new routes to `NAV` in nav.ts (shared by both navs). On phones MarketStrip sticks below MobileNav (`top-[52px] md:top-0`).
- `components/ui/kit.tsx` — PageHeader, Card, Stat, Badge, Bar, Th/Td/TableWrap. Always reuse these.
- `components/paper/` — Live Paper Desk: useDeskFeed.ts (client hook — seeded micro-prices around priceDay(), agent BUY/SELL fill generation, session stats) shared by DeskTape (full tape on /paper) and DeskMini (Command Center widget). Client-only ticking after mount; SSR renders a static shell (same pattern as MarketStrip).
- `components/charts/charts.tsx` — themed Recharts wrappers. Add new charts here, keep the dark axis/tooltip theme constants.
- `lib/data/` — assets.ts (14-asset registry), series.ts (seeded time-series generators), platform.ts (bids, agents, alerts, settlement, users, audit, integrations).
- `lib/util.ts` — `mulberry32` seeded RNG (keeps SSG deterministic — never use `Math.random()` in server components), formatters, `cls`.
- `lib/gates.ts` — the ONE TIDE gate calendar (MGP 12:00 · MI-A1 15:00 · MI-A2 22:00 D-1 · MI-A3 10:00 D · clearing 13:15, Europe/Rome). MarketStrip and the Gate Room both use `nextGate()`; never duplicate gate times elsewhere. Run `npx tsx scripts/verify-gates.ts` (via Docker node) after touching it.
- `lib/agents/` — Gate Room engine: `datasource.ts` defines `GateDataSource` (SimulatedDataSource wraps the mock series; the pilot swaps in ENTSO-E/Open-Meteo implementations — new Gate Room code must not import mock series directly), `scripts.ts` builds PURE deterministic transcripts seeded by gate id (same gate → identical run; ~1 in 3 runs get a risk-rejection round; ~1 in 4 clearings lose).
- `lib/paper/store.ts` — client-side session ledger (localStorage `helios-paper-ledger`), consumed via `useSyncExternalStore`; SSR sees a stable empty snapshot.
- `components/gateroom/` — GateRoom (state: reveal loop, real sha-256 via crypto.subtle, clearing timers) + GateRail + Transcript. `components/paper/SignalLedger|PaperKpis` merge session signals into /paper.

## Conventions
- Design tokens live in `tailwind.config.ts` (ink/surface/raised/line, solar/wind/battery, up/down, fg/muted/dim) and fonts in `app/layout.tsx` (Space Grotesk display, Inter body, IBM Plex Mono for all numbers).
- Numbers are always `font-mono tabular-nums`. Eyebrow labels use `.eyebrow`.
- Demo narrative is frozen at Sun 05 Jul 2026, 14:00 CET (nowHour = 14 in series.ts). Keep new data consistent with it.
- Italian market domain, post-TIDE nomenclature: MGP day-ahead / MI-A1–A3 intraday auctions / XBID continuous / MBR (Balancing & Redispatching Market, ex-MSD); UVAT virtual units (ex-UVAM); PUN Index; 15-minute MTUs; zones NORD/CNOR/CSUD/SUD/SICI/SARD; Terna/GME/GSE/ARERA. Keep terminology accurate — never reintroduce MI-1/2/3, MSD or UVAM.
- Automation narrative: the L0–L4 ladder is gated by /paper (Paper Trading / Shadow Mode) graduation criteria — signals hash-locked pre-gate, cleared vs published GME results; L2 unlocked 27 Apr 2026, L3 unlocked 05 Jul 08:02 (see audit log). Keep trading, paper, and admin pages consistent with this story.

## Safe change checklist
1. `npm run build` after edits (asset detail page uses `generateStaticParams` — keep it in sync with ASSETS ids).
2. Charts must remain client components; don't import them into `lib/`.
3. Don't introduce `Math.random()`/`Date.now()` into server-rendered output (hydration mismatch); client-side animation belongs in `useEffect` like MarketStrip. Client-side randomness uses the seeded `mulberry32`, never `Math.random()`.
4. Honesty labeling: any live-looking data must carry its source label. The paper tape is labelled "simulated prices · all orders PAPER — nothing is submitted to any market"; the Gate Room carries "REPLAY MODE · simulated data" and its transcript footer; session ledger rows carry a "sim" tag. Never imply real market connectivity the demo doesn't have.
