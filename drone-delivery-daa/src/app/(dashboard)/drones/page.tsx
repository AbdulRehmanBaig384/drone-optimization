'use client';
// src/app/(dashboard)/drones/page.tsx

import { useEffect, useState, useCallback } from 'react';
// Removed Sidebar and Navbar imports
import DroneCard from '@/components/drones/DroneCard';
import DroneForm from '@/components/drones/DroneForm';
import type { Drone, Location } from '@/types';

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dronesRes, locsRes] = await Promise.all([
        fetch('/api/drones'),
        fetch('/api/locations'),
      ]);
      const dData = await dronesRes.json();
      const lData = await locsRes.json();
      setDrones(Array.isArray(dData) ? dData : []);
      setLocations(Array.isArray(lData) ? lData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleRecharge(id: number) {
    await fetch('/api/drones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'recharge' }),
    });
    loadData();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/drones?id=${id}`, { method: 'DELETE' });
    loadData();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-text-main">Drone Telemetry</h1>
          <p className="text-text-dim text-sm mt-1">Manage the drone fleet and battery status</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-sm font-bold transition-all shadow-[0_0_15px_rgba(65,214,255,0.15)]"
        >
          {showForm ? 'Cancel' : '+ Add Drone'}
        </button>
      </div>

      {showForm && locations.length > 0 && (
        <div className="mb-6 p-6 rounded-xl border border-border-theme bg-surface max-w-md shadow-xl">
          <h2 className="text-sm font-semibold font-display text-text-main mb-4 uppercase tracking-wider">New Drone Config</h2>
          <DroneForm
            locations={locations}
            onCreated={() => { setShowForm(false); loadData(); }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-text-dim text-sm flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-text-dim border-t-transparent animate-spin" />
          Loading telemetry...
        </div>
      ) : drones.length === 0 ? (
        <div className="p-4 rounded-xl bg-energy/10 border border-energy/30 text-energy text-sm flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span>No drones found. Add a drone above or run the seed SQL.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drones.map((drone) => (
            <DroneCard
              key={drone.id}
              drone={drone}
              locations={locations}
              onRecharge={handleRecharge}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
