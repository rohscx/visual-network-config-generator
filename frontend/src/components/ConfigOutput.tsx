import { useState } from "react";
import type { GeneratedConfig } from "../types";

interface ConfigOutputProps {
  config: GeneratedConfig;
  onClose: () => void;
}

export function ConfigOutput({ config, onClose }: ConfigOutputProps) {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");

  const currentConfig =
    activeTab === "A" ? config.switch_a_config : config.switch_b_config;
  const currentName =
    activeTab === "A" ? config.switch_a_name : config.switch_b_name;

  function copyToClipboard() {
    navigator.clipboard.writeText(currentConfig);
  }

  const errors = config.validation_errors.filter((e) => e.level === "error");
  const warnings = config.validation_errors.filter((e) => e.level === "warning");

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Generated Configuration</h3>
          <button onClick={onClose} style={closeBtnStyle}>x</button>
        </div>

        {errors.length > 0 && (
          <div style={{ background: "#fce8e6", padding: 8, borderRadius: 4, marginBottom: 8, fontSize: 12 }}>
            {errors.map((e, i) => (
              <div key={i} style={{ color: "#d93025" }}>{e.message}</div>
            ))}
          </div>
        )}
        {warnings.length > 0 && (
          <div style={{ background: "#fef7e0", padding: 8, borderRadius: 4, marginBottom: 8, fontSize: 12 }}>
            {warnings.map((w, i) => (
              <div key={i} style={{ color: "#e37400" }}>{w.message}</div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          <button
            style={{
              ...tabBtn,
              ...(activeTab === "A" ? activeTabBtn : {}),
            }}
            onClick={() => setActiveTab("A")}
          >
            {config.switch_a_name}
          </button>
          <button
            style={{
              ...tabBtn,
              ...(activeTab === "B" ? activeTabBtn : {}),
            }}
            onClick={() => setActiveTab("B")}
          >
            {config.switch_b_name}
          </button>
        </div>

        <pre style={preStyle}>
          {currentConfig || "! No configuration generated for this switch"}
        </pre>

        <button style={copyBtn} onClick={copyToClipboard}>
          Copy {currentName} config
        </button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  minWidth: 600,
  maxWidth: 800,
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
};

const tabBtn: React.CSSProperties = {
  padding: "6px 16px",
  border: "1px solid #ccc",
  borderRadius: "4px 4px 0 0",
  background: "#f8f9fa",
  cursor: "pointer",
  fontSize: 13,
};

const activeTabBtn: React.CSSProperties = {
  background: "#1a73e8",
  color: "#fff",
  borderColor: "#1a73e8",
};

const preStyle: React.CSSProperties = {
  background: "#1e1e1e",
  color: "#d4d4d4",
  padding: 16,
  borderRadius: 4,
  overflow: "auto",
  flex: 1,
  fontSize: 13,
  fontFamily: "monospace",
  whiteSpace: "pre",
  minHeight: 200,
};

const copyBtn: React.CSSProperties = {
  marginTop: 8,
  padding: "6px 16px",
  border: "1px solid #1a73e8",
  borderRadius: 4,
  background: "#1a73e8",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  alignSelf: "flex-end",
};
