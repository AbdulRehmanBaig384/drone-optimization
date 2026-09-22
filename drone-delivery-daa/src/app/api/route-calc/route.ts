// src/app/api/route-calc/route.ts
// POST /api/route-calc — single route calculation between two locations.
// Returns Dijkstra result, A* result, and comparison.

import { NextRequest, NextResponse } from 'next/server';
import { calculateRoute } from '@/services/routeCalculationService';
import type { WeightKey } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, destinationId, weightKey } = body;

    if (!sourceId || !destinationId) {
      return NextResponse.json(
        { error: 'sourceId and destinationId are required' },
        { status: 400 },
      );
    }

    const comparison = await calculateRoute(
      Number(sourceId),
      Number(destinationId),
      (weightKey as WeightKey) ?? 'distance',
    );

    return NextResponse.json(comparison);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
