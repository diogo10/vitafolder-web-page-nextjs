import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FaqAccordion } from "./FaqAccordion";
import type { FaqCategoryGroup } from "../lib/group-faqs";

const groups: FaqCategoryGroup[] = [
  {
    slug: "account",
    title: "Account",
    items: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "reset-password",
        locale: "en",
        category_slug: "account",
        category_title: "Account",
        question: "How do I reset my password?",
        answer_markdown: "Open settings and choose Reset password.",
        sort_order: 1,
      },
    ],
  },
  {
    slug: "sharing",
    title: "Sharing",
    items: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        slug: "invite-member",
        locale: "en",
        category_slug: "sharing",
        category_title: "Sharing",
        question: "How do I invite a member?",
        answer_markdown: "Send them an invite link.",
        sort_order: 2,
      },
    ],
  },
];

describe("FaqAccordion", () => {
  it("renders categories and questions", () => {
    render(<FaqAccordion groups={groups} />);
    expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /how do i reset my password/i })).toBeInTheDocument();
  });

  it("expands the answer when the question is clicked", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion groups={groups} />);
    const button = screen.getByRole("button", { name: /how do i invite a member/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/send them an invite link/i)).toBeInTheDocument();
  });
});
