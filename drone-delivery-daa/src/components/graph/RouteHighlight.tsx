'use client';
// src/components/graph/RouteHighlight.tsx
// Panel showing the highlighted route details below the graph

import { useSimulationStore } from '@/store/simulationStore';
import type { Location } from '@/types';

interface RouteHighlightProps {
  locations: Location[];
}

export default function RouteHighlight({ locations }: RouteHighlightProps) {
  const highlightedPath = useSimulationStore((s) => s.highlightedPath);
  const assignments = useSimulationStore((s) => s.assignments);

  if (highlightedPath.length === 0) return null;

  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const pathNames = highlightedPath
    .map((id) => locationMap.get(id)?.name ?? `#${id}`)
    .join(' → ');

  const latestAssignment = assignments[assignments.length - 1];

  return (
    <div className="mt-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-sm font-semibold text-sky-300">Highlighted Route</span>
      </div>
      <p className="text-sm text-slate-300 font-mono">{pathNames}</p>
      {latestAssignment && (
        <div className="mt-2 flex gap-4 text-xs text-slate-400">
          <span>Distance: <span className="text-slate-200">{latestAssignment.total_distance.toFixed(1)} km</span></span>
          <span>Energy: <span className="text-slate-200">{latestAssignment.total_energy.toFixed(1)} units</span></span>
          <span>Algorithm: <span className="text-violet-300">{latestAssignment.algorithm_used}</span></span>
        </div>
      )}
    </div>
  );
}
