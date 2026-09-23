'use client';
// src/components/simulation/AlgorithmComparePanel.tsx
// Standalone full comparison panel shown in the simulation page.

import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/lib/utils';
import type { SimulationLogEntry } from '@/types';
import { useRouter } from 'next/navigation';

export default function AlgorithmComparePanel() {
  const log = useSimulationStore((s) => s.log);
  const setActiveComparisonRoutes = useSimulationStore((s) => s.setActiveComparisonRoutes);
  const router = useRouter();

  // Find all route_computed log entries
  const routeEntries = log.filter((e) => e.type === 'route_computed');

  if (routeEntries.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-bold font-display text-text-main flex items-center gap-2 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Algorithm Comparison Summary
      </h3>
      {routeEntries.map((entry, i) => {
        const d = (entry.data?.dijkstra ?? {}) as Record<string, unknown>;
        const a = (entry.data?.astar ?? {}) as Record<string, unknown>;
        const nodesSaved = (entry.data?.nodesSaved ?? 0) as number;

        return (
          <div key={i} className="rounded-xl border border-border-theme bg-surface-2 p-5 shadow-lg">
            <p className="text-xs font-mono text-text-dim mb-4">Route Computation #{i + 1}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Dijkstra */}
              <div className="p-4 rounded-lg bg-surface border border-border-theme">
                <p className="font-bold text-text-main font-display mb-3 text-sm">Dijkstra</p>
                <div className="space-y-1.5 text-text-dim">
                  <p>Nodes explored: <span className="text-text-main font-mono">{d.nodesExplored as number}</span></p>
                  <p>Path cost: <span className="text-text-main font-mono">{(d.totalCost as number)?.toFixed(2)}</span></p>
                  <p>Distance: <span className="text-text-main font-mono">{(d.totalDistance as number)?.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-text-main font-mono">{(d.totalEnergy as number)?.toFixed(2)}</span></p>
                </div>
                <p className="mt-3 text-text-faint font-mono text-[10px] bg-black/20 p-1.5 rounded inline-block">O((V+E) log V)</p>
              </div>

              {/* A* */}
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <p className="font-bold text-accent font-display mb-3 text-sm relative">A* (Euclidean h)</p>
                <div className="space-y-1.5 text-text-dim relative">
                  <p>Nodes explored: <span className="text-text-main font-mono">{a.nodesExplored as number}</span></p>
                  <p>Path cost: <span className="text-text-main font-mono">{(a.totalCost as number)?.toFixed(2)}</span></p>
                  <p>Distance: <span className="text-text-main font-mono">{(a.totalDistance as number)?.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-text-main font-mono">{(a.totalEnergy as number)?.toFixed(2)}</span></p>
                </div>
                <p className="mt-3 text-text-faint font-mono text-[10px] bg-black/20 p-1.5 rounded inline-block relative">O((V+E) log V) best-case less</p>
              </div>

              {/* Verdict */}
              <div className="p-4 rounded-lg bg-surface border border-border-theme flex flex-col justify-center items-center text-center gap-2">
                <p className="text-text-dim text-xs font-mono uppercase tracking-wider">A* advantage</p>
                <p className="text-4xl font-bold font-mono text-success drop-shadow-[0_0_10px_rgba(57,217,138,0.3)]">{nodesSaved}</p>
                <p className="text-text-dim text-xs">fewer nodes explored</p>
                <p className={cn(
                  'text-xs font-bold mt-1 px-2.5 py-1 rounded border',
                  nodesSaved > 0 ? 'text-success bg-success/10 border-success/30' : 'text-text-dim bg-surface-2 border-border-theme'
                )}>
                  {nodesSaved > 0 ? '⚡ A* more efficient' : '≈ Similar performance'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setActiveComparisonRoutes({
                    dijkstra: {
                      nodeIds: d.path as number[],
                      algorithm: 'dijkstra',
                      distance: d.totalDistance as number,
                      energy: d.totalEnergy as number
                    },
                    astar: {
                      nodeIds: a.path as number[],
                      algorithm: 'astar',
                      distance: a.totalDistance as number,
                      energy: a.totalEnergy as number
                    },
                    deliveryId: i + 1 // store route ID roughly
                  });
                  router.push('/visualizer?mode=compare');
                }}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-accent/20"
              >
                Compare in 3D Visualization
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
