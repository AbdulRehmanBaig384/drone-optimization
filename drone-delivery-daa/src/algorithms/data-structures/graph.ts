/**
 * src/algorithms/data-structures/graph.ts
 *
 * Builds an adjacency-list representation of the city graph from
 * a flat array of Location and Edge records (as loaded from Supabase).
 *
 * Space complexity : O(V + E)  — one entry per location, one per edge direction
 * Time  complexity : O(E)      — single pass over edges to build the list
 * Neighbor lookup  : O(1)      — direct Map access by location id
 *
 * DESIGN NOTE: edges are treated as UNDIRECTED (drones can fly either way),
 * so each edge is stored in both directions.
 */

import type { Location, Edge, AdjacencyEntry, GraphData, WeightKey } from '@/types';

/**
 * buildGraph — converts raw DB rows into a ready-to-use adjacency map.
 *
 * @param locations  Array of location records from the DB
 * @param edges      Array of edge records from the DB
 * @returns          GraphData object containing the adjacency map
 *
 * Time  : O(E)  — iterates edges twice (once per direction)
 * Space : O(V + E)
 */
export function buildGraph(locations: Location[], edges: Edge[]): GraphData {
  // Initialise adjacency list with an empty array for every known location id
  // O(V)
  const adjacency = new Map<number, AdjacencyEntry[]>();
  for (const loc of locations) {
    adjacency.set(loc.id, []);
  }

  // Populate adjacency entries — treat every edge as bidirectional
  // O(E)
  for (const edge of edges) {
    const forward: AdjacencyEntry = {
      to: edge.to_location,
      distance: edge.distance,
      travel_time: edge.travel_time,
      energy_cost: edge.energy_cost,
      edge_id: edge.id,
    };
    const backward: AdjacencyEntry = {
      to: edge.from_location,
      distance: edge.distance,
      travel_time: edge.travel_time,
      energy_cost: edge.energy_cost,
      edge_id: edge.id,
    };

    // Guard: only add if the node is in our map
    if (adjacency.has(edge.from_location)) {
      adjacency.get(edge.from_location)!.push(forward);
    }
    if (adjacency.has(edge.to_location)) {
      adjacency.get(edge.to_location)!.push(backward);
    }
  }

  return { locations, edges, adjacency };
}

/**
 * getNeighbors — returns adjacency list for a node.
 * Time: O(1) — direct Map.get
 */
export function getNeighbors(
  graph: GraphData,
  locationId: number,
): AdjacencyEntry[] {
  return graph.adjacency.get(locationId) ?? [];
}

/**
 * getLocationById — O(V) linear scan over locations array.
 * For small V (< 100 city nodes) this is acceptable.
 */
export function getLocationById(
  graph: GraphData,
  id: number,
): Location | undefined {
  return graph.locations.find((l) => l.id === id);
}

/**
 * edgeWeight — extracts the numeric weight for a given WeightKey.
 * Used as a weight-function callback by Dijkstra / A*.
 */
export function edgeWeight(entry: AdjacencyEntry, key: WeightKey): number {
  return entry[key];
}
