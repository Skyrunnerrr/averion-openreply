import fs from "node:fs";

const path = "next.config.ts";
const src = fs.readFileSync(path, "utf8");
const needle = "const nextConfig: NextConfig = {";

if (!src.includes(needle)) {
  console.error("next.config.ts shape changed");
  process.exit(1);
}
if (src.includes("generateBuildId")) {
  console.error("generateBuildId already present");
  process.exit(1);
}

const insert = [
  "const nextConfig: NextConfig = {",
  "  generateBuildId: async () => {",
  "    const id = process.env.SOURCE_SHA;",
  '    if (!id) throw new Error("SOURCE_SHA is required for a reproducible build");',
  "    return id;",
  "  },",
  "  experimental: {",
  "    cpus: 1,",
  "  },",
].join("\n");

fs.writeFileSync(path, src.replace(needle, insert));
console.log("pinned generateBuildId to SOURCE_SHA");
