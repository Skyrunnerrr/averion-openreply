# 01 BASELINE — AVERION_SOCIAL_OPENREPLY_RC2_2B_MASTER_CLOSURE (Phase A, READ_ONLY)

Captured: 2026-10-06 14:49 CEST (Europe/Berlin). Method: GitHub REST via `gh api` (authenticated read only), raw.githubusercontent.com at a pinned SHA, npm registry. No clone, no commit, no push, no PR, no install.

| Field | Value |
|---|---|
| REPOSITORY | https://github.com/Skyrunnerrr/averion-openreply (public, default branch `main`) |
| PR | #2 "P2B OpenReply RC2 provenance (do not merge)" — state=open, draft=true, 12 commits, 60 changed files, last updated 2026-09-28 20:30 CEST |
| BRANCH (PR #2 head) | `cursor/p2b-openreply-deployment-88e3` |
| HEAD_SHA | `93a793aefe7c93f06b4bc2ffc464c277aad46353` ("Record the RC2.2A deployment bundle SHA.", committed 2026-09-28 20:27 CEST) |
| Expected CURRENT_PR_HEAD | `93a793aefe7c93f06b4bc2ffc464c277aad46353` → **MATCH. The tip has not moved.** |
| BASE branch | `averion/p2b-hardening` (also PR #1 head, draft) |
| BASE_SHA | `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` ("ci: trigger native OpenReply workflow") |
| main / averion/pin-5760181c | `5760181c4bb9683241357cbbcd8ca635d19f835a` (upstream feat #67, 2026-09-21) |
| WORKTREE_STATE | N/A_REMOTE_READ |
| LOCKFILE | `package-lock.json` (repo root, lockfileVersion 3). Git blob `00cd54042264c27a746ce68e382ce98962b50181`, sha256 `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` |
| package.json sha256 | `78f920cbe33d896be9c100e7113db9679148529e743e7b24162f30be4bc178ab` |
| Other lockfiles | none (no yarn.lock, pnpm-lock, or npm-shrinkwrap; tree not truncated, 313 blobs) |

## Lineage
Linear first-parent history on the branch: 5760181c (main) → 07502081 → 727d364c (BASE, PR#1 head) → 1d60c1b5 … 3047834a (RC2.2A builder/Model B key) → 3509dfa8 → 0ef0fa10 → 6bfff79d → 4182d05f (RC2.2A synthetic builder proof) → **93a793ae (RC2.2A deployment bundle SHA)**. No later commits on the branch. No other branch carries RC2.2B work.
→ Lineage is CLEAR. RC2_2B is **not** BLOCKED_LINEAGE.

## Versions (HEAD 93a793ae)
| Package | Manifest (package.json) | Lockfile resolved | Scope |
|---|---|---|---|
| next | `^16.2.6` (dependencies) | **16.2.6** (registry.npmjs.org/next/-/next-16.2.6.tgz, sha512-qOVgKJg1…UANlHtw==) | prod, direct |
| @next/env | (transitive) | 16.2.6 | prod |
| @next/swc-* (8 platforms) | (transitive, optional) | 16.2.6 | prod, optional |
| eslint-config-next | `^16.2.6` (devDependencies) | 16.2.6 | dev |
| @next/eslint-plugin-next | (transitive) | 16.2.6 | dev |
| react | `19.2.4` (exact) | 19.2.4 | prod |
| react-dom | `19.2.4` (exact) | 19.2.4 | prod |
| scheduler | (transitive) | 0.27.0 | prod |
| react-server-dom-* | not declared | **not present in lockfile.** Next vendors these as `next/dist/compiled/react-server-dom-{webpack,turbopack}[-experimental]` (package names `*-builtin`). The vendored React build in next 16.2.6 is `19.3.0-canary-3f0b9e61-20260317`, read from the registry tarball. |
| sharp | (transitive optional of next) | 0.34.5 | prod, optional |

## next.config.ts at HEAD
`reactCompiler: true`, `turbopack.root`. It has no `images` key (no `remotePatterns` or `domains`), no `cacheComponents`, no `experimental.useCache`, and no `output`. The deploy builder (`averion/deploy/pin-next-build.mjs`) injects only `generateBuildId` and `experimental.cpus: 1` at image build time.
