import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, stockQuantity, unit, minStock, active } = body;

    const material = await prisma.material.create({
      data: {
        name,
        description,
        stockQuantity: stockQuantity || 0,
        unit: unit || 'un',
        minStock: minStock || 0,
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
