import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { TopologyProvider } from "./context/TopologyContext";
import { useTopology } from "./hooks/useTopology";
import { TopologyCanvas } from "./components/TopologyCanvas";
import { Toolbar } from "./components/Toolbar";
import { ConnectionGroupPanel } from "./panels/ConnectionGroupPanel";
import { ValidationPanel } from "./components/ValidationPanel";
import { TopologyList } from "./components/TopologyList";
import { ConfigOutput } from "./components/ConfigOutput";
import type { GeneratedConfig } from "./types";

function AppInner() {
  const { load } = useTopology();
  const [showLoad, setShowLoad] = useState(false);
  const [configOutput, setConfigOutput] = useState<GeneratedConfig | null>(null);

  async function handleLoad(id: string) {
    await load(id);
    setShowLoad(false);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toolbar
        onShowLoad={() => setShowLoad(true)}
        onShowConfig={setConfigOutput}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1 }}>
          <TopologyCanvas />
        </div>
        <ConnectionGroupPanel />
      </div>
      <ValidationPanel />

      {showLoad && (
        <TopologyList onLoad={handleLoad} onClose={() => setShowLoad(false)} />
      )}
      {configOutput && (
        <ConfigOutput
          config={configOutput}
          onClose={() => setConfigOutput(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <TopologyProvider>
      <ReactFlowProvider>
        <AppInner />
      </ReactFlowProvider>
    </TopologyProvider>
  );
}
