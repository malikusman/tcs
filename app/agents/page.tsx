import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { AGENT_RUNS, ML_MODELS } from "@/lib/data/platform";
import { cls } from "@/lib/util";

const runTone = { success: "green", running: "teal", "waiting-approval": "amber", failed: "red" } as const;
const driftTone: Record<string, "green" | "amber" | "red" | "gray"> = { stable: "green", watch: "amber", drifting: "red", "—": "gray" };

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Platform · Agents & MLOps"
        title="Autonomous workflows, governed"
        desc="Agents plan, call tools and act — inside policy. Every step is logged; anything commercially significant waits for a human. Below them, the MLOps layer keeps models honest."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Agent runs today" value="47" foot="4 shown below" />
        <Stat label="Human approvals pending" value="1" tone="solar" delta="MGP bid set" />
        <Stat label="Models in production" value="4" foot="+1 staging challenger" />
        <Stat label="Drift alerts" value="1" tone="down" delta="imbalance-v3" foot="retrain queued 02:00" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {AGENT_RUNS.map((r) => (
          <Card key={r.id} title={r.agent} sub={r.goal} right={<Badge tone={runTone[r.status]}>{r.status}</Badge>} pad={false}>
            <div className="px-5 py-4">
              <div className="font-mono text-[11px] text-dim mb-3">{r.id} · started {r.started}</div>
              <ol className="relative space-y-3">
                {r.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cls(
                        "h-2.5 w-2.5 rounded-full mt-1",
                        s.state === "done" ? "bg-up" : s.state === "active" ? "bg-solar tick" : "bg-line"
                      )} />
                      {i < r.steps.length - 1 && <span className="w-px flex-1 bg-linesoft mt-1" />}
                    </div>
                    <div className="pb-1">
                      <span className="font-mono text-[12px] text-wind">{s.tool}</span>
                      <div className="text-[12.5px] text-muted leading-relaxed">{s.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Model registry" sub="MLflow-style lifecycle: challenger vs champion, drift detection, automated retraining" pad={false}>
        <TableWrap>
          <thead><tr><Th>Model</Th><Th>Task</Th><Th>Algorithm</Th><Th>Skill</Th><Th>Stage</Th><Th>Drift</Th></tr></thead>
          <tbody>
            {ML_MODELS.map((m) => (
              <tr key={m.name}>
                <Td><span className="font-mono text-[12.5px]">{m.name}</span></Td>
                <Td>{m.task}</Td>
                <Td><span className="text-[12.5px] text-muted">{m.algo}</span></Td>
                <Td><span className="font-mono tabular-nums text-[12.5px]">{m.nmae}</span></Td>
                <Td><Badge tone={m.stage === "Production" ? "teal" : "gray"}>{m.stage}</Badge></Td>
                <Td><Badge tone={driftTone[m.drift]}>{m.drift}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
