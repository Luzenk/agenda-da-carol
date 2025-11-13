import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            appointments: true,
            photos: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existing = await prisma.client.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
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
        lgpdConsent: lgpdConsent || false,
        lgpdConsentDate: lgpdConsent ? new Date() : null,
        marketingConsent: marketingConsent || false,
        active: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}