import argon2 from 'argon2';

/**
 * Hash a password using Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 threads
  });
}

/**
 * Verify a password against an Argon2 hash
 * This matches Better-Auth's expected signature: verify({ hash, password })
 */
export async function verifyPassword({
  hash,
  password
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

/**
 * Check if a hash is using Argon2 format
 */
export function isArgon2Hash(hash: string): boolean {
  return hash.startsWith('$argon2');
}

