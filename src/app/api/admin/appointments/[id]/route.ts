import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            price: true
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status, paymentStatus, internalNotes, scheduledStart, scheduledEnd } = body;
    const { id } = await params;
    const appointmentId = parseInt(id);

    // If rescheduling, check for conflicts
    if (scheduledStart && scheduledEnd) {
      const newStart = new Date(scheduledStart);
      const newEnd = new Date(scheduledEnd);

      // Get buffer from settings
      const settings = await prisma.settings.findFirst();
      const bufferMin = settings?.defaultBufferMin || 0;
      const bufferMs = bufferMin * 60 * 1000;

      // Check for overlapping appointments (excluding current appointment)
      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          id: { not: appointmentId },
          status: { notIn: ['cancelled', 'no_show'] },
          OR: [
            {
              AND: [
                { scheduledStart: { lte: newStart } },
                { scheduledEnd: { gt: newStart } }
              ]
            },
            {
              AND: [
                { scheduledStart: { lt: newEnd } },
                { scheduledEnd: { gte: newEnd } }
              ]
            },
            {
              AND: [
                { scheduledStart: { gte: newStart } },
                { scheduledEnd: { lte: newEnd } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointments.length > 0) {
        return NextResponse.json(
          { error: 'Horário não disponível. Já existe um agendamento neste período.' },
          { status: 409 }
        );
      }

      // Check blocks
      const blocks = await prisma.block.findMany({
        where: {
          startTime: { lt: newEnd },
          endTime: { gt: newStart }
        }
      });

      if (blocks.length > 0) {
        return NextResponse.json(
          { error: 'Horário bloqueado. Este período não está disponível.' },
          { status: 409 }
        );
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(status !== undefined && { status }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(scheduledStart !== undefined && { scheduledStart: new Date(scheduledStart) }),
        ...(scheduledEnd !== undefined && { scheduledEnd: new Date(scheduledEnd) }),
        ...(status === 'confirmed' && { confirmedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() }),
        ...(status === 'no_show' && { noShowAt: new Date() })
      },
      include: {
        client: true,
        service: true,
        variant: true
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}