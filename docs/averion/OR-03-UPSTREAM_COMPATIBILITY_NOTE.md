# OR-03 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `areAutomationsEnabled` in `lib/provider-controls.ts` (`OPENREPLY_AUTOMATIONS_ENABLED`)
- `processInstagramWebhook` in `lib/queue/process-webhook.ts` (gate before `queue.add`)
- `reconcileComments` in `lib/polling/comment-reconciler.ts` (return before the sweep)
- `processJob` in `lib/queue/dm-worker.ts` (return before `dispatchJob`; worker stays up)

REBASE:
Three small early returns. Conflicts if upstream rewrites the start of those functions. The worker entrypoint `worker/dm-worker.ts` still starts the worker and the poll timer. The poll calls `reconcileComments`, which no-ops when the switch is off.

Default: false when the profile is AVERION (including unset). `OPENREPLY_AUTOMATIONS_ENABLED=true` turns jobs back on. The upstream profile defaults the flag to true when the variable is unset.

What stays on when the switch is false:
- Webhook signature verification
- Storage of a verified webhook event (ingest)
- The worker process and its heartbeat

What stays off:
- `process-comment`, `process-message`, and `process-postback` queue adds, including read-fallback postbacks
- Polling reconciliation enqueues
- Worker calls into Instagram send helpers, including jobs already on the queue

UPSTREAM_PR_SUITABILITY:
The flag itself is a reasonable upstream feature. Default-off is not suitable for upstream’s product, which exists to run automations. Keep the default behind the AVERION profile.

SOURCE_LEVEL: UPSTREAM_ONLY
SOURCE_SHA_OR_URL: 5760181c4bb9683241357cbbcd8ca635d19f835a
FILE: lib/queue/process-webhook.ts
LINES_OR_SYMBOL: `processInstagramWebhook` queue adds
CONFIDENCE: HIGH
STATUS: UPSTREAM_ONLY
