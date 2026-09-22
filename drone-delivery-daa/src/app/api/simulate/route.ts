// src/app/api/simulate/route.ts
// POST /api/simulate — runs the full simulation orchestrator.
// Returns the full decision log and created assignments.

import { NextRequest, NextResponse } from 'next/server';
import { runSimulation, runNextStep } from '@/services/simulationOrchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode, maxDeliveries } = body as { mode?: string; maxDeliveries?: number };

    let result;
    if (mode === 'step') {
      result = await runNextStep();
    } else {
      result = await runSimulation(maxDeliveries ?? 100);
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
