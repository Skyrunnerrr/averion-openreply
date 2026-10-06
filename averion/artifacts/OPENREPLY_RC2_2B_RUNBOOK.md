# RC2.2B runbook (HOLD)

RC2.2B is not authorized. Do not run this sequence in RC2.2A.

`RC2_2B=WAITING_SECURITY_BASELINE_REFRESH`

`CANONICAL_IMAGE_ESTABLISHED=NO`

`COMPOSE_PROOF_AUTHORIZED=NO`

`MERGE=NO`

Hold reason: Next.js 16.3.7 is scheduled for 2026-09-30 with more security fixes. Do not freeze `package-lock.json`, a dual build, or an image digest on 16.3.6 while that release is two days away. Do not install unreleased 16.3.7.

When RC2.2B is explicitly authorized, run this order and stop on the first failure:

1. Refresh the official Next.js security baseline. Expect 16.3.7 on or after 2026-09-30. If the published patch is different, pin that exact version instead of a remembered number.
2. Pin exact `next` and `eslint-config-next` to the same version. No `npm audit fix --force`. No unrelated upgrades.
3. `npm ci`.
4. Run the regression matrix in `docs/averion/p2b/NEXT_REGRESSION_MATRIX.md`.
5. Review the two Server Actions again (`setLocale`, magic-link submission).
6. Commit the new app tree. That commit is the new `APP_RUNTIME_SOURCE_SHA`. Do not reuse `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`.
7. Build twice with the pinned canonical builder (`averion/deploy/bootstrap-canonical-builder.sh`), the same release-scoped Server Action secret, and platform `linux/amd64`.
8. Record the image digest only if both builds match. That digest is the first candidate that may be called canonical.
9. Compose proof against that digest.
10. Final review.
11. Native CI.
12. Human merge. RC2.2B still does not merge itself.

Historical digests `8f44…`, `34b5…`, and `3ceb…` stay historical. Do not adopt them as canonical.
