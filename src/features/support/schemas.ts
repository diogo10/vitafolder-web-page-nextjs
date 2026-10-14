import { z } from "zod";

export const faqLocaleSchema = z.enum(["en", "pt"]);

export type FaqLocale = z.infer<typeof faqLocaleSchema>;

// Mirrors the DB CHECK (char_length(btrim(...)) > 0): reject whitespace-only
// strings without mutating the stored value (e.g. markdown padding).
const nonBlank = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, { message: "Must not be blank" });

export const faqSchema = z.object({
  id: z.string().uuid(),
  slug: nonBlank,
  locale: faqLocaleSchema,
  category_slug: nonBlank,
  category_title: nonBlank,
  question: nonBlank,
  answer_markdown: nonBlank,
  sort_order: z.number().int(),
});

export type Faq = z.infer<typeof faqSchema>;

export const faqsResponseSchema = z.array(faqSchema);

type SupportSearchParamsLike =
  Record<string, string | string[] | undefined> | { get: (key: string) => string | null };

/**
 * Resolve the FAQ locale from URL search params.
 * Unknown or missing values fall back to "en" so the page never 500s
 * on a bad `?locale=` value.
 */
export function resolveSupportLocale(
  searchParams: URLSearchParams | SupportSearchParamsLike | undefined | null
): FaqLocale {
  let raw: string | null | undefined;
  if (!searchParams) {
    raw = undefined;
  } else if (
    typeof searchParams === "object" &&
    "get" in searchParams &&
    typeof (searchParams as { get: unknown }).get === "function"
  ) {
    raw = (searchParams as { get: (key: string) => string | null }).get("locale");
  } else {
    const record = searchParams as Record<string, string | string[] | undefined>;
    const value = record["locale"];
    raw = Array.isArray(value) ? value[0] : value;
  }
  const parsed = faqLocaleSchema.safeParse(raw);
  return parsed.success ? parsed.data : "en";
}
