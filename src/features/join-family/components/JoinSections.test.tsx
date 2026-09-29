import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JoinFooter } from "./JoinFooter";
import { JoinHeader } from "./JoinHeader";
import { JoinIntro } from "./JoinIntro";
import { JoinPanel } from "./JoinPanel";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe("JoinHeader", () => {
  it("renders brand and invitation note", () => {
    render(<JoinHeader />);
    expect(screen.getByLabelText(/housemira home/i)).toBeInTheDocument();
    expect(screen.getByText(/invitation system/i)).toBeInTheDocument();
  });
});

describe("JoinIntro", () => {
  it("renders headline, features, and social proof", () => {
    render(<JoinIntro />);
    expect(
      screen.getByRole("heading", { name: /your family is.*waiting for you/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /smart reminders/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /shared calendar/i })).toBeInTheDocument();
    expect(screen.getByText(/join 12,000\+ active circles/i)).toBeInTheDocument();
  });
});

describe("JoinPanel", () => {
  it("renders the invite form with initial code", () => {
    render(<JoinPanel initialEmail="" initialCode="FAMILY-1" />);
    expect(screen.getByRole("heading", { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/invite code/i)).toHaveValue("FAMILY-1");
    expect(screen.getByRole("button", { name: /join family circle/i })).toBeInTheDocument();
  });
});

describe("JoinFooter", () => {
  it("renders copyright and legal links", () => {
    render(<JoinFooter />);
    expect(screen.getByText(/all household data is encrypted/i)).toBeInTheDocument();
    for (const name of [/privacy/i, /^terms$/i, /support/i]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });
});
