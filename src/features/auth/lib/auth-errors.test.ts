import { describe, expect, it } from "vitest";
import { getLoginErrorMessage } from "./auth-errors";

describe("getLoginErrorMessage", () => {
  it("maps invalid credentials to a generic credential error", () => {
    expect(getLoginErrorMessage({ code: "invalid_credentials" })).toMatch(
      /incorrect email or password/i
    );
  });

  it("asks the user to confirm an unconfirmed email", () => {
    expect(getLoginErrorMessage({ code: "email_not_confirmed" })).toMatch(
      /confirm your email address/i
    );
    expect(getLoginErrorMessage({ message: "Email not confirmed" })).toMatch(
      /confirm your email address/i
    );
  });

  it("maps rate limiting to a retry message", () => {
    for (const code of ["over_request_rate_limit", "too_many_requests"]) {
      expect(getLoginErrorMessage({ code })).toMatch(/too many sign-in attempts/i);
    }
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(getLoginErrorMessage({ code: "unexpected_failure", message: "boom" })).toMatch(
      /couldn't sign you in/i
    );
  });
});
