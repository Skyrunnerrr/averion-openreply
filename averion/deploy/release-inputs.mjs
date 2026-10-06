function sha40(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

export function validateReleaseInputs(input) {
  const errors = [];
  if (!sha40(input?.sourceSha)) errors.push("MISSING_SOURCE_SHA");
  if (input?.worktreeDirty) errors.push("DIRTY_WORKTREE");
  if (
    !input?.lockfileSha256 ||
    input.lockfileSha256 !== input.expectedLockfileSha256
  ) {
    errors.push("LOCKFILE_MISMATCH");
  }
  if (!input?.serverActionSecretPresent || !(input.serverActionSecretBytes > 0)) {
    errors.push("MISSING_SERVER_ACTION_BUILD_SECRET");
  }
  if (input?.buildxVersion !== input?.expectedBuildxVersion) {
    errors.push("UNEXPECTED_BUILDX_VERSION");
  }
  if (input?.buildkitImageDigest !== input?.expectedBuildkitImageDigest) {
    errors.push("UNEXPECTED_BUILDKIT");
  }
  if (input?.platform !== input?.expectedPlatform) {
    errors.push("UNEXPECTED_PLATFORM");
  }
  return { ok: errors.length === 0, errors };
}
