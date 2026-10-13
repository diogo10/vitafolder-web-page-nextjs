import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendInviteAction, sendInviteActionInternal } from "./actions";
import { resetInviteRateLimits } from "./lib/rate-limit";
import { sendInviteEmail } from "./lib/send-invite-email";

vi.mock("./lib/send-invite-email", () => ({
  sendInviteEmail: vi.fn(),
}));

const sendInviteEmailMock = vi.mocked(sendInviteEmail);

const validInput = {
  to: "email@example.com",
  locale: "en",
  inviterName: "John Doe",
  familyName: "Smith Family",
  inviteCode: "ABC-123",
};

beforeEach(() => {
  sendInviteEmailMock.mockReset();
  resetInviteRateLimits();
});

describe("sendInviteAction", () => {
  it("sends the invite for a valid payload", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    const result = await sendInviteActionInternal(validInput, {
      rateLimitKey: "send-valid",
    });
    expect(result).toEqual({ ok: true });
    expect(sendInviteEmailMock).toHaveBeenCalledWith({
      ...validInput,
    });
  });

  it("rejects an invalid recipient email without calling the service", async () => {
    const result = await sendInviteAction({ ...validInput, to: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.to).toMatch(/valid email/i);
    }
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("rejects a short invite code without calling the service", async () => {
    const result = await sendInviteAction({ ...validInput, inviteCode: "ab" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.inviteCode).toMatch(/too short/i);
    }
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("maps a service failure to a generic form-level error", async () => {
    sendInviteEmailMock.mockResolvedValue({
      ok: false,
      status: 500,
      error: "Could not send invite. Try again.",
    });
    const result = await sendInviteActionInternal(validInput, {
      rateLimitKey: "send-service-failure",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({});
      expect(result.formError).toBe("Could not send invite. Try again.");
    }
  });

  it("returns a fallback form error when validation yields no field errors", async () => {
    const result = await sendInviteAction(null);
    expect(result).toEqual({ ok: false, errors: {}, formError: "Invalid input." });
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without calling the service", async () => {
    const result = await sendInviteAction({ ...validInput, website: "http://spam.example" });
    expect(result).toEqual({ ok: true });
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    for (let i = 0; i < 5; i += 1) {
      const result = await sendInviteActionInternal(validInput, {
        rateLimitKey: "rate-limit-test",
      });
      expect(result).toEqual({ ok: true });
    }
    const limited = await sendInviteActionInternal(validInput, {
      rateLimitKey: "rate-limit-test",
    });
    expect(limited.ok).toBe(false);
    if (!limited.ok) {
      expect(limited.formError).toMatch(/too many requests/i);
    }
    expect(sendInviteEmailMock).toHaveBeenCalledTimes(5);
  });

  it("does not rate-limit invalid requests", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    for (let i = 0; i < 6; i += 1) {
      const result = await sendInviteAction({ ...validInput, to: "not-an-email" });
      expect(result.ok).toBe(false);
    }
    const valid = await sendInviteActionInternal(validInput, {
      rateLimitKey: "invalid-not-counted",
    });
    expect(valid).toEqual({ ok: true });
  });

  it("fails closed when no rate-limit key can be resolved", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    const result = await sendInviteAction(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.formError).toMatch(/too many requests/i);
    }
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });
});
