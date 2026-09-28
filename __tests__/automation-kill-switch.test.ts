import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockQueueAdd, mockSendDirectMessage, mockSendPrivateReply, mockSendCommentReply } =
  vi.hoisted(() => ({
    mockPrisma: {
      instagramAccount: { findMany: vi.fn() },
      automation: { findMany: vi.fn() },
      webhookEvent: { create: vi.fn(), update: vi.fn() },
      dmLog: { findMany: vi.fn() },
    },
    mockQueueAdd: vi.fn(),
    mockSendDirectMessage: vi.fn(),
    mockSendPrivateReply: vi.fn(),
    mockSendCommentReply: vi.fn(),
  }));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: mockQueueAdd }),
  MESSAGE_JOB_NAME: "process-message",
  POSTBACK_JOB_NAME: "process-postback",
}));
vi.mock("@/lib/instagram/provider", () => ({
  getRecentMediaComments: vi.fn(),
  getUserMedia: vi.fn(),
  createInstagramContext: vi.fn(),
  MetaApiError: class MetaApiError extends Error {},
  sendDirectMessage: mockSendDirectMessage,
  sendPrivateReply: mockSendPrivateReply,
  sendCommentReply: mockSendCommentReply,
}));

import { processInstagramWebhook } from "../lib/queue/process-webhook";
import { reconcileComments } from "../lib/polling/comment-reconciler";

const activeAutomation = {
  id: "auto_1",
  isActive: true,
  keywords: ["LINK"],
  workspaceId: "ws_1",
};

const commentPayload = {
  object: "instagram",
  entry: [
    {
      id: "ig_1",
      time: 1_700_000_000,
      changes: [
        {
          field: "comments",
          value: {
            id: "comment_1",
            text: "LINK",
            from: { id: "user_1", username: "someone" },
            media: { id: "media_1" },
          },
        },
      ],
    },
  ],
};

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
  mockQueueAdd.mockReset();
  mockSendDirectMessage.mockReset();
  mockSendPrivateReply.mockReset();
  mockSendCommentReply.mockReset();
  mockPrisma.instagramAccount.findMany.mockReset();
  mockPrisma.automation.findMany.mockReset();
  mockPrisma.webhookEvent.create.mockReset();
  mockPrisma.webhookEvent.update.mockReset();
  mockPrisma.dmLog.findMany.mockReset();
  mockPrisma.instagramAccount.findMany.mockResolvedValue([
    { id: "acc_1", instagramId: "ig_1", workspaceId: "ws_1" },
  ]);
  mockPrisma.automation.findMany.mockResolvedValue([activeAutomation]);
  mockPrisma.webhookEvent.create.mockResolvedValue({ id: "evt_1" });
  mockPrisma.webhookEvent.update.mockResolvedValue({});
});

describe("automation kill switch", () => {
  it("queues no jobs and performs no external sends when disabled", async () => {
    vi.stubEnv("OPENREPLY_AUTOMATIONS_ENABLED", "false");
    expect(activeAutomation.isActive).toBe(true);

    await processInstagramWebhook({
      payload: commentPayload,
      provider: "META",
    });
    await reconcileComments();

    expect(mockQueueAdd).not.toHaveBeenCalled();
    expect(mockSendDirectMessage).not.toHaveBeenCalled();
    expect(mockSendPrivateReply).not.toHaveBeenCalled();
    expect(mockSendCommentReply).not.toHaveBeenCalled();
    expect(mockPrisma.webhookEvent.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.automation.findMany).not.toHaveBeenCalled();
  });

  it("still queues a comment job when automations are enabled", async () => {
    vi.stubEnv("OPENREPLY_AUTOMATIONS_ENABLED", "true");

    await processInstagramWebhook({
      payload: commentPayload,
      provider: "META",
    });

    expect(mockQueueAdd).toHaveBeenCalledTimes(1);
    expect(mockQueueAdd.mock.calls[0][0]).toBe("process-comment");
    expect(mockSendDirectMessage).not.toHaveBeenCalled();
  });
});
