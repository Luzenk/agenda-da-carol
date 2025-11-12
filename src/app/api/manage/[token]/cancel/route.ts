import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { reason } = body;

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
        { error: 'Appointment already cancelled' },
        { status: 400 }
      );
    }

    // Check cancellation policy (24 hours)
    const now = new Date();
    const scheduledStart = new Date(appointment.scheduledStart);
    const hoursUntilAppointment = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    let cancellationFee = 0;
    if (hoursUntilAppointment < 24 && hoursUntilAppointment >= 0) {
      cancellationFee = (appointment.price || 0) * 0.5; // 50% fee
    } else if (hoursUntilAppointment < 0) {
      cancellationFee = appointment.price || 0; // 100% fee for past appointments
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: {
        client: true,
        service: true,
        variant: true,
      },
    });

    return NextResponse.json({
      appointment: updatedAppointment,
      cancellationFee,
      message: cancellationFee > 0 
        ? `Taxa de cancelamento: R$ ${cancellationFee.toFixed(2)}`
        : 'Cancelamento realizado sem custos',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
