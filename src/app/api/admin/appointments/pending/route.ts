import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'pending',
        scheduledStart: {
          gte: now,
        },
      },
      include: {
        client: true,
        service: true,
        variant: true,
      },
      orderBy: {
        scheduledStart: 'asc',
      },
      take: 10,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching pending appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
