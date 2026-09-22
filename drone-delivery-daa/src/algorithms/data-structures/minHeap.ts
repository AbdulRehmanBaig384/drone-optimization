/**
 * src/algorithms/data-structures/minHeap.ts
 *
 * Generic binary min-heap implementation.
 * Used internally by PriorityQueue and Dijkstra / A*.
 *
 * Insert   : O(log n)  — sift-up
 * ExtractMin: O(log n) — sift-down
 * Peek     : O(1)
 * Build    : O(n log n) via repeated insert
 *
 * Space: O(n)
 */

export interface HeapNode<T> {
  key: number;   // priority (lower = higher priority)
  value: T;
}

export class MinHeap<T> {
  private heap: HeapNode<T>[] = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /** Peek at min without removing — O(1) */
  peek(): HeapNode<T> | undefined {
    return this.heap[0];
  }

  /**
   * insert — adds a new node and restores heap property upward.
   * Time: O(log n)
   */
  insert(key: number, value: T): void {
    this.heap.push({ key, value });
    this._siftUp(this.heap.length - 1);
  }

  /**
   * extractMin — removes and returns the minimum-key node.
   * Time: O(log n)
   */
  extractMin(): HeapNode<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return min;
  }

  /**
   * decreaseKey — find element by predicate and decrease its key.
   * Time: O(n) scan + O(log n) sift — acceptable for small graphs.
   * For production, use an indexed heap (Fibonacci heap for O(log n)).
   */
  decreaseKey(predicate: (v: T) => boolean, newKey: number): void {
    const idx = this.heap.findIndex((n) => predicate(n.value));
    if (idx === -1 || this.heap[idx].key <= newKey) return;
    this.heap[idx] = { key: newKey, value: this.heap[idx].value };
    this._siftUp(idx);
  }

  // ── Private helpers ──────────────────────────────────────────────

  private _parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private _left(i: number): number {
    return 2 * i + 1;
  }
  private _right(i: number): number {
    return 2 * i + 2;
  }

  private _swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /** Restore heap upward after insert — O(log n) */
  private _siftUp(i: number): void {
    while (i > 0) {
      const p = this._parent(i);
      if (this.heap[p].key > this.heap[i].key) {
        this._swap(p, i);
        i = p;
      } else {
        break;
      }
    }
  }

  /** Restore heap downward after extractMin — O(log n) */
  private _siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = this._left(i);
      const r = this._right(i);
      if (l < n && this.heap[l].key < this.heap[smallest].key) smallest = l;
      if (r < n && this.heap[r].key < this.heap[smallest].key) smallest = r;
      if (smallest !== i) {
        this._swap(i, smallest);
        i = smallest;
      } else {
        break;
      }
    }
  }
}
