import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TurnstileWidget } from "./TurnstileWidget";

const removeMock = vi.fn();

beforeEach(() => {
  removeMock.mockReset();
  window.turnstile = {
    render: vi.fn(() => "widget-1"),
    remove: removeMock,
  };
});

afterEach(() => {
  delete window.turnstile;
});

describe("TurnstileWidget", () => {
  it("renders nothing without a site key", () => {
    const { container } = render(<TurnstileWidget onToken={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(window.turnstile?.render).not.toHaveBeenCalled();
  });

  it("renders the explicit widget and forwards lifecycle callbacks", async () => {
    const onToken = vi.fn();
    const onExpire = vi.fn();
    const { container, unmount } = render(
      <TurnstileWidget
        siteKey="test-site-key"
        action="signup"
        onToken={onToken}
        onExpire={onExpire}
      />
    );

    const widget = container.querySelector('[data-turnstile-widget="signup"]');
    expect(widget).not.toBeNull();

    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(1));

    const [element, options] = vi.mocked(window.turnstile!.render).mock.calls[0]!;
    expect(element).toBe(widget);
    expect(options).toMatchObject({
      sitekey: "test-site-key",
      action: "signup",
      theme: "light",
    });

    options.callback?.("token-value");
    expect(onToken).toHaveBeenCalledWith("token-value");

    options["expired-callback"]?.();
    expect(onExpire).toHaveBeenCalledTimes(1);

    unmount();
    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });
});
