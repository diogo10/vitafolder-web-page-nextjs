import { describe, expect, it } from "vitest";
import { env, getInviteEmailEndpoint, getJoinFamilyEndpoint } from "./env";

describe("env", () => {
  it("parses with defaults", () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^http/);
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });

  it("builds the invite endpoint without a double slash for a trailing-slash base URL", () => {
    expect(getInviteEmailEndpoint("https://example.supabase.co/", "resend-email-v1")).toBe(
      "https://example.supabase.co/functions/v1/resend-email-v1"
    );
    expect(getInviteEmailEndpoint("https://example.supabase.co", "resend-email-v1")).toBe(
      "https://example.supabase.co/functions/v1/resend-email-v1"
    );
  });

  it("builds the join endpoint without a double slash for a trailing-slash base URL", () => {
    expect(getJoinFamilyEndpoint("https://example.supabase.co/", "join-family-v1")).toBe(
      "https://example.supabase.co/functions/v1/join-family-v1"
    );
    expect(getJoinFamilyEndpoint("https://example.supabase.co", "join-family-v1")).toBe(
      "https://example.supabase.co/functions/v1/join-family-v1"
    );
  });
});
