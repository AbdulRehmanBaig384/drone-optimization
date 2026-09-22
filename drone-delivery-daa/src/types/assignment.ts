// ============================================================
// src/types/assignment.ts
// ============================================================

export interface Assignment {
  id: number;
  delivery_id: number;
  drone_id: number;
  route: number[];            // ordered array of location ids
  total_distance: number;
  total_energy: number;
  algorithm_used: string;
  created_at: string;
}

export interface AssignmentCreateInput {
  delivery_id: number;
  drone_id: number;
  route: number[];
  total_distance: number;
  total_energy: number;
  algorithm_used: string;
}

/** One step in the simulation decision log */
export interface SimulationLogEntry {
  step: number;
  type:
    | 'graph_built'
    | 'queue_loaded'
    | 'delivery_selected'
    | 'drone_selected'
    | 'route_computed'
    | 'feasibility_check'
    | 'assignment_saved'
    | 'error'
    | 'info';
  message: string;
  data?: Record<string, unknown>;
}

export interface SimulationResult {
  success: boolean;
  log: SimulationLogEntry[];
  assignments: Assignment[];
}
