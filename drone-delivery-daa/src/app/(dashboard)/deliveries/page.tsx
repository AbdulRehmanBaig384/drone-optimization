'use client';
// src/app/(dashboard)/deliveries/page.tsx

import { useEffect, useState, useCallback } from 'react';
// Removed Sidebar and Navbar imports
import DeliveryForm from '@/components/deliveries/DeliveryForm';
import DeliveryTable from '@/components/deliveries/DeliveryTable';
import type { DeliveryRequest, Location } from '@/types';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, lRes] = await Promise.all([
        fetch('/api/deliveries'),
        fetch('/api/locations'),
      ]);
      const dData = await dRes.json();
      const lData = await lRes.json();
      setDeliveries(Array.isArray(dData) ? dData : []);
      setLocations(Array.isArray(lData) ? lData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDelete(id: number) {
    await fetch(`/api/deliveries?id=${id}`, { method: 'DELETE' });
    loadData();
  }

  async function handleUnassign(id: number) {
    await fetch('/api/deliveries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'unassign' }),
    });
    loadData();
  }

  const pending   = deliveries.filter((d) => d.status === 'pending').length;
  const assigned  = deliveries.filter((d) => d.status === 'assigned' || d.status === 'in_flight').length;
  const completed = deliveries.filter((d) => d.status === 'delivered').length;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-text-main">Active Manifests</h1>
          <p className="text-text-dim text-sm mt-1">
            Manage delivery requests — sorted by priority (P1 = most urgent)
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-sm font-bold transition-all shadow-[0_0_15px_rgba(65,214,255,0.15)]"
        >
          {showForm ? 'Cancel' : '+ New Manifest'}
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          { label: 'Pending',   count: pending,   color: 'energy' },
          { label: 'Active',    count: assigned,  color: 'accent' },
          { label: 'Completed', count: completed, color: 'success' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`px-5 py-2.5 rounded-lg text-sm font-medium bg-${color}/10 text-${color} border border-${color}/20 flex items-center gap-3 shadow-lg shadow-black/20`}>
            <span className="uppercase tracking-wider text-xs opacity-80">{label}</span>
            <span className="font-bold font-mono text-lg">{count}</span>
          </div>
        ))}
      </div>

      {showForm && locations.length > 0 && (
        <div className="mb-6 p-6 rounded-xl border border-border-theme bg-surface max-w-sm shadow-xl">
          <h2 className="text-sm font-semibold font-display text-text-main mb-4 uppercase tracking-wider">New Delivery Manifest</h2>
          <DeliveryForm
            locations={locations}
            onCreated={() => { setShowForm(false); loadData(); }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-text-dim text-sm flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-text-dim border-t-transparent animate-spin" />
          Loading manifests...
        </div>
      ) : (
        <DeliveryTable
          deliveries={deliveries}
          locations={locations}
          onDelete={handleDelete}
          onUnassign={handleUnassign}
        />
      )}
    </>
  );
}
