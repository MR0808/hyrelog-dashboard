import { NextRequest, NextResponse } from 'next/server';
import { authenticateInternalUser } from '@/lib/internal-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await authenticateInternalUser(email, password);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Authentication failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Internal login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

