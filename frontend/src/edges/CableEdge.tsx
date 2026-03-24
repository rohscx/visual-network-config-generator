import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { CableEdgeData } from "../types";

const SPREAD = 20; // pixels between parallel edges

export function CableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps & { data: CableEdgeData & { index: number; total: number } }) {
  // Offset edges so parallel links between the same nodes are visible
  const index = data?.index ?? 0;
  const total = data?.total ?? 1;
  const offset = (index - (total - 1) / 2) * SPREAD;

  // Position label at different points along the edge per index
  // First edge at 30%, second at 50%, third at 70%, etc.
  const labelRatio = total <= 1 ? 0.5 : 0.25 + (index / (total - 1)) * 0.5;

  const oSourceX = sourceX + offset;
  const oSourceY = sourceY;
  const oTargetX = targetX + offset;
  const oTargetY = targetY;

  const [edgePath] = getStraightPath({
    sourceX: oSourceX,
    sourceY: oSourceY,
    targetX: oTargetX,
    targetY: oTargetY,
  });

  const labelX = oSourceX + (oTargetX - oSourceX) * labelRatio;
  const labelY = oSourceY + (oTargetY - oSourceY) * labelRatio;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: "#5f6368", strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 11,
            border: "1px solid #ddd",
            pointerEvents: "none",
          }}
          className="nodrag nopan"
        >
          {data?.interfaceName || "?"}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
