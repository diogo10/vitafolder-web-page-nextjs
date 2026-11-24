import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginAction } from "./actions";

const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const signInWithPassword = vi.fn();

function useFakeClient() {
  createSupabaseServerClientMock.mockResolvedValue({
    auth: { signInWithPassword },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
}

beforeEach(() => {
  createSupabaseServerClientMock.mockReset();
  signInWithPassword.mockReset();
  revalidatePathMock.mockReset();
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
