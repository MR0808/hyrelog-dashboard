import crypto from 'crypto';

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function randomOtp6() {
  // 000000 - 999999 (leading zeros allowed)
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, '0');
}

export function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
