import { describe, expect, it } from "vitest";
import { joinFamilySchema } from "./schemas";

describe("joinFamilySchema", () => {
  it("accepts a valid email with no invite code", () => {
    const result = joinFamilySchema.safeParse({ email: "name@example.com", inviteCode: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("name@example.com");
      expect(result.data.inviteCode).toBeUndefined();
    }
  });

  it("accepts a valid email with an invite code", () => {
    const result = joinFamilySchema.safeParse({
      email: "  Ada@example.com ",
      inviteCode: " FAMILY-1234 ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("Ada@example.com");
      expect(result.data.inviteCode).toBe("FAMILY-1234");
    }
  });

  it("rejects an invalid email", () => {
    const result = joinFamilySchema.safeParse({ email: "not-an-email", inviteCode: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = joinFamilySchema.safeParse({ email: "   ", inviteCode: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invite code that is too short", () => {
    const result = joinFamilySchema.safeParse({ email: "a@b.co", inviteCode: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects an invite code that is too long", () => {
    const result = joinFamilySchema.safeParse({ email: "a@b.co", inviteCode: "x".repeat(65) });
    expect(result.success).toBe(false);
  });
});
