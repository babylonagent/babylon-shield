type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
export function checkRateLimit(key: string, max: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  if (bucket.count >= max) return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  bucket.count += 1; buckets.set(key, bucket); return { ok: true as const, remaining: max - bucket.count };
}
export function resetRateLimitsForTests() { buckets.clear(); }
