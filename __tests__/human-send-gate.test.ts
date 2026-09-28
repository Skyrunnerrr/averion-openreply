import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockSend, mockGetConversations, mockWorkspaceId, mockAccount } =
  vi.hoisted(() => ({
    mockSend: vi.fn(),
    mockGetConversations: vi.fn(),
    mockWorkspaceId: vi.fn(),
    mockAccount: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  getCurrentWorkspaceId: mockWorkspaceId,
}));
vi.mock("@/lib/instagram-accounts", () => ({
  getWorkspaceInstagramAccount: mockAccount,
}));
vi.mock("@/lib/instagram/provider", () => ({
  sendDirectMessage: mockSend,
  getConversations: mockGetConversations,
  createInstagramContext: vi.fn().mockResolvedValue({
    provider: "META",
    accessToken: "token",
  }),
  MetaApiError: class MetaApiError extends Error {},
}));

import { GET, POST } from "../app/api/instagram/conversations/route";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
  mockSend.mockReset();
  mockGetConversations.mockReset();
  mockWorkspaceId.mockReset();
  mockAccount.mockReset();
  mockWorkspaceId.mockResolvedValue("ws_1");
  mockAccount.mockResolvedValue({
    id: "acc_1",
    username: "brand",
    instagramId: "ig_1",
    provider: "META",
  });
  mockGetConversations.mockResolvedValue([]);
  mockSend.mockResolvedValue({ recipient_id: "user_1", message_id: "m_1" });
});

describe("human send gate", () => {
  it("blocks conversation POST and does not call the external send", async () => {
    vi.stubEnv("OPENREPLY_HUMAN_SEND_ENABLED", "false");

    const response = await POST(
      new NextRequest("http://localhost/api/instagram/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipientId: "user_1",
          text: "hello from the dashboard",
        }),
      })
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("still reads conversations when human send is disabled", async () => {
    vi.stubEnv("OPENREPLY_HUMAN_SEND_ENABLED", "false");

    const response = await GET(
      new NextRequest(
        "http://localhost/api/instagram/conversations?instagramAccountId=acc_1"
      )
    );

    expect(response.status).toBe(200);
    expect(mockGetConversations).toHaveBeenCalledTimes(1);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 401 before the send gate when there is no session", async () => {
    vi.stubEnv("OPENREPLY_HUMAN_SEND_ENABLED", "false");
    mockWorkspaceId.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/instagram/conversations", {
        method: "POST",
        body: JSON.stringify({ recipientId: "user_1", text: "nope" }),
      })
    );

    expect(response.status).toBe(401);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
