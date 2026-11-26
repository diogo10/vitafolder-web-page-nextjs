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
    expect(sanitizeNextPath("/dashboard#calendar")).toBe("/dashboard#calendar");
    expect(sanitizeNextPath("/join-family/../dashboard")).toBe("/dashboard");
  });

  it("rejects external and protocol-relative destinations", () => {
    expect(sanitizeNextPath("https://evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("//evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("///evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/\\evil.example/dashboard")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\\..\\evil")).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it("rejects raw control characters and backslashes", () => {
    expect(sanitizeNextPath("/dashboard\t")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\n")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\r")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\u0000")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard\u007f")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard%5Cevil")).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it.each(["/dashboard%09", "/dashboard%0A", "/dashboard%0D"])(
    "rejects percent-encoded control characters in %s",
    (value) => {
      expect(sanitizeNextPath(value)).toBe(DEFAULT_AUTH_REDIRECT);
    }
  );

  it("rejects malformed percent escapes", () => {
    expect(sanitizeNextPath("/dashboard%")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeNextPath("/dashboard%zz")).toBe(DEFAULT_AUTH_REDIRECT);
  });
});
