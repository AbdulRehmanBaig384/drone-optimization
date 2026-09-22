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
        <label className="block text-xs font-medium text-slate-400 mb-1">Drone Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DroneEpsilon"
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Battery Capacity</label>
          <input
            type="number" min="1" required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Current Battery</label>
          <input
            type="number" min="0" required
            value={battery}
            onChange={(e) => setBattery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Starting Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Drone'}
      </button>
    </form>
  );
}
