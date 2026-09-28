import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import { join } from "node:path";
import { decide, startListener } from "./ingress-edge.mjs";

const root = join(import.meta.dirname, "../..");
const PUBLIC_PORT = 18080;
const PRIVATE_PORT = 18081;
const OPS_PORT = 18082;
const WORKER_PORT = 19090;

function probeTcp(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve({ reachable: true });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ reachable: false, error: "timeout" });
    });
    socket.on("error", (error) => {
      resolve({ reachable: false, error: error.code ?? error.message });
    });
  });
}

async function request(port, method, path, body) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body,
    redirect: "manual",
  });
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }
  return {
    status: response.status,
    header: response.headers.get("x-ingress-decision"),
    body: parsed,
  };
}

const cases = [
  {
    name: "dashboard-direct-dm-ui",
    method: "GET",
    path: "/inbox",
    port: PUBLIC_PORT,
    expect: "DENIED",
  },
  {
    name: "dashboard-home",
    method: "GET",
    path: "/dashboard",
    port: PUBLIC_PORT,
    expect: "DENIED",
  },
  {
    name: "direct-conversations-post",
    method: "POST",
    path: "/api/instagram/conversations",
    port: PUBLIC_PORT,
    body: JSON.stringify({ recipientId: "external", text: "bypass" }),
    expect: "DENIED",
  },
  {
    name: "automation-create",
    method: "POST",
    path: "/api/automations",
    port: PUBLIC_PORT,
    body: JSON.stringify({ name: "external" }),
    expect: "DENIED",
  },
  {
    name: "automation-patch",
    method: "PATCH",
    path: "/api/automations",
    port: PUBLIC_PORT,
    body: JSON.stringify({ id: "x", isActive: true }),
    expect: "DENIED",
  },
  {
    name: "automation-import",
    method: "POST",
    path: "/api/automations/import",
    port: PUBLIC_PORT,
    body: JSON.stringify({}),
    expect: "DENIED",
  },
  {
    name: "automation-duplicate",
    method: "POST",
    path: "/api/automations/duplicate",
    port: PUBLIC_PORT,
    body: JSON.stringify({}),
    expect: "DENIED",
  },
  {
    name: "automation-admin-ui",
    method: "GET",
    path: "/automations/new",
    port: PUBLIC_PORT,
    expect: "DENIED",
  },
  {
    name: "private-listener-still-denies-send",
    method: "POST",
    path: "/api/instagram/conversations",
    port: PRIVATE_PORT,
    body: JSON.stringify({ recipientId: "operator", text: "bypass" }),
    expect: "DENIED",
  },
  {
    name: "private-listener-still-denies-automation-create",
    method: "POST",
    path: "/api/automations",
    port: PRIVATE_PORT,
    body: JSON.stringify({ name: "operator" }),
    expect: "DENIED",
  },
  {
    name: "polling-guessed-http",
    method: "POST",
    path: "/api/polling/reconcile",
    port: PUBLIC_PORT,
    expect: "DENIED",
  },
  {
    name: "cron-poll-not-public",
    method: "GET",
    path: "/api/cron/attach-next-reel",
    port: PUBLIC_PORT,
    expect: "DENIED",
  },
  {
    name: "zernio-webhook-not-public",
    method: "POST",
    path: "/api/zernio/webhook/workspace_1",
    port: PUBLIC_PORT,
    body: JSON.stringify({ account: { id: "1", platform: "instagram" } }),
    expect: "DENIED",
  },
  {
    name: "meta-webhook-verify-allowed",
    method: "GET",
    path: "/api/webhook?hub.mode=subscribe&hub.verify_token=x&hub.challenge=y",
    port: PUBLIC_PORT,
    expect: "ALLOW",
  },
  {
    name: "meta-webhook-post-allowed",
    method: "POST",
    path: "/api/webhook",
    port: PUBLIC_PORT,
    body: "{}",
    expect: "ALLOW",
  },
];

const upstreamHits = [];
const upstream = await new Promise((resolve) => {
  const server = createServer((request, response) => {
    upstreamHits.push({ method: request.method, path: (request.url ?? "/").split("?")[0] });
    request.resume();
    response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    response.end(JSON.stringify({ handler: "red-team-upstream" }));
  });
  server.listen(0, "127.0.0.1", () => resolve(server));
});
const upstreamPort = upstream.address().port;
const upstreamUrl = `http://127.0.0.1:${upstreamPort}`;

const servers = await Promise.all([
  startListener("public", PUBLIC_PORT, "127.0.0.1", { upstream: upstreamUrl }),
  startListener("private", PRIVATE_PORT, "127.0.0.1", { upstream: upstreamUrl }),
  startListener("ops", OPS_PORT, "127.0.0.1", { upstream: upstreamUrl }),
]);

