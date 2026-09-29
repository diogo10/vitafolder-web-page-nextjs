# AGENTS.md — HouseMira (Next.js App Router + TypeScript)

## Stack

- Next.js 14/15 (App Router), React 18/19, TypeScript (strict), Node 22, npm
- Styling: Tailwind CSS. Validation: Zod. Tests: Vitest + Testing Library + Playwright
- Devcontainer: `.devcontainer/Dockerfile`, port 3000

## Commands

```bash
npm run dev        # dev server :3000
npm run build      # production build (must pass before PR)
npm start          # serve production build
npm run lint       # next lint / eslint .  — must pass
npm run lint:fix   # eslint . --fix
npm run format     # prettier --write .  (check: prettier --check .)
npm run typecheck  # tsc --noEmit — must pass
npm run test       # vitest run (unit/integration)
npm run test:watch # vitest (local)
npm run test:cov   # vitest run --coverage (thresholds: 80% lines/functions/branches)
npm run e2e        # playwright test
```

If scripts are missing, add them to `package.json` instead of inventing new commands.
After any code change, run in order: `lint` → `typecheck` → `test`. Fix failures before finishing.

## Structure

```
app/                 # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx, route.ts
  (marketing)/       # route groups for organization, not URL
src/components/      # shared UI (PascalCase.tsx, co-located *.test.tsx)
src/features/<name>/ # feature slice: components/, hooks/, lib/, schemas.ts, actions.ts
src/lib/             # env.ts, db.ts, utils.ts (cn(), formatDate)
src/hooks/           # shared hooks
public/              # static assets
e2e/                 # playwright specs (*.spec.ts)
```

- Keep routes thin. Business logic lives in `src/features/<name>/` or `src/lib/`.
- One component per file. Co-locate tests: `Button.tsx` + `Button.test.tsx`.
- Use `@/*` alias (maps to `src/*`). Never use deep relative imports (`../../../`).

## TypeScript

- `strict: true`. No `any` (use `unknown` + narrowing). Prefer `type` over `interface` for props/unions.
- Validate all external input at the boundary with Zod (`src/features/<name>/schemas.ts`).
- Validate env once in `src/lib/env.ts` (Zod + `process.env`); import from there, never `process.env` inline.

## React / Next.js rules

- Server Components by default. Add `"use client"` only for interactivity (state, effects, browser APIs). Never add it to `layout.tsx` or whole pages to "fix" an error — push client code to a leaf component.
- Data fetching: `async` Server Components + `fetch` (with `next: { revalidate }`) or Server Actions (`"use server"`). No ad-hoc Express servers, no `getServerSideProps` (Pages Router API).
- Mutations: Server Actions with Zod validation + `revalidatePath()`. Handle loading/error via `useActionState` / `loading.tsx` / `error.tsx`.
- Routing: use `next/link`, `next/image` (always `alt`, `width/height` or `fill`), `next/font`. Never raw `<a href="/...">` for internal nav or `<img>` for optimized images.
- Metadata: export `metadata` / `generateMetadata` per route. No manual `<head>` tags.
- Errors: every async route group needs `loading.tsx` + `error.tsx`. Never swallow promise rejections.
- Perf: avoid client-side waterfalls; parallelize with `Promise.all`. Keep client bundles small — no Node-only imports in client components.

## Styling

- Tailwind + `cn()` (`clsx` + `tailwind-merge`) for conditional classes.
- Mobile-first responsive. No inline `style={{}}` unless dynamic. No new global CSS files — use `app/globals.css` only.

## Lint / Format

- ESLint: `next/core-web-vitals` + `@typescript-eslint`. Zero warnings policy. Fix with `npm run lint:fix`, never disable rules inline without justification comment.
- Prettier: default config, check with `prettier --check .`. Format on save expected.
- Import order: `next/*` → external → `@/*` → relative. Unused imports/vars are errors (`tsc --noEmit` + `noUnusedLocals`).

## Testing

### Unit / integration (Vitest + Testing Library)

- Framework: `vitest` (jsdom), `@testing-library/react`, `@testing-library/user-event`, `msw` for network mocks.
- Location: co-located `*.test.tsx` next to source, `src/lib/*.test.ts` for utils.
- Rules:
  - Test behavior, not implementation: query by role/label (`getByRole`, `getByLabelText`), never by class or test-id unless necessary.
  - Mock server boundaries (`fetch`, Server Actions), not internals.
  - Required coverage: pure utils (`cn`, formatters, schemas), Server Actions (happy path + Zod rejection + auth), critical UI states (loading/empty/error).
- Example:
  ```tsx
  // src/components/Button.test.tsx
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { Button } from "./Button";

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  ```

### E2E (Playwright)

- Specs in `e2e/*.spec.ts`, run against `npm run build && npm start` in CI.
- Cover: smoke (homepage loads), critical flows (signup/checkout), 404/500 paths.
- Never hit real third-party APIs in E2E — seed local data or mock.

### Before marking done

1. `npm run lint` clean
2. `npm run typecheck` clean
3. `npm run test` green (or `test:cov` meets thresholds)
4. `npm run build` succeeds for route/layout changes

## Git / PRs

- Branch from `main`, small focused diffs. Conventional Commits (`feat:`, `fix:`, `chore:`).
- Never commit `.env`, `node_modules`, `.next`, `coverage`. Update `.env.example` when adding env vars.
- PR description: what changed, how to test (`npm run ...`), screenshots for UI.
