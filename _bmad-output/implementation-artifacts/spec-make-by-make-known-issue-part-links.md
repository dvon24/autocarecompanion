---
title: 'Make-by-make known-issue repair-part links'
type: 'feature'
created: '2026-08-12'
status: 'in-review'
baseline_commit: '013e4ef338fc3d2c42b8cc39f5fde43d6203755e'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Thousands of published Known Issues explain which component fixes the vehicle but expose no direct product link, while existing tooling skips articles that already have parts, extracts only one prescription, and can lose the selected trim or engine before rendering. This leaves revenue on the table and can present a part outside its proven application.

**Approach:** Process every published issue make by make in canonical alphabetical order, beginning with Acura. Read every “How to Fix,” enumerate all owner-buyable repair branches, use ShowMeTheParts as fitment evidence across the article’s year/make/model/trim/engine scope, resolve exact part-number product pages, independently review each make, and expose only the variant supported for the selected vehicle.

## Boundaries & Constraints

**Always:** Freeze a full production snapshot before a make starts and derive every later artifact from it. Account for every published issue exactly once as buyable, diagnosis-dependent, recall/dealer, service/tool/fluid, or no-commerce. Extract every prescribed repair component—not only the title subject—and preserve existing verified commerce unless re-review disproves it. Query every claimed year/model/engine application; preserve trim, drivetrain, transmission, side, package, VIN, and catalog restrictions when present. Prefer exact eBay Motors product pages for automotive parts, then exact Amazon/manufacturer/direct-retailer pages. Require repair-role evidence in addition to catalog fitment. Carry the selected year/make/model/trim and derived engine into every renderer; resolve one unambiguous variant or fail closed. Finish, independently review, reconcile, and checkpoint one make before advancing alphabetically.

**Ask First:** Production database writes, deployment, a database schema migration, an SEO identity/title/status change, or a materially broader prose rewrite. A demonstrably wrong named part is held and reported for correction rather than monetized.

**Never:** Treat ShowMeTheParts as proof that a component repairs the issue; infer unsampled-year coverage; publish search/category URLs; guess a part number, retailer destination, fitment, package, side, VIN range, drivetrain, or transmission; show a scoped link when a required selected-vehicle dimension is unknown; replace an entire `fixParts` array when a keyed merge suffices; skip existing parts; or advance past an incomplete/blocked make without recording the hold.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Exact variant | Prescribed component, exact application and direct PN page agree | Verified link scoped to observed vehicle cells | Reject on any evidence mismatch |
| Split application | One article spans several engines/years/trims or RWD/AWD/manual/auto | Store disjoint variants; selected vehicle sees only its match | Unknown/ambiguous dimension shows no CTA and a fitment prompt |
| Conditional diagnosis | Solution lists several possible failed parts | Link only a component confirmed by the stated diagnostic branch | Hold blanket commerce |
| Bad prose claim | Named part contradicts official/catalog application | Zero commerce plus correction finding | Never monetize the claim |
| Existing commerce | Correct or stale `fixParts` already exists | Reverify and keyed-merge; preserve unrelated entries byte-for-byte | Explicit reviewed removal only |
| Drift/re-run | Live row differs from frozen before-state or make is already complete | Abort writes; deterministic no-op when already applied | Refreeze/review before retry |

</frozen-after-approval>

## Code Map

- `src/lib/prescription.ts` — structured extraction of every positive replacement/install clause.
- `scripts/build-fitment-worklist.ts` — frozen-snapshot per-component worklist, including existing parts and full article scope.
- `scripts/verify-parts-fitment.js` — exhaustive ShowMeTheParts traversal and normalized application evidence.
- `src/lib/catalog-candidate-safety.ts` — conservative parsing of application/comment/location restrictions.
- `scripts/build-part-proposals.ts` — disjoint, evidence-backed part variants rather than one universal PN.
- `src/lib/part-link-builder.ts`, `src/lib/ebay-resolver.ts` — exact-PN direct-product resolution.
- `src/schemas/knownIssue.schema.ts`, `src/lib/known-issue-part-fitment.ts` — variant/link schema and selected-vehicle resolution.
- `src/components/known-issues/ArticleIssuesList.tsx`, `KnownIssueCard.tsx`, `src/components/vehicle/VehicleDashboard.tsx`, `src/app/garage/[id]/maintenance/page.tsx` — selected trim/engine propagation and fail-closed rendering.
- `scripts/audit-known-issue-catalog-deeplinks.js`, `scripts/apply-known-issue-catalog-deeplinks.js` — immutable freeze and guarded per-make transaction.

## Tasks & Acceptance

**Execution:**
- [ ] Extend extraction, worklist, catalog evidence, proposal and direct-link stages to preserve every prescription and represent disjoint vehicle variants.
- [ ] Add deterministic per-make artifacts/checkpoints under `data/known-issue-part-audit/<make>/<snapshot-hash>/` and enforce alphabetical progression starting with Acura.
- [ ] Make every public consumer resolve commerce using the selected year/trim and derived engine; require extra fitment input or hide links for unresolved restrictions.
- [ ] Add keyed-merge manifest validation, independent-review evidence, dry-run/apply/post-verify gates, and live destination/UI checks.
- [ ] Complete Acura, independently review it, and use the validated packet pattern for each subsequent make.

**Acceptance Criteria:**
- Given a make snapshot, when reconciled, then every published issue and existing commerce claim has exactly one disposition and zero rows are missing, duplicated, or stale.
- Given a multi-part solution, when processed, then every positively prescribed component is represented or explicitly held.
- Given a selected vehicle, when commerce renders, then only an exact supported variant appears; a wrong or unknown engine/trim/application cannot expose its link.
- Given the Challenger examples, then early/late HEMI water pumps, RWD/AWD sway links, transmission-specific driveshafts, and engine-specific radiators resolve separately without a universal claim.
- Given an approved direct link, then it is live, product-specific, vendor-consistent, exact-PN matched, affiliate-attributed where configured, and never a search page.

## Spec Change Log

- 2026-08-12: Acura packet rebuilt after the first exact-commit review. The
  corrected contract reconciles 70 issues and 151 component/application work
  rows, persists a terminal proposal-or-hold disposition for every row, binds
  raw eBay part-number evidence, shares diagnostic selection with the browser,
  and prevents blocked completion artifacts from being escalated at apply
  time. The audit is complete but remains release-blocked by five unsafe live
  commerce claims and one unresolved authoritative engine context. No
  production write or deployment is authorized.

## Verification

**Commands:**
- `node --test` on prescription, fitment, proposal, link, manifest, and renderer contracts — all focused tests pass.
- `npx eslint <affected files>` and `npx tsc --noEmit --incremental false` — zero introduced diagnostics.
- Per-make dry-run/apply/verify commands — exact counts, hashes, idempotence, and zero unrelated field drift.
- Production browser checks for matching, wrong, and incomplete vehicle selections plus every outbound destination — only supported direct links render.
