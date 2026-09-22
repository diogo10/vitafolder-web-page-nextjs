import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./Reveal";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("reveals content immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <Reveal>
        <p>Fallback content</p>
      </Reveal>
    );
    expect(screen.getByText(/fallback content/i).parentElement).toHaveClass("is-visible");
  });

  it("reveals content when the element intersects", () => {
    let callback: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((cb: IntersectionObserverCallback) => {
        callback = cb;
        return { observe, unobserve, disconnect };
      })
    );

    render(
      <Reveal>
        <p>Observed content</p>
      </Reveal>
    );
    const wrapper = screen.getByText(/observed content/i).parentElement;
    expect(wrapper).not.toHaveClass("is-visible");

    callback(
      [{ isIntersecting: true, target: wrapper } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(wrapper).toHaveClass("is-visible");
    expect(unobserve).toHaveBeenCalled();
  });
});
