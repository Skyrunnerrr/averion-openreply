import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateReadiness } from "./check-readiness.mjs";

const root = join(import.meta.dirname, "../..");

const passing = {
  NODE_ENV: "production",
  NEXTAUTH_URL: "https://openreply.internal.example",
  NEXTAUTH_SECRET: "fixture-nextauth-secret-not-live",
  CRON_SECRET: "fixture-cron-secret-not-live",
  ENCRYPTION_KEY: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  DATABASE_URL: "postgresql://openreply:fixture@postgres:5432/openreply",
  REDIS_URL: "redis://:fixture@redis:6379",
  EMAIL_FROM: "OpenReply <login@internal.example>",
  RESEND_API_KEY: "fixture-resend-key-not-live",
  ALLOWED_EMAILS: "operator@internal.example",
  OPENREPLY_PROVIDER_PROFILE: "averion",
  OPENREPLY_AUTOMATIONS_ENABLED: "false",
  OPENREPLY_HUMAN_SEND_ENABLED: "false",
  INSTAGRAM_APP_ID: "fixture-app-id",
  INSTAGRAM_APP_SECRET: "fixture-ig-secret",
  FACEBOOK_APP_SECRET: "fixture-fb-secret",
  WEBHOOK_VERIFY_TOKEN: "fixture-verify-token",
  META_GRAPH_API_VERSION: "v25.0",
};

function run(name, env, expectReady) {
  const result = evaluateReadiness(env);
  return {
    name,
    expectReady,
    ready: result.ready,
    failures: result.failures,
    pass: result.ready === expectReady,
  };
}

const cases = [
  run("provider-contract", passing, true),
  run("empty-allowlist", { ...passing, ALLOWED_EMAILS: "" }, false),
  run("automations-enabled", { ...passing, OPENREPLY_AUTOMATIONS_ENABLED: "true" }, false),
  run("human-send-enabled", { ...passing, OPENREPLY_HUMAN_SEND_ENABLED: "true" }, false),
  run("upstream-profile", { ...passing, OPENREPLY_PROVIDER_PROFILE: "upstream" }, false),
  run("placeholder-secret", { ...passing, WEBHOOK_VERIFY_TOKEN: "replace-with-a-webhook-verify-token" }, false),
  run("cron-secret-reused", { ...passing, CRON_SECRET: passing.NEXTAUTH_SECRET }, false),
  run("localhost-database", { ...passing, DATABASE_URL: "postgresql://openreply:fixture@127.0.0.1:5432/openreply" }, false),
];

const output = {
  liveInfra: "SIMULATED",
  note: "Fixture values are not credentials and were not injected into a running service.",
  cases,
  pass: cases.every((item) => item.pass),
};

writeFileSync(join(root, "averion/artifacts/readiness-result.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ pass: output.pass, cases: cases.map((item) => ({ name: item.name, pass: item.pass, ready: item.ready })) }));
process.exit(output.pass ? 0 : 1);
