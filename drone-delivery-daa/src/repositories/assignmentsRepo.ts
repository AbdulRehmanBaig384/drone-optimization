// src/repositories/assignmentsRepo.ts
// Raw Supabase queries for assignments table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { Assignment, AssignmentCreateInput } from '@/types';

export async function getAllAssignments(): Promise<Assignment[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`assignmentsRepo.getAllAssignments: ${error.message}`);
  return data as Assignment[];
}

export async function getAssignmentByDelivery(
  deliveryId: number,
): Promise<Assignment | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('delivery_id', deliveryId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data as Assignment;
}

export async function insertAssignment(
  input: AssignmentCreateInput,
): Promise<Assignment> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      delivery_id:    input.delivery_id,
      drone_id:       input.drone_id,
      route:          input.route,
      total_distance: input.total_distance,
      total_energy:   input.total_energy,
      algorithm_used: input.algorithm_used,
    })
    .select()
    .single();
  if (error) throw new Error(`assignmentsRepo.insertAssignment: ${error.message}`);
  return data as Assignment;
}

export async function deleteAssignmentByDelivery(deliveryId: number): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('delivery_id', deliveryId);
  if (error) throw new Error(`assignmentsRepo.deleteAssignmentByDelivery: ${error.message}`);
}
