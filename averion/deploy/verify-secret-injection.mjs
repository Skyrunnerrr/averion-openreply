import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "../..");
const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
const deployDockerfile = readFileSync(join(root, "averion/deploy/Dockerfile"), "utf8");
const ignore = readFileSync(join(root, ".dockerignore"), "utf8");
const compose = readFileSync(join(root, "averion/deploy/compose.provider.yml"), "utf8");
const example = readFileSync(join(root, "averion/deploy/secrets.env.example"), "utf8");

const failures = [];
if (!ignore.split("\n").includes(".env")) failures.push(".dockerignore does not exclude .env");
if (/COPY[^\n]*\.env/.test(dockerfile) || /COPY[^\n]*\.env/.test(deployDockerfile)) {
  failures.push("a Dockerfile copies an env file into the image");
}
if (!compose.includes("/run/secrets/postgres_password") || !compose.includes("/run/secrets/redis_password")) {
  failures.push("compose does not mount postgres and redis password secrets");
}
if (!compose.includes("secrets.env")) failures.push("compose does not inject the runtime env file");
if (/sk_live_|re_[A-Za-z0-9]{8,}/.test(compose + example) && !example.includes("re_...")) {
  failures.push("a live-looking secret is present");
}
if (example.includes("re_...") === false) failures.push("example file lost its placeholder marker");

const result = { pass: failures.length === 0, failures };
console.log(JSON.stringify(result));
process.exit(result.pass ? 0 : 1);
