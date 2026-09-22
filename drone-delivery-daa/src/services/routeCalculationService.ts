// src/services/routeCalculationService.ts
// Business logic: fetches graph data, builds adjacency list,
// runs BOTH Dijkstra and A*, returns side-by-side comparison.

import { getAllLocations } from '@/repositories/locationsRepo';
import { getAllEdges } from '@/repositories/edgesRepo';
import { buildGraph } from '@/algorithms/data-structures/graph';
import { dijkstra } from '@/algorithms/pathfinding/dijkstra';
import { astar } from '@/algorithms/pathfinding/astar';
import type { WeightKey, GraphData } from '@/types';
import type { DijkstraResult } from '@/algorithms/pathfinding/dijkstra';
import type { AStarResult } from '@/algorithms/pathfinding/astar';

export interface RouteComparison {
  dijkstra: DijkstraResult;
  astar: AStarResult;
  /** Which algorithm found the shorter path (or 'tie') */
  winner: 'dijkstra' | 'astar' | 'tie';
  /** How many fewer nodes A* explored vs Dijkstra */
  nodesSaved: number;
  /** Percentage improvement in nodes explored */
  efficiencyGain: string;
  sourceId: number;
  destinationId: number;
  weightKey: WeightKey;
}

/**
 * calculateRoute — fetches the graph from DB and runs both algorithms.
 * Returns a comparison object for UI display.
 *
 * @param sourceId       Starting location id
 * @param destinationId  Destination location id
 * @param weightKey      Which edge property to minimise
 */
export async function calculateRoute(
  sourceId: number,
  destinationId: number,
  weightKey: WeightKey = 'distance',
): Promise<RouteComparison> {
  // Fetch graph data from repositories
  const [locations, edges] = await Promise.all([
    getAllLocations(),
    getAllEdges(),
  ]);

  // Build adjacency list — O(V + E)
  const graph = buildGraph(locations, edges);

  // Run both algorithms — O((V + E) log V) each
  const dijkstraResult = dijkstra(graph, sourceId, destinationId, weightKey);
  const astarResult    = astar(graph, sourceId, destinationId, weightKey);

  // Compare results
  const nodesSaved = dijkstraResult.nodesExplored - astarResult.nodesExplored;
  const efficiencyGain =
    dijkstraResult.nodesExplored > 0
      ? `${Math.round((nodesSaved / dijkstraResult.nodesExplored) * 100)}%`
      : '0%';

  let winner: RouteComparison['winner'] = 'tie';
  if (dijkstraResult.totalCost < astarResult.totalCost - 0.0001) winner = 'dijkstra';
  else if (astarResult.totalCost < dijkstraResult.totalCost - 0.0001) winner = 'astar';

  return {
    dijkstra: dijkstraResult,
    astar: astarResult,
    winner,
    nodesSaved,
    efficiencyGain,
    sourceId,
    destinationId,
    weightKey,
  };
}

/**
 * fetchGraph — returns the full graph for use in other services.
 * Exported so the simulation orchestrator can call it directly.
 */
export async function fetchGraph(): Promise<GraphData> {
  const [locations, edges] = await Promise.all([
    getAllLocations(),
    getAllEdges(),
  ]);
  return buildGraph(locations, edges);
}
