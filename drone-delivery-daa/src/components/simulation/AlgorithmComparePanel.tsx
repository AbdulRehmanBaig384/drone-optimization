'use client';
// src/components/simulation/AlgorithmComparePanel.tsx
// Standalone full comparison panel shown in the simulation page.

import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/lib/utils';
import type { SimulationLogEntry } from '@/types';

export default function AlgorithmComparePanel() {
  const log = useSimulationStore((s) => s.log);

  // Find all route_computed log entries
  const routeEntries = log.filter((e) => e.type === 'route_computed');

  if (routeEntries.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-400" />
        Algorithm Comparison Summary
      </h3>
      {routeEntries.map((entry, i) => {
        const d = (entry.data?.dijkstra ?? {}) as Record<string, unknown>;
        const a = (entry.data?.astar ?? {}) as Record<string, unknown>;
        const nodesSaved = (entry.data?.nodesSaved ?? 0) as number;

        return (
          <div key={i} className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500 mb-3">Route Computation #{i + 1}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Dijkstra */}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="font-bold text-blue-300 mb-2 text-sm">Dijkstra</p>
                <div className="space-y-1 text-slate-400">
                  <p>Nodes explored: <span className="text-white font-mono">{d.nodesExplored as number}</span></p>
                  <p>Path cost: <span className="text-white font-mono">{(d.totalCost as number)?.toFixed(2)}</span></p>
                  <p>Distance: <span className="text-white font-mono">{(d.totalDistance as number)?.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-white font-mono">{(d.totalEnergy as number)?.toFixed(2)} units</span></p>
                </div>
                <p className="mt-2 text-slate-600 font-mono text-[10px]">O((V+E) log V)</p>
              </div>

              {/* A* */}
              <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                <p className="font-bold text-violet-300 mb-2 text-sm">A* (Euclidean h)</p>
                <div className="space-y-1 text-slate-400">
                  <p>Nodes explored: <span className="text-white font-mono">{a.nodesExplored as number}</span></p>
                  <p>Path cost: <span className="text-white font-mono">{(a.totalCost as number)?.toFixed(2)}</span></p>
                  <p>Distance: <span className="text-white font-mono">{(a.totalDistance as number)?.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-white font-mono">{(a.totalEnergy as number)?.toFixed(2)} units</span></p>
                </div>
                <p className="mt-2 text-slate-600 font-mono text-[10px]">O((V+E) log V) best-case less</p>
              </div>

              {/* Verdict */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/40 flex flex-col justify-center items-center text-center gap-2">
                <p className="text-slate-400 text-xs">A* advantage</p>
                <p className="text-3xl font-bold text-sky-300">{nodesSaved}</p>
                <p className="text-slate-400 text-xs">fewer nodes explored</p>
                <p className={cn(
                  'text-xs font-semibold mt-1',
                  nodesSaved > 0 ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {nodesSaved > 0 ? '⚡ A* more efficient' : '≈ Similar performance'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
