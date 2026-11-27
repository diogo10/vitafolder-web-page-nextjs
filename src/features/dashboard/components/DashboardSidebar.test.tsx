import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "./DashboardSidebar";

const pathnameMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ usePathname: pathnameMock }));
vi.mock("@/features/auth/actions", () => ({ logoutAction: vi.fn() }));

beforeEach(() => {
  pathnameMock.mockReset();
  pathnameMock.mockReturnValue("/dashboard");
});

describe("DashboardSidebar", () => {
  it("renders the dashboard navigation and logout control", () => {
    render(<DashboardSidebar />);

    expect(screen.getByRole("navigation", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Notes" })).toHaveAttribute("href", "/dashboard/notes");
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("marks the current dashboard route as active", () => {
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark the dashboard active on other routes", () => {
    pathnameMock.mockReturnValue("/settings");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("marks the notes route active without marking the dashboard active", () => {
    pathnameMock.mockReturnValue("/dashboard/notes");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Notes" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
