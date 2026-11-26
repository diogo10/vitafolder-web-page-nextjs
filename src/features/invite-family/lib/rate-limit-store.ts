import { checkInviteRateLimit } from "./rate-limit";

const SHARED_TIMEOUT_MS = 5_000;

/**
 * Shared rate-limit check for multi-instance / serverless rollouts.
 *
 * Scope: the default invite limiter (`rate-limit.ts`) is per-process memory
 * and therefore single-instance only. When `UPSTASH_REDIS_REST_URL` +
 * `UPSTASH_REDIS_REST_TOKEN` are configured, this module enforces the same
 * 5 req/min budget in shared Redis (fixed-window via `INCR` + `EXPIRE`) so
 * every instance counts against one budget. Otherwise it delegates to the
 * in-memory limiter and the rollout MUST stay single-instance (see README
 * "Invite email authorization & abuse protection").
 *
 * Namespacing: `prefix` (default `invite`) keeps unrelated actions from
 * sharing a bucket. Public signup passes `"signup"`, so invite and signup
 * budgets are counted separately in both Redis and the in-memory fallback.
 *
 * Fail-closed: any shared-store error (network, auth, unexpected shape)
 * returns `{ ok: false }` so abuse cannot slip through uncounted.
 */

export function isSharedRateLimitConfigured(envVars?: { url?: string; token?: string }): boolean {
  const url = envVars?.url ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = envVars?.token ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

function normalizePrefix(prefix: string | undefined): string {
  const safe = (prefix ?? "invite").replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 40);
  return safe || "invite";
}

function toRedisKey(key: string, now: number, windowMs: number, prefix?: string): string {
  const windowId = Math.floor(now / windowMs);
  const safe = key.replace(/[^a-zA-Z0-9:._-]/g, "_").slice(0, 160);
  return `${normalizePrefix(prefix)}:${safe}:${windowId}`;
}

export type SharedRateLimitOptions = {
  now?: number;
  windowMs?: number;
  maxRequests?: number;
  restUrl?: string;
  restToken?: string;
  fetchFn?: typeof fetch;
  /**
   * Redis / in-memory namespace. Keep independent budgets separate (for
   * example, signup must not share invite's bucket); defaults to `invite`.
   */
  prefix?: string;
};

export async function checkInviteRateLimitShared(
  key: string,
  options: SharedRateLimitOptions = {}
): Promise<{ ok: true } | { ok: false }> {
  const now = options.now ?? Date.now();
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 5;
  const prefix = normalizePrefix(options.prefix);
  const restUrl = (options.restUrl ?? process.env.UPSTASH_REDIS_REST_URL)?.replace(/\/+$/, "");
  const restToken = options.restToken ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !restToken) {
    // Namespace the in-memory fallback too so a signup request cannot consume
    // another action's budget (and vice versa).
    return checkInviteRateLimit(`${prefix}:${key}`, { now, windowMs, maxRequests });
  }

  const fetchFn = options.fetchFn ?? fetch;
  const redisKey = toRedisKey(key, now, windowMs, prefix);
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  try {
    const incrResponse = await fetchFn(`${restUrl}/incr/${encodeURIComponent(redisKey)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${restToken}` },
      signal: AbortSignal.timeout(SHARED_TIMEOUT_MS),
    });
    if (!incrResponse.ok) return { ok: false };
    const data = (await incrResponse.json()) as unknown as { result?: unknown };
    const count = typeof data.result === "number" ? data.result : Number(data.result);
    if (!Number.isFinite(count)) return { ok: false };
    if (count === 1) {
      // Best-effort window expiry; a failure here only over-counts, and the
      // request itself was already counted, so do not fail the request.
      try {
        await fetchFn(`${restUrl}/expire/${encodeURIComponent(redisKey)}/${windowSeconds}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${restToken}` },
          signal: AbortSignal.timeout(SHARED_TIMEOUT_MS),
        });
      } catch {
        // Ignore expiry errors (fail open on expiry only, not on counting).
      }
    }
    return count <= maxRequests ? { ok: true } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * Single entry point for public Server Actions: shared store when configured,
 * otherwise in-memory (single-instance rollout only). Callers that need an
 * independent budget pass `prefix` (signup uses `"signup"`; the default is
 * `"invite"`).
 */
export async function checkInviteRateLimitForKey(
  key: string,
  options: SharedRateLimitOptions = {}
): Promise<{ ok: true } | { ok: false }> {
  return checkInviteRateLimitShared(key, options);
}
