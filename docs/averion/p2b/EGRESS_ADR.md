# Egress enforcement decision

`EGRESS_ADR_CHOICE=B`

## Options

Option A. Enforce egress in the deployment platform: a Kubernetes NetworkPolicy plus a controlled egress proxy that allows only the inventoried hosts.

Option B. Keep this provider unit on Docker Compose and defer hostname egress enforcement to the concrete staging infrastructure gate.

## Decision

Option B.

Docker Compose bridge networks do not filter outbound connections by destination hostname. The `internal` network in `averion/deploy/compose.provider.yml` is a normal bridge. It is not Compose's `internal: true` mode, because that mode would also block the outbound calls the webhook and sign-in paths require. No firewall, sidecar proxy, or NetworkPolicy is installed by this pull request.

`averion/deploy/egress-map.json` is an inventory of destinations named in the source. It is not an enforcement control. `EGRESS_INVENTORY` and `EGRESS_ENFORCEMENT` are separate results. A passing inventory is not `EGRESS_SECURITY=PASS`.

## Consequences

`EGRESS_ENFORCEMENT=NOT_IMPLEMENTED`

`READY_FOR_META_HUMAN_CLOSURE=NO`

`READY_FOR_LIVE_INFRA=NO`

`READY_FOR_LIVE_PILOT=NO`

`READY_FOR_PRODUCTION=NO`

A later staging gate can make this provider pull request mergeable only after that environment shows outbound traffic is limited to the approved hosts. This draft does not authorize that merge.

`MERGE_PROVIDER_PRS=NO`
