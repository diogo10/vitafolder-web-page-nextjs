"use server";

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

export type SendInviteActionOverrides = {
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
 * - Rate limiting: sliding-window limiter keyed by sender IP (in-memory;
 *   production multi-instance deployments should use Upstash Redis via
 *   `@upstash/ratelimit` instead — see `lib/rate-limit.ts`).
 * - Authorization boundary: this app has no session/auth yet, so per-sender
 *   authorization MUST be enforced by the Supabase `resend-email-v1` Edge
 *   Function (verify the caller's Supabase JWT / allowlisted sender; never
 *   rely on the anon key alone). Once app-level auth lands, require a valid
 *   session at the top of this action and fail closed (return a generic
 *   formError) when there is none.
 */
export async function sendInviteAction(
  input: unknown,
  overrides: SendInviteActionOverrides = {}
): Promise<InviteFamilyActionResult> {
  const rawWebsite =
    typeof input === "object" && input !== null
      ? (input as { website?: unknown }).website
      : undefined;
  if (typeof rawWebsite === "string" && rawWebsite.trim() !== "") {
    return { ok: true };
  }

  const rateLimitKey = overrides.rateLimitKey ?? (await resolveRateLimitKey());
  if (!checkInviteRateLimit(rateLimitKey).ok) {
    return { ok: false, errors: {}, formError: "Too many requests. Try again later." };
  }

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

  const { website: _honeypot, ...payload } = parsed.data;
  void _honeypot;

  const result = await sendInviteEmail(payload);
  if (!result.ok) {
    return { ok: false, errors: {}, formError: result.error };
  }
  return { ok: true };
}

async function resolveRateLimitKey(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim();
    if (ip) return `ip:${ip}`;
  } catch {
    // Outside a request scope (unit tests, build): fall back to a shared key.
  }
  return "global";
}
