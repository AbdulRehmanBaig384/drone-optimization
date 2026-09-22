// src/app/api/edges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllEdges, insertEdge, deleteEdge } from '@/repositories/edgesRepo';

export async function GET() {
  try {
    const edges = await getAllEdges();
    return NextResponse.json(edges);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from_location, to_location, distance, travel_time, energy_cost } = body;
    if (!from_location || !to_location || !distance || !travel_time || !energy_cost) {
      return NextResponse.json({ error: 'All edge fields required' }, { status: 400 });
    }
    const edge = await insertEdge({ from_location, to_location, distance, travel_time, energy_cost });
    return NextResponse.json(edge, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await deleteEdge(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
