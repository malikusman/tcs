"use client";

// Shared engine for the Live Paper Desk. Client-only: prices are the deterministic
// demo curve from priceDay(), micro-movement and fills use the seeded mulberry32 RNG
// (never Math.random), and everything starts ticking only after mount so SSR output
// stays static. All fills are PAPER — nothing is, or could be, submitted anywhere.

import { useEffect, useRef, useState } from "react";
import { mulberry32 } from "@/lib/util";
import { priceDay } from "@/lib/data/series";

export type DeskZone = "SUD" | "SICI" | "SARD" | "CNOR";
export type DeskMarket = "XBID" | "MI-A2" | "MI-A3";

export interface PaperFill {
  id: number;
  time: string; // CET, HH:MM:SS
  agent: "BESS Agent" | "Intraday Agent" | "desk · manual";
  side: "BUY" | "SELL";
  mwh: number;
  zone: DeskZone;
  mtu: string; // 15-min MTU, e.g. "14:15–14:30"
  price: number; // €/MWh
  market: DeskMarket;
}

export interface DeskStats {
  pnlEUR: number; // session paper P&L, open positions marked to latest micro-price
  boughtMWh: number;
  soldMWh: number;
  buyCount: number;
  sellCount: number;
}

export const ZONES: DeskZone[] = ["SUD", "SICI", "SARD", "CNOR"];
const ZONE_WEIGHT = [0.35, 0.3, 0.2, 0.15];

// Hourly zone curves for "today", derived from the same seeded series the rest of
// the app renders — the tape stays consistent with the Market Intelligence page.
// Exported so the Paper order book ladder reuses the exact same price surface.
export function zoneCurves(): Record<DeskZone, number[]> {
  const day = priceDay();
  return {
    SUD: day.map((p) => p.sud as number),
    SICI: day.map((p) => p.sici as number),
    SARD: day.map((p) => p.sard as number),
    CNOR: day.map((p) => (p.pun as number) - 1.2),
  };
}

