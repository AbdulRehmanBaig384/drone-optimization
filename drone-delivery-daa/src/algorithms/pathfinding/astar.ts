/**
 * src/algorithms/pathfinding/astar.ts
 *
 * A* (A-star) informed search algorithm.
 *
 * A* improves on Dijkstra by using a heuristic h(n) to guide the search
 * toward the destination, typically exploring far fewer nodes.
 *
 * f(n) = g(n) + h(n)
 *   g(n) = actual cost from source to n   (same as Dijkstra)
 *   h(n) = heuristic estimate from n to goal (Euclidean distance here)
 *
 * Time complexity  : O((V + E) log V) worst-case (same as Dijkstra)
 *                    but in practice explores fewer nodes with a good heuristic
 * Space complexity : O(V)
 *
 * OPTIMALITY: A* is optimal (finds the true shortest path) if and only if
 * the heuristic is admissible (h(n) ≤ actual cost). Our Euclidean heuristic
 * is admissible because straight-line distance ≤ road distance.
 */

import { MinHeap } from '../data-structures/minHeap';
import { getNeighbors, getLocationById } from '../data-structures/graph';
import { buildHeuristic } from './heuristics';
import type { GraphData, WeightKey } from '@/types';

export interface AStarResult {
  path: number[];
  totalCost: number;
  totalDistance: number;
  totalEnergy: number;
  nodesExplored: number;
  found: boolean;
  weightKey: WeightKey;
}

/**
 * astar — informed shortest-path search from `sourceId` to `destinationId`.
 *
 * @param graph          Adjacency-list graph (must include location pos_x/pos_y)
 * @param sourceId       Starting location id
 * @param destinationId  Target location id
 * @param weightKey      Which edge property to minimise
 *
 * Time : O((V + E) log V) worst-case, better in practice
 * Space: O(V)
 */
export function astar(
  graph: GraphData,
  sourceId: number,
  destinationId: number,
  weightKey: WeightKey = 'distance',
): AStarResult {
  const goalLoc = getLocationById(graph, destinationId);
  if (!goalLoc) {
    return { path: [], totalCost: Infinity, totalDistance: 0, totalEnergy: 0, nodesExplored: 0, found: false, weightKey };
  }

  // Build the heuristic function h(location) — O(E) once
  const h = buildHeuristic(graph, weightKey, goalLoc);

  // g[id] = actual cost from source to id
  const g = new Map<number, number>();
  // f[id] = g[id] + h(id)  — the A* priority key
  const prev = new Map<number, number | null>();
  const closed = new Set<number>(); // nodes fully processed

  let nodesExplored = 0;

  // Initialise — O(V)
  for (const loc of graph.locations) {
    g.set(loc.id, Infinity);
    prev.set(loc.id, null);
  }
  g.set(sourceId, 0);

  const sourceLoc = getLocationById(graph, sourceId)!;
  const fSource = 0 + h(sourceLoc);

  // Open set as a min-heap keyed by f(n)
  const openHeap = new MinHeap<number>();
  openHeap.insert(fSource, sourceId);

  // Main loop
  while (!openHeap.isEmpty()) {
    const node = openHeap.extractMin(); // O(log V)
    if (!node) break;

    const u = node.value;

    if (closed.has(u)) continue; // stale entry — skip
    closed.add(u);
    nodesExplored++;

    // Goal reached
    if (u === destinationId) break;

    const uLoc = getLocationById(graph, u);
    if (!uLoc) continue;

    const gU = g.get(u) ?? Infinity;

    for (const neighbor of getNeighbors(graph, u)) {
      const v = neighbor.to;
      if (closed.has(v)) continue;

      const weight = neighbor[weightKey] as number;
      const tentativeG = gU + weight;

      if (tentativeG < (g.get(v) ?? Infinity)) {
        g.set(v, tentativeG);
        prev.set(v, u);

        const vLoc = getLocationById(graph, v);
        const fV = tentativeG + (vLoc ? h(vLoc) : 0);
        openHeap.insert(fV, v); // lazy insert — O(log V)
      }
    }
  }

  // Path reconstruction — O(V)
  const path = reconstructPath(prev, sourceId, destinationId);
  const { totalDistance, totalEnergy } = computePathMetrics(graph, path);

  return {
    path,
    totalCost: g.get(destinationId) ?? Infinity,
    totalDistance,
    totalEnergy,
    nodesExplored,
    found: path.length > 0 && path[path.length - 1] === destinationId,
    weightKey,
  };
}

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
  if (path[0] !== sourceId) return [];
  return path;
}

function computePathMetrics(
  graph: GraphData,
  path: number[],
): { totalDistance: number; totalEnergy: number } {
  let totalDistance = 0;
  let totalEnergy = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = getNeighbors(graph, from).find((n) => n.to === to);
    if (edge) {
      totalDistance += edge.distance;
      totalEnergy += edge.energy_cost;
    }
  }
  return { totalDistance, totalEnergy };
}
