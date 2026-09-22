/**
 * src/algorithms/assignment/greedyDroneSelect.ts
 *
 * Greedy drone selection strategy.
 *
 * Problem: Given a delivery at `destinationId`, which available drone
 * should be assigned?
 *
 * Greedy criterion: pick the available drone that:
 *   1. Has sufficient battery to complete the route (feasibility filter)
 *   2. Among feasible drones, is currently located closest to the
 *      delivery's source / hub (minimise deadhead flight distance)
 *
 * This is a greedy heuristic — it does not guarantee a globally optimal
 * assignment (that would require solving an assignment problem, NP-hard
 * in general), but it is O(D) where D = number of drones, fast and
 * practical for small fleets.
 *
 * Time complexity : O(D)   — single linear scan of drone list
 * Space complexity: O(1)   — constant extra space
 */

import type { Drone, Location } from '@/types';

/**
 * distanceBetween — Euclidean distance between two locations.
 * Time: O(1)
 */
function distanceBetween(a: Location, b: Location): number {
  const dx = a.pos_x - b.pos_x;
  const dy = a.pos_y - b.pos_y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * selectBestDrone — greedy: filter feasible drones, pick nearest.
 *
 * @param drones           All drones in the system
 * @param locations        All city locations (for position lookup)
 * @param requiredEnergy   Energy needed for the delivery route
 * @param hubLocationId    Where we want the drone to start from
 *                         (usually the depot / current best hub)
 * @param excludeIds       Drone ids already tried and rejected
 * @returns                Best drone or undefined if none available
 *
 * Time: O(D)
 */
export function selectBestDrone(
  drones: Drone[],
  locations: Location[],
  requiredEnergy: number,
  hubLocationId: number,
  excludeIds: Set<number> = new Set(),
): Drone | undefined {
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const hub = locationMap.get(hubLocationId);

  let bestDrone: Drone | undefined;
  let bestDist = Infinity;

  for (const drone of drones) {
    // Filter: must be available and have sufficient battery
    if (drone.status !== 'available') continue;
    if (drone.current_battery < requiredEnergy) continue;
    if (excludeIds.has(drone.id)) continue;

    // Greedy metric: closeness to hub
    const droneLoc = locationMap.get(drone.current_location);
    if (!droneLoc || !hub) {
      // If positions unknown, any feasible drone is acceptable
      if (!bestDrone) bestDrone = drone;
      continue;
    }

    const d = distanceBetween(droneLoc, hub);
    if (d < bestDist) {
      bestDist = d;
      bestDrone = drone;
    }
  }

  return bestDrone;
}

/**
 * rankDrones — return all feasible drones sorted by distance to hub.
 * Used when we want to try alternatives on feasibility failure.
 *
 * Time: O(D log D) — sort D drones
 */
export function rankDrones(
  drones: Drone[],
  locations: Location[],
  requiredEnergy: number,
  hubLocationId: number,
): Drone[] {
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const hub = locationMap.get(hubLocationId);

  const feasible = drones.filter(
    (d) => d.status === 'available' && d.current_battery >= requiredEnergy,
  );

  if (!hub) return feasible;

  return feasible.sort((a, b) => {
    const locA = locationMap.get(a.current_location);
    const locB = locationMap.get(b.current_location);
    const dA = locA ? distanceBetween(locA, hub) : Infinity;
    const dB = locB ? distanceBetween(locB, hub) : Infinity;
    return dA - dB;
  });
}
