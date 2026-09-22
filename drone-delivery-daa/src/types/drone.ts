// ============================================================
// src/types/drone.ts
// ============================================================

export type DroneStatus = 'available' | 'in_flight' | 'charging' | 'offline';

export interface Drone {
  id: number;
  name: string;
  battery_capacity: number;   // max battery units
  current_battery: number;    // current battery units
  current_location: number;   // location id (FK)
  status: DroneStatus;
}

export interface DroneCreateInput {
  name: string;
  battery_capacity: number;
  current_battery: number;
  current_location: number;
  status?: DroneStatus;
}
