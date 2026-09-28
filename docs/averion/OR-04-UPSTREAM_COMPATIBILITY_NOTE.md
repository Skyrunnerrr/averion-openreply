# OR-04 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `getAuthorizationUrl` in `lib/meta/oauth.ts`
- `instagramOAuthScopes`, `insightsPermissionRequested`, `AVERION_INSTAGRAM_SCOPES` in `lib/provider-controls.ts`
- `GET` in `app/api/instagram/overview/route.ts`
- `backfillFollowerHistory` in `lib/reports/follower-history.ts`
- Overview reconnect banner in `app/(dashboard)/overview/page.tsx`

REBASE:
The authorize URL is built in one `URLSearchParams` block. Upstream changes to that scope string will conflict. Insight fetches in the overview route are wrapped in `insightsScopeRequested`. Follower insight backfill returns 0 for Meta when the scope is not requested. Zernio analytics are unchanged.

AVERION scope set:
`instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments`

`enable_fb_login=0` is always set, including the upstream profile.

V1 paths checked for an insights dependency (none found): webhook route, `processInstagramWebhook`, `lib/instagram/send-messages.ts`, `lib/instagram/read-inbox.ts`, `lib/meta/webhook.ts`, conversation GET/POST. Likes and comments on media use basic media fields. The overview page still loads those. Views, reach, saved, and shares are not requested and the reconnect CTA is hidden when the scope is absent, because reconnect would not grant it.

`instagram_business_content_publish` is not requested. This tree does not publish media.

UPSTREAM_PR_SUITABILITY:
`enable_fb_login=0` matches the current Business Login parameter (see SOURCE_FINDINGS). Dropping `instagram_business_manage_insights` is an AVERION scope choice. Upstream still shows an insights overview, so the upstream profile keeps that scope. Do not send the scope removal upstream as the only authorize URL.

SOURCE_LEVEL: L1
SOURCE_SHA_OR_URL: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/
FILE: lib/meta/oauth.ts
LINES_OR_SYMBOL: `getAuthorizationUrl`
CONFIDENCE: HIGH
STATUS: OFFICIAL_DOC_CONFIRMED
