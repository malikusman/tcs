"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cls } from "@/lib/util";
import { Sun } from "lucide-react";
import { NAV } from "./nav";

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-linesoft bg-[#0B1424]/80 sticky top-0 h-screen overflow-y-auto scrollthin">
      <div className="px-4 pt-5 pb-4 border-b border-linesoft">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-solar to-[#c97f0e] grid place-items-center shadow-glow">
            <Sun className="h-5 w-5 text-[#0A1220]" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-display font-700 tracking-wide text-[15px] leading-none font-bold">HELIOS</div>
            <div className="font-mono text-[9.5px] text-dim tracking-[0.14em] mt-1">RENEWABLE OS · v1.0</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="eyebrow px-3 mb-1.5">{g.group}</div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href} className={cls("navlink", active && "navlink-active")}>
                    <Icon className={cls("h-[15px] w-[15px]", active ? "text-solar" : "text-dim")} strokeWidth={2} />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-linesoft">
        <div className="text-[11px] text-dim leading-relaxed">
          <span className="font-mono tracking-[0.14em] text-muted">FIRST BOSTON CAPITAL</span>
          <br />
          for Tages Capital SGR
        </div>
      </div>
    </aside>
  );
}
