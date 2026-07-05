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
