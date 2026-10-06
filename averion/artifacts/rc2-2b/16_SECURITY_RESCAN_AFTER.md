# 16 SECURITY RE-SCAN AFTER

Both audits are `npm audit --package-lock-only` (npm 10.9.7) against the lockfile. Exit code 1 in both cases because findings remain. The September 30 Next.js GHSAs are not in npm's reviewed advisory set, so this scan does not judge the 9/9 matrix. That judgment is in `12_ADVISORY_MATRIX_RERUN.md`.

## Totals (context only)

| | BEFORE (next 16.2.6 lockfile) | AFTER (next 16.3.8 lockfile) |
|---|---|---|
| critical | 4 | 3 |
| high | 20 | 17 |
| moderate | 6 | 6 |
| low | 2 | 2 |
| total | 32 | 28 |
| `next` listed | yes, critical, range through 16.3.5 | **absent** |

The drop is not treated as a clearance of the two unpublished advisories.

## `next` advisories npm reported before, and their state after

| Advisory | Sev | Before | After |
|---|---|---|---|
| GHSA-vcvr-r3jv-pc5j | critical | in audit via `next` | not listed. 16.3.8 is past 16.3.6. |
| GHSA-2xp9-vwfh-vxw4 | critical | in audit | not listed. Past 16.3.3. |
| GHSA-p293-qw3h-jr36 | critical | in audit | not listed. Past 16.3.3. |
| GHSA-6gpp-xcg3-4w24 | high | in audit | not listed. Past 16.2.11. |
| GHSA-m99w-x7hq-7vfj | high | in audit | not listed. Past 16.2.11. |
| GHSA-89xv-2m56-2m9x | high | in audit | not listed. Past 16.2.11. |
| GHSA-p9j2-gv94-2wf4 | high | in audit | not listed. Past 16.2.11. |
| GHSA-68g3, GHSA-4633, GHSA-4c39, GHSA-q8wf, GHSA-955p | moderate | in audit | not listed. Past 16.2.11. |

`postcss` and `sharp` were also on the before audit through `next`. After the pin, hoisted `postcss` is 8.5.23 and `sharp` is 0.35.5. Neither package is in the after audit.

## Still listed, not changed by this pin

| Package | Sev | Direct | Adjudication |
|---|---|---|---|
| next-auth | critical | yes | Triaged in `14_AUTH_SECURITY_TRIAGE.md`. Not upgraded. |
| @auth/core | critical | no | Same triage. Not upgraded. |
| @auth/prisma-adapter | critical | yes | No adapter GHSA. Flagged via `@auth/core@0.41.2`. Not upgraded. |
| eslint-config-next / @next/eslint-plugin-next | high | eslint-config-next is direct | Via `fast-glob` → `micromatch` → `braces`. npm's suggested fix is `eslint-config-next@14.2.35` with `semverMajor=true`. That is a downgrade off the 16 line, not a safe forward patch. Not applied. |
| nodemailer | high | yes | Many advisories. Suggested fix `nodemailer@10.0.15` is `semverMajor=true`. Out of scope. Not applied. |
| prisma, @prisma/config, mysql2, deepmerge-ts | high | prisma is direct | Suggested fix is a prisma major move to 6.19.3 while this repo is on prisma 7.8.0. The audit's "fix" is not a forward patch on this line. Not applied. |
| Remaining dev/transitive highs and moderates (brace-expansion, braces, browserslist, fast-uri, hono, js-yaml, micromatch, source-map-js, vite, vitest, and the moderates/lows) | mixed | no, except vitest | Not part of the next pin. Not audit-fixed. |

No `--force` fix was run.
