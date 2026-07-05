import { PageHeader, Card, Badge } from "@/components/ui/kit";
import { ALERTS } from "@/lib/data/platform";
import { BellRing, MessageSquare, Smartphone, Mail } from "lucide-react";

export default function AlertsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Govern · Alerts & Events"
        title="Signal, not noise"
        desc="Every alert arrives AI-triaged with a recommended action and a one-click path to execute it. Routing: Teams for the desk, SMS for critical grid events, mobile push for operators."
        right={
          <div className="flex items-center gap-2 text-dim">
            <MessageSquare className="h-4 w-4" /><Smartphone className="h-4 w-4" /><Mail className="h-4 w-4" />
            <span className="font-mono text-[11px]">3 channels active</span>
          </div>
        }
      />

      <div className="space-y-3">
        {ALERTS.map((a) => (
          <Card key={a.id} className={a.sev === "critical" ? "border-down/40" : undefined} pad={false}>
            <div className="px-5 py-4 flex flex-wrap gap-4 items-start">
              <div className={`mt-0.5 h-9 w-9 rounded-lg grid place-items-center shrink-0 ${
                a.sev === "critical" ? "bg-down/15 text-down" : a.sev === "warning" ? "bg-solar/15 text-solar" : "bg-raised text-muted"}`}>
                <BellRing className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge tone={a.sev === "critical" ? "red" : a.sev === "warning" ? "amber" : "gray"}>{a.sev}</Badge>
                  <Badge tone="gray">{a.module}</Badge>
                  <span className="font-mono text-[11px] text-dim">{a.time} CET · today</span>
                </div>
                <div className="text-[14px] font-medium">{a.title}</div>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">{a.detail}</p>
                <div className="mt-2.5 flex items-start gap-2 text-[13px] rounded-lg bg-ink border border-linesoft px-3.5 py-2.5">
                  <span className="font-mono text-[10.5px] tracking-widest text-solar mt-0.5 shrink-0">AI ACTION</span>
                  <span className="text-fg/90">{a.action}</span>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                <button className="px-3.5 py-2 rounded-lg bg-solar text-[#0A1220] text-[12.5px] font-semibold hover:brightness-110 transition">Execute</button>
                <button className="px-3.5 py-2 rounded-lg border border-line text-[12.5px] text-muted hover:text-fg transition">Dismiss</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
