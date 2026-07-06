import { PageHeader, Card, Badge, Stat } from "@/components/ui/kit";
import { ASSETS, TECH_COLOR } from "@/lib/data/assets";

export default function VppPage() {
  const groups = [
    { name: "VPP · SUD", zone: "SUD", mw: 316, flex: 42, assets: ASSETS.filter((a) => a.zone === "SUD") },
    { name: "VPP · SICI", zone: "SICI", mw: 214, flex: 58, assets: ASSETS.filter((a) => a.zone === "SICI") },
    { name: "VPP · SARD", zone: "SARD", mw: 146, flex: 31, assets: ASSETS.filter((a) => a.zone === "SARD") },
    { name: "VPP · CNOR", zone: "CNOR", mw: 64, flex: 6, assets: ASSETS.filter((a) => a.zone === "CNOR") },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Optimize · Virtual Power Plant"
        title="Coordinated as one machine"
        desc="Software — not copper — turns dispersed solar, wind and storage into dispatchable zone-level units able to offer flexibility and ancillary services to Terna, with BRP and BSP roles kept contractually separate under the TIDE dispatching framework."
        right={<Badge tone="teal">UVAT qualification · 3 zones active</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Aggregated capacity" value="740" unit="MW" foot="4 virtual units" />
        <Stat label="Dispatchable flexibility" value="137" unit="MW" tone="solar" delta="BESS + curtailable PV" />
        <Stat label="MBR availability sold" value="30" unit="MW" foot="SICI · today H00–H24" />
        <Stat label="Activation response" value="< 4" unit="s" tone="up" foot="BESS fast loop" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <Card key={g.name} title={g.name} sub={`${g.assets.length} assets · ${g.mw} MW aggregated · ${g.flex} MW flexible`} pad={false}
            right={<Badge tone={g.flex > 20 ? "green" : "gray"}>{g.flex > 20 ? "UVAT active" : "monitor only"}</Badge>}>
            <div className="px-5 py-4">
              <div className="flex h-2.5 rounded-full overflow-hidden bg-raised mb-4">
                {g.assets.map((a) => (
                  <div key={a.id} title={a.name}
                    style={{ width: `${(a.capacityMW / g.mw) * 100}%`, background: TECH_COLOR[a.tech], opacity: a.status === "online" ? 1 : 0.35 }} />
                ))}
              </div>
              <div className="space-y-2">
                {g.assets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-sm" style={{ background: TECH_COLOR[a.tech] }} />
                      {a.name}
                    </span>
                    <span className="font-mono text-muted tabular-nums">{a.capacityMW.toFixed(0)} MW · {a.tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
