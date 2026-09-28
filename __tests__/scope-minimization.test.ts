import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * V1 engagement paths must not depend on instagram_business_manage_insights.
 * Likes, comments, webhook ingest, inbox read, and sends use basic,
 * manage_comments, and manage_messages. Insights calls stay behind
 * insightsPermissionRequested() and are skipped for the AVERION profile.
 */
const V1_PATHS = [
  "app/api/webhook/route.ts",
  "lib/queue/process-webhook.ts",
  "lib/instagram/send-messages.ts",
  "lib/instagram/read-inbox.ts",
  "lib/meta/webhook.ts",
  "app/api/instagram/conversations/route.ts",
];

describe("AVERION scope minimization", () => {
  it("keeps insights off the V1 ingest, read, and send paths", () => {
    for (const file of V1_PATHS) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("instagram_business_manage_insights");
      expect(source, file).not.toContain("getMediaInsights");
      expect(source, file).not.toContain("getFollowerCountSeries");
      expect(source, file).not.toMatch(/\/insights/);
    }
  });

  it("gates Meta insight fetches in overview and follower backfill", () => {
    const overview = readFileSync("app/api/instagram/overview/route.ts", "utf8");
    const history = readFileSync("lib/reports/follower-history.ts", "utf8");
    expect(overview).toContain("insightsPermissionRequested");
    expect(history).toContain("insightsPermissionRequested");
  });
});
