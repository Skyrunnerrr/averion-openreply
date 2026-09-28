import fs from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const dockerfile = fs.readFileSync("averion/deploy/Dockerfile", "utf8");
const builder = JSON.parse(
  fs.readFileSync("averion/deploy/canonical-builder.json", "utf8"),
);
const provenance = JSON.parse(
  fs.readFileSync("averion/deploy/provenance-schema.json", "utf8"),
);
const matrix = fs.readFileSync("docs/averion/p2b/NEXT_REGRESSION_MATRIX.md", "utf8");
const upgrade = fs.readFileSync("docs/averion/p2b/NEXT_SECURITY_UPGRADE.md", "utf8");

const AUTHORITIES = [
  "UPSTREAM_PIN",
  "HARDENING_BASE_SHA",
  "APP_RUNTIME_SOURCE_SHA",
  "BUILD_DEFINITION_SHA",
  "DEPLOYMENT_BUNDLE_SHA",
] as const;

describe("canonical build definition", () => {
  it("does not commit a server action encryption key literal", () => {
    expect(dockerfile).not.toMatch(
      /NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=[A-Za-z0-9+/=]{16,}/,
    );
    expect(dockerfile).toContain(
      "--mount=type=secret,id=next_server_actions_key",
    );
    expect(dockerfile).toContain("ca-certificates=20230311+deb12u1");
    expect(dockerfile).not.toContain("apt-get upgrade");
    expect(dockerfile).toContain("20260421T000000Z");
    expect(dockerfile).toContain("wget=1.21.3-1+deb12u1");
    expect(dockerfile.startsWith("# syntax=docker/dockerfile:1.27.0@sha256:")).toBe(
      true,
    );
  });

  it("pins Buildx, BuildKit, platform, and the Dockerfile frontend", () => {
    expect(builder.BUILDX_VERSION).toBe("v0.37.1");
    expect(builder.BUILDKIT_IMAGE).toBe("docker.io/moby/buildkit:v0.33.0");
    expect(builder.BUILDKIT_IMAGE_DIGEST).toBe(
      "sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d",
    );
    expect(builder.PLATFORM).toBe("linux/amd64");
    expect(builder.DOCKERFILE_FRONTEND).toBe(
      "docker.io/docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e",
    );
    expect(builder.APT_SNAPSHOT).toBe("20260421T000000Z");
    expect(builder.WGET_VERSION).toBe("1.21.3-1+deb12u1");
    expect(JSON.stringify(builder)).not.toMatch(/:latest|:stable|default/);
  });

  it("exposes exactly five SHA authorities", () => {
    expect(Object.keys(provenance.authorities).sort()).toEqual(
      [...AUTHORITIES].sort(),
    );
    expect(provenance.authorities.UPSTREAM_PIN).toBe(
      "5760181c4bb9683241357cbbcd8ca635d19f835a",
    );
    expect(provenance.authorities.HARDENING_BASE_SHA).toBe(
      "727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10",
    );
    expect(provenance.authorities.APP_RUNTIME_SOURCE_SHA).toBe(
      "ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c",
    );
    expect(provenance.authorities).not.toHaveProperty("SOURCE_SHA");
    expect(provenance.authorities).not.toHaveProperty("RELEASE_CANDIDATE_SHA");
  });

  it("lists the Next upgrade regression matrix without freezing 16.2.6", () => {
    for (const row of [
      "production build",
      "next start",
      "route handlers",
      "/api/webhook raw body",
      "Server Actions",
      "NextAuth magic link",
      "Instagram OAuth routes",
      "instrumentation.ts",
      "static assets",
      "provider health",
      "public-edge to Next",
      "worker",
      "cron",
      "Prisma generation",
    ]) {
      expect(matrix).toContain(row);
    }
    expect(upgrade).toContain("16.2.6");
    expect(upgrade).toContain("16.3.6");
    expect(upgrade).toContain("16.3.7");
    expect(upgrade).toContain("2026-09-30");
    expect(upgrade).toMatch(/do not install 16\.3\.7/i);
    expect(upgrade).toMatch(/eslint-config-next/);
    expect(pkg.dependencies.next).toBe("^16.2.6");
    expect(pkg.devDependencies["eslint-config-next"]).toBe("^16.2.6");
  });
});
