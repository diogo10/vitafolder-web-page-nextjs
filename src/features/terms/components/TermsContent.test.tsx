import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TermsContent } from "./TermsContent";

describe("TermsContent", () => {
  it("renders the terms heading and effective date", () => {
    render(<TermsContent />);
    expect(screen.getByRole("heading", { name: /terms and conditions/i })).toBeInTheDocument();
    expect(screen.getByText(/effective date: october 7, 2026/i)).toBeInTheDocument();
  });

  it("covers agreement, acceptable use, privacy, and contact terms", () => {
    render(<TermsContent />);
    for (const name of [
      /agreement to these terms/i,
      /acceptable use/i,
      /shared notes and circle-family rules/i,
      /privacy/i,
      /contact us/i,
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/we do not sell your personal information/i)).toBeInTheDocument();
  });

  it("explains notes circle-scoped sharing and deletion", () => {
    render(<TermsContent />);
    expect(
      screen.getByText(/each shared note belongs to exactly one circle-family/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/circles remain isolated/i)).toBeInTheDocument();
    expect(screen.getByText(/deleting a note removes it for everyone/i)).toBeInTheDocument();
  });

  it("provides anchor navigation for each section", () => {
    render(<TermsContent />);
    const nav = screen.getByRole("navigation", { name: /terms and conditions contents/i });
    expect(nav).toBeInTheDocument();
    expect(nav.querySelectorAll("a").length).toBeGreaterThanOrEqual(10);
  });
});
