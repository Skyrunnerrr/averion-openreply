# Next.js security upgrade path

RC2.2A does not canonicalize the runtime and does not freeze a lockfile.

| Fact | Value |
| --- | --- |
| NEXT_CURRENT_INSTALLED | 16.2.6 (`package-lock.json`, `next` and `eslint-config-next` both `^16.2.6`) |
| Published interim reference | 16.3.6, the current published security baseline as of 2026-09-28 |
| Scheduled security release | 16.3.7 on 2026-09-30 |
| NEXT_FINAL_TARGET | HOLD. RC2.2B re-checks the official baseline on or after 2026-09-30 and pins the exact version then. Expect 16.3.7 if that release is published. |

16.2.6 is inside the affected range for the 2026-09-22 `next/og` advisory and is not an acceptable freeze. 16.3.6 is the interim published reference only. Do not install 16.3.7 in RC2.2A. It is not released on 2026-09-28.

When RC2.2B runs:

1. Re-read the official Next.js security baseline. Do not assume 16.3.6 is still current.
2. Pin exact `next` and `eslint-config-next` to the same version. Do not leave a floating range.
3. Update only those two packages and the lockfile entries they require. No `npm audit fix --force`. No unrelated upgrades.
4. Run `npm ci`, then the regression matrix in `docs/averion/p2b/NEXT_REGRESSION_MATRIX.md`.
5. Review Server Actions again after the new build. A new app runtime source SHA is created by that bump. Do not reuse `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c` as the post-upgrade runtime SHA.

RC2.2B remediation (2026-10-06) pinned exact `next` and `eslint-config-next` to `16.3.8`. 16.3.7 stays rejected. The two unpublished September advisories are not closed by this pin. Image provenance from RC2.2A is not reused as the post-upgrade runtime.
