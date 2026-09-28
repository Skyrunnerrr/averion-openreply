# Next.js security upgrade regression matrix

Status: `READY` for RC2.2B. This matrix is not an executed upgrade. RC2.2A does not install Next.js 16.3.6 or 16.3.7 and does not change `package.json` or `package-lock.json`.

Run every row after RC2.2B pins the exact published `next` and `eslint-config-next` pair. A row that is not listed here is out of scope. Do not refactor product features while running this matrix.

| Check | What to exercise | Result |
| --- | --- | --- |
| production build | `npm ci` then `npm run build` (`prisma generate && next build`) | NOT_EXECUTED |
| next start | `npm run start` serves the built app | NOT_EXECUTED |
| route handlers | App Router route handlers respond | NOT_EXECUTED |
| /api/webhook raw body | Instagram webhook raw body verification still uses the unparsed body | NOT_EXECUTED |
| Server Actions | `setLocale` and the login magic-link action | NOT_EXECUTED |
| NextAuth magic link | Email sign-in allowlist and in-app callback path | NOT_EXECUTED |
| Instagram OAuth routes | OAuth start and callback routes | NOT_EXECUTED |
| instrumentation.ts | `instrumentation.ts` still loads on the server | NOT_EXECUTED |
| static assets | `public/` assets are served | NOT_EXECUTED |
| provider health | Provider health route responds | NOT_EXECUTED |
| public-edge to Next | Public edge still proxies to Next | NOT_EXECUTED |
| worker | `npm run worker` starts the DM worker | NOT_EXECUTED |
| cron | `scripts/cron.sh` can call the app with wget | NOT_EXECUTED |
| Prisma generation | `prisma generate` output is present after the production build | NOT_EXECUTED |
