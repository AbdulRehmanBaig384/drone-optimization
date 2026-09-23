// store/simulationStore.ts
// Zustand store for simulation state — shared across simulation UI components

import { create } from 'zustand';
import type { SimulationResult, SimulationLogEntry, Assignment } from '@/types';

export interface ActiveVisualizerRoute {
  nodeIds: number[];
  algorithm: string;
  distance: number;
  energy: number;
}

export interface ActiveComparisonRoutes {
  dijkstra: ActiveVisualizerRoute;
  astar: ActiveVisualizerRoute;
  deliveryId?: number; // Optional, to track which delivery this comparison is for
}

interface SimulationState {
  isRunning: boolean;
  result: SimulationResult | null;
  log: SimulationLogEntry[];
  assignments: Assignment[];
  highlightedPath: number[];
  error: string | null;
  activeVisualizerRoute: ActiveVisualizerRoute | null;
  activeComparisonRoutes: ActiveComparisonRoutes | null;

  setRunning: (v: boolean) => void;
  setResult: (result: SimulationResult) => void;
  setHighlightedPath: (path: number[]) => void;
  setActiveVisualizerRoute: (route: ActiveVisualizerRoute | null) => void;
  setActiveComparisonRoutes: (routes: ActiveComparisonRoutes | null) => void;
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
  activeVisualizerRoute: null,
  activeComparisonRoutes: null,

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

  setActiveVisualizerRoute: (route) => set({ activeVisualizerRoute: route }),

  setActiveComparisonRoutes: (routes) => set({ activeComparisonRoutes: routes }),

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
