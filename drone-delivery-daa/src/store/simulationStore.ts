// store/simulationStore.ts
// Zustand store for simulation state — shared across simulation UI components

import { create } from 'zustand';
import type { SimulationResult, SimulationLogEntry, Assignment } from '@/types';

interface SimulationState {
  isRunning: boolean;
  result: SimulationResult | null;
  log: SimulationLogEntry[];
  assignments: Assignment[];
  highlightedPath: number[];
  error: string | null;

  setRunning: (v: boolean) => void;
  setResult: (result: SimulationResult) => void;
  setHighlightedPath: (path: number[]) => void;
  clearSimulation: () => void;
  setError: (err: string | null) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  result: null,
  log: [],
  assignments: [],
  highlightedPath: [],
  error: null,

  setRunning: (v) => set({ isRunning: v }),

  setResult: (result) =>
    set({
      result,
      log: result.log,
      assignments: result.assignments,
      // Highlight the first assignment's route if any
      highlightedPath:
        result.assignments.length > 0
          ? (result.assignments[0].route as number[])
          : [],
    }),

  setHighlightedPath: (path) => set({ highlightedPath: path }),

  clearSimulation: () =>
    set({
      result: null,
      log: [],
      assignments: [],
      highlightedPath: [],
      error: null,
    }),

  setError: (err) => set({ error: err }),
}));
