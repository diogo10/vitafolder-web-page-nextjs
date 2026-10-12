# HouseMira

Family home management web app (Next.js). HouseMira brings your calendar, reminders, and shared lists into one calm, private space — so everyone stays in the loop without the chaos.

## Pages

| Route          | Description                                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | Marketing landing page. Hero with demo modal and phone mockup, feature grid (Smart Reminders, Shared Calendar, Private Family Circles), How It Works, CTA, Footer.                                                            |
| `/join-family` | Invite acceptance flow. Reads optional `code`/`inviteCode` and `email` search params, validates input with Zod (`email` + optional `inviteCode`), and submits via a Server Action. Has dedicated `loading.tsx` / `error.tsx`. |
| `/privacy`     | Privacy Policy page. Shared landing `Header`/`Footer` plus `PrivacyContent` (content from `src/features/privacy/lib/content.ts`).                                                                                             |
| `/terms`       | Terms and Conditions page. Shared landing `Header`/`Footer` plus `TermsContent` (content from `src/features/terms/lib/content.ts`).                                                                                           |

Redirects (see `next.config.ts`): `/notes`, `/notes/:path*`, `/pricing`, `/pricing/:path*` → `/` (permanent). Shared Notes was sunset (PR #14) and the pricing page was removed, so stale bookmarks/crawlers land on home instead of a 404.

Every async route group ships `loading.tsx` + `error.tsx` (root + `join-family`).

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

Rendering: Server Components by default; `"use client"` only on interactive leaves (e.g. `DemoModal`, `Reveal`, join-family form). Mutations go through Server Actions with Zod validation + `revalidatePath()` where applicable.

## Project structure

```text
app/                 # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx
src/components/      # shared UI (PascalCase.tsx, co-located *.test.tsx)
  landing/           # Header, Hero, Features, HowItWorks, CtaSection, Footer, DemoModal, PhoneMockup, Logo, Reveal
src/features/<name>/ # feature slice: components/, hooks/, lib/, schemas.ts, actions.ts
  join-family/       # JoinFamilyForm (+ Server Action), schemas, invite-code helpers, Join* layout components
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
```

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
- E2E: specs in `e2e/*.spec.ts` (home, join-family, privacy, terms) run against `npm run build && npm start` in CI. Never hit real third-party APIs — seed local data or mock.

## Contributing

- Branch from `main`, small focused diffs. Conventional Commits (`feat:`, `fix:`, `chore:`).
- Never commit `.env`, `.env.local`, `node_modules`, `.next`, `coverage`. Update `.env.example` when adding env vars.
- PR description: what changed, how to test (`npm run ...`), screenshots for UI.
