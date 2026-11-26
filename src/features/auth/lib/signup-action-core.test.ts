import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetInviteRateLimits } from "@/features/invite-family/lib/rate-limit";
import { checkInviteRateLimitForKey } from "@/features/invite-family/lib/rate-limit-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeSignupAction } from "./signup-action-core";

const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const signUp = vi.fn();

function useFakeClient() {
  createSupabaseServerClientMock.mockResolvedValue({
    auth: { signUp },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
}

const validInput = { email: "ada@example.com", password: "password123" };

beforeEach(() => {
  createSupabaseServerClientMock.mockReset();
  signUp.mockReset();
  revalidatePathMock.mockReset();
  resetInviteRateLimits();
});

describe("executeSignupAction abuse protection", () => {
  it("rejects oversized credentials before calling Supabase", async () => {
    const longEmail = await executeSignupAction({
      email: `${"a".repeat(243)}@example.com`,
      password: "password123",
    });
    expect(longEmail.ok).toBe(false);
    if (!longEmail.ok) expect(longEmail.errors.email).toMatch(/254 characters or fewer/i);

    const longPassword = await executeSignupAction({
      email: "ada@example.com",
      password: "a".repeat(73),
    });
    expect(longPassword.ok).toBe(false);
    if (!longPassword.ok) expect(longPassword.errors.password).toMatch(/72 characters or fewer/i);

    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without calling Supabase", async () => {
    const result = await executeSignupAction({
      ...validInput,
      website: "http://spam.example",
    });

    expect(result).toEqual({ ok: true, requiresEmailConfirmation: true });
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("rate-limits repeated signups from the same sender", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    for (let i = 0; i < 5; i += 1) {
      const result = await executeSignupAction(validInput, {
        rateLimitKey: "signup-rate-limit",
      });
      expect(result).toEqual({ ok: true, requiresEmailConfirmation: false });
    }

    const limited = await executeSignupAction(validInput, {
      rateLimitKey: "signup-rate-limit",
    });
    expect(limited.ok).toBe(false);
    if (!limited.ok) expect(limited.errors.form).toMatch(/too many signup attempts/i);
    expect(signUp).toHaveBeenCalledTimes(5);
  });

  it("fails closed when no rate-limit key can be resolved", async () => {
    const verifyTurnstile = vi.fn(async () => true);
    const result = await executeSignupAction(validInput, {
      rateLimitKey: null,
      turnstileSecret: "test-secret",
      verifyTurnstile,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toMatch(/too many signup attempts/i);
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("checks the rate limit before Turnstile verification", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    // Exhaust the signup-namespaced bucket for this sender.
    for (let i = 0; i < 5; i += 1) {
      await checkInviteRateLimitForKey("signup-order-key", { prefix: "signup" });
    }

    const verifyTurnstile = vi.fn(async () => true);
    const result = await executeSignupAction(validInput, {
      rateLimitKey: "signup-order-key",
      turnstileSecret: "test-secret",
      verifyTurnstile,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toMatch(/too many signup attempts/i);
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("requires a valid Turnstile token when a secret is configured", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    const missing = await executeSignupAction(validInput, {
      rateLimitKey: "signup-turnstile-missing",
      turnstileSecret: "test-secret",
      verifyTurnstile: async (token) => token === "valid-token",
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.errors.form).toMatch(/couldn't create your account/i);
    expect(signUp).not.toHaveBeenCalled();

    const accepted = await executeSignupAction(
      { ...validInput, turnstileToken: "valid-token" },
      {
        rateLimitKey: "signup-turnstile-accepted",
        turnstileSecret: "test-secret",
        verifyTurnstile: async (token) => token === "valid-token",
      }
    );
    expect(accepted).toEqual({ ok: true, requiresEmailConfirmation: false });
    expect(signUp).toHaveBeenCalledTimes(1);
  });

  it("does not rate-limit invalid or honeypot submissions", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    for (let i = 0; i < 6; i += 1) {
      await executeSignupAction({ ...validInput, email: "not-an-email" });
      await executeSignupAction({ ...validInput, website: "http://spam.example" });
    }

    const result = await executeSignupAction(validInput, { rateLimitKey: "signup-valid-after" });
    expect(result).toEqual({ ok: true, requiresEmailConfirmation: false });
  });
});
