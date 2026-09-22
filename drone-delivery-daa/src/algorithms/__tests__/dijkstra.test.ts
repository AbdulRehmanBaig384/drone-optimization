/**
 * src/algorithms/__tests__/dijkstra.test.ts
 *
 * Unit tests for Dijkstra's shortest-path algorithm.
 * Validates correctness on small graphs with known expected outputs.
 * Also verifies complexity assumptions via nodesExplored counts.
 */

import { describe, it, expect } from 'vitest';
import { buildGraph } from '../data-structures/graph';
import { dijkstra } from '../pathfinding/dijkstra';
import type { Location, Edge } from '@/types';

// ── Test fixture: a small 5-node graph ───────────────────────────────────────
//
//   1 ──5──> 2
//   |        |
//   3        2
//   |        |
//   3 ──1──> 4 ──2──> 5
//
// Locations: 1-5, edges directed (stored bidirectional in graph)
// Shortest distance 1→5: 1→3→4→5 = 3+1+2 = 6
// Shortest distance 1→2: 1→2 = 5  OR  1→3→4 (cost 4) ... no path from 4 to 2
// so 1→2 = 5 via direct edge
// Shortest distance 2→5: 2→4→5 = 2+2 = 4

const locations: Location[] = [
  { id: 1, name: 'Alpha',   pos_x: 0, pos_y: 0 },
  { id: 2, name: 'Beta',    pos_x: 5, pos_y: 0 },
  { id: 3, name: 'Gamma',   pos_x: 0, pos_y: 3 },
  { id: 4, name: 'Delta',   pos_x: 1, pos_y: 3 },
  { id: 5, name: 'Epsilon', pos_x: 3, pos_y: 3 },
];

const edges: Edge[] = [
  { id: 1, from_location: 1, to_location: 2, distance: 5, travel_time: 10, energy_cost: 5 },
  { id: 2, from_location: 1, to_location: 3, distance: 3, travel_time:  6, energy_cost: 3 },
  { id: 3, from_location: 2, to_location: 4, distance: 2, travel_time:  4, energy_cost: 2 },
  { id: 4, from_location: 3, to_location: 4, distance: 1, travel_time:  2, energy_cost: 1 },
  { id: 5, from_location: 4, to_location: 5, distance: 2, travel_time:  4, energy_cost: 2 },
];

const graph = buildGraph(locations, edges);

describe('Dijkstra – distance weight', () => {
  it('finds shortest path 1→5 with cost 6 (1→3→4→5)', () => {
    const result = dijkstra(graph, 1, 5, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(6, 5);
    expect(result.path).toEqual([1, 3, 4, 5]);
  });

  it('finds shortest path 1→2 with cost 5 (direct edge)', () => {
    const result = dijkstra(graph, 1, 2, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(5, 5);
    expect(result.path).toEqual([1, 2]);
  });

  it('finds shortest path 2→5 with cost 4 (2→4→5)', () => {
    const result = dijkstra(graph, 2, 5, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(4, 5);
    expect(result.path).toEqual([2, 4, 5]);
  });

  it('returns found=true when source equals destination', () => {
    const result = dijkstra(graph, 3, 3, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(0, 5);
  });

  it('explores at most V nodes for a simple graph', () => {
    const result = dijkstra(graph, 1, 5, 'distance');
    // With early termination, should not explore more nodes than V
    expect(result.nodesExplored).toBeLessThanOrEqual(locations.length);
  });
});

describe('Dijkstra – energy_cost weight', () => {
  it('finds shortest path 1→5 by energy (1→3→4→5 = 3+1+2 = 6)', () => {
    const result = dijkstra(graph, 1, 5, 'energy_cost');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(6, 5);
    expect(result.path).toEqual([1, 3, 4, 5]);
  });
});

describe('Dijkstra – disconnected graph', () => {
  it('returns found=false when no path exists', () => {
    // Isolated node 6 not connected to anything
    const isolatedLocs: Location[] = [
      ...locations,
      { id: 6, name: 'Isolated', pos_x: 100, pos_y: 100 },
    ];
    const isolatedGraph = buildGraph(isolatedLocs, edges);
    const result = dijkstra(isolatedGraph, 1, 6, 'distance');
    expect(result.found).toBe(false);
    expect(result.totalCost).toBe(Infinity);
  });
});

describe('Dijkstra – secondary metrics', () => {
  it('computes correct totalDistance and totalEnergy for 1→3→4→5', () => {
    const result = dijkstra(graph, 1, 5, 'distance');
    expect(result.totalDistance).toBeCloseTo(6, 5);
    expect(result.totalEnergy).toBeCloseTo(6, 5);
  });
});
