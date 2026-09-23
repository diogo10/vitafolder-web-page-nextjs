import { z } from "zod";

export const joinFamilySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  inviteCode: z
    .string()
    .trim()
    .max(64, "Invite code is too long.")
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || value.length >= 3, {
      message: "Invite code looks too short.",
    }),
});

export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
