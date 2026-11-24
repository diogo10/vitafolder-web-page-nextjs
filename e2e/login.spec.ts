import { expect, test } from "@playwright/test";

// Sign-in happens server-side and the E2E server points SUPABASE_URL at the
// local GoTrue stand-in (see playwright.config.ts + supabase-mock.mjs), so no
// request can reach a live Supabase project.
const VALID_EMAIL = "ada@example.com";
const VALID_PASSWORD = "e2e-valid-password";

test("login page renders the email/password form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel(/email address/i)).toBeVisible();
  await expect(page.getByLabel(/^password$/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  await expect(page.getByText(/all rights reserved/i)).toBeVisible();
});

test("Get Started on the landing page navigates to the login page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /get started/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("login validates empty fields before submitting", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page.getByText(/enter your email address/i)).toBeVisible();
  await expect(page.getByText(/enter your password/i)).toBeVisible();
});

test("login rejects invalid credentials with a safe message", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email address/i).fill(VALID_EMAIL);
  await page.getByLabel(/^password$/i).fill("wrong-password");
  await page.getByRole("button", { name: /^sign in$/i }).click();

  await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("login signs in with valid credentials and returns home", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email address/i).fill(VALID_EMAIL);
  await page.getByLabel(/^password$/i).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /run your home like a pro/i })).toBeVisible();
});
