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
    
    // Padronizar resposta: usar whatsappNumber se existir, senão usar phone
    const response = {
      businessName: businessInfo.businessName || businessInfo.name || 'Agenda da Carol',
      whatsappNumber: businessInfo.whatsappNumber || businessInfo.phone || '5511999999999',
      instagramHandle: businessInfo.instagramHandle || businessInfo.instagram || '@caroltrancista',
      address: businessInfo.address || '',
      email: businessInfo.email || '',
      description: businessInfo.description || ''
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business info' },
      { status: 500 }
    );
  }
}