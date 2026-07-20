---
title: 'Known Issues catalog-wide repair deep-link correction'
type: 'bugfix'
created: '2026-07-14'
status: 'in-progress'
baseline_commit: '2919af88801aa1ad37733350e67d5766c8868d60'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="User delegated the BMad approval checkpoint on 2026-07-14; this intent remains human-owned and may not be broadened silently.">

## Intent

**Problem:** Published Known Issues sometimes claim that a product is the repair while linking to a search page, an incomplete or wrong-fitment part, or an unrelated product. Those clicks convert below 1% and, more importantly, can send an owner toward the wrong repair.

**Approach:** Audit every published Known Issue as a complete record, with traffic and click data determining order only. Verify vehicle scope, category, severity, confidence, description, symptoms, DTCs, citations, repair guidance, every required part/quantity/position, every commerce or community link, and public update metadata together. Keep only live product-detail links whose repair role, part identity, completeness, and fitment align; otherwise correct, remove, or explicitly hold commerce, then apply reviewed full-record manifests through a drift-safe pipeline.

## Boundaries & Constraints

**Always:** Treat the complete published record—not clicks or prior model output—as the claim to verify. Cover every published issue, including records with no current commerce, while prioritizing high-traffic pages and clicked gaps. Verify make/model/year/trim/engine scope, title/category/severity/confidence, description, symptoms, affected systems, DTCs, citations, solution, costs/mileage claims, every needed part with quantity and position, `fixParts`, `communityRecommendations`, reporting/source/status fields, related-issue references, and correction metadata. Research with the Ultra subscription and current web evidence, never an LLM API. Prefer an exact Amazon product page, then eBay, then an exact manufacturer/direct-retailer page. Preserve valid tips/warnings. Classify every in-scope record as keep, replace, remove, recall/dealer, diagnosis-dependent hold, or no-commerce. Add the quiet public correction notice only for meaningful published guidance changes. Verify the database after-state and the complete rendered production card before marking an issue complete.

**Ask First:** Any new database schema, materially broader prose rewrite, commerce added directly to generic DTC reference content, inclusion of pending/archived rows, or production deployment not already covered by the approved correction workflow.

**Never:** Use search/category pages as buy links; guess a URL, part number, or fitment; keep a bad link because it received clicks; monetize a recall/software-only remedy; force a link where diagnosis or build data is insufficient; overwrite hash drift; alter unrelated user work; or use OpenAI/Anthropic APIs.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Exact repair | Repair, PN, fitment, and live product page agree | Retain/add normalized product link with evidence | Reject if any dimension is unproven |
| Conditional repair | Multiple causes, engines, generations, sides, or incomplete kit | Split verified variants or remove/hold commerce | Never collapse variants into one guessed CTA |
| Recall/software | Dealer remedy, recall, calibration, or no owner-buyable part | Recall/dealer guidance; no retail link | Flag contradictory commerce |
| Link drift | Dead, redirected-to-search, unavailable, or materially changed listing | Replace only with newly verified exact page, else hold | Record disposition and evidence date |
| Data drift | Current row differs from manifest before-hash | No mutation | Abort the whole batch and regenerate review |

</frozen-after-approval>

## Code Map

