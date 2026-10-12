import { expect, test } from "@playwright/test";

test("privacy page loads with policy content", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /information we collect/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /sharing and disclosure/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /contact us/i })).toBeVisible();
});

test("footer privacy link navigates to the privacy page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: /^privacy$/i })
    .click();
  await expect(page).toHaveURL(/\/privacy/);
  await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
});
