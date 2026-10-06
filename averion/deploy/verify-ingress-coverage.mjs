import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decide, loadPolicy, matchRoute } from "./ingress-edge.mjs";

const root = join(import.meta.dirname, "../..");

function walk(dir, predicate, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, predicate, acc);
    else if (predicate(full)) acc.push(full.slice(root.length + 1));
  }
  return acc;
}

const appFiles = walk(join(root, "app"), (full) => full.endsWith("/route.ts") || full.endsWith("/page.tsx"));
const publicFiles = walk(join(root, "public"), () => true);
const policy = loadPolicy();
const sources = new Set(policy.routes.map((route) => route.source));

const missingApp = appFiles.filter((file) => !sources.has(file));
const missingPublic = publicFiles.filter((file) => !sources.has(file));
const dangling = [...sources].filter((source) => {
  if (source === "next:runtime") return false;
  return !appFiles.includes(source) && !publicFiles.includes(source);
});

const publicRequired = policy.routes.filter((route) => route.classification === "PUBLIC_REQUIRED");
const publicRequiredOk = publicRequired.every(
  (route) =>
    route.pattern === "/api/webhook" &&
    route.listeners.length === 1 &&
    route.listeners[0] === "public" &&
    (route.methods.every((method) => method === "GET" || method === "HEAD") ||
      route.methods.every((method) => method === "POST"))
);

const deniedAdmin = [
  ["POST", "/api/instagram/conversations"],
  ["GET", "/inbox"],
  ["POST", "/api/automations"],
  ["PATCH", "/api/automations"],
  ["DELETE", "/api/automations"],
  ["POST", "/api/automations/import"],
  ["POST", "/api/automations/duplicate"],
  ["GET", "/automations/new"],
  ["GET", "/campaigns/new"],
  ["GET", "/campaigns/import"],
  ["GET", "/campaigns/abc/edit"],
  ["POST", "/api/zernio/webhook/workspace"],
];

const adminDenied = deniedAdmin.every(([method, path]) => {
  const decision = decide("public", method, path);
  const route = matchRoute(method, path);
  return decision.decision === "DENIED" && route && route.classification === "DENY" && route.listeners.length === 0;
});

const listenerConsistency = policy.routes.every((route) => {
  if (route.classification === "DENY") return route.listeners.length === 0;
  return route.listeners.every((listener) => policy.listeners[listener]?.accepts.includes(route.classification));
});

const classes = new Set(["PUBLIC_REQUIRED", "PRIVATE_SERVICE", "OPS_ONLY", "DENY"]);
const classOk = policy.routes.every((route) => classes.has(route.classification));

const result = {
  appFiles: appFiles.length,
  publicFiles: publicFiles.length,
  routes: policy.routes.length,
  missingApp,
  missingPublic,
  dangling,
  publicRequired: publicRequired.map((route) => ({ id: route.id, methods: route.methods, pattern: route.pattern })),
  publicRequiredOk,
  adminDenied,
  listenerConsistency,
  classOk,
  pass: missingApp.length === 0 && missingPublic.length === 0 && dangling.length === 0 && publicRequiredOk && adminDenied && listenerConsistency && classOk,
};

const out = join(root, "averion/artifacts/ingress-coverage.json");
writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ pass: result.pass, missingApp, missingPublic, dangling, publicRequiredOk, adminDenied, listenerConsistency, classOk }));
process.exit(result.pass ? 0 : 1);
