import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from './auth';

export async function verifyAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  
  const isAuthenticated = await isAdminAuthenticated(authHeader);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return null;
}
