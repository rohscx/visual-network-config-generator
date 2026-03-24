import { useState } from "react";
import { useTopology } from "../hooks/useTopology";
import type { GeneratedConfig } from "../types";

interface ToolbarProps {
  onShowLoad: () => void;
  onShowConfig: (config: GeneratedConfig) => void;
}

export function Toolbar({ onShowLoad, onShowConfig }: ToolbarProps) {
  const { state, dispatch, save, newTopology, clone, generate } = useTopology();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await save();
    } catch (e) {
      alert(`Save failed: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const config = await generate();
      onShowConfig(config);
    } catch (e) {
      alert(`Generate failed: ${e}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleClone() {
    const name = prompt("Name for the cloned topology:", `${state.name} (copy)`);
    if (!name) return;
    try {
      await clone(name);
    } catch (e) {
      alert(`Clone failed: ${e}`);
    }
  }

  function handleNew() {
    if (state.dirty && !confirm("Unsaved changes will be lost. Continue?")) return;
    newTopology();
  }

  function addHost() {
    const id = crypto.randomUUID();
    dispatch({
      type: "ADD_HOST",
      payload: {
        id,
        name: `Host-${state.hosts.length + 1}`,
        position_x: 300 + Math.random() * 100,
        position_y: 250 + Math.random() * 100,
      },
    });
  }

  return (
    <div style={toolbarStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          style={{ ...inputStyle, width: 180, fontWeight: 600 }}
          value={state.name}
          onChange={(e) => dispatch({ type: "SET_NAME", payload: e.target.value })}
        />
        {state.dirty && <span style={{ color: "#e8710a", fontSize: 12 }}>unsaved</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <label style={{ fontSize: 12, color: "#555" }}>A:</label>
        <input
          style={{ ...inputStyle, width: 120 }}
          value={state.switchAName}
          onChange={(e) => dispatch({ type: "SET_SWITCH_A_NAME", payload: e.target.value })}
        />
        <label style={{ fontSize: 12, color: "#555" }}>B:</label>
        <input
          style={{ ...inputStyle, width: 120 }}
          value={state.switchBName}
          onChange={(e) => dispatch({ type: "SET_SWITCH_B_NAME", payload: e.target.value })}
        />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button style={btnStyle} onClick={handleNew}>New</button>
        <button style={btnStyle} onClick={onShowLoad}>Load</button>
        <button style={{ ...btnStyle, ...primaryBtn }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button style={btnStyle} onClick={handleClone} disabled={!state.id}>Clone</button>
        <button style={btnStyle} onClick={addHost}>+ Host</button>
        <button
          style={{ ...btnStyle, background: "#1a73e8", color: "#fff", borderColor: "#1a73e8" }}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderBottom: "1px solid #ddd",
  background: "#fff",
  gap: 16,
  flexWrap: "wrap",
};

const inputStyle: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
};

const btnStyle: React.CSSProperties = {
  padding: "5px 12px",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
};

const primaryBtn: React.CSSProperties = {
  background: "#34a853",
  color: "#fff",
  borderColor: "#34a853",
};
