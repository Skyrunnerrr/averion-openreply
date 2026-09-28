import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const policyPath = join(dirname(fileURLToPath(import.meta.url)), "ingress-policy.json");
const policy = JSON.parse(readFileSync(policyPath, "utf8"));

function segments(path) {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return [];
  return clean.split("/").filter(Boolean);
}

function matchPattern(pattern, path) {
  const patternSegments = pattern === "/" ? [] : pattern.split("/").filter(Boolean);
  const pathSegments = segments(path);
  let index = 0;
  let staticCount = 0;
  let wildcard = false;

  for (let i = 0; i < patternSegments.length; i += 1) {
    const part = patternSegments[i];
    if (part.startsWith(":") && part.endsWith("*")) {
      if (index >= pathSegments.length || i !== patternSegments.length - 1) return null;
      wildcard = true;
      index = pathSegments.length;
      continue;
    }
    if (part.startsWith(":")) {
      if (index >= pathSegments.length) return null;
      wildcard = true;
      index += 1;
      continue;
    }
    if (index >= pathSegments.length || pathSegments[index] !== part) return null;
    staticCount += 1;
    index += 1;
  }

  if (index !== pathSegments.length) return null;
  return { score: staticCount * 10 + (wildcard ? 0 : 100) };
}

export function matchRoute(method, path) {
  const upper = method.toUpperCase();
  let best = null;
  for (const route of policy.routes) {
    if (!route.methods.includes(upper)) continue;
    const matched = matchPattern(route.pattern, path);
    if (!matched) continue;
    if (!best || matched.score > best.score) {
      best = { route, score: matched.score };
    }
  }
  return best?.route ?? null;
}

export function decide(listener, method, path) {
  const route = matchRoute(method, path);
  if (!route) {
    return {
      decision: "DENIED",
      classification: "DENY",
      reason: "unmatched",
      listener,
      method: method.toUpperCase(),
      path,
    };
  }
  const listenerConfig = policy.listeners[listener];
  const allowedHere =
    route.classification !== "DENY" &&
    listenerConfig &&
    route.listeners.includes(listener) &&
    listenerConfig.accepts.includes(route.classification);
  if (!allowedHere) {
    return {
      decision: "DENIED",
      classification: route.classification,
      reason: route.classification === "DENY" ? "classified-deny" : "listener-mismatch",
      id: route.id,
      listener,
      method: method.toUpperCase(),
      path,
    };
  }
  return {
    decision: "ALLOW",
    classification: route.classification,
    reason: "matched",
    id: route.id,
    listener,
    method: method.toUpperCase(),
    path,
  };
}

export function loadPolicy() {
  return policy;
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function pathnameOf(rawUrl) {
  const path = String(rawUrl ?? "/").split("?")[0];
  return path || "/";
}

function isForwardablePath(rawUrl) {
  return (
    typeof rawUrl === "string" &&
    rawUrl.startsWith("/") &&
    !rawUrl.startsWith("//") &&
    !rawUrl.includes("\\") &&
    !rawUrl.includes("\0") &&
    !rawUrl.includes("://")
  );
}

export function parseUpstream(value) {
  if (!value || typeof value !== "string") return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (!url.hostname) return null;
  return url;
}

export function selectForwardHeaders(incoming, upstreamHost) {
  const headers = {};
  for (const [key, value] of Object.entries(incoming ?? {})) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "host") continue;
    headers[lower] = value;
  }
  headers.host = upstreamHost;
  return headers;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function visibleDecision(result) {
  return { ...result, path: pathnameOf(result.path) };
}

