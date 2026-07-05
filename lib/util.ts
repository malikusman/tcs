// Deterministic PRNG so mock data is stable across renders/builds
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = (seed: number) => mulberry32(seed);

export function fmtMW(v: number, digits = 1) {
  return `${v.toFixed(digits)} MW`;
}
export function fmtMWh(v: number, digits = 0) {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: digits })} MWh`;
}
export function fmtEUR(v: number, digits = 0) {
  return `€${v.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
}
export function fmtPct(v: number, digits = 1) {
  return `${v.toFixed(digits)}%`;
}
export function fmtPrice(v: number) {
  return `€${v.toFixed(2)}`;
}
export function hh(i: number) {
  return `${String(i).padStart(2, "0")}:00`;
}
export function cls(...s: (string | false | undefined | null)[]) {
  return s.filter(Boolean).join(" ");
}
