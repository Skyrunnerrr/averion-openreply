import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextAuthConfig } from "next-auth";

const { ensureWorkspaceForUser, captured } = vi.hoisted(() => ({
  ensureWorkspaceForUser: vi.fn(),
  captured: { config: null as NextAuthConfig | null },
}));

vi.mock("next-auth", () => ({
  default: (config: NextAuthConfig) => {
    captured.config = config;
    return {
      handlers: {},
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  },
}));

vi.mock("next-auth/providers/nodemailer", () => ({
  default: () => ({ id: "nodemailer" }),
}));

vi.mock("next-auth/providers/resend", () => ({
  default: () => ({ id: "resend" }),
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: () => ({}),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {},
}));

vi.mock("@/lib/workspace", () => ({
  ensureWorkspaceForUser,
  getPrimaryWorkspace: vi.fn(),
}));

import { authConfig } from "../lib/auth";

beforeEach(() => {
  vi.unstubAllEnvs();
  ensureWorkspaceForUser.mockReset();
});

describe("signup fail-closed", () => {
  it("does not create a session or workspace for an unauthorized email", async () => {
    vi.stubEnv("ALLOWED_EMAILS", "owner@example.com");

    const allowed = await authConfig.callbacks.signIn?.({
      user: { email: "stranger@example.com", id: "user_stranger" },
      account: null,
    });

    expect(allowed).toBe(false);
    expect(ensureWorkspaceForUser).not.toHaveBeenCalled();
    expect(captured.config?.events?.createUser).toBeTypeOf("function");
  });

  it("does not create a workspace when production has no allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
    vi.stubEnv("ALLOWED_EMAILS", "");

    const allowed = await authConfig.callbacks.signIn?.({
      user: { email: "owner@example.com", id: "user_owner" },
      account: null,
    });

    expect(allowed).toBe(false);
    expect(ensureWorkspaceForUser).not.toHaveBeenCalled();
  });

  it("creates a workspace only from the createUser event after an allowed sign-in", async () => {
    vi.stubEnv("ALLOWED_EMAILS", "owner@example.com");

    const allowed = await authConfig.callbacks.signIn?.({
      user: { email: "owner@example.com", id: "user_owner" },
      account: null,
    });
    expect(allowed).toBe(true);
    expect(ensureWorkspaceForUser).not.toHaveBeenCalled();

    await captured.config?.events?.createUser?.({
      user: { id: "user_owner", email: "owner@example.com" },
    });
    expect(ensureWorkspaceForUser).toHaveBeenCalledTimes(1);
    expect(ensureWorkspaceForUser).toHaveBeenCalledWith(
      "user_owner",
      "owner@example.com"
    );
  });
});
