# OR-01 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `POST` in `app/api/webhook/route.ts`
- `prisma.operationalEvent.create` payload on the invalid `x-hub-signature-256` path

REBASE:
The edit is the object passed as `payload` when `verifyWebhookSignature` returns false. A conflict is likely only if upstream changes that same object. The 401 response body is unchanged.

UPSTREAM_PR_SUITABILITY:
Suitable as a security fix. Upstream does not need the removed preview to diagnose a bad app secret: `hadSignatureHeader`, `bodyLength`, `failureClass`, and `timestamp` remain. No fingerprint was added. The raw body can contain comment text, DM text, and usernames, so a preview is not safe to store on a failed verification.

SOURCE_LEVEL: UPSTREAM_ONLY
SOURCE_SHA_OR_URL: 5760181c4bb9683241357cbbcd8ca635d19f835a
FILE: app/api/webhook/route.ts
LINES_OR_SYMBOL: operationalEvent payload `bodyPreview` (removed)
CONFIDENCE: HIGH
STATUS: UPSTREAM_ONLY
