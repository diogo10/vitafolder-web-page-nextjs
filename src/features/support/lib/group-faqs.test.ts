import { describe, expect, it } from "vitest";
import { groupFaqsByCategory } from "./group-faqs";
import type { Faq } from "../schemas";

function makeFaq(overrides: Partial<Faq> & { id: string }): Faq {
  return {
    slug: overrides.id,
    locale: "en",
    category_slug: "general",
    category_title: "General",
    question: `Question ${overrides.id}`,
    answer_markdown: `Answer ${overrides.id}`,
    sort_order: 0,
    ...overrides,
  };
}

describe("groupFaqsByCategory", () => {
  it("returns an empty array for no FAQs", () => {
    expect(groupFaqsByCategory([])).toEqual([]);
  });

  it("groups by category preserving first-seen order", () => {
    const faqs = [
      makeFaq({
        id: "11111111-1111-4111-8111-111111111111",
        category_slug: "b",
        category_title: "B",
      }),
      makeFaq({
        id: "22222222-2222-4222-8222-222222222222",
        category_slug: "a",
        category_title: "A",
      }),
      makeFaq({
        id: "33333333-3333-4333-8333-333333333333",
        category_slug: "b",
        category_title: "B",
      }),
    ];
    const groups = groupFaqsByCategory(faqs);
    expect(groups.map((g) => g.slug)).toEqual(["b", "a"]);
    expect(groups[0]?.items).toHaveLength(2);
    expect(groups[1]?.items).toHaveLength(1);
  });
});
