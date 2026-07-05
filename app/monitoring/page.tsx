"use client";

import { PageHeader, Card, Badge, Stat, Th, Td, TableWrap } from "@/components/ui/kit";
import { ASSETS, TECH_COLOR } from "@/lib/data/assets";
import { useEffect, useState } from "react";

function jitter(base: number, t: number, id: number) {
  return base * (1 + 0.015 * Math.sin(t / 3 + id) + 0.008 * Math.sin(t / 1.3 + id * 2));
}

export default function MonitoringPage() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 1500);
    return () => clearInterval(i);
  }, []);

  const feeds = [
    { k: "SCADA gateway", v: "14 sessions · OPC-UA / MQTT / IEC-104", ok: true },
    { k: "Telemetry rate", v: `${(1240 + (t % 7) * 3).toLocaleString()} points/s`, ok: true },
    { k: "Meter (2G) sync", v: "last pull 13:45 CET", ok: true },
    { k: "Terna BDE channel", v: "1 active dispatch order", ok: false },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operate · Live Monitoring"
        title="Fleet telemetry"
        desc="Normalized real-time stream from heterogeneous plant SCADA into one operational model. Values refresh every few seconds."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {feeds.map((f) => (
          <div key={f.k} className="card card-pad">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{f.k}</span>
              <span className={`h-2 w-2 rounded-full ${f.ok ? "bg-up" : "bg-solar"} tick`} />
            </div>
            <div className="mt-2 font-mono text-[13px]">{f.v}</div>
          </div>
        ))}
      </div>

      <Card title="Real-time asset telemetry" sub="4-second cadence · values normalized to the HELIOS canonical model" pad={false}>
        <TableWrap>
          <thead>
            <tr>
              <Th>Asset</Th><Th>P (MW)</Th><Th>Q (MVAr)</Th><Th>V (kV)</Th><Th>f (Hz)</Th>
              <Th>Devices</Th><Th>Alarms</Th><Th>Link</Th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a, idx) => {
              const p = a.status === "maintenance" ? 0 : jitter(Math.abs(a.currentMW), t, idx);
              const sign = a.currentMW < 0 ? -1 : 1;
              return (
                <tr key={a.id}>
                  <Td>
                    <div className="font-medium">{a.name}</div>
                    <div className="font-mono text-[11px]" style={{ color: TECH_COLOR[a.tech] }}>{a.tech} · {a.id}</div>
                  </Td>
                  <Td><span className="font-mono tabular-nums">{(p * sign).toFixed(2)}</span></Td>
                  <Td><span className="font-mono tabular-nums text-muted">{(p * 0.12).toFixed(2)}</span></Td>
                  <Td><span className="font-mono tabular-nums text-muted">{jitter(150, t, idx + 3).toFixed(1)}</span></Td>
                  <Td><span className="font-mono tabular-nums text-muted">{(50 + 0.02 * Math.sin(t / 2 + idx)).toFixed(3)}</span></Td>
                  <Td><span className="font-mono text-[12px] text-muted">{a.tech === "Wind" ? "12/12 WTG" : a.tech === "BESS" ? "10/10 PCS" : "42/42 INV"}</span></Td>
                  <Td>
                    {a.status === "curtailed" ? <Badge tone="amber">BDE limit</Badge> :
                     a.status === "maintenance" ? <Badge tone="violet">planned</Badge> :
                     <Badge tone="green">clear</Badge>}
                  </Td>
                  <Td><span className={`h-2 w-2 inline-block rounded-full ${a.status === "offline" ? "bg-down" : "bg-up"} tick`} /></Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
