export interface ConnectionGroup {
  host_id: string;
  description: string;
  trunk_vlans: string;
  channel_group: number | null;
  vpc_id: number | null;
  switch_a_interfaces: string[];
  switch_b_interfaces: string[];
}

export interface ConnectionGroupRead extends ConnectionGroup {
  id: string;
  topology_id: string;
  effective_channel_group: number | null;
  effective_vpc_id: number | null;
}

export interface Host {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
}

export interface HostRead extends Host {
  topology_id: string;
  connection_group: ConnectionGroupRead | null;
}

export interface TopologySave {
  name: string;
  switch_a_name: string;
  switch_b_name: string;
  canvas_state: Record<string, unknown>;
  hosts: Host[];
  connection_groups: ConnectionGroup[];
}

export interface TopologyRead {
  id: string;
  name: string;
  switch_a_name: string;
  switch_b_name: string;
  canvas_state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  hosts: HostRead[];
}

export interface TopologySummary {
  id: string;
  name: string;
  updated_at: string;
}

export interface ValidationError {
  level: "error" | "warning";
  message: string;
  related_host: string | null;
}

export interface GeneratedConfig {
  switch_a_name: string;
  switch_a_config: string;
  switch_b_name: string;
  switch_b_config: string;
  validation_errors: ValidationError[];
}

// React Flow node data
export interface SwitchNodeData {
  label: string;
  switchSide: "A" | "B";
}

export interface HostNodeData {
  hostId: string;
  label: string;
}

export interface CableEdgeData {
  hostId: string;
  switchSide: "A" | "B";
  interfaceName: string;
  index: number;
  total: number;
}
