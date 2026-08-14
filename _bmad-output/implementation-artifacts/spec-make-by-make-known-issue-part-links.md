---
title: 'Make-by-make known-issue repair-part links'
type: 'feature'
created: '2026-08-12'
status: 'in-review'
baseline_commit: '013e4ef338fc3d2c42b8cc39f5fde43d6203755e'
review_loop_iteration: 5
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Thousands of published Known Issues explain which component fixes the vehicle but expose no direct product link, while existing tooling skips articles that already have parts, extracts only one prescription, and can lose the selected trim or engine before rendering. This leaves revenue on the table and can present a part outside its proven application.

**Approach:** Process every published issue make by make in canonical alphabetical order, beginning with Acura. Read every “How to Fix,” enumerate all owner-buyable repair branches, use ShowMeTheParts as fitment evidence across the article’s year/make/model/trim/engine scope, resolve exact part-number product pages, independently review each make, and expose only the variant supported for the selected vehicle.

## Boundaries & Constraints

**Always:** Freeze a full production snapshot before a make starts and derive every later artifact from it. Account for every published issue exactly once as buyable, diagnosis-dependent, recall/dealer, service/tool/fluid, or no-commerce. Extract every prescribed repair component—not only the title subject—and preserve existing verified commerce unless re-review disproves it. When an existing exact direct-retailer product link remains safe and fitment-correct, keep it and add one vendor-distinct exact eBay product link when available; expose at most two links for a part so the result is a useful primary retailer plus alternate rather than duplicate marketplace listings. Choose the strongest product-identity source as primary: an exact manufacturer page for a named Mishimoto or similar upgrade, an exact OEM-retailer page such as MoparPartsGiant for a quoted OEM number, or an exact marketplace listing when that is the best verified destination; eBay is the preferred alternate, not a mandatory replacement for a better direct page. Query every claimed year/model/engine application; preserve trim, drivetrain, transmission, side, package, VIN, and catalog restrictions when present. Require repair-role evidence in addition to catalog fitment. Carry the selected year/make/model/trim and derived engine into every renderer; resolve one unambiguous variant or fail closed. Finish, independently review, reconcile, and checkpoint one make before advancing alphabetically.

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

### Review Findings

- [x] [Review][Patch] Preserve the primary object and exact specifications in replacement prose (`replace X with Y`, decimal part specifications, schedules, and `fix is replacing`) [src/lib/prescription.ts:84]
- [x] [Review][Patch] Extract every coordinated or conditional repair component, including O-rings, blower/resistor branches, racks, receiver/driers, clutch packs, rotors, shims, and shared-noun lists [src/lib/prescription.ts:135]
- [x] [Review][Patch] Keep modal/passive replacements diagnosis-dependent and reject uppercase imperative negation [src/lib/prescription.ts:290]
- [x] [Review][Patch] Do not let dealer/software language suppress separately prescribed conditional repair work items [src/lib/known-issue-fitment-worklist.ts:107]
- [x] [Review][Patch] Close the completion implementation boundary over the contract, finalizer/applicator/later-make gate, YMMT evidence, URL/affiliate guards, and Vision vendor dependencies [scripts/known-issue-completion-contract.js:13]
- [x] [Review][Patch] Capture the remaining frozen Acura branches: rear quarter/patch panels, bearing/race, auto-disable module, oil-fouled plugs/VCM controller, piston-rings, C-series swap, carbon synchros, NSX O-ring/NA2 conversion, and caliper hardware [src/lib/prescription.ts:22]
- [x] [Review][Patch] Bind negation to fix/rebuild actions and keep a dealer campaign from suppressing a separate conditional repair [src/lib/prescription.ts:42]
- [x] [Review][Patch] Bind every 03 evidence row to the exact 02 component/role/scope row and validate every approved primary or alternate direct link [scripts/finalize-known-issue-make-packet.js:240]
- [x] [Review][Patch] Require actual eBay affiliate parameters before persisting affiliate:true and bind every direct release dependency named by the spec [scripts/known-issue-completion-contract.js:13]

