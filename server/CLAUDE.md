# Server (Express + Prisma)

Read the root `CLAUDE.md` first. This file adds the backend-specific rules.

## Structure

```
src/index.ts          Starts the HTTP server (listen only)
src/app.ts            Builds the Express app: middleware, routes, error handler (testable without listen)
src/config/           env.ts (Zod-validated env), constants.ts
src/routes/           One router per resource: tenants, managers, properties, leases, applications
src/controllers/      HTTP handlers; no Prisma imports
src/services/         Business logic and data access
src/middleware/       auth (Cognito JWT verification), validation, error handling
src/lib/              prisma.ts (singleton client), s3.ts
prisma/               schema.prisma, migrations, seed.ts, seedData/*.json
```

## Rules
- ESM project (`"type": "module"`). Run in development with `tsx`, build with `tsc` to `dist/`.
- Express 5 forwards rejected promises from async handlers to the error middleware, so don't wrap handlers in try/catch just to call `next`. One central error handler shapes every error response as `{ message }`.
- Every route that takes input validates `params`, `query` and `body` with a Zod schema through the validation middleware.
- Use the auth middleware `authMiddleware(roles)` for role checks. Role comes from the verified `custom:role` claim.
- Write geospatial queries (PostGIS) with `prisma.$queryRaw` tagged templates and never with string-concatenated SQL. Keep them inside services.
- Prisma migrations are created with `npm run prisma:migrate -- --name <name>`. Never edit an applied migration.
- Status codes: 200 read/update, 201 create, 204 delete, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found.
