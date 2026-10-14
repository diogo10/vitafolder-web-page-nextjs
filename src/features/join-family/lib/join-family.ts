import { z } from "zod";
import { env, getJoinFamilyEndpoint } from "@/lib/env";

export type JoinFamilyRequestInput = {
  email: string;
  familyCode: string;
};

const joinFamilySuccessSchema = z.object({
  success: z.literal(true),
  family_id: z.string().min(1),
  already_member: z.boolean().optional(),
});

const joinFamilyErrorShape = z
  .object({ code: z.string().min(1) })
  .partial()
  .passthrough();

export type JoinFamilyRequestResult =
  | { ok: true; familyId: string; alreadyMember: boolean }
  | {
      ok: false;
      reason:
        | "invalid-code"
        | "unknown-user"
        | "already-member"
        | "misconfigured"
        | "unreachable"
        | "generic";
    };

const JOIN_FETCH_TIMEOUT_MS = 10_000;

export type JoinFamilyRequestOverrides = {
  fetchFn?: typeof fetch;
  endpoint?: string;
  anonKey?: string;
  sharedSecret?: string;
};

function readErrorCode(body: string): string | null {
  try {
    const parsed = joinFamilyErrorShape.safeParse(JSON.parse(body));
    return parsed.success && parsed.data.code ? parsed.data.code : null;
  } catch {
    return null;
  }
}

/**
 * POST { email, familyCode } to the Supabase `join-family-v1` Edge Function
 * in trusted-backend mode.
 *
 * Auth contract: the anon key is sent as `apikey` for the Supabase gateway
 * only (no `Authorization: Bearer` — the function skips JWT checks in this
 * mode). Trust comes from `x-join-secret: JOIN_FAMILY_SHARED_SECRET`, which
 * the function compares timing-safe (SHA-256 + timingSafeEqual). The secret
 * is server-only: this module runs in a Server Action, never the browser.
 *
 * Response contract: 200 `{ success: true, family_id }` (plus optional
 * `already_member`). Failures: 400 invalid_payload/invalid_json, 403
 * not_authorized (wrong secret — ops misconfiguration), 404
 * family_not_found/unknown_user.
 *
 * Error contract: callers only ever receive the `reason` discriminant —
 * backend status/detail is logged server-side via `console.error`
 * (truncated) and never surfaced to the client.
 */
export async function requestJoinFamily(
  input: JoinFamilyRequestInput,
  overrides: JoinFamilyRequestOverrides = {}
): Promise<JoinFamilyRequestResult> {
  const endpoint = overrides.endpoint ?? getJoinFamilyEndpoint();
  const anonKey = overrides.anonKey ?? env.SUPABASE_ANON_KEY;
  const sharedSecret = overrides.sharedSecret ?? env.JOIN_FAMILY_SHARED_SECRET;

  if (!anonKey || !sharedSecret) {
    console.error(
      "[join-family] missing SUPABASE_ANON_KEY or JOIN_FAMILY_SHARED_SECRET — join service not configured."
    );
    return { ok: false, reason: "generic" };
  }

  const fetchFn = overrides.fetchFn ?? fetch;

  let response: Response;
  try {
    response = await fetchFn(endpoint, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "x-join-secret": sharedSecret,
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
    if (response.status === 403) {
      return { ok: false, reason: "misconfigured" };
    }
    if (response.status === 409) {
      return { ok: false, reason: "already-member" };
    }
    if (response.status === 400) {
      return { ok: false, reason: "invalid-code" };
    }
    if (response.status === 404) {
      const code = readErrorCode(detail);
      if (code === "unknown_user") {
        return { ok: false, reason: "unknown-user" };
      }
      return { ok: false, reason: "invalid-code" };
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
  return {
    ok: true,
    familyId: parsed.data.family_id,
    alreadyMember: parsed.data.already_member ?? false,
  };
}
