import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (key) {
      const setting = await prisma.settings.findUnique({
        where: { key }
      });

      if (!setting) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }

      return NextResponse.json({
        key: setting.key,
        value: JSON.parse(setting.value),
        description: setting.description
      });
    }

    const settings = await prisma.settings.findMany();
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = JSON.parse(setting.value);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(formattedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: JSON.stringify(value),
        description
      },
      create: {
        key,
        value: JSON.stringify(value),
        description
      }
    });

    return NextResponse.json({
      key: setting.key,
      value: JSON.parse(setting.value),
      description: setting.description
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
