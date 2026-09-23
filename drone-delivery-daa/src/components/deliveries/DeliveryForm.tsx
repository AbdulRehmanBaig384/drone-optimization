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
        <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Destination</label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
        >
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Package Weight (kg)</label>
        <input
          type="number" min="0.1" step="0.1" required
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner font-mono"
        />
      </div>
      {error && <p className="text-xs text-critical font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-accent text-bg-elev font-bold text-sm hover:bg-accent/90 transition-all shadow-[0_0_15px_rgba(65,214,255,0.2)] disabled:opacity-50 disabled:shadow-none uppercase tracking-wide mt-2"
      >
        {loading ? 'Transmitting...' : 'Create Manifest'}
      </button>
    </form>
  );
}
