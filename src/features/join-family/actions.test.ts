import { describe, expect, it } from "vitest";
import { joinFamilyAction } from "./actions";

describe("joinFamilyAction", () => {
  it("accepts a valid email and invite code", async () => {
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result).toEqual({ ok: true });
  });

  it("accepts a valid email with no invite code", async () => {
    const result = await joinFamilyAction({ email: "ada@example.com", inviteCode: "" });
    expect(result).toEqual({ ok: true });
  });

  it("rejects an invalid email", async () => {
    const result = await joinFamilyAction({ email: "not-an-email", inviteCode: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toMatch(/valid email/i);
    }
  });

  it("rejects a short invite code", async () => {
    const result = await joinFamilyAction({ email: "ada@example.com", inviteCode: "ab" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.inviteCode).toMatch(/too short/i);
    }
  });
});
