import { expect, test } from "@playwright/test";

test("terms page loads with terms content", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: /terms and conditions/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /agreement to these terms/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /acceptable use/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /contact us/i })).toBeVisible();
});

test("footer terms link navigates to the terms page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: /^terms$/i })
    .click();
  await expect(page).toHaveURL(/\/terms/);
  await expect(page.getByRole("heading", { name: /terms and conditions/i })).toBeVisible();
});
