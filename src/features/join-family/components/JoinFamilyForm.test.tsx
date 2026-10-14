import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JoinFamilyForm } from "./JoinFamilyForm";

const searchMock = vi.hoisted(() => ({
  get: (key: string): string | null => {
    void key;
    return null;
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => searchMock.get(key),
  }),
}));

beforeEach(() => {
  searchMock.get = () => null;
});

describe("JoinFamilyForm", () => {
  it("renders email and invite code fields", () => {
    render(<JoinFamilyForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join family circle/i })).toBeInTheDocument();
  });

  it("prefills the code from initial props (server searchParams)", () => {
    render(<JoinFamilyForm initialEmail="ada@example.com" initialCode="FAMILY-1234" />);
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ada@example.com");
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("FAMILY-1234");
  });

  it("autofills the code from the URL ?code= parameter", () => {
    searchMock.get = (key: string) => (key === "code" ? "URL-CODE-9" : null);
    render(<JoinFamilyForm />);
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("URL-CODE-9");
  });

  it("autofills the code from the ?invite= alias", () => {
    searchMock.get = (key: string) => (key === "invite" ? "ALIAS-1" : null);
    render(<JoinFamilyForm />);
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("ALIAS-1");
  });

  it("autofills the email from the URL ?email= parameter", () => {
    searchMock.get = (key: string) => (key === "email" ? "ada@example.com" : null);
    render(<JoinFamilyForm />);
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ada@example.com");
  });

  it("prefills code and email together from URL parameters", () => {
    searchMock.get = (key: string) =>
      key === "code" ? "FAMILY-1234" : key === "email" ? "ada@example.com" : null;
    render(<JoinFamilyForm />);
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("FAMILY-1234");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ada@example.com");
  });

  it("does not overwrite a user-provided code with the URL value", () => {
    searchMock.get = (key: string) => (key === "code" ? "FROM-URL" : null);
    render(<JoinFamilyForm initialCode="TYPED-1" />);
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("TYPED-1");
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<JoinFamilyForm />);
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /join family circle/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
  });

  it("shows a validation error for a short invite code", async () => {
    const user = userEvent.setup();
    render(<JoinFamilyForm />);
    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/invite code/i), "ab");
    await user.click(screen.getByRole("button", { name: /join family circle/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/too short/i);
  });

  it("submits successfully with a valid email and code", async () => {
    const user = userEvent.setup();
    render(<JoinFamilyForm initialCode="FAMILY-1234" />);
    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /join family circle/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/check your inbox/i);
  });
});
