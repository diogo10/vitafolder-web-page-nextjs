import { describe, expect, it, beforeEach } from "vitest";
import { checkInviteRateLimit, resetInviteRateLimits } from "./rate-limit";

beforeEach(() => {
  resetInviteRateLimits();
});

describe("checkInviteRateLimit", () => {
  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkInviteRateLimit("user-1", { now: 1_000 + i })).toEqual({ ok: true });
    }
  });

  it("blocks requests over the limit within the window", () => {
    for (let i = 0; i < 5; i += 1) {
      checkInviteRateLimit("user-2", { now: 1_000 + i });
    }
    expect(checkInviteRateLimit("user-2", { now: 2_000 })).toEqual({ ok: false });
  });

  it("allows requests again after the window passes", () => {
    for (let i = 0; i < 5; i += 1) {
      checkInviteRateLimit("user-3", { now: 1_000 + i });
    }
    expect(checkInviteRateLimit("user-3", { now: 61_001 + 1_000 })).toEqual({ ok: true });
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i += 1) {
      checkInviteRateLimit("user-4", { now: 1_000 + i });
    }
    expect(checkInviteRateLimit("other-user", { now: 2_000 })).toEqual({ ok: true });
  });

  it("resets all buckets", () => {
    for (let i = 0; i < 5; i += 1) {
      checkInviteRateLimit("user-5", { now: 1_000 + i });
    }
    resetInviteRateLimits();
    expect(checkInviteRateLimit("user-5", { now: 2_000 })).toEqual({ ok: true });
  });
});
