import { decide, loadPolicy } from "./ingress-edge.mjs";

const HEX_32_BYTE = /^[a-f0-9]{64}$/i;
const PLACEHOLDER = /replace-with|your-instagram|your-facebook|re_\.\.\.|login@example\.com|0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef/i;

const REQUIRED = [
  "NODE_ENV",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
  "DATABASE_URL",
  "REDIS_URL",
  "EMAIL_FROM",
  "ALLOWED_EMAILS",
  "OPENREPLY_PROVIDER_PROFILE",
  "OPENREPLY_AUTOMATIONS_ENABLED",
  "OPENREPLY_HUMAN_SEND_ENABLED",
  "INSTAGRAM_APP_ID",
  "INSTAGRAM_APP_SECRET",
  "FACEBOOK_APP_SECRET",
  "WEBHOOK_VERIFY_TOKEN",
  "META_GRAPH_API_VERSION",
];

export function evaluateReadiness(env = process.env) {
  const failures = [];

  for (const name of REQUIRED) {
    if (!env[name] || env[name].trim() === "") failures.push(`${name} is missing`);
  }
  if (env.NODE_ENV !== "production") failures.push("NODE_ENV must be production");
  if ((env.OPENREPLY_PROVIDER_PROFILE ?? "").trim().toLowerCase() !== "averion") {
    failures.push("OPENREPLY_PROVIDER_PROFILE must be averion");
  }
  if ((env.OPENREPLY_AUTOMATIONS_ENABLED ?? "").trim().toLowerCase() !== "false") {
    failures.push("OPENREPLY_AUTOMATIONS_ENABLED must be false");
  }
  if ((env.OPENREPLY_HUMAN_SEND_ENABLED ?? "").trim().toLowerCase() !== "false") {
    failures.push("OPENREPLY_HUMAN_SEND_ENABLED must be false");
  }
  const allowlist = (env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (allowlist.length === 0) failures.push("ALLOWED_EMAILS must be a non-empty allowlist");
  if (env.ENCRYPTION_KEY && !HEX_32_BYTE.test(env.ENCRYPTION_KEY)) {
    failures.push("ENCRYPTION_KEY must be 64 hex characters");
  }
  if (env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length < 16) {
    failures.push("NEXTAUTH_SECRET must be at least 16 characters");
  }
  if (env.CRON_SECRET && env.NEXTAUTH_SECRET && env.CRON_SECRET === env.NEXTAUTH_SECRET) {
    failures.push("CRON_SECRET must not equal NEXTAUTH_SECRET");
  }
  if (!env.RESEND_API_KEY && !env.EMAIL_SERVER) {
    failures.push("RESEND_API_KEY or EMAIL_SERVER is required");
  }
  for (const name of [...REQUIRED, "RESEND_API_KEY", "EMAIL_SERVER"]) {
    const value = env[name];
    if (value && PLACEHOLDER.test(value)) failures.push(`${name} still has a placeholder value`);
  }
  if (env.DATABASE_URL && /localhost|127\.0\.0\.1/.test(env.DATABASE_URL)) {
    failures.push("DATABASE_URL must use the private compose hostname, not localhost");
  }
  if (env.REDIS_URL && /localhost|127\.0\.0\.1/.test(env.REDIS_URL)) {
    failures.push("REDIS_URL must use the private compose hostname, not localhost");
  }
  if (env.NEXTAUTH_URL && !env.NEXTAUTH_URL.startsWith("https://")) {
    failures.push("NEXTAUTH_URL must be https");
  }

  const policy = loadPolicy();
  const publicRoutes = policy.routes.filter((route) => route.listeners.includes("public"));
  if (
    publicRoutes.length !== 2 ||
    publicRoutes.some((route) => route.pattern !== "/api/webhook" || route.classification !== "PUBLIC_REQUIRED")
  ) {
    failures.push("public listener must expose only the Meta webhook");
  }
  for (const [method, path] of [
    ["POST", "/api/instagram/conversations"],
    ["GET", "/inbox"],
    ["POST", "/api/automations"],
    ["PATCH", "/api/automations"],
    ["POST", "/api/automations/import"],
    ["POST", "/api/automations/duplicate"],
  ]) {
    if (decide("public", method, path).decision !== "DENIED") {
      failures.push(`public ingress allows ${method} ${path}`);
    }
  }

  return { ready: failures.length === 0, failures };
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith("check-readiness.mjs");
if (invokedDirectly) {
  const result = evaluateReadiness();
  console.log(JSON.stringify(result));
  process.exit(result.ready ? 0 : 1);
}
