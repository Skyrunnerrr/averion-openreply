import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockCreate = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    operationalEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock("@/lib/queue/process-webhook", () => ({
  processInstagramWebhook: vi.fn(),
}));

import { POST } from "../app/api/webhook/route";

const CANARY =
  "canary-pii-OR01-8c1d4e2a-user@secret.example-comment-SSN-991-00-1234";
const SIGNATURE = "sha256=sigcanary-OR01-do-not-store";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("FACEBOOK_APP_SECRET", "test_app_secret_12345");
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({ id: "evt_1" });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "debug").mockImplementation(() => {});
});

describe("invalid webhook signature retention", () => {
  it("returns 401 and does not retain the canary body or signature", async () => {
    const rawBody = JSON.stringify({
      object: "instagram",
      username: CANARY,
      entry: [
        {
          id: "ig_1",
          messaging: [{ message: { text: CANARY, mid: CANARY } }],
        },
      ],
    });

    const response = await POST(
      new NextRequest("http://localhost/api/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": SIGNATURE,
        },
        body: rawBody,
      })
    );

    expect(response.status).toBe(401);
    const responseText = await response.text();
    expect(responseText).not.toContain(CANARY);
    expect(responseText).not.toContain(SIGNATURE);
    expect(responseText).not.toContain("bodyPreview");

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const recorded = mockCreate.mock.calls[0][0] as {
      data: { message: string; payload: Record<string, unknown> };
    };
    const serialized = JSON.stringify(recorded);
    expect(serialized).not.toContain(CANARY);
    expect(serialized).not.toContain(SIGNATURE);
    expect(serialized).not.toContain("bodyPreview");
    expect(recorded.data.payload).toEqual({
      hadSignatureHeader: true,
      bodyLength: rawBody.length,
      failureClass: "invalid_signature",
      timestamp: expect.any(String),
    });
    expect(Object.keys(recorded.data.payload).sort()).toEqual([
      "bodyLength",
      "failureClass",
      "hadSignatureHeader",
      "timestamp",
    ]);

    for (const method of ["log", "info", "warn", "error", "debug"] as const) {
      for (const call of vi.mocked(console[method]).mock.calls) {
        expect(JSON.stringify(call)).not.toContain(CANARY);
        expect(JSON.stringify(call)).not.toContain(SIGNATURE);
      }
    }
  });
});
