# Client (Next.js)

Read the root `CLAUDE.md` first. This file adds the frontend-specific rules.

@AGENTS.md

## Structure

```
src/app/(nondashboard)/   Public pages: landing, search, property details
src/app/(dashboard)/      Authenticated areas: tenants/*, managers/*
src/app/(auth)/           /signin and /signup with the Amplify Authenticator (_components/AuthForm.tsx)
src/app/(dashboard)/_components/  DashboardShell (auth and role guard, sidebar), ProfileSettings
src/app/providers.tsx     Client providers: Redux, Amplify Authenticator.Provider, tooltips, toasts
src/components/ui/        shadcn generated primitives
src/components/           Shared app components (Navbar, AppSidebar, Card, FormField, ...)
src/state/                store.ts (store + typed hooks), StoreProvider.tsx, api.ts (RTK Query), slices
src/lib/                  constants.ts, schemas.ts, utils.ts, env.ts, amplify.ts
src/test-utils/           Shared test helpers (auth user fixtures)
src/hooks/                Reusable hooks
src/types/index.ts        Domain types mirroring the API responses
public/                   Static images
```

Components used by a single route live in that route folder (for example `search/FiltersBar.tsx`). When the folder would otherwise become a URL segment, use a private folder (`_landing/`). Move a component to `src/components/` only when a second route needs it.

## Rules

- Server Components by default. Add `"use client"` only for state, effects, browser APIs, Redux, Amplify or Mapbox.
- Add shadcn primitives with `npx shadcn@latest add <name>` (style `radix-nova`, Radix primitives, `cn` package). Do not hand-edit `components/ui/*` beyond what a sub-feature explicitly requires, and record any such edit as a deviation. `components/ui/` is excluded from Prettier so regenerated files diff cleanly.
- Tailwind v4: theme tokens live in `src/app/globals.css` (`@theme inline` for shadcn tokens, `@theme` for the `primary-*` and `secondary-*` brand scales). There is no `tailwind.config.ts`. Use the `cn()` helper from `lib/utils.ts` for conditional classes.
- Animations import from `motion/react`, not `framer-motion`.
- Images use `next/image`: `preload` (not the deprecated `priority`) for the LCP image, `sizes` on every `fill` image, and `alt=""` for decorative images. Every remote host is listed in `next.config.ts` `images.remotePatterns`.
- Cache Components is on (`cacheComponents: true`). `new Date()`, `Date.now()`, `Math.random()` and `crypto.randomUUID()` fail the prerender, in Client Components too. Wrap them in a `"use cache"` component with `cacheLife`, or read them at request time behind `<Suspense>` + `connection()`. In unit tests, mock cached async Server Components (see `(nondashboard)/page.test.tsx`).
- Next 16: request interception goes in `src/proxy.ts`, not `middleware.ts`. Linting runs the ESLint CLI, not `next lint`. `typecheck` runs `next typegen` first, because `LayoutProps` and `PageProps` are generated globals.
- Forms: React Hook Form + `zodResolver` with schemas from `lib/schemas.ts`, rendered with the shadcn `field` primitives through RHF `Controller`. The old shadcn `form` component is deprecated; don't use it. Reuse `components/FormField.tsx` once it exists (F4).
- Public env vars must start with `NEXT_PUBLIC_` and are only read through `lib/env.ts`, each referenced statically so Next can inline it. Vitest provides test values in `vitest.config.mts`.
- Auth: read the session with `useAuthUser()` (`hooks/use-auth-user.ts`). It combines Amplify's `authStatus` with `getAuthUser` and skips the API call until Amplify reports `authenticated`. API requests carry the Cognito ID token from `prepareHeaders`. Role-based paths live in `lib/constants.ts` (`DASHBOARD_HOME`, `DASHBOARD_PREFIX`, `SETTINGS_PATH`). Redirect targets from the URL go through `safeRedirectPath`.
- Tests that hit RTK Query through `fetch` run in the node environment (`// @vitest-environment node`), because jsdom's `AbortSignal` is incompatible with Node's `Request`.
