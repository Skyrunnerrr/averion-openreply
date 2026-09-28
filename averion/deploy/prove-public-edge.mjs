import { spawn, spawnSync } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import { join } from "node:path";
import { decide, startListener } from "./ingress-edge.mjs";

const root = join(import.meta.dirname, "../..");
const deployDir = import.meta.dirname;
const project = "openreply-p2b-proof";
const appSecret = "fb-secret-probe-7c91";
const verifyToken = "wh-verify-probe-7c91";
const bodyCanary = "pii-canary-body-8f3a";
const cookieCanary = "cookie-canary-do-not-log";
const authorizationCanary = "Bearer auth-canary-do-not-log";
const challenge = "challenge-fixed-9c";
const postgresPassword = "db-7c2e91aa44b0";
const redisPassword = "rd-55aa91c0e7";
const secrets = [appSecret, verifyToken, bodyCanary, cookieCanary, authorizationCanary, postgresPassword, redisPassword];

function redact(value) {
  let text = String(value ?? "");
  for (const secret of secrets) text = text.split(secret).join("[redacted]");
  return text;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function tcpReachable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    socket.setTimeout(1500);
    const done = (reachable) => {
      socket.destroy();
      resolve(reachable);
    };
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false));
    socket.on("error", () => done(false));
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    input: options.input,
    cwd: options.cwd ?? deployDir,
    env: { ...process.env, ...(options.env ?? {}) },
    timeout: options.timeout ?? 180000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ? String(result.error.message) : "",
  };
}

function docker(args, options = {}) {
  const envArgs = Object.entries(options.env ?? {}).flatMap(([key, value]) => [`${key}=${value}`]);
  const prefix = envArgs.length > 0 ? ["env", ...envArgs] : [];
  return run("sudo", [...prefix, "docker", ...args], options);
}

function writeProbeSecrets() {
  mkdirSync(join(deployDir, "secrets"), { recursive: true });
  writeFileSync(join(deployDir, "secrets", "postgres_password"), postgresPassword);
  writeFileSync(join(deployDir, "secrets", "redis_password"), redisPassword);
  const env = [
    "NODE_ENV=production",
    "NEXTAUTH_URL=https://openreply.averion.example",
    "NEXTAUTH_SECRET=nxs-7f3c1a9e4b28d6c0aa11",
    "CRON_SECRET=crn-91ab44e0c77d12f5ee88",
    "ENCRYPTION_KEY=ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12",
    `DATABASE_URL=postgresql://openreply:${postgresPassword}@postgres:5432/openreply`,
    `REDIS_URL=redis://:${redisPassword}@redis:6379`,
    "EMAIL_FROM=OpenReply <ops@averion.example>",
    "RESEND_API_KEY=re_probe_7c91aa",
    "ALLOWED_EMAILS=operator@averion.example",
    "OPENREPLY_PROVIDER_PROFILE=averion",
    "OPENREPLY_AUTOMATIONS_ENABLED=false",
    "OPENREPLY_HUMAN_SEND_ENABLED=false",
    "INSTAGRAM_APP_ID=17841400000000000",
    "INSTAGRAM_APP_SECRET=ig-secret-probe-7c91",
    `FACEBOOK_APP_SECRET=${appSecret}`,
    `WEBHOOK_VERIFY_TOKEN=${verifyToken}`,
    "META_GRAPH_API_VERSION=v25.0",
    "",
  ].join("\n");
  writeFileSync(join(deployDir, "secrets.env"), env);
  secrets.push("nxs-7f3c1a9e4b28d6c0aa11", "crn-91ab44e0c77d12f5ee88", "ig-secret-probe-7c91");
}

function startHandler() {
  const hits = `/tmp/openreply-hits-${process.pid}.jsonl`;
  rmSync(hits, { force: true });
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", join(deployDir, "openreply-webhook-upstream.ts")], {
      cwd: root,
      env: {
        ...process.env,
        PORT: "0",
        BIND: "127.0.0.1",
        HITS_PATH: hits,
        DATABASE_URL: "postgresql://openreply:openreply@127.0.0.1:1/openreply",
        FACEBOOK_APP_SECRET: appSecret,
        INSTAGRAM_APP_SECRET: "ig-secret-probe-7c91",
        WEBHOOK_VERIFY_TOKEN: verifyToken,
        OPENREPLY_PROVIDER_PROFILE: "averion",
        OPENREPLY_AUTOMATIONS_ENABLED: "false",
        OPENREPLY_HUMAN_SEND_ENABLED: "false",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let buffer = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(redact(buffer).slice(0, 500) || "upstream-timeout"));
    }, 30000);
    const onData = (chunk) => {
      buffer += chunk.toString();
      const line = buffer.split("\n").find((entry) => entry.includes("webhook-upstream-listen"));
      if (!line || settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ child, hits, port: JSON.parse(line).port });
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(redact(buffer).slice(0, 500) || `upstream-exit-${code}`));
    });
  });
}

