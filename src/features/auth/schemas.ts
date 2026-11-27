import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer."),
});

export type SignupInput = z.infer<typeof signupSchema>;
