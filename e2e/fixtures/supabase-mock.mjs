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

/**
 * Minimal GoTrue password-grant stand-in for `/login` E2E coverage.
 * The anon key is a public client identifier, so only the test credentials
 * below can ever produce a session.
 */
const E2E_USER = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "ada@example.com",
  password: "e2e-valid-password",
};

const E2E_SIGNUP_USER = {
  id: "55555555-5555-4555-8555-555555555555",
  email: "new-user@example.com",
};

function buildUser({ id, email }) {
  const now = new Date().toISOString();
  return {
    id,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: now,
    phone: "",
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  };
}

function encodeJwt(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function buildAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJwt({ alg: "HS256", typ: "JWT" });
  const payload = encodeJwt({
    aud: "authenticated",
    exp: now + 3600,
    iat: now,
    role: "authenticated",
    sub: E2E_USER.id,
    email: E2E_USER.email,
  });
  return `${header}.${payload}.e2e-signature`;
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function signInResponse() {
  const now = new Date().toISOString();
  return {
    access_token: buildAccessToken(),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "e2e-refresh-token",
    user: {
      id: E2E_USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: E2E_USER.email,
      email_confirmed_at: now,
      phone: "",
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: now,
      updated_at: now,
      is_anonymous: false,
    },
  };
}

function signupResponse(email) {
  return {
    access_token: buildAccessToken(),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "e2e-signup-refresh-token",
    user: buildUser({
      id: E2E_SIGNUP_USER.id,
      email: email || E2E_SIGNUP_USER.email,
    }),
  };
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/auth/v1/token" && request.method === "POST") {
    const payload = await readJsonBody(request);
    if (payload.email === E2E_USER.email && payload.password === E2E_USER.password) {
      sendJson(response, 200, signInResponse());
      return;
    }
    sendJson(response, 400, {
      code: "invalid_credentials",
      error_code: "invalid_credentials",
      message: "Invalid login credentials",
      msg: "Invalid login credentials",
    });
    return;
  }

  if (url.pathname === "/auth/v1/signup" && request.method === "POST") {
    const payload = await readJsonBody(request);
    sendJson(response, 200, signupResponse(payload.email));
    return;
  }

  if (url.pathname === "/auth/v1/user" && request.method === "GET") {
    sendJson(response, 200, { user: buildUser(E2E_SIGNUP_USER) });
    return;
  }

  if (url.pathname === "/auth/v1/logout" && request.method === "POST") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (url.pathname === "/rest/v1/faqs") {
    sendJson(response, 200, selectFaqs(url));
    return;
  }

  sendJson(response, 404, { message: "Not found", details: `mock: no route ${url.pathname}` });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[faq-mock] listening on http://127.0.0.1:${PORT}`);
});
