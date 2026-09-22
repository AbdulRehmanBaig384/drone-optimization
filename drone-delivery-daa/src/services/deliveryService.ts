// src/services/deliveryService.ts
import {
  getAllDeliveries, getPendingDeliveries, insertDelivery,
  updateDeliveryStatus, deleteDelivery,
} from '@/repositories/deliveriesRepo';
import type { DeliveryRequest, DeliveryCreateInput } from '@/types';

export async function listDeliveries(): Promise<DeliveryRequest[]> {
  return getAllDeliveries();
}

export async function listPendingDeliveries(): Promise<DeliveryRequest[]> {
  return getPendingDeliveries();
}

export async function createDelivery(
  input: DeliveryCreateInput,
): Promise<DeliveryRequest> {
  return insertDelivery(input);
}

export async function removeDelivery(id: number): Promise<void> {
  return deleteDelivery(id);
}

export async function markDelivered(id: number): Promise<DeliveryRequest> {
  return updateDeliveryStatus(id, 'delivered');
}
