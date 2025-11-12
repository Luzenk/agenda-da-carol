import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        variants: {
          where: { active: true },
          orderBy: { order: 'asc' }
        },
        serviceMaterials: {
          include: {
            material: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, order, active } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        imageUrl,
        order: order || 0,
        active: active !== undefined ? active : true
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
