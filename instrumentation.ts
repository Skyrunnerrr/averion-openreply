/**
 * Fail the web process closed when the AVERION production signup policy is
 * absent. Next runs this hook on server start. It is skipped during `next
 * build`, which also sets NODE_ENV=production and must not require the
 * allowlist.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { assertProductionSignupPolicy } = await import(
    "@/lib/provider-controls"
  );
  assertProductionSignupPolicy();
}
