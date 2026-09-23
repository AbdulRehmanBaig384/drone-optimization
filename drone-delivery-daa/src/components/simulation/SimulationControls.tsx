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
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/40 hover:border-accent hover:bg-accent/20 text-accent text-sm font-semibold transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
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
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF2E93]/20 to-[#FF2E93]/10 border border-[#FF2E93]/40 hover:border-[#FF2E93] hover:bg-[#FF2E93]/20 text-[#FF2E93] text-sm font-semibold transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,46,147,0.4)]"
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
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-sm font-medium transition-all duration-300 disabled:opacity-50"
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
