// src/services/locationService.ts
import { getAllLocations, getLocationById, insertLocation } from '@/repositories/locationsRepo';
import type { Location } from '@/types';

export async function listLocations(): Promise<Location[]> {
  return getAllLocations();
}

export async function getLocation(id: number): Promise<Location | null> {
  return getLocationById(id);
}

export async function createLocation(
  name: string, pos_x: number, pos_y: number,
): Promise<Location> {
  return insertLocation({ name, pos_x, pos_y });
}
