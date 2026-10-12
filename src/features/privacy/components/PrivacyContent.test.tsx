import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivacyContent } from "./PrivacyContent";

describe("PrivacyContent", () => {
  it("renders the policy heading and effective date", () => {
    render(<PrivacyContent />);
    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/effective date: october 7, 2026/i)).toBeInTheDocument();
  });

  it("covers collection, use, sharing, and contact practices", () => {
    render(<PrivacyContent />);
    for (const name of [
      /information we collect/i,
      /how we use your information/i,
      /sharing and disclosure/i,
      /data security/i,
      /contact us/i,
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/we do not sell your personal information/i)).toBeInTheDocument();
  });

  it("does not describe removed Shared Notes collection", () => {
    render(<PrivacyContent />);
    expect(
      screen.queryByRole("heading", { name: /notes and circle-family sharing/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/each note belongs to exactly one circle-family/i)
    ).not.toBeInTheDocument();
  });

  it("provides anchor navigation for each section", () => {
    render(<PrivacyContent />);
    const nav = screen.getByRole("navigation", { name: /privacy policy contents/i });
    expect(nav).toBeInTheDocument();
    expect(nav.querySelectorAll("a").length).toBeGreaterThanOrEqual(9);
  });
});
