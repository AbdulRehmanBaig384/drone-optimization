/**
 * src/algorithms/data-structures/priorityQueue.ts
 *
 * A priority queue for DeliveryRequest objects backed by MinHeap.
 *
 * Ordering rule (lower key = served first):
 *   key = priority_level * 1000 + wait_seconds_normalized
 *
 * This means:
 *   - Priority 1 deliveries are always served before priority 2, etc.
 *   - Among equal priority levels, the one waiting longest is served first
 *     (FIFO fairness within the same tier).
 *
 * Enqueue  : O(log n)
 * Dequeue  : O(log n)  — extract-min from underlying heap
 * Peek     : O(1)
 * Space    : O(n)
 */

import { MinHeap } from './minHeap';
import type { DeliveryRequest } from '@/types';

/**
 * Compute a composite sort key so that:
 *   1. lower priority number → served sooner (more urgent)
 *   2. older creation time  → served sooner (FIFO within same priority)
 *
 * key = priority * 1_000_000 - created_at_unix_ms
 *
 * Subtracting the timestamp means older items have a LOWER key (served first).
 * We cap the timestamp contribution at 999_999 to avoid overflow.
 *
 * Time: O(1)
 */
function computeKey(delivery: DeliveryRequest): number {
  const ageFactor = Date.now() - new Date(delivery.created_at).getTime();
  // Normalize age to [0, 999999] ms range; older items get lower keys
  const normalizedAge = Math.min(ageFactor, 999_999);
  return delivery.priority * 1_000_000 - normalizedAge;
}

export class DeliveryPriorityQueue {
  private heap: MinHeap<DeliveryRequest> = new MinHeap();

  get size(): number {
    return this.heap.size;
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  /**
   * enqueue — insert a delivery with computed priority key.
   * Time: O(log n)
   */
  enqueue(delivery: DeliveryRequest): void {
    const key = computeKey(delivery);
    this.heap.insert(key, delivery);
  }

  /**
   * dequeue — extract highest-priority (lowest-key) delivery.
   * Time: O(log n)
   */
  dequeue(): DeliveryRequest | undefined {
    return this.heap.extractMin()?.value;
  }

  /**
   * peek — view next delivery without removing.
   * Time: O(1)
   */
  peek(): DeliveryRequest | undefined {
    return this.heap.peek()?.value;
  }

  /**
   * loadAll — batch-enqueue from an array of deliveries.
   * Time: O(n log n)
   */
  loadAll(deliveries: DeliveryRequest[]): void {
    for (const d of deliveries) {
      this.enqueue(d);
    }
  }

  /**
   * toSortedArray — drain queue into a sorted array (destructive).
   * Time: O(n log n)
   */
  toSortedArray(): DeliveryRequest[] {
    const result: DeliveryRequest[] = [];
    while (!this.isEmpty()) {
      const item = this.dequeue();
      if (item) result.push(item);
    }
    return result;
  }
}
