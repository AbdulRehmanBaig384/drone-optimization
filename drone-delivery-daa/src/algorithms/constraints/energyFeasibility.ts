/**
 * src/algorithms/constraints/energyFeasibility.ts
 *
 * Energy feasibility constraint check for drone delivery routes.
 *
 * Problem: Before committing to a route assignment, verify that the
 * chosen drone has enough battery to complete the route.
 *
 * This is a constraint-satisfaction check used as a gate in the
 * simulation orchestrator pipeline. If infeasible, the orchestrator
 * backtracks and tries the next available drone.
 *
 * Time complexity : O(1)  — simple numeric comparison
 * Space complexity: O(1)
 *
 * EXTENSION: if we want to add a safety margin (e.g., drone must
 * retain 10% battery for return-to-base), multiply required energy
 * by a `safetyFactor` > 1. Default is 1.0 (no margin).
 */

import type { Drone } from '@/types';

export interface FeasibilityResult {
  feasible: boolean;
  droneId: number;
  requiredEnergy: number;
  availableEnergy: number;
  deficit: number;           // 0 if feasible, positive if infeasible
  safetyFactor: number;
  reason: string;
}

/**
 * checkEnergyFeasibility — determine if a drone can complete a route.
 *
 * @param drone          The candidate drone
 * @param routeEnergy    Total energy cost of the computed route
 * @param safetyFactor   Multiplier applied to routeEnergy (default 1.0)
 *                       Set to 1.1 for a 10% safety margin.
 *
 * Time : O(1)
 * Space: O(1)
 */
export function checkEnergyFeasibility(
  drone: Drone,
  routeEnergy: number,
  safetyFactor = 1.0,
): FeasibilityResult {
  const required = routeEnergy * safetyFactor;
  const available = drone.current_battery;
  const feasible = available >= required;
  const deficit = feasible ? 0 : required - available;

  return {
    feasible,
    droneId: drone.id,
    requiredEnergy: required,
    availableEnergy: available,
    deficit,
    safetyFactor,
    reason: feasible
      ? `Drone ${drone.name} has sufficient battery (${available.toFixed(1)} ≥ ${required.toFixed(1)})`
      : `Drone ${drone.name} has insufficient battery (${available.toFixed(1)} < ${required.toFixed(1)}, deficit: ${deficit.toFixed(1)})`,
  };
}

/**
 * estimateMinEnergy — quick lower-bound energy estimate for a path
 * based on known total distance and a per-km energy rate.
 *
 * Used to pre-filter drones before running the full route algorithm.
 *
 * @param distance   Estimated route distance (km)
 * @param ratePerKm  Energy units consumed per km (defaults to 1.0)
 *
 * Time: O(1)
 */
export function estimateMinEnergy(distance: number, ratePerKm = 1.0): number {
  return distance * ratePerKm;
}
