import { describe, expect, it } from "vitest";
import { DEFAULT_AUTH_REDIRECT, sanitizeNextPath } from "./redirect";

describe("sanitizeNextPath", () => {
  it("defaults to the dashboard when no destination is provided", () => {
    expect(sanitizeNextPath(undefined)).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath(null)).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("")).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it("keeps same-origin absolute paths", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeNextPath("/dashboard?tab=calendar")).toBe("/dashboard?tab=calendar");
  });

  it("rejects external and protocol-relative destinations", () => {
    expect(sanitizeNextPath("https://evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("//evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/\\evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\\..\\evil")).toBe(DEFAULT_AUTH_REDIRECT);
  });
});
