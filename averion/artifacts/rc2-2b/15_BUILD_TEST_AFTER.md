# 15 BUILD AND TEST AFTER

## INSTALL

`npm ci` from the updated lockfile. Exit 0.
INSTALL=**PASS**

## BUILD

`npm run build` (`prisma generate && next build`). Exit 0.
Prisma Client 7.8.0 generated. Next.js **16.3.8** (Turbopack). Compiled successfully. TypeScript finished. 56 static pages generated. The build log lists `ƒ Proxy (Middleware)`.
BUILD=**PASS**

## next start

`next start --port 3456 --hostname 127.0.0.1` with `ALLOWED_EMAILS` set so the production signup gate in `instrumentation.ts` does not throw. Log: `Next.js 16.3.8`, `Ready in 85ms`.

| Request | Result |
|---|---|
| `GET /` | 200 |
| `GET /privacy` | 200 |
| `GET /favicon.ico` | 200 |
| `GET /login` | 200 |
| `GET /dashboard` | 307 to `/login?callbackUrl=%2Fdashboard` |
| `GET /api/health` | No response within 5 seconds. No Postgres and no Redis were running. |

## TESTS

`npm test` (`vitest run`). Exit 0.
Test files: 37 passed, 1 skipped (38).
Tests: 334 passed, 12 skipped (346).

The skipped file is `__tests__/tracked-link-order.db.test.ts`. It is `describe.skipIf(!DATABASE_URL)` and reads `TEST_DATABASE_URL`. That variable was not set. No database was started.

Unit tests that did run and match the regression matrix: webhook signature and body preview, `setLocale` and magic-link callback checks, i18n actions, signup allowlist, OAuth state and scopes, canonical build definition (now expects `16.3.8`).

## TEST_COVERAGE_GAP

These matrix rows were not executed end to end. That is a gap, not a pass.

1. Postgres suite `__tests__/tracked-link-order.db.test.ts` (12 tests) skipped.
2. Live `/api/health` did not answer (no database, no Redis).
3. Live `POST /api/webhook` was not sent. Signature unit tests passed.
4. Live Server Action POST was not sent. `setLocale` unit tests passed.
5. No magic-link email was sent.
6. No live Instagram OAuth round trip.
7. Public-edge proxy was not run.
8. `npm run worker` was not started.
9. `scripts/cron.sh` was not run.

TEST_COVERAGE_GAP=9
TESTS=334_PASS_12_SKIP
