/**
 * AVERION engagement-transport controls.
 *
 * Unset OPENREPLY_PROVIDER_PROFILE, or any value other than `upstream`, is the
 * AVERION profile: fail closed. `upstream` restores the original OpenReply
 * product defaults (open signup, automations on, human inbox send on, insights
 * scope). Flags below override those defaults when set.
 */

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

export const AVERION_INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
] as const;

const UPSTREAM_INSTAGRAM_SCOPES = [
  ...AVERION_INSTAGRAM_SCOPES,
  "instagram_business_manage_insights",
] as const;

export function isAverionProviderProfile(): boolean {
  const profile = (process.env.OPENREPLY_PROVIDER_PROFILE ?? "averion")
    .trim()
    .toLowerCase();
  return profile !== "upstream";
}

function envFlag(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  // An unrecognized value must not turn a write path on.
  return false;
}

/** Comment, DM-keyword, postback, and polling reconciliation jobs. */
export function areAutomationsEnabled(): boolean {
  return envFlag("OPENREPLY_AUTOMATIONS_ENABLED", !isAverionProviderProfile());
}

/** Dashboard / human POST send. Ingest and read stay available. */
export function isHumanSendEnabled(): boolean {
  return envFlag("OPENREPLY_HUMAN_SEND_ENABLED", !isAverionProviderProfile());
}

export function instagramOAuthScopes(): readonly string[] {
  return isAverionProviderProfile()
    ? AVERION_INSTAGRAM_SCOPES
    : UPSTREAM_INSTAGRAM_SCOPES;
}

export function insightsPermissionRequested(): boolean {
  return instagramOAuthScopes().includes("instagram_business_manage_insights");
}

export function parseAllowedEmails(
  raw: string | undefined = process.env.ALLOWED_EMAILS
): string[] {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isSignupAllowlistConfigured(): boolean {
  return parseAllowedEmails().length > 0;
}

/**
 * AVERION production without an allowlist is not ready to serve.
 * Development and test stay ready so local work is unchanged.
 * The upstream profile keeps historical open signup.
 */
export function isSignupPolicyProductionReady(): boolean {
  if (!isAverionProviderProfile()) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return isSignupAllowlistConfigured();
}

export function signupPolicyFailureReason(): string | null {
  if (isSignupPolicyProductionReady()) return null;
  return "ALLOWED_EMAILS must be a non-empty allowlist when NODE_ENV=production under the AVERION provider profile";
}

export function assertProductionSignupPolicy(): void {
  const reason = signupPolicyFailureReason();
  if (reason) {
    throw new Error(reason);
  }
}
