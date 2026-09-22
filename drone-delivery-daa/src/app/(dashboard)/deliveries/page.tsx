'use client';
// src/app/(dashboard)/deliveries/page.tsx

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
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
      setDeliveries(await dRes.json());
      setLocations(await lRes.json());
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

  const pending   = deliveries.filter((d) => d.status === 'pending').length;
  const assigned  = deliveries.filter((d) => d.status === 'assigned' || d.status === 'in_flight').length;
  const completed = deliveries.filter((d) => d.status === 'delivered').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Delivery Requests</h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage delivery requests — sorted by priority (P1 = most urgent)
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Delivery'}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { label: 'Pending',   count: pending,   color: 'amber' },
              { label: 'Active',    count: assigned,  color: 'sky' },
              { label: 'Completed', count: completed, color: 'emerald' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`px-4 py-2 rounded-lg text-sm font-medium bg-${color}-500/10 text-${color}-300 border border-${color}-500/20`}>
                {label}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>

          {showForm && locations.length > 0 && (
            <div className="mb-6 p-5 rounded-xl border border-slate-700/60 bg-slate-900/70 max-w-sm">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">New Delivery Request</h2>
              <DeliveryForm
                locations={locations}
                onCreated={() => { setShowForm(false); loadData(); }}
              />
            </div>
          )}

          {loading ? (
            <div className="text-slate-500 text-sm">Loading deliveries...</div>
          ) : (
            <DeliveryTable
              deliveries={deliveries}
              locations={locations}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
}
