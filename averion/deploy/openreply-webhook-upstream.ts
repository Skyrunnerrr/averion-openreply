import { createHash } from "node:crypto";
import { appendFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { NextRequest } from "next/server";
import { GET, POST } from "../../app/api/webhook/route";

const hitsPath = process.env.HITS_PATH ?? "/tmp/openreply-upstream-hits.jsonl";

function pathnameOf(rawUrl: string) {
  return rawUrl.split("?")[0] || "/";
}

async function readBody(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

async function serve(request: IncomingMessage, response: ServerResponse) {
  const method = request.method ?? "GET";
  const rawUrl = request.url ?? "/";
  const body = await readBody(request);
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const signature = headerValue(request.headers["x-hub-signature-256"]);
  const signatureHash = createHash("sha256").update(signature).digest("hex");

  appendFileSync(
    hitsPath,
    `${JSON.stringify({ method, path: pathnameOf(rawUrl), bodyHash })}\n`
  );

  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
    else headers.set(key, value);
  }

  const nextRequest = new NextRequest(`http://web:3000${rawUrl}`, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" || body.length === 0 ? undefined : new Uint8Array(body),
  });
  const handler = method === "POST" ? POST : GET;
  const upstream = await handler(nextRequest);
  const payload = Buffer.from(await upstream.arrayBuffer());
  const responseHeaders: Record<string, string> = {
    "x-openreply-handler": "app/api/webhook/route.ts",
    "x-openreply-body-sha256": bodyHash,
    "x-openreply-signature-sha256": signatureHash,
    "cache-control": "no-store",
  };
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders["content-type"] = contentType;
  response.writeHead(upstream.status, responseHeaders);
  response.end(payload);
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.BIND ?? "0.0.0.0";
const server = createServer((request, response) => {
  void serve(request, response).catch(() => {
    if (!response.headersSent) {
      response.writeHead(500, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(JSON.stringify({ success: false, error: "handler-error" }));
    } else {
      response.destroy();
    }
  });
});

server.listen(port, host, () => {
  const address = server.address();
  const bound = address && typeof address === "object" ? address.port : port;
  console.log(JSON.stringify({ event: "webhook-upstream-listen", port: bound }));
});
