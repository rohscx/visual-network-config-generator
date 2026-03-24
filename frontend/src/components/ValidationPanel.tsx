import { useState, useEffect } from "react";
import { useTopologyContext } from "../context/TopologyContext";
import { api } from "../api";
import type { ValidationError } from "../types";

export function ValidationPanel() {
  const { state } = useTopologyContext();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    // Debounced validation
    const timer = setTimeout(() => {
      if (state.connectionGroups.length === 0) {
        setErrors([]);
        return;
      }
      api
        .validate({
          name: state.name,
          switch_a_name: state.switchAName,
          switch_b_name: state.switchBName,
          canvas_state: {},
          hosts: state.hosts,
          connection_groups: state.connectionGroups,
        })
        .then(setErrors)
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [state.connectionGroups, state.hosts, state.name, state.switchAName, state.switchBName]);

  const errorCount = errors.filter((e) => e.level === "error").length;
  const warnCount = errors.filter((e) => e.level === "warning").length;

  if (errors.length === 0) return null;

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
        {errorCount > 0 && (
          <span style={{ color: "#d93025", fontSize: 12, fontWeight: 600 }}>
            {errorCount} error{errorCount !== 1 ? "s" : ""}
          </span>
        )}
        {warnCount > 0 && (
          <span style={{ color: "#e37400", fontSize: 12, fontWeight: 600 }}>
            {warnCount} warning{warnCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div style={{ maxHeight: 80, overflowY: "auto", fontSize: 12 }}>
        {errors.map((e, i) => (
          <div
            key={i}
            style={{
              color: e.level === "error" ? "#d93025" : "#e37400",
              padding: "1px 0",
            }}
          >
            {e.message}
          </div>
        ))}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  borderTop: "1px solid #ddd",
  padding: "8px 16px",
  background: "#fff",
};
