const FALLBACK_CALLBACK = "/dashboard";

function assertSafeCallbackPath(value: string): void {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new Error("Invalid callback URL");
  }

  const candidates = [value, decoded, decoded.replaceAll("\\", "/")];
  for (const candidate of candidates) {
    if (!candidate.startsWith("/")) throw new Error("Invalid callback URL");
    if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
      throw new Error("Invalid callback URL");
    }
    if (candidate.includes("\\") || candidate.includes("://") || candidate.includes("@")) {
      throw new Error("Invalid callback URL");
    }
    if (/[\u0000-\u001f\u007f]/.test(candidate)) {
      throw new Error("Invalid callback URL");
    }
  }
}

export function resolveMagicLinkCallbackUrl(
  value: string | null | undefined,
): string {
  if (value == null) return FALLBACK_CALLBACK;
  const trimmed = value.trim();
  if (!trimmed) return FALLBACK_CALLBACK;
  assertSafeCallbackPath(trimmed);
  return trimmed;
}

export function prepareMagicLinkSubmission(input: {
  email: unknown;
  callbackUrl: string | null | undefined;
}): { email: string; redirectTo: string } {
  if (typeof input.email !== "string") throw new Error("Invalid email");
  if (/[\u0000-\u001f\u007f]/.test(input.email)) throw new Error("Invalid email");
  const email = input.email.trim();
  if (!email || !email.includes("@") || /\s/.test(email)) {
    throw new Error("Invalid email");
  }
  return {
    email,
    redirectTo: resolveMagicLinkCallbackUrl(input.callbackUrl),
  };
}
