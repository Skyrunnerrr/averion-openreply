# 22 LOCAL RUNTIME SANITY

Target: local image `openreply-rc22a:fe2f1ff`, manifest `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829`.

Command: `npx next start --port 3456 --hostname 127.0.0.1` with `--network host`. Disposable local env only: `NODE_ENV=production`, `ALLOWED_EMAILS=operator@example.com`, `OPENREPLY_AUTOMATIONS_ENABLED=false`, `OPENREPLY_HUMAN_SEND_ENABLED=false`, `EMAIL_SERVER=smtp://127.0.0.1:2525`. Postgres and Redis were the local instances in `20_LOCAL_POSTGRES_AND_TESTS.md`. No production secret. No Meta host was contacted.

The log reached Ready. `Next.js` in the image is 16.3.8. `BUILD_ID` is `fe2f1ffee3922e227bb1d12e5d99973560def82f`.

| Check | Result |
| --- | --- |
| APP_BOOT | PASS. Process reached Ready and served HTTP. |
| AUTH_BOOTSTRAP | PASS. Instrumentation did not throw. `GET /login` 200. `GET /api/auth/csrf` 200. `GET /api/auth/providers` 200. |
| ROUTING | PASS. `GET /` 200, `GET /privacy` 200, `GET /favicon.ico` 200. `GET /dashboard` 307 to `/login?callbackUrl=%2Fdashboard`. |
| API_BOOTSTRAP | PASS. Health, webhook, and cron routes answered. |
| MIDDLEWARE | PASS. Unauthenticated `/dashboard` redirected to login. |
| SERVER_ACTION_RUNTIME | PASS. `setLocale("zh-TW")` POST returned 200 and set `openreply-locale=zh-TW` (Secure, HttpOnly, SameSite=lax). `setLocale("nope")` returned 500 `Unsupported locale`. |
| DB | PASS. Health database check ok. Migrations were already applied. |
| BACKGROUND | PASS. Worker logged `[DM Worker] Started`. Health worker check ok. `scripts/cron.sh` started and wget called `attach-next-reel` successfully. |

## Webhook

| Request | Result |
| --- | --- |
| `GET /api/webhook` with the local verify token | 200 body `local-challenge` |
| `POST /api/webhook` bad `x-hub-signature-256` | 401 |
| `POST /api/webhook` HMAC of `{object:instagram,entry:[]}` with the local Facebook app secret | 200 |

## Health

`GET /api/health` returned 200.

`status=ok`. Checks: database ok, redis ok, queue ok, worker healthy, signupPolicy ok.

## Cron

Inside the image, unauthenticated `GET /api/cron/attach-next-reel` returned 401.

`scripts/cron.sh` with `CRON_BASE_URL=http://127.0.0.1:3456` printed:

`[cron] scheduler started, target http://127.0.0.1:3456`

`[cron] 2026-10-06 14:00:30 attach-next-reel ok {"success":true,"data":{"checked":0,"bound":0,"failedAccounts":0}}`

`refresh-tokens` and `snapshot-followers` were not called.

## Public edge

`node averion/deploy/ingress-edge.mjs` on `127.0.0.1:18080` with `OPENREPLY_UPSTREAM_URL=http://127.0.0.1:3456`.

| Request | Result |
| --- | --- |
| Public `GET /api/webhook` verify | 200 body `edge-challenge` |
| Public `GET /api/health` | 403 |

## Magic link

Allowlisted address: 302 to `http://localhost:3456/api/auth/verify-request?provider=nodemailer&type=email`. Local SMTP on `127.0.0.1:2525` accepted one message of 2383 bytes. The body was not kept.

Blocked address: 302 to `http://localhost:3456/api/auth/error?error=AccessDenied`. No second SMTP message.

## Not run

Instagram OAuth was not called.

IMAGE_RUNTIME=PASS
LOCAL_RUNTIME_SANITY=PASS
