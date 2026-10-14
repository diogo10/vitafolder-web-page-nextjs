"use server";

import { requestJoinFamily } from "./lib/join-family";
import { joinFamilySchema } from "./schemas";

export type JoinFamilyActionErrors = {
  email?: string;
  inviteCode?: string;
  form?: string;
};

export type JoinFamilyActionResult =
  | { ok: true; familyId?: string; alreadyMember?: boolean }
  | { ok: false; errors: JoinFamilyActionErrors };

export async function joinFamilyAction(input: unknown): Promise<JoinFamilyActionResult> {
  const result = joinFamilySchema.safeParse(input);
  if (!result.success) {
    const errors: JoinFamilyActionErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = issue.message;
      if (field === "inviteCode" && !errors.inviteCode) errors.inviteCode = issue.message;
    }
    return { ok: false, errors };
  }

  const { email, inviteCode } = result.data;

  // No code: waitlist signup, nothing to verify server-side.
  if (!inviteCode) {
    return { ok: true };
  }

  const join = await requestJoinFamily({ email, familyCode: inviteCode });
  if (join.ok) {
    return join.alreadyMember
      ? { ok: true, familyId: join.familyId, alreadyMember: true }
      : { ok: true, familyId: join.familyId };
  }
  switch (join.reason) {
    case "invalid-code":
      return {
        ok: false,
        errors: { inviteCode: "This invite code doesn't look right. Check it and try again." },
      };
    case "unknown-user":
      return {
        ok: false,
        errors: { email: "We couldn't find an account with this email address." },
      };
    case "already-member":
      return { ok: true, alreadyMember: true };
    case "misconfigured":
      console.error(
        "[join-family] join-family-v1 rejected the shared secret — check JOIN_FAMILY_SHARED_SECRET."
      );
      return {
        ok: false,
        errors: { form: "Could not join the family circle. Try again." },
      };
    case "unreachable":
      return {
        ok: false,
        errors: { form: "Could not reach the join service. Try again." },
      };
    default:
      return {
        ok: false,
        errors: { form: "Could not join the family circle. Try again." },
      };
  }
}
