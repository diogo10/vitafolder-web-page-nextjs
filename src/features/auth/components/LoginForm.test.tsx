import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const loginActionMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("../actions", () => ({ loginAction: loginActionMock }));
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));

beforeEach(() => {
  loginActionMock.mockReset();
  loginActionMock.mockResolvedValue({ ok: true });
  routerMock.replace.mockReset();
  routerMock.refresh.mockReset();
});

describe("LoginForm", () => {
  it("renders the email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("validates empty fields before calling the action", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
    expect(loginActionMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email before calling the action", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(loginActionMock).not.toHaveBeenCalled();
  });

  it("submits trimmed credentials and opens the dashboard on success", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "  ada@example.com  ");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(loginActionMock).toHaveBeenCalled());
    expect(loginActionMock).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
    });
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard"));
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("opens the preserved destination after signing in", async () => {
    const user = userEvent.setup();
    render(<LoginForm nextPath="/dashboard?tab=calendar" />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard?tab=calendar"));
  });

  it("ignores external destinations and falls back to the dashboard", async () => {
    const user = userEvent.setup();
    render(<LoginForm nextPath="//evil.example/dashboard" />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows a form-level error returned by the action", async () => {
    loginActionMock.mockResolvedValueOnce({
      ok: false,
      errors: { form: "Incorrect email or password. Please try again." },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrong");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect email or password/i);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("shows a generic error when the action throws", async () => {
    loginActionMock.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't sign you in/i);
  });

  it("disables the submit button while signing in", async () => {
    let resolveAction: (value: { ok: true }) => void = () => {};
    loginActionMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    const pendingButton = screen.getByRole("button", { name: /signing in/i });
    expect(pendingButton).toBeDisabled();

    await act(async () => {
      resolveAction({ ok: true });
    });
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

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
