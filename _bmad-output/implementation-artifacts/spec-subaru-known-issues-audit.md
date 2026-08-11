---
title: 'Complete Subaru known-issues audit'
type: 'chore'
created: '2026-08-11'
status: 'in-review'
baseline_commit: '950c28cdec60ea49df4cdd6642ba7dbb6239641a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Subaru has 205 published known-issue pages plus 12 historical archived rows. A broad audit could overwrite indexed identities, republish archives, change owner or commerce state, or hide valid pages through trim routing.

**Approach:** Freeze production read-only, review every published row conservatively in deterministic per-model packets, authorize only exact same-identity evidence-backed prose or citation corrections, and independently report routing failures without metadata writes. An all-hold result is valid.

## Boundaries & Constraints

**Always:** Preserve every published ID, title, make/model, years, trims, engines, category, severity, status, related IDs, owner telemetry, and commerce unless exact same-identity primary evidence supports a bounded content-only rewrite; inventory raw make variants and Unicode/case normalization; audit all 205 published rows exactly once; keep the 12 archived rows excluded from packets and published totals; use repeatable-read read-only production queries; fail closed on drift or incomplete reconciliation.

**Ask First:** Any archive, redirect, identity or vehicle-metadata change, status/severity change, new issue, commerce removal, retail-link addition, production write, deployment, push, or external message.

**Never:** Republish or count archived rows as published; use sibling-model/platform similarity as Subaru proof without exact applicability; infer prevalence, repair outcome, mileage, cost, warranty, DTC, or fitment; treat search snippets, reachable URLs, forums, or seed scripts as primary evidence; force a write to make the audit look productive; write production, deploy, push, email, or alter another worktree.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Exact same identity | Captured primary evidence supports the frozen page identity and full claim scope | Bounded content-only proposal with exact evidence | Reject metadata, identity, unsupported, owner, or commerce drift |
| Uncertain or overlapping identity | Evidence is absent, generic, narrower, contradictory, or duplicate-looking | Complete byte-identical published hold | Record rationale; authorize no write |
| Archived history | Twelve non-published rows exist in the make-wide inventory | Inventory separately; exclude from snapshot packets and published count | Fail if any archive is proposed or counted as published |
| Routing mismatch | Frozen issue/year/trim does not route to selectable YMMT trims or only substring-matches | Report every route and an empty correction candidate | No metadata write or silent correction |
| Live drift | Production differs from the freeze or exact inventory | Abort verification before any mutation | Require a new approved freeze |

</frozen-after-approval>

## Code Map

- `data/_subaru-deeplink-snapshot-2026-08-11.json` — immutable 205-row published production freeze with provenance and make inventory contract.
- `data/_subaru-status-inventory-2026-08-11.json` — read-only 217-row make inventory separating 205 published from 12 archived IDs.
- `data/known-issue-subaru-*-adjudication-2026-08-11.json` — deterministic per-model published decisions.
- `data/known-issue-subaru-review-ledger-2026-08-11.json` — independent 205-row conservative decision ledger.
- `data/known-issue-subaru-primary-evidence-2026-08-11.json` — pinned empty evidence set proving that no conflict or rewrite crossed the capture threshold.
- `data/known-issue-subaru-routing-report-2026-08-11.json` — per-year/selectable-trim production-matcher report with zero metadata writes.
- `scripts/subaru-*.js` and `scripts/build-subaru-*.js` — snapshot, evidence, packet, ledger, routing, reconciliation, and live read-only contracts.

## Tasks & Acceptance

**Execution:**
- [x] Freeze production and pin 205 published rows across 14 models, while reconciling the supplied 217-row all-status inventory and 12 archived-row delta.
- [x] Generate and validate the evidence inventory, 205-row ledger, 14 model packets, routing report, and make reconciliation deterministically.
- [x] Add mutation tests for case/Unicode inventory, archived leakage, identity/status/owner/commerce drift, held-row mutation, ledger gaps, routing writes, reconciliation gaps, and live query mutability.
- [x] Run self-adversarial checks, JS/TS production-matcher equivalence, evidence, reconciliation, live read-only inventory, ESLint, TypeScript, and diff checks; hand the exact local commit to the coordinator for an additional independent review before integration.
- [x] Prepare only reproducible local Subaru artifacts for the authorized `chore: audit Subaru known issues` commit.

**Acceptance Criteria:**
- Given the frozen inventory, when contracts run, then all 205 published IDs appear exactly once, no archived ID appears, and every forbidden field is preserved.
- Given no exact same-identity evidence, when packets build, then the row is a byte-identical hold and produces no authorized write.
- Given YMMT selections, when routing builds, then every issue/year/selectable-trim route uses the shared production matcher and correction candidates authorize zero metadata changes.
- Given any live or artifact drift, when validation runs, then it fails before a write callback or mutable query.

## Spec Change Log

- 2026-08-11: Completed the authorized local audit without production mutation. The exact result is 0 retained rewrites, 205 byte-identical published holds, 12 archived rows excluded, and 0 authorized content or metadata writes.
- 2026-08-11: Hardened the all-status boundary after reconciling the supplied counts: the per-model totals sum to 217, while the read-only production freeze proves 205 published plus 12 archived. Archived IDs are separately pinned and rejected by packets, routing, reconciliation, and live verification.

## Design Notes

The 14 supplied per-model totals sum to 217; the 12-row difference from the 205 published baseline is the archived inventory. The published model contract is therefore Ascent 11, Baja 4, BRZ 10, Crosstrek 14, Forester 33, Impreza 12, Legacy 15, Loyale 2, Outback 41, Solterra 22, SVX 2, Tribeca 4, WRX 19, and WRX STI 16. The all-status contract retains the supplied 217-row counts solely to prove that archives were not republished.

No reviewed row had a byte-pinned exact same-identity source sufficient for a bounded rewrite, so the evidence set is intentionally empty. Five duplicate-looking clusters remain separately indexed. Routing remains report-only: 5,521 routes include 1,219 exact, 889 substring-only, 542 hidden, and 2,871 model-wide fail-open routes; seven rows have no exact selectable-trim overlap and two issue-years have no selectable trims. No correction candidate contains proposed metadata.

## Verification

**Commands:**
- `node --test scripts/validate-subaru-model-adjudication.test.js scripts/verify-subaru-all-hold-live.test.js scripts/subaru-independent-adversarial.test.js` — 33 deterministic, mutation, archive, routing, provenance, and read-only-query tests pass.
- `..\node_modules\.bin\tsx.cmd --test scripts/subaru-routing-equivalence.test.ts` — JS audit mirror matches the production TypeScript matcher.
- `node scripts/validate-subaru-primary-evidence.js` plus all 14 packet validators and `node scripts/validate-subaru-make-reconciliation.js` — evidence, exact coverage, archive exclusion, and source provenance pass.
- `node scripts/verify-subaru-all-hold-live.js` — read-only production verification passes global 7,642, Subaru 205 published plus 12 archived, exact model/status splits and archived IDs.
- Targeted ESLint, `npx tsc --noEmit --incremental false`, and staged `git diff --check` — pass.
