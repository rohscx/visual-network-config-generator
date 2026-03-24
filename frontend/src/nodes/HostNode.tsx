import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { HostNodeData } from "../types";
import { useTopologyContext } from "../context/TopologyContext";

export function HostNode({ data }: NodeProps & { data: HostNodeData }) {
  const { state, dispatch } = useTopologyContext();
  const isSelected = state.selectedHostId === data.hostId;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: "SELECT_HOST", payload: data.hostId });
      }}
      style={{
        padding: "10px 20px",
        border: isSelected ? "2px solid #e8710a" : "2px solid #5f6368",
        borderRadius: 12,
        background: isSelected ? "#fef3e6" : "#f8f9fa",
        minWidth: 120,
        textAlign: "center",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      <div style={{ fontWeight: 600 }}>{data.label}</div>
      <Handle type="source" position={Position.Top} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: "REMOVE_HOST", payload: data.hostId });
        }}
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "1px solid #999",
          background: "#fff",
          cursor: "pointer",
          fontSize: 12,
          lineHeight: "18px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Remove host"
      >
        x
      </button>
    </div>
  );
}
