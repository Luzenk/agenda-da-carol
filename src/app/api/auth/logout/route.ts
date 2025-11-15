import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      clearAdminSession(token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}