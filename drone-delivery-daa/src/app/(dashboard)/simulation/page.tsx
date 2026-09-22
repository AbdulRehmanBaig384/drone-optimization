'use client';
// src/app/(dashboard)/simulation/page.tsx
// Main simulation page — the core DAA demonstration

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import SimulationControls from '@/components/simulation/SimulationControls';
import SimulationLog from '@/components/simulation/SimulationLog';
import AlgorithmComparePanel from '@/components/simulation/AlgorithmComparePanel';
import { useSimulationStore } from '@/store/simulationStore';

function AssignmentsSummary() {
  const assignments = useSimulationStore((s) => s.assignments);
  if (assignments.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-slate-300 mb-3">
        ✅ Created Assignments ({assignments.length})
      </h3>
      <div className="space-y-2">
        {assignments.map((a) => (
          <div key={a.id} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
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
        ))}
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Simulation</h1>
            <p className="text-slate-400 text-sm mt-1">
              Run the full DAA pipeline: Priority Queue → Greedy Selection → Dijkstra + A* → Energy Check → Assignment
            </p>
          </div>

          {/* Pipeline diagram */}
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/40">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Algorithm Pipeline</p>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[
                { label: 'Build Graph',    concept: 'Adjacency List O(V+E)',      color: 'blue' },
                { label: 'Load Queue',     concept: 'Min-Heap Priority Queue',    color: 'violet' },
                { label: 'Pop Delivery',   concept: 'Greedy — O(log n)',          color: 'amber' },
                { label: 'Select Drone',   concept: 'Greedy Assignment — O(D)',   color: 'sky' },
                { label: 'Compute Route',  concept: 'Dijkstra + A*',              color: 'emerald' },
                { label: 'Check Energy',   concept: 'Feasibility — O(1)',         color: 'orange' },
                { label: 'Save Result',    concept: 'Persist Assignment',         color: 'green' },
              ].map(({ label, concept, color }, i, arr) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`px-2.5 py-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-center`}>
                    <p className={`font-semibold text-${color}-300`}>{i + 1}. {label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{concept}</p>
                  </div>
                  {i < arr.length - 1 && <span className="text-slate-600">→</span>}
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
              <h2 className="text-sm font-bold text-slate-300 mb-3">Decision Log</h2>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
                <SimulationLog />
              </div>
              <AssignmentsSummary />
            </div>
            <div>
              <AlgorithmComparePanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
