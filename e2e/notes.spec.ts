import { expect, test } from "@playwright/test";

test("notes page shows the shared notes card", async ({ page }) => {
  await page.goto("/notes?circle=e2e-circle&locale=en");
  await expect(page.getByRole("heading", { name: /shared notes/i })).toBeVisible();
  await expect(page.getByLabel(/title/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /share note/i })).toBeVisible();
});

test("notes page supports Spanish locale", async ({ page }) => {
  await page.goto("/notes?circle=e2e-circle&locale=es");
  await expect(page.getByRole("heading", { name: /notas compartidas/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /compartir nota/i })).toBeVisible();
});
