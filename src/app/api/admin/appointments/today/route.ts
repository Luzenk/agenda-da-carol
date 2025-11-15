import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-helper';

export async function GET(request: NextRequest) {
  const authError = await verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ['cancelled'],
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
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}