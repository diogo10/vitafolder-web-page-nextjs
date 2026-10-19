import { expect, test } from "@playwright/test";

// E2E must never hit live Supabase. The join Server Action runs server-side,
// so the browser-side route guard below is a belt-and-braces protection for
// current and future client-side calls. The action itself never reaches the
// Edge Function in E2E: the E2E server env (see playwright.config.ts) has no
// JOIN_FAMILY_SHARED_SECRET, so a join with an invite code short-circuits
// into a generic error.
test.beforeEach(async ({ page }) => {
  await page.route("**/functions/v1/**", (route) => route.abort());
  await page.route("**/supabase.co/**", (route) => route.abort());
});

test("join-family page matches the design", async ({ page }) => {
  await page.goto("/join-family");
  await expect(
    page.getByRole("heading", { name: /your family is.*waiting for you/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /get started/i })).toBeVisible();
  await expect(page.getByLabel(/email address/i)).toBeVisible();
  await expect(page.getByLabel(/invite code/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /join family circle/i })).toBeVisible();
  await expect(page.getByText(/all household data is encrypted/i)).toBeVisible();
});

test("join-family prefills the invite code from the URL", async ({ page }) => {
  await page.goto("/join-family?code=FAMILY-1234");
  await expect(page.getByLabel(/invite code/i)).toHaveValue("FAMILY-1234");

  await page.goto("/join-family?invite=ALIAS-999");
  await expect(page.getByLabel(/invite code/i)).toHaveValue("ALIAS-999");
});

test("join-family prefills code and email from the URL", async ({ page }) => {
  await page.goto("/join-family?code=FAMILY-1234&email=ada%40example.com");
  await expect(page.getByLabel(/invite code/i)).toHaveValue("FAMILY-1234");
  await expect(page.getByLabel(/email address/i)).toHaveValue("ada@example.com");
});

test("join-family validates the email and invite code before joining", async ({ page }) => {
  await page.goto("/join-family");
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/enter your email/i);

  await page.getByLabel(/email address/i).fill("ada@example.com");
  await page.getByLabel(/invite code/i).fill("ab");
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/too short/i);
});

test("join-family confirms a waitlist signup without an invite code", async ({ page }) => {
  await page.goto("/join-family");
  await page.getByLabel(/email address/i).fill("ada@example.com");
  // No invite code = waitlist signup. The Server Action answers without
  // calling any backend, so this path is deterministic in E2E.
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("status")).toContainText(/check your inbox/i);
});

test("join-family reports a generic error when the join service is unavailable", async ({
  page,
}) => {
  await page.goto("/join-family");
  await page.getByLabel(/email address/i).fill("ada@example.com");
  await page.getByLabel(/invite code/i).fill("FAMILY-1234");
  await page.getByRole("button", { name: /join family circle/i }).click();
  // The join service is not configured in E2E, so the Server Action must
  // fail closed with a generic message instead of hanging or leaking
  // configuration detail.
  await expect(page.getByRole("alert").first()).toContainText(/could not join the family circle/i);
});
