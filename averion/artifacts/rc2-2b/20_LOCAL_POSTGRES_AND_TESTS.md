# 20 LOCAL POSTGRES AND TESTS

No production database, customer data, or production secret was used.

## DB_BOOTSTRAP

Local PostgreSQL 16.15 from the Ubuntu package `postgresql` (cluster `16/main`, port 5432, listen localhost). A new role and database were created for this run only: role `openreply_local`, database `openreply_local`. The password is a disposable local value and is not recorded here.

Redis for health, queue, and the worker was local `redis-server` 7.0.15 bound to `127.0.0.1:6379` with persistence disabled (`--save "" --appendonly no`). It is not a production instance.

## MIGRATIONS

`DATABASE_URL` pointed at `openreply_local`. `npx prisma migrate deploy` applied 22 migrations, ending at `20260917160000_tracked_link_position`. Exit 0.

The tracked-link suite does not use that public schema for its assertions. It creates `tracked_link_order_<random>`, applies the migration SQL itself, and drops the schema in `afterAll`.

## SCHEMA_READY

SCHEMA_READY=YES

`SELECT count(*) FROM "_prisma_migrations"` on `openreply_local` returned 22 before the image runtime checks.

## DB_TESTS

Command:

`TEST_DATABASE_URL=postgresql://openreply_local@127.0.0.1:5432/openreply_local npx vitest run __tests__/tracked-link-order.db.test.ts`

DB_TESTS_FILE=`__tests__/tracked-link-order.db.test.ts`
DB_TESTS_PASS=12
DB_TESTS_FAIL=0
DB_TESTS_SKIP=0
DB_TESTS_RESULT=PASS

Duration 1.09s. Vitest exit 0.

POSTGRES_LOCAL_TEST=PASS
