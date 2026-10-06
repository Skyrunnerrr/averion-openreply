# Secret injection

Secrets are process environment and compose secret files. They are not build arguments and they are not layers in the image.

| Secret | Injected into | Mechanism |
| --- | --- | --- |
| `postgres_password` | postgres | `/run/secrets/postgres_password` |
| `redis_password` | redis | `/run/secrets/redis_password` |
| `DATABASE_URL`, `REDIS_URL` | web, worker, cron | `averion/deploy/secrets.env`, orchestrator only |
| `NEXTAUTH_SECRET`, `CRON_SECRET`, `ENCRYPTION_KEY` | web, worker, cron | same file |
| `RESEND_API_KEY` or `EMAIL_SERVER` | web, worker, cron | same file |
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `FACEBOOK_APP_SECRET`, `WEBHOOK_VERIFY_TOKEN` | web, worker, cron | same file |
| `ALLOWED_EMAILS` | web, worker, cron | same file, required non-empty |

`CRON_SECRET` must differ from `NEXTAUTH_SECRET`. The cron routes still accept either value in product code; the readiness gate rejects a shared value before start.

Evidence in this tree:

- `.dockerignore` lists `.env`, so `COPY . .` in the build stage does not see a local env file.
- Neither Dockerfile copies an env file.
- `averion/deploy/secrets.env.example` contains placeholders. `check-readiness.mjs` rejects them.
- `averion/deploy/secrets.env` and `averion/deploy/secrets/` are gitignored.

The fixture used to prove the gate is in `averion/deploy/prove-readiness.mjs`. Those strings are markers, not credentials, and they were not written into a running container.
