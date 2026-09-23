'use client';
// src/app/(dashboard)/city-map/page.tsx
// Interactive React Flow city graph with route highlighting

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// Removed Sidebar and Navbar imports
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
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-text-main">City Sector Map</h1>
        <p className="text-text-dim text-sm mt-1 max-w-xl">
          Graph visualization of all city locations and delivery routes.
          Run a simulation to see highlighted paths.
        </p>
      </div>

      {loading ? (
        <div className="h-[520px] flex items-center justify-center text-text-dim glass-card">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Establishing telemetry...</span>
          </div>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-4 rounded-xl bg-critical/10 border border-critical/30 text-critical text-sm flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span>No nodes found. Run the seed SQL to populate the sector database.</span>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-border-theme relative" style={{ height: 540 }}>
            <CityGraphView
              locations={locations}
              edges={edges}
              highlightedPath={highlightedPath}
            />
          </div>
          <div className="mt-4">
            <RouteHighlight locations={locations} />
          </div>
        </>
      )}

      {/* Graph stats */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-text-faint p-4 bg-surface-2/40 rounded-lg border border-border-theme w-fit">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Nodes (V): <span className="text-text-main font-bold">{locations.length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-energy" />
          <span>Edges (E): <span className="text-text-main font-bold">{edges.length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>Graph complexity: <span className="text-text-main font-bold">O({locations.length + edges.length})</span></span>
        </div>
      </div>
    </>
  );
}
