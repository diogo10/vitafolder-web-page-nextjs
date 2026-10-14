import { afterEach, describe, expect, it, vi } from "vitest";
import { requestJoinFamily } from "./join-family";

const input = { email: "ada@example.com", familyCode: "FAMILY-1234" };
const baseEndpoint = "https://example.supabase.co/functions/v1/join-family-v1";
const anonKey = "test-anon-key";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requestJoinFamily", () => {
  it("POSTs email and familyCode with Supabase auth headers", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ success: true, family_id: "family-1" }));
    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: baseEndpoint,
      anonKey,
    });

    expect(result).toEqual({ ok: true, familyId: "family-1" });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(baseEndpoint);
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(`Bearer ${anonKey}`);
    expect(headers["apikey"]).toBe(anonKey);
    expect(JSON.parse(init.body as string)).toEqual({
      email: "ada@example.com",
      familyCode: "FAMILY-1234",
    });
  });

  it("maps 404 to invalid-code and logs the status", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => new Response("no such code", { status: 404 }));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: baseEndpoint,
      anonKey,
    });

    expect(result).toEqual({ ok: false, reason: "invalid-code" });
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("404");
  });

  it("maps 409 to already-member", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => new Response("duplicate", { status: 409 }));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: baseEndpoint,
      anonKey,
    });

    expect(result).toEqual({ ok: false, reason: "already-member" });
  });

  it("maps unexpected statuses and invalid bodies to generic", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const serverError = vi.fn(async () => new Response("boom", { status: 500 }));
    expect(
      await requestJoinFamily(input, {
        fetchFn: serverError as unknown as typeof fetch,
        endpoint: baseEndpoint,
        anonKey,
      })
    ).toEqual({ ok: false, reason: "generic" });

    const badBody = vi.fn(async () => jsonResponse({ success: false }));
    expect(
      await requestJoinFamily(input, {
        fetchFn: badBody as unknown as typeof fetch,
        endpoint: baseEndpoint,
        anonKey,
      })
    ).toEqual({ ok: false, reason: "generic" });
  });

  it("returns unreachable when the network request fails", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: baseEndpoint,
      anonKey,
    });

    expect(result).toEqual({ ok: false, reason: "unreachable" });
  });

  it("returns generic without calling fetch when the anon key is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse({ success: true, family_id: "f" }));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: baseEndpoint,
      anonKey: "",
    });

    expect(result).toEqual({ ok: false, reason: "generic" });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
