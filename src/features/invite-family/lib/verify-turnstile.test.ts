import { describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "./verify-turnstile";

describe("verifyTurnstileToken", () => {
  it("returns true when Cloudflare reports success", async () => {
    const fetchFn = vi.fn(
      async () => new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    await expect(
      verifyTurnstileToken("token", {
        secret: "secret",
        fetchFn: fetchFn as unknown as typeof fetch,
      })
    ).resolves.toBe(true);
  });

  it("fails closed on missing secret, blank token, or network failure", async () => {
    const fetchFn = vi.fn(
      async () => new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    await expect(
      verifyTurnstileToken("token", { fetchFn: fetchFn as unknown as typeof fetch })
    ).resolves.toBe(false);
    await expect(
      verifyTurnstileToken("  ", { secret: "secret", fetchFn: fetchFn as unknown as typeof fetch })
    ).resolves.toBe(false);
    const failingFetch = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(
      verifyTurnstileToken("token", {
        secret: "secret",
        fetchFn: failingFetch as unknown as typeof fetch,
      })
    ).resolves.toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fails closed when Cloudflare reports failure", async () => {
    const fetchFn = vi.fn(
      async () => new Response(JSON.stringify({ success: false }), { status: 200 })
    );
    await expect(
      verifyTurnstileToken("token", {
        secret: "secret",
        fetchFn: fetchFn as unknown as typeof fetch,
      })
    ).resolves.toBe(false);
  });
});
