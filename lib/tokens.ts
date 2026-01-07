/**
 * Token Utilities
 * 
 * Secure token generation and hashing for email verification and invites.
 * Never store raw tokens - only hashed versions.
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA-256
 * This is what we store in the database - never store raw tokens
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against a hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
}
