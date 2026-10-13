import { env, getInviteEmailEndpoint } from "@/lib/env";
import type { InviteFamilyInput } from "../schemas";

export type SendInviteEmailInput = InviteFamilyInput;

export type SendInviteEmailResult = { ok: true } | { ok: false; error: string; status?: number };

const INVITE_FETCH_TIMEOUT_MS = 10_000;

export type SendInviteEmailOverrides = {
  fetchFn?: typeof fetch;
  endpoint?: string;
  anonKey?: string;
};

/**
 * POST an invite payload to the Supabase `resend-email-v1` Edge Function.
 *
 * Authorization contract: the Supabase anon key is sent as both the
 * `Authorization: Bearer` token and the `apikey` header, per the Edge
 * Function contract. The anon key is a public client identifier, NOT a
 * secrecy boundary — the Edge Function itself MUST verify the caller's
 * Supabase JWT (service-role check / allowlisted sender) and enforce its own
 * rate limits, otherwise anyone who learns the endpoint can send email
 * through it. See README "Invite email authorization & abuse protection".
 *
 * Error contract: callers only ever receive the generic
 * `Could not send invite. Try again.` message. Backend status/detail is
 * logged server-side via `console.error` (truncated) and never surfaced to
 * the client.
 */
export async function sendInviteEmail(
  input: SendInviteEmailInput,
  overrides: SendInviteEmailOverrides = {}
): Promise<SendInviteEmailResult> {
  const endpoint = overrides.endpoint ?? getInviteEmailEndpoint();
  const anonKey = overrides.anonKey ?? env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    console.error("[invite-family] missing SUPABASE_ANON_KEY — email service not configured.");
    return {
      ok: false,
      error: "Could not send invite. Try again.",
    };
  }

  const fetchFn = overrides.fetchFn ?? fetch;

  let response: Response;
  try {
    response = await fetchFn(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(INVITE_FETCH_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      error: "Could not reach the email service. Try again.",
    };
  }

  if (response.ok) {
    return { ok: true };
  }

  let detail = "";
  try {
    detail = await response.text();
  } catch {
    detail = "";
  }
  console.error(
    `[invite-family] Edge Function error: status=${response.status} detail=${detail.slice(0, 500)}`
  );
  return {
    ok: false,
    status: response.status,
    error: "Could not send invite. Try again.",
  };
}
