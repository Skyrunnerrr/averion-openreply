# syntax=docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e
# Synthetic non-release proof of the canonical builder.
# The image digest from this file is not a release digest.

FROM docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c
WORKDIR /tmp/proof

ARG OPENREPLY_ACTION_FINGERPRINT
ARG DEBIAN_SNAPSHOT=20260421T000000Z
ARG WGET_VERSION=1.21.3-1+deb12u1

LABEL org.openreply.synthetic-builder-proof="true"
LABEL org.openreply.canonical-image="false"
LABEL org.openreply.server-action-key-fingerprint="${OPENREPLY_ACTION_FINGERPRINT}"

RUN --mount=type=secret,id=next_server_actions_key,required=true \
    set -eu; \
    umask 077; \
    tr -d '\r\n' < /run/secrets/next_server_actions_key > /tmp/sa-key-b64; \
    test -s /tmp/sa-key-b64; \
    base64 -d /tmp/sa-key-b64 > /tmp/sa-key-raw; \
    test "$(wc -c < /tmp/sa-key-raw | tr -d ' ')" = "32"; \
    fp="$(sha256sum /tmp/sa-key-raw | awk '{print $1}')"; \
    test -n "$OPENREPLY_ACTION_FINGERPRINT"; \
    test "$fp" = "$OPENREPLY_ACTION_FINGERPRINT"; \
    mkdir -p /etc/openreply; \
    printf '%s\n' "$fp" > /etc/openreply/server-action-key-fingerprint; \
    rm -f /tmp/sa-key-b64 /tmp/sa-key-raw; \
    unset fp

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
