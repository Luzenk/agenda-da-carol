import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');

    const where = serviceId ? { serviceId: parseInt(serviceId) } : {};

    const variants = await prisma.serviceVariant.findMany({
      where,
      include: {
        service: true
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, name, description, durationMin, price, order, active } = body;

    const variant = await prisma.serviceVariant.create({
      data: {
        serviceId: parseInt(serviceId),
        name,
        description,
        durationMin: parseInt(durationMin),
        price: parseFloat(price),
        order: order || 0,
        active: active !== undefined ? active : true
      },
      include: {
        service: true
      }
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }
}
