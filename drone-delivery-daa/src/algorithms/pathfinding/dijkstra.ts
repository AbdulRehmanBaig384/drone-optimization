/**
 * src/algorithms/pathfinding/dijkstra.ts
 *
 * Dijkstra's single-source shortest-path algorithm.
 *
 * Time complexity : O((V + E) log V)  — binary min-heap, each node extracted once
 * Space complexity: O(V)              — dist[], prev[], visited set, heap
 *
 * The weight function is configurable (distance, energy_cost, or travel_time),
 * making this reusable for different optimisation objectives.
 *
 * CORRECTNESS INVARIANT: Dijkstra works correctly when all edge weights ≥ 0.
 * All three weight types (distance, energy_cost, travel_time) are non-negative
 * by physical constraint, so the algorithm is always valid here.
 */

import { MinHeap } from '../data-structures/minHeap';
import { getNeighbors, getLocationById } from '../data-structures/graph';
import type { GraphData, WeightKey, AdjacencyEntry } from '@/types';

export interface DijkstraResult {
  /** Ordered path from source to destination (array of location ids) */
  path: number[];
  /** Total weight along the shortest path */
  totalCost: number;
  /** Total distance (km) along the chosen path */
  totalDistance: number;
  /** Total energy cost along the chosen path */
  totalEnergy: number;
  /** Number of nodes explored (visited) — useful for comparing with A* */
  nodesExplored: number;
  /** Whether a path was found */
  found: boolean;
  /** Which weight was minimised */
  weightKey: WeightKey;
}

/**
 * dijkstra — find the shortest path from `sourceId` to `destinationId`.
 *
 * @param graph        Adjacency-list graph
 * @param sourceId     Starting location id
 * @param destinationId Target location id
 * @param weightKey    Which edge property to minimise ('distance' | 'energy_cost' | 'travel_time')
 *
 * Time : O((V + E) log V)
 * Space: O(V)
 */
export function dijkstra(
  graph: GraphData,
  sourceId: number,
  destinationId: number,
  weightKey: WeightKey = 'distance',
): DijkstraResult {
  // dist[id] = best known cost from source to node id
  const dist = new Map<number, number>();
  // prev[id] = predecessor node on the shortest-path tree
  const prev = new Map<number, number | null>();
  // visited = set of nodes whose shortest path has been finalised
  const visited = new Set<number>();

  let nodesExplored = 0;

  // Initialise all distances to Infinity — O(V)
  for (const loc of graph.locations) {
    dist.set(loc.id, Infinity);
    prev.set(loc.id, null);
  }
  dist.set(sourceId, 0);

  // Min-heap keyed by tentative distance
  const heap = new MinHeap<number>();
  heap.insert(0, sourceId);

  // Main loop — O((V + E) log V)
  while (!heap.isEmpty()) {
    const node = heap.extractMin(); // O(log V)
    if (!node) break;

    const { value: u, key: uDist } = node;

    // Skip stale heap entries (lazy deletion pattern)
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored++;

    // Early termination: once we finalise the destination, we are done
    if (u === destinationId) break;

    // Relax edges — O(deg(u) log V) amortised across all iterations
    const neighbours = getNeighbors(graph, u);
    for (const neighbor of neighbours) {
      const v = neighbor.to;
      if (visited.has(v)) continue;

      const weight = neighbor[weightKey] as number;
      const tentative = uDist + weight;

      if (tentative < (dist.get(v) ?? Infinity)) {
        dist.set(v, tentative);
        prev.set(v, u);
        heap.insert(tentative, v); // O(log V) — lazy insert (duplicate allowed)
      }
    }
  }

  // Reconstruct path by walking prev[] backwards — O(V)
  const path = reconstructPath(prev, sourceId, destinationId);

  // Compute secondary metrics (distance + energy) along the chosen path
  const { totalDistance, totalEnergy } = computePathMetrics(graph, path);

  return {
    path,
    totalCost: dist.get(destinationId) ?? Infinity,
    totalDistance,
    totalEnergy,
    nodesExplored,
    found: path.length > 0 && path[path.length - 1] === destinationId,
    weightKey,
  };
}

/**
 * reconstructPath — traces predecessor map back from destination to source.
 * Time: O(V) worst-case path length
 */
function reconstructPath(
  prev: Map<number, number | null>,
  sourceId: number,
  destinationId: number,
): number[] {
  const path: number[] = [];
  let current: number | null | undefined = destinationId;

  while (current !== null && current !== undefined) {
    path.unshift(current);
    if (current === sourceId) break;
    current = prev.get(current);
  }

  // If path doesn't start at source, no valid path was found
  if (path[0] !== sourceId) return [];
  return path;
}

/**
 * computePathMetrics — sum distance and energy for a given path.
 * Time: O(path length * avg degree) — looks up edges for each consecutive pair
 */
function computePathMetrics(
  graph: GraphData,
  path: number[],
): { totalDistance: number; totalEnergy: number } {
  let totalDistance = 0;
  let totalEnergy = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const neighbors = getNeighbors(graph, from);
    const edge = neighbors.find((n) => n.to === to);
    if (edge) {
      totalDistance += edge.distance;
      totalEnergy += edge.energy_cost;
    }
  }

  return { totalDistance, totalEnergy };
}
