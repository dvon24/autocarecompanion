---
title: 'Complete Suzuki known-issues audit'
type: 'chore'
created: '2026-08-11'
status: 'done'
baseline_commit: '950c28cdec60ea49df4cdd6642ba7dbb6239641a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Production has exactly 18 published Suzuki pages across seven models, with uncertain primary-source applicability and possible trim/YMMT routing failures. A broad cleanup could alter indexed identity, owner telemetry, commerce, or visibility without adequate proof.

**Approach:** Freeze the complete case-insensitive production inventory, independently review every row and route, and retain only bounded same-identity content corrections supported by locally captured primary evidence. Hold every uncertain or overlapping identity byte-identical and authorize no production or metadata write.

## Boundaries & Constraints

**Always:** Preserve every published ID, make casing, model, years, trims, engines, category, title, severity, status, related IDs, owner telemetry, and commerce; pin counts Across 1, Alto 1, Grand Vitara 7, Jimny 3, Swift 3, SX4 1, Vitara 2; audit all 18 rows; distinguish content adjudication from per-year/selectable-trim routing; require exact same-identity primary evidence for any bounded content-only rewrite; use repeatable-read read-only production access and fail on drift.

**Ask First:** Any archive, redirect, identity or vehicle-metadata change, status or severity change, new issue, commerce removal, retail-link addition, production write, deployment, push, email, or other worktree change.

**Never:** Force a write; use sibling-brand, rebadge, platform, seed-script, search-result, or forum similarity as Suzuki proof without exact applicability; infer prevalence, costs, mileage, fitment, repair results, warranty, or DTC scope; mutate held rows; stage routing corrections as writes; record secrets.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Exact support | Primary evidence proves the frozen identity and complete rewritten scope | Bounded content-only retain with pinned local evidence | Reject unsupported or identity-changing prose |
| Weak/conflicted support | Evidence is generic, sibling-only, narrower, overlapping, or contradictory | Published byte-identical hold with an explicit ledger reason | No rewrite under the indexed identity |
| Routing mismatch | Frozen trim lacks exact selectable-trim overlap or matches only by substring | Report exact per-year/trim behavior separately | Zero metadata writes |
| Concurrent drift | Live field, inventory, packet, evidence, or source tree differs | Abort deterministically | No partial write or release action |

</frozen-after-approval>

## Code Map

- `data/_suzuki-deeplink-snapshot-2026-08-11.json` — immutable production baseline and provenance.
- `scripts/suzuki-*-contract.js` — Suzuki normalization, snapshot, inventory, and model contracts.
- `scripts/build-suzuki-*.js` — deterministic ledger, packets, routing report, and make reconciliation.
- `scripts/validate-suzuki-*.js` — evidence, packet, reconciliation, and mutation gates.
- `scripts/verify-suzuki-all-hold-live.js` — read-only production drift verifier for a zero-write result.

## Tasks & Acceptance

**Execution:**
- [x] Freeze all 18 published rows and independently pin exact global, make-variant, and model totals.
- [x] Build a complete conservative review ledger and seven deterministic model packets.
- [x] Capture and hash any exact primary-source conflict or retained-rewrite evidence; validate source bytes and use boundaries.
- [x] Classify every issue/year/selectable-trim route with the shared production matcher contract and no metadata write authority.
- [x] Reconcile every frozen ID once, add mutation/live-verifier tests, run self-adversarial review, and commit only reproducible Suzuki artifacts.

**Acceptance Criteria:**
- Given the freeze, when packet and make reconciliation run, then every one of 18 IDs appears once and all holds remain full-record byte-identical.
- Given a retained rewrite, when validation runs, then each changed claim is exact-scope primary-supported while identity, status, owner telemetry, and commerce remain frozen.
- Given routing analysis, when compared with production TypeScript behavior, then every frozen issue/year/selectable-trim route is equivalent and every failure remains report-only.
- Given live drift or a mutation, when a gate runs, then it fails before any write.

## Spec Change Log

