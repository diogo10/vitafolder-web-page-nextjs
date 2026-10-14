import { expect, test } from "@playwright/test";

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

test("join-family validates email before joining", async ({ page }) => {
  await page.goto("/join-family");
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/enter your email/i);

  await page.getByLabel(/email address/i).fill("ada@example.com");
  await page.getByLabel(/invite code/i).fill("ab");
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("alert").first()).toContainText(/too short/i);

  await page.getByLabel(/invite code/i).fill("FAMILY-1234");
  await page.getByRole("button", { name: /join family circle/i }).click();
  await expect(page.getByRole("status")).toContainText(/check your inbox/i);
});
