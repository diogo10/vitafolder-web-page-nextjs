import { describe, expect, it } from "vitest";
import { getInviteFamilyStrings, inviteFamilyStrings } from "./strings";

describe("inviteFamilyStrings", () => {
  it("exposes en/pt/es strings with identical keys", () => {
    for (const locale of ["en", "pt", "es"] as const) {
      const strings = inviteFamilyStrings[locale];
      expect(strings.heading.length).toBeGreaterThan(0);
      expect(strings.submitLabel.length).toBeGreaterThan(0);
      expect(strings.genericError.length).toBeGreaterThan(0);
    }
    // English copy is stable (component + E2E queries depend on it).
    expect(inviteFamilyStrings.en.heading).toBe("Invite your family");
    expect(inviteFamilyStrings.en.submitLabel).toBe("Send Invite");
  });

  it("falls back to English for unknown locales", () => {
    expect(getInviteFamilyStrings("fr")).toBe(inviteFamilyStrings.en);
    expect(getInviteFamilyStrings(undefined)).toBe(inviteFamilyStrings.en);
    expect(getInviteFamilyStrings("PT")).toBe(inviteFamilyStrings.pt);
  });
});
