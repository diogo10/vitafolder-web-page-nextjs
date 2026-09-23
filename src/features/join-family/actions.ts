"use server";

import { joinFamilySchema } from "./schemas";

export type JoinFamilyActionErrors = {
  email?: string;
  inviteCode?: string;
};

export type JoinFamilyActionResult = { ok: true } | { ok: false; errors: JoinFamilyActionErrors };

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

  // TODO: persist the join request / send the invite email here.
  return { ok: true };
}
