import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.availabilityRule.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching availability rules:', error);
    return NextResponse.json({ error: 'Failed to fetch availability rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, active } = body;

    const rule = await prisma.availabilityRule.create({
      data: {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating availability rule:', error);
    return NextResponse.json({ error: 'Failed to create availability rule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.availabilityRule.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting availability rule:', error);
    return NextResponse.json({ error: 'Failed to delete availability rule' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime, active } = body;

    const rule = await prisma.availabilityRule.update({
      where: { id: parseInt(id) },
      data: {
        ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating availability rule:', error);
    return NextResponse.json({ error: 'Failed to update availability rule' }, { status: 500 });
  }
}
