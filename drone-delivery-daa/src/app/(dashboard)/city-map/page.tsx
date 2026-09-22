'use client';
// src/app/(dashboard)/city-map/page.tsx
// Interactive React Flow city graph with route highlighting

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RouteHighlight from '@/components/graph/RouteHighlight';
import { useSimulationStore } from '@/store/simulationStore';
import type { Location, Edge } from '@/types';

// Dynamic import to avoid SSR issues with React Flow
const CityGraphView = dynamic(
  () => import('@/components/graph/CityGraphView'),
  { ssr: false, loading: () => <div className="h-[520px] flex items-center justify-center text-slate-500">Loading graph...</div> }
);

export default function CityMapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightedPath = useSimulationStore((s) => s.highlightedPath);

  useEffect(() => {
    Promise.all([
      fetch('/api/locations').then((r) => r.json()),
      fetch('/api/edges').then((r) => r.json()),
    ])
      .then(([locs, edgs]) => {
        setLocations(Array.isArray(locs) ? locs : []);
        setEdges(Array.isArray(edgs) ? edgs : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">City Map</h1>
            <p className="text-slate-400 text-sm mt-1">
              Graph visualization of all city locations and delivery routes.
              Run a simulation to see highlighted paths.
            </p>
          </div>

          {loading ? (
            <div className="h-[520px] flex items-center justify-center text-slate-500">
              Loading city graph...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              ⚠️ No locations found. Run the seed SQL in Supabase to populate the database.
            </div>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden" style={{ height: 540 }}>
                <CityGraphView
                  locations={locations}
                  edges={edges}
                  highlightedPath={highlightedPath}
                />
              </div>
              <RouteHighlight locations={locations} />
            </>
          )}

          {/* Graph stats */}
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span>Nodes (V): <span className="text-slate-300">{locations.length}</span></span>
            <span>Edges (E): <span className="text-slate-300">{edges.length}</span></span>
            <span>Graph space: <span className="text-slate-300">O(V+E) = O({locations.length + edges.length})</span></span>
          </div>
        </main>
      </div>
    </div>
  );
}
