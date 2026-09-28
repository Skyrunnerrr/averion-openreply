# Egress map

Source of truth: `averion/deploy/egress-map.json`.

`EGRESS_INVENTORY` is the result of that map. `EGRESS_ENFORCEMENT=NOT_IMPLEMENTED`. The map is not an enforcement control, and it is not `EGRESS_SECURITY=PASS`. Docker Compose does not filter outbound traffic by hostname. The decision is recorded in `docs/averion/p2b/EGRESS_ADR.md` as option B.

Server destinations found in the source:

| Destination | When it is used |
| --- | --- |
| `graph.instagram.com` | Graph calls from `lib/meta/client.ts`. Disabled automation jobs return before send. `attachPendingNextReels` returns before any Instagram client call when automations are disabled, including when a `pendingNextReel` row exists. |
| `graph.facebook.com` | `debugToken` only. |
| `api.instagram.com` | OAuth code exchange. |
| `www.instagram.com` | Browser redirect to the authorize URL. |
| `api.resend.com` | Magic links when `EMAIL_SERVER` is unset. |
| SMTP host from `EMAIL_SERVER` | Magic links when that variable is set. |
| `zernio.com` | `lib/zernio/client.ts`. Ingress class for those routes is DENY. |
| `api.github.com` | `app/page.tsx` star count. That page is DENY, so the public edge does not forward the request that would render it. |
| `postgres:5432`, `redis:6379` | Internal network only. Not joined to the edge network. No host ports. |
| `web:3000` | Reached by cron on the internal network and by `public-edge` on the edge network. No host port. |

`app/layout.tsx` mounts Vercel Analytics. In production the script URL is same-origin `/_vercel/insights/script.js`. The ingress policy denies `/_vercel/*`. The dev script host `va.vercel-scripts.com` is not used when `NODE_ENV=production`.
