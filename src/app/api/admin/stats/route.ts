import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ['cancelled'],
        },
      },
    });

    // Upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        scheduledStart: {
          gte: tomorrow,
          lt: nextWeek,
        },
        status: {
          notIn: ['cancelled'],
        },
      },
    });

    // Pending appointments (needs confirmation)
    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: 'pending',
        scheduledStart: {
          gte: now,
        },
      },
    });

    // Total clients
    const totalClients = await prisma.client.count({
      where: {
        active: true,
      },
    });

    // Revenue this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyRevenue = await prisma.appointment.aggregate({
      where: {
        scheduledStart: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          in: ['completed', 'confirmed'],
        },
      },
      _sum: {
        price: true,
      },
    });

    return NextResponse.json({
      todayAppointments,
      upcomingAppointments,
      pendingAppointments,
      totalClients,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
