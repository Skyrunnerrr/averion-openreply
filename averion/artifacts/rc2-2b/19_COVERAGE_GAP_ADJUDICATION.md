# 19 COVERAGE GAP ADJUDICATION

The nine gaps are the rows in `15_BUILD_TEST_AFTER.md`. They are adjudicated after this run. Prior unit tests were not treated as a substitute for a row that `15` explicitly left unexecuted.

Closed rows were executed on this machine against disposable local services or the image built from `fe2f1ffee3922e227bb1d12e5d99973560def82f`. No Meta, Instagram, or Resend call was made.

| # | Gap from artifact 15 | Adjudication | Evidence |
| --- | --- | --- | --- |
| 1 | Postgres suite `__tests__/tracked-link-order.db.test.ts` (12 tests) skipped | CLOSED_BY_EXISTING_EVIDENCE | The suite was already in the tree. This run executed it. 12 passed, 0 failed. |
| 2 | Live `/api/health` did not answer | CLOSED_BY_LOCAL_RUNTIME | `GET /api/health` on the new image returned 200. `status=ok`. database, redis, queue, worker, and signupPolicy were ok. |
| 3 | Live `POST /api/webhook` was not sent | CLOSED_BY_LOCAL_RUNTIME | On the new image: verify GET returned the challenge; bad signature returned 401; signed `{object:instagram,entry:[]}` returned 200. No Meta delivery. |
| 4 | Live Server Action POST was not sent | CLOSED_BY_LOCAL_RUNTIME | `POST /login` with `next-action` for `setLocale` and body `["zh-TW"]` returned 200 and `Set-Cookie: openreply-locale=zh-TW`. Body `["nope"]` returned 500 `Unsupported locale`. |
| 5 | No magic-link email was sent | CLOSED_BY_LOCAL_RUNTIME | `EMAIL_SERVER=smtp://127.0.0.1:2525`. Allowlisted `operator@example.com` returned 302 to `/api/auth/verify-request?provider=nodemailer&type=email`. The local SMTP process accepted one message, 2383 bytes. The message body was not stored. `blocked@example.com` returned 302 to `error=AccessDenied` and did not send another message. Resend was not used. |
| 6 | No live Instagram OAuth round trip | BLOCKED_LIVE_PROVIDER | A live Meta round trip is out of scope. No OAuth request was sent. `__tests__/oauth.test.ts` remains the local unit coverage and does not close this row. |
| 7 | Public-edge proxy was not run | CLOSED_BY_LOCAL_RUNTIME | Host `averion/deploy/ingress-edge.mjs` proxied to the image. `GET /api/webhook` through the edge returned `edge-challenge`. `GET /api/health` through the public listener returned 403. `prove-public-edge.mjs` was not run, so `averion/artifacts/public-edge-result.json` was not overwritten. Compose proof was not claimed. |
| 8 | `npm run worker` was not started | CLOSED_BY_LOCAL_RUNTIME | The image command `npm run worker` logged `[DM Worker] Started`. Automations stayed disabled. Health then reported the worker check ok. |
| 9 | `scripts/cron.sh` was not run | CLOSED_BY_LOCAL_RUNTIME | Inside the image, `scripts/cron.sh` printed `scheduler started` and called `attach-next-reel` with wget. The route returned `{"success":true,"data":{"checked":0,"bound":0,"failedAccounts":0}}`. Unauthenticated GET returned 401. `refresh-tokens` and `snapshot-followers` were not invoked. |

TEST_COVERAGE_GAPS_BEFORE=9
TEST_COVERAGE_GAPS_CLOSED=8
TEST_COVERAGE_GAPS_EXTERNAL=1
TEST_COVERAGE_GAPS_REMAINING_LOCAL=0

The external row is gap 6 only. Gaps 2 through 5 and 7 through 9 are closed by local runtime on the new image, not by a new vitest file and not by the previous unit-only notes.
