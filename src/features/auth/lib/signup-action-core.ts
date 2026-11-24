import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkInviteRateLimitForKey } from "@/features/invite-family/lib/rate-limit-store";
import { verifyTurnstileToken } from "@/features/invite-family/lib/verify-turnstile";
import { env } from "@/lib/env";
import { resolveRateLimitKey } from "@/lib/rate-limit-key";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignupErrorMessage } from "./auth-errors";
import { signupSchema } from "../schemas";

export type SignupActionErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export type SignupActionResult =
  { ok: true; requiresEmailConfirmation: boolean } | { ok: false; errors: SignupActionErrors };

/**
 * `website` is a honeypot field: the form renders it as a hidden input that
 * humans never fill. Bots that fill it get a fake success (so they cannot
 * probe whether the trap worked) and Supabase is never called.
 *
 * `turnstileToken` carries the Cloudflare Turnstile client token. It is
 * verified whenever `TURNSTILE_SECRET_KEY` is configured, reusing the same
 * verifier as the invite-family flow.
 */
const signupRequestSchema = signupSchema.extend({
  website: z.string().max(500).optional().default(""),
  turnstileToken: z.string().max(2000).optional().default(""),
});

export type SignupActionTestOverrides = {
  /**
   * Key for rate limiting. `undefined` (default) resolves the sender IP /
   * cookie and falls back to the email address; pass `null` to simulate a
   * request with no usable key (fail-closed path).
   */
  rateLimitKey?: string | null;
  /**
   * Turnstile secret override for tests. `undefined` (default) reads
   * `env.TURNSTILE_SECRET_KEY`; pass `null` to simulate "not configured".
   */
  turnstileSecret?: string | null;
  /** Turnstile verification override for tests (avoids network). */
  verifyTurnstile?: (token: string) => Promise<boolean>;
};

function getDashboardRedirectUrl(): string {
  return `${env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")}/dashboard`;
}

/**
 * Public signup core (see `signupAction` in `../actions.ts`).
 *
 * Abuse protection reuses the invite-family utilities:
 * - Honeypot: a filled `website` field is silently accepted without creating
 *   an account.
 * - Bot gate: when `TURNSTILE_SECRET_KEY` is configured, a valid Turnstile
 *   token is required before calling Supabase.
 * - Rate limiting: a 5 requests/minute per-sender limiter runs before the
 *   Supabase call. It uses shared Redis when Upstash is configured, otherwise
 *   the in-memory limiter. When no request IP/cookie can be resolved, the
 *   email address is used as the bucket key so signup still cannot be
 *   hammered anonymously.
 * - Validation first: invalid payloads and honeypot hits never consume
 *   rate-limit budget.
 *
 * NOTE: this module intentionally has no `"use server"` directive so its
 * test overrides are never reachable as Server Actions. The public entry
 * point is the single-argument `signupAction`.
 */
export async function executeSignupAction(
  input: unknown,
  overrides: SignupActionTestOverrides = {}
): Promise<SignupActionResult> {
  const result = signupRequestSchema.safeParse(input);
  if (!result.success) {
    const errors: SignupActionErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = issue.message;
      if (field === "password" && !errors.password) errors.password = issue.message;
    }
    if (Object.keys(errors).length === 0) {
      return { ok: false, errors: { form: getSignupErrorMessage({ code: "unexpected_failure" }) } };
    }
    return { ok: false, errors };
  }

  if (result.data.website.trim() !== "") {
    // Fake success so bots cannot tell the honeypot apart from a real signup.
    return { ok: true, requiresEmailConfirmation: true };
  }

  const { website: _website, turnstileToken, ...credentials } = result.data;
  void _website;

  const turnstileSecret =
    overrides.turnstileSecret !== undefined ? overrides.turnstileSecret : env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const verified = overrides.verifyTurnstile
      ? await overrides.verifyTurnstile(turnstileToken)
      : await verifyTurnstileToken(turnstileToken, { secret: turnstileSecret });
    if (!verified) {
      return { ok: false, errors: { form: getSignupErrorMessage({ code: "unexpected_failure" }) } };
    }
  }

  const rateLimitKey =
    overrides.rateLimitKey !== undefined
      ? overrides.rateLimitKey
      : ((await resolveRateLimitKey()) ?? `email:${credentials.email.toLowerCase()}`);
  if (!rateLimitKey || !(await checkInviteRateLimitForKey(rateLimitKey)).ok) {
    return { ok: false, errors: { form: getSignupErrorMessage({ code: "too_many_requests" }) } };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("[auth] missing SUPABASE_ANON_KEY — signup is not configured.");
    return {
      ok: false,
      errors: { form: getSignupErrorMessage({ code: "signup_disabled" }) },
    };
  }

  const { email, password } = credentials;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getDashboardRedirectUrl() },
  });

  if (error) {
    return { ok: false, errors: { form: getSignupErrorMessage(error) } };
  }

  // Supabase returns no session when email confirmation is enabled. The
  // account still exists, but the user must confirm before they can sign in.
  revalidatePath("/", "layout");

  return { ok: true, requiresEmailConfirmation: !data.session };
}
