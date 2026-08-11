---
title: 'Promote independently reviewed pre-Saturn known-issue audits'
type: 'chore'
created: '2026-08-11'
status: 'done'
baseline_commit: 'e62481f35e24d8d7f728d45eae5b81cc31a305ca'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Porsche, RAM, Renault, Rivian, and Saab have completed proposal-only audits, but their independently approved accuracy corrections are not in production. One RAM proposal omitted recall 22V-904 and must not ship in that state.

**Approach:** Restore the exact 22V-904 facts in the RAM packet, merge the five reproducible audit histories onto current `origin/main`, generate guarded manifests for only the independently approved same-identity rewrites, apply them atomically, verify the frozen indexed inventory, and deploy production. Saturn remains excluded.

## Boundaries & Constraints

**Always:** Preserve every record ID, make casing, model, years, trims, engines, category, title, severity, status, and related IDs; keep every hold published and byte-identical; preserve live `fixParts`; require exact primary citations and the no-buy diagnostic boundary; lock and hash-check every written row before and after the transaction; verify make/model counts and production routes after deploy.

**Ask First:** Any archive, redirect, title/slug change, year/trim/engine scope change, status change, or production write outside the 24 retained rows requires new approval.

**Never:** Apply Saturn; replay held rows; remove a supported recall; infer owner frequency; overwrite unrelated working-tree changes; deploy from the dirty main workspace; expose secrets in logs or committed artifacts.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Approved batch | Five reviewed makes, 286 frozen rows, 24 retained rewrites | Only 24 content-safe rows change; 262 holds are no-ops | Abort on count, hash, identity, citation, or commerce mismatch |
| RAM recall correction | Tailgate row missing 22V-904 | 2019–2022 striker defect and free inspect/adjust remedy restored alongside 18V486/19V347 | Block the row/batch if campaign text, years, or source are absent |
| Concurrent drift | A target row changed after manifest creation | No partial write | Roll back the full transaction and regenerate after review |
| RAM make casing | Published rows split across `RAM` and `Ram` | Combined 102-row inventory is verified without normalizing stored values | Fail if either casing or any model count drifts |
| Deploy | DB apply succeeds but ISR/build fails | Git history remains reproducible; production is not declared verified | Diagnose, fix safely, and rerun deployment gates |

</frozen-after-approval>

## Code Map

- `scripts/ram-1500-adjudication-contract.js` -- exact RAM 1500 evidence contract and blocked tailgate proposal.
- `scripts/build-reviewed-adjudication-apply-manifest.js` -- overlays reviewed changed fields onto locked live rows while preserving unrelated current state.
- `scripts/apply-known-issue-catalog-deeplinks.js` -- schema-v2 transactional hash-guarded production applicator.
- `scripts/verify-reviewed-make-production.js` -- surrounding published inventory/model-page gate.
- `data/known-issue-*-adjudication-*.json` -- frozen per-model proposal packets and provenance.
- `data/known-issues-catalog-deeplink-decisions/` -- release manifests.
- `data/known-issues-catalog-deeplink-results/` -- committed apply/verification evidence.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/ram-1500-adjudication-contract.js` -- restore 22V-904/ZB8 facts, source, and required-prose gate; regenerate/reconcile RAM packets.
- [x] `scripts/build-reviewed-adjudication-apply-manifest.js` and tests -- support reviewed retain/hold actions and preserve current commerce fields.
- [x] `scripts/verify-reviewed-make-production.js` and tests -- verify case-split RAM inventory without changing stored make identity.
- [x] Five audit branches -- merge complete reproducible histories into an isolated release branch based on current `origin/main`.
- [x] Decision/result artifacts -- build, dry-run, atomically apply, and independently verify 24 reviewed writes.
- [x] Production -- push reviewed release to `main`, wait for Vercel, and verify deployed routes plus catalog invariants.

**Acceptance Criteria:**
- Given 286 frozen rows across Porsche through Saab, when the release completes, then all remain published under identical indexed identities and model counts.
- Given the RAM tailgate page, when read after apply, then it accurately distinguishes the 2013–2018 limiter-tab campaigns from 2019–2022 recall 22V-904/ZB8.
- Given 262 held rows, when manifests are built and applied, then none is written.
- Given existing commerce, when accuracy content is applied, then `fixParts` is unchanged unless separately owner-authorized.
- Given a failed pre-state/post-state/build/live gate, when encountered, then the transaction or promotion stops without claiming production success.

## Spec Change Log

## Design Notes

Use one release branch and one guarded make-scoped transaction per approved manifest after a full-set preflight. Git promotion and database mutation remain separately verifiable: committed decision manifests describe the exact write set, while result artifacts record each transaction outcome and post-apply inventory checks.

## Verification

**Commands:**
- `node --test scripts/build-reviewed-adjudication-apply-manifest.test.js scripts/verify-reviewed-make-production.test.js` -- reviewed-manifest and inventory edge cases pass.
- `node scripts/apply-known-issue-catalog-deeplinks.js --manifest <each> --dry-run` -- all 24 pre-state and schema gates pass with zero writes.
- `node scripts/apply-known-issue-catalog-deeplinks.js --manifest <each> --apply` -- atomic apply reports exact expected write count.
- `node scripts/verify-reviewed-make-production.js --manifest <each>` -- published make/model inventory passes after apply.
- `npm run build` -- production build exits 0.
- `vercel inspect <deployment>` and live route checks -- deployment is Ready and reviewed pages serve expected content.

## Suggested Review Order

**Frozen identity and live-state overlay**

- Defines the indexed fields that no reviewed content write may change.
  [`build-reviewed-adjudication-apply-manifest.js:36`](../../scripts/build-reviewed-adjudication-apply-manifest.js#L36)

- Overlays approved prose onto current rows while preserving verified `fixParts`.
  [`build-reviewed-adjudication-apply-manifest.js:120`](../../scripts/build-reviewed-adjudication-apply-manifest.js#L120)

**RAM recall correction**

- Separates limiter-tab campaigns from 22V-904/ZB8 striker alignment and remedies.
  [`ram-1500-adjudication-contract.js:199`](../../scripts/ram-1500-adjudication-contract.js#L199)

- Pins the exact official NHTSA recall acknowledgement PDF.
  [`ram-1500-adjudication-contract.js:231`](../../scripts/ram-1500-adjudication-contract.js#L231)

**Production inventory gates**

- Aggregates exact make casing across model packets.
  [`verify-reviewed-make-production.js:31`](../../scripts/verify-reviewed-make-production.js#L31)

- Verifies published counts without normalizing stored identities.
  [`verify-reviewed-make-production.js:64`](../../scripts/verify-reviewed-make-production.js#L64)

**Regression coverage**

- Proves frozen engine scope cannot drift under an indexed ID.
  [`build-reviewed-adjudication-apply-manifest.test.js:61`](../../scripts/build-reviewed-adjudication-apply-manifest.test.js#L61)

- Proves `RAM` and `Ram` inventories stay independently exact.
  [`verify-reviewed-make-production.test.js:9`](../../scripts/verify-reviewed-make-production.test.js#L9)
