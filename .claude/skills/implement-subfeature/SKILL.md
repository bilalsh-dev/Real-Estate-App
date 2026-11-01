---
name: implement-subfeature
description: Implement the next sub-feature from docs/features/real-estate-app.md by porting the matching upstream commit from .upstream/real-estate-prod to this project's stack and conventions. Use when asked to continue the build, implement the next feature, or work on a specific sub-feature ID (F1, F2, ...).
---

# Implement a sub-feature

## 1. Select
- Read `docs/features/real-estate-app.md`. Take the sub-feature the user named, or else the first one not `done`.
- Set its status to `in-progress` in the table.

## 2. Study upstream
- Make sure `.upstream/real-estate-prod` exists. If it doesn't, clone `https://github.com/ed-roh/real-estate-prod.git` into it.
- List the commit's changes: `git -C .upstream/real-estate-prod show --stat <sha>`.
- For each file in scope, read its content at that commit with `git -C .upstream/real-estate-prod show <sha>:<path>`, and the diff with `git -C .upstream/real-estate-prod show <sha> -- <path>`.
- For sub-features carved out of a larger commit (F1–F4), port only the files in that sub-feature's "Upstream files" list.

## 3. Port
- Re-implement the behaviour following `CLAUDE.md`, `client/CLAUDE.md` and `server/CLAUDE.md`. Never copy upstream versions, the `package.json` file or lockfiles.
- Add dependencies with `npm install <pkg>@<latest-stable>`, after checking `npm view <pkg> dist-tags` and the peer ranges.
- When a major version changed an API (Next 16, Tailwind 4, Zod 4, Prisma 7, Express 5, motion), use the current API and check the official docs or installed `node_modules/<pkg>` types. Don't rely on memory.
- Fix upstream bugs and security issues, and record each one under the sub-feature's "Deviations".
- Write the tests the conventions require.

## 4. Verify
- Run the `verify` skill. Fix every failure. Never disable a rule or skip a test to get to green.

## 5. Close out
- Tick the checklist items, add any new deviations, and set the status to `done`.
- Report what was built, the deviations, and the verify output summary. Commit only if the user asks.
