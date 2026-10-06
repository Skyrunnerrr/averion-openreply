const GATES = [
  ["KEY_NOT_IN_GIT", "gitText"],
  ["KEY_NOT_IN_DOCKER_HISTORY", "dockerHistory"],
  ["KEY_NOT_IN_IMAGE_LABELS", "labelText"],
  ["KEY_NOT_IN_BUILD_LOG", "buildLog"],
  ["KEY_NOT_IN_PROVENANCE", "provenanceText"],
  ["KEY_NOT_IN_SBOM", "sbomText"],
];

function asText(value) {
  if (value == null) return "";
  return String(value);
}

export function scanServerActionSecret(input) {
  const secret = asText(input?.secret);
  const surfaces = {
    gitText: (input?.gitFiles ?? []).map((file) => asText(file?.text)).join("\n"),
    dockerHistory: asText(input?.dockerHistory),
    labelText: JSON.stringify(input?.imageLabels ?? {}),
    buildLog: asText(input?.buildLog),
    provenanceText: asText(input?.provenanceText),
    sbomText: asText(input?.sbomText),
  };
  const result = {};
  for (const [gate, field] of GATES) {
    const leaked = secret.length > 0 && surfaces[field].includes(secret);
    result[gate] = leaked ? "FAIL" : secret.length > 0 ? "PASS" : "FAIL";
  }
  return result;
}
