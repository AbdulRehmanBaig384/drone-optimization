'use client';
// src/components/simulation/SimulationLog.tsx
// Renders the step-by-step decision log from the simulation orchestrator.

import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/lib/utils';
import type { SimulationLogEntry } from '@/types';

const typeConfig: Record<SimulationLogEntry['type'], { icon: string; color: string; bg: string }> = {
  graph_built:       { icon: '🗺️', color: 'text-accent',   bg: 'bg-accent/10 border-accent/30' },
  queue_loaded:      { icon: '📋', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  delivery_selected: { icon: '📦', color: 'text-energy',  bg: 'bg-energy/10 border-energy/30' },
  drone_selected:    { icon: '🤖', color: 'text-accent',    bg: 'bg-accent/10 border-accent/30' },
  route_computed:    { icon: '🛤️', color: 'text-success',bg: 'bg-success/10 border-success/30' },
  feasibility_check: { icon: '⚡', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  assignment_saved:  { icon: '✅', color: 'text-emerald-400',  bg: 'bg-emerald-400/10 border-emerald-400/30' },
  error:             { icon: '❌', color: 'text-critical',    bg: 'bg-critical/10 border-critical/30' },
  info:              { icon: 'ℹ️', color: 'text-text-faint',  bg: 'bg-surface-2 border-border-theme' },
};

const daaLabels: Record<SimulationLogEntry['type'], string> = {
  graph_built:       'ADT: Adjacency List (O(V+E) space)',
  queue_loaded:      'ADT: Priority Queue / Min-Heap (O(n log n))',
  delivery_selected: 'Algorithm: Greedy — O(log n) dequeue',
  drone_selected:    'Algorithm: Greedy Assignment — O(D)',
  route_computed:    'Algorithm: Dijkstra O((V+E)logV) + A* O((V+E)logV)',
  feasibility_check: 'Constraint: Energy Feasibility — O(1)',
  assignment_saved:  'Result: Optimal Route Assigned',
  error:             '',
  info:              '',
};

function RouteComparePanel({ data }: { data: Record<string, unknown> }) {
  const d = data.dijkstra as Record<string, unknown>;
  const a = data.astar as Record<string, unknown>;
  const winner = data.winner as string;
  const nodesSaved = data.nodesSaved as number;

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
      <div className={cn('p-3 rounded-lg border transition-all duration-300', winner === 'dijkstra' || winner === 'tie' ? 'border-success/40 bg-success/5 shadow-[0_0_15px_rgba(57,217,138,0.1)]' : 'border-border-theme bg-surface-2')}>
        <p className="font-bold text-text-main font-display mb-2">🔵 Dijkstra</p>
        <p className="text-text-dim font-mono">Cost: <span className="text-text-main">{(d?.totalCost as number)?.toFixed(2)}</span></p>
        <p className="text-text-dim font-mono">Dist: <span className="text-text-main">{(d?.totalDistance as number)?.toFixed(2)} km</span></p>
        <p className="text-text-dim font-mono">Energy: <span className="text-text-main">{(d?.totalEnergy as number)?.toFixed(2)}</span></p>
        <p className="text-text-dim font-mono">Nodes: <span className="text-text-main">{d?.nodesExplored as number}</span></p>
      </div>
      <div className={cn('p-3 rounded-lg border transition-all duration-300', winner === 'astar' ? 'border-success/40 bg-success/5 shadow-[0_0_15px_rgba(57,217,138,0.1)]' : 'border-border-theme bg-surface-2')}>
        <p className="font-bold text-text-main font-display mb-2">🟣 A* (heuristic)</p>
        <p className="text-text-dim font-mono">Cost: <span className="text-text-main">{(a?.totalCost as number)?.toFixed(2)}</span></p>
        <p className="text-text-dim font-mono">Dist: <span className="text-text-main">{(a?.totalDistance as number)?.toFixed(2)} km</span></p>
        <p className="text-text-dim font-mono">Energy: <span className="text-text-main">{(a?.totalEnergy as number)?.toFixed(2)}</span></p>
        <p className="text-text-dim font-mono">Nodes: <span className="text-text-main">{a?.nodesExplored as number}</span></p>
      </div>
      <div className="col-span-2 text-center text-text-faint text-xs pt-1">
        A* saved <span className="text-accent font-bold font-mono">{nodesSaved}</span> node explorations 
        {winner !== 'tie' && <> · Winner: <span className="font-bold text-success font-display">{winner === 'astar' ? 'A*' : 'Dijkstra'}</span></>}
        {winner === 'tie' && <> · <span className="text-energy font-display">Tie — same cost!</span></>}
      </div>
    </div>
  );
}

export default function SimulationLog() {
  const log = useSimulationStore((s) => s.log);
  const error = useSimulationStore((s) => s.error);
  const isRunning = useSimulationStore((s) => s.isRunning);

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Running simulation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (log.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        <p className="text-2xl mb-3">🚁</p>
        <p>No simulation run yet.</p>
        <p className="mt-1 text-xs">Click "Run Next Step" or "Run Full Simulation" to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
      {log.map((entry) => {
        const cfg = typeConfig[entry.type];
        const daaLabel = daaLabels[entry.type];

        return (
          <div
            key={entry.step}
            className={cn(
              'p-3 rounded-xl border text-sm transition-all',
              cfg.bg || 'border-transparent',
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-base leading-none mt-0.5">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-mono">#{entry.step}</span>
                  {daaLabel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono hidden sm:block">
                      {daaLabel}
                    </span>
                  )}
                </div>
                <p className={cn('mt-0.5 font-medium', cfg.color)}>{entry.message}</p>

                {/* Render algorithm comparison panel for route_computed */}
                {entry.type === 'route_computed' && entry.data && (
                  <RouteComparePanel data={entry.data} />
                )}

                {/* Render feasibility details */}
                {entry.type === 'feasibility_check' && entry.data && (
                  <div className="mt-2 text-xs text-slate-400 flex gap-4 flex-wrap">
                    <span>Required: <span className="text-slate-200">{(entry.data.required as number)?.toFixed(1)}</span></span>
                    <span>Available: <span className="text-slate-200">{(entry.data.available as number)?.toFixed(1)}</span></span>
                    {!entry.data.feasible && (
                      <span className="text-red-400">Deficit: {(entry.data.deficit as number)?.toFixed(1)}</span>
                    )}
                    <span className={entry.data.feasible ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {entry.data.feasible ? '✓ FEASIBLE' : '✗ INFEASIBLE'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
