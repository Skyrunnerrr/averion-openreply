# Readiness fail-closed

Two independent gates must both hold before the process is treated as ready.

Code gate, already in the release candidate: `instrumentation.ts` calls `assertProductionSignupPolicy()` on server start. Under the AVERION profile, `NODE_ENV=production` with an empty `ALLOWED_EMAILS` throws. `GET /api/health` returns 503 while `signupPolicyFailureReason()` is set. `OPENREPLY_AUTOMATIONS_ENABLED` and `OPENREPLY_HUMAN_SEND_ENABLED` default to false on that profile.

Deploy gate, this wave: `averion/deploy/check-readiness.mjs` runs before `prisma migrate deploy`, `npm run start`, the worker, and cron. It fails closed unless all of these are true:

- `NODE_ENV=production`
- `OPENREPLY_PROVIDER_PROFILE=averion`
- `OPENREPLY_AUTOMATIONS_ENABLED=false`
- `OPENREPLY_HUMAN_SEND_ENABLED=false`
- `ALLOWED_EMAILS` has at least one address
- required secrets are present, not placeholders, and `CRON_SECRET` is not `NEXTAUTH_SECRET`
- `DATABASE_URL` and `REDIS_URL` do not point at localhost
- `NEXTAUTH_URL` is `https`
- the ingress policy's public listener is only `/api/webhook`
- the public listener denies human send and automation writes

`averion/artifacts/readiness-result.json` records the fixture proof. The passing fixture is ready. Empty allowlist, automations on, human send on, upstream profile, placeholder secrets, a reused cron secret, and a localhost database are not ready.

The provider compose file was started later for the public-edge probe. That probe's web process is the webhook handler harness, not `npm run start`, so it still does not observe a live Next.js `/api/health` response. The public edge denies `GET /api/health` before any process could answer it.
