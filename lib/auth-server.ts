import { auth } from './auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Get the current session on the server side
 */
export async function getServerSession() {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Better-Auth uses cookies for session management
    const session = await auth.api.getSession({
      headers: headersList,
    });
    
    return session;
  } catch (error) {
    // If session check fails, return null
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server components or server actions
 */
export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
}

/**
 * Get session or return null (doesn't redirect)
 * Useful for pages that work for both authenticated and unauthenticated users
 */
export async function getOptionalSession() {
  return getServerSession();
}
