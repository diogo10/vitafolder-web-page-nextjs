"use server";

import { executeSendInviteAction, type InviteFamilyActionResult } from "./lib/invite-action-core";

export type { InviteFamilyActionErrors, InviteFamilyActionResult } from "./lib/invite-action-core";

/**
 * Public invite Server Action (single-arg).
 *
 * This is the ONLY export callable as a Server Action from this module —
 * test override injection (`rateLimitKey`, Turnstile stubs) lives in the
 * non-`"use server"` core (`lib/invite-action-core.ts`) so clients cannot
 * pass overrides and evade rate limiting or bot checks. See README "Invite
 * email authorization & abuse protection".
 */
export async function sendInviteAction(input: unknown): Promise<InviteFamilyActionResult> {
  return executeSendInviteAction(input);
}