function pct(curve: number[], q: number) {
  const s = [...curve].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

export function romeClock(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour") % 24, m: get("minute"), s: get("second") };
}

function two(n: number) {
  return String(n).padStart(2, "0");
}

export function mtuLabel(h: number, m: number) {
  const q = Math.floor(m / 15);
  const endM = (q + 1) * 15;
  const end = endM === 60 ? `${two((h + 1) % 24)}:00` : `${two(h)}:${two(endM)}`;
  return `${two(h)}:${two(q * 15)}–${end}`;
}

// Anchor on the current 15-min MTU (linear interpolation between the hourly points),
// then add a mean-reverting wiggle of ±1.5% that is stable within a minute.
// Exported so the order book ladder marks its mid off the same micro-price.
export function microPrice(curve: number[], d: Date, zoneIdx: number) {
  const { h, m } = romeClock(d);
  const frac = m / 60;
  const anchor = curve[h] * (1 - frac) + curve[(h + 1) % 24] * frac;
  const r = mulberry32((Math.floor(d.getTime() / 60000) * 7919 + zoneIdx * 131) >>> 0);
  const wiggle = (r() + r() - 1) * 0.015; // triangular around 0, ±1.5%
  return anchor * (1 + wiggle);
}

function makeFill(d: Date, id: number, curves: Record<DeskZone, number[]>): PaperFill {
  const r = mulberry32(((d.getTime() & 0x7fffffff) ^ (id * 2654435761)) >>> 0);
  const { h, m, s } = romeClock(d);

  let zi = 0;
  const zr = r();
  let acc = 0;
  for (let i = 0; i < ZONES.length; i++) {
    acc += ZONE_WEIGHT[i];
    if (zr <= acc) { zi = i; break; }
  }
  const zone = ZONES[zi];
  const curve = curves[zone];
  const micro = microPrice(curve, d, zi);

  // Agent heuristics — the desk trades BOTH directions in every price regime, so
  // the tape is never one-sided (the old logic keyed side purely off the day-wide
  // percentile, which printed all-BUY through the cheap solar belly and all-SELL in
  // the evening peak). Price still tilts the balance: BESS charging dominates when
  // cheap, discharging when rich, but the intraday book always works the other side.
  const cheap = micro < pct(curve, 0.4);
  const rich = micro > pct(curve, 0.62);
  const sr = r();
  let side: PaperFill["side"];
  if (cheap) side = sr < 0.64 ? "BUY" : "SELL"; // charge, but still sell surplus
  else if (rich) side = sr < 0.64 ? "SELL" : "BUY"; // discharge, but still buy back
  else side = sr < 0.5 ? "BUY" : "SELL"; // balanced through the mid-band

  // BESS takes the price-extreme direction (charge cheap / discharge rich); the
  // Intraday Agent works everything else (closing positions, lifting/hitting).
  let agent: PaperFill["agent"];
  let mwh: number;
  if ((cheap && side === "BUY") || (rich && side === "SELL")) {
    agent = "BESS Agent"; mwh = Math.round((2 + r() * 6) * 10) / 10;
  } else {
    agent = "Intraday Agent"; mwh = Math.round(10 + r() * 30);
  }
  if (r() < 1 / 7) agent = "desk · manual"; // human-in-the-loop fills

  // Continuous fills print as XBID; within 45 min of an MI-A gate some fills tag the auction.
  let market: DeskMarket = "XBID";
  const mins = h * 60 + m;
  if (mins >= 12 * 60 + 45 && mins < 13 * 60 + 30 && r() < 0.5) market = "MI-A2"; // gate 13:30
  else if (mins >= 13 * 60 + 45 && mins < 14 * 60 + 30 && r() < 0.5) market = "MI-A3"; // gate 14:30

  const spread = 0.05 + r() * 0.35;
  const price = Math.round((micro + (side === "SELL" ? spread : -spread)) * 100) / 100;

  // Deliver 0–4 MTUs ahead so the tape shows a spread of delivery windows, not
  // all the same 15-min block.
  const delMin = h * 60 + Math.floor(m / 15) * 15 + Math.floor(r() * 5) * 15;
  const dh = Math.floor(delMin / 60) % 24;
  const dm = delMin % 60;

  return { id, time: `${two(h)}:${two(m)}:${two(s)}`, agent, side, mwh, zone, mtu: mtuLabel(dh, dm), price, market };
}

export function useDeskFeed(maxRows = 12) {
  const [fills, setFills] = useState<PaperFill[]>([]);
  const [, setTick] = useState(0); // re-render so marks/P&L track the micro-price
  const curvesRef = useRef<Record<DeskZone, number[]> | null>(null);
  const sessionRef = useRef({ cash: 0, bought: 0, sold: 0, buys: 0, sells: 0, net: { SUD: 0, SICI: 0, SARD: 0, CNOR: 0 } as Record<DeskZone, number> });
  const idRef = useRef(1);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const curves = zoneCurves();
    curvesRef.current = curves;

    const book = (f: PaperFill) => {
      const st = sessionRef.current;
      if (f.side === "BUY") { st.cash -= f.mwh * f.price; st.bought += f.mwh; st.buys += 1; st.net[f.zone] += f.mwh; }
      else { st.cash += f.mwh * f.price; st.sold += f.mwh; st.sells += 1; st.net[f.zone] -= f.mwh; }
    };

    // Seed the tape so it is never empty on first paint after mount.
    sessionRef.current = { cash: 0, bought: 0, sold: 0, buys: 0, sells: 0, net: { SUD: 0, SICI: 0, SARD: 0, CNOR: 0 } };
    const now = Date.now();
    const seeds = [52000, 37000, 21000, 8000].map((ago) => makeFill(new Date(now - ago), idRef.current++, curves));
    seeds.forEach(book);
    setFills([...seeds].reverse());

    const schedule = () => {
      const r = mulberry32((Date.now() ^ (idRef.current * 977)) >>> 0);
      timer = setTimeout(() => {
        if (!alive) return;
        const f = makeFill(new Date(), idRef.current++, curves);
        book(f);
        setFills((prev) => [f, ...prev].slice(0, maxRows));
        schedule();
      }, 4000 + r() * 5000); // every 4–9 s
    };
    schedule();
    const mark = setInterval(() => alive && setTick((t) => t + 1), 15000);
    return () => { alive = false; clearTimeout(timer); clearInterval(mark); };
  }, [maxRows]);

  const st = sessionRef.current;
  let pnlEUR = st.cash;
  if (curvesRef.current) {
    const d = new Date();
    ZONES.forEach((z, i) => { pnlEUR += st.net[z] * microPrice(curvesRef.current![z], d, i); });
  }
  const stats: DeskStats = { pnlEUR: Math.round(pnlEUR), boughtMWh: Math.round(st.bought * 10) / 10, soldMWh: Math.round(st.sold * 10) / 10, buyCount: st.buys, sellCount: st.sells };

  return { fills, stats, ready: fills.length > 0 };
}
