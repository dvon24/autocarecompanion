---
title: 'Complete SEAT known-issues audit and production deployment'
type: 'chore'
created: '2026-08-11'
status: 'done'
baseline_commit: '788bc03680e738d3ffb18c2718f78f1ae8887e6a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Production has 36 published SEAT pages across six models, with uneven sourcing, overlapping identities, and claims sometimes inferred from related Volkswagen Group vehicles. A broad cleanup could change indexed URL meaning, remove model coverage, and repeat the prior SEO incident.

**Approach:** Freeze the complete case-insensitive inventory, audit every model alphabetically against opened primary evidence, retain only bounded same-identity corrections, and make unsupported or conflicted rows byte-identical holds. Independently review the packets, promote only approved retains through hash-guarded manifests, deploy production, and verify live content and counts.

## Boundaries & Constraints

**Always:** Preserve ID, make casing, model, years, trims, engines, category, title, severity, status, and related IDs; keep all 36 pages published; audit Alhambra, Arona, Ateca, Ibiza, Leon, then Mii; verify each material scope, symptom, mechanism, remedy, DTC, and campaign from the opened source; preserve live commerce; use unknown owner count `0` without rendering “0+ owners”; add a diagnosis/no-buy boundary when no universal part is proven; abort on drift, missing coverage, citation mismatch, or model-count loss.

**Ask First:** Any archive, redirect, consolidation, new issue, identity/vehicle-metadata change, status/severity change, or retail-link addition.

**Never:** Present Volkswagen/Skoda/Cupra similarity as SEAT proof without an exact applicability path; infer prevalence, mileage, cost, warranty, DTC, fitment, or outcome; treat search results or HTTP success as evidence; mutate holds; touch unrelated workspace work; deploy from dirty main.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Supported identity | Exact evidence supports frozen component, failure, and scope | Bounded prose/citation cleanup only | Reject unsupported or expanded claims |
| Conflicted identity | Evidence is generic, sibling-only, narrower, or contradicts title | Published byte-identical hold | Record conflict; do not rewrite under old slug |
| Overlapping pages | Two IDs appear to describe one timing-chain/DSG identity | Preserve both URLs | Require separate redirect/consolidation approval |
| Concurrent drift | Live row differs after freeze | No partial write | Roll back and regenerate |
| Promotion | Reviewed retains pass all gates | Catalog stays 7,642; SEAT stays 36 with exact model counts | Stop on build, deploy, API, or count failure |

</frozen-after-approval>

## Code Map

- `data/_seat-deeplink-snapshot-2026-08-11.json` -- immutable 36-row production baseline.
- `data/known-issue-seat-primary-evidence-2026-08-11.json` -- dated, hash-pinned primary-evidence capture.
- `scripts/seat-snapshot-contract.js` -- case-insensitive inventory, file hash, internal hash, and per-field freeze gate.
- `scripts/seat-model-adjudication-contracts.js` -- exact evidence and retain/hold decisions.
- `scripts/build-seat-model-adjudication.js` -- deterministic packet builder.
- `scripts/validate-seat-model-adjudication.js` -- identity, citation, owner-count, and commerce gates.
- `scripts/build-seat-make-reconciliation.js` -- complete make/model/row coverage proof.
- `scripts/build-reviewed-adjudication-apply-manifest.js` -- reviewed live-state overlay preserving identity and commerce.
- `scripts/apply-known-issue-catalog-deeplinks.js` -- transactional production applicator.
- `scripts/verify-reviewed-make-production.js` -- surrounding inventory gate.

## Tasks & Acceptance

**Execution:**
- [x] `data/_seat-deeplink-snapshot-2026-08-11.json` -- freeze the case-insensitive baseline and prove model counts `1/8/1/11/14/1`.
- [x] `scripts/seat-model-adjudication-contracts.js` plus builder/validator tests -- audit all six models in order and generate deterministic packets.
- [x] `scripts/build-seat-make-reconciliation.js` -- prove complete coverage and freeze the exact independent-review bundle.

**Acceptance Criteria:**
- Given the frozen inventory, when reconciliation completes, then every exact ID appears once and no indexed field, status, or model count changes.
- Given a retain, when the deterministic packet builds, then every material claim has opened exact evidence and no sibling-brand inference is stated as SEAT fact.
- Given a hold, when the deterministic packet builds, then its proposal is byte-identical and its changed-field list is empty.
- Given current or future `fixParts`, when content applies, then commerce stays byte-identical absent separate approval.
- Given the completed local bundle, when it is handed to review, then its application gate remains blocked and production is untouched.

## Post-Review Release Checklist

