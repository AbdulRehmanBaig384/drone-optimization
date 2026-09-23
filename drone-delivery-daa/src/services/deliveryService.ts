// src/services/deliveryService.ts
import {
  getAllDeliveries, getPendingDeliveries, insertDelivery,
  updateDeliveryStatus, deleteDelivery,
} from '@/repositories/deliveriesRepo';
import { deleteAssignmentByDelivery, getAssignmentByDelivery } from '@/repositories/assignmentsRepo';
import { updateDroneStatus } from '@/repositories/dronesRepo';
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

export async function unassignDelivery(id: number): Promise<DeliveryRequest> {
  // Try to find the assignment to restore drone battery
  const assignment = await getAssignmentByDelivery(id);
  if (assignment) {
    // Delete the assignment
    await deleteAssignmentByDelivery(id);
    
    // We could technically refund the exact battery here by fetching the drone and adding assignment.total_energy,
    // but a simplified approach for the dashboard is to just reset the drone to available.
    await updateDroneStatus(assignment.drone_id, 'available');
  }

  // Set the delivery back to pending
  return updateDeliveryStatus(id, 'pending');
}
