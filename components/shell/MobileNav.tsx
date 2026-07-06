"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun } from "lucide-react";
import { NAV } from "./nav";
import { cls } from "@/lib/util";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden sticky top-0 z-50">
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-linesoft bg-[#0B1424]/95 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-solar to-[#c97f0e] grid place-items-center shadow-glow">
            <Sun className="h-[18px] w-[18px] text-[#0A1220]" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-display tracking-wide text-[14px] leading-none font-bold">HELIOS</div>
            <div className="font-mono text-[8.5px] text-dim tracking-[0.14em] mt-0.5">RENEWABLE OS · v1.0</div>
          </div>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="h-9 w-9 grid place-items-center rounded-lg border border-line bg-raised text-muted hover:text-fg"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[52px] bottom-0 z-50 bg-[#0A1220]/95 backdrop-blur overflow-y-auto scrollthin">
          <nav className="px-4 py-5 space-y-6">
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="eyebrow px-3 mb-1.5">{g.group}</div>
                <div className="space-y-0.5">
                  {g.items.map((it) => {
                    const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
                    const Icon = it.icon;
                    return (
                      <Link key={it.href} href={it.href} className={cls("navlink py-2.5 text-[14px]", active && "navlink-active")}>
                        <Icon className={cls("h-4 w-4", active ? "text-solar" : "text-dim")} strokeWidth={2} />
                        {it.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="px-7 pb-8 text-[11px] text-dim leading-relaxed">
            <span className="font-mono tracking-[0.14em] text-muted">FIRST BOSTON CAPITAL</span>
            <br />
            for Tages Capital SGR
          </div>
        </div>
      )}
    </div>
  );
}
