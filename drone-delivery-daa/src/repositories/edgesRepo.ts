// src/repositories/edgesRepo.ts
// Raw Supabase queries for edges table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Edge } from '@/types';

export async function getAllEdges(): Promise<Edge[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('edges')
    .select('*')
    .order('id');
  if (error) throw new Error(`edgesRepo.getAllEdges: ${error.message}`);
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
