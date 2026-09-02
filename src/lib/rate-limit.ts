// ============================================================================
// BEST-EFFORT RATE LIMITING — in-memory sliding window per warm serverless
// instance. The product site backs this with Postgres (Supabase); the group
// site has no database on purpose, so this is the polite-429 layer only: a
// cold start resets the counters and parallel instances count separately.
// Hard limits belong at the edge (Vercel WAF rate-limit rules — see
// README → Anti-spam). FAIL-OPEN by design: any error → allow.
// ============================================================================

type Bucket = { hits: number[]; };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

/**
 * Count a hit against `key`. Returns true when the request is ALLOWED,
 * false when the limit for the window would be exceeded.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= MAX_KEYS) sweep(now, windowMs);
      bucket = { hits: [] };
      buckets.set(key, bucket);
    }
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length >= limit) return false;
    bucket.hits.push(now);
    return true;
  } catch {
    return true; // fail-open
  }
}

function sweep(now: number, windowMs: number) {
  for (const [k, b] of buckets) {
    if (b.hits.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  // Still full → drop the oldest entries (Map preserves insertion order).
  if (buckets.size >= MAX_KEYS) {
    let n = Math.ceil(MAX_KEYS / 10);
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (--n <= 0) break;
    }
  }
}

/** Client IP: first x-forwarded-for entry → x-real-ip → 'unknown'. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
