"use client";

// Paper order book — a live depth-of-market ladder for one zone/MTU on XBID.
// Asks (sell) stack above, bids (buy) below, the spread sits in the middle.
// The mid marks off the SAME micro-price the tape uses (microPrice from the
// shared feed engine); resting depth is synthesised deterministically with the
// seeded mulberry32 (never Math.random) and refreshed client-only after mount so
// SSR output stays static. Nothing here is a real order — it is all PAPER.

import { useEffect, useRef, useState } from "react";
import { Card, Badge } from "@/components/ui/kit";
import { cls, mulberry32 } from "@/lib/util";
import { zoneCurves, microPrice, romeClock, mtuLabel, ZONES, DeskZone } from "./useDeskFeed";

const TICK = 0.15; // €/MWh price step between ladder levels
const LEVELS = 6; // resting levels shown per side

interface Level {
  price: number;
  size: number; // MWh resting at this level
  cum: number; // cumulative MWh from best price outward
}
interface Book {
  mid: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
  asks: Level[]; // index 0 = best (lowest) ask
  bids: Level[]; // index 0 = best (highest) bid
  maxCum: number; // for depth-bar scaling
}

// Pure given (mid, minute, zoneIdx, tick): same inputs → identical book.
function makeBook(mid: number, minute: number, zoneIdx: number, tick: number): Book {
  const r = mulberry32(((minute * 7919) ^ (tick * 2654435761) ^ (zoneIdx * 131)) >>> 0);
  const spread = Math.round((0.06 + r() * 0.22) * 100) / 100;
  const bestAsk = Math.round((mid + spread / 2) * 100) / 100;
  const bestBid = Math.round((mid - spread / 2) * 100) / 100;

  const asks: Level[] = [];
  const bids: Level[] = [];
  let cumA = 0;
  let cumB = 0;
  for (let i = 0; i < LEVELS; i++) {
    // Liquidity thickens a little away from the touch, plus per-level noise.
    const aSize = Math.round(16 + i * 18 + r() * 70);
    const bSize = Math.round(16 + i * 18 + r() * 70);
    cumA += aSize;
    cumB += bSize;
    asks.push({ price: Math.round((bestAsk + i * TICK) * 100) / 100, size: aSize, cum: cumA });
    bids.push({ price: Math.round((bestBid - i * TICK) * 100) / 100, size: bSize, cum: cumB });
  }
  return { mid: Math.round(mid * 100) / 100, spread, bestBid, bestAsk, asks, bids, maxCum: Math.max(cumA, cumB) };
}

function useOrderBook(zone: DeskZone) {
  const [book, setBook] = useState<Book | null>(null);
  const [mtu, setMtu] = useState<string>("");
  const tickRef = useRef(0);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const curves = zoneCurves();
    const zi = Math.max(0, ZONES.indexOf(zone));

    const rebuild = () => {
      if (!alive) return;
      const d = new Date();
      const { h, m } = romeClock(d);
      const minute = Math.floor(d.getTime() / 60000);
      const mid = microPrice(curves[zone], d, zi);
      setMtu(mtuLabel(h, m));
      setBook(makeBook(mid, minute, zi, tickRef.current++));
      const r = mulberry32((minute ^ (tickRef.current * 977)) >>> 0);
      timer = setTimeout(rebuild, 1800 + r() * 1600); // ~1.8–3.4 s refresh
    };
    rebuild();
    return () => { alive = false; clearTimeout(timer); };
  }, [zone]);

  return { book, mtu, ready: book !== null };
}

function DepthRow({ lvl, side, maxCum }: { lvl: Level; side: "ask" | "bid"; maxCum: number }) {
  const isAsk = side === "ask";
  return (
    <div className="relative flex items-center justify-between px-4 py-[5px] font-mono text-[12px]">
      <div
        className={cls("absolute inset-y-px right-0 rounded-l-sm", isAsk ? "bg-down/[0.13]" : "bg-up/[0.13]")}
        style={{ width: `${Math.max(3, (lvl.cum / maxCum) * 100)}%` }}
        aria-hidden
      />
      <span className={cls("relative tabular-nums font-semibold z-10", isAsk ? "text-down" : "text-up")}>
        €{lvl.price.toFixed(2)}
      </span>
      <span className="relative tabular-nums text-muted z-10">{lvl.size} MWh</span>
    </div>
  );
}

export default function OrderBook({ zone = "SUD" as DeskZone }: { zone?: DeskZone }) {
  const { book, mtu, ready } = useOrderBook(zone);

  return (
    <Card
      className="h-full"
      title="Paper order book"
      sub="Live depth-of-market ladder — resting bids (buy) and asks (sell) around the touch"
      pad={false}
      right={
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-up tick" /> LIVE
        </span>
      }
    >
      <div className="px-4 py-2.5 border-b border-linesoft flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11.5px]">
        <span className="text-fg font-semibold">{zone}</span>
        <span className="text-dim">{ready ? `${mtu} · XBID` : "XBID"}</span>
        <span className="ml-auto text-dim">
          MID <span className="text-fg tabular-nums">{ready ? `€${book!.mid.toFixed(2)}` : "—"}</span>
        </span>
        <span className="text-dim">
          SPREAD <span className="text-solar tabular-nums">{ready ? `€${book!.spread.toFixed(2)}` : "—"}</span>
        </span>
      </div>

      {ready ? (
        <div>
          {/* Asks: farthest at the top, best (lowest) ask just above the touch */}
          {[...book!.asks].reverse().map((l) => (
            <DepthRow key={`a${l.price}`} lvl={l} side="ask" maxCum={book!.maxCum} />
          ))}

          <div className="flex items-center justify-between px-4 py-1.5 border-y border-linesoft bg-raised/40 font-mono text-[11px]">
            <span className="text-down tabular-nums">ask €{book!.bestAsk.toFixed(2)}</span>
            <span className="text-dim tracking-[0.12em] uppercase text-[10px]">spread €{book!.spread.toFixed(2)}</span>
            <span className="text-up tabular-nums">bid €{book!.bestBid.toFixed(2)}</span>
          </div>

          {/* Bids: best (highest) bid just below the touch, deeper below */}
          {book!.bids.map((l) => (
            <DepthRow key={`b${l.price}`} lvl={l} side="bid" maxCum={book!.maxCum} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 font-mono text-[12px] text-dim">connecting to paper book…</div>
      )}

      <div className="px-4 py-2.5 border-t border-linesoft flex items-center justify-between text-[10.5px] font-mono text-dim leading-relaxed">
        <span>simulated depth · paper only — nothing is submitted to any market</span>
        <Badge tone="violet">PAPER</Badge>
      </div>
    </Card>
  );
}
