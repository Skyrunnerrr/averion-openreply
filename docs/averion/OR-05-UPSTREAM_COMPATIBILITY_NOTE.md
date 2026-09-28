# OR-05 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `POST` in `app/api/instagram/conversations/route.ts`
- `isHumanSendEnabled` in `lib/provider-controls.ts` (`OPENREPLY_HUMAN_SEND_ENABLED`)

REBASE:
The gate is the first check after workspace auth and before `sendDirectMessage`. `GET` on the same route is unchanged (read). Webhook ingest is unchanged. A conflict happens if upstream rewrites the start of `POST`.

Default: false on the AVERION profile. `true` allows the dashboard send. The upstream profile defaults to enabled when the variable is unset.

This does not remove the inbox or the conversation list. It blocks the human write. It is not a network ingress control. Wave 2B is the private-network ingress matrix; this variable is the code-side control until then.

The only in-repo caller of `sendDirectMessage` outside the worker is this POST. Automation sends are covered by OR-03, not by this flag.

UPSTREAM_PR_SUITABILITY:
A default-on optional flag could be upstreamed. Default-off belongs to the AVERION profile, because upstream’s inbox is a supported send surface.

SOURCE_LEVEL: UPSTREAM_ONLY
SOURCE_SHA_OR_URL: 5760181c4bb9683241357cbbcd8ca635d19f835a
FILE: app/api/instagram/conversations/route.ts
LINES_OR_SYMBOL: `POST` → `sendDirectMessage`
CONFIDENCE: HIGH
STATUS: UPSTREAM_ONLY
