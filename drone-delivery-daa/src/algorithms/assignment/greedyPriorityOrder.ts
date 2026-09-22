/**
 * src/algorithms/assignment/greedyPriorityOrder.ts
 *
 * Greedy delivery ordering strategy.
 *
 * Algorithm: Pop the highest-priority pending delivery from the
 * DeliveryPriorityQueue (min-heap by priority + age).
 *
 * Greedy choice property: "always serve the most urgent delivery first"
 * — this is a greedy strategy because we make a locally optimal choice
 * at each step without reconsidering past choices.
 *
 * Time complexity: O(log n) — delegates to heap extract-min
 * Space complexity: O(1) extra (queue is maintained externally)
 *
 * Note: This greedy strategy does NOT guarantee globally optimal
 * throughput (e.g., interleaving may be better), but it is simple,
 * predictable, and provably correct for priority-respecting service.
 */

import { DeliveryPriorityQueue } from '../data-structures/priorityQueue';
import type { DeliveryRequest } from '@/types';

/**
 * selectNextDelivery — greedy: pop the highest-priority delivery.
 *
 * @param queue  The current delivery priority queue
 * @returns      The next delivery to process, or undefined if empty
 *
 * Time: O(log n)
 */
export function selectNextDelivery(
  queue: DeliveryPriorityQueue,
): DeliveryRequest | undefined {
  return queue.dequeue();
}

/**
 * loadPendingDeliveries — batch-loads all pending deliveries into the queue.
 * Filters to only 'pending' status before enqueuing.
 *
 * Time: O(n log n) — n inserts each O(log n)
 */
export function loadPendingDeliveries(
  deliveries: DeliveryRequest[],
  queue: DeliveryPriorityQueue,
): void {
  const pending = deliveries.filter((d) => d.status === 'pending');
  queue.loadAll(pending);
}
