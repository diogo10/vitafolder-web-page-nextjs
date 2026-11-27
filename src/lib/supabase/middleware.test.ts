import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { updateSupabaseSession } from "./middleware";

const nextMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const createServerClientMock = vi.hoisted(() => vi.fn());
const getUserMock = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextMock,
    redirect: redirectMock,
  },
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: createServerClientMock }));

const envRecord = env as { SUPABASE_ANON_KEY?: string };
const originalAnonKey = env.SUPABASE_ANON_KEY;

type FakeRequest = {
  nextUrl: {
    pathname: string;
    search: string;
    clone: () => URL;
  };
  cookies: {
    getAll: () => { name: string; value: string }[];
    set: ReturnType<typeof vi.fn>;
  };
};

function createRequest(path = "/dashboard"): FakeRequest & NextRequest {
  const url = new URL(`http://localhost${path}`);
  return {
    nextUrl: {
      pathname: url.pathname,
      search: url.search,
      clone: () => new URL(url.toString()),
    },
    cookies: { getAll: () => [], set: vi.fn() },
  } as unknown as FakeRequest & NextRequest;
}

const responseSetMock = vi.fn();

beforeEach(() => {
  envRecord.SUPABASE_ANON_KEY = "test-anon-key";
  nextMock.mockReset();
  redirectMock.mockReset();
  createServerClientMock.mockReset();
  getUserMock.mockReset();
  responseSetMock.mockReset();

  nextMock.mockImplementation(() => ({ cookies: { set: responseSetMock } }));
  redirectMock.mockImplementation((url: URL) => ({ redirectUrl: url.toString() }));
  createServerClientMock.mockReturnValue({ auth: { getUser: getUserMock } });
});

afterEach(() => {
  envRecord.SUPABASE_ANON_KEY = originalAnonKey;
});

describe("middleware session refresh", () => {
  it("refreshes the session and forwards refreshed cookies", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const request = createRequest();

    await updateSupabaseSession(request);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();

    const [, , options] = createServerClientMock.mock.calls[0] ?? [];
    options.cookies.setAll([{ name: "sb-auth", value: "next", options: { path: "/" } }]);

    expect(request.cookies.set).toHaveBeenCalledWith("sb-auth", "next");
    expect(responseSetMock).toHaveBeenCalledWith("sb-auth", "next", { path: "/" });
  });

  it("redirects unauthenticated visitors to login with the intended destination", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });
    const request = createRequest("/dashboard?tab=calendar");

    const response = await updateSupabaseSession(request);

    expect(errorSpy).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledTimes(1);
    const url = redirectMock.mock.calls[0]?.[0] as URL;
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("/dashboard?tab=calendar");
    expect(response).toEqual({ redirectUrl: url.toString() });
    errorSpy.mockRestore();
  });

  it("fails closed when the anon key is missing", async () => {
    envRecord.SUPABASE_ANON_KEY = undefined;
    const request = createRequest();

    await updateSupabaseSession(request);

    expect(createServerClientMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledTimes(1);
  });

  it("redirects when the refresh call throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getUserMock.mockRejectedValue(new Error("network down"));
    const request = createRequest();

    await updateSupabaseSession(request);

    expect(errorSpy).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});
