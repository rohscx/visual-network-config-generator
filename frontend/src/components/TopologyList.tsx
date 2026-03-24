import { useState, useEffect } from "react";
import { api } from "../api";
import type { TopologySummary } from "../types";

interface TopologyListProps {
  onLoad: (id: string) => void;
  onClose: () => void;
}

export function TopologyList({ onLoad, onClose }: TopologyListProps) {
  const [topologies, setTopologies] = useState<TopologySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listTopologies().then((t) => {
      setTopologies(t);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.deleteTopology(id);
    setTopologies((t) => t.filter((x) => x.id !== id));
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Saved Topologies</h3>
          <button onClick={onClose} style={closeBtnStyle}>x</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : topologies.length === 0 ? (
          <p style={{ color: "#888" }}>No saved topologies</p>
        ) : (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {topologies.map((t) => (
              <div key={t.id} style={itemStyle}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={actionBtn} onClick={() => onLoad(t.id)}>
                    Load
                  </button>
                  <button
                    style={{ ...actionBtn, color: "#d93025" }}
                    onClick={() => handleDelete(t.id, t.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  minWidth: 400,
  maxWidth: 500,
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #eee",
};

const actionBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
};
