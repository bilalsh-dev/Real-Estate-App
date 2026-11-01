# Client (Next.js)

Read the root `CLAUDE.md` first. This file adds the frontend-specific rules.

@AGENTS.md

## Structure

```
src/app/(nondashboard)/   Public pages: landing, search, property details
src/app/(dashboard)/      Authenticated areas: tenants/*, managers/*
src/app/(auth)/           Amplify Authenticator provider and auth routing
src/app/providers.tsx     Client providers: Redux, tooltips, toasts
src/components/ui/        shadcn generated primitives
src/components/           Shared app components (Navbar, AppSidebar, Card, FormField, ...)
src/state/                store.ts (store + typed hooks), StoreProvider.tsx, api.ts (RTK Query), slices
src/lib/                  constants.ts, schemas.ts, utils.ts, env.ts
src/hooks/                Reusable hooks
src/types/index.ts        Domain types mirroring the API responses
public/                   Static images
```

Components used by a single route live in that route folder (for example `search/FiltersBar.tsx`). Move one to `src/components/` only when a second route needs it.

## Rules

- Server Components by default. Add `"use client"` only for state, effects, browser APIs, Redux, Amplify or Mapbox.
- Add shadcn primitives with `npx shadcn@latest add <name>` (style `radix-nova`, Radix primitives, `cn` package). Do not hand-edit `components/ui/*` beyond what a sub-feature explicitly requires, and record any such edit as a deviation. `components/ui/` is excluded from Prettier so regenerated files diff cleanly.
- Tailwind v4: theme tokens live in `src/app/globals.css` (`@theme inline` for shadcn tokens, `@theme` for the `primary-*` and `secondary-*` brand scales). There is no `tailwind.config.ts`. Use the `cn()` helper from `lib/utils.ts` for conditional classes.
- Animations import from `motion/react`, not `framer-motion`.
- Images use `next/image`. Every remote host is listed in `next.config.ts` `images.remotePatterns`.
- Next 16: request interception goes in `src/proxy.ts`, not `middleware.ts`. Linting runs the ESLint CLI, not `next lint`. `typecheck` runs `next typegen` first, because `LayoutProps` and `PageProps` are generated globals.
- Forms: React Hook Form + `zodResolver` with schemas from `lib/schemas.ts`, rendered with the shadcn `field` primitives through RHF `Controller`. The old shadcn `form` component is deprecated; don't use it. Reuse `components/FormField.tsx` once it exists (F4).
- Public env vars must start with `NEXT_PUBLIC_` and are only read through `lib/env.ts`, each referenced statically so Next can inline it. Vitest provides test values in `vitest.config.mts`.
