import { PageHeader, Badge } from "@/components/ui/kit";
import GateRoom from "@/components/gateroom/GateRoom";

export default function AgentsLivePage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Platform · Gate Room"
        title="Live gate cycle"
        desc="The next real TIDE gate, counted down on the actual Rome clock. Simulate it to watch the Forecast, Trading and Risk agents deliberate, hash-lock a bid set seconds before the gate, and clear it into the paper ledger."
        right={<Badge tone="violet">REPLAY MODE · simulated data</Badge>}
      />
      <GateRoom />
    </>
  );
}
