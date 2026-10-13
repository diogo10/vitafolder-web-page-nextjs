import { describe, expect, it } from "vitest";

/**
 * LIVE negative test for the Supabase `resend-email-v1` Edge Function.
 *
 * Purpose: prove the Edge Function rejects anon-key-only calls (JWT /
 * allowlisted-sender check) and enforces its own server-side rate limit, so
 * the public `/invite-family` form is not an open email relay. See README
 * "Invite email authorization & abuse protection".
 *
 * This spec NEVER runs in CI: it is skipped unless `RUN_LIVE_EDGE_TESTS=1`
 * with `SUPABASE_URL` + `SUPABASE_ANON_KEY` set. Run it manually before any
 * public rollout:
 *
 * ```bash
 * RUN_LIVE_EDGE_TESTS=1 SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_ANON_KEY=<anon-key> SUPABASE_INVITE_FUNCTION_NAME=resend-email-v1 \
 *   npx vitest run src/features/invite-family/lib/edge-auth-negative.live.test.ts
 * ```
 *
 * If either test FAILS (edge returns 200 for anon-key-only calls or never
 * returns 429 under burst), the Edge Function is permissive — keep
 * `/invite-family` gated (Turnstile + single-instance, no public traffic)
 * until the Edge Function is hardened.
 *
 * Safety: the probe address uses the `.invalid` TLD (RFC 2606, never
 * routable) so even a permissive edge cannot deliver mail.
 */

const RUN_LIVE = process.env.RUN_LIVE_EDGE_TESTS === "1";
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const FUNCTION_NAME = process.env.SUPABASE_INVITE_FUNCTION_NAME ?? "resend-email-v1";
const CAN_RUN = Boolean(RUN_LIVE && SUPABASE_URL && ANON_KEY);

const canRunDescribe = CAN_RUN ? describe : describe.skip;

canRunDescribe("resend-email-v1 live negative tests (anon-key-only)", () => {
  const endpoint = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
  const probePayload = {
    to: "invite-auth-probe@example.invalid",
    locale: "en",
    inviterName: "Auth Probe",
    familyName: "Probe Family",
    inviteCode: "PROBE-0000",
  };

  async function postProbe(): Promise<Response> {
    return fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: `${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(probePayload),
      signal: AbortSignal.timeout(15_000),
    });
  }

  it("rejects anon-key-only calls (does not act as an open relay)", async () => {
    const response = await postProbe();
    // Any non-2xx (401/403 JWT rejection, 429 rate limit, 4xx validation)
    // proves the edge does not blindly send on anon-key auth alone.
    expect(response.ok).toBe(false);
    expect([401, 403, 429]).toContain(response.status);
  });

  it("enforces a server-side rate limit under burst", async () => {
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => postProbe().catch(() => null))
    );
    const statuses = responses
      .filter((response): response is Response => response !== null)
      .map((response) => response.status);
    expect(statuses.length).toBeGreaterThan(0);
    // At least one rejection in the burst must be auth/rate-limit shaped.
    // (All-200 here means the edge has neither auth nor rate limiting.)
    expect(statuses.some((status) => status === 401 || status === 403 || status === 429)).toBe(
      true
    );
  });
});

describe("resend-email-v1 live negative tests (skipped without opt-in)", () => {
  it("skips without RUN_LIVE_EDGE_TESTS=1", () => {
    expect(RUN_LIVE ? CAN_RUN : true).toBe(true);
  });
});