function writeJson(response, status, decision, payload) {
  response.writeHead(status, {
    "content-type": "application/json",
    "x-ingress-decision": decision,
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function logIngress(method, rawUrl, decision, status) {
  console.log(
    JSON.stringify({
      event: "ingress",
      method,
      path: pathnameOf(rawUrl),
      decision,
      status,
    })
  );
}

function proxyToUpstream(request, response, upstream, rawUrl, body) {
  return new Promise((resolve, reject) => {
    const headers = selectForwardHeaders(request.headers, upstream.host);
    const method = request.method ?? "GET";
    if (body.length > 0 || (method !== "GET" && method !== "HEAD")) {
      headers["content-length"] = String(body.length);
    } else {
      delete headers["content-length"];
    }
    const transport = upstream.protocol === "https:" ? httpsRequest : httpRequest;
    const proxyReq = transport(
      {
        protocol: upstream.protocol,
        hostname: upstream.hostname,
        port: upstream.port || (upstream.protocol === "https:" ? 443 : 80),
        method,
        path: rawUrl,
        headers,
      },
      (proxyRes) => {
        const responseHeaders = {};
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (HOP_BY_HOP.has(key.toLowerCase())) continue;
          responseHeaders[key] = value;
        }
        responseHeaders["x-ingress-decision"] = "ALLOW";
        responseHeaders["cache-control"] = "no-store";
        response.writeHead(proxyRes.statusCode ?? 502, responseHeaders);
        proxyRes.on("end", resolve);
        proxyRes.on("error", reject);
        proxyRes.pipe(response);
      }
    );
    proxyReq.setTimeout(10_000, () => proxyReq.destroy(new Error("upstream-timeout")));
    proxyReq.on("error", reject);
    if (body.length > 0) proxyReq.write(body);
    proxyReq.end();
  });
}

export function startListener(listener, port, host = "127.0.0.1", options = {}) {
  const upstream = parseUpstream(options.upstream ?? null);
  const server = createServer((request, response) => {
    void handleRequest(request, response, listener, upstream).catch(() => {
      if (!response.headersSent) {
        writeJson(response, 502, "DENIED", {
          decision: "DENIED",
          reason: "edge-error",
          listener,
        });
      } else {
        response.destroy();
      }
      logIngress(request.method ?? "GET", pathnameOf(request.url), "DENIED", 502);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, host, () => resolve(server));
  });
}

async function handleRequest(request, response, listener, upstream) {
  const method = request.method ?? "GET";
  const rawUrl = request.url ?? "/";
  const body = await readBody(request);
  const result = decide(listener, method, rawUrl);
  const allow =
    result.decision === "ALLOW" &&
    (listener !== "public" || result.classification === "PUBLIC_REQUIRED") &&
    isForwardablePath(rawUrl);

  if (!allow) {
    writeJson(response, 403, "DENIED", visibleDecision({ ...result, decision: "DENIED" }));
    logIngress(method, rawUrl, "DENIED", 403);
    return;
  }

  if (!upstream) {
    writeJson(response, 503, "DENIED", {
      decision: "DENIED",
      reason: "upstream-unconfigured",
      listener,
      method: method.toUpperCase(),
      path: pathnameOf(rawUrl),
    });
    logIngress(method, rawUrl, "DENIED", 503);
    return;
  }

  await proxyToUpstream(request, response, upstream, rawUrl, body);
  logIngress(method, rawUrl, "ALLOW", response.statusCode);
}

function startFromEnv() {
  const listener = process.env.INGRESS_LISTENER ?? "public";
  if (listener !== "public" && process.env.INGRESS_ALLOW_NON_PUBLIC !== "1") {
    console.error(JSON.stringify({ event: "ingress-refused", reason: "only-public-listener-may-bind" }));
    process.exit(1);
  }
  const upstream = parseUpstream(process.env.OPENREPLY_UPSTREAM_URL ?? "http://web:3000");
  if (!upstream) {
    console.error(JSON.stringify({ event: "ingress-refused", reason: "upstream-unconfigured" }));
    process.exit(1);
  }
  const port = Number(process.env.INGRESS_PORT ?? 8080);
  const host = process.env.INGRESS_BIND ?? "0.0.0.0";
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(JSON.stringify({ event: "ingress-refused", reason: "invalid-port" }));
    process.exit(1);
  }
  return startListener(listener, port, host, { upstream: upstream.origin }).then(() => {
    console.log(JSON.stringify({ event: "ingress-listen", listener, port }));
  });
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith("ingress-edge.mjs");
if (invokedDirectly) {
  startFromEnv().catch(() => {
    console.error(JSON.stringify({ event: "ingress-refused", reason: "startup-failed" }));
    process.exit(1);
  });
}
