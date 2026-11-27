import { defineConfig, devices } from "@playwright/test";

// E2E must never depend on a live third-party API. The Server Actions read
// the credentials below, and `next start` also loads `.env.local`, so the E2E
// server is started with an explicit, credential-free environment instead of
// whatever happens to be exported in the shell.
//
// `src/lib/env.ts` treats empty strings as "unset", which makes the
// invite/join actions fail closed with a generic error rather than calling
// Supabase, Turnstile, or Upstash. `SUPABASE_URL` points at the local mock in
// `e2e/fixtures/supabase-mock.mjs`, so the FAQ read, password grant, signup,
// session lookup, and logout all stay on this machine.
const E2E_PORT = 3100;
const E2E_MOCK_PORT = 3101;

const E2E_SERVER_ENV = {
  PORT: String(E2E_PORT),
  SUPABASE_URL: `http://127.0.0.1:${E2E_MOCK_PORT}`,
  // A placeholder anon key: it only unlocks the read-only FAQ request above.
  // The invite and join actions stay disabled by the empty secrets below.
  SUPABASE_ANON_KEY: "e2e-anon-key",
  SUPABASE_INVITE_FUNCTION_NAME: "resend-email-v1",
  SUPABASE_JOIN_FUNCTION_NAME: "join-family-v1",
  JOIN_FAMILY_SHARED_SECRET: "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  TURNSTILE_SECRET_KEY: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    // A dedicated port so the E2E run never reuses a dev server on :3000
    // (which would carry the developer's real credentials).
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/fixtures/supabase-mock.mjs",
      url: `http://127.0.0.1:${E2E_MOCK_PORT}/rest/v1/faqs`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: { MOCK_PORT: String(E2E_MOCK_PORT) },
    },
    {
      command: "npm run start",
      url: `http://127.0.0.1:${E2E_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: E2E_SERVER_ENV,
    },
  ],
});
