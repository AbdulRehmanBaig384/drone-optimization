// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listLocations, createLocation } from '@/services/locationService';

export async function GET() {
  try {
    const locations = await listLocations();
    return NextResponse.json(locations);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, pos_x, pos_y } = body;
    if (!name || pos_x === undefined || pos_y === undefined) {
      return NextResponse.json({ error: 'name, pos_x, pos_y required' }, { status: 400 });
    }
    const loc = await createLocation(name, Number(pos_x), Number(pos_y));
    return NextResponse.json(loc, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
