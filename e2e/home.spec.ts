import { expect, test } from "@playwright/test";

test("homepage matches the HouseMira design", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /run your home like a pro/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^features$/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /start for free/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /everything your family needs/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /three taps to a calmer home/i })).toBeVisible();
  await expect(page.getByText(/© 2026 housemira/i)).toBeVisible();
});

test("watch demo call to action is not present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /watch demo/i })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile menu toggles navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("navigation", { name: /mobile/i })).toBeVisible();
  await page.getByRole("button", { name: /close menu/i }).click();
  await expect(page.getByRole("navigation", { name: /mobile/i })).not.toBeVisible();
});
