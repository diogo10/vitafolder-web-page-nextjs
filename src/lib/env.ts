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
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  TURNSTILE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(
    emptyToUndefined,
    z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL.").optional()
  ),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SUPABASE_INVITE_FUNCTION_NAME: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
        "SUPABASE_INVITE_FUNCTION_NAME must be a valid Edge Function name (letters, numbers, dashes, underscores)."
      )
      .default("resend-email-v1")
  ),
  SUPABASE_JOIN_FUNCTION_NAME: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
        "SUPABASE_JOIN_FUNCTION_NAME must be a valid Edge Function name (letters, numbers, dashes, underscores)."
      )
      .default("join-family-v1")
  ),
  // Shared secret for the join-family-v1 trusted-backend mode. Server-only
  // (never NEXT_PUBLIC_): sent as `x-join-secret`. Optional at startup so
  // local-fallback flows still boot; the join call fails closed without it.
  JOIN_FAMILY_SHARED_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PRIVACY_EMAIL: process.env.NEXT_PUBLIC_PRIVACY_EMAIL,
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  SUPABASE_INVITE_FUNCTION_NAME: process.env.SUPABASE_INVITE_FUNCTION_NAME,
  SUPABASE_JOIN_FUNCTION_NAME: process.env.SUPABASE_JOIN_FUNCTION_NAME,
  JOIN_FAMILY_SHARED_SECRET: process.env.JOIN_FAMILY_SHARED_SECRET,
});

export function getInviteEmailEndpoint(
  baseUrl: string = env.SUPABASE_URL,
  functionName: string = env.SUPABASE_INVITE_FUNCTION_NAME
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  return `${normalizedBaseUrl}/functions/v1/${functionName}`;
}

export function getJoinFamilyEndpoint(
  baseUrl: string = env.SUPABASE_URL,
  functionName: string = env.SUPABASE_JOIN_FUNCTION_NAME
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  return `${normalizedBaseUrl}/functions/v1/${functionName}`;
}
