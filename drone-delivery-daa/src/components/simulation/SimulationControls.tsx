'use client';
// src/components/simulation/SimulationControls.tsx

import { useSimulationStore } from '@/store/simulationStore';
import { PlayCircle, StepForward, RefreshCw, Loader2 } from 'lucide-react';

export default function SimulationControls() {
  const { isRunning, setRunning, setResult, clearSimulation, setError } = useSimulationStore();

  async function runMode(mode: 'full' | 'step') {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'step' ? { mode: 'step' } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        id="btn-run-step"
        onClick={() => runMode('step')}
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-sky-900/30"
      >
        {isRunning ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <StepForward size={16} />
        )}
        Run Next Step
      </button>

      <button
        id="btn-run-full"
        onClick={() => runMode('full')}
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-violet-900/30"
      >
        {isRunning ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <PlayCircle size={16} />
        )}
        Run Full Simulation
      </button>

      <button
        id="btn-clear"
        onClick={clearSimulation}
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <RefreshCw size={16} />
        Clear
      </button>

      <div className="ml-auto text-xs text-slate-500 hidden md:block">
        <p>Pipeline: Priority Queue → Greedy → Dijkstra + A* → Energy Check</p>
      </div>
    </div>
  );
}
