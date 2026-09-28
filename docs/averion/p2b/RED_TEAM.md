# External bypass red team

`LIVE_INFRA=SIMULATED`. `averion/deploy/red-team.mjs` started three local edges bound to 127.0.0.1 and sent the requests below. The OpenReply server was not started. No request was forwarded to Meta.

Expected result for an external client is `DENIED` (HTTP 403 from the public edge) or `UNREACHABLE` (nothing listening).

| Probe | Listener | Result required |
| --- | --- | --- |
| `GET /inbox` | public | DENIED |
| `GET /dashboard` | public | DENIED |
| `POST /api/instagram/conversations` | public | DENIED |
| `POST /api/automations` | public | DENIED |
| `PATCH /api/automations` | public | DENIED |
| `POST /api/automations/import` | public | DENIED |
| `POST /api/automations/duplicate` | public | DENIED |
| `GET /automations/new` | public | DENIED |
| `POST /api/instagram/conversations` | private | DENIED |
| `POST /api/automations` | private | DENIED |
| `POST /api/polling/reconcile` | public | DENIED |
| `GET /api/cron/attach-next-reel` | public | DENIED |
| `POST /api/zernio/webhook/workspace_1` | public | DENIED |
| TCP `127.0.0.1:19090` (worker) | none | UNREACHABLE |
| `GET /api/webhook` and `POST /api/webhook` | public | ALLOW, not proxied |

Recorded output: `averion/artifacts/red-team-result.json`.

Comment polling has no HTTP route. It is `setInterval` inside `worker/dm-worker.ts`. The worker has no published port. `reconcileComments` returns immediately when automations are disabled. `attachPendingNextReels` is not behind that flag; it queries Postgres and calls Meta only when a `pendingNextReel` row exists. This deployment denies the routes that create automations, and the readiness gate keeps the flag false.

Residual: a client that can reach `web:3000` on the compose network skips the edge. The compose file publishes no host port, so that path is not on the public internet. Product code still returns 403 for human send when the flag is false, and it does not queue automation jobs. Creating an automation row is still implemented on the app process for an authenticated admin; the edge is what denies that route.
