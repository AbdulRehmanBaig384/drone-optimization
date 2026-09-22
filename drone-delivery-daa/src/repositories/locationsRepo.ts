// src/repositories/locationsRepo.ts
// Raw Supabase queries for locations table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Location } from '@/types';

export async function getAllLocations(): Promise<Location[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('id');
  if (error) throw new Error(`locationsRepo.getAllLocations: ${error.message}`);
  return data as Location[];
}

export async function getLocationById(id: number): Promise<Location | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Location;
}

export async function insertLocation(
  input: Omit<Location, 'id'>,
): Promise<Location> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('locations')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`locationsRepo.insertLocation: ${error.message}`);
  return data as Location;
}
