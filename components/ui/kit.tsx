import { cls } from "@/lib/util";

export function PageHeader({ eyebrow, title, desc, right }: { eyebrow: string; title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow mb-1.5">{eyebrow}</div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight leading-none">{title}</h1>
        {desc && <p className="text-[13px] text-muted mt-2 max-w-2xl leading-relaxed">{desc}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function Card({ title, sub, right, children, className, pad = true }: {
  title?: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <section className={cls("card", className)}>
      {(title || right) && (
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-linesoft">
          <div>
            {title && <h2 className="font-display text-[14px] font-semibold tracking-wide">{title}</h2>}
            {sub && <p className="text-[12px] text-dim mt-0.5">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={pad ? "card-pad" : undefined}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, unit, delta, tone = "default", foot }: {
  label: string; value: string; unit?: string; delta?: string; tone?: "default" | "up" | "down" | "solar"; foot?: string;
}) {
  const deltaColor = tone === "up" ? "text-up" : tone === "down" ? "text-down" : tone === "solar" ? "text-solar" : "text-muted";
  return (
    <div className="card card-pad">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-[26px] font-semibold tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[12px] text-dim font-mono">{unit}</span>}
      </div>
      {(delta || foot) && (
        <div className="mt-2 text-[12px] flex items-center gap-2">
          {delta && <span className={cls("font-mono", deltaColor)}>{delta}</span>}
          {foot && <span className="text-dim">{foot}</span>}
        </div>
      )}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-up/10 text-up border-up/30",
  red: "bg-down/10 text-down border-down/30",
  amber: "bg-solar/10 text-solar border-solar/30",
  teal: "bg-wind/10 text-wind border-wind/30",
  violet: "bg-battery/10 text-battery border-battery/30",
  gray: "bg-raised text-muted border-line",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTones; children: React.ReactNode }) {
  return (
    <span className={cls("inline-flex items-center gap-1 px-2 py-[3px] rounded-md border text-[11px] font-mono", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function Bar({ pct, color = "#F5A623" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cls("text-left font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim font-medium px-4 py-2.5", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cls("px-4 py-3 text-[13px] align-middle", className)}>{children}</td>;
}
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto scrollthin">
      <table className="w-full border-collapse [&_tbody_tr]:border-t [&_tbody_tr]:border-linesoft [&_tbody_tr:hover]:bg-raised/40">
        {children}
      </table>
    </div>
  );
}
