# AVERION OpenReply deploy-boundary image.
#
# The product Dockerfile at the repository root is unchanged and still uses the
# mutable tag node:20-slim. This file is the only definition that may be used
# to build the P2B release-candidate image.
#
# Build context MUST be a git archive of OPENREPLY_RELEASE_CANDIDATE_SHA.
# Do not point this file at a dirty worktree or at mutable main.

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS build
WORKDIR /app

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
RUN test -n "$SOURCE_SHA" && test -n "$LOCKFILE_SHA256"

COPY package.json package-lock.json ./
RUN echo "${LOCKFILE_SHA256}  package-lock.json" | sha256sum -c -

RUN npm ci

COPY . .
RUN npm run build

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS runner
WORKDIR /app

ENV NODE_ENV=production

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
LABEL org.opencontainers.image.title="openreply"
LABEL org.opencontainers.image.revision="${SOURCE_SHA}"
LABEL org.opencontainers.image.base.name="docker.io/library/node"
LABEL org.opencontainers.image.base.digest="sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c"
LABEL org.openreply.lockfile.sha256="${LOCKFILE_SHA256}"
LABEL org.openreply.source.sha="${SOURCE_SHA}"

RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/*

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
