import { z } from "zod";

// Treat empty strings as unset so `VAR=""` behaves like a missing var
// instead of failing string/url validation with a confusing message.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000")
  ),
  NEXT_PUBLIC_PRIVACY_EMAIL: z.preprocess(
    emptyToUndefined,
    z.string().email().default("privacy@housemira.com")
  ),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Required on purpose: no production default. Dev/test without this var
  // fail fast here with a clear message instead of silently targeting prod.
  SUPABASE_URL: z.preprocess(
    emptyToUndefined,
    z
      .string({
        required_error:
          "SUPABASE_URL is required. Copy .env.example to .env.local and set it to your Supabase project URL.",
        invalid_type_error:
          "SUPABASE_URL is required. Copy .env.example to .env.local and set it to your Supabase project URL.",
      })
      .url("SUPABASE_URL must be a valid URL, e.g. https://your-project.supabase.co.")
  ),
  SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SUPABASE_INVITE_FUNCTION_NAME: z.preprocess(
    emptyToUndefined,
    z.string().min(1).default("resend-email-v1")
  ),
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
