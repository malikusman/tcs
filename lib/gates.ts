// Single source of truth for the TIDE gate calendar (Europe/Rome wall clock).
// Used by MarketStrip (MGP countdown) and the Gate Room (/agents-live).
//
// All Date values returned here are "Rome pseudo-dates": the Rome wall-clock time
// re-expressed in the runtime's local Date. Compare them only against romeNow(now),
// never against raw Date.now().

export type GateName = "MGP" | "MI-A1" | "MI-A2" | "MI-A3" | "CLEARING";

export interface Gate {
  id: string; // e.g. "MGP-20260707" — stable per gate occurrence, used to seed deterministic runs
  name: GateName;
  kind: "auction" | "clearing";
  label: string;
  at: Date; // Rome pseudo-date of the gate closure / publication
}

const SCHEDULE: { name: GateName; kind: Gate["kind"]; h: number; m: number; label: string }[] = [
  { name: "MI-A3", kind: "auction", h: 10, m: 0, label: "MI-A3 auction · delivery today" },
  { name: "MGP", kind: "auction", h: 12, m: 0, label: "MGP day-ahead · delivery D+1" },
  { name: "CLEARING", kind: "clearing", h: 13, m: 15, label: "GME results published · clearing" },
  { name: "MI-A1", kind: "auction", h: 15, m: 0, label: "MI-A1 auction · delivery D+1" },
  { name: "MI-A2", kind: "auction", h: 22, m: 0, label: "MI-A2 auction · delivery D+1" },
];

export function romeNow(now: Date): Date {
  return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
}

function dayId(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// The gate list for the Rome calendar day `offsetDays` after `now`'s Rome day.
export function gateCalendar(now: Date, offsetDays = 0): Gate[] {
  const rome = romeNow(now);
  rome.setDate(rome.getDate() + offsetDays);
  return SCHEDULE.map((s) => {
    const at = new Date(rome);
    at.setHours(s.h, s.m, 0, 0);
    return { id: `${s.name}-${dayId(rome)}`, name: s.name, kind: s.kind, label: s.label, at };
  });
}

// Next upcoming gate (strictly after now). auctionsOnly skips the 13:15 clearing
// event; name restricts to one gate type (MarketStrip uses name: "MGP").
export function nextGate(now: Date, opts?: { auctionsOnly?: boolean; name?: GateName }): Gate {
  const rome = romeNow(now);
  const candidates = [...gateCalendar(now, 0), ...gateCalendar(now, 1)]
    .filter((g) => (opts?.auctionsOnly ? g.kind === "auction" : true))
    .filter((g) => (opts?.name ? g.name === opts.name : true))
    .filter((g) => g.at.getTime() > rome.getTime());
  return candidates[0];
}

export function msUntil(gate: Gate, now: Date): number {
  return gate.at.getTime() - romeNow(now).getTime();
}

export function fmtCountdown(ms: number): string {
  const t = Math.max(0, ms);
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function fmtMmSs(ms: number): string {
  const t = Math.max(0, ms);
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
