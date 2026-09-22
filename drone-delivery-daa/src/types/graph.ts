// ============================================================
// src/types/graph.ts
// Type definitions for the city graph (locations + edges)
// ============================================================

export interface Location {
  id: number;
  name: string;
  pos_x: number;
  pos_y: number;
}

export interface Edge {
  id: number;
  from_location: number;
  to_location: number;
  distance: number;       // km
  travel_time: number;    // minutes
  energy_cost: number;    // battery units consumed
}

/** Adjacency list entry for a single neighbor */
export interface AdjacencyEntry {
  to: number;
  distance: number;
  travel_time: number;
  energy_cost: number;
  edge_id: number;
}

/** Full graph structure used by pathfinding algorithms */
export interface GraphData {
  locations: Location[];
  edges: Edge[];
  /** adjacency[locationId] → list of neighbors */
  adjacency: Map<number, AdjacencyEntry[]>;
}

/** Weight key selectable by the caller */
export type WeightKey = 'distance' | 'energy_cost' | 'travel_time';
