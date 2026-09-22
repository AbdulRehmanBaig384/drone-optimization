// src/services/simulationOrchestrator.ts
//
// Full simulation pipeline implementing the DAA project proposal:
//
// Step 1: Build graph from locations + edges          [Graph ADT]
// Step 2: Load pending deliveries into priority queue  [Priority Queue / Greedy]
// Step 3: Pop highest-priority delivery               [Greedy ordering]
// Step 4: Select best available drone (nearest + battery) [Greedy assignment]
// Step 5: Compute route via Dijkstra AND A*, compare  [Dijkstra / A*]
// Step 6: Check energy feasibility; retry if needed   [Constraint check]
// Step 7: Persist assignment, update statuses         [Persistence]
//
// Returns a full step-by-step decision log for UI display.

import { fetchGraph } from './routeCalculationService';
import { getAllDrones } from '@/repositories/dronesRepo';
import { getPendingDeliveries } from '@/repositories/deliveriesRepo';
import { insertAssignment } from '@/repositories/assignmentsRepo';
import { updateDeliveryStatus } from '@/repositories/deliveriesRepo';
import { updateDroneStatus } from '@/repositories/dronesRepo';

import { DeliveryPriorityQueue } from '@/algorithms/data-structures/priorityQueue';
import { loadPendingDeliveries, selectNextDelivery } from '@/algorithms/assignment/greedyPriorityOrder';
import { rankDrones } from '@/algorithms/assignment/greedyDroneSelect';
import { dijkstra } from '@/algorithms/pathfinding/dijkstra';
import { astar } from '@/algorithms/pathfinding/astar';
import { checkEnergyFeasibility } from '@/algorithms/constraints/energyFeasibility';
import { getLocationById } from '@/algorithms/data-structures/graph';

import type { SimulationResult, SimulationLogEntry, Assignment } from '@/types';

let stepCounter = 0;

function log(
  type: SimulationLogEntry['type'],
  message: string,
  data?: Record<string, unknown>,
): SimulationLogEntry {
  return { step: ++stepCounter, type, message, data };
}

/**
 * runSimulation — executes the full delivery simulation pipeline.
 *
 * @param maxDeliveries   Max deliveries to process in one run (default: all pending)
 * @returns               SimulationResult with full log and created assignments
 */
