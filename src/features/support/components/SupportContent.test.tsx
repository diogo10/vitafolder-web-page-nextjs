import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportContent } from "./SupportContent";
import type { Faq } from "../schemas";

const faq: Faq = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  slug: "reset-password",
  locale: "en",
  category_slug: "account",
  category_title: "Account",
  question: "How do I reset my password?",
  answer_markdown: "Open settings and choose Reset password.",
  sort_order: 1,
};

describe("SupportContent", () => {
  it("renders the heading and FAQ entries", () => {
    render(<SupportContent faqs={[faq]} locale="en" />);
    expect(screen.getByRole("heading", { name: /support & faq/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /how do i reset my password/i })).toBeInTheDocument();
  });

  it("renders the empty state when there are no FAQs", () => {
    render(<SupportContent faqs={[]} locale="en" />);
    expect(screen.getByText(/no faqs available/i)).toBeInTheDocument();
  });
});
