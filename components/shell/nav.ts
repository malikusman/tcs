import type { ElementType } from "react";
import {
  LayoutGrid, Factory, Activity, CloudSun, TrendingUp, CandlestickChart,
  FlaskConical, Boxes, BatteryCharging, Network, ShieldAlert, Scale, Bot,
  Workflow, BellRing, Settings2,
} from "lucide-react";

export const NAV: { group: string; items: { href: string; label: string; icon: ElementType }[] }[] = [
  {
    group: "Operate",
    items: [
      { href: "/", label: "Command Center", icon: LayoutGrid },
      { href: "/assets", label: "Asset Registry", icon: Factory },
      { href: "/monitoring", label: "Live Monitoring", icon: Activity },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/forecasting", label: "Forecasting Engine", icon: CloudSun },
      { href: "/market", label: "Market Intelligence", icon: TrendingUp },
    ],
  },
  {
    group: "Trade & Optimize",
    items: [
      { href: "/trading", label: "Trading Engine", icon: CandlestickChart },
      { href: "/paper", label: "Paper Trading", icon: FlaskConical },
      { href: "/portfolio", label: "Portfolio Optimizer", icon: Boxes },
      { href: "/battery", label: "BESS Dispatch", icon: BatteryCharging },
      { href: "/vpp", label: "Virtual Power Plant", icon: Network },
    ],
  },
  {
    group: "Risk & Finance",
    items: [
      { href: "/risk", label: "Risk Management", icon: ShieldAlert },
      { href: "/settlement", label: "Settlement", icon: Scale },
    ],
  },
  {
    group: "AI Platform",
    items: [
      { href: "/copilot", label: "AI Copilot", icon: Bot },
      { href: "/agents", label: "Agents & MLOps", icon: Workflow },
    ],
  },
  {
    group: "Govern",
    items: [
      { href: "/alerts", label: "Alerts & Events", icon: BellRing },
      { href: "/admin", label: "Administration", icon: Settings2 },
    ],
  },
];
