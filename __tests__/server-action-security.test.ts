import { describe, expect, it } from "vitest";
import { setLocale } from "../lib/i18n/actions";
import {
  prepareMagicLinkSubmission,
  resolveMagicLinkCallbackUrl,
} from "../lib/auth/callback-url";

describe("setLocale server action", () => {
  it("accepts only the locale string and does not take a workspace id", () => {
    expect(setLocale.length).toBe(1);
  });

  it("rejects an empty locale without treating it as English", async () => {
    await expect(setLocale("")).rejects.toThrow("Unsupported locale");
  });

  it("rejects a locale with surrounding whitespace", async () => {
    await expect(setLocale(" zh-TW ")).rejects.toThrow("Unsupported locale");
  });

  it("rejects a locale that smuggles a cookie attribute", async () => {
    await expect(setLocale("en\r\nSet-Cookie: x=y")).rejects.toThrow(
      "Unsupported locale",
    );
  });
});

describe("sendMagicLink callback validation", () => {
  it("keeps an in-app path", () => {
    expect(resolveMagicLinkCallbackUrl("/dashboard")).toBe("/dashboard");
  });

  it("keeps a template path on this origin", () => {
    expect(
      resolveMagicLinkCallbackUrl("/campaigns/new?template=welcome"),
    ).toBe("/campaigns/new?template=welcome");
  });

  it("falls back when the callback is missing", () => {
    expect(resolveMagicLinkCallbackUrl(null)).toBe("/dashboard");
    expect(resolveMagicLinkCallbackUrl("")).toBe("/dashboard");
  });

  it("rejects an absolute external URL", () => {
    expect(() =>
      resolveMagicLinkCallbackUrl("https://evil.example/phish"),
    ).toThrow("Invalid callback URL");
  });

  it("rejects a protocol-relative URL", () => {
    expect(() => resolveMagicLinkCallbackUrl("//evil.example")).toThrow(
      "Invalid callback URL",
    );
  });

  it("rejects a backslash bypass", () => {
    expect(() => resolveMagicLinkCallbackUrl("/\\evil.example")).toThrow(
      "Invalid callback URL",
    );
  });

  it("rejects an encoded protocol-relative URL", () => {
    expect(() => resolveMagicLinkCallbackUrl("/%2f%2fevil.example")).toThrow(
      "Invalid callback URL",
    );
  });

  it("rejects a callback that injects a header", () => {
    expect(() => resolveMagicLinkCallbackUrl("/dashboard\r\nSet-Cookie: x=1")).toThrow(
      "Invalid callback URL",
    );
  });

  it("prepares a magic link without a workspace id or an external redirect", () => {
    const prepared = prepareMagicLinkSubmission({
      email: " owner@example.com ",
      callbackUrl: "/settings",
    });
    expect(prepared).toEqual({
      email: "owner@example.com",
      redirectTo: "/settings",
    });
    expect(prepared).not.toHaveProperty("workspaceId");
  });

  it("rejects an empty email before sign-in", () => {
    expect(() =>
      prepareMagicLinkSubmission({ email: "  ", callbackUrl: "/dashboard" }),
    ).toThrow("Invalid email");
  });

  it("rejects an email that smuggles a header", () => {
    expect(() =>
      prepareMagicLinkSubmission({
        email: "owner@example.com\r\nBcc: evil@example.com",
        callbackUrl: "/dashboard",
      }),
    ).toThrow("Invalid email");
  });

  it("does not pass an external callback through to sign-in", () => {
    expect(() =>
      prepareMagicLinkSubmission({
        email: "owner@example.com",
        callbackUrl: "https://evil.example/steal",
      }),
    ).toThrow("Invalid callback URL");
  });
});
