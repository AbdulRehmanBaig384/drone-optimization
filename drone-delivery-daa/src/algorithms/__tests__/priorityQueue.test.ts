/**
 * src/algorithms/__tests__/priorityQueue.test.ts
 *
 * Unit tests for DeliveryPriorityQueue.
 * Verifies ordering by priority level and by age (FIFO within same priority).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryPriorityQueue } from '../data-structures/priorityQueue';
import type { DeliveryRequest } from '@/types';

function makeDelivery(
  id: number,
  priority: number,
  createdAt: string = new Date().toISOString(),
): DeliveryRequest {
  return {
    id,
    destination: 1,
    priority,
    package_weight: 1,
    status: 'pending',
    created_at: createdAt,
  };
}

describe('DeliveryPriorityQueue – basic operations', () => {
  let queue: DeliveryPriorityQueue;

  beforeEach(() => {
    queue = new DeliveryPriorityQueue();
  });

  it('starts empty', () => {
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size).toBe(0);
  });

  it('enqueue increases size', () => {
    queue.enqueue(makeDelivery(1, 3));
    expect(queue.size).toBe(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('dequeue returns undefined on empty queue', () => {
    expect(queue.dequeue()).toBeUndefined();
  });

  it('peek does not remove the element', () => {
    const d = makeDelivery(1, 2);
    queue.enqueue(d);
    expect(queue.peek()?.id).toBe(d.id);
    expect(queue.size).toBe(1);
  });
});

describe('DeliveryPriorityQueue – priority ordering', () => {
  it('dequeues higher priority (lower number) first', () => {
    const queue = new DeliveryPriorityQueue();
    // Priority 3 enqueued first
    queue.enqueue(makeDelivery(10, 3));
    // Priority 1 enqueued second — should come out first
    queue.enqueue(makeDelivery(20, 1));
    queue.enqueue(makeDelivery(30, 2));

    const first  = queue.dequeue();
    const second = queue.dequeue();
    const third  = queue.dequeue();

    expect(first?.priority).toBe(1);   // most urgent
    expect(second?.priority).toBe(2);
    expect(third?.priority).toBe(3);
  });

  it('loadAll then toSortedArray returns deliveries in priority order', () => {
    const queue = new DeliveryPriorityQueue();
    const deliveries = [
      makeDelivery(1, 5),
      makeDelivery(2, 1),
      makeDelivery(3, 3),
      makeDelivery(4, 2),
    ];
    queue.loadAll(deliveries);
    const sorted = queue.toSortedArray();
    const priorities = sorted.map((d) => d.priority);
    expect(priorities).toEqual([1, 2, 3, 5]);
  });
});

describe('DeliveryPriorityQueue – FIFO within same priority', () => {
  it('serves older delivery first among equal-priority requests', () => {
    const queue = new DeliveryPriorityQueue();
    // Create two priority-2 deliveries, older one should come first
    const older  = makeDelivery(1, 2, new Date(Date.now() - 60_000).toISOString()); // 1min ago
    const newer  = makeDelivery(2, 2, new Date(Date.now() -  1_000).toISOString()); // 1s ago

    queue.enqueue(newer);  // enqueue newer first
    queue.enqueue(older);  // enqueue older second

    const first = queue.dequeue();
    expect(first?.id).toBe(older.id);  // older should still come first
  });
});
