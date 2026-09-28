# syntax=docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e
# Synthetic non-release proof of the canonical builder.
# The image digest from this file is not a release digest.

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c
WORKDIR /tmp/proof

ARG SERVER_ACTION_KEY_FINGERPRINT
ARG DEBIAN_SNAPSHOT=20260421T000000Z
ARG WGET_VERSION=1.21.3-1+deb12u1

LABEL org.openreply.synthetic-builder-proof="true"
LABEL org.openreply.canonical-image="false"
LABEL org.openreply.server-action-key-fingerprint="${SERVER_ACTION_KEY_FINGERPRINT}"

RUN --mount=type=secret,id=next_server_actions_key,required=true \
    set -eu; \
    set -o pipefail; \
    key="$(cat /run/secrets/next_server_actions_key)"; \
    key="$(printf '%s' "$key" | tr -d '\r\n')"; \
    test -n "$key"; \
    raw_len="$(printf '%s' "$key" | base64 -d | wc -c | tr -d ' ')"; \
    test "$raw_len" = "32"; \
    fp="$(printf '%s' "$key" | base64 -d | sha256sum | awk '{print $1}')"; \
    test "$fp" = "$SERVER_ACTION_KEY_FINGERPRINT"; \
    mkdir -p /etc/openreply; \
    printf '%s\n' "$fp" > /etc/openreply/server-action-key-fingerprint; \
    unset key fp raw_len

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
    wget -q -O /dev/null --timeout=60 "https://snapshot.debian.org/archive/debian/${DEBIAN_SNAPSHOT}/dists/bookworm/Release"; \
    printf '%s\n' "base-image:docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c" > /etc/openreply/ca-cert-source; \
    printf '%s\n' "$DEBIAN_SNAPSHOT" > /etc/openreply/apt-snapshot; \
    dpkg-query -W -f '${Version}\n' wget > /etc/openreply/wget-version; \
    rm -rf /var/lib/apt/lists/* /var/log/apt /var/log/dpkg.log /var/cache/apt /var/cache/ldconfig /tmp/*
