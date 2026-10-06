# 23 FULL SUITE RERUN

Command, from a clean dependency install (`npm ci`) plus `npx prisma generate`:

`TEST_DATABASE_URL` set to the disposable local database in `20_LOCAL_POSTGRES_AND_TESTS.md`

`npm test` (`vitest run`)

Result:

Test files: 38 passed (38).
Tests: 346 passed (346).
Failed: 0.
Skipped: 0.
Duration: 3.67s.
Exit: 0.

The baseline without `TEST_DATABASE_URL` was 334 passed and 12 skipped (346 total). This run is those 334 plus the 12 Postgres tests. No previously passing test failed.

TESTS_BEFORE=334_PASS_12_SKIP
TESTS_AFTER=346_PASS_0_SKIP
REGRESSION_VS_334=NO

The 12 tests still skip when `TEST_DATABASE_URL` is absent. That condition is explained in `18_SKIP_INVENTORY.md`. This execution set the variable, so the suite skipped nothing.
