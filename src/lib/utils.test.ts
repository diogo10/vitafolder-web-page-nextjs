import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts with tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional input", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
