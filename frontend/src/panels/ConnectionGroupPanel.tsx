import { useMemo, useState, useEffect } from "react";
import { useTopologyContext } from "../context/TopologyContext";
import type { ConnectionGroup } from "../types";
import { deriveIdFromInterfaces } from "../utils";

function parseInterfaces(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function InterfaceInput({
  label,
  interfaces,
  hostId,
  onChange,
}: {
  label: string;
  interfaces: string[];
  hostId: string;
  onChange: (interfaces: string[]) => void;
}) {
  const [raw, setRaw] = useState(interfaces.join(", "));
  const [focused, setFocused] = useState(false);

  // Sync from external state when the selected host changes
  useEffect(() => {
    if (!focused) {
      setRaw(interfaces.join(", "));
    }
  }, [hostId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(value: string) {
    setRaw(value);
    // Parse and push to state on every keystroke for live edge updates
    const parsed = parseInterfaces(value);
    onChange(parsed);
  }

  function handleBlur() {
    setFocused(false);
    // Re-format to clean display
    const parsed = parseInterfaces(raw);
    setRaw(parsed.join(", "));
  }

  return (
    <>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder="e.g., Eth1/1, Eth1/2"
      />
    </>
  );
}

export function ConnectionGroupPanel() {
  const { state, dispatch } = useTopologyContext();

  const host = state.hosts.find((h) => h.id === state.selectedHostId);
  const cg = state.connectionGroups.find(
    (c) => c.host_id === state.selectedHostId
  );

  const derived = useMemo(() => {
    if (!cg) return null;
    const all = [...cg.switch_a_interfaces, ...cg.switch_b_interfaces];
    return deriveIdFromInterfaces(all);
  }, [cg]);

  const effectiveChGroup = cg?.channel_group ?? derived;
  const effectiveVpcId = cg?.vpc_id ?? derived;

  if (!host || !cg) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#888", padding: 16 }}>
          Select a host to edit its connections
        </p>
      </div>
    );
  }

  function updateCg(changes: Partial<ConnectionGroup>) {
    dispatch({
      type: "UPDATE_CONNECTION_GROUP",
      payload: { ...cg!, ...changes },
    });
  }

  function updateHostName(name: string) {
    dispatch({
      type: "UPDATE_HOST",
      payload: { id: host!.id, changes: { name } },
    });
  }

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: 15 }}>Connection Config</h3>

      <label style={labelStyle}>Host Name</label>
      <input
        style={inputStyle}
        value={host.name}
        onChange={(e) => updateHostName(e.target.value)}
      />

      <label style={labelStyle}>Description</label>
      <input
        style={inputStyle}
        value={cg.description}
        onChange={(e) => updateCg({ description: e.target.value })}
        placeholder="e.g., HOST1-uplink"
      />

      <label style={labelStyle}>Trunk Allowed VLANs</label>
      <input
        style={inputStyle}
        value={cg.trunk_vlans}
        onChange={(e) => updateCg({ trunk_vlans: e.target.value })}
        placeholder="e.g., 100,200,300"
      />

      <InterfaceInput
        key={`a-${state.selectedHostId}`}
        label="Switch A Interfaces (comma-separated)"
        interfaces={cg.switch_a_interfaces}
        hostId={host.id}
        onChange={(ifaces) => updateCg({ switch_a_interfaces: ifaces })}
      />

      <InterfaceInput
        key={`b-${state.selectedHostId}`}
        label="Switch B Interfaces (comma-separated)"
        interfaces={cg.switch_b_interfaces}
        hostId={host.id}
        onChange={(ifaces) => updateCg({ switch_b_interfaces: ifaces })}
      />

      <div
        style={{
          marginTop: 12,
          padding: "8px 10px",
          background: "#f0f4f8",
          borderRadius: 6,
          fontSize: 13,
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <strong>Channel-Group:</strong> {effectiveChGroup ?? "—"}
          {cg.channel_group === null && derived !== null && (
            <span style={{ color: "#888", marginLeft: 4 }}>(auto)</span>
          )}
        </div>
        <div>
          <strong>vPC ID:</strong> {effectiveVpcId ?? "—"}
          {cg.vpc_id === null && derived !== null && (
            <span style={{ color: "#888", marginLeft: 4 }}>(auto)</span>
          )}
        </div>
      </div>

      <label style={{ ...labelStyle, marginTop: 12 }}>
        Override Channel-Group
      </label>
      <input
        style={inputStyle}
        type="number"
        value={cg.channel_group ?? ""}
        onChange={(e) =>
          updateCg({
            channel_group: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        placeholder="Leave blank for auto"
      />

      <label style={labelStyle}>Override vPC ID</label>
      <input
        style={inputStyle}
        type="number"
        value={cg.vpc_id ?? ""}
        onChange={(e) =>
          updateCg({
            vpc_id: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        placeholder="Leave blank for auto"
      />
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  width: 280,
  borderLeft: "1px solid #ddd",
  padding: 16,
  overflowY: "auto",
  background: "#fff",
  fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 10,
  marginBottom: 3,
  fontWeight: 600,
  fontSize: 12,
  color: "#555",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
  boxSizing: "border-box",
};
