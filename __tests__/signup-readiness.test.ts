import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/client", () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}));

vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({
    getJobCounts: vi.fn().mockResolvedValue({ waiting: 0 }),
  }),
  getRedisConnection: () => ({
    ping: vi.fn().mockResolvedValue("PONG"),
  }),
}));

vi.mock("@/lib/ops/worker-health", () => ({
  getWorkerHealth: vi.fn().mockResolvedValue({
    healthy: true,
    heartbeat: { startedAt: "2026-09-28T00:00:00.000Z" },
    ageMs: 1000,
  }),
}));

import { GET } from "../app/api/health/route";

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe("signup readiness", () => {
  it("fails readiness when production has an empty allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
    vi.stubEnv("ALLOWED_EMAILS", "");

    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe("degraded");
    expect(body.checks.signupPolicy.status).toBe("error");
    expect(JSON.stringify(body)).not.toContain("@");
  });

  it("is ready outside production without an allowlist", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
    vi.stubEnv("ALLOWED_EMAILS", "");

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.checks.signupPolicy.status).toBe("ok");
  });
});
