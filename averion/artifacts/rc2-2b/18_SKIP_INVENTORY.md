# 18 SKIP INVENTORY

Baseline suite: `npm test` without `TEST_DATABASE_URL` reports 334 passed and 12 skipped. Every skip is the same file. There is no other `describe.skip`, `it.skip`, or `test.skip` in the suite.

File: `__tests__/tracked-link-order.db.test.ts`

Gate: `describe.skipIf(!process.env.TEST_DATABASE_URL)`.

The variable read by the file is `TEST_DATABASE_URL`. It is not `DATABASE_URL`. When that variable is unset the file contributes 12 skipped tests. That is an explained conditional skip, not an empty reason.

Shared fields:

| Field | Value |
| --- | --- |
| FILE | `__tests__/tracked-link-order.db.test.ts` |
| CATEGORY | POSTGRES_REQUIRED |
| WHY | `describe.skipIf(!TEST_DATABASE_URL)`. No database URL was set in the baseline run. |
| DEPENDENCY | Disposable local Postgres. The suite creates a private schema, applies `prisma/migrations`, and drops that schema. |
| LOCAL_OR_EXTERNAL | LOCAL |
| SECURITY_RELEVANT | NO. The tests guard tracked-link order, not an auth or trust boundary. |
| RELEASE_RELEVANT | YES. Wrong button order is a release regression for campaign links. |
| CAN_RUN_LOCALLY | YES |
| REMEDIATION_REQUIRED | NO for this run. The skip stays correct when `TEST_DATABASE_URL` is absent. This run set it and the 12 tests passed. See `20_LOCAL_POSTGRES_AND_TESTS.md`. |
| STATUS | PASS |

| TEST_ID | NAME |
| --- | --- |
| TLO-01 | numbers existing links in the order they were created, ids breaking ties |
| TLO-02 | leaves updatedAt alone |
| TLO-03 | changes nothing when run again, as a retry after a failed deploy does |
| TLO-04 | adds a column that defaults to 0 for writes that do not set it |
| TLO-05 | keeps a duplicated campaign's buttons in order on the dashboard |
| TLO-06 | keeps order for links an older build writes while a deploy rolls out |
| TLO-07 | creates a campaign's two links at positions 0 and 1 |
| TLO-08 | keeps both URLs when a campaign created with two links is saved unchanged |
| TLO-09 | keeps both URLs when a migrated legacy campaign is saved |
| TLO-10 | keeps a third link in place when the first two are saved |
| TLO-11 | creates the second link once when two saves add it at the same time |
| TLO-12 | gives a duplicate positions 0 and 1 in the original's order |

SKIPS_TOTAL=12
SKIPS_EXPLAINED=12
SKIPS_UNEXPLAINED=0

No skip is UNKNOWN, OBSOLETE_TEST, EXTERNAL_SERVICE_REQUIRED, or LIVE_PROVIDER_REQUIRED.
