// Tiny client-side ledger store for session-created paper signals (Gate Room runs).
// localStorage-backed under "helios-paper-ledger"; safe on the server (returns a
// stable empty snapshot, never touches window). Consumed via useSyncExternalStore.

export interface SessionSignal {
  id: string; // SIG-<n>
  gateId: string; // e.g. "MGP-20260707" — seeds the deterministic clearing outcome
  locked: string; // display timestamp, e.g. "07 Jul 11:38:52"
  lockedAtMs: number;
  gate: string; // display gate label, e.g. "MGP 08 Jul · 12:00"
  market: "MGP" | "MI-A1" | "MI-A2" | "MI-A3" | "XBID" | "MBR";
  zone: string;
  instruction: string;
  rationale: string;
  hash: string; // real sha-256 (short form) over the canonical bid-set JSON
  deltaEUR: number | null;
  status: "locked" | "settled";
  sim: true;
}

const KEY = "helios-paper-ledger";
const EMPTY: SessionSignal[] = [];

let cache: SessionSignal[] | null = null;
const listeners = new Set<() => void>();

function load(): SessionSignal[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache === null) {
    try {
      cache = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as SessionSignal[];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache ?? []));
  } catch {
    /* storage full/blocked — keep in-memory state */
  }
}

function emit() {
  listeners.forEach((cb) => cb());
}

export const paperStore = {
  snapshot(): SessionSignal[] {
    return load();
  },
  serverSnapshot(): SessionSignal[] {
    return EMPTY;
  },
  subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  nextId(): string {
    return `SIG-${2852 + load().length}`;
  },
  add(sig: SessionSignal) {
    cache = [sig, ...load()];
    persist();
    emit();
  },
  settle(id: string, deltaEUR: number) {
    cache = load().map((s) => (s.id === id ? { ...s, deltaEUR, status: "settled" as const } : s));
    persist();
    emit();
  },
  pendingOlderThan(ms: number, now: number): SessionSignal[] {
    return load().filter((s) => s.status === "locked" && now - s.lockedAtMs > ms);
  },
};
