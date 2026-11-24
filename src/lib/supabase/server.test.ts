import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "./server";

const cookiesMock = vi.hoisted(() => vi.fn());
const createServerClientMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@supabase/ssr", () => ({ createServerClient: createServerClientMock }));

const envRecord = env as { SUPABASE_ANON_KEY?: string };
const originalAnonKey = env.SUPABASE_ANON_KEY;

beforeEach(() => {
  envRecord.SUPABASE_ANON_KEY = "test-anon-key";
  cookiesMock.mockReset();
  createServerClientMock.mockReset();
});

afterEach(() => {
  envRecord.SUPABASE_ANON_KEY = originalAnonKey;
});

describe("createSupabaseServerClient", () => {
  it("returns null when SUPABASE_ANON_KEY is not configured", async () => {
    envRecord.SUPABASE_ANON_KEY = undefined;

    await expect(createSupabaseServerClient()).resolves.toBeNull();
    expect(cookiesMock).not.toHaveBeenCalled();
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("creates a client with the request cookies", async () => {
    const client = { auth: {} };
    const getAll = vi.fn(() => [{ name: "sb-auth", value: "token" }]);
    const set = vi.fn();
    cookiesMock.mockResolvedValue({ getAll, set });
    createServerClientMock.mockReturnValue(client);

    await expect(createSupabaseServerClient()).resolves.toBe(client);

    expect(createServerClientMock).toHaveBeenCalledTimes(1);
    const [url, key, options] = createServerClientMock.mock.calls[0] ?? [];
    expect(url).toBe(env.SUPABASE_URL);
    expect(key).toBe("test-anon-key");
    expect(options.cookies.getAll()).toEqual([{ name: "sb-auth", value: "token" }]);

    options.cookies.setAll([{ name: "sb-auth", value: "next", options: { path: "/" } }]);
    expect(set).toHaveBeenCalledWith("sb-auth", "next", { path: "/" });
  });

  it("ignores cookie writes in read-only render contexts", async () => {
    const set = vi.fn(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler");
    });
    cookiesMock.mockResolvedValue({ getAll: () => [], set });
    createServerClientMock.mockReturnValue({ auth: {} });

    await createSupabaseServerClient();
    const [, , options] = createServerClientMock.mock.calls[0] ?? [];

    expect(() =>
      options.cookies.setAll([{ name: "sb-auth", value: "next", options: {} }])
    ).not.toThrow();
    expect(set).toHaveBeenCalled();
  });
});
