// src/services/droneService.ts
import {
  getAllDrones, getDroneById, insertDrone, updateDroneStatus, deleteDrone,
} from '@/repositories/dronesRepo';
import type { Drone, DroneCreateInput } from '@/types';

export async function listDrones(): Promise<Drone[]> {
  return getAllDrones();
}

export async function getDrone(id: number): Promise<Drone | null> {
  return getDroneById(id);
}

export async function createDrone(input: DroneCreateInput): Promise<Drone> {
  return insertDrone(input);
}

export async function removeDrone(id: number): Promise<void> {
  return deleteDrone(id);
}

export async function rechargeDrone(id: number): Promise<Drone> {
  const drone = await getDroneById(id);
  if (!drone) throw new Error(`Drone ${id} not found`);
  return updateDroneStatus(id, 'available', drone.battery_capacity);
}
