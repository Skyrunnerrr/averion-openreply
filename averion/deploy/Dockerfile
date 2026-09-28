# syntax=docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e
# AVERION OpenReply deploy-boundary image.
#
# The product Dockerfile at the repository root is unchanged.
# This file is the provider build definition. Artifact identity comes from
# Docker Buildx v0.37.1 and BuildKit linux/amd64
# sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d.
# Host Podman, host Docker, and an unpinned BuildKit are not the canonical builder.
#
# Build context MUST be a git archive of the app runtime source SHA.
# Pass the deploy directory as an extra build context named "deploy".
# The Server Action key is a BuildKit secret id next_server_actions_key.
# It is mounted only for the build RUN. It is not an ARG, ENV, label, or layer file.
# Publish only the SHA-256 of the decoded 32-byte key as a build-arg fingerprint.
#
# OS packages come from the Debian snapshot that built the pinned node base
# (bookworm @20260421T000000Z). wget is pinned. ca-certificates is not installed
# again; the base image already provides the CA bundle.

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS build
WORKDIR /app

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
ARG SOURCE_DATE_EPOCH=1790583091
ARG SERVER_ACTION_KEY_FINGERPRINT
RUN test -n "$SOURCE_SHA" && test -n "$LOCKFILE_SHA256" && test -n "$SOURCE_DATE_EPOCH"

ENV SOURCE_SHA=${SOURCE_SHA} \
    SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} \
    NEXT_TELEMETRY_DISABLED=1 \
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

RUN --mount=type=secret,id=next_server_actions_key,required=true \
    set -eu; \
    set -o pipefail; \
    key="$(cat /run/secrets/next_server_actions_key)"; \
    key="$(printf '%s' "$key" | tr -d '\r\n')"; \
    test -n "$key"; \
    raw_len="$(printf '%s' "$key" | base64 -d | wc -c | tr -d ' ')"; \
    test "$raw_len" = "32"; \
    fp="$(printf '%s' "$key" | base64 -d | sha256sum | awk '{print $1}')"; \
    test -n "$SERVER_ACTION_KEY_FINGERPRINT"; \
    test "$fp" = "$SERVER_ACTION_KEY_FINGERPRINT"; \
    export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$key"; \
    unset key fp raw_len; \
    npm run build \
 && node /tmp/normalize-next-output.mjs \
 && rm /tmp/normalize-next-output.mjs \
 && test "$(tr -d '\n' < .next/BUILD_ID)" = "$SOURCE_SHA"; \
    unset NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS runner
WORKDIR /app

ARG SOURCE_SHA
ARG LOCKFILE_SHA256
ARG SOURCE_DATE_EPOCH=1790583091
ARG SERVER_ACTION_KEY_FINGERPRINT
ARG DEBIAN_SNAPSHOT=20260421T000000Z
ARG WGET_VERSION=1.21.3-1+deb12u1

ENV NODE_ENV=production \
    SOURCE_SHA=${SOURCE_SHA} \
    SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=UTC \
    LANG=C.UTF-8

LABEL org.opencontainers.image.title="openreply"
LABEL org.opencontainers.image.revision="${SOURCE_SHA}"
LABEL org.opencontainers.image.base.name="docker.io/library/node"
LABEL org.opencontainers.image.base.digest="sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c"
LABEL org.openreply.lockfile.sha256="${LOCKFILE_SHA256}"
LABEL org.openreply.source.sha="${SOURCE_SHA}"
LABEL org.openreply.source-date-epoch="${SOURCE_DATE_EPOCH}"
LABEL org.openreply.server-action-key-fingerprint="${SERVER_ACTION_KEY_FINGERPRINT}"
LABEL org.openreply.canonical-image="false"

RUN set -eu; \
    rm -rf /etc/apt/sources.list /etc/apt/sources.list.d; \
    mkdir -p /etc/apt/apt.conf.d /etc/openreply; \
    printf 'Acquire::Check-Valid-Until "false";\n' > /etc/apt/apt.conf.d/99-snapshot; \
    printf 'deb [check-valid-until=no] https://snapshot.debian.org/archive/debian/%s bookworm main\n' "$DEBIAN_SNAPSHOT" > /etc/apt/sources.list; \
    apt-get update; \
    test "$WGET_VERSION" = "1.21.3-1+deb12u1"; \
    apt-get install -y --no-install-recommends wget=1.21.3-1+deb12u1; \
    test "$(dpkg-query -W -f '${Version}' wget)" = "$WGET_VERSION"; \
    test -s /etc/ssl/certs/ca-certificates.crt; \
    printf '%s\n' "base-image:docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c" > /etc/openreply/ca-cert-source; \
    printf '%s\n' "$DEBIAN_SNAPSHOT" > /etc/openreply/apt-snapshot; \
    dpkg-query -W -f '${Version}\n' wget > /etc/openreply/wget-version; \
    rm -rf /var/lib/apt/lists/* /var/log/apt /var/log/dpkg.log /var/cache/apt /var/cache/ldconfig /tmp/*

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
