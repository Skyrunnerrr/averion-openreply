# 27 CONTRADICTION AUDIT

RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_ARTIFACT_REVIEW_PREP_01

Compared: pull request #2 body as fetched for this run, evidence `09`–`24`, `package.json`, `package-lock.json`, `averion/artifacts/lockfile.sha256`, `averion/deploy/canonical-builder.json`, `averion/artifacts/image-provenance.json`, `21`, `15`, `23`, and `12`–`17`. Historical files were not rewritten.

REAL_CONTRADICTIONS=0
STALE_CURRENT_CLAIMS=0

A stale file that still describes an older image is `VALID_HISTORICAL_SUPERSESSION` when `17`, `21`, and the pull request already say it is not current evidence. It is not counted as a current claim.

## Classifications

| ID | Apparent deviation | Classification | Why |
| --- | --- | --- | --- |
| C1 | `15` tests 334 passed / 12 skipped versus `23` tests 346 passed / 0 skipped | VALID_HISTORICAL_SUPERSESSION | `23` is the later run with `TEST_DATABASE_URL` set. `23` says the 334 did not regress. |
| C2 | `15` lists nine unexecuted gaps versus `19` closing eight | VALID_HISTORICAL_SUPERSESSION | `19` adjudicates the same nine rows after execution. |
| C3 | `15` health had no response versus `22` health 200 | VALID_HISTORICAL_SUPERSESSION | `15` had no Postgres and no Redis. `22` used the local instances from `20`. |
| C4 | `17` class F = 9 and class G = 2 versus `24` local gaps 0 and image current | VALID_HISTORICAL_SUPERSESSION | `17` is the pre-completion table. `24` is the later gate. C and D are unchanged. |
| C5 | `17` says the image was not rebuilt versus `21` matching digest | VALID_HISTORICAL_SUPERSESSION | The rebuild happened after `fe2f1ff`, from a git archive of `fe2f1ff`. |
| C6 | `image-provenance.json` digest `sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23`, source `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`, lockfile `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` versus `21` digest `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829` and next 16.3.8 | VALID_HISTORICAL_SUPERSESSION | `10` left that JSON unchanged. `17` class G and `21` say the `8f44` image is not current. The pull request section "Historical RC2 image check" says the same. Current local image authority is `21`. |
| C7 | `canonical-builder.json` lockfile `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7` versus the hash inside `image-provenance.json` | VALID_HISTORICAL_SUPERSESSION | The builder file was updated at the pin. The provenance JSON still records the older image. |
| C8 | Pull request remediation section (334/12, evidence `09`–`17`, image not rebuilt in that commit) versus local-completion section (346/0, evidence `18`–`24`, later image) | NO_CONFLICT | The body keeps the two commits in separate sections. |
| C9 | Pull request historical digest `8f44` versus local manifest `dbcdc0b3` | NO_CONFLICT | The body says `8f44` is not current evidence. |
| C10 | `15` writes `describe.skipIf(!DATABASE_URL)` versus `18` writing the gate as `TEST_DATABASE_URL` | NO_CONFLICT | Source binds `const DATABASE_URL = process.env.TEST_DATABASE_URL` and skips on that const. Both sentences describe that gate. |
| C11 | `24` says files 01 through 17 were not overwritten, while 01 through 08 do not exist | NO_CONFLICT | The sentence is a non-overwrite statement. It does not say those eight files exist. Git history shows they were never added. See C14. |
| C12 | HEAD `61fc758` versus image `SOURCE_SHA` `fe2f1ff` | NO_CONFLICT | `21` and `24` name the archive. `git diff fe2f1ff 61fc758` is only `18`–`24`. |
| C13 | `17` prose highlights classes C and D while the table also leaves F and G open | NO_CONFLICT | The table is the count at that commit. The prose names the upstream items that block a freeze. |
| C14 | Numbered slots 01 through 08 have no file | MISSING_LINEAGE | Not a silent mis-attribution. There is no document to attribute. `10` defines the remediation set as `09`–`17`. This is why `EVIDENCE_01_24_COMPLETE=NO`. |
| C15 | `package.json` `next` `16.3.8` and `eslint-config-next` `16.3.8` versus lockfile entry and `node_modules/next` `16.3.8` | NO_CONFLICT | Rechecked in this prep run. Lockfile sha256 matches `11`, `canonical-builder.json`, and `averion/artifacts/lockfile.sha256`. |
| C16 | `19` label `CLOSED_BY_LOCAL_RUNTIME` versus the six adjudication names in the local-completion request | NO_CONFLICT | `19` defines the label as image execution, not a new unit test and not a prior note. |

No row is `REAL_CONTRADICTION`. No row is `STALE_CURRENT_CLAIM`.

## Integrity notes that are not contradictions

- `09`–`17` have an empty diff from `fe2f1ff` to `61fc758`.
- `18`–`24` appear first in `61fc758`.
- This prep run did not execute `npm ci`, `npm test`, `npm run build`, or a new image build. Consistency checks were the lockfile hash, the installed `next` version string, the manifest pins, and git ancestry.
- Secret scan of `09`–`24` found no cloud token, private key, bearer token, or database URL that includes a password. `20` records a disposable role without writing the password. `21` records the publishable SHA-256 fingerprint of the server-action key, not the key. SECRET_LEAKS=0.
