import type { Faq } from "../schemas";

export type FaqCategoryGroup = {
  slug: string;
  title: string;
  items: Faq[];
};

/**
 * Group FAQs by category, preserving first-seen category order.
 * Callers pass rows already ordered by (sort_order, slug) so items
 * within each group stay in display order.
 */
export function groupFaqsByCategory(faqs: Faq[]): FaqCategoryGroup[] {
  const groups = new Map<string, FaqCategoryGroup>();
  for (const faq of faqs) {
    const existing = groups.get(faq.category_slug);
    if (existing) {
      existing.items.push(faq);
    } else {
      groups.set(faq.category_slug, {
        slug: faq.category_slug,
        title: faq.category_title,
        items: [faq],
      });
    }
  }
  return [...groups.values()];
}
