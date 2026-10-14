import { describe, expect, it } from "vitest";
import { faqSchema, faqsResponseSchema, resolveSupportLocale } from "./schemas";

const validFaq = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  slug: "reset-password",
  locale: "en",
  category_slug: "account",
  category_title: "Account",
  question: "How do I reset my password?",
  answer_markdown: "Open settings and choose Reset password.",
  sort_order: 1,
};

describe("faqSchema", () => {
  it("parses a valid FAQ row", () => {
    expect(faqSchema.parse(validFaq)).toEqual(validFaq);
  });

  it("rejects an unsupported locale", () => {
    expect(() => faqSchema.parse({ ...validFaq, locale: "es" })).toThrow();
  });

  it("rejects blank content", () => {
    expect(() => faqSchema.parse({ ...validFaq, question: "  " })).toThrow();
  });
});

describe("faqsResponseSchema", () => {
  it("parses an array of FAQs", () => {
    expect(faqsResponseSchema.parse([validFaq])).toHaveLength(1);
  });

  it("rejects non-array payloads", () => {
    expect(() => faqsResponseSchema.parse({})).toThrow();
  });
});

describe("resolveSupportLocale", () => {
  it("defaults to en when params are missing", () => {
    expect(resolveSupportLocale(undefined)).toBe("en");
    expect(resolveSupportLocale({})).toBe("en");
  });

  it("accepts pt", () => {
    expect(resolveSupportLocale({ locale: "pt" })).toBe("pt");
  });

  it("falls back to en for unsupported locales", () => {
    expect(resolveSupportLocale({ locale: "es" })).toBe("en");
  });

  it("reads the first value of repeated params", () => {
    expect(resolveSupportLocale({ locale: ["pt", "en"] })).toBe("pt");
  });

  it("supports URLSearchParams", () => {
    expect(resolveSupportLocale(new URLSearchParams("locale=pt"))).toBe("pt");
    expect(resolveSupportLocale(new URLSearchParams("locale=es"))).toBe("en");
  });
});
