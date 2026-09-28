# Source findings

Pin: `5760181c4bb9683241357cbbcd8ca635d19f835a`

| Finding | SOURCE_LEVEL | SOURCE_SHA_OR_URL | FILE | LINES_OR_SYMBOL | CONFIDENCE | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Invalid signature path stored `bodyPreview: rawBody.slice(0, 200)` | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `app/api/webhook/route.ts` | `bodyPreview` (removed) | HIGH | UPSTREAM_ONLY |
| Empty `ALLOWED_EMAILS` made `isEmailAllowedToSignIn` return true, and `createUser` calls `ensureWorkspaceForUser` | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `lib/env.ts`, `lib/auth.ts` | `isEmailAllowedToSignIn`, `events.createUser` | HIGH | UPSTREAM_ONLY |
| Comment, message, and postback jobs are queued in `processInstagramWebhook` before the worker runs | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `lib/queue/process-webhook.ts` | `queue.add` | HIGH | UPSTREAM_ONLY |
| Polling reconciliation enqueues `process-comment` from the worker interval | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `lib/polling/comment-reconciler.ts`, `worker/dm-worker.ts` | `reconcileComments` | HIGH | UPSTREAM_ONLY |
| Authorize URL requested `instagram_business_manage_insights` and did not set `enable_fb_login` | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `lib/meta/oauth.ts` | `getAuthorizationUrl` | HIGH | UPSTREAM_ONLY |
| Business Login authorize host and scope list include `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`. `instagram_business_manage_insights` is a separate permission used by insight edges, not by comment or messaging sends | L1 official Meta docs | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/ | `lib/provider-controls.ts` | `AVERION_INSTAGRAM_SCOPES` | HIGH | OFFICIAL_DOC_CONFIRMED |
| `enable_fb_login` controls the Facebook login option on the Instagram OAuth page. Changelog 6 Feb 2026 added it (default true). An earlier 14 Jun 2025 deprecation entry exists; the later changelog and the current parameter table document the parameter again | L1 official Meta docs | https://developers.facebook.com/docs/instagram-platform/changelog/ and https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/ | `lib/meta/oauth.ts` | `enable_fb_login` | HIGH | OFFICIAL_DOC_CONFIRMED |
| `POST /api/instagram/conversations` calls `sendDirectMessage` for a human reply. `GET` on that route only reads | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `app/api/instagram/conversations/route.ts` | `POST`, `GET` | HIGH | UPSTREAM_ONLY |
| No `messagingWindow` symbol exists in this tree. Send-window failures are Meta error strings handled in the worker | L2 pinned upstream | `5760181c4bb9683241357cbbcd8ca635d19f835a` | `lib/queue/dm-worker.ts` | `outside of allowed window` | HIGH | UPSTREAM_ONLY |
| Instagram messaging send availability is enforced by Meta on the send, not by a client-side 24-hour clock in this patch | L1 official Meta docs | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/ | `docs/averion/eligibility.md` | `DM_REPLY_ELIGIBILITY` | MEDIUM | OFFICIAL_DOC_CONFIRMED |

No Meta live calls were made for these findings. Nothing here is `LIVE_PLATFORM_CONFIRMED`.
