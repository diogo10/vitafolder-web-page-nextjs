import { describe, expect, it } from "vitest";
import { env } from "./env";

describe("env", () => {
  it("parses with defaults", () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^http/);
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });
});
