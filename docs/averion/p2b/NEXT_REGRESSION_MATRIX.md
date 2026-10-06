# Next.js security upgrade regression matrix

Status: `READY` for RC2.2B. This matrix is not an executed upgrade. RC2.2A does not install Next.js 16.3.6 or 16.3.7 and does not change `package.json` or `package-lock.json`.

Run every row after RC2.2B pins the exact published `next` and `eslint-config-next` pair. A row that is not listed here is out of scope. Do not refactor product features while running this matrix.

| Check | What to exercise | Result |
| --- | --- | --- |
| production build | `npm ci` then `npm run build` (`prisma generate && next build`) | PASS. `next build` reported Next.js 16.3.8 (Turbopack), 56 static pages. |
| next start | `npm run start` serves the built app | PASS. `next start` reported Next.js 16.3.8 and Ready. `/`, `/privacy`, `/login` returned 200. |
| route handlers | App Router route handlers respond | PARTIAL. `/dashboard` returned 307 to `/login?callbackUrl=%2Fdashboard` (proxy). Live handlers that need Postgres or Redis were not completed. |
| /api/webhook raw body | Instagram webhook raw body verification still uses the unparsed body | UNIT_ONLY. `__tests__/webhook.test.ts` and `__tests__/webhook-body-preview.test.ts` passed. No live POST to the running server. |
| Server Actions | `setLocale` and the login magic-link action | UNIT_ONLY. `__tests__/server-action-security.test.ts` and `__tests__/i18n-actions.test.ts` passed. No live action POST. |
| NextAuth magic link | Email sign-in allowlist and in-app callback path | UNIT_ONLY. Signup policy and callback tests passed. No email was sent. |
| Instagram OAuth routes | OAuth start and callback routes | UNIT_ONLY. `__tests__/oauth.test.ts` passed. No live Meta round trip. |
| instrumentation.ts | `instrumentation.ts` still loads on the server | PASS. Production `next start` reached Ready with `ALLOWED_EMAILS` set. An empty production allowlist would have thrown from `register()`. |
| static assets | `public/` assets are served | PASS. `/favicon.ico` returned 200. |
| provider health | Provider health route responds | NOT_COMPLETED. `/api/health` made no response within 5s. No Postgres or Redis was available. |
| public-edge to Next | Public edge still proxies to Next | NOT_EXECUTED. |
| worker | `npm run worker` starts the DM worker | NOT_EXECUTED. |
| cron | `scripts/cron.sh` can call the app with wget | NOT_EXECUTED. |
| Prisma generation | `prisma generate` output is present after the production build | PASS. Prisma Client 7.8.0 generated during `npm run build`. |
