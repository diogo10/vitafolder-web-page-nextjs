import { expect, test } from "@playwright/test";

// Signup runs server-side against the local GoTrue stand-in configured in
// playwright.config.ts, so no request can reach a live Supabase project.
const SIGNUP_EMAIL = "new-user@example.com";
const SIGNUP_PASSWORD = "e2e-valid-password";

test("login page links to signup below the invite link", async ({ page }) => {
  await page.goto("/login");

  const invite = page.getByRole("link", { name: /join with an invite/i }).last();
  const signup = page.getByRole("link", { name: /^sign up$/i });

  await expect(invite).toBeVisible();
  await expect(signup).toBeVisible();

  // DOM order is the layout contract: the invite link must precede sign up.
  const linkOrder = await page
    .locator("main")
    .evaluate((main) =>
      Array.from(main.querySelectorAll("a")).map((link) => (link.textContent ?? "").trim())
    );
  const inviteIndex = linkOrder.findIndex((text) => /join with an invite/i.test(text));
  const signupIndex = linkOrder.findIndex((text) => /^sign up$/i.test(text));
  expect(inviteIndex).toBeGreaterThanOrEqual(0);
  expect(signupIndex).toBeGreaterThan(inviteIndex);

  await signup.click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
});

test("signup validates empty fields before submitting", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: /^create account$/i }).click();

  await expect(page.getByText(/enter your email address/i)).toBeVisible();
  await expect(page.getByText(/use at least 8 characters/i)).toBeVisible();
});

test("signup opens the dashboard and logout returns to login", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel(/email address/i).fill(SIGNUP_EMAIL);
  await page.getByLabel(/^password$/i).fill(SIGNUP_PASSWORD);
  await page.getByRole("button", { name: /^create account$/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /^dashboard$/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
  // The dashboard greets the signed-in user, which proves the session cookies
  // from signup reached the server and the mocked `GET /user` was authorized.
  await expect(page.getByText(new RegExp(`welcome, ${SIGNUP_EMAIL}`, "i"))).toBeVisible();

  await page.getByRole("button", { name: /logout/i }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

  // Logout cleared the session, so the dashboard is no longer accessible.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login(\?|$)/);
});

test("dashboard redirects unauthenticated visitors to login and preserves the destination", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

  await page.getByLabel(/email address/i).fill("ada@example.com");
  await page.getByLabel(/^password$/i).fill("e2e-valid-password");
  await page.getByRole("button", { name: /^sign in$/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /^dashboard$/i })).toBeVisible();
});
