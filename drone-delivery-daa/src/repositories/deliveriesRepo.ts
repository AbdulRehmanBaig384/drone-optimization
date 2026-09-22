// src/repositories/deliveriesRepo.ts
// Raw Supabase queries for delivery_requests table — NO business logic

import { createServerClient } from '@/lib/supabase/server';
import type { DeliveryRequest, DeliveryCreateInput, DeliveryStatus } from '@/types';

export async function getAllDeliveries(): Promise<DeliveryRequest[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('delivery_requests')
    .select('*')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(`deliveriesRepo.getAllDeliveries: ${error.message}`);
  return data as DeliveryRequest[];
}

export async function getPendingDeliveries(): Promise<DeliveryRequest[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('delivery_requests')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(`deliveriesRepo.getPendingDeliveries: ${error.message}`);
  return data as DeliveryRequest[];
}

export async function insertDelivery(
  input: DeliveryCreateInput,
): Promise<DeliveryRequest> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('delivery_requests')
    .insert({
      destination: input.destination,
      priority: input.priority,
      package_weight: input.package_weight ?? 1.0,
    })
    .select()
    .single();
  if (error) throw new Error(`deliveriesRepo.insertDelivery: ${error.message}`);
  return data as DeliveryRequest;
}

export async function updateDeliveryStatus(
  id: number,
  status: DeliveryStatus,
): Promise<DeliveryRequest> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('delivery_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`deliveriesRepo.updateDeliveryStatus: ${error.message}`);
  return data as DeliveryRequest;
}

export async function deleteDelivery(id: number): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('delivery_requests')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`deliveriesRepo.deleteDelivery: ${error.message}`);
}
