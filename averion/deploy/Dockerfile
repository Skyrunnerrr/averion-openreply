# AVERION OpenReply deploy-boundary image.
#
# The product Dockerfile at the repository root is unchanged and still uses the
# mutable tag node:20-slim. This file is the only definition that may be used
# to build the P2B release-candidate image.
#
# Build context MUST be a git archive of OPENREPLY_RELEASE_CANDIDATE_SHA.
# Do not point this file at a dirty worktree or at mutable main.
# Pass the deploy directory as an extra build context named "deploy":
#   podman build --build-context deploy=averion/deploy ...
#
# Bit-reproducibility (two --no-cache builds must share one manifest digest):
# - SOURCE_DATE_EPOCH is the RC commit time, also passed to podman --timestamp.
# - generateBuildId is pinned to SOURCE_SHA inside this build only.
# - NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is a public determinism constant:
#   base64(SHA-256("averion-openreply-p2b-" + SOURCE_SHA)). It is not an
#   operator secret. Next otherwise mints a new key per build.
# - api.github.com is pinned to 0.0.0.0 during next build so the marketing
#   page's star fetch fails closed instead of baking a live count. A full
#   --network=none build hangs inside Next, so only that host is blocked.
# - .next/cache, .next/trace, and .next/diagnostics are omitted.
# - apt logs and the ldconfig aux-cache are removed after installing wget.

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS build
WORKDIR /app

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
ARG SOURCE_DATE_EPOCH=1790583091
RUN test -n "$SOURCE_SHA" && test -n "$LOCKFILE_SHA256" && test -n "$SOURCE_DATE_EPOCH"

ENV SOURCE_SHA=${SOURCE_SHA} \
    SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=bBlyVERylKvU8K2Pp8RHTM4GfW6Celhb5B8uyLaeRuA= \
    TZ=UTC \
    LANG=C.UTF-8

COPY package.json package-lock.json ./
RUN echo "${LOCKFILE_SHA256}  package-lock.json" | sha256sum -c -

RUN npm ci

COPY . .
COPY --from=deploy pin-next-build.mjs /tmp/pin-next-build.mjs
COPY --from=deploy normalize-next-output.mjs /tmp/normalize-next-output.mjs
RUN node /tmp/pin-next-build.mjs && rm /tmp/pin-next-build.mjs
RUN grep -q 'api.github.com' /etc/hosts || printf '\n0.0.0.0 api.github.com\n' >> /etc/hosts

RUN npm run build \
 && node /tmp/normalize-next-output.mjs \
 && rm /tmp/normalize-next-output.mjs \
 && test "$(tr -d '\n' < .next/BUILD_ID)" = "$SOURCE_SHA"

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS runner
WORKDIR /app

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
ARG SOURCE_DATE_EPOCH=1790583091

ENV NODE_ENV=production \
    SOURCE_SHA=${SOURCE_SHA} \
    SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=bBlyVERylKvU8K2Pp8RHTM4GfW6Celhb5B8uyLaeRuA= \
    TZ=UTC \
    LANG=C.UTF-8

LABEL org.opencontainers.image.title="openreply"
LABEL org.opencontainers.image.revision="${SOURCE_SHA}"
LABEL org.opencontainers.image.base.name="docker.io/library/node"
LABEL org.opencontainers.image.base.digest="sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c"
LABEL org.openreply.lockfile.sha256="${LOCKFILE_SHA256}"
LABEL org.openreply.source.sha="${SOURCE_SHA}"
LABEL org.openreply.source-date-epoch="${SOURCE_DATE_EPOCH}"

RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/* /var/log/apt /var/log/dpkg.log /var/cache/ldconfig

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/app/generated ./app/generated
COPY --from=build /app/public ./public
COPY --from=build /app/lib ./lib
COPY --from=build /app/worker ./worker
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
