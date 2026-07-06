import { PageHeader, Card, Badge, Th, Td, TableWrap } from "@/components/ui/kit";
import { USERS, AUDIT_LOG, INTEGRATIONS } from "@/lib/data/platform";

const roleTone: Record<string, "amber" | "teal" | "violet" | "gray" | "green"> = {
  Administrator: "amber", Trader: "teal", "Portfolio Manager": "violet",
  "Plant Operator": "green", Analyst: "gray", "External Partner": "gray",
};

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow="Govern · Administration"
        title="Identity, audit & integrations"
        desc="RBAC with SSO, immutable audit of every human and agent action, and health of every external interface — the governance layer that makes L3 automation acceptable to a regulator."
      />

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card title="Users & roles" sub="Entra ID SSO · least-privilege RBAC" pad={false}>
          <TableWrap>
            <thead><tr><Th>User</Th><Th>Role</Th><Th>SSO</Th><Th>Last active</Th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.email}>
                  <Td>
                    <div className="font-medium">{u.name}</div>
                    <div className="font-mono text-[11px] text-dim">{u.email}</div>
                  </Td>
                  <Td><Badge tone={roleTone[u.role]}>{u.role}</Badge></Td>
                  <Td><span className="font-mono text-[12px] text-muted">{u.sso}</span></Td>
                  <Td><span className="font-mono text-[12px] text-muted">{u.last}</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>

        <Card title="Integration health" sub="Every external interface, its protocol and live latency" pad={false}>
          <TableWrap>
            <thead><tr><Th>Interface</Th><Th>Protocol</Th><Th>Latency</Th><Th>State</Th></tr></thead>
            <tbody>
              {INTEGRATIONS.map((i) => (
                <tr key={i.name}>
                  <Td><span className="text-[12.5px]">{i.name}</span></Td>
                  <Td><span className="font-mono text-[11.5px] text-muted">{i.kind}</span></Td>
                  <Td><span className="font-mono text-[12px] tabular-nums">{i.latency}</span></Td>
                  <Td><Badge tone={i.state === "healthy" ? "green" : "amber"}>{i.state}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>

      <Card className="mb-4" title="Compliance" sub="Regulatory obligations on the platform roadmap — shown as planned until delivered" pad={false}>
        <div className="divide-y divide-linesoft">
          {[
            { name: "REMIT transaction reporting", detail: "Order and trade reporting to ACER via RRM once live trading volumes flow through the platform.", phase: "planned · Phase 1" },
            { name: "GO / guarantees of origin management", detail: "GSE GO issuance tracking, transfer and cancellation against PPA and merchant volumes.", phase: "planned" },
            { name: "PPA contract lifecycle", detail: "Contract terms, shape/volume obligations and invoicing checks integrated into settlement.", phase: "planned" },
            { name: "MACSE / capacity market auctions", detail: "Auction participation workflow and obligation monitoring for the BESS fleet.", phase: "planned" },
          ].map((c) => (
            <div key={c.name} className="px-5 py-3.5 flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[12px] text-muted leading-relaxed">{c.detail}</div>
              </div>
              <Badge tone="gray">{c.phase}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Audit trail" sub="Immutable log — user or agent, previous value, new value, and the approval that authorized it" pad={false}>
        <TableWrap>
          <thead><tr><Th>Time (CET)</Th><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Before → After</Th><Th>Authorization</Th></tr></thead>
          <tbody>
            {AUDIT_LOG.map((l, i) => (
              <tr key={i}>
                <Td><span className="font-mono text-[12px] tabular-nums text-muted">{l.ts}</span></Td>
                <Td><span className={`font-mono text-[12px] ${l.user.includes("(svc)") ? "text-wind" : "text-fg"}`}>{l.user}</span></Td>
                <Td><span className="font-mono text-[12px]">{l.action}</span></Td>
                <Td><span className="text-[12.5px]">{l.target}</span></Td>
                <Td><span className="font-mono text-[11.5px] text-muted">{l.prev} → {l.next}</span></Td>
                <Td><Badge tone={l.approval === "human" || l.approval === "4-eyes" ? "amber" : l.approval === "awaiting" ? "gray" : l.approval === "escalated" ? "red" : "teal"}>{l.approval}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
