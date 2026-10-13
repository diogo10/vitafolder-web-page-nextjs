import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_PRIVACY_EMAIL: z.string().email().default("privacy@housemira.com"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_URL: z.string().url().default("https://jheqalwrnztavzxjsdcj.supabase.co"),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_INVITE_FUNCTION_NAME: z.string().min(1).default("resend-email-v1"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PRIVACY_EMAIL: process.env.NEXT_PUBLIC_PRIVACY_EMAIL,
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_INVITE_FUNCTION_NAME: process.env.SUPABASE_INVITE_FUNCTION_NAME,
});

export function getInviteEmailEndpoint(): string {
  const baseUrl = env.SUPABASE_URL.replace(/\/$/, "");
  return `${baseUrl}/functions/v1/${env.SUPABASE_INVITE_FUNCTION_NAME}`;
}
