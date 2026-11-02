# Feature: Real Estate Rental Platform

Rentiful is a rental marketplace. Tenants search properties on a map, favorite them, apply and track leases and payments. Managers list properties with photos, review applications and manage leases.

The feature list comes from the commit history of the tutorial repo `ed-roh/real-estate-prod`. It's cloned at `.upstream/real-estate-prod` as a read-only reference and is never copied into this project.

## How we work

1. **Understand:** read the upstream commit for the sub-feature (`git -C .upstream/real-estate-prod show <sha>`) to learn what it does.
2. **Implement:** write our own implementation on the current stack and the conventions in `CLAUDE.md`. Don't copy and paste.
3. **Compare:** diff our behaviour against the upstream commit. Behaviour must match unless a deviation is recorded.
4. **Keep what is newer:** newer package versions, current APIs (Next 16, Tailwind 4, Zod 4, Prisma 7, Express 5) and bug or security fixes win over upstream. Each one is listed under the sub-feature's **Deviations**.
5. **Verify:** a sub-feature is `done` only when every **Acceptance test** listed for it exists and passes, and `verify` (lint, typecheck, test) passes in both packages.

Work strictly in order. Status values are `todo`, `in-progress` and `done`.

| ID | Sub-feature | Upstream commit | Status |
| --- | --- | --- | --- |
| F1 | Client foundation | `23c7207` (part) | done |
| F2 | Landing page | `23c7207` (part) | done |
| F3 | Server foundation and database | `23c7207` (part) | done |
| F4 | Authentication, profiles and settings | `23c7207` (part) | done |
| F5 | Domain API: properties, leases, payments, applications | `1afdc77` | done |
| F6 | Search and property details UI | `cac6ce4` | done |
| F7 | Dashboard property pages | `0d81098` | done |
| F8 | Applications flow and cleanup | `b3de07e` | done |
| F9 | Deployment | `c2fc44a`, `89bcea4`, `3b4ed81`, `32828d8` | todo |

Upstream's first commit (`23c7207`, 107 files) bundles four milestones, so it is split into F1–F4.

## Domain model

`Manager` and `Tenant` are keyed by `cognitoId`. A `Property` belongs to a `Manager` and has one `Location` (PostGIS `geography(Point, 4326)`). Tenants favorite properties and live in properties. An `Application` (Pending, Denied, Approved) links a tenant to a property and, once approved, to a `Lease`. A `Lease` has many `Payment`s (Pending, Paid, PartiallyPaid, Overdue). Enums: `Amenity`, `Highlight`, `PropertyType`.

## Environment variables

| Package | Key | Purpose | Introduced |
| --- | --- | --- | --- |
| client | `NEXT_PUBLIC_API_BASE_URL` | Express API base URL | F1 |
| client | `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID` | Cognito user pool | F4 |
| client | `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID` | Cognito app client | F4 |
| client | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox GL | F6 |
| server | `NODE_ENV` | `development`, `test` or `production` | F3 |
| server | `PORT` | HTTP port | F3 |
| server | `CORS_ORIGINS` | Comma-separated allowed browser origins (not in upstream) | F3 |
| server | `DATABASE_URL` | PostgreSQL connection | F3 |
| server | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Local Docker database only | F3 |
| server | `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` | ID token verification (not in upstream). The region is read from the pool ID. | F4 |
| server | `AWS_REGION` | S3 region | F5 |
| server | `S3_BUCKET_NAME` | Property photo bucket | F5 |

---

## F1: Client foundation

**Goal:** an empty but production-ready Next.js app with the design system, tooling and shared libs in place.

**Compare against:** `23c7207`, files `client/{package.json,next.config.ts,eslint.config.mjs,components.json,tsconfig.json,tailwind.config.ts}`, `src/app/{layout.tsx,globals.css,providers.tsx,page.tsx}`, `src/components/ui/*`, `src/lib/*`, `src/hooks/use-mobile.tsx`, `src/state/*`, `src/types/*`.

**Checklist**
- [x] Scaffold with `create-next-app@latest` (Next 16.4, React 19.3, TypeScript, App Router, `src/`, Tailwind 4, ESLint, Turbopack)
- [x] Move the existing starter files into `src/` and `public/`
- [x] shadcn init (`radix-nova` style, Radix primitives) plus primitives: avatar, badge, button, card, checkbox, command, dialog, dropdown-menu, field, input, label, navigation-menu, radio-group, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, tooltip
- [x] Port the upstream theme to Tailwind v4 in `globals.css` (brand `primary-*` and `secondary-*` scales under `@theme`), and drop `tailwind.config.ts`
- [x] Prettier, ESLint flat config with zero warnings, `typecheck` script, Vitest + Testing Library
- [x] `lib/env.ts` (Zod-validated public env) and `.env.example`
- [x] Redux store (`state/store.ts`), `StoreProvider`, and a typed RTK Query base API (`state/api.ts`)
- [x] Port `lib/constants.ts`, `lib/schemas.ts` (Zod 4), `lib/utils.ts`, `types/index.ts`

