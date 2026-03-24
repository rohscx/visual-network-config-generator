import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SwitchNodeData } from "../types";

export function SwitchNode({ data }: NodeProps & { data: SwitchNodeData }) {
  const peerSide = data.switchSide === "A" ? Position.Right : Position.Left;

  return (
    <div
      style={{
        padding: "12px 24px",
        border: "2px solid #1a73e8",
        borderRadius: 8,
        background: "#e8f0fe",
        minWidth: 140,
        textAlign: "center",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      <div style={{ color: "#1a73e8", fontSize: 11, marginBottom: 2 }}>
        {data.switchSide === "A" ? "Switch A" : "Switch B"}
      </div>
      <div>{data.label}</div>
      <Handle type="target" position={Position.Bottom} id="host" />
      <Handle
        type={data.switchSide === "A" ? "source" : "target"}
        position={peerSide}
        id="peer"
      />
    </div>
  );
}
