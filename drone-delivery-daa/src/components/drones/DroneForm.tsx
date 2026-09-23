'use client';
// src/components/drones/DroneForm.tsx

import { useState } from 'react';
import type { Location } from '@/types';

interface DroneFormProps {
  locations: Location[];
  onCreated: () => void;
}

export default function DroneForm({ locations, onCreated }: DroneFormProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [battery, setBattery] = useState('100');
  const [locationId, setLocationId] = useState(locations[0]?.id?.toString() ?? '1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/drones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          battery_capacity: Number(capacity),
          current_battery: Number(battery),
          current_location: Number(locationId),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setName('');
      setCapacity('100');
      setBattery('100');
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
        <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Drone Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DroneEpsilon"
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-inner"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Battery Capacity</label>
          <input
            type="number" min="1" required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-inner font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Current Battery</label>
          <input
            type="number" min="0" required
            value={battery}
            onChange={(e) => setBattery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-inner font-mono"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold font-mono text-text-faint mb-1.5 uppercase tracking-wider">Starting Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-theme text-sm text-text-main focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-inner"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-critical font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-success text-bg-elev font-bold text-sm hover:bg-success/90 transition-all shadow-[0_0_15px_rgba(57,217,138,0.2)] disabled:opacity-50 disabled:shadow-none uppercase tracking-wide mt-2"
      >
        {loading ? 'Initializing...' : 'Deploy Drone'}
      </button>
    </form>
  );
}
