# HouseMira

Family home management web app (Next.js). HouseMira brings your calendar, reminders, and shared lists into one calm, private space — so everyone stays in the loop without the chaos.

Live site: [https://housemira.com](https://housemira.com)

## Pages

| Route            | Live URL                                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`              | [https://housemira.com](https://housemira.com)                                                                                                                                                        | Marketing landing page. Hero with phone mockup, feature grid (Smart Reminders, Shared Calendar, Private Family Circles), How It Works, CTA, Footer.                                                                                                                                  |
| `/join-family`   | [https://housemira.com/join-family](https://housemira.com/join-family) — try with demo code: [https://housemira.com/join-family?code=FAMILY-1234](https://housemira.com/join-family?code=FAMILY-1234) | Invite acceptance flow. Reads optional `code`/`inviteCode` and `email` search params, validates input with Zod (`email` + optional `inviteCode`), and submits via a Server Action. Has dedicated `loading.tsx` / `error.tsx`.                                                        |
| `/invite-family` | [https://housemira.com/invite-family](https://housemira.com/invite-family)                                                                                                                            | Invite sending flow. `InviteFamilyForm` collects `to`, `locale`, `inviterName`, `familyName`, `inviteCode` and submits via the `sendInviteAction` Server Action, which POSTs the payload to the Supabase `resend-email-v1` Edge Function. Has dedicated `loading.tsx` / `error.tsx`. |
| `/privacy`       | [https://housemira.com/privacy](https://housemira.com/privacy)                                                                                                                                        | Privacy Policy page. Shared landing `Header`/`Footer` plus `PrivacyContent` (content from `src/features/privacy/lib/content.ts`).                                                                                                                                                    |
| `/terms`         | [https://housemira.com/terms](https://housemira.com/terms)                                                                                                                                            | Terms and Conditions page. Shared landing `Header`/`Footer` plus `TermsContent` (content from `src/features/terms/lib/content.ts`).                                                                                                                                                  |

Redirects (see `next.config.ts`): `/notes`, `/notes/:path*`, `/pricing`, `/pricing/:path*` → `/` (permanent). Shared Notes was sunset (PR #14) and the pricing page was removed, so stale bookmarks/crawlers land on home instead of a 404.

Every async route group ships `loading.tsx` + `error.tsx` (root + `join-family` + `invite-family`).

## Tech stack

| Tool / Framework         | Version (pinned in `package.json` / env)                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js (App Router)     | `15.5.25` (`eslint-config-next` matches)                                                                                                   |
| React / React DOM        | `19.1.0`                                                                                                                                   |
| TypeScript               | `^5` (strict, `5.9.3` installed)                                                                                                           |
| Node.js / npm            | Node `22` (devcontainer, `22.16.0` verified), npm `10.9.2`                                                                                 |
| Tailwind CSS             | `^4` + `@tailwindcss/postcss`                                                                                                              |
| Validation               | Zod `^3.24.2`                                                                                                                              |
| Classnames               | `clsx ^2.1.1` + `tailwind-merge ^3.0.2` (`cn()` in `src/lib/utils.ts`)                                                                     |
| Unit / integration tests | Vitest `^3.0.5`, `@vitest/coverage-v8 ^3.0.5`, jsdom `^25.0.1`, Testing Library React `^16.1.0` / user-event `^14.5.2` / jest-dom `^6.6.3` |
| E2E tests                | Playwright `^1.49.1` (Chromium only, `e2e/*.spec.ts`)                                                                                      |
| Lint / format            | ESLint `^9` (`next/core-web-vitals` + `@typescript-eslint`, zero-warnings policy), Prettier `^3.4.2`                                       |
| Devcontainer             | `.devcontainer/Dockerfile` (Node 22 image, port `3000`)                                                                                    |

Rendering: Server Components by default; `"use client"` only on interactive leaves (e.g. `Reveal`, join-family form). Mutations go through Server Actions with Zod validation + `revalidatePath()` where applicable.

## Project structure

```text
app/                 # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx
src/components/      # shared UI (PascalCase.tsx, co-located *.test.tsx)
  landing/           # Header, Hero, Features, HowItWorks, CtaSection, Footer, PhoneMockup, Logo, Reveal
  SiteHeader.tsx     # shared invitation-system header (join + invite pages)
  SiteFooter.tsx     # shared invitation-system footer (join + invite pages)
src/features/<name>/ # feature slice: components/, hooks/, lib/, schemas.ts, actions.ts
  join-family/       # JoinFamilyForm (+ Server Action), schemas, invite-code helpers
  invite-family/     # InviteFamilyForm + sendInviteAction Server Action + resend-email-v1 Edge Function client
  privacy/           # PrivacyContent + lib/content.ts
  terms/             # TermsContent + lib/content.ts
src/lib/             # env.ts (Zod-validated env), utils.ts (cn(), formatDate)
public/              # static assets
e2e/                 # Playwright specs (home, join-family, privacy, terms)
```

Rules (from `AGENTS.md`): keep routes thin, business logic in `src/features/<name>/` or `src/lib/`; one component per file; `@/*` alias maps to `src/*` (never deep `../../../` imports); `strict: true` with `noUnusedLocals`/`noUnusedParameters`, no `any` (use `unknown` + narrowing), prefer `type` over `interface`; validate external input and env with Zod (`src/lib/env.ts`, never `process.env` inline); use `next/link`, `next/image` (always `alt` + size), `next/font`; export `metadata`/`generateMetadata` per route, no manual `<head>`; Tailwind + `cn()` mobile-first, no inline `style` unless dynamic, global CSS only in `app/globals.css`.

## Getting started

```bash
npm install
cp .env.example .env.local  # fill in values; never commit .env.local
npm run dev                 # http://localhost:3000
```

Env vars (see `.env.example`, validated in `src/lib/env.ts`):

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRIVACY_EMAIL=privacy@housemira.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=[YOUR_ENV_KEY]
SUPABASE_INVITE_FUNCTION_NAME=resend-email-v1
SUPABASE_JOIN_FUNCTION_NAME=join-family-v1
# Shared secret for join-family-v1 trusted-backend mode (server-only,
# sent as x-join-secret; must match the secret configured on the function).
JOIN_FAMILY_SHARED_SECRET=[YOUR_JOIN_SECRET]
TURNSTILE_SECRET_KEY=[YOUR_TURNSTILE_SECRET]
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR_UPSTASH_TOKEN]
```

`SUPABASE_URL` is required with no default: the app fails fast at startup
with a clear message when it is missing, instead of silently targeting a
hardcoded project. Empty strings are treated as unset
(`src/lib/env.ts`). `SUPABASE_ANON_KEY` is optional at startup but required
to actually send invites — without it the invite Server Action returns the
generic `Could not send invite. Try again.` error before any network call
(the missing-key detail is logged server-side with `console.error` only).

## Invite email authorization & abuse protection

Sending email is an abuse vector, so the `/invite-family` flow is layered:

- **Single public action, no client-controlled overrides.**
  `sendInviteAction` (`src/features/invite-family/actions.ts`) is the only
  exported Server Action and takes a single `input` argument. Rate-limit key
  injection and Turnstile stubs live in the non-`"use server"` core
  (`src/features/invite-family/lib/invite-action-core.ts`), which clients
  cannot invoke — so attackers cannot pass a rotating `rateLimitKey` to
  evade IP limiting.
- **Bot gate (Turnstile) with production fail-closed.** When
  `TURNSTILE_SECRET_KEY` is set, the action requires a valid Cloudflare
  Turnstile token (verified server-side in
  `src/features/invite-family/lib/verify-turnstile.ts`) before sending.
  When no secret is configured, the action fails closed in production
  (generic error, server-side `console.error`) and only sends in dev/test.
  Do not expose the form publicly until Turnstile (or app-level session
  auth) is enforced.
- **Authorization boundary = the Supabase `resend-email-v1` Edge Function.**
  The anon key sent as `Authorization: Bearer` + `apikey` headers is a public
  client identifier, not a secrecy boundary. The Edge Function itself MUST
  verify the caller's Supabase JWT (service-role check / allowlisted sender)
  and enforce its own rate limits; otherwise anyone who learns the endpoint
  can send email through it. This app has no session/auth yet — once app-level
  auth lands, `sendInviteAction`
  (`src/features/invite-family/actions.ts`) must additionally require a valid
  session and fail closed (generic error) when there is none.
- **Honeypot:** the form renders a hidden `website` input that humans never
  fill. Submissions with a filled honeypot get a fake success and never reach
  the Edge Function.
- **Rate limiting:** a 5 requests/minute per-sender limiter gates the Server
  Action. When `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set,
  counts live in shared Redis (`src/features/invite-family/lib/rate-limit-store.ts`)
  so every instance enforces one budget (required for serverless /
  multi-instance). When they are unset, the limiter is in-memory
  (`src/features/invite-family/lib/rate-limit.ts`) and explicitly scoped to
  a **single-instance low-risk rollout only** — do not run public
  multi-instance / serverless traffic on the memory limiter. `x-forwarded-for` trust boundary:
  this header is client-controlled and can be spoofed, so only trust it when
  the hosting platform / reverse proxy overwrites it (e.g. Vercel, Fly, or an
  NGINX `proxy_set_header X-Forwarded-For $remote_addr` setup). Do not trust
  a pass-through value from an untrusted proxy. When no IP can be resolved
  the action fails closed (generic rate-limit error) instead of sharing a
  global bucket.
- **Error hygiene:** Edge Function status/detail is logged server-side with
  `console.error` (truncated to 500 chars) and never surfaced — clients only
  receive `Could not send invite. Try again.` (including when
  `SUPABASE_ANON_KEY` is missing; the missing-key detail is logged
  server-side only). The form also catches Server Action throws and shows
  the same generic message instead of hanging.
- **Localization:** invite UI copy lives in
  `src/features/invite-family/lib/strings.ts` (`en`/`pt`/`es`, matching the
  `locale` field). The form and page render from that dictionary — no
  hardcoded display strings.
- **Shared chrome:** the invite and join pages share `SiteHeader`/`SiteFooter`
  from `src/components/` (the old `JoinHeader`/`JoinFooter` are thin
  re-exports). No cross-feature component imports in routes.
- **Before enabling publicly:** prove `resend-email-v1` rejects
  unauthenticated calls (Supabase JWT verification / allowlisted sender plus
  a server-side rate limit on the Edge Function itself) with the live negative
  test, and gate `sendInviteAction` behind Turnstile verification first. Do not expose the form publicly on anon-key auth alone.
  ```bash
  RUN_LIVE_EDGE_TESTS=1 SUPABASE_URL=https://your-project.supabase.co \
    SUPABASE_ANON_KEY=<anon-key> SUPABASE_INVITE_FUNCTION_NAME=resend-email-v1 \
    npx vitest run src/features/invite-family/lib/edge-auth-negative.live.test.ts
  ```
  If that spec fails (edge returns 200 for anon-key-only calls or never 429s
  under burst), keep `/invite-family` internal until the Edge Function is hardened.

## Commands

```bash
npm run dev        # dev server :3000 (next dev --turbopack)
npm run build      # production build (must pass before PR)
npm start          # serve production build
npm run lint       # eslint . — must pass, zero warnings
npm run lint:fix   # eslint . --fix
npm run format     # prettier --write .  (check: prettier --check . / format:check)
npm run typecheck  # tsc --noEmit — must pass
npm run test       # vitest run (unit/integration)
npm run test:watch # vitest (local)
npm run test:cov   # vitest run --coverage (thresholds: 80% lines/functions/branches)
npm run e2e        # playwright test (runs against npm run start on :3000)
```

After any code change, run in order: `lint` → `typecheck` → `test`. For route/layout changes also verify `npm run build`. If a script is missing, add it to `package.json` instead of inventing a new command.

## Testing

- Unit/integration: Vitest (jsdom) + Testing Library + user-event. Co-located `*.test.tsx` next to source, `src/lib/*.test.ts` for utils. Query by role/label (`getByRole`, `getByLabelText`); mock server boundaries (`fetch`, Server Actions), not internals. Required coverage: pure utils, Server Actions (happy path + Zod rejection + auth), critical UI states (loading/empty/error). Coverage thresholds: 80% lines/functions/branches.
- E2E: specs in `e2e/*.spec.ts` (home, join-family, invite-family, privacy, terms) run against `npm run build && npm start` in CI. Never hit real third-party APIs — seed local data or mock.

## Contributing

- Branch from `main`, small focused diffs. Conventional Commits (`feat:`, `fix:`, `chore:`).
- Never commit `.env`, `.env.local`, `node_modules`, `.next`, `coverage`. Update `.env.example` when adding env vars.
- PR description: what changed, how to test (`npm run ...`), screenshots for UI.
