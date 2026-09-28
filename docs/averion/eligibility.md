# Reply eligibility

This note is documentation only. It does not add a `messagingWindow` field and it does not derive eligibility from timestamps.

## Splits

| Gate | Applies to | Values |
| --- | --- | --- |
| `DM_REPLY_ELIGIBILITY` | A reply inside an existing Instagram DM thread (human inbox send or an automated DM that is not a comment private reply) | `ELIGIBLE` \| `INELIGIBLE` \| `UNKNOWN` |
| `COMMENT_PRIVATE_REPLY_ELIGIBILITY` | A private reply to a comment (comment-to-DM) | `ELIGIBLE` \| `INELIGIBLE` \| `UNKNOWN` |

`UNKNOWN` blocks send.

## Rules

- Do not set either gate to `ELIGIBLE` or `INELIGIBLE` from a local clock, a comment timestamp, or a stored “24 hour” calculation.
- Meta decides whether a specific send is allowed. Until this codebase has a live eligibility signal from Meta for that send, the state is `UNKNOWN` and the send stays blocked.
- There is no `messagingWindow=open|closed` value in this change.
- Deployment gates already block the two write paths that would need these decisions: `OPENREPLY_AUTOMATIONS_ENABLED` (automation sends) and `OPENREPLY_HUMAN_SEND_ENABLED` (dashboard conversation POST). Webhook ingest and conversation read are separate and stay available.
- A private-network ingress matrix is Wave 2B. These environment gates are the code-side controls in this patch.

## Status

No eligibility evaluator is implemented here. `UNKNOWN` → block is the policy for any future send path that does not have a Meta eligibility result.
