import { describe, expect, it } from "vitest";
import { validateReleaseInputs } from "../averion/deploy/release-inputs.mjs";

const valid = {
  sourceSha: "ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c",
  worktreeDirty: false,
  lockfileSha256: "df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416",
  expectedLockfileSha256:
    "df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416",
  serverActionSecretPresent: true,
  serverActionSecretBytes: 44,
  buildxVersion: "v0.37.1",
  expectedBuildxVersion: "v0.37.1",
  buildkitImageDigest:
    "sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d",
  expectedBuildkitImageDigest:
    "sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d",
  platform: "linux/amd64",
  expectedPlatform: "linux/amd64",
};

describe("release input validation", () => {
  it("accepts a complete pinned release input", () => {
    expect(validateReleaseInputs(valid)).toEqual({ ok: true, errors: [] });
  });

  it("fails closed when the worktree is dirty", () => {
    const result = validateReleaseInputs({ ...valid, worktreeDirty: true });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("DIRTY_WORKTREE");
  });

  it("fails closed when the source SHA is missing", () => {
    const result = validateReleaseInputs({ ...valid, sourceSha: "" });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("MISSING_SOURCE_SHA");
  });

  it("fails closed when the lockfile does not match", () => {
    const result = validateReleaseInputs({
      ...valid,
      lockfileSha256: "a".repeat(64),
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("LOCKFILE_MISMATCH");
  });

  it("fails closed when the server action build secret is missing", () => {
    const result = validateReleaseInputs({
      ...valid,
      serverActionSecretPresent: false,
      serverActionSecretBytes: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("MISSING_SERVER_ACTION_BUILD_SECRET");
  });

  it("fails closed on an unexpected BuildKit digest or platform", () => {
    const result = validateReleaseInputs({
      ...valid,
      buildxVersion: "v0.1.0",
      buildkitImageDigest: "sha256:" + "b".repeat(64),
      platform: "linux/arm64",
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "UNEXPECTED_BUILDX_VERSION",
        "UNEXPECTED_BUILDKIT",
        "UNEXPECTED_PLATFORM",
      ]),
    );
  });
});
