import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/utils';
import { isSlotAvailable } from '@/lib/availability';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      variantId,
      scheduledStart,
      scheduledEnd,
      clientName,
      clientPhone,
      clientEmail,
      lgpdConsent,
      marketingConsent,
    } = body;

    // Validate required fields
    if (!serviceId || !variantId || !scheduledStart || !scheduledEnd || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate LGPD consent
    if (!lgpdConsent) {
      return NextResponse.json(
        { error: 'LGPD consent is required' },
        { status: 400 }
      );
    }

    // Check if slot is still available
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    
    const available = await isSlotAvailable(start, end);
    if (!available) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    // Get variant for price
    const variant = await prisma.serviceVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Service variant not found' },
        { status: 404 }
      );
    }

    // Find or create client
    let client = await prisma.client.findUnique({
      where: { phone: clientPhone },
    });

    if (client) {
      // Update existing client
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: clientName,
          email: clientEmail || client.email,
          lgpdConsent: lgpdConsent || client.lgpdConsent,
          lgpdConsentDate: lgpdConsent && !client.lgpdConsent ? new Date() : client.lgpdConsentDate,
          marketingConsent: marketingConsent ?? client.marketingConsent,
        },
      });
    } else {
      // Create new client
      client = await prisma.client.create({
        data: {
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          lgpdConsent,
          lgpdConsentDate: new Date(),
          marketingConsent: marketingConsent || false,
          firstVisit: start,
        },
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId,
        variantId,
        scheduledStart: start,
        scheduledEnd: end,
        price: variant.price,
        status: 'pending',
        paymentStatus: 'pending',
        managementToken: generateToken(),
      },
      include: {
        client: true,
        service: true,
        variant: true,
      },
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
