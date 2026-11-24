import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "./SignupForm";

const signupActionMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("../actions", () => ({ signupAction: signupActionMock }));
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));

beforeEach(() => {
  signupActionMock.mockReset();
  signupActionMock.mockResolvedValue({ ok: true, requiresEmailConfirmation: false });
  routerMock.replace.mockReset();
  routerMock.refresh.mockReset();
});

describe("SignupForm", () => {
  it("renders the email and password fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^create account$/i })).toBeInTheDocument();
  });

  it("validates empty fields before calling the action", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(signupActionMock).not.toHaveBeenCalled();
  });

  it("rejects a short password before calling the action", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "short");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(screen.getByText(/use at least 8 characters/i)).toBeInTheDocument();
    expect(signupActionMock).not.toHaveBeenCalled();
  });

  it("submits trimmed credentials and opens the dashboard on success", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "  ada@example.com  ");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    await waitFor(() => expect(signupActionMock).toHaveBeenCalled());
    expect(signupActionMock).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
    });
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard"));
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("asks the user to confirm their email when no session is returned", async () => {
    signupActionMock.mockResolvedValueOnce({ ok: true, requiresEmailConfirmation: true });
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/confirm your email address/i);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("shows a form-level error returned by the action", async () => {
    signupActionMock.mockResolvedValueOnce({
      ok: false,
      errors: { form: "An account with this email already exists. Try signing in." },
    });
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("shows a generic error when the action throws", async () => {
    signupActionMock.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't create your account/i);
  });

  it("disables the submit button while creating the account", async () => {
    let resolveAction: (value: { ok: true; requiresEmailConfirmation: false }) => void = () => {};
    signupActionMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    const pendingButton = screen.getByRole("button", { name: /creating account/i });
    expect(pendingButton).toBeDisabled();

    await act(async () => {
      resolveAction({ ok: true, requiresEmailConfirmation: false });
    });
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const password = screen.getByLabelText(/^password$/i);
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
