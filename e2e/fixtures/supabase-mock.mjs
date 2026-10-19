/**
 * Local PostgREST stand-in for the E2E suite.
 *
 * `/support` is a dynamic server component that reads the published FAQs from
 * Supabase over PostgREST. E2E must never call a live third-party API, so
 * this mock serves the same payload shape from a local port; the app reaches
 * it through `SUPABASE_URL` (see `playwright.config.ts`).
 *
 * Only the routes the app actually uses are implemented:
 *   GET /rest/v1/faqs?locale=eq.<locale>&select=...&order=...
 * Anything else answers 404, like PostgREST would for an unknown table.
 */

import { Buffer } from "node:buffer";
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_PORT ?? 3101);

/**
 * Fixture FAQs. They must satisfy `faqSchema` in
 * `src/features/support/schemas.ts` (uuid id, non-blank fields, known locale).
 */
const FAQS = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "reset-password",
    locale: "en",
    category_slug: "account",
    category_title: "Account",
    question: "How do I reset my password?",
    answer_markdown: "Open **Settings** and choose *Reset password*.",
    sort_order: 1,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "invite-family",
    locale: "en",
    category_slug: "family",
    category_title: "Family circles",
    question: "How do I invite my family?",
    answer_markdown: "Open the invitation link you received and enter your email address.",
    sort_order: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "redefinir-senha",
    locale: "pt",
    category_slug: "conta",
    category_title: "Conta",
    question: "Como redefinir a minha senha?",
    answer_markdown: "Abra **Definições** e escolha *Redefinir senha*.",
    sort_order: 1,
  },
];

/** Mirrors the documented ordering: (sort_order, slug). */
function selectFaqs(url) {
  const locale = (url.searchParams.get("locale") ?? "eq.en").replace(/^eq\./, "");
  return FAQS.filter((faq) => faq.locale === locale).sort(
    (a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug)
  );
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/rest/v1/faqs") {
    sendJson(response, 200, selectFaqs(url));
    return;
  }

  sendJson(response, 404, { message: "Not found", details: `mock: no route ${url.pathname}` });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[faq-mock] listening on http://127.0.0.1:${PORT}`);
});
