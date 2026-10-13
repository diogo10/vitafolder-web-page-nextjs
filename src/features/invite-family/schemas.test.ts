import { describe, expect, it } from "vitest";
import { inviteFamilySchema } from "./schemas";

const validInput = {
  to: "email@example.com",
  locale: "en",
  inviterName: "John Doe",
  familyName: "Smith Family",
  inviteCode: "ABC-123",
};

describe("inviteFamilySchema", () => {
  it("accepts a complete invite payload", () => {
    const result = inviteFamilySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("trims whitespace and lowercases the locale", () => {
    const result = inviteFamilySchema.safeParse({
      ...validInput,
      to: "  Email@Example.com ",
      locale: "EN",
      inviteCode: "  ABC-123 ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.to).toBe("Email@Example.com");
      expect(result.data.locale).toBe("en");
      expect(result.data.inviteCode).toBe("ABC-123");
    }
  });

  it("defaults the locale to en when omitted", () => {
    const { locale: _omitted, ...withoutLocale } = validInput;
    void _omitted;
    const result = inviteFamilySchema.safeParse(withoutLocale);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe("en");
    }
  });

  it("rejects an invalid recipient email", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, to: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid locale", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, locale: "english" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported locale", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, locale: "fr" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing inviter name", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, inviterName: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing family name", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, familyName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invite code that is too short", () => {
    const result = inviteFamilySchema.safeParse({ ...validInput, inviteCode: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects an invite code that is too long", () => {
    const result = inviteFamilySchema.safeParse({
      ...validInput,
      inviteCode: "x".repeat(65),
    });
    expect(result.success).toBe(false);
  });
});
