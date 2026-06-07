import { timingSafeEqual } from 'node:crypto';

export type NamedApiKey = { name: string; key: string };
export type AuthResult = { ok: true; name: string } | { ok: false; reason: 'api_keys_not_configured' | 'missing_api_key' | 'invalid_api_key' };
export type HeaderMap = Record<string, string | string[] | undefined>;

export function parseApiKeys(raw?: string): NamedApiKey[] {
  if (!raw?.trim()) return [];
  return raw.split(',').map((entry) => {
    const idx = entry.indexOf(':');
    if (idx <= 0 || idx === entry.length - 1) throw new Error('BABYLON_SHIELD_API_KEYS must use name:key entries');
    return { name: entry.slice(0, idx).trim(), key: entry.slice(idx + 1).trim() };
  });
}

export function authenticateApiKey(headers: HeaderMap, keys: NamedApiKey[]): AuthResult {
  if (keys.length === 0) return { ok: false, reason: 'api_keys_not_configured' };
  const presented = first(headers['x-api-key'])?.trim() ?? extractBearer(first(headers.authorization));
  if (!presented) return { ok: false, reason: 'missing_api_key' };
  for (const item of keys) if (safeEqual(presented, item.key)) return { ok: true, name: item.name };
  return { ok: false, reason: 'invalid_api_key' };
}

function first(value?: string | string[]): string | undefined { return Array.isArray(value) ? value[0] : value; }
function extractBearer(value?: string): string | undefined { return value?.startsWith('Bearer ') ? value.slice(7).trim() : undefined; }
function safeEqual(a: string, b: string): boolean { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
