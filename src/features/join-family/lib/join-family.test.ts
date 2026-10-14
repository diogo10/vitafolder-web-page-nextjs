import { afterEach, describe, expect, it, vi } from "vitest";
import { requestJoinFamily } from "./join-family";

const input = { email: "ada@example.com", familyCode: "FAMILY-1234" };
const baseEndpoint = "https://example.supabase.co/functions/v1/join-family-v1";
const anonKey = "test-anon-key";
const sharedSecret = "test-join-secret";

const overrides = {
  endpoint: baseEndpoint,
  anonKey,
  sharedSecret,
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requestJoinFamily", () => {
  it("POSTs email and familyCode with gateway apikey plus join secret", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ success: true, family_id: "family-1" }));
    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: true, familyId: "family-1", alreadyMember: false });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(baseEndpoint);
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["apikey"]).toBe(anonKey);
    expect(headers["x-join-secret"]).toBe(sharedSecret);
    expect(headers["Authorization"]).toBeUndefined();
    expect(JSON.parse(init.body as string)).toEqual({
      email: "ada@example.com",
      familyCode: "FAMILY-1234",
    });
  });

  it("surfaces already_member from a 200 response", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ success: true, family_id: "f", already_member: true })
    );
    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: true, familyId: "f", alreadyMember: true });
  });

  it("maps 400 to invalid-code", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse({ code: "invalid_payload" }, 400));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: false, reason: "invalid-code" });
  });

  it("maps 403 to misconfigured", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse({ code: "not_authorized" }, 403));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: false, reason: "misconfigured" });
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("403");
  });

  it("maps 404 family_not_found to invalid-code and unknown_user to unknown-user", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const notFound = vi.fn(async () => jsonResponse({ code: "family_not_found" }, 404));
    expect(
      await requestJoinFamily(input, {
        fetchFn: notFound as unknown as typeof fetch,
        ...overrides,
      })
    ).toEqual({ ok: false, reason: "invalid-code" });

    const unknownUser = vi.fn(async () => jsonResponse({ code: "unknown_user" }, 404));
    expect(
      await requestJoinFamily(input, {
        fetchFn: unknownUser as unknown as typeof fetch,
        ...overrides,
      })
    ).toEqual({ ok: false, reason: "unknown-user" });
  });

  it("maps 409 to already-member", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => new Response("duplicate", { status: 409 }));

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: false, reason: "already-member" });
  });

  it("maps unexpected statuses and invalid bodies to generic", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const serverError = vi.fn(async () => new Response("boom", { status: 500 }));
    expect(
      await requestJoinFamily(input, {
        fetchFn: serverError as unknown as typeof fetch,
        ...overrides,
      })
    ).toEqual({ ok: false, reason: "generic" });

    const badBody = vi.fn(async () => jsonResponse({ success: false }));
    expect(
      await requestJoinFamily(input, {
        fetchFn: badBody as unknown as typeof fetch,
        ...overrides,
      })
    ).toEqual({ ok: false, reason: "generic" });
  });

  it("returns unreachable when the network request fails", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await requestJoinFamily(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      ...overrides,
    });

    expect(result).toEqual({ ok: false, reason: "unreachable" });
  });

  it("returns generic without calling fetch when credentials are missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse({ success: true, family_id: "f" }));

    expect(
      await requestJoinFamily(input, {
        fetchFn: fetchFn as unknown as typeof fetch,
        endpoint: baseEndpoint,
        anonKey: "",
        sharedSecret,
      })
    ).toEqual({ ok: false, reason: "generic" });

    expect(
      await requestJoinFamily(input, {
        fetchFn: fetchFn as unknown as typeof fetch,
        endpoint: baseEndpoint,
        anonKey,
        sharedSecret: "",
      })
    ).toEqual({ ok: false, reason: "generic" });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });
});
