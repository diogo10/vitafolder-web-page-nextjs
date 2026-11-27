import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetInviteRateLimits } from "@/features/invite-family/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginAction, logoutAction, signupAction } from "./actions";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const resolveRateLimitKeyMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/lib/rate-limit-key", () => ({
  resolveRateLimitKey: resolveRateLimitKeyMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();

function useFakeClient() {
  createSupabaseServerClientMock.mockResolvedValue({
    auth: { signInWithPassword, signUp, signOut },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
}

beforeEach(() => {
  createSupabaseServerClientMock.mockReset();
  signInWithPassword.mockReset();
  signUp.mockReset();
  signOut.mockReset();
  revalidatePathMock.mockReset();
  redirectMock.mockReset();
  resolveRateLimitKeyMock.mockReset();
  resolveRateLimitKeyMock.mockResolvedValue("ip:test-sender");
  resetInviteRateLimits();
});

describe("loginAction", () => {
  it("signs in with valid credentials and revalidates the layout", async () => {
    useFakeClient();
    signInWithPassword.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const result = await loginAction({ email: "  ada@example.com  ", password: "secret" });

    expect(result).toEqual({ ok: true });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  });

  it("returns field errors without calling Supabase for invalid input", async () => {
    const result = await loginAction({ email: "not-an-email", password: "" });

    expect(result).toEqual({
      ok: false,
      errors: {
        email: "Enter a valid email address.",
        password: "Enter your password.",
      },
    });
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("fails closed when the Supabase anon key is not configured", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createSupabaseServerClientMock.mockResolvedValue(null);

    const result = await loginAction({ email: "ada@example.com", password: "secret" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/temporarily unavailable/i);
    }
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("maps invalid credentials to a form error without leaking the raw provider message", async () => {
    useFakeClient();
    signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        code: "invalid_credentials",
        message: "Invalid login credentials",
        status: 400,
      },
    });

    const result = await loginAction({ email: "ada@example.com", password: "wrong" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/incorrect email or password/i);
      expect(result.errors.form).not.toMatch(/invalid login credentials/i);
    }
  });

  it("asks the user to confirm an unconfirmed email", async () => {
    useFakeClient();
    signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "email_not_confirmed", message: "Email not confirmed" },
    });

    const result = await loginAction({ email: "ada@example.com", password: "secret" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/confirm your email address/i);
    }
  });

  it("returns a generic form error when Supabase fails unexpectedly", async () => {
    useFakeClient();
    signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "unexpected_failure", message: "boom" },
    });

    const result = await loginAction({ email: "ada@example.com", password: "secret" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/couldn't sign you in/i);
    }
  });
});

describe("signupAction", () => {
  it("creates the account and reports an active session", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    const result = await signupAction({ email: "  ada@example.com  ", password: "password123" });

    expect(result).toEqual({ ok: true, requiresEmailConfirmation: false });
    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
      options: { emailRedirectTo: "http://localhost:3000/dashboard" },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  });

  it("asks the user to confirm their email when Supabase returns no session", async () => {
    useFakeClient();
    signUp.mockResolvedValue({ data: { user: { id: "user-1" }, session: null }, error: null });

    const result = await signupAction({ email: "ada@example.com", password: "password123" });

    expect(result).toEqual({ ok: true, requiresEmailConfirmation: true });
  });

  it("returns field errors without calling Supabase for invalid input", async () => {
    const result = await signupAction({ email: "not-an-email", password: "short" });

    expect(result).toEqual({
      ok: false,
      errors: {
        email: "Enter a valid email address.",
        password: "Use at least 8 characters.",
      },
    });
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("fails closed when the Supabase anon key is not configured", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createSupabaseServerClientMock.mockResolvedValue(null);

    const result = await signupAction({ email: "ada@example.com", password: "password123" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/temporarily unavailable/i);
    }
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("fails closed when no sender key can be resolved", async () => {
    resolveRateLimitKeyMock.mockResolvedValue(null);
    useFakeClient();

    const result = await signupAction({ email: "ada@example.com", password: "password123" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toMatch(/too many signup attempts/i);
    expect(signUp).not.toHaveBeenCalled();
  });

  it("maps a duplicate account to a safe form error", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "user_already_exists", message: "User already registered" },
    });

    const result = await signupAction({ email: "ada@example.com", password: "password123" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/already exists/i);
      expect(result.errors.form).not.toMatch(/user already registered/i);
    }
  });

  it("returns a generic form error when Supabase fails unexpectedly", async () => {
    useFakeClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "unexpected_failure", message: "boom" },
    });

    const result = await signupAction({ email: "ada@example.com", password: "password123" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/couldn't create your account/i);
    }
  });
});

describe("logoutAction", () => {
  it("signs out, revalidates, and returns to the login page", async () => {
    useFakeClient();
    signOut.mockResolvedValue({ error: null });

    await logoutAction();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("still returns to the login page when sign-out fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    useFakeClient();
    signOut.mockResolvedValue({ error: { message: "network down" } });

    await logoutAction();

    expect(errorSpy).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
    errorSpy.mockRestore();
  });

  it("still returns to the login page when sign-out throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    useFakeClient();
    signOut.mockRejectedValue(new Error("network down"));

    await logoutAction();

    expect(errorSpy).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
    errorSpy.mockRestore();
  });

  it("returns to the login page when Supabase is not configured", async () => {
    createSupabaseServerClientMock.mockResolvedValue(null);

    await logoutAction();

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
