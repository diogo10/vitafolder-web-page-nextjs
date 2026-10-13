/**
 * Sliding-window rate limiter for the invite-family Server Action.
 *
 * This is an in-memory, single-instance limiter: sufficient for dev/test and
 * as a first layer of abuse protection. Multi-instance production deployments
 * should back this with shared state instead — e.g. Upstash Redis via
 * `@upstash/ratelimit` (`RATELIMIT` sliding window, keyed by sender IP/user
 * id). See README "Invite email authorization & abuse protection".
 */

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 5;

type RateLimitOptions = {
  now?: number;
  windowMs?: number;
  maxRequests?: number;
};

const buckets = new Map<string, number[]>();

export function checkInviteRateLimit(
  key: string,
  options: RateLimitOptions = {}
): { ok: true } | { ok: false } {
  const now = options.now ?? Date.now();
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
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
}