export async function runSimulation(
  maxDeliveries = 100,
): Promise<SimulationResult> {
  stepCounter = 0;
  const logEntries: SimulationLogEntry[] = [];
  const assignments: Assignment[] = [];

  try {
    // ── STEP 1: Build graph ─────────────────────────────────────────────────
    logEntries.push(log('info', 'Step 1: Building city graph from database...'));
    const graph = await fetchGraph();
    logEntries.push(
      log('graph_built', `Graph built: ${graph.locations.length} locations, ${graph.edges.length} edges`, {
        locationCount: graph.locations.length,
        edgeCount: graph.edges.length,
        locations: graph.locations.map((l) => ({ id: l.id, name: l.name })),
      }),
    );

    // ── STEP 2: Load deliveries into priority queue ─────────────────────────
    logEntries.push(log('info', 'Step 2: Loading pending deliveries into priority queue...'));
    const pendingDeliveries = await getPendingDeliveries();
    const queue = new DeliveryPriorityQueue();
    loadPendingDeliveries(pendingDeliveries, queue);
    logEntries.push(
      log('queue_loaded', `Priority queue loaded: ${queue.size} pending deliveries`, {
        count: queue.size,
        deliveries: pendingDeliveries.map((d) => ({
          id: d.id,
          priority: d.priority,
          destination: d.destination,
        })),
      }),
    );

    if (queue.isEmpty()) {
      logEntries.push(log('info', 'No pending deliveries to process. Simulation complete.'));
      return { success: true, log: logEntries, assignments };
    }

    // Load all drones (fetched once, updated in-memory during simulation)
    let allDrones = await getAllDrones();

    let processedCount = 0;

    // ── MAIN LOOP: process deliveries one by one ────────────────────────────
    while (!queue.isEmpty() && processedCount < maxDeliveries) {
      // ── STEP 3: Pop highest-priority delivery ──────────────────────────
      logEntries.push(log('info', `── Processing delivery ${processedCount + 1} ──`));
      const delivery = selectNextDelivery(queue);
      if (!delivery) break;

      const destLoc = getLocationById(graph, delivery.destination);
      logEntries.push(
        log('delivery_selected',
          `Step 3: Selected delivery #${delivery.id} → ${destLoc?.name ?? delivery.destination} (Priority ${delivery.priority})`,
          { delivery, destinationName: destLoc?.name },
        ),
      );

      // ── STEP 4: Select best drone (greedy) ────────────────────────────
      logEntries.push(log('info', 'Step 4: Selecting best available drone (greedy: nearest + sufficient battery)...'));

      // Use hub (location 1) as the reference point for drone proximity
      const HUB_ID = graph.locations[0]?.id ?? 1;

      // First pass: rank drones with a rough energy estimate
      // We'll use a conservative estimate (all drones with any battery considered)
      const candidateDrones = rankDrones(allDrones, graph.locations, 0, HUB_ID);

      if (candidateDrones.length === 0) {
        logEntries.push(log('error', `No available drones! Delivery #${delivery.id} cannot be assigned.`));
        await updateDeliveryStatus(delivery.id, 'failed');
        processedCount++;
        continue;
      }

      let assigned = false;
      const triedDroneIds = new Set<number>();

      // Try each candidate drone in ranked order
      for (const drone of candidateDrones) {
        if (triedDroneIds.has(drone.id)) continue;
        triedDroneIds.add(drone.id);

        const droneLoc = getLocationById(graph, drone.current_location);
        logEntries.push(
          log('drone_selected',
            `Step 4: Trying drone "${drone.name}" (battery: ${drone.current_battery}/${drone.battery_capacity}, location: ${droneLoc?.name ?? drone.current_location})`,
            { drone },
          ),
        );

        // ── STEP 5: Compute route via Dijkstra AND A* ────────────────────
        logEntries.push(log('info', 'Step 5: Computing route with Dijkstra (distance) and A* (distance)...'));

        const dijkstraResult = dijkstra(graph, drone.current_location, delivery.destination, 'distance');
        const astarResult    = astar(graph, drone.current_location, delivery.destination, 'distance');

        // Also compute energy-optimised route
        const energyResult = dijkstra(graph, drone.current_location, delivery.destination, 'energy_cost');

        if (!dijkstraResult.found) {
          logEntries.push(log('error', `No path found from ${droneLoc?.name} to ${destLoc?.name}. Trying next drone.`));
          continue;
        }

        const nodesSaved = dijkstraResult.nodesExplored - astarResult.nodesExplored;

        logEntries.push(
          log('route_computed', 'Step 5: Algorithm comparison complete', {
            dijkstra: {
              path: dijkstraResult.path,
              totalCost: dijkstraResult.totalCost,
              totalDistance: dijkstraResult.totalDistance,
              totalEnergy: dijkstraResult.totalEnergy,
              nodesExplored: dijkstraResult.nodesExplored,
            },
            astar: {
              path: astarResult.path,
              totalCost: astarResult.totalCost,
              totalDistance: astarResult.totalDistance,
              totalEnergy: astarResult.totalEnergy,
              nodesExplored: astarResult.nodesExplored,
            },
            nodesSaved,
            winner: Math.abs(dijkstraResult.totalCost - astarResult.totalCost) < 0.001 ? 'tie' : 
                    dijkstraResult.totalCost <= astarResult.totalCost ? 'dijkstra' : 'astar',
          }),
        );

        // Choose the route with lower energy cost for feasibility check
        const chosenRoute = energyResult.found ? energyResult : dijkstraResult;

        // ── STEP 6: Energy feasibility check ─────────────────────────────
        logEntries.push(log('info', 'Step 6: Checking energy feasibility (with 10% safety margin)...'));
        const feasibility = checkEnergyFeasibility(drone, chosenRoute.totalEnergy, 1.1);

        logEntries.push(
          log('feasibility_check', feasibility.reason, {
            feasible: feasibility.feasible,
            required: feasibility.requiredEnergy,
            available: feasibility.availableEnergy,
            deficit: feasibility.deficit,
          }),
        );

        if (!feasibility.feasible) {
          logEntries.push(log('info', `Drone "${drone.name}" infeasible. Trying next candidate...`));
          continue;
        }

        // ── STEP 7: Persist assignment ────────────────────────────────────
        logEntries.push(log('info', 'Step 7: Persisting assignment to database...'));

        const assignment = await insertAssignment({
          delivery_id:    delivery.id,
          drone_id:       drone.id,
          route:          chosenRoute.path,
          total_distance: chosenRoute.totalDistance,
          total_energy:   chosenRoute.totalEnergy,
          algorithm_used: 'dijkstra+astar',
        });

        // Update statuses
        await updateDeliveryStatus(delivery.id, 'assigned');
        await updateDroneStatus(
          drone.id,
          'in_flight',
          drone.current_battery - chosenRoute.totalEnergy,
          delivery.destination,
        );

        // Update in-memory drone state for next iteration
        allDrones = allDrones.map((d) =>
          d.id === drone.id
            ? { ...d, status: 'in_flight', current_battery: d.current_battery - chosenRoute.totalEnergy }
            : d,
        );

        assignments.push(assignment);

        const pathNames = chosenRoute.path
          .map((id) => getLocationById(graph, id)?.name ?? `#${id}`)
          .join(' → ');

        logEntries.push(
          log('assignment_saved',
            `✓ Delivery #${delivery.id} assigned to "${drone.name}" | Route: ${pathNames} | Distance: ${chosenRoute.totalDistance.toFixed(1)} km | Energy: ${chosenRoute.totalEnergy.toFixed(1)} units`,
            { assignmentId: assignment.id, route: pathNames },
          ),
        );

        assigned = true;
        break;
      }

      if (!assigned) {
        logEntries.push(
          log('error', `Failed to assign delivery #${delivery.id}: no feasible drone found.`),
        );
        await updateDeliveryStatus(delivery.id, 'failed');
      }

      processedCount++;
    }

    logEntries.push(
      log('info', `Simulation complete. Processed ${processedCount} deliveries. ${assignments.length} assignments created.`),
    );

    return { success: true, log: logEntries, assignments };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logEntries.push(log('error', `Simulation error: ${message}`));
    return { success: false, log: logEntries, assignments };
  }
}

/**
 * runNextStep — processes only ONE pending delivery from the queue.
 * Used by the "Run Next Step" button in the simulation UI.
 */
export async function runNextStep(): Promise<SimulationResult> {
  return runSimulation(1);
}
