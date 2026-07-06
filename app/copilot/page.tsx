"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader, Badge } from "@/components/ui/kit";
import { Send, Sparkles, Wrench, Check } from "lucide-react";
import { cls } from "@/lib/util";

interface Msg {
  role: "user" | "assistant";
  text: string;
  tools?: { name: string; detail: string }[];
}

const SCRIPTS: { q: string; tools: { name: string; detail: string }[]; a: string }[] = [
  {
    q: "Why is tomorrow's forecast lower than today?",
    tools: [
      { name: "forecast.compare", detail: "D vs D+1 · portfolio P50" },
      { name: "weather.attribution", detail: "ECMWF 12z vs 00z delta" },
      { name: "shap.decompose", detail: "driver contributions" },
    ],
    a: "Tomorrow's P50 is 4,120 MWh, −7.8% vs today. Attribution: a cloud front over Puglia removes 210 MWh from Cerignola and Foggia between H11–H16 (−5.1%), and the Basilicata wind ramp fades after H09 (−2.9%). Sicily is unchanged. Confidence band widens to ±11% in the affected hours — the Trading Agent has already shaded SUD offers to P40 for H13–H15.",
  },
  {
    q: "Should we shift more BESS energy to the evening peak?",
    tools: [
      { name: "price.forecast", detail: "H18–H22 spread scenarios" },
      { name: "twin.simulate", detail: "3 dispatch plans · degradation priced" },
      { name: "optimizer.milp", detail: "re-solve with relaxed reserve" },
    ],
    a: "Marginally, yes. Releasing 8 MWh of the MBR reserve on Gela BESS toward the H19–H21 peak adds €640 expected revenue at 74% confidence, but drops reserve margin below the 12 MWh policy floor. Within current policy the answer is no; if you approve a one-day exception (requires L3 override + 4-eyes), I can commit the revised plan. Recommended: keep current plan, revisit after MI-A2 clears at 17:30.",
  },
  {
    q: "Show plants with forecast errors above 4% and tell me why",
    tools: [
      { name: "kpi.query", detail: "nMAE by asset · 7 days" },
      { name: "rag.search", detail: "maintenance log · SCADA events" },
    ],
    a: "Three assets exceed 4% nMAE: Benevento Eolico (6.2%) — complex terrain turbulence, the ICON-EU downscaling underperforms there and I have proposed adding a Meteomatics micro-site feed; Caltanissetta Vento (7.0%) — currently in maintenance so telemetry-driven correction is off; Matera Ridge (4.1%) — soiling drift since the 21 Jun wash, a cleaning is scheduled Tuesday which should recover ~1.5pp.",
  },
];

const SUGGESTIONS = SCRIPTS.map((s) => s.q);

export default function CopilotPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "I'm HELIOS Copilot — grounded in your asset registry, forecasts, market data, grid codes and trading procedures via RAG. Ask me about forecasts, positions, optimizer decisions or regulations. Try a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  function ask(q: string) {
    if (!q.trim() || busy) return;
    const script = SCRIPTS.find((s) => s.q === q) ?? {
      q,
      tools: [{ name: "rag.search", detail: "enterprise knowledge base" }, { name: "kpi.query", detail: "platform metrics" }],
      a: "In this demo I answer three scripted questions end-to-end (pick a suggestion). In production this connects to the live LLM gateway with tool access to every HELIOS service — forecasts, optimizer runs, market data, settlement and documentation — always with cited sources and full audit of each tool call.",
    };
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: script.a, tools: script.tools }]);
      setBusy(false);
    }, 1400);
  }

  return (
    <>
      <PageHeader
        eyebrow="AI Platform · Copilot"
        title="Ask the platform anything"
        desc="LLM + retrieval over enterprise knowledge, with governed tool access to forecasts, optimizers and market data. Explanations, not hallucinations — every number traces to a tool call."
        right={<Badge tone="teal">RAG index · 2,140 documents · grid codes current</Badge>}
      />

      <div className="card flex flex-col" style={{ height: "calc(100vh - 300px)", minHeight: 480 }}>
        <div className="flex-1 overflow-y-auto scrollthin p-5 space-y-5">
          {msgs.map((m, i) => (
            <div key={i} className={cls("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cls("max-w-[720px]", m.role === "user" ? "bg-raised border border-line rounded-xl rounded-br-sm px-4 py-3" : "")}>
                {m.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-solar to-[#c97f0e] grid place-items-center">
                      <Sparkles className="h-3.5 w-3.5 text-[#0A1220]" />
                    </div>
                    <span className="font-mono text-[11px] tracking-widest text-dim">HELIOS COPILOT</span>
                  </div>
                )}
                {m.tools && (
                  <div className="mb-3 space-y-1.5">
                    {m.tools.map((tl) => (
                      <div key={tl.name} className="flex items-center gap-2 font-mono text-[11.5px] text-muted">
                        <Check className="h-3 w-3 text-up" />
                        <span className="text-wind">{tl.name}</span>
                        <span className="text-dim">· {tl.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 font-mono text-[12px] text-muted">
              <Wrench className="h-3.5 w-3.5 text-wind animate-spin" style={{ animationDuration: "2s" }} />
              running tools · reasoning over results…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-linesoft p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)}
                className="text-[12px] px-3 py-1.5 rounded-full border border-line text-muted hover:text-solar hover:border-solar/50 transition">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask about forecasts, positions, optimizer decisions, grid codes…"
              className="flex-1 bg-ink border border-line rounded-lg px-4 py-2.5 text-[13.5px] placeholder:text-dim focus:outline-none focus:border-solar/60"
            />
            <button onClick={() => ask(input)}
              className="px-4 rounded-lg bg-solar text-[#0A1220] font-semibold text-[13px] hover:brightness-110 transition flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Ask
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
