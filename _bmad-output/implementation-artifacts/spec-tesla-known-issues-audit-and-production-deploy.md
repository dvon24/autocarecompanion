---
title: 'Complete Tesla known-issues audit and zero-write release verification'
type: 'chore'
created: '2026-08-11'
status: 'done'
baseline_commit: '950c28cdec60ea49df4cdd6642ba7dbb6239641a'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Production has 64 published Tesla pages across Cybertruck, Model 3, Model S, Model X, Model Y, and Semi. Their frozen identities include overlapping cross-model topics, unsupported commerce, routing metadata that can hide or overmatch pages, and at least one definite identity contradiction: `tesla-model-y-seatbelt-anchor-recall` names Model S/X under a Model Y URL.

**Approach:** Preserve the supplied immutable snapshot, independently pin its capture provenance and Unicode-normalized live inventory, review every row conservatively, and emit only byte-identical published holds unless exact inspected primary evidence supports the complete existing identity. Separate content decisions from per-year/selectable-trim routing findings, prove the zero-write union, and verify live counts through a read-only transaction.

## Boundaries & Constraints

**Always:** Preserve all 64 IDs and every full-record field, including make casing, model, years, trims, engines, category, title, severity, status, related IDs, owner telemetry, citations, recommendations, and commerce. Pin counts at Cybertruck 1, Model 3 15, Model S 16, Model X 12, Model Y 15, Semi 5. Enumerate Unicode/case make variants, classify every issue/year/selectable-trim route with production-equivalent matching, preserve duplicate/overlap URLs, and record only evidence whose local captured bytes were actually inspected.

**Ask First:** Any archive, redirect, consolidation, new issue, title or indexed vehicle-metadata change, status/severity change, content rewrite, commerce removal, or retail-link addition.

**Never:** Infer applicability, prevalence, repair outcomes, fitment, mileage, or cost from sibling models, community repetition, search results, or existing seed content. Never mutate held rows, create a dummy apply manifest, write production data, deploy, push, email, or touch unrelated worktree changes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Complete freeze | Supplied 64-row snapshot and independent live inventory | Exact IDs, model counts, raw make variants, hashes, and capture provenance | Abort on count, ID, case, hash, field, or provenance drift |
| Weak or conflicting identity | Evidence is absent, narrower, cross-model, or contradicts the frozen URL/title | Byte-identical published hold with row-specific ledger justification | No content or metadata write |
| Duplicate/overlap | Multiple URLs cover the same recall, subsystem, or cross-model concern | Preserve every indexed URL and record cluster membership | Consolidation requires separate approval |
| Routing boundary | Exact, substring-only, hidden, model-wide, or applicability-prose route | Record every year/trim route independently | Never populate a correction without reviewed evidence |
| All-hold release | 64 holds and zero retained rewrites | Block apply; run read-only live catalog/make/model verification | Abort on stale row, count, or reconciliation drift |

</frozen-after-approval>

## Code Map

- `data/_tesla-deeplink-snapshot-2026-08-11.json` — immutable supplied full-record freeze.
- `data/known-issue-tesla-snapshot-provenance-2026-08-11.json` — independent capture and live-inventory provenance.
- `scripts/tesla-snapshot-contract.js` — snapshot, Unicode make, count, hash, and provenance gate.
- `scripts/tesla-review-ledger.js` — exact 64-row conservative decision ledger.
- `scripts/build-tesla-model-adjudication.js` — deterministic per-model hold packets.
- `scripts/build-tesla-routing-report.js` — per-year/selectable-trim routing inventory.
- `scripts/build-tesla-make-reconciliation.js` — zero-write union and source-tree provenance.
- `scripts/verify-tesla-all-hold-live.js` — read-only live catalog/make/model verifier.

## Tasks & Acceptance

**Execution:**
- [x] Pin the supplied snapshot and independent provenance with exact global, make, model, case, ID, and per-field checks.
- [x] Build the 64-row ledger, duplicate clusters, zero-source evidence inventory, six deterministic all-hold model packets, routing report, and reconciliation.
- [x] Add mutation tests for missing/duplicate rows, Unicode variants, held-field drift, commerce/status/owner drift, routing false positives, stale live data, and invalid zero-write output.
- [x] Run targeted tests, routing equivalence, ESLint, TypeScript no-emit, and diff checks; commit locally only.

**Acceptance Criteria:**
- Given the supplied freeze, when every builder and validator runs, then all 64 IDs appear exactly once as byte-identical published holds and no write is authorized.
- Given each Tesla issue/year/selectable-trim combination, when routing is classified, then the JavaScript audit result equals the TypeScript production matcher.
- Given live or artifact drift, when reconciliation or live verification runs, then it fails before any write-capable action.

## Spec Change Log

- 2026-08-11: Implemented the authorized local audit from the supplied immutable snapshot: pinned independent read-only provenance, produced a 64-row conservative ledger and six byte-identical all-hold packets, captured eight duplicate/overlap clusters, classified 4,798 issue/year/selectable-trim routes, and proved the live 7,642-page catalog still contains the exact 64 frozen Tesla rows. Result: zero retained rewrites, zero metadata corrections, and zero authorized writes.
- 2026-08-11: Closed the independent review block by requiring exact parsed snapshot equality and full deterministic reconciliation validation before live connection, success, or local reconciliation write; added matched snapshot/live full-field mutations and same-summary gate, provenance, model, cross-packet, row-diff, and proposal-hash mutations.

## Design Notes

The absence of newly captured source bytes is an evidence boundary, not a reason to promote existing citations. Existing citation metadata is inventoried in the ledger, but every row remains held unless a later separately approved review captures exact source content. The known Model Y seatbelt contradiction receives a specific hard-hold justification.

The routing report records 770 substring-only routes independently from 1,784 exact routes. The Semi 500-mile row is the sole row without exact selectable-trim overlap; its unpopulated correction candidate authorizes no metadata change. Frozen commerce remains byte-identical but is not endorsed by this audit.

## Verification

**Local results (2026-08-11):** 25 JavaScript mutation/live tests and two TypeScript production-routing equivalence tests pass. All six serialized model packets, the zero-source evidence boundary, routing report, and reconciliation validate deterministically. Targeted ESLint and TypeScript no-emit pass. The read-only repeatable-read live verifier reports catalog 7,642, Tesla 64, exact model counts, exact frozen IDs, and zero stale full-record rows. No production write, push, deploy, or email was performed.

**Commands:**
- `node --test scripts/validate-tesla-model-adjudication.test.js scripts/verify-tesla-all-hold-live.test.js` — mutation and inventory gates pass.
- `..\node_modules\.bin\tsx.cmd --test scripts/tesla-routing-equivalence.test.ts` — all frozen routes match production behavior.
- `node scripts/validate-tesla-primary-evidence.js && node scripts/validate-tesla-make-reconciliation.js` — evidence boundary and exact union pass.
- `npx eslint <Tesla audit scripts> && npx tsc --noEmit --incremental false && git diff --check` — static checks pass.
