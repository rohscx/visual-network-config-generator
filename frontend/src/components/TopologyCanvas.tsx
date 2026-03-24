import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SwitchNode } from "../nodes/SwitchNode";
import { HostNode } from "../nodes/HostNode";
import { CableEdge } from "../edges/CableEdge";
import { useTopologyContext } from "../context/TopologyContext";

const nodeTypes = { switchNode: SwitchNode, hostNode: HostNode } as const;
const edgeTypes = { cableEdge: CableEdge } as const;

export function TopologyCanvas() {
  const { state, dispatch } = useTopologyContext();

  const nodes: Node[] = useMemo(() => {
    const switchNodes: Node[] = [
      {
        id: "switch-a",
        type: "switchNode",
        position: { x: 150, y: 30 },
        data: { label: state.switchAName, switchSide: "A" },
        draggable: true,
        deletable: false,
      },
      {
        id: "switch-b",
        type: "switchNode",
        position: { x: 550, y: 30 },
        data: { label: state.switchBName, switchSide: "B" },
        draggable: true,
        deletable: false,
      },
    ];

    const hostNodes: Node[] = state.hosts.map((host) => ({
      id: `host-${host.id}`,
      type: "hostNode",
      position: { x: host.position_x, y: host.position_y },
      data: { hostId: host.id, label: host.name },
      draggable: true,
    }));

    return [...switchNodes, ...hostNodes];
  }, [state.hosts, state.switchAName, state.switchBName]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    for (const cg of state.connectionGroups) {
      const aCount = cg.switch_a_interfaces.length;
      for (let i = 0; i < aCount; i++) {
        result.push({
          id: `edge-${cg.host_id}-A-${i}`,
          source: `host-${cg.host_id}`,
          target: "switch-a",
          type: "cableEdge",
          data: {
            hostId: cg.host_id,
            switchSide: "A",
            interfaceName: cg.switch_a_interfaces[i],
            index: i,
            total: aCount,
          },
        });
      }
      const bCount = cg.switch_b_interfaces.length;
      for (let i = 0; i < bCount; i++) {
        result.push({
          id: `edge-${cg.host_id}-B-${i}`,
          source: `host-${cg.host_id}`,
          target: "switch-b",
          type: "cableEdge",
          data: {
            hostId: cg.host_id,
            switchSide: "B",
            interfaceName: cg.switch_b_interfaces[i],
            index: i,
            total: bCount,
          },
        });
      }
    }
    return result;
  }, [state.connectionGroups]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Update host positions on drag
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          const nodeId = change.id;
          if (nodeId.startsWith("host-")) {
            const hostId = nodeId.replace("host-", "");
            dispatch({
              type: "UPDATE_HOST",
              payload: {
                id: hostId,
                changes: {
                  position_x: change.position.x,
                  position_y: change.position.y,
                },
              },
            });
          }
        }
      }
    },
    [dispatch]
  );

  const onPaneClick = useCallback(() => {
    dispatch({ type: "SELECT_HOST", payload: null });
  }, [dispatch]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onPaneClick={onPaneClick}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
