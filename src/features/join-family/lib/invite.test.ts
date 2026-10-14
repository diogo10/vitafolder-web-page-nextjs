import { describe, expect, it } from "vitest";
import { extractEmail, extractInviteCode } from "./invite";

describe("extractInviteCode", () => {
  it("returns empty string for missing params", () => {
    expect(extractInviteCode(undefined)).toBe("");
    expect(extractInviteCode(null)).toBe("");
    expect(extractInviteCode({})).toBe("");
    expect(extractInviteCode(new URLSearchParams())).toBe("");
  });

  it("reads code from URLSearchParams", () => {
    expect(extractInviteCode(new URLSearchParams("code=FAMILY-1234"))).toBe("FAMILY-1234");
  });

  it("prefers code over invite aliases", () => {
    const params = new URLSearchParams("invite=SECOND&code=FIRST");
    expect(extractInviteCode(params)).toBe("FIRST");
  });

  it("supports invite, inviteCode, invitation, and token aliases", () => {
    expect(extractInviteCode(new URLSearchParams("invite=ABC123"))).toBe("ABC123");
    expect(extractInviteCode(new URLSearchParams("inviteCode=ABC123"))).toBe("ABC123");
    expect(extractInviteCode(new URLSearchParams("invitation=ABC123"))).toBe("ABC123");
    expect(extractInviteCode(new URLSearchParams("token=ABC123"))).toBe("ABC123");
  });

  it("trims whitespace and reads plain record objects", () => {
    expect(extractInviteCode({ code: "  XYZ-9  " })).toBe("XYZ-9");
    expect(extractInviteCode({ invite: ["ONE", "TWO"] })).toBe("ONE");
    expect(extractInviteCode({ code: "" })).toBe("");
  });
});

describe("extractEmail", () => {
  it("returns empty string when absent", () => {
    expect(extractEmail(undefined)).toBe("");
    expect(extractEmail({})).toBe("");
  });

  it("reads email from URLSearchParams and record objects", () => {
    expect(extractEmail(new URLSearchParams("email=a%40b.co"))).toBe("a@b.co");
    expect(extractEmail({ email: "  ada@example.com " })).toBe("ada@example.com");
  });

  it("reads code and email together from a combined invite link", () => {
    const params = new URLSearchParams("code=FAMILY-1234&email=ada%40example.com");
    expect(extractInviteCode(params)).toBe("FAMILY-1234");
    expect(extractEmail(params)).toBe("ada@example.com");
  });
});
