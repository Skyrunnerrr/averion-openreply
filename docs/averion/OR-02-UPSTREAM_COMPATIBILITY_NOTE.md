# OR-02 UPSTREAM_COMPATIBILITY_NOTE

BASE_SHA: 5760181c4bb9683241357cbbcd8ca635d19f835a

SYMBOLS:
- `isEmailAllowedToSignIn` in `lib/env.ts`
- `isSignupPolicyProductionReady`, `assertProductionSignupPolicy` in `lib/provider-controls.ts`
- `register` in `instrumentation.ts`
- `signupPolicy` check in `app/api/health/route.ts`
- `authConfig.callbacks.signIn` in `lib/auth.ts` (unchanged call site; it already returns `isEmailAllowedToSignIn`)

REBASE:
`isEmailAllowedToSignIn` is the historical allowlist function. Upstream edits there will conflict. `instrumentation.ts` is new. The health handler gained one check object.

Behavior:
- `NODE_ENV=production` and AVERION profile (default) and empty `ALLOWED_EMAILS`: `register()` throws on server start (not during `next build`), `/api/health` returns 503, and `signIn` returns false so NextAuth does not create a user, session, or workspace.
- Non-production with an empty allowlist still admits any email, matching the previous tests.
- `OPENREPLY_PROVIDER_PROFILE=upstream` keeps open signup in production.

UPSTREAM_PR_SUITABILITY:
Not suitable as an unconditional upstream default. OpenReply’s documented self-host behavior is open signup when `ALLOWED_EMAILS` is unset. The fail-closed path is gated by the AVERION profile so an upstream port can keep `upstream` as the default.

SOURCE_LEVEL: UPSTREAM_ONLY
SOURCE_SHA_OR_URL: 5760181c4bb9683241357cbbcd8ca635d19f835a
FILE: lib/env.ts
LINES_OR_SYMBOL: `isEmailAllowedToSignIn`
CONFIDENCE: HIGH
STATUS: UPSTREAM_ONLY
