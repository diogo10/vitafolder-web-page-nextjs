import { env } from "@/lib/env";
import { faqsResponseSchema, type Faq, type FaqLocale } from "../schemas";

const FAQ_SELECT =
  "id,slug,locale,category_slug,category_title,question,answer_markdown,sort_order";

const FAQ_FETCH_TIMEOUT_MS = 10_000;

export type FetchFaqsOptions = {
  locale?: FaqLocale;
  fetchFn?: typeof fetch;
  baseUrl?: string;
  anonKey?: string;
};

type FetchInitWithRevalidate = RequestInit & {
  next?: { revalidate?: number };
};

/**
 * Build the PostgREST endpoint for the public `faqs` table.
 * Documented ordering is (sort_order, slug); filtering is by locale.
 */
export function getFaqsEndpoint(
  baseUrl: string = env.SUPABASE_URL,
  locale: FaqLocale = "en"
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const params = new URLSearchParams({
    select: FAQ_SELECT,
    locale: `eq.${locale}`,
    order: "sort_order.asc,slug.asc",
  });
  return `${normalizedBaseUrl}/rest/v1/faqs?${params.toString()}`;
}

/**
 * Fetch published FAQs for a locale from Supabase PostgREST.
 *
 * Auth contract: the anon key is sent as both `Authorization: Bearer`
 * and `apikey`, same as the invite Edge Function. The `faqs` table
 * grants SELECT to anon/authenticated via RLS (`faqs_select_public`).
 *
 * Error contract: throws a generic Error safe to render in `error.tsx`.
 * Backend status/detail is logged server-side and never surfaced.
 */
export async function fetchFaqs(options: FetchFaqsOptions = {}): Promise<Faq[]> {
  const locale = options.locale ?? "en";
  const baseUrl = options.baseUrl ?? env.SUPABASE_URL;
  const anonKey = options.anonKey ?? env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    console.error("[support] missing SUPABASE_ANON_KEY — FAQ service not configured.");
    throw new Error("Could not load FAQs. Try again.");
  }

  const endpoint = getFaqsEndpoint(baseUrl, locale);
  const fetchFn = options.fetchFn ?? fetch;

  let response: Response;
  try {
    const init: FetchInitWithRevalidate = {
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(FAQ_FETCH_TIMEOUT_MS),
      next: { revalidate: 3600 },
    };
    response = await fetchFn(endpoint, init);
  } catch {
    throw new Error("Could not reach the FAQ service. Try again.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      detail = "";
    }
    console.error(
      `[support] FAQ fetch error: status=${response.status} detail=${detail.slice(0, 500)}`
    );
    throw new Error("Could not load FAQs. Try again.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    console.error("[support] FAQ fetch error: response was not valid JSON.");
    throw new Error("Could not load FAQs. Try again.");
  }

  const parsed = faqsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("[support] FAQ fetch error: response failed validation.");
    throw new Error("Could not load FAQs. Try again.");
  }
  return parsed.data;
}
