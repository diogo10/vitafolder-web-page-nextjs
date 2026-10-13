import { env, getInviteEmailEndpoint } from "@/lib/env";
import type { InviteFamilyInput } from "../schemas";

export type SendInviteEmailInput = InviteFamilyInput;

export type SendInviteEmailResult = { ok: true } | { ok: false; error: string; status?: number };

export type SendInviteEmailOverrides = {
  fetchFn?: typeof fetch;
  endpoint?: string;
  anonKey?: string;
};

/**
 * POST an invite payload to the Supabase `resend-email-v1` Edge Function.
 * The Supabase anon key is sent as both the `Authorization: Bearer` token
 * and the `apikey` header, per the Edge Function contract.
 */
export async function sendInviteEmail(
  input: SendInviteEmailInput,
  overrides: SendInviteEmailOverrides = {}
): Promise<SendInviteEmailResult> {
  const endpoint = overrides.endpoint ?? getInviteEmailEndpoint();
  const anonKey = overrides.anonKey ?? env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    return {
      ok: false,
      error: "Email service is not configured. Set SUPABASE_ANON_KEY.",
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
  const suffix = detail ? ` (${detail.slice(0, 200)})` : "";
  return {
    ok: false,
    status: response.status,
    error: `Email service responded with status ${response.status}.${suffix}`,
  };
}
