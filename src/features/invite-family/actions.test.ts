import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actionsModule from "./actions";
import { sendInviteAction } from "./actions";
import { resetInviteRateLimits } from "./lib/rate-limit";
import { sendInviteEmail } from "./lib/send-invite-email";

vi.mock("./lib/send-invite-email", () => ({
  sendInviteEmail: vi.fn(),
}));

const sendInviteEmailMock = vi.mocked(sendInviteEmail);

beforeEach(() => {
  sendInviteEmailMock.mockReset();
  resetInviteRateLimits();
});

describe("sendInviteAction", () => {
  it("exposes only the single-arg public action (no test-internal export)", () => {
    expect(typeof sendInviteAction).toBe("function");
    expect(sendInviteAction.length).toBe(1);
    expect("sendInviteActionInternal" in actionsModule).toBe(false);
  });

  it("rejects invalid input without calling the service", async () => {
    const result = await sendInviteAction({
      to: "not-an-email",
      locale: "en",
      inviterName: "John Doe",
      familyName: "Smith Family",
      inviteCode: "ABC-123",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.to).toMatch(/valid email/i);
    }
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("returns a fallback form error when validation yields no field errors", async () => {
    const result = await sendInviteAction(null);
    expect(result).toEqual({ ok: false, errors: {}, formError: "Invalid input." });
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });

  it("fails closed when no rate-limit key can be resolved", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    const result = await sendInviteAction({
      to: "email@example.com",
      locale: "en",
      inviterName: "John Doe",
      familyName: "Smith Family",
      inviteCode: "ABC-123",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.formError).toMatch(/too many requests/i);
    }
    expect(sendInviteEmailMock).not.toHaveBeenCalled();
  });
});