const httpResults = [];
for (const item of cases) {
  const http = await request(item.port, item.method, item.path, item.body);
  const policy = decide(item.port === PUBLIC_PORT ? "public" : "private", item.method, item.path);
  const forwarded = upstreamHits.some(
    (hit) => hit.method === item.method && hit.path === item.path.split("?")[0]
  );
  const pass =
    item.expect === "DENIED"
      ? http.header === "DENIED" && http.status === 403 && forwarded === false
      : http.header === "ALLOW" && http.status === 200 && forwarded === true;
  httpResults.push({
    name: item.name,
    method: item.method,
    path: item.path.split("?")[0],
    listener: item.port === PUBLIC_PORT ? "public" : "private",
    expected: item.expect,
    status: http.status,
    decision: http.header,
    policy: policy.decision,
    pass,
  });
}

const compose = readFileSync(join(import.meta.dirname, "compose.provider.yml"), "utf8");
const portMappings = [...compose.matchAll(/^\s+-\s+"(\d+):(\d+)"/gm)].map((match) => `${match[1]}:${match[2]}`);
const composePublishesPorts = portMappings.length > 0;
const composePublishesOnlyPublicEdge = portMappings.length === 1 && portMappings[0] === "8080:8080";
const composeLeaksPrivatePorts = /^\s+-\s+"\d+:(3000|5432|6379)"/m.test(compose);
const imageLines = compose.split("\n").filter((line) => line.trim().startsWith("image:"));
const composePinsDigests = [
  "sha256:a85daf0dbd5e79586e850e3fe4b21b796799828ad015ce2166aeb98cc24da61c",
  "sha256:ca0acbb137c1dc3339c8b147a58fd6f42775d4599327b50e7b116c23de501af2",
].every((digest) => imageLines.some((line) => line.includes(digest)));
const composeHasMutableTag = imageLines.some((line) =>
  /:(latest|16|7-alpine|20-slim)\b/.test(line) || (line.includes("docker.io/") && !line.includes("@sha256:"))
);

const workerProbe = await probeTcp(WORKER_PORT);
const postgresProbe = await probeTcp(5432);
const redisProbe = await probeTcp(6379);
const unreachable = {
  worker: {
    port: WORKER_PORT,
    ...workerProbe,
    expected: "UNREACHABLE",
    pass: workerProbe.reachable === false,
  },
  postgres: {
    port: 5432,
    ...postgresProbe,
    expected: "UNREACHABLE",
    note: "Host port 5432 is the dev compose publish. This probe is from the deployment host namespace with the provider compose NOT running.",
    pass: postgresProbe.reachable === false,
  },
  redis: {
    port: 6379,
    ...redisProbe,
    expected: "UNREACHABLE",
    note: "Host port 6379 is the dev compose publish. This probe is from the deployment host namespace with the provider compose NOT running.",
    pass: redisProbe.reachable === false,
  },
};

const opsHealth = await request(OPS_PORT, "GET", "/api/health");
const hitsBeforePublicHealth = upstreamHits.length;
const publicHealth = await request(PUBLIC_PORT, "GET", "/api/health");
const publicHealthForwarded = upstreamHits.length !== hitsBeforePublicHealth;

const result = {
  kind: "PROXY_TEST",
  liveInfra: "SIMULATED",
  description:
    "POLICY decisions come from decide(). PROXY_TEST forwards ALLOW to a local upstream and returns 403 for DENY. This file does not start compose and is not the REAL_NETWORK_TEST.",
  http: httpResults,
  unreachable,
  controls: {
    opsHealth: { status: opsHealth.status, decision: opsHealth.header, pass: opsHealth.header === "ALLOW" && opsHealth.status === 200 },
    publicHealth: {
      status: publicHealth.status,
      decision: publicHealth.header,
      forwarded: publicHealthForwarded,
      pass: publicHealth.header === "DENIED" && publicHealth.status === 403 && publicHealthForwarded === false,
    },
  },
};

result.compose = {
  publishesHostPorts: composePublishesPorts,
  published: portMappings,
  publishesOnlyPublicEdge: composePublishesOnlyPublicEdge,
  leaksPrivatePorts: composeLeaksPrivatePorts,
  pinsProviderDigests: composePinsDigests,
  mutableTag: composeHasMutableTag,
  pass:
    composePublishesOnlyPublicEdge &&
    composeLeaksPrivatePorts === false &&
    composePinsDigests &&
    composeHasMutableTag === false,
};
result.pass =
  httpResults.every((item) => item.pass) &&
  unreachable.worker.pass &&
  result.controls.opsHealth.pass &&
  result.controls.publicHealth.pass &&
  result.compose.pass;

const out = join(root, "averion/artifacts/red-team-result.json");
writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ pass: result.pass, failed: httpResults.filter((item) => !item.pass), worker: unreachable.worker }));

for (const server of servers) server.close();
upstream.close();
process.exit(result.pass ? 0 : 1);
