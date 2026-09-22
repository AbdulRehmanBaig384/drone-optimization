/**
 * src/algorithms/__tests__/astar.test.ts
 *
 * Unit tests for A* pathfinding.
 * Uses the same 5-node fixture as Dijkstra tests.
 * Key assertions: A* finds the same optimal path as Dijkstra
 * but explores ≤ nodes (guided by heuristic).
 */

import { describe, it, expect } from 'vitest';
import { buildGraph } from '../data-structures/graph';
import { dijkstra } from '../pathfinding/dijkstra';
import { astar } from '../pathfinding/astar';
import type { Location, Edge } from '@/types';

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

describe('A* – distance weight', () => {
  it('finds same optimal path as Dijkstra (1→3→4→5, cost 6)', () => {
    const dResult = dijkstra(graph, 1, 5, 'distance');
    const aResult = astar(graph, 1, 5, 'distance');

    expect(aResult.found).toBe(true);
    expect(aResult.totalCost).toBeCloseTo(dResult.totalCost, 5);
    expect(aResult.path).toEqual(dResult.path);
  });

  it('explores ≤ nodes compared to Dijkstra (heuristic benefit)', () => {
    const dResult = dijkstra(graph, 1, 5, 'distance');
    const aResult = astar(graph, 1, 5, 'distance');
    // A* should be at least as efficient (can be equal on tiny graphs)
    expect(aResult.nodesExplored).toBeLessThanOrEqual(dResult.nodesExplored);
  });

  it('finds path 2→5 with cost 4', () => {
    const result = astar(graph, 2, 5, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(4, 5);
    expect(result.path).toEqual([2, 4, 5]);
  });

  it('handles source === destination', () => {
    const result = astar(graph, 3, 3, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(0, 5);
  });
});

describe('A* – energy_cost weight', () => {
  it('finds same path as Dijkstra for energy_cost', () => {
    const dResult = dijkstra(graph, 1, 5, 'energy_cost');
    const aResult = astar(graph, 1, 5, 'energy_cost');

    expect(aResult.found).toBe(true);
    expect(aResult.totalCost).toBeCloseTo(dResult.totalCost, 5);
  });
});

describe('A* – disconnected graph', () => {
  it('returns found=false when destination is unreachable', () => {
    const isolatedLocs: Location[] = [
      ...locations,
      { id: 6, name: 'Isolated', pos_x: 100, pos_y: 100 },
    ];
    const isolatedGraph = buildGraph(isolatedLocs, edges);
    const result = astar(isolatedGraph, 1, 6, 'distance');
    expect(result.found).toBe(false);
  });
});

describe('A* – correctness on larger graph', () => {
  it('finds optimal path on a 6-node graph with known answer', () => {
    //  1 --1-- 2 --1-- 3
    //  |               |
    //  4      --5--    5
    //  |               |
    //  +-------1-------6
    // Shortest 1→3: 1→2→3 = 2
    const locs: Location[] = [
      { id: 1, name: 'A', pos_x: 0, pos_y: 0 },
      { id: 2, name: 'B', pos_x: 1, pos_y: 0 },
      { id: 3, name: 'C', pos_x: 2, pos_y: 0 },
      { id: 4, name: 'D', pos_x: 0, pos_y: 1 },
      { id: 5, name: 'E', pos_x: 2, pos_y: 1 },
      { id: 6, name: 'F', pos_x: 1, pos_y: 1 },
    ];
    const es: Edge[] = [
      { id: 1, from_location: 1, to_location: 2, distance: 1, travel_time: 1, energy_cost: 1 },
      { id: 2, from_location: 2, to_location: 3, distance: 1, travel_time: 1, energy_cost: 1 },
      { id: 3, from_location: 1, to_location: 4, distance: 4, travel_time: 4, energy_cost: 4 },
      { id: 4, from_location: 3, to_location: 5, distance: 4, travel_time: 4, energy_cost: 4 },
      { id: 5, from_location: 4, to_location: 6, distance: 5, travel_time: 5, energy_cost: 5 },
      { id: 6, from_location: 5, to_location: 6, distance: 1, travel_time: 1, energy_cost: 1 },
      { id: 7, from_location: 4, to_location: 5, distance: 5, travel_time: 5, energy_cost: 5 },
    ];
    const g = buildGraph(locs, es);
    const result = astar(g, 1, 3, 'distance');
    expect(result.found).toBe(true);
    expect(result.totalCost).toBeCloseTo(2, 5);
    expect(result.path).toEqual([1, 2, 3]);
  });
});