**Acceptance Criteria:**
- Given a make snapshot, when reconciled, then every published issue and existing commerce claim has exactly one disposition and zero rows are missing, duplicated, or stale.
- Given a multi-part solution, when processed, then every positively prescribed component is represented or explicitly held.
- Given a selected vehicle, when commerce renders, then only an exact supported variant appears; a wrong or unknown engine/trim/application cannot expose its link.
- Given the Challenger examples, then early/late HEMI water pumps, RWD/AWD sway links, transmission-specific driveshafts, and engine-specific radiators resolve separately without a universal claim.
- Given an approved direct link, then it is live, product-specific, vendor-consistent, exact-PN matched, affiliate-attributed where configured, and never a search page.

## Spec Change Log

- 2026-08-12: Acura packet rebuilt after the first exact-commit review. The
  corrected contract reconciles 70 issues and 158 component/application work
  rows, persists a terminal proposal-or-hold disposition for every row, binds
  raw eBay part-number evidence, shares diagnostic selection with the browser,
  and prevents blocked completion artifacts from being escalated at apply
  time. The audit is complete but remains release-blocked by five unsafe live
  commerce claims and one unresolved authoritative engine context. No
  production write or deployment is authorized.
- 2026-08-13: The second exact-commit review found seven omitted conditional,
  passive, or anaphoric repair branches plus public-renderer and artifact-chain
  gaps. The parser now covers all seven as proposal-or-hold rows; the Vision,
  KnownIssueCard, and VehicleDashboard paths use the same fail-closed variant
  and diagnostic contracts; 04/05/06 are structurally bound; diagnostic holds
  are generic zero-or-many; and reviewed runtime context must cover every
  selectable YMMT cell with hash-pinned evidence. The independently reviewed
  outcome remains 4 approvals, 41 held/blocked candidate rows, 5 blocked
  existing claims, 2 guarded manifest rows, and zero production authority.
- 2026-08-13: The third review expanded passive, modal, coordinated, and
  conditional repair extraction and rebuilt Acura from the frozen source. The
  packet now reconciles 70 issues and 203 component/application work rows,
  with 54 candidate rows independently reviewed: 6 approved and 48 blocked or
  held. Two exact product links are selected for guarded changes, while five
  unsafe existing claims and the unresolved Integra B17A1 selected-engine
  context keep the make release-blocked. Final artifacts are deterministic and
  retain zero production authority; no database write or deployment occurred.
- 2026-08-13: The fourth review found semantic gaps hidden by the formerly
  exact 203-row set and an incomplete implementation-hash boundary. Acura was
  rebuilt to 229 terminal component/application rows; all 26 recovered rows
  terminate conservatively without expanding the 34-proposal/54-candidate
  commerce set. The completion contract now binds its release/apply/finalize
  gates, exact YMMT evidence, and transitive URL/affiliate/vendor guards. The
  same six release blockers remain and production authority remains false.
- 2026-08-13: The fifth exact-commit review found additional explicit Acura
  repair branches outside the mechanically closed 229-row set, broad negation
  and dealer suppression, approved-alternate/affiliate validation gaps, and
  direct release dependencies outside the completion hash surface. Extraction
  and worklist rules now cover every reported counterexample; 02/03 identity is
  structurally bound; every approved link is exact and affiliate-attributed;
  and the completion contract includes the audit/schema/supplier/resolver/tier
  dependencies. Acura is being deterministically rebuilt from the same frozen
  source with no production authority or deployment.

## Verification

**Commands:**
- `node --test` on prescription, fitment, proposal, link, manifest, and renderer contracts — all focused tests pass.
- `npx eslint <affected files>` and `npx tsc --noEmit --incremental false` — zero introduced diagnostics.
- Per-make dry-run/apply/verify commands — exact counts, hashes, idempotence, and zero unrelated field drift.
- Production browser checks for matching, wrong, and incomplete vehicle selections plus every outbound destination — only supported direct links render.
