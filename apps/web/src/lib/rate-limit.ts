/**
 * Simple sliding-window rate limiter.
 * Uses in-memory Map for local/dev. Production should swap to Redis (REDIS_URL).
 * Key format: `rl:{scope}:{identifier}`
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX = 5;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  opts: { max?: number; windowMs?: number } = {}
): RateLimitResult {
  const max = opts.max ?? DEFAULT_MAX;
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/** Auth endpoints: 5 attempts / 15 min per IP + per account */
export function checkAuthRateLimit(ip: string, accountKey?: string): RateLimitResult {
  const ipResult = rateLimit(`auth:ip:${ip}`, { max: 20, windowMs: DEFAULT_WINDOW_MS });
  if (!ipResult.allowed) return ipResult;

  if (accountKey) {
    return rateLimit(`auth:acct:${accountKey}`, { max: 5, windowMs: DEFAULT_WINDOW_MS });
  }
  return ipResult;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
