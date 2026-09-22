'use client';
// src/components/deliveries/DeliveryForm.tsx

import { useState } from 'react';
import type { Location } from '@/types';

interface DeliveryFormProps {
  locations: Location[];
  onCreated: () => void;
}

const priorityLabels: Record<number, string> = {
  1: '🔴 P1 — Critical',
  2: '🟠 P2 — High',
  3: '🟡 P3 — Medium',
  4: '🟢 P4 — Low',
  5: '⚪ P5 — Routine',
};

export default function DeliveryForm({ locations, onCreated }: DeliveryFormProps) {
  const [destination, setDestination] = useState(locations[0]?.id?.toString() ?? '1');
  const [priority, setPriority] = useState('3');
  const [weight, setWeight] = useState('1.0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: Number(destination),
          priority: Number(priority),
          package_weight: Number(weight),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onCreated();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Destination</label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
        >
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Package Weight (kg)</label>
        <input
          type="number" min="0.1" step="0.1" required
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Delivery Request'}
      </button>
    </form>
  );
}
