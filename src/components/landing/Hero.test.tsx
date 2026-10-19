import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the headline and calls to action", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { name: /run your home like a pro/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start for free/i })).toHaveAttribute(
      "href",
      "#get-started"
    );
    expect(screen.getByAltText(/family organizing their week/i)).toBeInTheDocument();
  });

  it("no longer renders the watch demo call to action", () => {
    render(<Hero />);
    expect(screen.queryByRole("button", { name: /watch demo/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/watch demo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
