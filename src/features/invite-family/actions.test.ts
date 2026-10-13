import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendInviteAction } from "./actions";
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
});

describe("sendInviteAction", () => {
  it("sends the invite for a valid payload", async () => {
    sendInviteEmailMock.mockResolvedValue({ ok: true });
    const result = await sendInviteAction(validInput);
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

  it("maps a service failure to a form-level error", async () => {
    sendInviteEmailMock.mockResolvedValue({
      ok: false,
      status: 500,
      error: "Email service responded with status 500.",
    });
    const result = await sendInviteAction(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({});
      expect(result.formError).toMatch(/status 500/);
    }
  });
});
