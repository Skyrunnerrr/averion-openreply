# 14 AUTH CRITICAL TRIAGE

No auth package was upgraded. Installed versions, unchanged: `next-auth@5.0.0-beta.31`, `@auth/core@0.41.2`, `@auth/prisma-adapter@2.11.2`.

npm audit on the new lockfile still reports those three as critical. The adapter finding has no advisory of its own. GitHub's advisory API returned no vulnerabilities for `@auth/prisma-adapter`. npm lists it because it depends on `@auth/core@0.41.2`.

## Criticals

| ID | Package / range | What the advisory requires | This repo | STATUS |
|---|---|---|---|---|
| GHSA-8fpg-xm3f-6cx3 | `next-auth` `>=5.0.0-beta.0 <=5.0.0-beta.31`. First patched `5.0.0-beta.32`. | Fail-open when code treats a truthy `auth` object as a session (`!!auth` / `if (req.auth)`). The error object is `{ message: "There was a problem with the server configuration..." }`. No impact while configuration is valid, and no impact when the check requires `auth.user`. | `proxy.ts` checks session cookie names, not `auth()`. Dashboard, invite, Instagram callback, and invitation accept use `session?.user?.id`. `getCurrentUserId()` uses `session?.user?.id`. An error object has no `user.id`, so those checks fail closed. | **NOT_AFFECTED** |
| GHSA-7rqj-j65f-68wh | `next-auth` `>=5.0.0-beta.1 <=5.0.0-beta.31` and `@auth/core` `>=0.1.0 <0.41.3`. First patched `next-auth@5.0.0-beta.32` and `@auth/core@0.41.3`. | Default email normalizer checks the ASCII `@` count before NFKC. A homoglyph that later becomes `@` can be misdelivered if the mailer normalizes, and only if the verification email is sent. | Email provider is enabled (Resend, or Nodemailer when `EMAIL_SERVER` is set). `lib/auth.ts` does not pass `normalizeIdentifier`. Installed `defaultNormalizer` in `@auth/core` splits on `@` and does not call `String.normalize`. `sendToken` runs the `signIn` callback before `sendVerificationRequest`. `isEmailAllowedToSignIn` is an exact `toLowerCase()` allowlist match. AVERION production with an empty allowlist returns false for every address, and `instrumentation.ts` throws on server start. A homoglyph address is not an exact allowlist member, so the callback denies it before send. | **NOT_REACHABLE** on the AVERION production profile |

## High (same audit, not upgraded)

| ID | STATUS | Why |
|---|---|---|
| GHSA-xmf8-cvqr-rfgj `getToken()` throw on a malformed Bearer header. In range for `next-auth@5.0.0-beta.31` and `@auth/core@0.41.2`. Patched in `5.0.0-beta.32` / `0.41.3`. | **NOT_REACHABLE** | No `getToken()` call in app or test source. Session strategy is `database`. Cron routes compare a shared secret string. They do not call Auth.js `getToken()`. |

GHSA-x445-f3h2-j279 is moderate (OAuth state/nonce/PKCE cookie binding), in range through beta.31 / `@auth/core@0.41.2`, patched in the same beta.32 / 0.41.3 pair. It is outside this critical/high triage. It was not upgraded.

## Not a remediation

This run does not install `next-auth@5.0.0-beta.32` or `@auth/core@0.41.3`.

If a later run enables open signup (`OPENREPLY_PROVIDER_PROFILE=upstream`, or non-production with an empty allowlist), re-open GHSA-7rqj before that configuration is shipped. The minimal plan, not executed here:

1. Pin `next-auth` to `5.0.0-beta.32` and let it pull `@auth/core@0.41.3`, or pin both exactly.
2. Re-resolve only that subtree. Do not use `npm audit fix --force`.
3. Re-run the signup policy tests, the magic-link callback tests, and a production `next start` with a non-empty allowlist.

AUTH_CRITICAL=0
AUTH_HIGH=0
AUTH_AFFECTED=0
AUTH_UNVERIFIED=0

Those counts are remaining open criticals, remaining open highs, `AFFECTED_*` rows, and `UNVERIFIED` rows after the triage above. Two critical advisories and one high advisory were reviewed. None stayed `AFFECTED_*` or `UNVERIFIED`.
