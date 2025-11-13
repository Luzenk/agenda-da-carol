import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            service: true,
            variant: true,
          },
          orderBy: {
            scheduledStart: 'desc',
          },
        },
        photos: {
          include: {
            appointment: {
              include: {
                service: true,
                variant: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      phone,
      email,
      cpf,
      gender,
      birthDate,
      profilePhoto,
      address,
      notes,
      lgpdConsent,
      marketingConsent,
      active,
    } = body;

    // Check if client exists
    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if phone is being changed and already exists
    if (phone && phone !== existing.phone) {
      const phoneExists = await prisma.client.findUnique({
        where: { phone },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        cpf,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        profilePhoto,
        address,
        notes,
        lgpdConsent,
        marketingConsent,
        active,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if client exists
    const existing = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has appointments
    if (existing.appointments.length > 0) {
      // Don't delete, just deactivate
      await prisma.client.update({
        where: { id },
        data: { active: false },
      });

      return NextResponse.json({
        message: 'Client deactivated due to existing appointments',
      });
    }

    // Delete client if no appointments
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
