# P2B deployment topology

Release candidate for the route audit remains `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` on `averion/p2b-hardening`. Upstream pin `5760181c4bb9683241357cbbcd8ca635d19f835a`.

```text
public internet
  -> public-edge (only published listener, port 8080)
       evaluates averion/deploy/ingress-policy.json
       DENY unmatched, PRIVATE_SERVICE, OPS_ONLY, and explicit DENY
       FORWARD only PUBLIC_REQUIRED (GET/HEAD and POST /api/webhook)
       preserves method, raw query string, request headers, and raw body
       does not verify x-hub-signature-256
  -> web:3000 on the edge network
       OpenReply verifies the Meta webhook signature

web, worker, cron, postgres, redis
  -> internal network
postgres and redis are not on the edge network
no host port for web, worker, cron, postgres, or redis
```

| Service | Image | Host publish | Networks | Role |
| --- | --- | --- | --- | --- |
| public-edge | pinned `node` digest from `averion/deploy/base-image-pins.json` | `8080:8080` | edge | Reverse proxy. Public listener only. |
| web | `OPENREPLY_IMAGE_REF` | none | edge, internal | Next.js. Migrate on start. Readiness gate first. |
| worker | same digest | none | internal | Queue consumer. Automations stay off. |
| cron | same digest | none | internal | Calls `http://web:3000/api/cron/*` with `CRON_SECRET`. |
| postgres | pinned digest in `compose.provider.yml` | none | internal | Database |
| redis | pinned digest in `compose.provider.yml` | none | internal | BullMQ |

Private and ops listeners exist in the policy file and are not started as published services.

`NEXTAUTH_URL` is the private origin used for magic links and the Instagram OAuth redirect. The Meta webhook URL is the public edge plus `/api/webhook`. This wave does not register either host with Meta (`NO_META_LIVE`).

The product `Dockerfile` and `docker-compose.yml` are unchanged. `docker-compose.yml` remains the local dev stack and publishes Postgres and Redis. The provider stack is `averion/deploy/compose.provider.yml`.

`averion/deploy/compose.probe.yml` is an E2E harness. It mounts this repository and runs `app/api/webhook/route.ts` so the network test can reach the OpenReply handler without the unpublished release image. It does not add host ports. The production web command remains `npm run start`.

Effective topology is checked with `docker compose -f averion/deploy/compose.provider.yml config`. The recorded result is `averion/artifacts/public-edge-result.json` under `realNetworkTest.topology`.