**Acceptance tests**
- [x] `lib/utils.test.ts`: `formatEnumString` splits PascalCase; `formatPriceValue` covers "any", below 1k and k values for min and max; `cleanParams` drops empty, `"any"`, null and all-null arrays but keeps `0` and `false`; `withToast` shows success, shows error and rethrows, stays silent with no messages
- [x] `lib/schemas.test.ts`: a valid property coerces numbers; quarter baths are rejected; empty photos, amenities and highlights are rejected; unknown enum values are rejected; blank strings are rejected; application email and phone are validated; settings name is required
- [x] `hooks/use-mobile.test.ts`: reflects the initial media query, updates on breakpoint change, unsubscribes on unmount
- [x] `npm run build` succeeds

**Deviations**
- Tailwind 4 CSS-first config instead of `tailwind.config.ts`
- `motion` instead of `framer-motion`
- ESLint CLI instead of the `next lint` command, which Next 16 removed
- shadcn `form` is deprecated in the current registry, so forms use the `field` primitives with RHF `Controller`. `FormField.tsx` is rebuilt in F4, where it is first used.
- `cn` comes from the official `cn` package (installed by shadcn) instead of `clsx` + `tailwind-merge`
- Enums are `as const` objects with union types instead of TS `enum`s and ambient `declare global` types. Domain types are explicit exports in `types/index.ts`, and component prop types live with their components.
- `propertySchema`: `amenities` and `highlights` are arrays of enum values (upstream used a single string, which didn't match the DB arrays), `baths` allows half steps (the DB stores a float), the photo field is renamed to `photos`, and fees can be 0
- The dev-only `testUsers` mock constant is removed
- `createNewUserInDatabase` moves to F4 with the auth code
- The global UI slice is deferred to F6, where it gets its first state (filters)
- shadcn's generated `use-mobile.ts` is rewritten with `useSyncExternalStore`, because the original called `setState` in an effect, which the React Compiler lint rule rejects
- Production dependencies audit clean. 17 moderate dev-only advisories (`minimatch` via ESLint plugins) have no non-breaking fix.

## F2: Landing page

**Goal:** the public marketing page at `/`.

**Compare against:** `23c7207`, files `src/app/(nondashboard)/{layout.tsx,landing/*}`, `src/components/Navbar.tsx`, `src/app/page.tsx`.

**Checklist**
- [x] `(nondashboard)` layout with the fixed `Navbar` (logo, tagline, sign in and sign up), offset by `NAVBAR_HEIGHT_PX`
- [x] `HeroSection` (splash image and search form), `FeaturesSection`, `DiscoverSection`, `CallToActionSection`, `FooterSection`, with `motion` entrance animations
- [x] `(nondashboard)/page.tsx` serves the landing page at `/`, with its sections in the private `_landing/` folder
- [x] Ran in the browser: all sections render and animate, there are no console errors, and the hero search navigates to `/search?location=...`

**Acceptance tests**
- [x] `components/Navbar.test.tsx`: the logo links to `/`; "Sign In" links to `/signin` and "Sign Up" to `/signup`; the header height equals `NAVBAR_HEIGHT_PX`
- [x] `_landing/HeroSection.test.tsx`: renders the headline, the search box and the button; submitting navigates to `/search?location=<trimmed>`; an empty query does nothing
- [x] `(nondashboard)/page.test.tsx`: the sections render in order and end with the footer; every image has an `alt` (5 informative, 3 decorative `alt=""`); every feature link targets `/search`; the footer renders the brand link, the footer navigation and the copyright with the current year
- [x] `npm run build` succeeds, with `/` statically prerendered (revalidates daily for the copyright year)

**Deviations**
- Upstream serves the landing page at both `/landing` and `/`. It's now only at `/`.
- Upstream feature cards link to the non-existent `/explore` and `/discover`. All three now link to `/search`.
- Upstream footer links (`/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/cookies`) and social icons (`href="#"`) point nowhere. The footer links only to real routes (Search, Sign In, Sign Up), and the social icons are dropped, which also removes Font Awesome. Add them back once real pages and profiles exist.
- The upstream hero input was hard-coded (`value="search query"`, no-op handlers). It's now a real search form; F8 adds geocoding.
- The Navbar is the signed-out Server Component version. F4 adds the auth-aware parts (avatar menu, dashboard button, sidebar trigger), and the manager redirect from the upstream layout moves to F8.
- Next 16: `next/image` uses `preload` instead of the deprecated `priority`, and fill images declare `sizes`
- Cache Components forbids `new Date()` during prerender, so the copyright year comes from `components/CurrentYear.tsx` (`"use cache"` + `cacheLife("days")`)
- The decorative discover icons use `alt=""`, and the hero and CTA images have descriptive alt text

## F3: Server foundation and database

**Goal:** the Express 5 API skeleton plus the full Prisma schema, migrations and seed data.

**Compare against:** `23c7207`, files `server/{package.json,tsconfig.json}`, `src/index.ts`, `prisma/{schema.prisma,migrations/*,seed.ts,seedData/*}`.

**Checklist**
- [x] ESM TypeScript project (TS 6, `.ts` imports rewritten by `tsc`), with `tsx` for dev, `tsc` for build, type-aware ESLint, Prettier and Vitest + supertest
- [x] `config/env.ts` (Zod-validated, `parseEnv`) and `.env.example`
- [x] Split `app.ts` (`createApp(config, registerRoutes)`) and `index.ts` (listen + graceful shutdown), with helmet, CORS allow-list, morgan, the JSON body parser and a central 404 and error handler
- [x] Prisma 7 schema (`prisma-client` generator, `postgresqlExtensions` + PostGIS), `prisma.config.ts`, the `@prisma/adapter-pg` adapter and a `lib/prisma.ts` singleton
- [x] Local PostgreSQL 18 + PostGIS 3.6 via `docker-compose.yml`
- [x] Initial migration; transactional seed script that loads `seedData/*.json` in FK order and resets sequences
- [x] Health route `GET /`
- [x] Ran it: migrated, seeded twice (idempotent), started the compiled build, exercised the endpoints, and shut down cleanly on SIGTERM

**Acceptance tests**
- [x] `src/app.test.ts` (supertest): `GET /` returns 200 `{ status: "ok" }`; an unknown route returns 404 `{ message }`; an `HttpError` maps to its status; a thrown error and a rejected async handler return a generic 500 with no internal details; malformed JSON returns 400; helmet headers are present and `x-powered-by` is hidden; CORS allows only configured origins
- [x] `src/config/env.test.ts`: a valid env parses (CORS list split, `PORT` coerced); a missing `DATABASE_URL`, `PORT`, `NODE_ENV` or `CORS_ORIGINS` fails naming the key; an invalid port, a non-Postgres URL, a bad origin or an unknown `NODE_ENV` are rejected
- [x] `prisma validate` passes, and `npm run prisma:check` reports no pending migrations and no drift
- [x] `prisma/seedOrder.test.ts`: `SEED_ORDER` covers every schema model exactly once, and every model comes after the models its foreign keys reference (parsed from `schema.prisma`)
- [x] Seed against the real DB: 10 locations, 10 managers, 10 properties, 15 tenants, 15 leases, 15 applications, 15 payments, 23 favorites, 14 residences; coordinates stored as PostGIS points; sequences continue after the max id

**Deviations**
- `body-parser` and `dotenv` are dropped. Express 5's built-in parsers and Node 26's `--env-file-if-exists` / `process.loadEnvFile` cover them.
- Client types come from our own domain types instead of copying the Prisma `index.d.ts` into the client
- CORS is restricted to `CORS_ORIGINS` (upstream allows every origin)
- The health route returns JSON `{ status: "ok" }` instead of plain text
- The generated migration SQL is byte-for-byte identical to upstream's `20250203030418_init`
- Seed: upstream logs and swallows insert errors, sleeps a second per model, and interpolates table names into `setval`. Ours validates locations with Zod, runs in a single transaction (all or nothing), exits non-zero on failure, and only uses table names from the fixed `SEED_ORDER` list.
- Docker image `imresamu/postgis:18-3.6` instead of `postgis/postgis`, which has no arm64 build. Its init scripts are disabled so local matches a fresh RDS database.
- `prisma.config.ts` reads `process.env["DATABASE_URL"]` instead of `env()`, so `prisma generate` (`postinstall`) works in CI without a database. Commands that need a database still fail clearly when it is missing.

## F4: Authentication, profiles and settings

**Goal:** Cognito sign-up and sign-in with a tenant or manager role, the user is auto-provisioned in the DB, plus settings pages and the dashboard shell.

**Compare against:** `23c7207`, files `client/src/app/(auth)/authProvider.tsx`, `src/app/(dashboard)/{layout.tsx,tenants/settings,managers/settings,tenants/favorites}`, `src/components/{AppSidebar,SettingsForm,FormField}.tsx`, `src/state/api.ts` (`getAuthUser`, `updateTenantSettings`, `updateManagerSettings`), `server/src/{middleware/authMiddleware.ts,routes/{tenant,manager}Routes.ts,controllers/{tenant,manager}Controllers.ts}`.

**Checklist**
- [x] Amplify configuration from `lib/env.ts` (`lib/amplify.ts`), `Authenticator.Provider` in `providers.tsx`, and an `Authenticator` with a `custom:role` radio on sign-up, validated by `validateCustomSignUp`
- [x] Auth routing: `/signin` and `/signup` (`(auth)` route group) redirect signed-in users to the `next` path, or `/` if `next` is unsafe. Dashboard routes redirect signed-out visitors to `/signin?next=<path>` and send users of the other role to their own dashboard home.
- [x] `getAuthUser`: fetch the Cognito session, then `GET /{role}s/:cognitoId`, creating the user on 404
- [x] Server: `createAuthMiddleware(verifyToken)(roles)` verifies the Cognito ID token with `aws-jwt-verify`
- [x] `GET/POST/PUT /tenants`, `GET/POST/PUT /managers`: routes, then a shared profile controller, then tenant and manager services. Zod validation runs through `withValidation`.
- [x] Dashboard layout (`DashboardShell`) with `AppSidebar` (role-based links), `SettingsForm` + `FormField` for both roles, and a favorites page placeholder
- [x] Auth-aware `Navbar`: a `public` or `dashboard` variant, an account menu, the role action button and the mobile sidebar trigger
- [x] Amplify UI overrides and `.dashboard-container` styles in `globals.css`
- [x] Ran it:
  - Server against the real DB, with a local signing key standing in for Cognito's JWKS: 404, then 201, 409, 200 read, 200 update, 400, 403 for another user, 403 for the wrong role, and 401 for forged or missing tokens.
  - Client production build in the browser: the signed-out dashboard redirects to sign-in, the sign-in and sign-up forms render with the role radio, and there are no console errors.

**Acceptance tests**
- [x] `middleware/auth.test.ts`: a missing or malformed token gets 401; a token the verifier rejects gets 401; a disallowed, missing, unknown or differently cased role gets 403; an allowed role sets `req.user` and calls `next`
- [x] `lib/tokenVerifier.test.ts` (real `aws-jwt-verify` with a local JWKS): a valid token returns `{ sub, role }`; a forged signature, an expired token, another client, another issuer, an access token or a malformed token is rejected as 401; JWKS fetch failures are not masked as 401
- [x] `services/{tenant,manager}Service.test.ts`: get returns the user or a not-found error; create persists for the given Cognito id (duplicate gets 409); update changes only name, email and phone (an unknown user gets 404); unexpected errors are rethrown
- [x] `routes/index.test.ts` (supertest, verifier mocked): another user's id gets 403 for GET and PUT; a tenant on `/managers` gets 403; an invalid body gets 400 with per-field `issues`; POST uses the token's `sub`, never a body `cognitoId`; an empty phone is allowed on sign-up
- [x] `state/api.test.ts`: `getAuthUser` returns `{ cognitoInfo, userInfo, userRole }` and sends the bearer ID token; it creates the DB user when the profile fetch returns 404; it fails without an API call when the role is invalid, and surfaces non-404 API errors; the settings mutations send only the settings fields
- [x] `components/AppSidebar.test.tsx`: the tenant role shows Favorites, Applications, Residences and Settings; the manager role shows Properties, Applications and Settings; only the active link is highlighted (`aria-current`)
- [x] `components/SettingsForm.test.tsx`: starts read-only; enables editing on toggle and restores values on cancel; blocks submission on invalid input; submits valid data and returns to read-only; stays in edit mode when saving fails
- [x] `components/Navbar.test.tsx` and `(dashboard)/_components/DashboardShell.test.tsx`: the signed-out, loading and signed-in states; sign-out; the role action; the redirects for signed-out visitors and the wrong role; the retry on load failure
- [x] `npm run build` succeeds

**Deviations**
- **Security:** upstream uses `jwt.decode` with no signature check, which lets anyone forge a role. Replaced with `aws-jwt-verify`, which checks the signature, issuer, audience, expiry and `token_use: id`.
- **Security:** ownership checks. A user can only read or update their own profile (403 otherwise), and POST takes the Cognito id from the verified token, not the request body. Upstream lets any tenant read or overwrite any other tenant.
- Server env adds `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID`. `AWS_REGION` moves to F5, because the verifier reads the region from the pool ID.
- Roles are compared exactly (`tenant`, `manager`). Upstream lowercases the role and returns 400 for undecodable tokens; ours returns 401.
- Errors go through the central error handler with specific status codes: 404, 409 for a duplicate profile, and 400 with `issues`. Upstream returns 500 with the raw Prisma message.
- Upstream's `invalidatesTags` never matched a provided tag, so settings updates didn't refresh the UI. `getAuthUser` now provides the `AuthUser` tag that the mutations invalidate. Saves show success and error toasts.
- Signing out resets the RTK Query cache and navigates client-side instead of a full reload. The Navbar only calls `getAuthUser` once Amplify reports `authenticated`, so public pages make no failing API calls.
- The Navbar takes a `variant` prop instead of sniffing the pathname. The fake message and notification icons, with permanent unread dots, are dropped because no feature backs them.
- Auth pages are real routes (`(auth)/signin`, `(auth)/signup`) instead of a pathname check that wraps every page. Upstream sends signed-out dashboard visitors to an inline Authenticator; we redirect to `/signin?next=` and return them afterwards, with an open-redirect guard (`safeRedirectPath`).
- The sign-in field is labelled "Username or email", because Cognito accepts the username there. Sign-up requires a role through `validateCustomSignUp`; upstream relied on `isRequired` alone.
- Phone numbers: the client and server both allow only digits, spaces and `+ ( ) . -`. The server accepts an empty phone on profile creation (Cognito sign-up collects none).
- `FormField` is rebuilt on the shadcn `field` primitives with RHF `Controller` and covers text inputs only. F7 extends it for the property form.
- The dashboard shows "Loading…", or a retry button if the account fails to load, instead of rendering nothing.
- Amplify CSS overrides use the oklch theme tokens directly (upstream used `hsl(var(--x))` from shadcn v3). `!important` is kept only where Amplify's stylesheet, which loads later, would win.

## F5: Domain API

**Goal:** the complete REST API.

**Compare against:** `1afdc77`. Later upstream commits only toggle the S3 upload off and on (`0d81098`, `3b4ed81`), add a missing-tenant 404 to add-favorite (`cac6ce4`), and add a debug log (`b3de07e`).

**Endpoints**
- `GET /properties` (public): filters `favoriteIds`, `priceMin`, `priceMax`, `beds`, `baths`, `propertyType`, `squareFeetMin`, `squareFeetMax`, `amenities` (all must match), `availableFrom`, and `latitude` + `longitude` (PostGIS `ST_DWithin` on `geography`, 1000 km radius). Unknown keys such as `location` are ignored.
- `GET /properties/:id` (public): includes the location coordinates as `{ longitude, latitude }`
- `POST /properties` (manager): multipart `photos` (1–10 JPEG, PNG or WebP files, 5 MB each) are uploaded to S3. The address is geocoded with Nominatim, then the location (`ST_MakePoint`) and property are created in one transaction.
- `GET /properties/:id/leases` (the property's manager)
- `GET /leases` (tenant: their own leases; manager: leases on their properties) and `GET /leases/:id/payments` (the lease's tenant or manager)
- `GET /applications` (scoped by the token's role), `POST /applications` (tenant), `PUT /applications/:id/status` (the property's manager; `Approved` or `Denied`)
- `GET /tenants/:cognitoId/current-residences`, `POST` and `DELETE /tenants/:cognitoId/favorites/:propertyId` (self only)
- `GET /managers/:cognitoId/properties` (self only)

**Checklist**
- [x] Services, controllers and routers for properties, leases and applications, plus the tenant and manager additions. Every dependency (Prisma, geocoder, photo storage, clock) is injected.
- [x] `lib/photoStorage.ts` (S3 via `@aws-sdk/lib-storage`, random object keys) and `lib/geocoder.ts` (Nominatim structured search with an identifying `User-Agent`)
- [x] Zod schemas for every query, params and body (`schemas/property.ts`, `schemas/application.ts`, `schemas/common.ts`). Multipart fields are coerced: comma-separated arrays and `"true"`/`"false"` booleans.
- [x] Authorization: users only read or modify their own resources
- [x] Integration test setup: `npm run test:integration` runs `*.int.test.ts` against `<DATABASE_URL database>_test`, which is created and migrated automatically. The dev data is never touched.
- [x] Ran it: the compiled server against the seeded dev DB returned all 10 properties; the radius, price + beds, amenity and favorite-id filters; the detail view with coordinates; 404, 400 and 401

**Acceptance tests**
- [x] `services/propertyFilters.test.ts`: each filter produces the expected SQL condition; omitted filters add nothing; all values are parameters (none appear in the SQL text)
- [x] `services/propertyService.int.test.ts`:
  - Search applies each filter on real PostGIS: price, rooms, size and type; every amenity; favorite ids; the 1000 km radius (Berlin finds Paris, not New York); and leased-on-date exclusion.
  - `get` returns coordinates, and an unknown id gives 404.
  - `create` uploads every photo, geocodes, and stores the coordinates and photo URLs. A geocoding miss returns 400 with nothing uploaded or persisted, and a missing manager persists nothing.
  - `listByManager` and `listLeases` are scoped to the owner (403 for others).
- [x] `services/tenantService.int.test.ts`: adding a favorite twice is idempotent; removing a missing favorite is a no-op; an unknown property or tenant gives 404; residences include coordinates
- [x] `services/applicationService.int.test.ts`:
  - Create stores a Pending application with **no** lease. A second pending application gives 409, and an unknown property gives 404.
  - Approval creates exactly one lease (rent and deposit from the property, 1-year term), links it, and adds the tenant to the property.
  - Denial creates no lease, and a reviewed application can't be reviewed again (409).
  - Only the property's manager can review (403).
  - The list is scoped per role and includes `manager` and the lease's `nextPaymentDate`.
- [x] `services/leaseService.int.test.ts`: a tenant sees only their leases; a manager sees only leases on their properties; payments are visible only to the lease's tenant and manager (403 otherwise, 404 when missing)
- [x] `routes/domain.test.ts` (supertest, services mocked):
  - Query parsing, and 400s for invalid filters.
  - Multipart create for the manager, where a body `managerCognitoId` is ignored. Tenants get 403. A missing photo, a non-image or an oversized photo, or an invalid body gives 400.
  - Review is manager-only, and the status must be `Approved` or `Denied`. Applications use the token's user and ignore `userId` and `tenantCognitoId`.
  - Leases require auth. Favorites, residences and managed properties are self-only.
- [x] `lib/dates.test.ts` (month-end clamping, next payment date), `lib/geocoder.test.ts` (request shape, no match, error responses), `lib/photoStorage.test.ts` (key, content type, unsupported type, missing URL)

**Deviations**
- **Security:** upstream's `GET /leases` returns every lease, and payments, applications, residences and favorites accept any user id. All of them are now scoped to the verified token, with ownership checks (403).
- **Security:** `POST /properties` takes the manager from the token instead of the body. `POST /applications` takes the tenant from the token, and the server sets `status` and `applicationDate`. `GET /applications` ignores `userId`/`userType`.
- Upstream `createApplication` creates a lease when the tenant applies, and approval creates a second one. The lease is now created only on approval, inside a transaction. Only Pending applications can be reviewed, guarded against concurrent reviews, and a tenant can have one pending application per property.
- Upstream falls back to coordinates `[0, 0]` when geocoding fails. Ours returns 400 before uploading anything.
- Upstream builds S3 keys from `Date.now()` and the client's file name. Ours uses random UUID keys, accepts only JPEG, PNG and WebP, and limits size and count.
- `GET /properties/:id/leases` is added. The upstream client calls it, but upstream's server never implemented it.
- Radius search uses `geography` and meters (`ST_DWithin`, 1000 km), instead of casting to `geometry` and an approximate degree conversion
- `amenities` is cast to `"Amenity"[]`. Upstream compared an enum array to `text[]`, which Postgres rejects.
- `availableFrom` returns properties with no lease covering that date. Upstream returned properties that had any lease starting before it.
- Search returns full typed Prisma records (raw SQL selects only the matching ids) with coordinates attached in one batched query. Upstream used one query per property, `@terraformer/wkt` and `axios`, which are all dropped.
- Applications no longer duplicate `property.address` (use `property.location.address`). `manager` and `lease.nextPaymentDate` are kept. Next payment dates clamp to month ends (Jan 31, then Feb 28).
- Results are ordered: properties by id, leases by start date, payments by due date, applications newest first
- The Nominatim `User-Agent` identifies the app with its repository URL instead of a placeholder email
- Server env adds `AWS_REGION` and `S3_BUCKET_NAME`, both required. AWS credentials come from the SDK's default provider chain (an IAM role in production).

## F6: Search and property details UI

**Goal:** the public search experience.

**Compare against:** `cac6ce4`. The application modal on the details page comes in F8 (`b3de07e`).

**Checklist**
- [x] `state/globalSlice.ts` (filters, full-filters toggle, view mode), synced with the URL through `lib/searchFilters.ts`. The URL is the source of truth: `SearchView` parses the search params, mirrors them into the slice, and queries with them. Filter changes `router.replace` the URL.
- [x] `/search`: `FiltersBar` (location search, price, beds and baths, property type, grid or list toggle), `FiltersFull` side panel (draft state, Apply and Reset), `SearchMap` (Mapbox GL markers with popups), `Listings` (`Card` or `CardCompact`, favorite toggle for tenants)
- [x] `/search/[id]`: `ImagePreviews` carousel of the property's photos, `PropertyOverview`, `PropertyDetails` (amenities, highlights, fee tabs), `PropertyLocation` (map + directions), `ContactWidget`
- [x] RTK Query `getProperties`, `getProperty`, `getTenant`, `addFavoriteProperty`, `removeFavoriteProperty` with cache tags, plus `geocodeLocation` (Mapbox Geocoding v6) for the location search
- [x] Mapbox popup styles in `globals.css`; `next.config.ts` remote image patterns (S3 `properties/` objects, and `example.com` for the seed data)
- [x] Ran it in the browser against the seeded API:
  - URL filters load (`beds=2` returns 4 results).
  - The select filters update the URL, with one API request per change.
  - The full panel applies an amenity.
  - The map shows 8 markers within 1000 km of Los Angeles, and a marker opens its popup.
  - The details page renders every section.
  - Broken photo URLs fall back to the placeholder.

**Acceptance tests**
- [x] `state/globalSlice.test.ts`: each reducer updates only its own field; `setFilters` merges partial updates; `resetFilters` keeps the view mode
- [x] `lib/searchFilters.test.ts`: filters serialize to search params (empty values omitted) and parse back to the same state; missing params fall back to defaults; 11 kinds of invalid params are ignored
- [x] `components/Card.test.tsx` (both `Card` and `CardCompact`): render the price, beds, baths, square feet and link; the favorite button calls `onFavoriteToggle` and reflects `aria-pressed`; it is hidden when `showFavoriteButton` is false; without `propertyLink` the name is plain text
- [x] `search/Listings.test.tsx`: shows the result count and location; renders full cards in grid view and compact cards in list view; hides favorites for visitors; a tenant adds and removes favorites
- [x] `search/[id]/ImagePreviews.test.tsx`: next and previous wrap around; no photos shows the placeholder without navigation
- [x] `state/api.test.ts`: adding and removing a favorite invalidates the tenant and the property list, so both refetch; `toPropertyQueryParams` maps filters to API params
- [x] `search/SearchMap.test.tsx`: popups link to the property, and property names are rendered as text, never HTML
- [x] `npm run build` succeeds (`/search` static, `/search/[id]` partially prerendered)

**Deviations**
- **Security:** upstream builds marker popups with `setHTML` and the property name, an XSS vector for any manager-entered name. Popups are now built with DOM nodes and `textContent`.
- Filters are typed: `null` instead of `"any"` strings, `PropertyType`/`Amenity` unions, and an ISO date. The URL parser validates every param with Zod and ignores invalid ones; upstream copied raw strings into state.
- One direction of sync, from the URL to the slice, instead of upstream's mount-only read plus debounced pushes. Upstream's `debounce` was recreated every render, so it never debounced. `lodash` is dropped.
- The map is created once; markers update when results change and the map flies to new coordinates. Upstream destroyed and recreated the whole map on every result change. Markers use the `color` option instead of rewriting SVG paths.
- The Mapbox style is `mapbox/streets-v12` instead of the tutorial author's private style. `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is validated in `lib/env.ts` and passed per map.
- Location search uses Mapbox Geocoding v6 through an RTK Query endpoint, with a toast when a location isn't found or the service fails. Upstream used the deprecated v5 API with `console.error`.
- The details page loads the property once and passes it down. Upstream queried it in every section. The carousel shows the property's photos; upstream hard-coded two static images.
- Removed fake content: the hard-coded marketing paragraph appended to every description, the "Verified Listing" badge, and the contact widget's fixed phone number, languages and opening hours. The widget shows "Sign In to Apply" (returning to the property after sign-in) to visitors. The tenant "Submit Application" button arrives with the modal in F8.
- Favorites are shown only to tenants. Upstream showed them to managers too, whose clicks would fail.
- Favorite mutations invalidate `Tenants` by Cognito id (upstream used the response id, which was missing on errors). Toggle failures show a toast.
- Accessibility: labelled icon buttons, `aria-pressed` toggles, a labelled carousel and maps, and filter tiles as real buttons instead of clickable `div`s. "Next image" is labelled correctly (upstream labelled both buttons "Previous image").
- `averageRating` and `numberOfReviews` are nullable in the schema and default to 0 in the UI (upstream crashed on `null.toFixed`)
- Image fallback is handled in one `PropertyImage` component used by the cards and the carousel

## F7: Dashboard property pages

**Goal:** the manager and tenant property dashboards.

**Compare against:** `0d81098`.

**Checklist**
- [x] `Header`, `Loading`, `QueryError`, `PropertyGrid` (with empty state), `PaymentStatusBadge`, and the `useFavorites` hook (shared with search `Listings`)
- [x] Tenant: `/tenants/favorites` (removable favorites linking to the listing), `/tenants/residences`, `/tenants/residences/[id]` (lease card with status, next payment, and billing history)
- [x] Manager: `/managers/properties`, `/managers/properties/[id]` (leases table with the current month's payment status), `/managers/newproperty` (React Hook Form + `PhotoUpload`)
- [x] `FormField` extended: `multiline`, `SwitchField`, `SelectField`, `MultiChoiceField`, `PhotoField`
- [x] RTK Query `getCurrentResidences`, `getManagerProperties`, `createProperty`, `getLeases`, `getPropertyLeases`, `getPayments`
- [x] Server: `GET /properties/:id/leases` includes each lease's payments (ordered by due date), so the table needs one request instead of one per lease
- [x] Ran it in the browser: production client plus a temporary API harness on the dev DB that trusted a local signing key, with sessions written to Amplify's storage.
  - Tenant: the residences list and a residence with an ended lease and its billing history.
  - Manager: a property's leases table, and creating a property. "No photo" was blocked; with a photo, the multipart POST returned 201 and the list refreshed.
  - The test property was deleted afterwards.

**Acceptance tests**
- [x] `components/Header.test.tsx`: renders the title (h1) and subtitle
- [x] `managers/newproperty/NewPropertyForm.test.tsx`: blocks submission without photos or required fields; submits `FormData` with each photo under `photos`, arrays comma-separated, and no `managerCognitoId`; redirects to the list; a selected photo can be removed. `lib/propertyFormData.test.ts` covers the builder.
- [x] `managers/properties/[id]/PropertyLeasesView.test.tsx`: the leases table shows tenant, dates, rent, contact and the current month's payment status ("Not Paid" without a payment due this month); shows an empty state
- [x] `tenants/residences/[id]/ResidenceView.test.tsx`: shows the lease period, the next payment date and the payment history newest first; fetches payments for that property's lease; explains when there is no lease
- [x] `(dashboard)/dashboardLists.test.tsx`: the favorites, residences and properties lists each show a message when empty, and link to the right pages
- [x] `lib/leases.test.ts`: next payment date (including month-end), current month status, payment sorting, latest lease per property
- [x] `npm run build` succeeds (the three `[id]` dashboard routes are partially prerendered)

**Deviations**
- Upstream bugs fixed:
  - The manager property page passed the property id to `getPayments` (which expects a lease id). Payments now come with the leases.
  - The tenant residence page showed payments of the tenant's first lease for every property; it now uses that property's latest lease.
  - The next payment showed the lease end date; it's now the next monthly date, or "None" for an inactive lease.
  - Rent was labelled "/ night"; it's now "/ month".
  - Favorites linked to the residence page; they now link to the listing.
- Removed fake content: the hard-coded VISA payment method and billing email, the "Download", "Download All" and "Download Agreement" buttons (no backend), the "Manager" button, and the static tenant avatar image (an initial fallback is used instead)
- Photo upload uses our own `PhotoUpload` (native multi-file input with previews, remove, de-duplication) instead of FilePond: `react-filepond` hasn't been updated since 2024 and its preview plugin since 2023. Client validation matches the server: JPEG, PNG or WebP, at most 10 photos of 5 MB each.
- Arrays are sent comma-separated (what the F5 API parses). Upstream sent JSON strings, which its own server split on commas. `managerCognitoId` isn't sent; the server takes it from the token.
- Amenities and highlights are multi-select toggle groups. Upstream used a single select, so only one value could be chosen.
- After creating a property: a success or error toast and a redirect to My Properties, which refetches through the `Properties` list tag. Upstream stayed on the filled-in form.
- `Loading` is inline (`role="status"`) instead of a fixed full-screen overlay
- Dates use `Intl.DateTimeFormat` in UTC and currency uses `Intl.NumberFormat`, instead of locale-dependent `toLocaleDateString()`
- The dashboard layout wraps `DashboardShell` in `<Suspense>`, because Cache Components requires `usePathname()` under a boundary on dynamic routes
- The test setup adds a `ResizeObserver` stub (Radix Switch/Select need it in jsdom)

## F8: Applications flow and cleanup

**Goal:** tenants apply, and managers approve or deny.

**Compare against:** `b3de07e`.

**Checklist**
- [x] `ApplicationModal` on the property page (tenants only), prefilled from the tenant's profile. `ContactWidget` shows "pending review" with a link instead of the button when the tenant already has a pending application for that property.
- [x] `ApplicationCard` and `ApplicationStatusBadge` (shared). `/tenants/applications` shows a status note per application and links to the listing or the residence. `/managers/applications` has All, Pending, Approved and Denied tabs with counts. Approve and Deny ask for confirmation first.
- [x] Hero search geocodes the location and opens `/search` with `location` and `coordinates`. The geocode-and-toast logic moved into `hooks/use-locate.ts`, which the search bar also uses.
- [x] `(nondashboard)/_components/ManagerRedirect`: signed-in managers on `/` or `/search/*` go to `/managers/properties`
- [x] RTK Query `getApplications`, `createApplication`, `reviewApplication` (`Applications` tag; a review also invalidates `Leases`)
- [x] Server: `lease.nextPaymentDate` in `GET /applications` is `null` once the lease has ended
- [x] Ran it in the browser (production client plus the temporary local-auth API harness on the dev DB):
  - The tenant (Carol) applied to property 3. The form was prefilled, the POST returned 201, and the widget switched to "pending review".
  - The tenant applications page listed the new and the old applications.
  - The manager (manager3) was redirected from `/search/3` to `/managers/properties`.
  - On the manager's applications page, approving behind the confirmation created a one-year lease (next payment shown), and the tab counts updated.
  - The hero search with the placeholder Mapbox token shows the "unavailable" toast and stays on the page.
  - The test application, lease and residence link were removed afterwards.
  - The card layout was fixed after this run: the date column was too narrow, and the page scrolled horizontally next to the sidebar.

**Acceptance tests**
- [x] `search/[id]/ContactWidget.test.tsx`:
  - A signed-out visitor gets a sign-in link that returns to the property, and a manager gets no apply button.
  - A pending application replaces the button with a link to the applications page. A denied one allows applying again.
  - The modal is prefilled, trims the message, submits `{ propertyId, name, email, phoneNumber, message }` and closes on success. An invalid phone number blocks the submit.
- [x] `(dashboard)/applicationLists.test.tsx`:
  - Tenant: an empty state, the note for each status (active and ended leases), the lease dates, next payment or "None", the manager's mailto link, and the residence or listing link.
  - Manager: the tab counts and per-status filtering. Approve and Deny appear only on pending applications, and each sends the right status only after confirmation. Cancel sends nothing.
- [x] `_components/ManagerRedirect.test.tsx`: managers are sent away from `/`, `/search` and `/search/4`. Tenants, signed-out visitors and other paths such as `/searching` are left alone.
- [x] `_landing/HeroSection.test.tsx` and `hooks/use-locate.test.ts`:
  - The hero navigates with the geocoded location and coordinates, and stays put when nothing is found.
  - The hook trims the query, skips blank queries, and shows a toast for no results and for geocoder errors.
- [x] `lib/schemas.test.ts`: a blank message becomes `undefined`, and a message over 2000 characters is rejected. `lib/utils.test.ts`: `apiErrorMessage` uses the API's message for 4xx responses only.
- [x] `applicationService.int.test.ts`: `nextPaymentDate` is `null` after the lease ends
- [x] `npm run build` succeeds

**Deviations**
- The client sends only the form fields and `propertyId`. Upstream also sent `applicationDate`, `status` and `tenantCognitoId`; the F5 API sets those from the server clock and the verified token.
- Upstream `ContactWidget` shows "Submit Application" to any signed-in user, including managers, who can't apply. Managers see no apply button (and are redirected away from search).
- Server errors are shown in the toast for 4xx responses, such as "You already have a pending application for this property" (409). Upstream wrapped every endpoint in a generic toast, including every query.
- Approve and Deny need confirmation, because approval creates a lease and neither action can be undone. Upstream changed the status on the first click.
- Removed fake actions: "Download Agreement" and "Contact User" had no behaviour. The contact column has working `tel:` and `mailto:` links instead.
- The card shows the application date and hides lease rows when there is no lease. Upstream rendered `Invalid Date` for pending and denied applications, and a placeholder landing image as every contact's avatar.
- Tenant notes: an approved application whose lease has ended says so, instead of "rented by you until" a past date.
- Hero search: upstream swapped longitude and latitude in `setFilters` and used the deprecated Mapbox v5 geocoding API. Ours reuses the F6 v6 geocoder and serializes through `lib/searchFilters.ts`.
- The manager redirect doesn't block rendering. Upstream showed "Loading..." on every public page until the auth check finished, even for signed-out visitors.
- Upstream's `console.log("status:")` in the application controller is not ported
- The `Toaster` was already mounted in `providers.tsx` (F4)

## F9: Deployment

**Goal:** production deployment on AWS (EC2, RDS, Amplify, API Gateway, S3).

**Compare against:** `c2fc44a`, `89bcea4`, `3b4ed81`, `32828d8`.

**Checklist**
- [ ] `server/ecosystem.config.cjs` (PM2) runs the built `dist/index.js` with `NODE_ENV=production`
- [ ] Client ESLint and image config adjustments (`*.amazonaws.com` remote pattern)
- [ ] Property photo URLs built from the S3 bucket and region
- [ ] `docs/deployment/aws.md`: VPC and networking, EC2 setup (Node 26 via nvm, PM2), RDS PostgreSQL with PostGIS, Amplify hosting, API Gateway proxy, S3 bucket policy, budget alarm

**Acceptance tests**
- [ ] `npm run build` succeeds in both packages, and `node dist/index.js` starts and answers `GET /`
- [ ] The PM2 config points at `dist/index.js` and sets `NODE_ENV=production`
- [ ] `next.config.ts` allows `*.amazonaws.com` images, and the S3 URL builder produces `https://<bucket>.s3.<region>.amazonaws.com/<key>`

**Deviations**
- Upstream PM2 runs `npm run dev` in production. This version runs the compiled build.
