"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { checkInviteRateLimit } from "./lib/rate-limit";
import { sendInviteEmail } from "./lib/send-invite-email";
import { inviteFamilySchema } from "./schemas";

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
 */
const sendInviteRequestSchema = inviteFamilySchema.extend({
  website: z.string().max(500).optional().default(""),
});

export type SendInviteActionTestOverrides = {
  /** Key for rate limiting (sender IP in production). Test-only override. */
  rateLimitKey?: string;
};

/**
 * Abuse protection for the invite flow (see README "Invite email
 * authorization & abuse protection"):
 *
 * - Honeypot: submissions with a filled `website` field are silently
 *   accepted without sending anything. For stronger bot protection, add
 *   Cloudflare Turnstile / reCAPTCHA verification here before sending.
 * - Validation first: Zod runs before rate limiting so invalid payloads and
 *   honeypot hits never consume budget. Only valid, non-honeypot requests
 *   are rate-limited.
 * - Rate limiting: sliding-window limiter keyed by sender IP (in-memory,
 *   single-instance; production multi-instance deployments should use
 *   Upstash Redis via `@upstash/ratelimit` instead — see
 *   `lib/rate-limit.ts`). Fail-closed: when no per-request key can be
 *   resolved (no IP, no cookie), the request is rejected with a generic
 *   rate-limit error rather than falling back to a shared "global" bucket
 *   (which would let one abusive client exhaust everyone, or let abuse
 *   through uncounted).
 * - Authorization boundary: this app has no session/auth yet, so per-sender
 *   authorization MUST be enforced by the Supabase `resend-email-v1` Edge
 *   Function (verify the caller's Supabase JWT / allowlisted sender; never
 *   rely on the anon key alone). Once app-level auth lands, require a valid
 *   session at the top of this action and fail closed (return a generic
 *   formError) when there is none.
 */
export async function sendInviteAction(input: unknown): Promise<InviteFamilyActionResult> {
  return sendInviteActionInternal(input);
}

/**
 * Test-only entry point. Production callers must use `sendInviteAction`
 * (single-arg); the `rateLimitKey` override exists so unit tests can
 * exercise the limiter without a request scope.
 */
export async function sendInviteActionInternal(
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

  const rateLimitKey = overrides.rateLimitKey ?? (await resolveRateLimitKey());
  if (!rateLimitKey) {
    return { ok: false, errors: {}, formError: "Too many requests. Try again later." };
  }
  if (!checkInviteRateLimit(rateLimitKey).ok) {
    return { ok: false, errors: {}, formError: "Too many requests. Try again later." };
  }

  const { website: _honeypot, ...payload } = parsed.data;
  void _honeypot;

  const result = await sendInviteEmail(payload);
  if (!result.ok) {
    return { ok: false, errors: {}, formError: result.error };
  }
  return { ok: true };
}

function hashCookie(cookie: string): string {
  return createHash("sha256").update(cookie).digest("hex").slice(0, 32);
}

/**
 * Resolve a per-request rate-limit key. Prefers the client IP, falls back to
 * a hash of the session/cookie header (never the raw cookie value), and
 * returns `null` when neither is available so the caller can fail closed.
 */
async function resolveRateLimitKey(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() ?? headerList.get("x-real-ip")?.trim();
    if (ip) return `ip:${ip}`;
    const cookie = headerList.get("cookie")?.trim();
    if (cookie) return `cookie:${hashCookie(cookie)}`;
  } catch {
    // Outside a request scope (unit tests, build): no per-request key.
  }
  return null;
}
