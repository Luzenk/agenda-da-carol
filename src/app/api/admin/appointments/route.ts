import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.scheduledStart = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
        variant: true
      },
      orderBy: {
        scheduledStart: 'asc'
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      serviceId,
      variantId,
      scheduledStart,
      scheduledEnd,
      status = 'confirmed',
      paymentStatus = 'pending',
      price,
      notes
    } = body;

    // Validate required fields
    if (!clientId || !serviceId || !variantId || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if service and variant exist
    const variant = await prisma.serviceVariant.findUnique({
      where: { id: variantId },
      include: { service: true }
    });

    if (!variant || variant.serviceId !== serviceId) {
      return NextResponse.json(
        { error: 'Invalid service or variant' },
        { status: 404 }
      );
    }

    // Check for overlapping appointments
    // Two intervals overlap if: start1 < end2 AND start2 < end1
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    const overlapping = await prisma.appointment.findFirst({
      where: {
        AND: [
          { scheduledStart: { lt: end } },
          { scheduledEnd: { gt: start } },
          { status: { notIn: ['cancelled', 'no_show'] } }
        ]
      }
    });

    if (overlapping) {
      console.error('Conflict detected:', {
        newAppointment: { start, end },
        conflictingAppointment: {
          id: overlapping.id,
          start: overlapping.scheduledStart,
          end: overlapping.scheduledEnd
        }
      });
      return NextResponse.json(
        { 
          error: 'Time slot already booked',
          conflictingAppointmentId: overlapping.id,
          conflictingStart: overlapping.scheduledStart,
          conflictingEnd: overlapping.scheduledEnd
        },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        variantId,
        scheduledStart: start,
        scheduledEnd: end,
        status,
        paymentStatus,
        price: price || variant.price,
        notes,
        managementToken: generateToken()
      },
      include: {
        client: true,
        service: true,
        variant: true
      }
    });

    // Update client statistics
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalVisits: { increment: 1 },
        lastVisit: start
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}