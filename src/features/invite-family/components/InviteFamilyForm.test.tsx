import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteFamilyForm } from "./InviteFamilyForm";
import { sendInviteAction } from "../actions";

vi.mock("../actions", () => ({
  sendInviteAction: vi.fn(),
}));
vi.mock("@/components/TurnstileWidget", () => ({ TurnstileWidget: () => null }));

const sendInviteActionMock = vi.mocked(sendInviteAction);

const validForm = {
  to: "email@example.com",
  inviterName: "John Doe",
  familyName: "Smith Family",
  inviteCode: "ABC-123",
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/recipient email/i), validForm.to);
  await user.type(screen.getByLabelText(/your name/i), validForm.inviterName);
  await user.type(screen.getByLabelText(/family name/i), validForm.familyName);
  await user.type(screen.getByLabelText(/invite code/i), validForm.inviteCode);
}

beforeEach(() => {
  sendInviteActionMock.mockReset();
});

describe("InviteFamilyForm", () => {
  it("renders all invite fields and a Send Invite button", () => {
    render(<InviteFamilyForm />);
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invite/i })).toBeInTheDocument();
  });

  it("prefills the invite code from props", () => {
    render(<InviteFamilyForm initialInviteCode="ABC-123" />);
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("ABC-123");
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    sendInviteActionMock.mockResolvedValue({ ok: true });
    render(<InviteFamilyForm />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText(/recipient email/i));
    await user.type(screen.getByLabelText(/recipient email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(sendInviteActionMock).not.toHaveBeenCalled();
  });

  it("sends the invite and shows a confirmation", async () => {
    const user = userEvent.setup();
    sendInviteActionMock.mockResolvedValue({ ok: true });
    render(<InviteFamilyForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(sendInviteActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: validForm.to,
        locale: "en",
        inviterName: validForm.inviterName,
        familyName: validForm.familyName,
        inviteCode: validForm.inviteCode,
      })
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      /invite sent to email@example.com/i
    );
  });

  it("shows a service error when sending fails", async () => {
    const user = userEvent.setup();
    sendInviteActionMock.mockResolvedValue({
      ok: false,
      errors: {},
      formError: "Could not send invite. Try again.",
    });
    render(<InviteFamilyForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not send invite/i);
  });

  it("shows a generic error when the action throws", async () => {
    const user = userEvent.setup();
    sendInviteActionMock.mockRejectedValue(new Error("boom"));
    render(<InviteFamilyForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not send invite/i);
  });

  it("asks for a Turnstile token before sending when a site key is set", async () => {
    const user = userEvent.setup();
    render(<InviteFamilyForm turnstileSiteKey="test-site-key" />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/verification challenge/i);
    expect(sendInviteActionMock).not.toHaveBeenCalled();
  });

  it("seeds the invite code once and ignores later prop changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<InviteFamilyForm initialInviteCode="AAA-111" />);
    await user.type(screen.getByLabelText(/recipient email/i), "email@example.com");
    await user.clear(screen.getByLabelText(/invite code/i));
    await user.type(screen.getByLabelText(/invite code/i), "TYPED-999");
    rerender(<InviteFamilyForm initialInviteCode="BBB-222" />);
    expect(screen.getByLabelText(/recipient email/i)).toHaveValue("email@example.com");
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("TYPED-999");
  });
});
