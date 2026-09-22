/**
 * src/algorithms/__tests__/greedyDroneSelect.test.ts
 *
 * Unit tests for greedy drone selection algorithm.
 * Validates: battery filter, nearest-first preference, exclusion list.
 */

import { describe, it, expect } from 'vitest';
import { selectBestDrone, rankDrones } from '../assignment/greedyDroneSelect';
import type { Drone, Location } from '@/types';

const locations: Location[] = [
  { id: 1, name: 'Hub',    pos_x: 0, pos_y: 0 },
  { id: 2, name: 'Near',   pos_x: 1, pos_y: 0 },
  { id: 3, name: 'Far',    pos_x: 10, pos_y: 0 },
];

const drones: Drone[] = [
  { id: 1, name: 'Drone-A', battery_capacity: 100, current_battery: 80,  current_location: 2, status: 'available' },
  { id: 2, name: 'Drone-B', battery_capacity: 100, current_battery: 20,  current_location: 2, status: 'available' },
  { id: 3, name: 'Drone-C', battery_capacity: 100, current_battery: 100, current_location: 3, status: 'in_flight' },
  { id: 4, name: 'Drone-D', battery_capacity: 100, current_battery: 90,  current_location: 3, status: 'available' },
];

describe('selectBestDrone', () => {
  it('selects nearest available drone with sufficient battery', () => {
    // Required energy = 50; Drone-A (battery 80, loc 2=near) vs Drone-D (battery 90, loc 3=far)
    // Drone-B is filtered out (battery 20 < 50)
    // Drone-C is filtered out (status in_flight)
    const best = selectBestDrone(drones, locations, 50, 1);
    expect(best?.id).toBe(1); // Drone-A is nearest hub with enough battery
  });

  it('filters drones with insufficient battery', () => {
    // Required energy = 85 — only Drone-D (90) qualifies (Drone-A has 80)
    const best = selectBestDrone(drones, locations, 85, 1);
    expect(best?.id).toBe(4); // Drone-D
  });

  it('filters drones not in available status', () => {
    const allBusy: Drone[] = drones.map((d) => ({ ...d, status: 'in_flight' as const }));
    const best = selectBestDrone(allBusy, locations, 10, 1);
    expect(best).toBeUndefined();
  });

  it('respects excludeIds set', () => {
    // Exclude Drone-A → should pick Drone-D
    const best = selectBestDrone(drones, locations, 50, 1, new Set([1]));
    expect(best?.id).toBe(4);
  });

  it('returns undefined when no drones available', () => {
    const best = selectBestDrone([], locations, 10, 1);
    expect(best).toBeUndefined();
  });
});

describe('rankDrones', () => {
  it('returns drones sorted by distance to hub (nearest first)', () => {
    const ranked = rankDrones(drones, locations, 50, 1);
    // Drone-A (loc 2, near) should be before Drone-D (loc 3, far)
    expect(ranked[0].id).toBe(1); // Drone-A nearest
    expect(ranked[1].id).toBe(4); // Drone-D farther
  });

  it('filters out drones with insufficient energy', () => {
    // Required 85: only Drone-D qualifies
    const ranked = rankDrones(drones, locations, 85, 1);
    expect(ranked.length).toBe(1);
    expect(ranked[0].id).toBe(4);
  });

  it('filters out non-available drones', () => {
    const ranked = rankDrones(drones, locations, 10, 1);
    // Drone-C is in_flight → excluded
    const ids = ranked.map((d) => d.id);
    expect(ids).not.toContain(3);
  });
});
