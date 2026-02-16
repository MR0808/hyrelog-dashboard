/**
 * Generate API-format workspace key and hash for sync to HyreLog API.
 * API expects prefix like hlk_{region}_ws_{8hex} and validates with HMAC-SHA256(apiKeySecret, fullKey).
 * Requires HYRELOG_API_KEY_SECRET (same as API's apiKeySecret) to be set.
 */

import { createHmac, randomBytes } from 'crypto';

const REGION_CODES: Record<string, string> = {
  US: 'us',
  EU: 'eu',
  UK: 'uk',
  AU: 'au',
};

/** API region (US, EU, UK, AU). Use toApiDataRegion for dashboard DataRegion -> API. */
export type ApiRegion = 'US' | 'EU' | 'UK' | 'AU';

function getApiKeySecret(): string {
  const secret = process.env.HYRELOG_API_KEY_SECRET;
  if (!secret) throw new Error('HYRELOG_API_KEY_SECRET is required to sync API keys');
  return secret;
}

/**
 * Generate full key in API format: hlk_{region}_ws_{8hex}{16hex}
 * Returns { fullKey, prefix } where prefix is first 20 chars (for display and API lookup).
 */
export function generateApiFormatKey(region: ApiRegion): { fullKey: string; prefix: string } {
  const regionCode = REGION_CODES[region] ?? 'us';
  const part1 = randomBytes(8).toString('hex');
  const part2 = randomBytes(16).toString('hex');
  const fullKey = `hlk_${regionCode}_ws_${part1}${part2}`;
  const prefix = fullKey.substring(0, 20);
  return { fullKey, prefix };
}

/**
 * Hash full key for API storage (HMAC-SHA256 with HYRELOG_API_KEY_SECRET).
 * Must match API's hash so Bearer token validation works.
 */
export function hashApiKeyForSync(fullKey: string): string {
  const secret = getApiKeySecret();
  return createHmac('sha256', secret).update(fullKey).digest('hex');
}

export function isApiKeySyncConfigured(): boolean {
  return Boolean(process.env.HYRELOG_API_KEY_SECRET);
}
