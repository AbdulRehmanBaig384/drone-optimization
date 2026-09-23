// src/app/api/deliveries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listDeliveries, createDelivery, removeDelivery, markDelivered, unassignDelivery } from '@/services/deliveryService';

export async function GET() {
  try {
    const deliveries = await listDeliveries();
    return NextResponse.json(deliveries);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, priority, package_weight } = body;
    if (!destination || !priority) {
      return NextResponse.json({ error: 'destination and priority required' }, { status: 400 });
    }
    const delivery = await createDelivery({ destination, priority, package_weight });
    return NextResponse.json(delivery, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await removeDelivery(id);
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
    if (action === 'deliver') {
      const delivery = await markDelivered(Number(id));
      return NextResponse.json(delivery);
    } else if (action === 'unassign') {
      const delivery = await unassignDelivery(Number(id));
      return NextResponse.json(delivery);
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
