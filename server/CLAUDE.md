# Server (Express + Prisma)

Read the root `CLAUDE.md` first. This file adds the backend-specific rules.

## Structure

```
src/index.ts          Starts the HTTP server and handles graceful shutdown (SIGTERM/SIGINT)
src/app.ts            createApp(config, registerRoutes): middleware, routes, 404 and error handler; testable without listen
src/config/           env.ts (Zod-validated env, parseEnv), constants.ts (Role, ROLE_CLAIM)
src/routes/           index.ts (registerApiRoutes(deps)), one router per resource
src/controllers/      HTTP handlers built from injected services; no Prisma imports
src/services/         Business logic and data access, created with an injected Prisma client
src/schemas/          Zod schemas for params, query and body
src/middleware/       errorHandler, auth (createAuthMiddleware, requireUser, assertSelf), validate (withValidation)
src/lib/              prisma.ts (singleton client), errors.ts (HttpError subclasses), tokenVerifier.ts, prismaErrors.ts
src/test-utils/       Test helpers (local JWT signing, DB fixtures, integration setup), excluded from the build
src/generated/prisma/ Generated Prisma client (gitignored, created by `postinstall`)
prisma/               schema.prisma, migrations, seed.ts, seedOrder.ts, seedData/*.json
prisma.config.ts      Prisma 7 config: schema, migrations, seed command, datasource URL
docker-compose.yml    Local PostgreSQL 18 + PostGIS 3.6
```

## Local database

1. `cp .env.example .env` and fill in values. `DATABASE_URL` must use the same `POSTGRES_*` credentials.
2. `npm run db:up` starts PostGIS and waits until it is healthy.
3. `npm run prisma:deploy` applies migrations, and `npm run seed` loads the sample data.

The image is `imresamu/postgis` (multi-arch builds from the official PostGIS image maintainer), because `postgis/postgis` has no arm64 build. Its init scripts are disabled (`tmpfs` over `/docker-entrypoint-initdb.d`), so our migration creates the `postgis` extension itself, exactly as on a fresh RDS database.

## Commands

| Command                                   | Purpose                                                        |
| ----------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                             | `tsx watch` with `.env`                                        |
| `npm run build` / `npm start`             | Compile to `dist/` / run the compiled server                   |
| `npm run prisma:generate`                 | Regenerate the client after schema changes                     |
| `npm run prisma:migrate -- --name <name>` | Create and apply a migration (development)                     |
| `npm run prisma:deploy`                   | Apply pending migrations (CI, production)                      |
| `npm run prisma:check`                    | Fail if migrations are pending or the schema drifted from them |
| `npm run seed`                            | Replace all data with `prisma/seedData` in one transaction     |
| `npm run db:up` / `npm run db:down`       | Start / stop the local database                                |
| `npm run test:integration`                | Service tests against `<db>_test` (needs `db:up`)              |

## Rules

- ESM project (`"type": "module"`). Relative imports use the `.ts` extension; `tsc` rewrites them to `.js` (`rewriteRelativeImportExtensions`). Only erasable TypeScript syntax is allowed (`erasableSyntaxOnly`), so no `enum`, `namespace` or parameter properties.
- Env files load through Node's `--env-file-if-exists` (scripts) and `process.loadEnvFile` (`prisma.config.ts`). There is no `dotenv` dependency.
- Prisma 7: the `prisma-client` generator outputs to `src/generated/prisma`. Import from `../generated/prisma/client.ts`. The client is constructed with the `@prisma/adapter-pg` driver adapter. Use the `prisma-cli` and `prisma-client-api` skills for Prisma work, and `prisma-upgrade-v7` for v7 API questions.
- Express 5 forwards rejected promises from async handlers to the error middleware, so don't wrap handlers in try/catch just to call `next`. Throw `HttpError` subclasses for expected failures. The central error handler shapes every error as `{ message }` and never leaks internal error details.
- Mount routers through `registerApiRoutes(deps)`, passed to `createApp` as `registerRoutes`, so the 404 and error handlers stay last. Dependencies (token verifier, services) are injected there and built in `index.ts`, so tests can swap them.
- Every route that takes input wraps its handler in `withValidation({ params, query, body }, handler)`. The handler receives the parsed, typed values; failures become 400 `{ message, issues: [{ path, message }] }`.
- Role checks use `authorize([Role.Tenant])` from `createAuthMiddleware(verifyToken)`. The verifier checks the Cognito ID token (signature, issuer, audience, expiry). The role comes from the verified `custom:role` claim and `req.user` holds `{ id, role }`.
- Ownership: a route keyed by `:cognitoId` calls `assertSelf(req, cognitoId)`. A create route takes the user's id from `requireUser(req)`, never from the body.
- Map Prisma errors to HTTP errors in services with `hasPrismaErrorCode` (P2002 to 409, P2025 to 404).
- Write geospatial queries (PostGIS) with `prisma.$queryRaw` tagged templates and never with string-concatenated SQL. Keep them inside services.
- Never edit an applied migration. `prisma migrate reset` needs explicit user consent; never bypass Prisma's consent guard.
- Status codes: 200 read/update, 201 create, 204 delete, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found.
- Tests: `*.test.ts` are unit tests with every dependency mocked (`npm test`, no database). `*.int.test.ts` are integration tests that run services against real PostgreSQL + PostGIS (`npm run test:integration`). The test database is derived from `DATABASE_URL` with a `_test` suffix, then created, migrated and truncated per test by `src/test-utils`. Anything that relies on SQL behaviour (raw queries, PostGIS, transactions, relation writes) gets an integration test.
- External services (S3 via `lib/photoStorage.ts`, Nominatim via `lib/geocoder.ts`, Cognito via `lib/tokenVerifier.ts`) sit behind small injected interfaces, created in `index.ts`. Services never construct clients themselves.
