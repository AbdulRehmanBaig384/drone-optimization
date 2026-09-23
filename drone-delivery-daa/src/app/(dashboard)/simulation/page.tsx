'use client';
// src/app/(dashboard)/simulation/page.tsx
// Main simulation page — the core DAA demonstration

// Removed Sidebar and Navbar imports
import SimulationControls from '@/components/simulation/SimulationControls';
import SimulationLog from '@/components/simulation/SimulationLog';
import AlgorithmComparePanel from '@/components/simulation/AlgorithmComparePanel';
import { useSimulationStore } from '@/store/simulationStore';

import { useRouter } from 'next/navigation';

function AssignmentsSummary() {
  const assignments = useSimulationStore((s) => s.assignments);
  const setActiveVisualizerRoute = useSimulationStore((s) => s.setActiveVisualizerRoute);
  const router = useRouter();

  if (assignments.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-slate-300 mb-3">
        ✅ Created Assignments ({assignments.length})
      </h3>
      <div className="space-y-2">
        {assignments.map((a) => (
          <div key={a.id} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-300 font-mono">Assignment #{a.id}</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-400">Delivery #{a.delivery_id}</span>
              <span className="text-slate-400 mx-2">→</span>
              <span className="text-slate-300">Drone #{a.drone_id}</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-400">{a.total_distance.toFixed(1)} km</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-violet-300">{a.algorithm_used}</span>
            </div>
            <button
              onClick={() => {
                setActiveVisualizerRoute({
                  nodeIds: a.route,
                  algorithm: a.algorithm_used,
                  distance: a.total_distance,
                  energy: a.total_energy
                });
                router.push('/visualizer');
              }}
              className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold tracking-wide uppercase transition-colors whitespace-nowrap ml-4"
            >
              View 3D
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-text-main">Simulation Telemetry</h1>
        <p className="text-text-dim text-sm mt-1">
          Run the full DAA pipeline: Priority Queue → Greedy Selection → Dijkstra + A* → Energy Check → Assignment
        </p>
      </div>

      {/* Pipeline diagram */}
      <div className="mb-8 p-5 rounded-xl bg-surface border border-border-theme shadow-lg">
        <p className="text-xs font-semibold font-display text-text-faint uppercase tracking-wider mb-4">Algorithm Pipeline</p>
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {[
            { label: 'Build Graph',    concept: 'Adjacency List O(V+E)',      color: 'accent' },
            { label: 'Load Queue',     concept: 'Min-Heap Priority Queue',    color: 'violet-400' },
            { label: 'Pop Delivery',   concept: 'Greedy — O(log n)',          color: 'energy' },
            { label: 'Select Drone',   concept: 'Greedy Assignment — O(D)',   color: 'accent' },
            { label: 'Compute Route',  concept: 'Dijkstra + A*',              color: 'success' },
            { label: 'Check Energy',   concept: 'Feasibility — O(1)',         color: 'amber-400' },
            { label: 'Save Result',    concept: 'Persist Assignment',         color: 'emerald-400' },
          ].map(({ label, concept, color }, i, arr) => (
            <div key={label} className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-lg bg-surface-2 border border-border-theme text-center hover:border-text-faint transition-colors cursor-default">
                <p className="font-semibold text-text-main">
                  <span className="opacity-50 mr-1">{i + 1}.</span>{label}
                </p>
                <p className="text-[10px] text-text-dim font-mono mt-1 opacity-80">{concept}</p>
              </div>
              {i < arr.length - 1 && <span className="text-border-theme font-bold">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <SimulationControls />
      </div>

      {/* Log + comparison side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold font-display text-text-main mb-3 uppercase tracking-wider">Decision Log</h2>
          <div className="rounded-xl border border-border-theme bg-surface p-4 shadow-xl">
            <SimulationLog />
          </div>
          <AssignmentsSummary />
        </div>
        <div>
          <AlgorithmComparePanel />
        </div>
      </div>
    </>
  );
}
