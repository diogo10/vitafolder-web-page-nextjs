import { z } from "zod";
import { env, getJoinFamilyEndpoint } from "@/lib/env";

export type JoinFamilyRequestInput = {
  email: string;
  familyCode: string;
};

const joinFamilySuccessSchema = z.object({
  success: z.literal(true),
  family_id: z.string().min(1),
});

export type JoinFamilyRequestResult =
  | { ok: true; familyId: string }
  | { ok: false; reason: "invalid-code" | "already-member" | "unreachable" | "generic" };

const JOIN_FETCH_TIMEOUT_MS = 10_000;

export type JoinFamilyRequestOverrides = {
  fetchFn?: typeof fetch;
  endpoint?: string;
  anonKey?: string;
};

/**
 * POST { email, familyCode } to the Supabase `join-family-v1` Edge Function.
 *
 * Auth contract: same as the invite flow — the anon key is sent as both the
 * `Authorization: Bearer` token and the `apikey` header (public client
 * identifier; the Edge Function enforces its own authorization).
 *
 * Response contract: success is `{ success: true, family_id }`. Failure
 * shapes are not versioned, so mapping is status-based: 400/404/422 mean
 * the code was rejected, 409 means the email is already a member, and
 * anything else is generic. Error contract: callers only ever receive the
 * `reason` discriminant — backend status/detail is logged server-side via
 * `console.error` (truncated) and never surfaced to the client.
 */
export async function requestJoinFamily(
  input: JoinFamilyRequestInput,
  overrides: JoinFamilyRequestOverrides = {}
): Promise<JoinFamilyRequestResult> {
  const endpoint = overrides.endpoint ?? getJoinFamilyEndpoint();
  const anonKey = overrides.anonKey ?? env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    console.error("[join-family] missing SUPABASE_ANON_KEY — join service not configured.");
    return { ok: false, reason: "generic" };
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
      body: JSON.stringify({ email: input.email, familyCode: input.familyCode }),
      signal: AbortSignal.timeout(JOIN_FETCH_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      detail = "";
    }
    console.error(
      `[join-family] Edge Function error: status=${response.status} detail=${detail.slice(0, 500)}`
    );
    if (response.status === 400 || response.status === 404 || response.status === 422) {
      return { ok: false, reason: "invalid-code" };
    }
    if (response.status === 409) {
      return { ok: false, reason: "already-member" };
    }
    return { ok: false, reason: "generic" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    console.error("[join-family] Edge Function error: response was not valid JSON.");
    return { ok: false, reason: "generic" };
  }

  const parsed = joinFamilySuccessSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("[join-family] Edge Function error: response failed validation.");
    return { ok: false, reason: "generic" };
  }
  return { ok: true, familyId: parsed.data.family_id };
}
