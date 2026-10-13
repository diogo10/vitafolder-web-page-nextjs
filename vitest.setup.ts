import "@testing-library/jest-dom/vitest";

// Test-only placeholder so importing `@/lib/env` (where SUPABASE_URL is
// required) does not fail fast under Vitest. Production/dev must provide a
// real SUPABASE_URL; unit tests that touch the network inject explicit
// `endpoint`/`anonKey` overrides instead of relying on this value.
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = "https://example.supabase.co";
}
