import type {
  TopologyRead,
  TopologySave,
  TopologySummary,
  GeneratedConfig,
  ValidationError,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API error ${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listTopologies: () => request<TopologySummary[]>("/topologies"),

  getTopology: (id: string) => request<TopologyRead>(`/topologies/${id}`),

  createTopology: (data: TopologySave) =>
    request<TopologyRead>("/topologies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTopology: (id: string, data: TopologySave) =>
    request<TopologyRead>(`/topologies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTopology: (id: string) =>
    request<void>(`/topologies/${id}`, { method: "DELETE" }),

  cloneTopology: (id: string, name: string) =>
    request<TopologyRead>(`/topologies/${id}/clone`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  generateConfig: (id: string) =>
    request<GeneratedConfig>(`/topologies/${id}/generate`, {
      method: "POST",
    }),

  validate: (data: TopologySave) =>
    request<ValidationError[]>("/validate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
