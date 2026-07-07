"use client";

// Signal ledger table: static seed rows plus session-created signals from the
// Gate Room, merged live via the paper store. Server-rendered output contains
// only the seed rows (store serverSnapshot is empty), so hydration is clean.

import { useSyncExternalStore } from "react";
import { Card, Badge, Th, Td, TableWrap } from "@/components/ui/kit";
import { PAPER_SIGNALS } from "@/lib/data/platform";
import { paperStore } from "@/lib/paper/store";
import { cls } from "@/lib/util";

function Delta({ v }: { v: number | null }) {
  if (v === null) return <span className="font-mono text-[12px] text-dim">awaiting clearing</span>;
  return (
    <span className={cls("font-mono tabular-nums", v >= 0 ? "text-up" : "text-down")}>
      {v >= 0 ? "+" : "−"}€{Math.abs(v).toLocaleString()}
    </span>
  );
}

export default function SignalLedger() {
  const session = useSyncExternalStore(paperStore.subscribe, paperStore.snapshot, paperStore.serverSnapshot);

  return (
    <Card
      className="mb-4"
      title="Signal ledger"
      sub="Timestamped agent recommendations, hash-locked before gate closure — the audit trail that rules out after-the-fact fitting"
      pad={false}
    >
      <TableWrap>
        <thead>
          <tr><Th>Signal</Th><Th>Locked (pre-gate)</Th><Th>Gate</Th><Th>Zone</Th><Th>Instruction · rationale</Th><Th>vs baseline</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {session.length > 0 && (
            <tr>
              <Td className="!py-1.5" />
              <td colSpan={6} className="px-4 py-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
                this session — Gate Room runs
              </td>
            </tr>
          )}
          {session.map((s) => (
            <tr key={s.id} className="row-flash">
              <Td><span className="font-mono text-[12px] text-muted">{s.id}</span></Td>
              <Td>
                <div className="font-mono text-[12px] tabular-nums">{s.locked}</div>
                <div className="font-mono text-[10.5px] text-dim">
                  sha256 {s.hash}
                  <span className="ml-1.5 px-1 py-px rounded border border-line bg-raised text-[9.5px] text-dim align-middle">sim</span>
                </div>
              </Td>
              <Td><span className="font-mono text-[12px] text-muted">{s.gate}</span></Td>
              <Td><span className="font-mono text-[12px]">{s.zone}</span></Td>
              <Td>
                <div className="text-[13px]">{s.instruction}</div>
                <div className="text-[12px] text-dim">{s.rationale}</div>
              </Td>
              <Td><Delta v={s.deltaEUR} /></Td>
              <Td><Badge tone={s.status === "settled" ? "teal" : "amber"}>{s.status}</Badge></Td>
            </tr>
          ))}
          {PAPER_SIGNALS.map((s) => (
            <tr key={s.id}>
              <Td><span className="font-mono text-[12px] text-muted">{s.id}</span></Td>
              <Td>
                <div className="font-mono text-[12px] tabular-nums">{s.locked}</div>
                <div className="font-mono text-[10.5px] text-dim">sha256 {s.hash}</div>
              </Td>
              <Td><span className="font-mono text-[12px] text-muted">{s.gate}</span></Td>
              <Td><span className="font-mono text-[12px]">{s.zone}</span></Td>
              <Td>
                <div className="text-[13px]">{s.instruction}</div>
                <div className="text-[12px] text-dim">{s.rationale}</div>
              </Td>
              <Td><Delta v={s.deltaEUR} /></Td>
              <Td><Badge tone={s.status === "settled" ? "teal" : "amber"}>{s.status}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </Card>
  );
}
