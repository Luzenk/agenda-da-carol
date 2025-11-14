import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = startDate && endDate ? {
      scheduledStart: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Ocupação da agenda (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const occupancyData = await prisma.appointment.groupBy({
      by: ['scheduledStart'],
      where: {
        scheduledStart: { gte: thirtyDaysAgo },
        status: { in: ['confirmed', 'completed', 'in_progress'] }
      },
      _count: true
    });

    // Processar dados de ocupação por dia
    const occupancyByDay = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      occupancyByDay.set(dateKey, 0);
    }

    occupancyData.forEach(item => {
      const dateKey = new Date(item.scheduledStart).toISOString().split('T')[0];
      const currentCount = occupancyByDay.get(dateKey) || 0;
      occupancyByDay.set(dateKey, currentCount + item._count);
    });

    const occupancy = Array.from(occupancyByDay.entries()).map(([date, count]) => ({
      date,
      count
    }));

    // Receita por período (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueData = await prisma.appointment.groupBy({
      by: ['scheduledStart'],
      where: {
        scheduledStart: { gte: sixMonthsAgo },
        status: 'completed',
        paymentStatus: 'paid'
      },
      _sum: {
        price: true
      }
    });

    // Processar receita por mês
    const revenueByMonth = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth.set(monthKey, 0);
    }

    revenueData.forEach(item => {
      const date = new Date(item.scheduledStart);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const currentRevenue = revenueByMonth.get(monthKey) || 0;
      revenueByMonth.set(monthKey, currentRevenue + (item._sum.price || 0));
    });

    const revenue = Array.from(revenueByMonth.entries()).map(([month, total]) => ({
      month,
      total
    }));

    // Serviços mais populares
    const popularServices = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: dateFilter,
      _count: {
        serviceId: true
      },
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 10
    });

    const servicesWithNames = await Promise.all(
      popularServices.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId }
        });
        return {
          name: service?.name || 'Desconhecido',
          count: item._count.serviceId
        };
      })
    );

    // Estatísticas de no-show e cancelamentos
    const totalAppointments = await prisma.appointment.count({
      where: dateFilter
    });

    const completedAppointments = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: 'completed'
      }
    });

    const noShowAppointments = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: 'no_show'
      }
    });

    const cancelledAppointments = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: 'cancelled'
      }
    });

    const pendingAppointments = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: 'pending'
      }
    });

    const confirmedAppointments = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: 'confirmed'
      }
    });

    // Taxa de conversão
    const conversionRate = totalAppointments > 0 
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : '0';

    const noShowRate = totalAppointments > 0
      ? ((noShowAppointments / totalAppointments) * 100).toFixed(1)
      : '0';

    const cancellationRate = totalAppointments > 0
      ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1)
      : '0';

    // Receita total
    const totalRevenue = await prisma.appointment.aggregate({
      where: {
        ...dateFilter,
        status: 'completed',
        paymentStatus: 'paid'
      },
      _sum: {
        price: true
      }
    });

    // Ticket médio
    const averageTicket = completedAppointments > 0
      ? ((totalRevenue._sum.price || 0) / completedAppointments).toFixed(2)
      : '0';

    return NextResponse.json({
      occupancy,
      revenue,
      popularServices: servicesWithNames,
      statistics: {
        total: totalAppointments,
        completed: completedAppointments,
        noShow: noShowAppointments,
        cancelled: cancelledAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        conversionRate: parseFloat(conversionRate),
        noShowRate: parseFloat(noShowRate),
        cancellationRate: parseFloat(cancellationRate),
        totalRevenue: totalRevenue._sum.price || 0,
        averageTicket: parseFloat(averageTicket)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
