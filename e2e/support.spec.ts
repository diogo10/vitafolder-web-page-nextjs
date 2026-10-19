import { expect, test } from "@playwright/test";

// The FAQ list is read from a local PostgREST mock (see
// e2e/fixtures/supabase-mock.mjs), never from a live Supabase project.
test.beforeEach(async ({ page }) => {
  await page.route("**/supabase.co/**", (route) => route.abort());
});

test("support page renders the FAQs from the mocked backend", async ({ page }) => {
  await page.goto("/support");
  await expect(page.getByRole("heading", { name: /support & faq/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^account$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^family circles$/i })).toBeVisible();

  const resetPassword = page.getByRole("button", { name: /how do i reset my password/i });
  const inviteFamily = page.getByRole("button", { name: /how do i invite my family/i });
  await expect(resetPassword).toBeVisible();
  await expect(inviteFamily).toBeVisible();

  // The first FAQ of the first category is expanded by default.
  await expect(resetPassword).toHaveAttribute("aria-expanded", "true");
  await expect(inviteFamily).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#faq-panel-reset-password")).toContainText(
    "Open Settings and choose Reset password."
  );
});

test("support page expands a FAQ when its button is clicked", async ({ page }) => {
  await page.goto("/support");
  const inviteFamily = page.getByRole("button", { name: /how do i invite my family/i });
  await inviteFamily.click();
  await expect(inviteFamily).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq-panel-invite-family")).toContainText(
    "Open the invitation link you received"
  );
});

test("support page renders the requested locale only", async ({ page }) => {
  await page.goto("/support?locale=pt");
  await expect(page.getByRole("button", { name: /como redefinir a minha senha/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /how do i reset my password/i })).toHaveCount(0);
});

test("footer support link navigates to the support page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: /^support$/i })
    .click();
  await expect(page).toHaveURL(/\/support/);
  await expect(page.getByRole("heading", { name: /support & faq/i })).toBeVisible();
});
