import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { ConnectionGroup, Host } from "../types";

export interface TopologyState {
  id: string | null;
  name: string;
  switchAName: string;
  switchBName: string;
  hosts: Host[];
  connectionGroups: ConnectionGroup[];
  selectedHostId: string | null;
  dirty: boolean;
}

export const initialState: TopologyState = {
  id: null,
  name: "New Topology",
  switchAName: "Switch-A",
  switchBName: "Switch-B",
  hosts: [],
  connectionGroups: [],
  selectedHostId: null,
  dirty: false,
};

export type Action =
  | { type: "SET_TOPOLOGY"; payload: TopologyState }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_SWITCH_A_NAME"; payload: string }
  | { type: "SET_SWITCH_B_NAME"; payload: string }
  | { type: "ADD_HOST"; payload: Host }
  | { type: "REMOVE_HOST"; payload: string }
  | { type: "UPDATE_HOST"; payload: { id: string; changes: Partial<Host> } }
  | { type: "SELECT_HOST"; payload: string | null }
  | { type: "UPDATE_CONNECTION_GROUP"; payload: ConnectionGroup }
  | { type: "REMOVE_CONNECTION_GROUP"; payload: string }
  | { type: "MARK_CLEAN" }
  | { type: "NEW_TOPOLOGY" };

function reducer(state: TopologyState, action: Action): TopologyState {
  switch (action.type) {
    case "SET_TOPOLOGY":
      return { ...action.payload, dirty: false };
    case "SET_NAME":
      return { ...state, name: action.payload, dirty: true };
    case "SET_SWITCH_A_NAME":
      return { ...state, switchAName: action.payload, dirty: true };
    case "SET_SWITCH_B_NAME":
      return { ...state, switchBName: action.payload, dirty: true };
    case "ADD_HOST":
      return {
        ...state,
        hosts: [...state.hosts, action.payload],
        connectionGroups: [
          ...state.connectionGroups,
          {
            host_id: action.payload.id,
            description: "",
            trunk_vlans: "",
            channel_group: null,
            vpc_id: null,
            switch_a_interfaces: [],
            switch_b_interfaces: [],
          },
        ],
        selectedHostId: action.payload.id,
        dirty: true,
      };
    case "REMOVE_HOST":
      return {
        ...state,
        hosts: state.hosts.filter((h) => h.id !== action.payload),
        connectionGroups: state.connectionGroups.filter(
          (cg) => cg.host_id !== action.payload
        ),
        selectedHostId:
          state.selectedHostId === action.payload
            ? null
            : state.selectedHostId,
        dirty: true,
      };
    case "UPDATE_HOST":
      return {
        ...state,
        hosts: state.hosts.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload.changes } : h
        ),
        dirty: true,
      };
    case "SELECT_HOST":
      return { ...state, selectedHostId: action.payload };
    case "UPDATE_CONNECTION_GROUP":
      return {
        ...state,
        connectionGroups: state.connectionGroups.map((cg) =>
          cg.host_id === action.payload.host_id ? action.payload : cg
        ),
        dirty: true,
      };
    case "REMOVE_CONNECTION_GROUP":
      return {
        ...state,
        connectionGroups: state.connectionGroups.filter(
          (cg) => cg.host_id !== action.payload
        ),
        dirty: true,
      };
    case "MARK_CLEAN":
      return { ...state, dirty: false };
    case "NEW_TOPOLOGY":
      return { ...initialState };
    default:
      return state;
  }
}

interface TopologyContextValue {
  state: TopologyState;
  dispatch: Dispatch<Action>;
}

const TopologyContext = createContext<TopologyContextValue | null>(null);

export function TopologyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TopologyContext.Provider value={{ state, dispatch }}>
      {children}
    </TopologyContext.Provider>
  );
}

export function useTopologyContext() {
  const ctx = useContext(TopologyContext);
  if (!ctx) throw new Error("useTopologyContext must be inside TopologyProvider");
  return ctx;
}