- [ ] Independently re-derive production inventory, live-before equality, and the exact evidence for the one retained row.
- [ ] Commit and push `codex/seat-deeplink-audit` with only the reproducible audit artifacts.
- [ ] Build a reviewed schema-v2 decision manifest; dry-run, apply, and verify only independently approved retained rows while all holds produce zero writes.
- [ ] Promote the gated release to `origin/main` and Vercel production; verify the deployment ID, exact catalog/model counts, and representative live SEAT content.
- [ ] Stop and do not declare production complete on any failed citation, hash, build, deployment, API, or inventory gate.

## Spec Change Log

- 2026-08-11: Separated the local implementation/reconciliation gate from the post-review production checklist. BMad Step 3 forbids remote operations, so leaving commit/push/apply/deploy inside its completion list would make the approved workflow impossible while providing no additional safety. The frozen intent and all production safeguards are unchanged.
- 2026-08-11: Adversarial review reduced the write set from four rows to one, converted year/engine-scope conflicts to byte-identical holds, removed inferred handbrake consequences, pinned snapshot/evidence hashes, added case-variant and nested-social-proof gates, preserved mutable owner telemetry, blocked stale body overlays, classified exact release actions, enforced catalog-wide status totals, and made all evidence artifacts trackable.

## Design Notes

Deterministic per-model contracts allow independent review, while make reconciliation proves nothing falls between packets. Evidence drives prose; validators enforce invariants but never force unsupported wording.

## Verification

**Commands:**
- `node --test scripts/validate-seat-model-adjudication.test.js scripts/build-reviewed-adjudication-apply-manifest.test.js scripts/verify-reviewed-make-production.test.js` -- positive, mutation, stale-overlay, action-classification, and global-count cases pass.
- `node scripts/validate-seat-primary-evidence.js` -- pinned evidence capture, PDF fingerprints/pages, and retained recall facts match.
- `node scripts/build-seat-make-reconciliation.js` -- 36 rows/six models; zero identity, status, owner-social-proof, or commerce drift.
- `node scripts/build-reviewed-adjudication-apply-manifest.js --apply-actions retain_indexed_identity_and_accuracy_cleanup --hold-actions hold_indexed_identity_byte_identical_pending_identity_policy ...` -- one write candidate and 35 classified no-op holds.
- `node scripts/apply-known-issue-catalog-deeplinks.js --manifest <file> --dry-run` -- reviewed pre-states match with exactly one guarded write.
- `node scripts/verify-reviewed-make-production.js --manifest <file>` -- SEAT and catalog inventories remain exact.
- `npm run build` -- production build exits 0.
- `vercel inspect <deployment>` plus authenticated API checks -- Ready on intended commit with reviewed content live.

## Suggested Review Order

**Evidence-bounded adjudication**

- Start with the one retained identity and 35 conservative no-op decisions.
  [`seat-model-adjudication-contracts.js:41`](../../scripts/seat-model-adjudication-contracts.js#L41)

- Confirm the retained handbrake copy states only the exact DVSA campaign facts.
  [`seat-model-adjudication-contracts.js:77`](../../scripts/seat-model-adjudication-contracts.js#L77)

- Inspect the dated primary-source capture and exact 2017 campaign record.
  [`known-issue-seat-primary-evidence-2026-08-11.json:7`](../../data/known-issue-seat-primary-evidence-2026-08-11.json#L7)

**Freeze and mutation safety**

- Verify file, internal, case-insensitive inventory, and per-field snapshot pinning.
  [`seat-snapshot-contract.js:11`](../../scripts/seat-snapshot-contract.js#L11)

- Follow packet construction where held rows clone their entire frozen record.
  [`build-seat-model-adjudication.js:50`](../../scripts/build-seat-model-adjudication.js#L50)

- Review byte-identical holds and retained nested-content precision gates.
  [`validate-seat-model-adjudication.js:71`](../../scripts/validate-seat-model-adjudication.js#L71)

**Production overlay and inventory safety**

- Confirm live changed fields must still equal their reviewed frozen values.
  [`build-reviewed-adjudication-apply-manifest.js:122`](../../scripts/build-reviewed-adjudication-apply-manifest.js#L122)

- Confirm catalog-wide status totals fail release on any unrelated page loss.
  [`verify-reviewed-make-production.js:111`](../../scripts/verify-reviewed-make-production.js#L111)

- Review the exact six-model union, provenance, and zero-drift counters.
  [`build-seat-make-reconciliation.js:28`](../../scripts/build-seat-make-reconciliation.js#L28)

**Regression proof and reproducibility**

- Start mutation tests with the 35-hold byte-identity invariant.
  [`validate-seat-model-adjudication.test.js:32`](../../scripts/validate-seat-model-adjudication.test.js#L32)

- Confirm case-variant and frozen-field mutations are rejected.
  [`validate-seat-model-adjudication.test.js:89`](../../scripts/validate-seat-model-adjudication.test.js#L89)

- Ensure the snapshot, evidence, packets, and reconciliation cannot be omitted.
  [`.gitignore:62`](../../.gitignore#L62)
