// src/repositories/edgesRepo.ts
// Raw Supabase queries for edges table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Edge } from '@/types';

export async function getAllEdges(retries = 3): Promise<Edge[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('edges')
    .select('*')
    .order('id');
    
  if (error) {
    if (error.message.includes('JWT issued at future') && retries > 0) {
      console.warn('Clock drift detected on Supabase server. Retrying...', retries);
      await new Promise(res => setTimeout(res, 500)); // wait 500ms
      return getAllEdges(retries - 1);
    }
    throw new Error(`edgesRepo.getAllEdges: ${error.message}`);
  }
  return data as Edge[];
}

export async function insertEdge(
  input: Omit<Edge, 'id'>,
): Promise<Edge> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('edges')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`edgesRepo.insertEdge: ${error.message}`);
  return data as Edge;
}

export async function deleteEdge(id: number): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from('edges').delete().eq('id', id);
  if (error) throw new Error(`edgesRepo.deleteEdge: ${error.message}`);
}
