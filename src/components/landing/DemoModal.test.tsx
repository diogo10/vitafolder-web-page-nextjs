import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DemoModal } from "./DemoModal";

describe("DemoModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<DemoModal open={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DemoModal open onClose={onClose} />);

    const dialog = screen.getByRole("dialog", { name: /product demo/i });
    const backdrop = dialog.parentElement;
    if (!backdrop) throw new Error("expected a backdrop element");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when the dialog panel itself is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DemoModal open onClose={onClose} />);

    await user.click(screen.getByText(/two-minute tour/i));
    expect(onClose).not.toHaveBeenCalled();
  });
});
