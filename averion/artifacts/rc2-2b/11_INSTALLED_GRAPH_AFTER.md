# 11 INSTALLED GRAPH AFTER

Fresh install: `rm -rf node_modules && npm ci` from the updated lockfile. Exit 0. npm reported 568 packages added.

| Layer | next | eslint-config-next |
|---|---|---|
| MANIFEST (`package.json`) | 16.3.8 | 16.3.8 |
| LOCKFILE (`node_modules/next`) | 16.3.8 | 16.3.8 |
| INSTALLED (`node_modules/next/package.json`) | 16.3.8 | 16.3.8 |

MANIFEST_NEXT = LOCKFILE_NEXT = INSTALLED_NEXT = **16.3.8**

`npm ls next --depth=1` shows a single `next@16.3.8`. `@vercel/analytics` and `next-auth` dedupe to it. A walk of `node_modules` found one `next` package: `node_modules/next@16.3.8`. The lockfile has one `node_modules/next` entry. No parallel older `next`.

Also installed, unchanged by a direct pin: `react@19.2.4`, `react-dom@19.2.4`, `next-auth@5.0.0-beta.31`, `@auth/core@0.41.2`.
Installed because the new next range requires them: `@next/env@16.3.8`, `@next/eslint-plugin-next@16.3.8`, `sharp@0.35.5`, `postcss@8.5.23`.

Lockfile sha256: `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7`
That matches `averion/deploy/canonical-builder.json` `LOCKFILE_SHA256`.

INSTALLED_GRAPH_VERIFIED=**YES**
