# OR-06 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `docs/averion/eligibility.md` only
- No `messagingWindow` symbol was added

REBASE:
Docs only. No runtime conflict.

The note separates `DM_REPLY_ELIGIBILITY` and `COMMENT_PRIVATE_REPLY_ELIGIBILITY`, each `ELIGIBLE | INELIGIBLE | UNKNOWN`, with `UNKNOWN` blocking send. It does not derive those values from timestamps or a 24-hour clock.

UPSTREAM_PR_SUITABILITY:
The distinction is accurate to keep, but upstream currently surfaces Meta’s own window errors at send time rather than a local eligibility enum. Do not add a fake clock in an upstream PR. This patch does not.

SOURCE_LEVEL: L1
SOURCE_SHA_OR_URL: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/
FILE: docs/averion/eligibility.md
LINES_OR_SYMBOL: `DM_REPLY_ELIGIBILITY`, `COMMENT_PRIVATE_REPLY_ELIGIBILITY`
CONFIDENCE: MEDIUM
STATUS: OFFICIAL_DOC_CONFIRMED

Meta’s messaging docs describe send windows as platform rules enforced on the send call. This repository does not implement a local open/closed clock, and this patch does not invent one. Confidence is medium because the doc states the policy split; it does not claim a specific Meta field was integrated.
