import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: 'business_info' },
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'Business info not found' },
        { status: 404 }
      );
    }

    const businessInfo = JSON.parse(settings.value);
    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business info' },
      { status: 500 }
    );
  }
}
