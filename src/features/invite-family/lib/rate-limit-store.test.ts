import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkInviteRateLimitShared, isSharedRateLimitConfigured } from "./rate-limit-store";
import { resetInviteRateLimits } from "./rate-limit";

function jsonResponse(result: unknown, status = 200): Response {
  return new Response(JSON.stringify({ result }), { status });
}

beforeEach(() => {
  resetInviteRateLimits();
});

describe("isSharedRateLimitConfigured", () => {
  it("returns false without explicit vars or env", () => {
    expect(isSharedRateLimitConfigured({})).toBe(false);
  });

  it("returns true when url and token are provided", () => {
    expect(isSharedRateLimitConfigured({ url: "https://example.upstash.io", token: "token" })).toBe(
      true
    );
  });
});

describe("checkInviteRateLimitShared", () => {
  it("falls back to the in-memory limiter without shared config", async () => {
    for (let i = 0; i < 5; i += 1) {
      await expect(
        checkInviteRateLimitShared("fallback-user", {
          now: 1_000 + i,
          restUrl: undefined,
          restToken: undefined,
        })
      ).resolves.toEqual({ ok: true });
    }
  });

  it("allows requests up to the shared budget", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(1));
    const result = await checkInviteRateLimitShared("ip:1.2.3.4", {
      fetchFn: fetchFn as unknown as typeof fetch,
      restUrl: "https://example.upstash.io",
      restToken: "token",
    });
    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("blocks requests over the shared budget", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(6));
    const result = await checkInviteRateLimitShared("ip:1.2.3.4", {
      fetchFn: fetchFn as unknown as typeof fetch,
      restUrl: "https://example.upstash.io",
      restToken: "token",
    });
    expect(result).toEqual({ ok: false });
  });

  it("namespaces shared keys with the requested prefix", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => jsonResponse(1));
    await checkInviteRateLimitShared("ip:1.2.3.4", {
      fetchFn: fetchFn as unknown as typeof fetch,
      restUrl: "https://example.upstash.io",
      restToken: "token",
      prefix: "signup",
    });

    const firstUrl = String(fetchFn.mock.calls[0]?.[0]);
    expect(firstUrl).toContain("signup%3A");
    expect(firstUrl).not.toContain("invite%3A");
  });

  it("keeps in-memory fallback buckets separate per prefix", async () => {
    for (let i = 0; i < 5; i += 1) {
      await checkInviteRateLimitShared("same-sender", {
        now: 1_000 + i,
        restUrl: undefined,
        restToken: undefined,
        prefix: "invite",
      });
    }

    await expect(
      checkInviteRateLimitShared("same-sender", {
        now: 2_000,
        restUrl: undefined,
        restToken: undefined,
        prefix: "signup",
      })
    ).resolves.toEqual({ ok: true });
  });

  it("fails closed on shared-store errors", async () => {
    const failingFetch = vi.fn(async () => new Response("error", { status: 500 }));
    await expect(
      checkInviteRateLimitShared("ip:1.2.3.4", {
        fetchFn: failingFetch as unknown as typeof fetch,
        restUrl: "https://example.upstash.io",
        restToken: "token",
      })
    ).resolves.toEqual({ ok: false });
    const throwingFetch = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(
      checkInviteRateLimitShared("ip:1.2.3.4", {
        fetchFn: throwingFetch as unknown as typeof fetch,
        restUrl: "https://example.upstash.io",
        restToken: "token",
      })
    ).resolves.toEqual({ ok: false });
  });
});
