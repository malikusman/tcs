// Assertion script for lib/gates.ts and the deterministic Gate Room transcripts.
// Run: npx -y tsx scripts/verify-gates.ts   (CI-less repo: run manually before commit)

import { gateCalendar, nextGate, msUntil, fmtCountdown } from "../lib/gates";
import { buildRun, seedFromId, clearingOutcome } from "../lib/agents/scripts";
import { SimulatedDataSource } from "../lib/agents/datasource";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (!cond) { failures++; console.error(`✗ ${name} ${detail}`); }
  else console.log(`✓ ${name}`);
}

// July = CEST = UTC+2. Build UTC instants that map to known Rome wall-clock times.
const romeUTC = (h: number, m: number, s = 0) => new Date(Date.UTC(2026, 6, 7, h - 2, m, s));

// -- countdown / boundary checks --------------------------------------------
{
  const now = romeUTC(23, 59); // Rome 23:59 → next auction is MI-A3 10:00 tomorrow
  const g = nextGate(now, { auctionsOnly: true });
  check("23:59 → next auction MI-A3", g.name === "MI-A3", `got ${g.name}`);
  check("23:59 → MI-A3 is tomorrow (~10h01m)", Math.abs(msUntil(g, now) - (10 * 60 + 1) * 60000) < 2000, `${fmtCountdown(msUntil(g, now))}`);
  check("23:59 → gate id is tomorrow's date", g.id === "MI-A3-20260708", g.id);
}
{
  const now = romeUTC(13, 10); // just before the 13:15 clearing
  check("13:10 → next event is CLEARING", nextGate(now).name === "CLEARING");
  check("13:10 auctionsOnly skips clearing → MI-A1", nextGate(now, { auctionsOnly: true }).name === "MI-A1");
}
{
  const now = romeUTC(13, 16); // just after clearing
  check("13:16 → next event MI-A1 15:00", nextGate(now).name === "MI-A1");
}
{
  const now = romeUTC(0, 1); // just after midnight
  const g = nextGate(now);
  check("00:01 → next event MI-A3 today", g.name === "MI-A3" && g.id === "MI-A3-20260707", g.id);
  check("00:01 → countdown ≈ 09:59:00", fmtCountdown(msUntil(g, now)) === "09:59:00", fmtCountdown(msUntil(g, now)));
}
{
  const now = romeUTC(11, 59, 30);
  const g = nextGate(now, { name: "MGP" }); // MarketStrip path
  check("11:59:30 → MGP gate in 00:00:30", fmtCountdown(msUntil(g, now)) === "00:00:30", fmtCountdown(msUntil(g, now)));
  const after = romeUTC(12, 0, 1);
  const g2 = nextGate(after, { name: "MGP" });
  check("12:00:01 → MGP gate rolls to tomorrow", g2.id === "MGP-20260708", g2.id);
}
{
  const cal = gateCalendar(romeUTC(9, 0));
  check("calendar has 5 entries", cal.length === 5);
  check("calendar order MI-A3 → MGP → CLEARING → MI-A1 → MI-A2",
    cal.map((g) => g.name).join(",") === "MI-A3,MGP,CLEARING,MI-A1,MI-A2");
}

// -- determinism checks ------------------------------------------------------
{
  const ds = new SimulatedDataSource();
  const gate = nextGate(romeUTC(9, 0), { auctionsOnly: true }); // MI-A3-20260707
  const a = JSON.stringify(buildRun(gate, ds));
  const b = JSON.stringify(buildRun(gate, ds));
  check("same gate id → identical transcript", a === b);

  const gate2 = nextGate(romeUTC(11, 0), { auctionsOnly: true }); // MGP-20260707
  const c = JSON.stringify(buildRun(gate2, ds));
  check("different gate → different transcript", a !== c);

  // rejection cadence: deterministic by gate id, roughly 1 in 3 across many gates
  let rejects = 0;
  const N = 60;
  for (let i = 0; i < N; i++) {
    if (seedFromId(`MGP-2026${String(100 + i)}`) % 3 === 0) rejects++;
  }
  check("rejection rate ≈ 1/3 across 60 gate ids", rejects >= 12 && rejects <= 28, `${rejects}/60`);

  // clearing outcomes: ~1 in 4 losses, deterministic — sample realistic gate ids
  let losses = 0;
  let total = 0;
  for (const name of ["MGP", "MI-A1", "MI-A2", "MI-A3"]) {
    for (let d = 1; d <= 15; d++) {
      total++;
      if (clearingOutcome(`${name}-202607${String(d).padStart(2, "0")}`).deltaEUR < 0) losses++;
    }
  }
  check(`loss rate ≈ 1/4 across ${total} gate ids`, losses >= 8 && losses <= 24, `${losses}/${total}`);
  check("clearingOutcome deterministic", clearingOutcome("MGP-20260707").deltaEUR === clearingOutcome("MGP-20260707").deltaEUR);
}

if (failures > 0) { console.error(`\n${failures} check(s) FAILED`); process.exit(1); }
console.log("\nall gate checks passed");