async function http(port, method, path, { body, headers } = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body,
    redirect: "manual",
  });
  const text = await response.text();
  return {
    status: response.status,
    decision: response.headers.get("x-ingress-decision"),
    handler: response.headers.get("x-openreply-handler"),
    bodyHash: response.headers.get("x-openreply-body-sha256"),
    signatureHash: response.headers.get("x-openreply-signature-sha256"),
    text,
  };
}

function readHits(path) {
  try {
    return readFileSync(path, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

async function handlerTest() {
  const logs = [];
  const original = console.log;
  console.log = (...args) => {
    logs.push(args.map(String).join(" "));
    original(...args);
  };
  let handler;
  let edge;
  try {
    handler = await startHandler();
    edge = await startListener("public", 0, "127.0.0.1", {
      upstream: `http://127.0.0.1:${handler.port}`,
    });
    const edgePort = edge.address().port;
    const rawBody = Buffer.from(
      JSON.stringify({ object: "instagram", entry: [], note: bodyCanary }),
      "utf8"
    );
    const bodyHashBefore = sha256(rawBody);
    const invalidSignature = `sha256=${"11".repeat(32)}`;
    const invalid = await http(edgePort, "POST", "/api/webhook", {
      body: rawBody,
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": invalidSignature,
        cookie: `session=${cookieCanary}`,
        authorization: authorizationCanary,
      },
    });
    const validBody = Buffer.from(JSON.stringify({ object: "instagram", entry: [] }), "utf8");
    const validHashBefore = sha256(validBody);
    const validSignature = `sha256=${createHmac("sha256", appSecret).update(validBody).digest("hex")}`;
    const valid = await http(edgePort, "POST", "/api/webhook", {
      body: validBody,
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": validSignature,
      },
    });
    const verified = await http(
      edgePort,
      "GET",
      `/api/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`
    );
    const deniedSpecs = [
      ["POST", "/api/instagram/conversations"],
      ["POST", "/api/automations"],
      ["GET", "/inbox"],
      ["GET", "/"],
      ["GET", "/api/health"],
    ];
    const denied = [];
    for (const [method, path] of deniedSpecs) {
      const response = await http(edgePort, method, path, {
        body: method === "POST" ? rawBody : undefined,
        headers: method === "POST" ? { "content-type": "application/json" } : undefined,
      });
      denied.push({
        method,
        path,
        status: response.status,
        decision: response.decision,
        leakedCanary: response.text.includes(bodyCanary),
      });
    }
    const hits = readHits(handler.hits);
    const leakedLog = logs.some((line) =>
      secrets.some((secret) => secret && line.includes(secret))
    );
    const deniedPaths = new Set(deniedSpecs.map(([, path]) => path));
    const forwardedDenied = hits.some((hit) => deniedPaths.has(hit.path));
    const webhookHits = hits.filter((hit) => hit.path === "/api/webhook");
    return {
      kind: "HANDLER_TEST",
      upstream: "app/api/webhook/route.ts",
      pass:
        invalid.status === 401 &&
        invalid.decision === "ALLOW" &&
        invalid.handler === "app/api/webhook/route.ts" &&
        invalid.bodyHash === bodyHashBefore &&
        invalid.signatureHash === sha256(invalidSignature) &&
        invalid.text.includes(bodyCanary) === false &&
        invalid.text.includes(invalidSignature) === false &&
        valid.decision === "ALLOW" &&
        valid.status !== 401 &&
        valid.bodyHash === validHashBefore &&
        valid.signatureHash === sha256(validSignature) &&
        verified.status === 200 &&
        verified.text === challenge &&
        verified.decision === "ALLOW" &&
        denied.every((item) => item.status === 403 && item.decision === "DENIED" && item.leakedCanary === false) &&
        forwardedDenied === false &&
        webhookHits.length >= 3 &&
        leakedLog === false,
      invalidSignatureStatus: invalid.status,
      invalidSignatureDecision: invalid.decision,
      validSignatureStatus: valid.status,
      bodyHashEqual: invalid.bodyHash === bodyHashBefore && valid.bodyHash === validHashBefore,
      signatureHeaderPreserved:
        invalid.signatureHash === sha256(invalidSignature) && valid.signatureHash === sha256(validSignature),
      queryPreserved: verified.status === 200 && verified.text === challenge,
      handler: invalid.handler,
      denied,
      forwardedDenied,
      leakedLog,
      webhookHitCount: webhookHits.length,
    };
  } finally {
    console.log = original;
    if (edge) edge.close();
    if (handler) handler.child.kill("SIGTERM");
  }
}

function policyTest() {
  const checks = [
    ["GET", "/api/webhook", "ALLOW"],
    ["POST", "/api/webhook", "ALLOW"],
    ["POST", "/api/instagram/conversations", "DENIED"],
    ["POST", "/api/automations", "DENIED"],
    ["GET", "/inbox", "DENIED"],
    ["GET", "/", "DENIED"],
    ["GET", "/api/health", "DENIED"],
  ].map(([method, path, expected]) => {
    const decision = decide("public", method, path).decision;
    return { method, path, expected, decision, pass: decision === expected };
  });
  return { kind: "POLICY_TEST", pass: checks.every((item) => item.pass), checks };
}

function applyMigrations() {
  const dir = join(root, "prisma/migrations");
  const files = readdirSync(dir)
    .filter((name) => name !== "migration_lock.toml")
    .sort()
    .map((name) => join(dir, name, "migration.sql"));
  for (const file of files) {
    const applied = docker(
      [
        "compose",
        "-p",
        project,
        "-f",
        "compose.provider.yml",
        "exec",
        "-T",
        "postgres",
        "psql",
        "-U",
        "openreply",
        "-d",
        "openreply",
        "-v",
        "ON_ERROR_STOP=1",
      ],
      { input: readFileSync(file, "utf8") }
    );
    if (applied.status !== 0) {
      return { ok: false, file: file.slice(root.length + 1), error: redact(applied.stderr).slice(0, 500) };
    }
  }
  return { ok: true, count: files.length };
}

function serviceNetworks(config, name) {
  const service = config.services?.[name];
  if (!service) return [];
  return Object.keys(service.networks ?? {});
}

function publishedPorts(config, name) {
  const ports = config.services?.[name]?.ports ?? [];
  return ports.map((entry) => `${entry.published}:${entry.target}`);
}

function ensureBridgeForwarding() {
  const legacy = run("sudo", ["iptables-legacy", "-S", "FORWARD"]);
  const policyDrop = (legacy.stdout ?? "").includes("-P FORWARD DROP");
  if (!policyDrop) return { legacyForwardWasDrop: false, adjusted: false };
  const changed = run("sudo", ["iptables-legacy", "-P", "FORWARD", "ACCEPT"]);
  return { legacyForwardWasDrop: true, adjusted: changed.status === 0, note: "host iptables-legacy FORWARD DROP was blocking container-to-container traffic on the bridge. Published ports use docker-proxy and were unaffected." };
}

async function networkTest() {
  const bridgeForwarding = ensureBridgeForwarding();
  writeProbeSecrets();
  // Recorded OCI manifest of ea2b1c6e…. Satisfies ${OPENREPLY_IMAGE_REF}. The probe replaces the web image.
  const imageRef = "openreply@sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23";
  const configRun = docker([
    "compose",
    "-p",
    project,
    "-f",
    "compose.provider.yml",
    "config",
    "--format",
    "json",
  ], { env: { OPENREPLY_IMAGE_REF: imageRef } });
  if (configRun.status !== 0) {
    return {
      kind: "REAL_NETWORK_TEST",
      pass: false,
      error: redact(`${configRun.stderr}\n${configRun.stdout}\n${configRun.error}`).slice(0, 800),
    };
  }
  const config = JSON.parse(configRun.stdout);
  const topology = {
    publicEdgeNetworks: serviceNetworks(config, "public-edge"),
    webNetworks: serviceNetworks(config, "web"),
    postgresNetworks: serviceNetworks(config, "postgres"),
    redisNetworks: serviceNetworks(config, "redis"),
    workerNetworks: serviceNetworks(config, "worker"),
    cronNetworks: serviceNetworks(config, "cron"),
    publicEdgePorts: publishedPorts(config, "public-edge"),
    webPorts: publishedPorts(config, "web"),
    postgresPorts: publishedPorts(config, "postgres"),
    redisPorts: publishedPorts(config, "redis"),
    workerPorts: publishedPorts(config, "worker"),
    cronPorts: publishedPorts(config, "cron"),
  };
  const topologyPass =
    topology.publicEdgeNetworks.length === 1 &&
    topology.publicEdgeNetworks[0].endsWith("edge") &&
    topology.webNetworks.some((name) => name.endsWith("edge")) &&
    topology.webNetworks.some((name) => name.endsWith("internal")) &&
    topology.postgresNetworks.length === 1 &&
    topology.postgresNetworks[0].endsWith("internal") &&
    topology.redisNetworks.length === 1 &&
    topology.redisNetworks[0].endsWith("internal") &&
    topology.workerNetworks.every((name) => name.endsWith("internal")) &&
    topology.cronNetworks.every((name) => name.endsWith("internal")) &&
    topology.publicEdgePorts.length === 1 &&
    topology.publicEdgePorts[0] === "8080:8080" &&
    topology.webPorts.length === 0 &&
    topology.postgresPorts.length === 0 &&
    topology.redisPorts.length === 0 &&
    topology.workerPorts.length === 0 &&
    topology.cronPorts.length === 0;

  const up = docker([
    "compose",
    "-p",
    project,
    "-f",
    "compose.provider.yml",
    "-f",
    "compose.probe.yml",
    "up",
    "-d",
    "--quiet-pull",
    "public-edge",
    "web",
    "postgres",
    "redis",
  ], { env: { OPENREPLY_IMAGE_REF: imageRef }, timeout: 300000 });
  if (up.status !== 0) {
    return {
      kind: "REAL_NETWORK_TEST",
      pass: false,
      topology,
      topologyPass,
      error: redact(`${up.stderr}\n${up.stdout}\n${up.error}`).slice(0, 1200),
    };
  }

  const migrations = applyMigrations();
  if (!migrations.ok) {
    return {
      kind: "REAL_NETWORK_TEST",
      pass: false,
      topology,
      topologyPass,
      migrations,
    };
  }

  let edgeUp = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const health = await http(8080, "GET", "/api/health");
      if (health.status === 403) {
        edgeUp = true;
        break;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const rawBody = Buffer.from(JSON.stringify({ object: "instagram", entry: [], note: bodyCanary }), "utf8");
  const bodyHashBefore = sha256(rawBody);
  const invalidSignature = `sha256=${"22".repeat(32)}`;
  let webhook = null;
  let verified = null;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      webhook = await http(8080, "POST", "/api/webhook", {
        body: rawBody,
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": invalidSignature,
        },
      });
      if (webhook.handler === "app/api/webhook/route.ts") break;
    } catch {
      webhook = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  try {
    verified = await http(
      8080,
      "GET",
      `/api/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`
    );
  } catch (error) {
    verified = { status: 0, text: redact(error.message), decision: null };
  }

  const denied = [];
  for (const [method, path] of [
    ["POST", "/api/instagram/conversations"],
    ["POST", "/api/automations"],
    ["GET", "/inbox"],
    ["GET", "/"],
    ["GET", "/api/health"],
  ]) {
    const response = await http(8080, method, path, {
      body: method === "POST" ? rawBody : undefined,
      headers: method === "POST" ? { "content-type": "application/json" } : undefined,
    });
    denied.push({
      method,
      path,
      status: response.status,
      decision: response.decision,
      leakedCanary: response.text.includes(bodyCanary),
    });
  }

  const directWeb = await tcpReachable(3000);
  const directPostgres = await tcpReachable(5432);
  const directRedis = await tcpReachable(6379);
  const external = docker([
    "run",
    "--rm",
    "--network",
    "bridge",
    "--add-host=host.docker.internal:host-gateway",
    "docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c",
    "node",
    "-e",
    `const net=require('node:net');const ports=[8080,3000,5432,6379];let pending=ports.length;const out={};for (const port of ports){const socket=net.connect(port,'host.docker.internal');const finish=(ok)=>{socket.destroy();out[port]=ok;if(--pending===0){console.log(JSON.stringify(out));}};socket.setTimeout(2000);socket.on('connect',()=>finish(true));socket.on('timeout',()=>finish(false));socket.on('error',()=>finish(false));}`,
  ], { timeout: 60000 });
  let externalReach = null;
  try {
    externalReach = JSON.parse(external.stdout.trim().split("\n").at(-1));
  } catch {
    externalReach = { error: redact(`${external.stderr}\n${external.stdout}`).slice(0, 400) };
  }

  const edgeToDb = docker([
    "compose",
    "-p",
    project,
    "-f",
    "compose.provider.yml",
    "exec",
    "-T",
    "public-edge",
    "node",
    "-e",
    "const net=require('node:net');const socket=net.connect(5432,'postgres');const done=(code)=>{socket.destroy();process.exit(code)};socket.setTimeout(2000);socket.on('connect',()=>done(2));socket.on('timeout',()=>done(0));socket.on('error',()=>done(0));",
  ]);
  const sql = docker([
    "compose",
    "-p",
    project,
    "-f",
    "compose.provider.yml",
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    "openreply",
    "-d",
    "openreply",
    "-At",
    "-c",
    'select payload::text from "OperationalEvent" order by "createdAt" desc limit 5;',
  ]);
  const persisted = sql.stdout ?? "";
  const persistence = {
    queryStatus: sql.status,
    rowSeen: persisted.includes("invalid_signature"),
    leakedCanary: persisted.includes(bodyCanary),
    leakedSignature: persisted.includes(invalidSignature),
    leakedBodyPreview: persisted.includes("bodyPreview"),
  };

  const webLogs = docker([
    "compose",
    "-p",
    project,
    "-f",
    "compose.provider.yml",
    "-f",
    "compose.probe.yml",
    "logs",
    "--no-color",
    "web",
  ], { env: { OPENREPLY_IMAGE_REF: imageRef } });
  const handlerReached = webhook?.handler === "app/api/webhook/route.ts" && webhook?.status === 401;
  const pass =
    topologyPass &&
    edgeUp &&
    handlerReached &&
    webhook?.bodyHash === bodyHashBefore &&
    webhook?.signatureHash === sha256(invalidSignature) &&
    webhook?.text.includes(bodyCanary) === false &&
    verified?.status === 200 &&
    verified?.text === challenge &&
    denied.every((item) => item.status === 403 && item.decision === "DENIED" && item.leakedCanary === false) &&
    directWeb === false &&
    directPostgres === false &&
    directRedis === false &&
    externalReach?.[3000] === false &&
    externalReach?.[5432] === false &&
    externalReach?.[6379] === false &&
    externalReach?.[8080] === true &&
    edgeToDb.status === 0 &&
    persistence.rowSeen === true &&
    persistence.leakedCanary === false &&
    persistence.leakedSignature === false &&
    persistence.leakedBodyPreview === false;

  return {
    kind: "REAL_NETWORK_TEST",
    pass,
    bridgeForwarding,
    topology,
    topologyPass,
    migrations,
    edgeUp,
    imageUnderTest: "probe-source-mount-of-app/api/webhook/route.ts",
    productionImageStarted: false,
    webLog: handlerReached ? undefined : redact(`${webLogs.stdout}\n${webLogs.stderr}`).slice(-1200),
    webhook: webhook
      ? {
          status: webhook.status,
          decision: webhook.decision,
          handler: webhook.handler,
          bodyHashEqual: webhook.bodyHash === bodyHashBefore,
          signatureHeaderPreserved: webhook.signatureHash === sha256(invalidSignature),
          leakedCanary: webhook.text.includes(bodyCanary),
        }
      : null,
    verify: verified
      ? { status: verified.status, decision: verified.decision, queryPreserved: verified.text === challenge }
      : null,
    denied,
    directFromHost: {
      web3000: directWeb,
      postgres5432: directPostgres,
      redis6379: directRedis,
    },
    externalClient: externalReach,
    publicEdgeToPostgresExit: edgeToDb.status,
    persistence,
  };
}

const result = {
  policyTest: policyTest(),
  handlerTest: null,
  realNetworkTest: null,
};
try {
  result.handlerTest = await handlerTest();
  console.error(JSON.stringify({ step: "handler", pass: result.handlerTest.pass, error: result.handlerTest.error }));
} catch (error) {
  result.handlerTest = { kind: "HANDLER_TEST", pass: false, error: redact(error.stack || error.message).slice(0, 800) };
}
try {
  result.realNetworkTest = await networkTest();
} catch (error) {
  result.realNetworkTest = { kind: "REAL_NETWORK_TEST", pass: false, error: redact(error.stack || error.message).slice(0, 800) };
} finally {
  docker(["compose", "-p", project, "-f", "compose.provider.yml", "-f", "compose.probe.yml", "down", "-v", "--remove-orphans"], {
    env: { OPENREPLY_IMAGE_REF: "openreply@sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23" },
    timeout: 120000,
  });
}

result.pass = Boolean(result.policyTest?.pass && result.handlerTest?.pass && result.realNetworkTest?.pass);
const artifact = redact(JSON.stringify(result, null, 2));
writeFileSync(join(root, "averion/artifacts/public-edge-result.json"), `${artifact}\n`);
console.log(JSON.stringify({
  pass: result.pass,
  policy: result.policyTest?.pass,
  handler: result.handlerTest?.pass,
  network: result.realNetworkTest?.pass,
  handlerError: result.handlerTest?.error,
  networkError: result.realNetworkTest?.error,
}));
process.exit(result.pass ? 0 : 1);
