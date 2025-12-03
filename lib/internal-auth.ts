/**
 * Internal admin authentication
 * 
 * NOTE: This uses a separate InternalUser table (must be added to backend schema)
 * This is separate from customer User authentication to avoid permission overlap
 */

import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { verifyPassword } from './password';

export type InternalUserRole = 'SUPER_ADMIN' | 'SALES_ADMIN' | 'SUPPORT_ADMIN' | 'BILLING_ADMIN';

export interface InternalUser {
  id: string;
  email: string;
  name: string | null;
  role: InternalUserRole;
}

const INTERNAL_SESSION_COOKIE = 'hyrelog-internal-session';

/**
 * Get current internal user session
 */
export async function getInternalSession(): Promise<InternalUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(INTERNAL_SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      return null;
    }
    
    // TODO: Implement session lookup
    // For now, this is a placeholder - actual implementation depends on session storage
    // You might want to create an InternalSession table or use JWT tokens
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Require internal authentication
 */
export async function requireInternalAuth(): Promise<InternalUser> {
  const user = await getInternalSession();
  
  if (!user) {
    throw new Error('Internal authentication required');
  }
  
  return user;
}

/**
 * Authenticate internal user
 */
export async function authenticateInternalUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: InternalUser; error?: string }> {
  try {
    // @ts-ignore - InternalUser model may not exist yet
    const internalUser = await prisma.internalUser.findUnique({
      where: { email },
    });
    
    if (!internalUser) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Verify password
    const isValid = await verifyPassword({
      hash: internalUser.password,
      password,
    });
    
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Create session (placeholder - implement actual session creation)
    const cookieStore = await cookies();
    cookieStore.set(INTERNAL_SESSION_COOKIE, internalUser.id, {
      path: '/internal',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return {
      success: true,
      user: {
        id: internalUser.id,
        email: internalUser.email,
        name: internalUser.name,
        role: internalUser.role as InternalUserRole,
      },
    };
  } catch (error) {
    console.error('Internal auth error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Sign out internal user
 */
export async function signOutInternal(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(INTERNAL_SESSION_COOKIE);
}

