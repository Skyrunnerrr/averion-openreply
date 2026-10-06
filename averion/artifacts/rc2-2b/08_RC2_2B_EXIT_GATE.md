# 08 RC2.2B EXIT GATE — FAIL CLOSED

| # | Exit criterion | Result | Evidence |
|---|---|---|---|
| E1 | Lineage clear; HEAD documented | PASS. HEAD 93a793ae = expected RC2.2A head, unmoved | 01 |
| E2 | ALL 9 advisories CLOSED_* | **FAIL**: 7/9 closed (6 NOT_AFFECTED, 1 NOT_REACHABLE); 2/9 BLOCKED_EVIDENCE_MISSING (Critical + High pending upstream, no GHSA) | 02 |
| E3 | Final patch ranges verified for all 9 | **FAIL**: 1/7 final (h694 = 16.3.8); 6/7 still `16.3.?`/`15.5.?`; 2 have no advisory | 04 |
| E4 | Lockfile resolution verified | PASS. next 16.2.6, single copy, integrity matches registry tarball | 03 |
| E5 | Installed graph verified | **FAIL / UNKNOWN**: no install and no image inspection (READ_ONLY phase) | 03 |
| E6 | No OPEN_VULNERABLE `next` advisory with a final first_patched above the locked version | **FAIL**: 16.2.6 is below the final first_patched of 12 other published `next` advisories (3 Critical: vcvr→16.3.6, 2xp9/p293→16.3.3; 9 High/Moderate→16.2.11). At least 2 (GHSA-6gpp proxy bypass, GHSA-m99w Server Actions DoS) are potentially reachable | 02 (outside-matrix table), 05 |
| E7 | Build passes | NOT_RUN | 06 |
| E8 | Tests pass | NOT_RUN | 06 |
| E9 | Security exceptions documented/approved | NONE GRANTED. No exception exists for E2/E3/E6 | — |
| E10 | No unauthorized changes | PASS. CHANGES_MADE=NONE | 07 |

Other audit findings (outside the Next scope, not adjudicated here): npm audit also reports critical findings on next-auth / @auth/core / @auth/prisma-adapter, high on nodemailer and prisma, and more (32 packages total). See 05.

## Decision
**RC2_2B = HOLD.** Not FROZEN_PASS. Not BLOCKED_LINEAGE, because lineage is clear.
- The hard upstream blocker is the 2 pending (Critical + High) advisories. No repo action can close them until upstream publishes.
- A remediable blocker also exists today: next 16.2.6 → 16.3.8 (MINIMAL_FIX in 04, not executed). It clears E6, but it **cannot** produce FROZEN_PASS while E2/E3 stay open.

NEXT_ALLOWED_STEP = WAIT_UPSTREAM_ADVISORIES. In parallel, RC2_2B_REMEDIATION_ONLY (pin next@16.3.8 and eslint-config-next@16.3.8, regenerate the lockfile, rebuild, re-prove) may be authorized separately to clear E6 before the upstream fixes land.
