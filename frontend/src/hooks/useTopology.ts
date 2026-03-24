import { useCallback } from "react";
import { api } from "../api";
import {
  useTopologyContext,
  type TopologyState,
} from "../context/TopologyContext";
import type { TopologySave, TopologyRead } from "../types";

function toSavePayload(state: TopologyState): TopologySave {
  return {
    name: state.name,
    switch_a_name: state.switchAName,
    switch_b_name: state.switchBName,
    canvas_state: {},
    hosts: state.hosts,
    connection_groups: state.connectionGroups,
  };
}

function fromRead(read: TopologyRead): TopologyState {
  return {
    id: read.id,
    name: read.name,
    switchAName: read.switch_a_name,
    switchBName: read.switch_b_name,
    hosts: read.hosts.map((h) => ({
      id: h.id,
      name: h.name,
      position_x: h.position_x,
      position_y: h.position_y,
    })),
    connectionGroups: read.hosts
      .filter((h) => h.connection_group)
      .map((h) => {
        const cg = h.connection_group!;
        return {
          host_id: cg.host_id,
          description: cg.description,
          trunk_vlans: cg.trunk_vlans,
          channel_group: cg.channel_group,
          vpc_id: cg.vpc_id,
          switch_a_interfaces: cg.switch_a_interfaces,
          switch_b_interfaces: cg.switch_b_interfaces,
        };
      }),
    selectedHostId: null,
    dirty: false,
  };
}

export function useTopology() {
  const { state, dispatch } = useTopologyContext();

  const save = useCallback(async () => {
    const payload = toSavePayload(state);
    let result: TopologyRead;
    if (state.id) {
      result = await api.updateTopology(state.id, payload);
    } else {
      result = await api.createTopology(payload);
    }
    dispatch({ type: "SET_TOPOLOGY", payload: fromRead(result) });
    return result;
  }, [state, dispatch]);

  const load = useCallback(
    async (id: string) => {
      const result = await api.getTopology(id);
      dispatch({ type: "SET_TOPOLOGY", payload: fromRead(result) });
      return result;
    },
    [dispatch]
  );

  const clone = useCallback(
    async (newName: string) => {
      if (!state.id) throw new Error("Save first before cloning");
      const result = await api.cloneTopology(state.id, newName);
      dispatch({ type: "SET_TOPOLOGY", payload: fromRead(result) });
      return result;
    },
    [state.id, dispatch]
  );

  const generate = useCallback(async () => {
    if (!state.id) {
      // Save first
      const payload = toSavePayload(state);
      const saved = await api.createTopology(payload);
      dispatch({ type: "SET_TOPOLOGY", payload: fromRead(saved) });
      return api.generateConfig(saved.id);
    }
    // Save latest state before generating
    const payload = toSavePayload(state);
    await api.updateTopology(state.id, payload);
    dispatch({ type: "MARK_CLEAN" });
    return api.generateConfig(state.id);
  }, [state, dispatch]);

  const newTopology = useCallback(() => {
    dispatch({ type: "NEW_TOPOLOGY" });
  }, [dispatch]);

  return { state, dispatch, save, load, clone, generate, newTopology };
}
