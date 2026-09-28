import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createOAuthState,
  decryptToken,
  encryptToken,
  getAuthorizationUrl,
  verifyOAuthState,
} from "../lib/meta/oauth";
import { AVERION_INSTAGRAM_SCOPES } from "../lib/provider-controls";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret-with-enough-length");
  vi.stubEnv(
    "ENCRYPTION_KEY",
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  );
  vi.stubEnv("INSTAGRAM_APP_ID", "ig_app_test");
});

describe("OAuth state and token encryption", () => {
  it("round-trips encrypted tokens", () => {
    const encrypted = encryptToken("long-lived-token");
    expect(encrypted).not.toBe("long-lived-token");
    expect(decryptToken(encrypted)).toBe("long-lived-token");
  });

  it("signs and verifies Instagram OAuth state", () => {
    const state = createOAuthState("workspace_123");
    expect(verifyOAuthState(state)?.workspaceId).toBe("workspace_123");
  });

  it("rejects tampered OAuth state", () => {
    const state = createOAuthState("workspace_123");
    expect(verifyOAuthState(`${state}tampered`)).toBeNull();
  });

  it("requests the AVERION scope set and hides Facebook login", () => {
    vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "averion");
    const url = new URL(
      getAuthorizationUrl("https://app.example/api/instagram/callback", "state")
    );
    expect(url.searchParams.get("scope")).toBe(
      AVERION_INSTAGRAM_SCOPES.join(",")
    );
    expect(url.searchParams.get("scope")).not.toContain("insights");
    expect(url.searchParams.get("enable_fb_login")).toBe("0");
  });

  it("keeps the insights scope only for the upstream profile", () => {
    vi.stubEnv("OPENREPLY_PROVIDER_PROFILE", "upstream");
    const url = new URL(
      getAuthorizationUrl("https://app.example/api/instagram/callback", "state")
    );
    expect(url.searchParams.get("scope")).toContain(
      "instagram_business_manage_insights"
    );
    expect(url.searchParams.get("enable_fb_login")).toBe("0");
  });
});
