import { expect, test } from "@playwright/test";

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
  await page.getByRole("button", { name: /send invite/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/email/i);
});

test("invite-family submits and reports an outcome", async ({ page }) => {
  await page.goto("/invite-family");
  await page.getByLabel(/recipient email/i).fill("email@example.com");
  await page.getByLabel(/your name/i).fill("John Doe");
  await page.getByLabel(/family name/i).fill("Smith Family");
  await page.getByLabel(/invite code/i).fill("ABC-123");
  await page.getByRole("button", { name: /send invite/i }).click();
  // Without SUPABASE_ANON_KEY the action reports a configuration error;
  // with a key it sends via the Edge Function. Either way the page must
  // surface an outcome instead of hanging.
  const outcome = page.getByRole("status").or(page.getByRole("alert"));
  await expect(outcome.first()).toBeVisible();
});
