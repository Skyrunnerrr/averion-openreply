import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockCreateInstagramContext, mockGetUserMedia, mockHasInstagramCredentials } =
  vi.hoisted(() => ({
    mockPrisma: {
      automation: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
    },
    mockCreateInstagramContext: vi.fn(),
    mockGetUserMedia: vi.fn(),
    mockHasInstagramCredentials: vi.fn(),
  }));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/instagram/provider", () => ({
  createInstagramContext: mockCreateInstagramContext,
  getUserMedia: mockGetUserMedia,
  hasInstagramCredentials: mockHasInstagramCredentials,
}));

import { attachPendingNextReels } from "../lib/automation/attach-next-reel";

const pendingNextReel = {
  id: "auto_pending",
  pendingNextReel: true,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  instagramAccountId: "acc_1",
  instagramAccount: {
    id: "acc_1",
    accessToken: "token-should-not-be-used",
    instagramId: "ig_1",
  },
};

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
  mockPrisma.automation.findMany.mockReset();
  mockPrisma.automation.update.mockReset();
  mockCreateInstagramContext.mockReset();
  mockGetUserMedia.mockReset();
  mockHasInstagramCredentials.mockReset();
  mockPrisma.automation.findMany.mockResolvedValue([pendingNextReel]);
  mockHasInstagramCredentials.mockReturnValue(true);
  mockCreateInstagramContext.mockResolvedValue({ accountId: "acc_1" });
  mockGetUserMedia.mockResolvedValue([]);
});

describe("attachPendingNextReels automation kill switch", () => {
  it("loads a pendingNextReel fixture and does not call Meta when automations are disabled", async () => {
    vi.stubEnv("OPENREPLY_AUTOMATIONS_ENABLED", "false");

    const result = await attachPendingNextReels();

    expect(mockPrisma.automation.findMany).toHaveBeenCalledTimes(1);
    expect(result.checked).toBe(1);
    expect(result.bound).toBe(0);
    expect(result.failedAccounts).toBe(0);
    expect(mockCreateInstagramContext).not.toHaveBeenCalled();
    expect(mockGetUserMedia).not.toHaveBeenCalled();
    expect(mockPrisma.automation.update).not.toHaveBeenCalled();
  });

  it("still fetches media when automations are explicitly enabled", async () => {
    vi.stubEnv("OPENREPLY_AUTOMATIONS_ENABLED", "true");

    const result = await attachPendingNextReels();

    expect(result.checked).toBe(1);
    expect(mockCreateInstagramContext).toHaveBeenCalledTimes(1);
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
  });
});
