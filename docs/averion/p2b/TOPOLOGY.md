# P2B deployment topology

Release candidate `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10`. Parent `075020817b18cf65b548d474e0ce86b8b7b7dbb8` has an empty diff. Upstream pin `5760181c4bb9683241357cbbcd8ca635d19f835a`.

`LIVE_INFRA=SIMULATED`. The compose file was not started. No Meta app, DNS name, or registry push was configured.

```text
public internet
  -> public edge (averion/deploy/ingress-edge.mjs, policy JSON)
       ALLOW only GET/HEAD and POST /api/webhook
       everything else DENY
  -> web:3000 on the compose network

operator / cron / ops
  -> private or ops edge on a network that is not the public listener
  -> web:3000

web, worker, cron, postgres, redis
  -> compose network only
  -> no host ports
```

| Service | Image | Host publish | Role |
| --- | --- | --- | --- |
| public edge | host process running `ingress-edge.mjs` | simulated on 127.0.0.1:18080 | Meta webhook allowlist |
| web | `OPENREPLY_IMAGE_REF` digest from this RC | none | Next.js, migrate on start, readiness gate first |
| worker | same digest | none | Queue consumer and in-process comment poll |
| cron | same digest | none | Calls `http://web:3000/api/cron/*` with `CRON_SECRET` |
| postgres | `docker.io/library/postgres@sha256:a85daf0dbd5e79586e850e3fe4b21b796799828ad015ce2166aeb98cc24da61c` | none | Database |
| redis | `docker.io/library/redis@sha256:ca0acbb137c1dc3339c8b147a58fd6f42775d4599327b50e7b116c23de501af2` | none | BullMQ |

`NEXTAUTH_URL` is the private origin used for magic links and the Instagram OAuth redirect. The Meta webhook URL is the public edge plus `/api/webhook`. Those are different hosts. This wave does not register either host with Meta (`NO_META_LIVE`).

The product `Dockerfile` and `docker-compose.yml` are unchanged. `docker-compose.yml` remains the local dev stack and publishes Postgres and Redis. The provider stack is `averion/deploy/compose.provider.yml`.
