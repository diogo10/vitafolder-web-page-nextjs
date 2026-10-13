import { z } from "zod";

export const inviteFamilySchema = z.object({
  to: z
    .string()
    .trim()
    .min(1, "Enter the recipient's email address.")
    .email("Enter a valid email address."),
  locale: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.enum(["en", "pt", "es"]).default("en")
  ),
  inviterName: z.string().trim().min(1, "Enter your name.").max(100, "Your name is too long."),
  familyName: z
    .string()
    .trim()
    .min(1, "Enter your family name.")
    .max(100, "The family name is too long."),
  inviteCode: z
    .string()
    .trim()
    .min(3, "Invite code looks too short.")
    .max(64, "Invite code is too long."),
});

export type InviteFamilyInput = z.infer<typeof inviteFamilySchema>;
