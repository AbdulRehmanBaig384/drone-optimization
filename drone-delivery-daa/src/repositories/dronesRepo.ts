// src/repositories/dronesRepo.ts
// Raw Supabase queries for drones table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Drone, DroneCreateInput, DroneStatus } from '@/types';

export async function getAllDrones(): Promise<Drone[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('drones')
    .select('*')
    .order('id');
  if (error) throw new Error(`dronesRepo.getAllDrones: ${error.message}`);
  return data as Drone[];
}

export async function getDroneById(id: number): Promise<Drone | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('drones')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Drone;
}

export async function getAvailableDrones(): Promise<Drone[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('drones')
    .select('*')
    .eq('status', 'available')
    .order('id');
  if (error) throw new Error(`dronesRepo.getAvailableDrones: ${error.message}`);
  return data as Drone[];
}

export async function insertDrone(input: DroneCreateInput): Promise<Drone> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('drones')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`dronesRepo.insertDrone: ${error.message}`);
  return data as Drone;
}

export async function updateDroneStatus(
  id: number,
  status: DroneStatus,
  currentBattery?: number,
  currentLocation?: number,
): Promise<Drone> {
  const supabase = createServerClient();
  const updates: Partial<Drone> = { status };
  if (currentBattery !== undefined) updates.current_battery = currentBattery;
  if (currentLocation !== undefined) updates.current_location = currentLocation;

  const { data, error } = await supabase
    .from('drones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`dronesRepo.updateDroneStatus: ${error.message}`);
  return data as Drone;
}

export async function deleteDrone(id: number): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from('drones').delete().eq('id', id);
  if (error) throw new Error(`dronesRepo.deleteDrone: ${error.message}`);
}
