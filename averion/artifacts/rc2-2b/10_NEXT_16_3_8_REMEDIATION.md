# 10 NEXT 16.3.8 REMEDIATION

Run: AVERION_SOCIAL_OPENREPLY_RC2_2B_REMEDIATION_01
Baseline: `93a793aefe7c93f06b4bc2ffc464c277aad46353`
Package manager: npm 10.9.7, Node v22.14.0.
Command: `npm install next@16.3.8 eslint-config-next@16.3.8 --save-exact --package-lock-only --ignore-scripts`
Then `fastq` was restored to 1.20.1 (see below) and `npm ci` installed that lockfile.
No `npm audit fix` and no `--force`.

## FILES_CHANGED

| File | OLD | NEW | WHY |
|---|---|---|---|
| `package.json` `dependencies.next` | `^16.2.6` | `16.3.8` (exact, no caret) | Authorized pin |
| `package.json` `devDependencies.eslint-config-next` | `^16.2.6` | `16.3.8` (exact, no caret) | Keep `@next/eslint-plugin-next` on the same version as `next` |
| `package-lock.json` | next 16.2.6, sha256 `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` | next 16.3.8, sha256 `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7` | Deterministic lockfile for the pin |
| `__tests__/canonical-build-definition.test.ts` | expected `^16.2.6` | expected `16.3.8` | The suite asserted the pre-pin manifest. RC2.2B's own upgrade note requires the exact pin. |
| `docs/averion/p2b/NEXT_SECURITY_UPGRADE.md` | historical 16.2.6 / 16.3.6 / 16.3.7 text kept | appended the 16.3.8 pin record | Same note already said RC2.2B must pin the exact pair |
| `docs/averion/p2b/NEXT_REGRESSION_MATRIX.md` | every row `NOT_EXECUTED` | rows updated to what this run actually did | The matrix is the required post-pin check |
| `averion/deploy/canonical-builder.json` `LOCKFILE_SHA256` | `df7f69b3…389416` | `09d2d499…4873f6a7` | The image build checks this hash before `npm ci`. Left unchanged, the next image build would reject the new lockfile. |
| `averion/artifacts/lockfile.sha256` | old hash | new hash | Matches `sha256sum package-lock.json` |
| `averion/artifacts/rc2-2b/09`–`17` | absent | this evidence set | Required by the run |

Not changed: `next-auth`, `@auth/core`, `@auth/prisma-adapter`, `react`, `react-dom`, nodemailer, prisma, image provenance JSON, SBOM, license manifest. Those still describe the previous image or packages this run was not allowed to bump.

## LOCKFILE_CHANGE

One `node_modules/next` entry. Resolved `https://registry.npmjs.org/next/-/next-16.3.8.tgz`. No second copy.

## TRANSITIVE / PEER (no other direct package.json bumps)

| Package | OLD | NEW | WHY it moved |
|---|---|---|---|
| `@next/env`, `@next/swc-*` (8), `@next/eslint-plugin-next` | 16.2.6 | 16.3.8 | Exact dependencies of `next@16.3.8` / `eslint-config-next@16.3.8` |
| `@swc/helpers` | 0.5.15 | 0.5.23 | Exact dependency of `next@16.3.8` |
| `postcss` (hoisted) | 8.5.12 | 8.5.23 | `next@16.3.8` depends on `postcss@8.5.23` exactly. 8.5.23 also satisfies `@tailwindcss/postcss` `^8.5.6` and `vite` `^8.5.10`. |
| `next/node_modules/postcss` | 8.4.31 | removed | next 16.2.6 pinned that nested copy. 16.3.8 does not. |
| `nanoid` | 3.3.11 | 3.3.20 | `postcss@8.5.23` depends on `nanoid@^3.3.16`. 3.3.11 does not satisfy that range. |
| `sharp` and `@img/sharp-*` / `@img/sharp-libvips-*` | 0.34.5 / libvips 1.2.4 | 0.35.5 / libvips 1.3.4 | `next@16.3.8` optionalDependency is `sharp@^0.35.4`. 0.34.5 is outside that range. npm resolved the range to 0.35.5. New optional platform packages of sharp 0.35.5 (`freebsd-wasm32`, `webcontainers-wasm32`) came with it. |
| `sharp/node_modules/semver` | 7.7.4 | 7.8.5 | Dependency of the new sharp |
| `@emnapi/runtime` nested under `@img/sharp-wasm32` | (hoisted 1.10.0 only) | nested 1.11.3 | sharp-wasm32 0.35.5 depends on `@emnapi/runtime@^1.11.3` |
| `@tailwindcss/oxide-wasm32-wasi` nested optional deps | not materialized as separate lockfile nodes | lockfile nodes for the existing `bundleDependencies` | Package version stayed 4.2.4. Not a tailwind upgrade. |
| `fastq` | 1.20.1 | 1.20.1 (restored) | npm's refresh floated it to 1.20.3. `@nodelib/fs.walk` already accepts `^1.6.0`, so 1.20.1 was put back. `npm ci --dry-run` accepted that lockfile. |

Peers were not added. `react` / `react-dom` stayed 19.2.4. `next-auth` stayed 5.0.0-beta.31. `@auth/core` stayed 0.41.2.

## WHY

16.3.8 is the smallest stable release that contains the published Next fixes covering 16.2.6, including the 2026-09-30 set. See `09_TARGET_VALIDATION.md`. The two unpublished advisories are not fixed by this pin.
