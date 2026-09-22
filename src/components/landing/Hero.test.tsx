import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(screen.getByRole("button", { name: /watch demo/i })).toBeInTheDocument();
    expect(screen.getByAltText(/family organizing their week/i)).toBeInTheDocument();
  });

  it("opens and closes the demo dialog", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    await user.click(screen.getByRole("button", { name: /watch demo/i }));
    expect(screen.getByRole("dialog", { name: /product demo/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close demo/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the demo dialog with the Escape key", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    await user.click(screen.getByRole("button", { name: /watch demo/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
