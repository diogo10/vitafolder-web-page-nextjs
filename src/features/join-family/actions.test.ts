import { beforeEach, describe, expect, it, vi } from "vitest";
import { joinFamilyAction } from "./actions";
import { requestJoinFamily } from "./lib/join-family";

vi.mock("./lib/join-family", () => ({
  requestJoinFamily: vi.fn(),
}));

const requestJoinFamilyMock = vi.mocked(requestJoinFamily);

beforeEach(() => {
  requestJoinFamilyMock.mockReset();
});

describe("joinFamilyAction", () => {
  it("calls the edge function and returns the family id on success", async () => {
    requestJoinFamilyMock.mockResolvedValue({
      ok: true,
      familyId: "family-1",
      alreadyMember: false,
    });
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result).toEqual({ ok: true, familyId: "family-1" });
    expect(requestJoinFamilyMock).toHaveBeenCalledWith({
      email: "ada@example.com",
      familyCode: "FAMILY-1234",
    });
  });

  it("accepts a valid email with no invite code without calling the service", async () => {
    const result = await joinFamilyAction({ email: "ada@example.com", inviteCode: "" });
    expect(result).toEqual({ ok: true });
    expect(requestJoinFamilyMock).not.toHaveBeenCalled();
  });

  it("maps invalid-code to an inviteCode field error", async () => {
    requestJoinFamilyMock.mockResolvedValue({ ok: false, reason: "invalid-code" });
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "NOPE-1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.inviteCode).toMatch(/doesn't look right/i);
    }
  });

  it("maps already-member to an alreadyMember success", async () => {
    requestJoinFamilyMock.mockResolvedValue({ ok: false, reason: "already-member" });
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result).toEqual({ ok: true, alreadyMember: true });
  });

  it("maps unknown-user to an email field error", async () => {
    requestJoinFamilyMock.mockResolvedValue({ ok: false, reason: "unknown-user" });
    const result = await joinFamilyAction({
      email: "ghost@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toMatch(/couldn't find an account/i);
    }
  });

  it("maps misconfigured to a generic form error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    requestJoinFamilyMock.mockResolvedValue({ ok: false, reason: "misconfigured" });
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/could not join/i);
    }
    expect(errorSpy).toHaveBeenCalled();
  });

  it("maps service failures to a form error", async () => {
    requestJoinFamilyMock.mockResolvedValue({ ok: false, reason: "generic" });
    const result = await joinFamilyAction({
      email: "ada@example.com",
      inviteCode: "FAMILY-1234",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toMatch(/could not join/i);
    }
  });

  it("rejects an invalid email without calling the service", async () => {
    const result = await joinFamilyAction({ email: "not-an-email", inviteCode: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toMatch(/valid email/i);
    }
    expect(requestJoinFamilyMock).not.toHaveBeenCalled();
  });

  it("rejects a short invite code without calling the service", async () => {
    const result = await joinFamilyAction({ email: "ada@example.com", inviteCode: "ab" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.inviteCode).toMatch(/too short/i);
    }
    expect(requestJoinFamilyMock).not.toHaveBeenCalled();
  });
});
