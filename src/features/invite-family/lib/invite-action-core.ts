import { z } from "zod";
import { env } from "@/lib/env";
import { resolveRateLimitKey } from "@/lib/rate-limit-key";
import { checkInviteRateLimitForKey } from "./rate-limit-store";
import { sendInviteEmail } from "./send-invite-email";
import { getInviteFamilyStrings } from "./strings";
import { verifyTurnstileToken } from "./verify-turnstile";
import { inviteFamilySchema } from "../schemas";

export type InviteFamilyActionErrors = {
  to?: string;
  locale?: string;
  inviterName?: string;
  familyName?: string;
  inviteCode?: string;
};

export type InviteFamilyActionResult =
  { ok: true } | { ok: false; errors: InviteFamilyActionErrors; formError?: string };

/**
 * `website` is a honeypot field: the form renders it as a hidden input that
 * humans never fill. Bots that fill it get a fake success (so they cannot
 * probe whether the trap worked) and the Edge Function is never called.
 *
 * `turnstileToken` carries the Cloudflare Turnstile client token. It is
 * required whenever `TURNSTILE_SECRET_KEY` is configured (see below) and is
 * never forwarded to the Edge Function.
 */
const sendInviteRequestSchema = inviteFamilySchema.extend({
  website: z.string().max(500).optional().default(""),
  turnstileToken: z.string().max(2000).optional().default(""),
});

export type SendInviteActionTestOverrides = {
  /** Key for rate limiting (sender IP in production). Test-only override. */
  rateLimitKey?: string;
  /**
   * Turnstile secret override for tests. `undefined` (default) reads
   * `env.TURNSTILE_SECRET_KEY`; pass `null` to simulate "not configured".
   */
  turnstileSecret?: string | null;
  /** Turnstile verification override for tests (avoids network). */
  verifyTurnstile?: (token: string) => Promise<boolean>;
};

/**
 * Abuse protection for the invite flow (see README "Invite email
 * authorization & abuse protection"):
 *
 * - Honeypot: submissions with a filled `website` field are silently
 *   accepted without sending anything.
 * - Bot gate: when `TURNSTILE_SECRET_KEY` is configured, a valid Turnstile
 *   token is required before sending. When no secret is configured the
 *   action fails closed in production (generic error) and only allows
 *   sends in dev/test — do not expose the form publicly on anon-key auth
 *   alone.
 * - Validation first: Zod runs before rate limiting so invalid payloads and
 *   honeypot hits never consume budget. Only valid, non-honeypot requests
 *   are rate-limited.
 * - Rate limiting: sliding-window limiter keyed by sender IP. Uses the
 *   shared Upstash Redis store when `UPSTASH_REDIS_REST_URL` +
 *   `UPSTASH_REDIS_REST_TOKEN` are configured (required for
 *   multi-instance / serverless); otherwise falls back to in-memory, which
 *   is explicitly scoped to a single-instance low-risk rollout. Fail-closed:
 *   when no per-request key can be resolved (no IP, no cookie), the request
 *   is rejected with a generic rate-limit error rather than falling back
 *   to a shared "global" bucket.
 * - Authorization boundary: this app has no session/auth yet, so per-sender
 *   authorization MUST also be enforced by the Supabase `resend-email-v1`
 *   Edge Function (verify the caller's Supabase JWT / allowlisted sender;
 *   never rely on the anon key alone). Once app-level auth lands, require a
 *   valid session at the top of this action and fail closed (return a
 *   generic formError) when there is none.
 *
 * NOTE: this module intentionally has no `"use server"` directive so its
 * exports are never reachable as Server Actions. Test overrides live here —
 * not on the public action — so clients cannot pass `rateLimitKey` and
 * evade IP limiting. The public entry point is `sendInviteAction` in
 * `../actions.ts` (single-arg).
 */
export async function executeSendInviteAction(
  input: unknown,
  overrides: SendInviteActionTestOverrides = {}
): Promise<InviteFamilyActionResult> {
  const parsed = sendInviteRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errors: InviteFamilyActionErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof InviteFamilyActionErrors | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    if (Object.keys(errors).length === 0) {
      return { ok: false, errors, formError: "Invalid input." };
    }
    return { ok: false, errors };
  }

  if (parsed.data.website.trim() !== "") {
    return { ok: true };
  }

  const strings = getInviteFamilyStrings(parsed.data.locale);
  const { website: _website, turnstileToken, ...payload } = parsed.data;
  void _website;

  const turnstileSecret =
    overrides.turnstileSecret !== undefined ? overrides.turnstileSecret : env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const verified = overrides.verifyTurnstile
      ? await overrides.verifyTurnstile(turnstileToken)
      : await verifyTurnstileToken(turnstileToken, { secret: turnstileSecret });
    if (!verified) {
      return { ok: false, errors: {}, formError: strings.genericError };
    }
  } else if (env.NODE_ENV === "production") {
    console.error(
      "[invite-family] TURNSTILE_SECRET_KEY is not configured — refusing to send invite in production."
    );
    return { ok: false, errors: {}, formError: strings.genericError };
  }

  const rateLimitKey = overrides.rateLimitKey ?? (await resolveRateLimitKey());
  if (!rateLimitKey) {
    return { ok: false, errors: {}, formError: strings.rateLimitError };
  }
  if (!(await checkInviteRateLimitForKey(rateLimitKey)).ok) {
    return { ok: false, errors: {}, formError: strings.rateLimitError };
  }

  const result = await sendInviteEmail(payload);
  if (!result.ok) {
    return { ok: false, errors: {}, formError: result.error };
  }
  return { ok: true };
}
