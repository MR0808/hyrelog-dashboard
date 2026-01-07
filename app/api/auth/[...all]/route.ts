/**
 * Better Auth API Route Handler
 * 
 * Handles all better-auth API requests (sign-in, sign-up, sign-out, etc.)
 * Automatically logs audit events for authentication actions.
 */

import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    logger.log('[Auth API] GET request:', request.url);
    const response = await handler.GET(request);
    logger.log('[Auth API] GET response status:', response.status);
    return response;
  } catch (error) {
    logger.error('[Auth API] GET error:', error);
    return NextResponse.json(
      { error: 'Authentication error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    logger.log('[Auth API] POST request:', pathname);
    logger.log('[Auth API] Full URL:', url.toString());
    
    // Log request body for debugging (without sensitive data)
    let bodyData: Record<string, string> = {};
    try {
      const clonedRequest = request.clone();
      const formData = await clonedRequest.formData();
      formData.forEach((value, key) => {
        if (key === 'password') {
          bodyData[key] = '[REDACTED]';
        } else {
          bodyData[key] = value.toString();
        }
      });
      logger.log('[Auth API] POST body:', bodyData);
    } catch (bodyError) {
      logger.warn('[Auth API] Failed to parse request body:', bodyError);
    }
    
    const response = await handler.POST(request);
    logger.log('[Auth API] POST response status:', response.status);
    logger.log('[Auth API] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // If we get a 404, better-auth might not be recognizing the route
    if (response.status === 404) {
      logger.error('[Auth API] 404 error - route not found. Pathname:', pathname);
      logger.error('[Auth API] This might indicate better-auth route configuration issue.');
    }
    
    // Log audit events for successful authentication actions
    if (response.ok) {
      try {
        if (pathname.includes('sign-up') || pathname.includes('signup') || pathname.includes('email/sign-up')) {
          // For sign-up, try to find the newly created user
          const email = bodyData.email;
          if (email) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
              await audit.userSignup(user.id, email);
              logger.log('[Auth API] Logged signup event for user:', user.id);
            }
          }
        } else if (pathname.includes('sign-in') || pathname.includes('signin') || pathname.includes('email/sign-in')) {
          // For sign-in, try to get user from session
          const email = bodyData.email;
          if (email) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
              await audit.userLogin(user.id);
              logger.log('[Auth API] Logged login event for user:', user.id);
            }
          }
        } else if (pathname.includes('sign-out') || pathname.includes('signout')) {
          // For sign-out, try to get user from session cookie
          try {
            const session = await auth.api.getSession({ headers: Object.fromEntries(request.headers.entries()) });
            if (session?.user?.id) {
              await audit.userLogout(session.user.id);
              logger.log('[Auth API] Logged logout event for user:', session.user.id);
            }
          } catch {
            // Session might already be invalidated
          }
        }
      } catch (auditError) {
        // Don't fail the request if audit logging fails
        logger.error('[Auth API] Failed to log audit event:', auditError);
      }
    }
    
    // Don't read the response body here - let the client handle it
    // This prevents "body stream already read" errors
    if (!response.ok) {
      logger.warn('[Auth API] POST error response status:', response.status);
    }
    
    return response;
  } catch (error) {
    logger.error('[Auth API] POST error:', error);
    return NextResponse.json(
      { error: 'Authentication error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
