# Egress map

Source of truth: `averion/deploy/egress-map.json`.

`EGRESS_ENFORCEMENT=UNAVAILABLE`. No firewall or proxy was installed in front of outbound traffic. The public edge reduces which code paths run by refusing to forward the marketing page and every Zernio route.

Server destinations found in the release candidate:

| Destination | When it is used |
| --- | --- |
| `graph.instagram.com` | Graph calls from `lib/meta/client.ts`. Disabled automation jobs return before send. `attachPendingNextReels` can still fetch media when a `pendingNextReel` row exists. |
| `graph.facebook.com` | `debugToken` only. |
| `api.instagram.com` | OAuth code exchange. |
| `www.instagram.com` | Browser redirect to the authorize URL. |
| `api.resend.com` | Magic links when `EMAIL_SERVER` is unset. |
| SMTP host from `EMAIL_SERVER` | Magic links when that variable is set. |
| `zernio.com` | `lib/zernio/client.ts`. Ingress class for those routes is DENY. |
| `api.github.com` | `app/page.tsx` star count. That page is DENY. |
| `postgres:5432`, `redis:6379`, `web:3000` | Compose network only. |

`app/layout.tsx` mounts Vercel Analytics. In production the script URL is same-origin `/_vercel/insights/script.js`. The ingress policy denies `/_vercel/*`. The dev script host `va.vercel-scripts.com` is not used when `NODE_ENV=production`.
