"use client";

import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, BarChart, AreaChart, Cell,
} from "recharts";

const AX = { stroke: "#3A4E70", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" } as const;
const GRID = { stroke: "#16233A", strokeDasharray: "3 3" } as const;
const TT = {
  contentStyle: {
    background: "#101C30", border: "1px solid #1E3050", borderRadius: 10,
    fontSize: 12, fontFamily: "IBM Plex Mono, monospace",
  },
  labelStyle: { color: "#8CA1BE" },
} as const;

export function ForecastFan({ data, nowHour }: { data: any[]; nowHour: number }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="h" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} interval={2} />
        <YAxis tick={AX} tickLine={false} axisLine={false} unit="" />
        <Tooltip {...TT} />
        <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="transparent" name="P10" />
        <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="#F5A623" fillOpacity={0.12} name="P10–P90" />
        <Line type="monotone" dataKey="forecast" stroke="#F5A623" strokeWidth={2} dot={false} name="Forecast P50 (MW)" />
        <Line type="monotone" dataKey="actual" stroke="#3FC8D4" strokeWidth={2} dot={false} name="Actual (MW)" connectNulls={false} />
        <ReferenceLine x={data[nowHour]?.h} stroke="#5C7397" strokeDasharray="4 4" label={{ value: "now", fill: "#8CA1BE", fontSize: 10, position: "top" }} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function PriceChart({ data, zones = true }: { data: any[]; zones?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="h" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} interval={2} />
        <YAxis tick={AX} tickLine={false} axisLine={false} unit="" domain={[0, "auto"]} />
        <Tooltip {...TT} />
        <Area type="monotone" dataKey="p90" stroke="none" fill="#3FC8D4" fillOpacity={0.07} name="P90" />
        <Area type="monotone" dataKey="p10" stroke="none" fill="#0A1220" fillOpacity={1} name="P10" />
        <Line type="monotone" dataKey="pun" stroke="#E9EFF8" strokeWidth={2} dot={false} name="PUN €/MWh" />
        {zones && <Line type="monotone" dataKey="sici" stroke="#F5A623" strokeWidth={1.4} dot={false} name="SICI" />}
        {zones && <Line type="monotone" dataKey="sud" stroke="#3FC8D4" strokeWidth={1.4} dot={false} name="SUD" />}
        {zones && <Line type="monotone" dataKey="sard" stroke="#9B8CFF" strokeWidth={1.4} dot={false} name="SARD" />}
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BessChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 0, left: -14, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="h" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} interval={2} />
        <YAxis yAxisId="p" tick={AX} tickLine={false} axisLine={false} />
        <YAxis yAxisId="soc" orientation="right" tick={AX} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip {...TT} />
        <ReferenceLine yAxisId="p" y={0} stroke="#3A4E70" />
        <Bar yAxisId="p" dataKey="power" name="Dispatch (MW, +discharge)" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.power >= 0 ? "#45D483" : "#9B8CFF"} />
          ))}
        </Bar>
        <Line yAxisId="soc" type="monotone" dataKey="soc" stroke="#F5A623" strokeWidth={2} dot={false} name="SOC %" />
        <Line yAxisId="p" type="monotone" dataKey="price" stroke="#8CA1BE" strokeWidth={1.2} strokeDasharray="4 3" dot={false} name="PUN €/MWh" />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function AccuracyChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="d" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} />
        <YAxis tick={AX} tickLine={false} axisLine={false} unit="%" />
        <Tooltip {...TT} />
        <Line type="monotone" dataKey="lightgbm" stroke="#3FC8D4" strokeWidth={1.6} dot={false} name="LightGBM" />
        <Line type="monotone" dataKey="lstm" stroke="#9B8CFF" strokeWidth={1.6} dot={false} name="LSTM" />
        <Line type="monotone" dataKey="tft" stroke="#E9EFF8" strokeWidth={1.6} dot={false} name="TFT" />
        <Line type="monotone" dataKey="ensemble" stroke="#F5A623" strokeWidth={2.4} dot={false} name="Ensemble" />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RevenueStack({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="m" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} />
        <YAxis tick={AX} tickLine={false} axisLine={false} unit="M" />
        <Tooltip {...TT} />
        <Bar dataKey="merchant" stackId="r" fill="#F5A623" name="Merchant €M" radius={[0, 0, 0, 0]} />
        <Bar dataKey="ppa" stackId="r" fill="#3FC8D4" name="PPA €M" />
        <Bar dataKey="ancillary" stackId="r" fill="#9B8CFF" name="Ancillary €M" />
        <Bar dataKey="incentive" stackId="r" fill="#44598033" name="Incentive €M" radius={[3, 3, 0, 0]} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NettingBars({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={2}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="zone" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} />
        <YAxis tick={AX} tickLine={false} axisLine={false} unit="k€" />
        <Tooltip {...TT} />
        <Bar dataKey="standalone" fill="#5C7397" name="Standalone imbalance k€/wk" radius={[3, 3, 0, 0]} />
        <Bar dataKey="netted" fill="#45D483" name="Portfolio-netted k€/wk" radius={[3, 3, 0, 0]} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RaRChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="x" tick={AX} tickLine={false} axisLine={{ stroke: "#1E3050" }} unit="M" />
        <YAxis hide />
        <Tooltip {...TT} />
        <ReferenceLine x={84} stroke="#F0616D" strokeDasharray="4 4" label={{ value: "RaR 95%", fill: "#F0616D", fontSize: 10, position: "insideTopLeft" }} />
        <ReferenceLine x={104} stroke="#8CA1BE" strokeDasharray="4 4" label={{ value: "P50", fill: "#8CA1BE", fontSize: 10, position: "insideTopRight" }} />
        <Area type="monotone" dataKey="y" stroke="#F5A623" strokeWidth={2} fill="#F5A623" fillOpacity={0.15} name="Annual revenue density" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Spark({ data, dataKey, color = "#F5A623", height = 44 }: { data: any[]; dataKey: string; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.6} fill={color} fillOpacity={0.12} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
