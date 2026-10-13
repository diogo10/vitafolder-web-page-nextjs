import { expect, test } from "@playwright/test";

// E2E must never hit live Supabase. The invite Server Action runs
// server-side, so in addition to running these specs without
// SUPABASE_ANON_KEY (the action then short-circuits with a generic
// error before any network call), abort any browser-side traffic to the
// Edge Function as a guard for current and future client-side calls.
test.beforeEach(async ({ page }) => {
  await page.route("**/functions/v1/**", (route) => route.abort());
  await page.route("**/supabase.co/**", (route) => route.abort());
});

test("invite-family page renders the send-invite form", async ({ page }) => {
  await page.goto("/invite-family");
  await expect(page.getByRole("heading", { name: /one invite away/i })).toBeVisible();
  await expect(page.getByLabel(/recipient email/i)).toBeVisible();
  await expect(page.getByLabel(/your name/i)).toBeVisible();
  await expect(page.getByLabel(/family name/i)).toBeVisible();
  await expect(page.getByLabel(/invite code/i)).toBeVisible();
  await expect(page.getByLabel(/language/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /send invite/i })).toBeVisible();
});

test("invite-family prefills the invite code from the URL", async ({ page }) => {
  await page.goto("/invite-family?code=ABC-123");
  await expect(page.getByLabel(/invite code/i)).toHaveValue("ABC-123");
});

test("invite-family validates the recipient email before sending", async ({ page }) => {
  await page.goto("/invite-family");
  await expect(page.getByLabel(/recipient email/i)).toBeVisible();
  await page.getByRole("button", { name: /send invite/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/email/i);
});

test("invite-family reports a generic error without calling Supabase", async ({ page }) => {
  await page.goto("/invite-family");
  await page.getByLabel(/recipient email/i).fill("email@example.com");
  await page.getByLabel(/your name/i).fill("John Doe");
  await page.getByLabel(/family name/i).fill("Smith Family");
  await page.getByLabel(/invite code/i).fill("ABC-123");
  await page.getByRole("button", { name: /send invite/i }).click();
  // Without SUPABASE_ANON_KEY the Server Action short-circuits before any
  // fetch to the Edge Function; the page must surface a generic outcome
  // instead of hanging or leaking configuration detail. This spec runs
  // without that key, so no live call can happen.
  await expect(page.getByRole("alert").first()).toContainText(/could not send invite/i);
});
