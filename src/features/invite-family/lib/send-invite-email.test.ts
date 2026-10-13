import { afterEach, describe, expect, it, vi } from "vitest";
import { sendInviteEmail } from "./send-invite-email";

const input = {
  to: "email@example.com",
  locale: "en",
  inviterName: "John Doe",
  familyName: "Smith Family",
  inviteCode: "ABC-123",
};

function okResponse(): Response {
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sendInviteEmail", () => {
  it("POSTs the invite payload with Supabase auth headers", async () => {
    const fetchFn = vi.fn(async () => okResponse());
    const result = await sendInviteEmail(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: "https://example.supabase.co/functions/v1/resend-email-v1",
      anonKey: "test-anon-key",
    });

    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/functions/v1/resend-email-v1");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-anon-key");
    expect(headers["apikey"]).toBe("test-anon-key");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(input);
  });

  it("returns a generic error and logs the status plus truncated detail", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => new Response("invalid payload", { status: 400 }));
    const result = await sendInviteEmail(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: "https://example.supabase.co/functions/v1/resend-email-v1",
      anonKey: "test-anon-key",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("Could not send invite. Try again.");
      expect(result.error).not.toContain("invalid payload");
    }
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = String(errorSpy.mock.calls[0]?.[0]);
    expect(logged).toContain("400");
    expect(logged).toContain("invalid payload");
  });

  it("truncates long backend detail in the server log", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longDetail = "x".repeat(1000);
    const fetchFn = vi.fn(async () => new Response(longDetail, { status: 500 }));
    const result = await sendInviteEmail(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: "https://example.supabase.co/functions/v1/resend-email-v1",
      anonKey: "test-anon-key",
    });

    expect(result).toEqual({
      ok: false,
      status: 500,
      error: "Could not send invite. Try again.",
    });
    const logged = String(errorSpy.mock.calls[0]?.[0]);
    expect(logged).not.toContain(longDetail);
    expect(logged).toContain("x".repeat(100));
  });

  it("returns an error when the network request fails", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("network down");
    });
    const result = await sendInviteEmail(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: "https://example.supabase.co/functions/v1/resend-email-v1",
      anonKey: "test-anon-key",
    });

    expect(result).toEqual({
      ok: false,
      error: "Could not reach the email service. Try again.",
    });
  });

  it("returns a configuration error when the anon key is missing", async () => {
    const fetchFn = vi.fn(async () => okResponse());
    const result = await sendInviteEmail(input, {
      fetchFn: fetchFn as unknown as typeof fetch,
      endpoint: "https://example.supabase.co/functions/v1/resend-email-v1",
      anonKey: "",
    });

    expect(result.ok).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
