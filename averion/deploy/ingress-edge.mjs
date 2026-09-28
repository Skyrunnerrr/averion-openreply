import { createServer } from "node:http";
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

export function startListener(listener, port, host = "127.0.0.1") {
  const server = createServer((request, response) => {
    const result = decide(listener, request.method ?? "GET", request.url ?? "/");
    const status = result.decision === "ALLOW" ? 204 : 403;
    response.writeHead(status, {
      "content-type": "application/json",
      "x-ingress-decision": result.decision,
      "cache-control": "no-store",
    });
    if (status === 204) {
      response.end();
      return;
    }
    response.end(JSON.stringify(result));
  });
  return new Promise((resolve) => {
    server.listen(port, host, () => resolve(server));
  });
}
