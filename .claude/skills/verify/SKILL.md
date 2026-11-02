---
name: verify
description: Run lint, typecheck and tests for every package in this repo (client and server) and report results. Use after any code change, before marking a sub-feature done, or when asked to check the project.
---

# Verify

For each of `client/` and `server/` that contains a `package.json`, run these scripts in order from inside that directory, using the Node version from `.nvmrc` (`source ~/.nvm/nvm.sh && nvm use`):

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`

Then, in `server/`, start the database with `npm run db:up` if it isn't running, and run:

4. `npm run test:integration`: the service integration tests against the `_test` database
5. `npm run prisma:check`: fails when migrations are pending or the schema has drifted from them

Rules:
- Run every step, even after a failure, so the report is complete.
- Report each package and step as pass or fail. For failures, include the relevant error output.
- Don't run `build` unless the user asks or a sub-feature touches build configuration.
- Fix failures at the root cause. Never weaken lint, TypeScript or test configuration to make a check pass.
