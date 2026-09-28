# External bypass red team

Two different checks are recorded.

`averion/deploy/red-team.mjs` is a `PROXY_TEST`. It binds local listeners, forwards `ALLOW` to a stub upstream, and expects HTTP 403 with no forward for `DENY`. It does not start Compose. Output: `averion/artifacts/red-team-result.json`.

`averion/deploy/prove-public-edge.mjs` records three blocks in `averion/artifacts/public-edge-result.json`:

- `POLICY_TEST` calls `decide()` and does not open a socket.
- `HANDLER_TEST` proxies to a process that executes `app/api/webhook/route.ts`.
- `REAL_NETWORK_TEST` starts `compose.provider.yml` plus `compose.probe.yml` and probes from the host and from a container that is not on the `edge` or `internal` networks.

| Probe | Where | Result required |
| --- | --- | --- |
| `GET /api/webhook` | public edge | forwarded to the OpenReply webhook handler |
| `POST /api/webhook` invalid signature | public edge | forwarded, handler returns 401, no body preview persisted |
| `POST /api/instagram/conversations` | public edge | 403, not forwarded |
| `POST /api/automations` | public edge | 403, not forwarded |
| `GET /inbox` | public edge | 403 |
| `GET /` | public edge | 403 |
| `GET /api/health` | public edge | 403 |
| TCP `web:3000` from an external client | none | unreachable |
| TCP postgres `5432` from an external client | none | unreachable |
| TCP redis `6379` from an external client | none | unreachable |
| TCP postgres from the `public-edge` container | none | unreachable |

`attachPendingNextReels` loads `pendingNextReel` rows and returns before `createInstagramContext` or `getUserMedia` when `OPENREPLY_AUTOMATIONS_ENABLED=false`. The proof is `__tests__/attach-next-reel-kill-switch.test.ts`. It does not depend on an empty table. The cron route and the worker both call that function, so both paths are covered by the same guard. The public edge also denies `GET /api/cron/attach-next-reel`.

The edge logs method, path, decision, and status. It does not log the query string, authorization, cookies, the webhook body, or `x-hub-signature-256`.

On the machine that produced the passing `REAL_NETWORK_TEST`, `iptables-legacy` had `FORWARD DROP` while Docker's nftables rules accepted the same bridge. Bridged container-to-container packets were dropped, and `docker-proxy` still published port 8080. The legacy policy was set to `ACCEPT` before the passing run. That is host filter state. It is not egress enforcement, and Compose still does not filter outbound hostnames.
