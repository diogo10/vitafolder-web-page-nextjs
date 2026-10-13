"use server";

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

export async function sendInviteAction(input: unknown): Promise<InviteFamilyActionResult> {
  const parsed = inviteFamilySchema.safeParse(input);
  if (!parsed.success) {
    const errors: InviteFamilyActionErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof InviteFamilyActionErrors | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    return { ok: false, errors };
  }

  const result = await sendInviteEmail(parsed.data);
  if (!result.ok) {
    return { ok: false, errors: {}, formError: result.error };
  }
  return { ok: true };
}
