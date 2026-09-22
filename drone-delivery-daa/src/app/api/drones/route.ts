// src/app/api/drones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listDrones, createDrone, removeDrone, rechargeDrone } from '@/services/droneService';

export async function GET() {
  try {
    const drones = await listDrones();
    return NextResponse.json(drones);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, battery_capacity, current_battery, current_location } = body;
    if (!name || !battery_capacity || !current_battery || !current_location) {
      return NextResponse.json({ error: 'name, battery_capacity, current_battery, current_location required' }, { status: 400 });
    }
    const drone = await createDrone({ name, battery_capacity, current_battery, current_location });
    return NextResponse.json(drone, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await removeDrone(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    if (action === 'recharge') {
      const drone = await rechargeDrone(Number(id));
      return NextResponse.json(drone);
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