- `prisma/schema.prisma` -- authoritative KnownIssue, DTC, and click fields.
- `src/schemas/knownIssue.schema.ts` -- runtime repair-part/link contract.
- `src/components/known-issues/KnownIssueCard.tsx` -- public commerce, tracking, recall, and correction-notice renderer.
- `src/lib/known-issues.ts` -- canonical published KnownIssue mapper/query path.
- `src/lib/dtc-codes.ts` and `src/app/known-issues/dtc/**` -- DTC-to-issue linkage and canonical issue anchors.
- `src/app/api/known-issues/route.ts` -- vehicle/API KnownIssue mapper that must not omit corrected commerce fields.
- `scripts/_apply-ultra-deeplink-sample.js` -- proven dry-run/hash/transaction/idempotence reference only.
- `data/_ultra-deeplink-sample-decisions.json` -- approved evidence-manifest reference only.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/audit-known-issue-catalog-deeplinks.js` -- export an immutable schema-v2 full-record inventory, traffic/click-priority cohorts, and zero-unclassified reconciliation that counts only complete schema-v2 audits while reporting legacy link-only manifests separately.
- [ ] `data/known-issues-catalog-deeplink-decisions/*.json` -- store bounded reviewed manifests with before hashes, dispositions, evidence, and exact after-state.
- [x] `scripts/apply-known-issue-catalog-deeplinks.js` -- preserve legacy schema-v1 support and add schema-v2 full-record validation, drift guards, transactional apply, durable results, and verification of every public KnownIssue field.
- [x] `scripts/apply-known-issue-catalog-deeplinks.test.js` -- cover URL grammar, variants, holds, recalls, full-record drift, approval/publication requirements, mixed state, and idempotence.
- [x] `scripts/showmetheparts-known-issue-candidates.js` -- use the user-authorized parts catalog as candidate/fitment evidence without treating catalog output as a verified repair or final retailer link.
- [x] `src/lib/known-issues.ts`, `src/lib/dtc-codes.ts`, `src/app/api/known-issues/route.ts` -- align full KnownIssue mapping where surface review proves a corrected field is hidden; retain slim DTC listing DTOs.
- [x] `src/components/known-issues/KnownIssueCard.tsx`, `src/app/known-issues/[slug]/page.tsx`, and every other Known Issue renderer -- expose shopping links only from verified `fixParts[*].buyLinks` in one canonical "What you need to fix it" section; render owner guidance as text-only and remove generic affiliate-tool rails from Known Issue pages.
- [x] `src/components/known-issues/KnownIssueCard.tsx` -- simplify the visual hierarchy to the existing sand/ink theme; remove red, purple, yellow, and green card/panel treatments and communicate severity, safety, repair status, and update recency with explicit labels, icons, borders, and typography.
- [ ] `docs/known-issues-catalog-deeplinks-2026-07-15.md` -- record inventory, per-disposition before/after counts, clicked-gap coverage, evidence policy, unresolved queue, elapsed time, and verification.

**Acceptance Criteria:**
- Given the fresh published catalog snapshot, when reconciled, then every published issue has exactly one schema-v2 `full-record` audit disposition; every commerce claim is covered by that same audit; legacy link-only manifests are reported separately and do not count as completion.
- Given an issue marked complete, then its full before-state and full after-state include every public KnownIssue field; `humanApproved` is true, `status` is published, meaningful corrections have accurate update metadata, and no unchecked field can drift through the apply gate.
- Given an issue with accurate links but inaccurate scope, claims, symptoms, DTCs, citations, repair instructions, quantities, position, costs, source/report counts, or metadata, then the issue fails the audit and is not counted complete.
- Given the fresh published catalog snapshot, when reconciled, then every commerce claim has exactly one recorded disposition and zero in-scope claims are unclassified.
- Given a surviving buy link, when validated and manually evidenced, then it is a live product page matching the stated repair and applicable vehicle; no search URL remains.
- Given a recall, software-only, conditional-diagnosis, incomplete-kit, or ambiguous-fitment repair, then the UI does not imply an unverified product is “what you need.”
- Given an issue reached from a DTC page, then its anchor resolves to the same corrected canonical Known Issue; generic DTC definitions remain non-commerce.
- Given a changed record, then its correction date/summary is accurate and non-intrusive; untouched records receive no false update notice.
- Given any Known Issue surface, when commerce is rendered, then every shopping link originates from that issue's verified `fixParts[*].buyLinks` and appears only in the canonical repair-parts section; community recommendations remain non-clickable guidance, and generic oil/filter/tool searches are never synthesized as repairs.
- Given an expanded Known Issue card, when a user scans its sections, then the existing sand/ink system carries all ordinary and stateful content without red/purple/yellow/green panels; a recent correction is identifiable from explicit "New update" or "Updated" text plus its date and summary, without relying on color.
- Given baseline drift or a partial batch, then apply fails closed; given an already-applied manifest, rerun makes zero writes.
- Given a database-verified cohort, when its production cache is purged, then the live API and rendered HTML must match the complete approved after-state before the cohort is reported as deployed.

## Spec Change Log

- 2026-07-20: Completed and production-verified all 28 Lincoln Aviator schema-v2 records in six guarded batches: 12 diagnosis holds, 10 recall/dealer paths, five archived records, and one evidence-only no-commerce record. All nine original commerce claims and 27 search-link occurrences are covered and removed; reconciliation is zero-unclassified with no drift. The live API and hydrated page match the approved after-state, and shared empty cost/date/parts boilerplate discovered during the browser gate was fixed before final release. Toyota Camry is next.
- 2026-07-20: Completed and production-verified all 13 BMW X5 schema-v2 records. The release also hardened all-manifest verification so runtime recommendation click telemetry does not create content drift and fully covered legacy link-only batches are superseded without allowing partial overlap. Lincoln Aviator is the next traffic-ranked model.
- 2026-07-17: User clarified that passing over an issue means a complete issue audit, not a link audit. Traffic/clicks determine order only. Completion now requires schema-v2 full-record evidence, all public fields guarded/applied/verified together, and a live production after-state check. Existing schema-v1/link-only batches remain historical evidence but do not count toward full-record coverage.
- 2026-07-15: User authorized ShowMeTheParts as a non-LLM candidate and fitment source. Ultra/web review remains the repair-accuracy and final product-link gate; bulk Hub seeding remains out of this bugfix pending licensing and schema approval.
- 2026-07-15: User changed execution priority from a clicks-only queue to traffic-ranked make batches. Rank each make by its highest-traffic Known Issues page, then review that make's models in page-traffic order so engine, fitment, supersession, and retailer evidence can be reused. This changes work order only; all 10,850 baseline commerce claims remain in scope.
- 2026-07-15: User required one canonical commerce location across all Known Issue pages after the BMW X5 valve-stem-seal card exposed both repair-part links and generic oil/filter "Upgrade" searches. Only verified `fixParts.buyLinks` may be clickable commerce; owner tips remain text-only.
- 2026-07-15: User requested a professional sand/ink Known Issue card palette. Remove red, purple, yellow, and green card treatments; make state and recency understandable without color, using explicit copy, icons, borders, and hierarchy.

## Design Notes

Page traffic and clicked/zero-conversion links determine order, not truth or completion. Work in small independently verifiable make/model cohorts so fitment research can be reused without allowing one disputed application to invalidate the catalog. An issue passes only as a complete record. A valid final state may intentionally contain no buy link when the remedy is a recall, dealer action, software update, diagnosis-dependent repair, unavailable part, or otherwise non-buyable.

## Verification

**Commands:**
- `node --test scripts/apply-known-issue-catalog-deeplinks.test.js` -- all safety and edge-case tests pass.
- `node scripts/apply-known-issue-catalog-deeplinks.js --dry-run --all` -- exact counts, zero drift, zero unclassified, zero invalid/search links.
- `node scripts/apply-known-issue-catalog-deeplinks.js --verify --all` -- database and result artifacts match approved after-hashes.
- `npm run build` -- Known Issue and DTC routes compile/render successfully.

**Manual checks (if no CLI):**
- Inspect representative exact-link, removed-link, recall, ambiguous-fitment, corrected-date, and DTC-anchor cases on the deployed preview.

**Reviewed UI-guard slice (commit `f963ea0`):**
- `tsx --test scripts/known-issue-commerce.test.ts` -- 6/6 pass.
- Targeted ESLint across all changed files -- zero warnings or errors.
- `npm run build` with the project environment -- 1,531/1,531 pages generated.
- Read-only production impact audit -- 12,975 raw links reduce to 1,029 verified product links across 143 issues; zero product-shaped links lacked verification metadata.
- Production deployment `dpl_4mvhfkk5daKu21ejoYTXdN3L1c9A` serves build `f963ea0` on `main`; CDN and data caches purged.
- Live high-traffic smoke test -- Jeep Grand Cherokee, Audi A6, BMW X5, and Lincoln Aviator return 200 with zero Amazon searches, duplicate upgrade CTAs, or generic tool rails.

The catalog-wide research and correction queue remains in progress; this reviewed slice fails closed while that work continues.

**Schema-v2 Audi A6 cohort 1 (2026-07-17):**

- 8 of 23 Audi A6 records completed as full-record audits and applied to production: gateway recall, headlight-switch recalls, tie-rod recalls, 3.0T timing-chain TSB, PCV campaign 17F9, 2.7T ignition-coil diagnosis, 48V starter-generator recall, and the unsupported supercharger nose-cone claim.
- 3 exact retailer product links survive: both position-specific 3.0T upper tensioners and the APB engine ignition coil. Recall, software, diagnosis-dependent, and unverified BEL fitment paths intentionally expose no retail link.
- The production API and rendered Audi A6 page expose the corrected records, part numbers, links, and update metadata. Deployment `dpl_5QvajMeLEvVe8rMqePNEe1ZwqRXP` is aliased to `au7o.io`; CDN and data caches were purged.
- The remaining 15 Audi A6 records were applied to production in 10 guarded batches and verified in exact after-state. Together with cohort 1, all 23 Audi A6 records now have an evidence-backed production disposition.
- The complete Audi A6 set contains eight exact product pages and zero Amazon, eBay, or RockAuto search links. Recall, software, diagnosis-dependent, ambiguous-fitment, and condition-dependent repairs intentionally expose no retail link.
- Vercel data and CDN caches were purged. The live API matched all 23 approved records field-for-field across representative model years, and the rendered Audi A6 page returned 200 with all 23 issue anchors and all eight product URLs present. Existing production deployment `dpl_5QvajMeLEvVe8rMqePNEe1ZwqRXP` remains Ready and aliased to `au7o.io`; no source-code redeploy was required for this data-only release.
- Audi A6 is research- and production-complete. Catalog-wide completion remains open for the other makes and models.

**Schema-v2 BMW X5 completion (2026-07-20):**

- All 13 BMW X5 records were completed as full-record audits in three guarded batches: eight diagnosis-qualified replacements, four diagnosis holds, and one recall/dealer path.
- Twelve exact product-detail pages remain. Three dead or mismatched eBay items were removed, and the scarce G05 DTF-1 eBay listing was replaced with a stable exact dealer page. Recall and diagnosis-hold records expose no commerce.
- Every BMW batch began in its frozen before-state, applied transactionally, and independently verified in exact after-state. Complete historical verification reports 52 manifests, 45 active after-state batches, seven fully superseded legacy batches, and 120 unique guarded issues.
- Runtime `communityRecommendations.clickCount` is treated as mutable analytics rather than reviewed prose; any recommendation content change still fails closed. Legacy batches are skipped only when every issue is covered by a schema-v2 full-record manifest; partial overlap is rejected.
- The applicator suite passes 25/25 and both local and Vercel builds generate 1,531/1,531 static pages. Deployment `dpl_32wQKStXEqk6DFVH7Vf6nDEby1ev` is Ready and aliased to `au7o.io`; CDN and data caches were purged. The live API and rendered X5 page expose all 13 audited records and 12 approved links with none of the four removed/replaced item IDs. BMW X5 is production-complete; Lincoln Aviator is next.

**Schema-v2 Lincoln Aviator production completion (2026-07-20):**

- All 28 records were completed as full-record audits in six guarded batches. Reconciliation covers 28/28 records and 9/9 original commerce claims with zero missing, unknown, duplicate, or drifted entries.
- Dispositions are 12 diagnosis holds, 10 recall/dealer paths, five removals/archives, and one evidence-only no-commerce record. All 27 search-result commerce links were removed; no retail link survived because every former commerce path was recall-, software-, VIN/build-, diagnosis-, duplicate-, or evidence-constrained.
- Current Ford/Lincoln/NHTSA documents replaced broad secondary claims, including 2026 wiper and IPMA recalls, the 2025 corrective camera campaign, exact PHEV and battery-harness scopes, and multiple SSM/TSB build/symptom/DTC boundaries. Unsafe duplicate recall, air-suspension, roof-leak, battery-cable, and ADAS component-shopping cards were archived.
- The applicator suite passes 25/25. All-manifest verification reports 58 loaded manifests, 51 active exact-after batches, seven safely superseded legacy batches, and 148 unique guarded issue rows.
- A clean tracked-state `npm run build` passes TypeScript and generates 1,531/1,531 static pages. An unrelated untracked Mopar scraping script in the main workspace imports missing `puppeteer`; it was preserved, and the release build was verified in an isolated tracked worktree instead.
- The first production browser gate found shared empty-data presentation defects outside the record payload: blank cost range text, `Invalid Date`, and parts/affiliate/owner-count boilerplate on no-commerce records. Commit `8cbc498` conditionally suppresses those claims and passes targeted ESLint plus a clean tracked-state 1,531-page build.
- Final deployment `dpl_FT1dUgCh49tFSxYfGPyxcpvaxobp` is Ready and aliased to `au7o.io`; CDN and data caches were purged. The 2020-2026 API union exposes exactly 23 published audited records, omits all five archived records, and contains zero commerce/cost/mileage fields. The hydrated page contains all 23 audited permalinks and update notes, none of the five archived IDs or 26 unique removed URLs (27 original link occurrences), and none of the empty-data defects. Lincoln Aviator is production-complete; Toyota Camry is next.

**Schema-v2 Jeep Grand Cherokee cohort 1 (historical pre-release review, 2026-07-18):**

- The two clicked records were completed as guarded full-record audits: the 2019 wheel-speed/ABS diagnosis and the 2008 4WD 4.7L front-axle diagnosis.
- All 9 commerce claims and 23 search/category links were removed. Both records are diagnosis holds with zero commerce because ShowMeTheParts exposed engine/equipment, side, limited-slip, and axle-family variants that invalidate the old universal mappings.
- The generated two-record manifest validates with zero errors. Applicator tests pass 21/21 and ShowMeTheParts tests pass 3/3.
- This was the local state at the time of review. The later 2026-07-18 release applied and verified all 34 Jeep Grand Cherokee records; the local-only note is retained only as historical sequencing evidence.

## Suggested Review Order

**Commerce safety gate**

- Start with the single public commerce model and verification requirements.
  [`known-issue-commerce.ts:140`](../../.worktrees/known-issue-commerce-guard/src/lib/known-issue-commerce.ts#L140)

- Review marketplace, encoded-search, private-host, and retailer URL rejection.
  [`known-issue-commerce.ts:48`](../../.worktrees/known-issue-commerce-guard/src/lib/known-issue-commerce.ts#L48)

- Confirm Amazon/eBay attribution is applied only after validation.
  [`known-issue-commerce.ts:31`](../../.worktrees/known-issue-commerce-guard/src/lib/known-issue-commerce.ts#L31)

**Public rendering**

- Verify the one canonical repair-parts section and text-only owner guidance.
  [`KnownIssueCard.tsx:503`](../../.worktrees/known-issue-commerce-guard/src/components/known-issues/KnownIssueCard.tsx#L503)

- Check explicit update recency without semantic status colors.
  [`KnownIssueCard.tsx:395`](../../.worktrees/known-issue-commerce-guard/src/components/known-issues/KnownIssueCard.tsx#L395)

- Confirm the vehicle dashboard follows the same commerce contract.
  [`VehicleDashboard.tsx:567`](../../.worktrees/known-issue-commerce-guard/src/components/vehicle/VehicleDashboard.tsx#L567)

- Review neutral severity treatment on localized Known Issue cards.
  [`page.tsx:28`](../../.worktrees/known-issue-commerce-guard/src/app/[locale]/known-issues/[slug]/page.tsx#L28)

**Regression coverage**

- Inspect audited metadata, vendor consistency, and deduplication coverage.
  [`known-issue-commerce.test.ts:110`](../../.worktrees/known-issue-commerce-guard/scripts/known-issue-commerce.test.ts#L110)

- Verify recall-first issues cannot expose any retail links.
  [`known-issue-commerce.test.ts:137`](../../.worktrees/known-issue-commerce-guard/scripts/known-issue-commerce.test.ts#L137)

- Confirm competing Amazon attribution is replaced only on product pages.
  [`known-issue-commerce.test.ts:160`](../../.worktrees/known-issue-commerce-guard/scripts/known-issue-commerce.test.ts#L160)

## Jeep Cohort 1 Review Order

**Evidence-backed decisions**

- Start with the 2019 ABS diagnosis hold and its removed universal sensor claims.
  [`jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json:10`](../../data/known-issues-catalog-deeplink-patches/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json#L10)

- Review the 2008 4WD 4.7L front-axle scope and variant-safe hold.
  [`jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json:93`](../../data/known-issues-catalog-deeplink-patches/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json#L93)

**Drift protection**

- Confirm every original claim and public field is guarded before either after-state.
  [`jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json:27`](../../data/known-issues-catalog-deeplink-decisions/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json#L27)

- Verify both reviewed records finish with no repair parts or commerce URLs.
  [`jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json:121`](../../data/known-issues-catalog-deeplink-decisions/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json#L121)

**Catalog evidence and follow-up**

- Compare limited-slip and non-limited-slip CV candidates that invalidate one universal link.
  [`jeep-grand-cherokee-2008-cv-axles-showmetheparts-2026-07-17.json:47`](../../data/known-issues-catalog-evidence/jeep-grand-cherokee-2008-cv-axles-showmetheparts-2026-07-17.json#L47)

- Review the deferred exact-model, engine, and drivetrain matching gap before Hub exposure.
  [`deferred-work.md:7`](./deferred-work.md#L7)
