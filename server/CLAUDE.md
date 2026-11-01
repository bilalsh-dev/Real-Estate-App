# Server (Express + Prisma)

Read the root `CLAUDE.md` first. This file adds the backend-specific rules.

## Structure

```
src/index.ts          Starts the HTTP server and handles graceful shutdown (SIGTERM/SIGINT)
src/app.ts            createApp(config, registerRoutes): middleware, routes, 404 and error handler; testable without listen
src/config/           env.ts (Zod-validated env, parseEnv), constants.ts
src/routes/           One router per resource: tenants, managers, properties, leases, applications
src/controllers/      HTTP handlers; no Prisma imports
src/services/         Business logic and data access
src/middleware/       errorHandler, auth (Cognito JWT verification), validation
src/lib/              prisma.ts (singleton client), errors.ts (HttpError, NotFoundError), s3.ts
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

## Rules

- ESM project (`"type": "module"`). Relative imports use the `.ts` extension; `tsc` rewrites them to `.js` (`rewriteRelativeImportExtensions`). Only erasable TypeScript syntax is allowed (`erasableSyntaxOnly`), so no `enum`, `namespace` or parameter properties.
- Env files load through Node's `--env-file-if-exists` (scripts) and `process.loadEnvFile` (`prisma.config.ts`). There is no `dotenv` dependency.
- Prisma 7: the `prisma-client` generator outputs to `src/generated/prisma`. Import from `../generated/prisma/client.ts`. The client is constructed with the `@prisma/adapter-pg` driver adapter. Use the `prisma-cli` and `prisma-client-api` skills for Prisma work, and `prisma-upgrade-v7` for v7 API questions.
- Express 5 forwards rejected promises from async handlers to the error middleware, so don't wrap handlers in try/catch just to call `next`. Throw `HttpError` subclasses for expected failures. The central error handler shapes every error as `{ message }` and never leaks internal error details.
- Mount routers through the `registerRoutes` callback of `createApp`, so the 404 and error handlers stay last.
- Every route that takes input validates `params`, `query` and `body` with a Zod schema through the validation middleware.
- Use the auth middleware `authMiddleware(roles)` for role checks. Role comes from the verified `custom:role` claim.
- Write geospatial queries (PostGIS) with `prisma.$queryRaw` tagged templates and never with string-concatenated SQL. Keep them inside services.
- Never edit an applied migration. `prisma migrate reset` needs explicit user consent; never bypass Prisma's consent guard.
- Status codes: 200 read/update, 201 create, 204 delete, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found.
