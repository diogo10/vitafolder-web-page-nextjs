"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FaqCategoryGroup } from "../lib/group-faqs";

type FaqAccordionProps = {
  groups: FaqCategoryGroup[];
};

export function FaqAccordion({ groups }: FaqAccordionProps) {
  const firstId = groups[0]?.items[0]?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(firstId);

  return (
    <div className="mt-8 space-y-8">
      {groups.map((group) => (
        <section
          key={group.slug}
          id={`faq-${group.slug}`}
          aria-labelledby={`faq-${group.slug}-heading`}
          className="scroll-mt-24"
        >
          <h2
            id={`faq-${group.slug}-heading`}
            className="text-lg font-semibold tracking-tight text-ink"
          >
            {group.title}
          </h2>
          <ul className="mt-4 space-y-3">
            {group.items.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <li
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-line bg-white"
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-button-${faq.slug}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.slug}`}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink transition-colors hover:text-brand"
                    >
                      <span>{faq.question}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={`faq-panel-${faq.slug}`}
                      role="region"
                      aria-labelledby={`faq-button-${faq.slug}`}
                      className="border-t border-line px-5 py-4"
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed text-mist">
                        {faq.answer_markdown}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
