import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }
    
    // Check for events in the last 5 minutes
    const eventCount = await prisma.auditEvent.count({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });
    
    return NextResponse.json({
      hasEvents: eventCount > 0,
      count: eventCount,
    });
  } catch (error) {
    console.error('Error checking events:', error);
    return NextResponse.json(
      { error: 'Failed to check events' },
      { status: 500 }
    );
  }
}