- 2026-08-11: Completed the authorized local audit with 0 retained rewrites, 18 byte-identical published holds, zero evidence captures required, zero metadata writes, and no production mutation.
- 2026-08-11: Self-adversarial review added explicit coverage for all 151 issue-years (including zero missing selectable-trim years), made live verification reject any full reconciliation drift, re-derived ledger model/citation/overlap contracts, and removed unsupported negative-search wording. KEEP the all-hold/no-write boundary and exact frozen identities.

## Design Notes

Reuse the reviewed Skoda contract shape, including Unicode make normalization, local evidence hashes, independent per-row decisions, deterministic regeneration, fail-before-write reconciliation, matcher equivalence, and read-only live verification. Evidence determines the write set; all-hold is a valid completed audit.

The routing report covers all 151 issue-years with zero missing selectable-trim years and classifies 877 issue/year/selectable-trim routes: 429 exact, 15 substring-only, 244 hidden, and 189 model-wide fail-open. No row lacks legitimate selectable-trim overlap or is hidden for all selectable trims, so routing produced no correction candidate and authorized no metadata or YMMT write.

## Verification

**Commands:**
- `node --test scripts/validate-suzuki-model-adjudication.test.js scripts/verify-suzuki-all-hold-live.test.js` — positive and adversarial mutation coverage passes.
- `node scripts/validate-suzuki-primary-evidence.js` and all model/reconciliation validators — exact deterministic evidence and coverage gates pass.
- `..\node_modules\.bin\tsx.cmd --test scripts/suzuki-routing-equivalence.test.ts` — JavaScript mirror equals the TypeScript production matcher.
- `npx eslint <Suzuki scripts>`; `npx tsc --noEmit --incremental false`; `git diff --check` — static and diff checks pass.

**Local results (2026-08-11):** 24 JavaScript mutation/contract tests and two TypeScript matcher-equivalence tests pass. Evidence, all seven packet validators, routing, make reconciliation, targeted ESLint, TypeScript no-emit, diff checks, and read-only live full-record verification pass. Production remained at 7,642 published rows and Suzuki remained at 18; no push, deploy, database write, email, or other-worktree mutation was performed.

## Suggested Review Order

**Conservative adjudication**

- Start with the exact case inventory, overlap families, and per-row hold rationale.
  [`suzuki-case-inventory-contract.js:79`](../../scripts/suzuki-case-inventory-contract.js#L79)

- Follow deterministic packet construction from ledger decisions into byte-identical proposals.
  [`build-suzuki-model-adjudication.js:13`](../../scripts/build-suzuki-model-adjudication.js#L13)

**Freeze and evidence integrity**

- Verify snapshot provenance, Unicode make identity, counts, and per-field hashes.
  [`suzuki-snapshot-contract.js:13`](../../scripts/suzuki-snapshot-contract.js#L13)

- Confirm ledger rows re-derive model, citation, overlap, and justification contracts.
  [`suzuki-review-ledger.js:11`](../../scripts/suzuki-review-ledger.js#L11)

**Routing and release gates**

- Inspect complete issue-year coverage and production-matcher route classification.
  [`build-suzuki-routing-report.js:42`](../../scripts/build-suzuki-routing-report.js#L42)

- Review deterministic make union, zero-drift checks, and reproducible source-tree hashes.
  [`build-suzuki-make-reconciliation.js:42`](../../scripts/build-suzuki-make-reconciliation.js#L42)

- Confirm live verification validates the full plan before read-only database comparison.
  [`verify-suzuki-all-hold-live.js:25`](../../scripts/verify-suzuki-all-hold-live.js#L25)

**Regression proof**

- Check content, ledger, routing, reconciliation, and fail-before-write mutations.
  [`validate-suzuki-model-adjudication.test.js:97`](../../scripts/validate-suzuki-model-adjudication.test.js#L97)

- Verify tampered reconciliation cannot pass with unchanged headline totals.
  [`verify-suzuki-all-hold-live.test.js:71`](../../scripts/verify-suzuki-all-hold-live.test.js#L71)
