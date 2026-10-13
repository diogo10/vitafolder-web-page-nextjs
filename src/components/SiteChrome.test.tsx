import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders brand and invitation note", () => {
    render(<SiteHeader />);
    expect(screen.getByLabelText(/housemira home/i)).toBeInTheDocument();
    expect(screen.getByText(/invitation system/i)).toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("renders copyright and legal links", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/all household data is encrypted/i)).toBeInTheDocument();
    for (const name of [/privacy/i, /^terms$/i, /support/i]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });
});
