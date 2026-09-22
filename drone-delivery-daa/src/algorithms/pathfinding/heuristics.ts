/**
 * src/algorithms/pathfinding/heuristics.ts
 *
 * Heuristic functions for A* pathfinding on the city graph.
 *
 * Admissibility requirement: h(n) must NEVER overestimate the true cost
 * to reach the goal, otherwise A* may not find the optimal path.
 *
 * For distance-based A*: Euclidean distance on (pos_x, pos_y) coordinates
 * is admissible because straight-line distance ≤ actual road distance.
 *
 * For energy-based A*: we use a scaled Euclidean distance, assuming
 * the minimum energy-per-unit-distance in the entire graph as our scale factor.
 * This keeps the heuristic admissible.
 *
 * Time: O(1) per call
 * Space: O(1)
 */

import type { Location, GraphData, WeightKey } from '@/types';

/**
 * euclideanDistance — straight-line distance between two locations.
 * Used as the admissible heuristic for distance-weighted A*.
 *
 * Time: O(1)
 */
export function euclideanDistance(a: Location, b: Location): number {
  const dx = a.pos_x - b.pos_x;
  const dy = a.pos_y - b.pos_y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * buildHeuristic — factory that returns the correct h(n) function
 * for a given WeightKey.
 *
 * - 'distance'    → straight Euclidean distance (trivially admissible)
 * - 'energy_cost' → Euclidean * minEnergyPerKm (admissible if scale ≤ any edge ratio)
 * - 'travel_time' → Euclidean * minTimePerKm   (admissible)
 *
 * @param graph      Full graph (used to compute the min weight/km ratio)
 * @param weightKey  Which edge property we are optimising
 * @param goal       Destination location
 * @returns          A function h(location) → estimated remaining cost
 *
 * Time to build: O(E) to compute min ratio; each h() call is O(1)
 */
export function buildHeuristic(
  graph: GraphData,
  weightKey: WeightKey,
  goal: Location,
): (loc: Location) => number {
  if (weightKey === 'distance') {
    // h(n) = Euclidean distance — always admissible for distance
    return (loc: Location) => euclideanDistance(loc, goal);
  }

  // For energy_cost and travel_time we need to scale the Euclidean distance
  // by the minimum weight-per-unit-distance ratio seen across all edges.
  // This guarantees h(n) ≤ actual cost (admissibility).
  let minRatio = Infinity;
  for (const edge of graph.edges) {
    if (edge.distance > 0) {
      const ratio = edge[weightKey] / edge.distance;
      if (ratio < minRatio) minRatio = ratio;
    }
  }

  // If no ratio found (no edges with distance > 0), fall back to 0 heuristic
  // making A* degrade to Dijkstra (still correct, just not guided).
  if (!isFinite(minRatio)) minRatio = 0;

  return (loc: Location) => euclideanDistance(loc, goal) * minRatio;
}
