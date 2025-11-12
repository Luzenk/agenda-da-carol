import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSlotAvailable } from '@/lib/availability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { scheduledStart, scheduledEnd } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { managementToken: token },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot reschedule a cancelled appointment' },
        { status: 400 }
      );
    }

    // Check rescheduling policy (12 hours)
    const now = new Date();
    const currentScheduledStart = new Date(appointment.scheduledStart);
    const hoursUntilAppointment = (currentScheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    let rescheduleFee = 0;
    if (hoursUntilAppointment < 12 && hoursUntilAppointment >= 0) {
      rescheduleFee = 30; // R$ 30 fee
    }

    // Check if new slot is available
    const newStart = new Date(scheduledStart);
    const newEnd = new Date(scheduledEnd);
    
    const available = await isSlotAvailable(newStart, newEnd);
    if (!available) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 409 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        scheduledStart: newStart,
        scheduledEnd: newEnd,
      },
      include: {
        client: true,
        service: true,
        variant: true,
      },
    });

    return NextResponse.json({
      appointment: updatedAppointment,
      rescheduleFee,
      message: rescheduleFee > 0
        ? `Taxa de reagendamento: R$ ${rescheduleFee.toFixed(2)}`
        : 'Reagendamento realizado sem custos',
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
