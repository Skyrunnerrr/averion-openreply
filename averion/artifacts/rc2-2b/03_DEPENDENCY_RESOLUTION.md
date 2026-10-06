# 03 DEPENDENCY RESOLUTION — `next` and the React family (Phase D, independent check)

Source: `package-lock.json` at HEAD 93a793ae (sha256 df7f69b3…6389416, lockfileVersion 3), fetched via the GitHub contents API (raw/package-lock.json).

## Dependency path for `next`
```
openreply@0.1.0 (root, packages[""])
└── next  spec "^16.2.6"  → node_modules/next  16.2.6   (direct, prod, single copy)
    ├── @next/env 16.2.6
    ├── @swc/helpers 0.5.15
    ├── postcss 8.4.31 (pinned by next)
    ├── styled-jsx 5.1.6
    ├── baseline-browser-mapping ^2.9.19, caniuse-lite ^1.0.30001579
    ├── optional: @next/swc-{darwin,linux,win32}-* 16.2.6 (×8), sharp ^0.34.5 → 0.34.5
    └── peer: react/react-dom ^18.2.0 || ^19.0.0  → satisfied by 19.2.4
Peer consumers of next (no extra copies): next-auth (peer ^14 || ^15 || ^16), @vercel/analytics (peer >= 13)
Dev: eslint-config-next 16.2.6 → @next/eslint-plugin-next 16.2.6
```
- Exactly **one** `node_modules/**/next` entry exists in the lockfile. No nested or duplicate copy.
- No `react-server-dom-*` package in the lockfile. RSC runtimes are vendored inside next (`dist/compiled/react-server-dom-webpack`, `-turbopack`, plus `-experimental`, with package names `*-builtin`). The vendored React build is `19.3.0-canary-3f0b9e61-20260317`.

## Integrity cross-check (registry vs lockfile)
- Downloaded `https://registry.npmjs.org/next/-/next-16.2.6.tgz` (tarball only, not installed) and computed sha512:
  `sha512-qOVgKJg1+At15NpeUP+eJgCHvTCgXsogweq87Ri/Ix7PkqQHg4sdaXmSFqKlgaIXE4kW0g25LE68W87UANlHtw==`
  This **matches** the lockfile `integrity` for node_modules/next. The tarball's package.json version is 16.2.6.
- The deploy Dockerfile (`averion/deploy/Dockerfile`) enforces `sha256sum -c` of package-lock.json against `LOCKFILE_SHA256` before `npm ci`, so the image's installed graph is bound to this lockfile by construction. That binding was not re-executed this phase.

## Manifest vs Lockfile vs Installed
| Layer | next | eslint-config-next | react | react-dom | Verified? |
|---|---|---|---|---|---|
| Manifest (package.json) | ^16.2.6 | ^16.2.6 | 19.2.4 | 19.2.4 | YES (read at HEAD) |
| Lockfile (package-lock.json) | 16.2.6 | 16.2.6 | 19.2.4 | 19.2.4 | YES (read at HEAD + registry integrity match for next) |
| Installed (node_modules / RC image) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NO**: there was no install and the RC image was not inspected this phase |

Note: the manifest range `^16.2.6` would admit 16.3.8 on a fresh `npm install`. `npm ci` honours the lockfile, so the RC artifact resolves to **16.2.6**.

## Registry state (npm, read 2026-10-06)
dist-tags: latest=16.3.8 (published 2026-09-30 18:07 CEST), backport=15.5.27 (2026-09-30 18:19 CEST). 16.3.7 is 2026-09-29 11:04 CEST (bug-fix only per S1). The newest 16.2.x is 16.2.12 (2026-07-25). No 16.2.x backport exists for any 16.3.3+ fix. eslint-config-next latest is 16.3.8.
