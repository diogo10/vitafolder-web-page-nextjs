/**
 * Sliding-window rate limiter for the invite-family Server Action.
 *
 * Scope: single-instance, low-risk rollout only. Buckets live in module
 * memory, so counts are per Node.js process. Behind multiple instances /
 * serverless concurrency each instance enforces its own budget, which weakens
 * the limit. Do not rely on this for multi-instance production traffic —
 * before scaling, replace it with shared state, e.g. Upstash Redis via
 * `@upstash/ratelimit` (`RATELIMIT` sliding window, keyed by sender IP/user
 * id). See README "Invite email authorization & abuse protection".
 *
 * Memory hygiene: buckets are pruned opportunistically — expired timestamps
 * are dropped on every check, empty keys are deleted, a periodic sweep clears
 * stale keys across all buckets, and the map is capped (oldest keys evicted
 * first) so a flood of distinct keys cannot grow memory unboundedly.
 */

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 5;
const MAX_BUCKETS = 1000;
const SWEEP_INTERVAL_MS = 60_000;

type RateLimitOptions = {
  now?: number;
  windowMs?: number;
  maxRequests?: number;
};

const buckets = new Map<string, number[]>();
let lastSweep = 0;

function sweepInviteRateLimits(now: number, windowMs: number): void {
  for (const [key, timestamps] of buckets) {
    const live = timestamps.filter((timestamp) => timestamp > now - windowMs);
    if (live.length === 0) {
      buckets.delete(key);
    } else if (live.length !== timestamps.length) {
      buckets.set(key, live);
    }
  }
  // Cap: evict oldest-inserted keys first (Map preserves insertion order).
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next();
    if (oldest.done) break;
    buckets.delete(oldest.value);
  }
}

export function checkInviteRateLimit(
  key: string,
  options: RateLimitOptions = {}
): { ok: true } | { ok: false } {
  const now = options.now ?? Date.now();
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    lastSweep = now;
    sweepInviteRateLimits(now, windowMs);
  }
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  if (hits.length >= maxRequests) {
    buckets.set(key, hits);
    return { ok: false };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

/** Clears all rate-limit buckets. Test-only helper. */
export function resetInviteRateLimits(): void {
  buckets.clear();
  lastSweep = 0;
}
