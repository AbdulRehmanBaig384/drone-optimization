'use client';
// src/app/(dashboard)/drones/page.tsx

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
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
      setDrones(await dronesRes.json());
      setLocations(await locsRes.json());
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Drones</h1>
              <p className="text-slate-400 text-sm mt-1">Manage the drone fleet</p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
            >
              {showForm ? 'Cancel' : '+ Add Drone'}
            </button>
          </div>

          {showForm && locations.length > 0 && (
            <div className="mb-6 p-5 rounded-xl border border-slate-700/60 bg-slate-900/70 max-w-md">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Add New Drone</h2>
              <DroneForm
                locations={locations}
                onCreated={() => { setShowForm(false); loadData(); }}
              />
            </div>
          )}

          {loading ? (
            <div className="text-slate-500 text-sm">Loading drones...</div>
          ) : drones.length === 0 ? (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              ⚠️ No drones found. Run the seed SQL or add a drone above.
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
        </main>
      </div>
    </div>
  );
}
