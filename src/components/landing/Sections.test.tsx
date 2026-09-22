import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaSection } from "./CtaSection";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { HowItWorks } from "./HowItWorks";

describe("Features", () => {
  it("renders all three feature cards", () => {
    render(<Features />);
    expect(
      screen.getByRole("heading", { name: /everything your family needs/i })
    ).toBeInTheDocument();
    for (const name of [/smart reminders/i, /shared calendar/i, /private family circles/i]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });
});

describe("HowItWorks", () => {
  it("renders the checklist and phone preview", () => {
    render(<HowItWorks />);
    expect(
      screen.getByRole("heading", { name: /three taps to a calmer home/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/auto-sync across every device/i)).toBeInTheDocument();
    expect(screen.getByText(/kid-friendly view/i)).toBeInTheDocument();
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
    expect(screen.getByText(/smith family/i)).toBeInTheDocument();
    expect(screen.getByText(/school pickup/i)).toBeInTheDocument();
  });
});

describe("CtaSection", () => {
  it("renders signup actions", () => {
    render(<CtaSection />);
    expect(
      screen.getByRole("heading", { name: /ready to simplify family life/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started for free/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /google play/i })).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders copyright and legal links", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 familyadmin/i)).toBeInTheDocument();
    for (const name of [/privacy/i, /^terms$/i, /support/i]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });
});
