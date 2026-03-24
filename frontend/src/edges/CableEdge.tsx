import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { CableEdgeData } from "../types";

const SPREAD = 20;

export function CableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps & { data: CableEdgeData }) {
  const index = data?.index ?? 0;
  const total = data?.total ?? 1;
  const offset = (index - (total - 1) / 2) * SPREAD;

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

  const showPo = data?.poId != null && total > 1 && index === 0;
  const ovalX = sourceX + (targetX - sourceX) * 0.5;
  const ovalY = sourceY + (targetY - sourceY) * 0.5;
  const ovalW = ((total - 1) * SPREAD) + 52;
  const ovalH = ovalW * 0.55;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: "#5f6368", strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        {/* Po oval — rendered in HTML layer so it's above the SVG lines */}
        {showPo && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${ovalX}px, ${ovalY}px)`,
              width: ovalW,
              height: ovalH,
              borderRadius: "50%",
              border: "2.5px solid #1a73e8",
              background: "radial-gradient(ellipse at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(200,220,248,0.7) 100%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
            className="nodrag nopan"
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a73e8", lineHeight: 1.2 }}>
              Po{data.poId}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#5f6368", lineHeight: 1.2 }}>
              vPC {data.poId}
            </span>
          </div>
        )}
        {/* Interface label */}
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
