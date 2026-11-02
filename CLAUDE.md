# Real Estate App

Full-stack rental apartment platform. Tenants search properties on a map, favorite them, apply, and track leases and payments. Managers list properties with photos, review applications, and manage leases.

This project is a production-grade rebuild of the tutorial repository `ed-roh/real-estate-prod`, re-implemented sub-feature by sub-feature on current LTS/stable versions. It is a production project: no shortcuts, no mock data outside seeds, no disabled checks.

## Repository layout

```
client/            Next.js App Router frontend
server/            Express API + Prisma (PostgreSQL + PostGIS)
docs/features/     Feature docs; the single source of truth for what to build next
.claude/skills/    Project skills (workflow automation)
.upstream/         Read-only clone of the tutorial repo (gitignored, reference only)
```

`client/CLAUDE.md` and `server/CLAUDE.md` hold package-specific rules. Read them before touching that package.

## Workflow

1. Open [docs/features/real-estate-app.md](docs/features/real-estate-app.md) and pick the first sub-feature whose status is not `done`.
2. Run the `implement-subfeature` skill. It diffs the matching upstream commit, ports it to our stack and conventions, and verifies.
3. Upstream code is a reference for behaviour, never for versions or patterns. When upstream conflicts with this file, this file wins. Record every intentional deviation in the sub-feature's "Deviations" list.
4. Finish with `verify` (lint, typecheck, test in both packages). A sub-feature is `done` only when verify passes.
5. Update the sub-feature status and checklist in the feature doc.
6. Commit only when the user asks. Messages are short and imperative, with no attribution lines.

If `.upstream/` is missing, restore it with `git clone https://github.com/ed-roh/real-estate-prod.git .upstream/real-estate-prod`.

## Tech stack and versions

Always use the latest stable (non-RC, non-beta) release, and the Active LTS for runtimes. Before adding a dependency, check its latest stable version with `npm view <pkg> dist-tags` and its peer ranges. Never trust the `latest` tag blindly.

| Area | Choice | Version line |
| --- | --- | --- |
| Runtime | Node.js Active LTS (`.nvmrc`) | 26.x |
| Package manager | npm (one lockfile per package) | 11.x |
| Language | TypeScript | `~6.0.x` (typescript-eslint supports `<6.1.0`, so 7.x is not usable yet) |
| Frontend | Next.js App Router, React | 16.x, 19.x |
| Styling | Tailwind CSS (CSS-first config), shadcn/ui, tw-animate-css | 4.x |
| State and data | Redux Toolkit + RTK Query, react-redux | 2.x, 9.x |
| Forms | React Hook Form + Zod via @hookform/resolvers | 7.x, 4.x |
| Animation | motion (`motion/react`) | latest |
| Maps | mapbox-gl | 3.x |
| Auth | AWS Cognito via aws-amplify + @aws-amplify/ui-react; server verifies with aws-jwt-verify | 6.x |
| Backend | Express | 5.x |
| ORM | Prisma with the PostgreSQL driver adapter | 7.x stable (not 8 RC) |
| Database | PostgreSQL + PostGIS (local: Docker `imresamu/postgis`) | 18, 3.6 |
| Storage | AWS S3 via @aws-sdk/client-s3 + @aws-sdk/lib-storage | 3.x |
| Lint and format | ESLint flat config, typescript-eslint, Prettier | 9.x (eslint-config-next plugins do not support 10 yet), 8.x, 3.x |
| Tests | Vitest (+ Testing Library on the client) | latest |

Use npm CLI commands (`npm install`, `npm pkg set`, `npm uninstall`) to change `package.json`. Never edit it by hand unless no command exists.

## Commands

Run these inside `client/` or `server/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start in development |
| `npm run build` | Production build |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest, single run |
| `npm run format` | Prettier write |

Server only: `npm run db:up`, `npm run test:integration`, `npm run prisma:migrate`, `npm run prisma:check`, `npm run seed` (see `server/CLAUDE.md`). The local database runs in Docker, so Docker Desktop must be running.

## Conventions (both packages)

### Code style
- Prettier is authoritative: double quotes, semicolons, trailing commas, 2-space indent, 100 columns.
- TypeScript `strict` mode. No `any`; use `unknown` and narrow it. Use `import type` for type-only imports.
- Use named exports for modules. Default exports only where the framework requires them (Next.js pages, layouts, configs).
- Never disable lint rules without explicit user approval.
- Write comments only for non-obvious intent. No TODOs, no commented-out code, no task notes.

### Naming
- React components: `PascalCase.tsx`. Hooks: `use-thing.ts` exporting `useThing` (the shadcn convention). Other modules: `camelCase.ts`.
- Domain enums are `as const` objects with a same-named union type (see `client/src/lib/constants.ts`), never TypeScript `enum`.
- Constants: `SCREAMING_SNAKE_CASE` for primitives, `camelCase` for config objects.
- Types and interfaces: `PascalCase`, without an `I` prefix.

### Where things live
- Constants: `client/src/lib/constants.ts` and `server/src/config/constants.ts`. No magic strings or numbers inline.
- Zod schemas: `client/src/lib/schemas.ts`, and server request schemas next to the route that uses them.
- Environment variables are read in exactly one module per package (`src/lib/env.ts` on the client, `src/config/env.ts` on the server). It parses them with Zod and fails fast. Use no fallback defaults unless the user approves one. Never invent a variable: every key must appear in that package's `.env.example`.
- Shared domain types: `client/src/types/`.

### Architecture
- Server: `routes → controllers → services → Prisma`. Routes wire middleware and validation. Controllers translate HTTP to and from service calls. Services hold the business logic and data access. Controllers never import Prisma.
- Client: pages compose feature components. Data fetching goes only through RTK Query endpoints in `src/state/api.ts`. UI state lives in Redux slices. Components never call `fetch` directly.

### Security (production)
- Verify every Cognito JWT signature, issuer, audience and expiry with `aws-jwt-verify`. Never `jwt.decode` for authorization.
- Validate all request input with Zod at the route boundary.
- Never commit secrets. `.env*` is gitignored except `.env.example`.

### Testing
- Unit tests sit next to the code as `*.test.ts(x)`.
- Every service and every non-trivial util or hook gets tests. Bug fixes come with a regression test.

## Available Claude tooling
- Project skills: `implement-subfeature`, `verify` (in `.claude/skills/`).
- Prisma's official skills (from `prisma/skills`, MIT): `prisma-cli`, `prisma-client-api`, `prisma-upgrade-v7`. `prisma-orm-setup` is intentionally not installed, because it defaults new apps to Prisma 8.
- Plugin skills to load when relevant: `vercel:nextjs`, `vercel:shadcn`, `vercel:react-best-practices`, `vercel:turbopack`.
