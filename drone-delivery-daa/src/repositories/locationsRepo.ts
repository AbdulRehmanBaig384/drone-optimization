// src/repositories/locationsRepo.ts
// Raw Supabase queries for locations table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Location } from '@/types';

export async function getAllLocations(retries = 3): Promise<Location[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('id');
    
  if (error) {
    if (error.message.includes('JWT issued at future') && retries > 0) {
      console.warn('Clock drift detected on Supabase server. Retrying...', retries);
      await new Promise(res => setTimeout(res, 500)); // wait 500ms
      return getAllLocations(retries - 1);
    }
    throw new Error(`locationsRepo.getAllLocations: ${error.message}`);
  }
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
