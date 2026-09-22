// ============================================================
// src/types/delivery.ts
// ============================================================

export type DeliveryStatus = 'pending' | 'assigned' | 'in_flight' | 'delivered' | 'failed';

export interface DeliveryRequest {
  id: number;
  destination: number;        // location id (FK)
  priority: number;           // 1 = highest, 5 = lowest
  package_weight: number;     // kg
  status: DeliveryStatus;
  created_at: string;         // ISO timestamp
}

export interface DeliveryCreateInput {
  destination: number;
  priority: number;
  package_weight?: number;
}
