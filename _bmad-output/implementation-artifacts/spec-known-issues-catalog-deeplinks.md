---
title: 'Known Issues catalog-wide repair deep-link correction'
type: 'bugfix'
created: '2026-07-14'
status: 'in-progress'
baseline_commit: '2919af88801aa1ad37733350e67d5766c8868d60'
baseline_revision: 'b5f8604c88392e2c39db200c20ea6f24cd362028'
review_loop_iteration: 0
followup_review_recommended: false
context: []
---

<frozen-after-approval reason="User delegated the BMad approval checkpoint on 2026-07-14; this intent remains human-owned and may not be broadened silently.">

## Intent

**Problem:** Published Known Issues sometimes claim that a product is the repair while linking to a search page, an incomplete or wrong-fitment part, or an unrelated product. Those clicks convert below 1% and, more importantly, can send an owner toward the wrong repair.

**Approach:** Audit every published Known Issue as a complete record, with traffic and click data determining order only. Verify vehicle scope, category, severity, confidence, description, symptoms, DTCs, citations, repair guidance, every required part/quantity/position, every commerce or community link, and public update metadata together. Keep only live product-detail links whose repair role, part identity, completeness, and fitment align; otherwise correct, remove, or explicitly hold commerce, then apply reviewed full-record manifests through a drift-safe pipeline.

## Boundaries & Constraints

**Always:** Treat the complete published record—not clicks or prior model output—as the claim to verify. Cover every published issue, including records with no current commerce, while prioritizing high-traffic pages and clicked gaps. Verify make/model/year/trim/engine scope, title/category/severity/confidence, description, symptoms, affected systems, DTCs, citations, solution, costs/mileage claims, every needed part with quantity and position, `fixParts`, `communityRecommendations`, reporting/source/status fields, related-issue references, and correction metadata. Research with the Ultra subscription and current web evidence, never an LLM API. Prefer an exact Amazon product page, then eBay, then an exact manufacturer/direct-retailer page. Preserve valid tips/warnings. Classify every in-scope record as keep, replace, remove, recall/dealer, diagnosis-dependent hold, or no-commerce. Add the quiet public correction notice only for meaningful published guidance changes. Starting with Toyota RAV4, verify each completed model's rendered SEO title, meta description, canonical, Open Graph/Twitter labels, and H1 alignment as part of the production gate. Verify the database after-state and the complete rendered production card before marking an issue complete.

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
- Given a model audit completed at or after Toyota RAV4, then its production page has a unique concise title, non-empty model-specific description, exact canonical URL, matching Open Graph/Twitter labels, and one H1 derived from the same title.
- Given a changed record, then its correction date/summary is accurate and non-intrusive; untouched records receive no false update notice.
- Given any Known Issue surface, when commerce is rendered, then every shopping link originates from that issue's verified `fixParts[*].buyLinks` and appears only in the canonical repair-parts section; community recommendations remain non-clickable guidance, and generic oil/filter/tool searches are never synthesized as repairs.
- Given an expanded Known Issue card, when a user scans its sections, then the existing sand/ink system carries all ordinary and stateful content without red/purple/yellow/green panels; a recent correction is identifiable from explicit "New update" or "Updated" text plus its date and summary, without relying on color.
- Given baseline drift or a partial batch, then apply fails closed; given an already-applied manifest, rerun makes zero writes.
- Given a database-verified cohort, when its production cache is purged, then the live API and rendered HTML must match the complete approved after-state before the cohort is reported as deployed.

## Spec Change Log

- 2026-07-28: Production-verified the accelerated Audi RS e-tron GT, RS Q8 and SQ8 cohort on exact audit commit `b5f8604c88392e2c39db200c20ea6f24cd362028` and Ready Production deployment `dpl_5GWhFEup9EEBZgbXaYEnEso3UBHD`. Both the clean local build and Vercel build passed TypeScript and generated 1,531/1,531 static pages; Vercel reports target `production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases. The isolated local release tree's stale database environment initially returned `ECONNREFUSED`; injecting the current workspace environment only into the unchanged exact-commit build completed cleanly. After explicit CDN and data-cache purges, cache-busted HTML returned 200 for all three routes and rendered all 11 approved titles/anchors while omitting all four archived titles/anchors, all 45 removed URL occurrences, retail markers, commerce rails and `Open Hub`. Exact HTML/H1/Open Graph/Twitter labels are `2022-2024 Audi RS e-tron GT Problems: 4 Known Issues`, `2020-2025 Audi RS Q8 Problems: 3 Known Issues` and `2020-2026 Audi SQ8 Problems: 4 Known Issues`; exact descriptions, `All N Known Issues`, canonical and indexability pass for each route. Every page preserves six `/get-started` source occurrences, both exact DataRep assets and all three warm-paper colors. A 22-response default-published API matrix matches every exposed field of all 11 manifest after-states, returns zero rows outside reviewed years, and shows no archived or cross-model contamination. These three models are Production-complete, making 23 of 44 Audi model groups complete and leaving 21.
- 2026-07-28: Completed the accelerated Audi Q7/Q8 database cohort. Twenty-one frozen records were handled through separate immutable packets, configs, manifests and receipts but one shared research/release pipeline: Q7 retains four exact primary-source paths and archives five unsupported/duplicate aggregations; Q8 retains seven exact Audi/NHTSA paths and archives five unsupported/duplicate aggregations. All 44 commerce claims and 76 URL occurrences are removed, and no record was inserted. Exact-before dry-runs, one guarded two-manifest transaction, exact-after verification, no-op dry-run and idempotent reapply pass. Six commerce, 25 applicator/coverage and three candidate tests pass (34/34); full history verifies 120 manifests, 113 active batches, seven superseded legacy batches and 496 guarded rows. Only the exact `audi-q7` and `audi-q8` slugs join the existing concise-title allowlist; global SEO and the warm-paper/Get Started/DataRep design are unchanged. Twenty-five of 44 Audi model groups are database-audit complete; both new models await one combined exact-commit build, Production deployment, cache purge and live HTML/API gate.
- 2026-07-28: Production-verified Audi Q7 and Q8 on exact audit commit `0971573b479094c47b0db5453f57346b58c0a5c8` and Ready Production deployment `dpl_49hcNc8TZ8nFiWQmgpWHgteNBgkZ`. Both isolated local and Vercel builds passed TypeScript and generated 1,531/1,531 pages. The deployment owns all exact Production aliases, and both CDN and data caches were purged. Cache-busted HTML renders all 11 approved records, omits all 10 archived records and 76 old URL occurrences, and passes exact title/description/canonical/indexability checks. Both pages retain six `/get-started` source occurrences, zero `Open Hub`, both DataRep badges and all three warm-paper colors. Twenty cache-busted year-filtered API responses match every exposed manifest field with exact model boundaries and no archived or cross-model leakage. Q7 and Q8 are Production-complete, making 25 of 44 Audi model groups complete and leaving 19.
- 2026-07-28: Completed the second accelerated multi-model database cohort across Audi RS e-tron GT, RS Q8 and SQ8. Fifteen frozen records were researched and applied through three independently guarded schema-v2 manifests while sharing one release gate: 11 exact Audi/NHTSA-supported records remain published and four unsupported or overlapping aggregations are archived. RS e-tron GT retains VIN-first battery and brake-hose recalls plus exact 91VT charging and post-91DZ Audi connect software paths while its unsupported tire-wear row is archived. RS Q8 retains exact J775/J1135 air-suspension, G407 coolant-warning and warm front steel-brake-squeal diagnoses while two duplicate suspension rows are archived. SQ8 retains exact J775/J1135, G407, side-airbag-recall and rearview-camera-recall paths while its duplicate suspension row is archived. All 31 commerce claims and 45 URL occurrences are removed, including the cohort's one clicked/priority claim. Eight separately sourced findings remain controlled proposals with `insert: false`; no record was inserted. Exact-before, guarded apply, exact-after, after-state no-op and idempotent reapply pass for every model. Six commerce tests, 25 applicator/coverage tests and three candidate tests pass (34/34), route ESLint passes, and complete history verification passes across 118 manifests, 111 active batches, seven superseded legacy batches and 475 guarded issue rows. These three slugs alone are enrolled in the existing concise audited-title path and now share one local-build/SEO/Production gate. Twenty of 44 Audi models remain Production-complete; 23 are database-audit complete, leaving 21 database audits and 24 Production gates.
- 2026-07-28: Production-verified the accelerated Audi RS4, RS6 and A5 Sportback cohort on exact audit commit `f6aeacdfb6c864668e5eef53827bc9486bf63aa1` and Ready Production deployment `dpl_H4Db2ryzGmB5wGKp4SDEFjCmpn3M`. Both local and Vercel builds passed TypeScript and generated 1,531/1,531 static pages; Vercel reports target `production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases. After explicit CDN and data-cache purges, cache-busted HTML returned 200 for all three routes and rendered all seven approved titles/anchors while omitting all three archived titles/anchors, all 30 removed URL occurrences, retail markers, commerce rails and `Open Hub`. Exact HTML/H1/Open Graph/Twitter labels are `2007-2023 Audi RS4 Problems: 2 Known Issues`, `2021-2024 Audi RS6 Problems: 2 Known Issues` and `2017-2024 Audi A5 Sportback Problems: 3 Known Issues`; standard/Open Graph/Twitter descriptions, `All N Known Issues`, canonical and indexability pass for each route. Every page preserves six `/get-started` source occurrences, both exact DataRep assets and all three warm-paper colors. A 35-response default-published API matrix matches every exposed field of all seven manifest after-states, returns zero rows outside their reviewed years, and shows no archived or cross-model contamination. These three models are production-complete, making 20 of 44 Audi model groups complete and leaving 24.
- 2026-07-28: Completed the first accelerated multi-model database cohort across Audi RS4, RS6 and A5 Sportback. Ten frozen records were researched and applied through three independently guarded schema-v2 manifests while sharing one release gate: seven exact Audi/NHTSA-supported records remain published and three unsupported or overlapping aggregations are archived. RS4 now contains two deposit-diagnosis records; RS6 contains current deposit and air-suspension-control diagnoses while its duplicate carbon and unsupported mount cards are archived; A5 Sportback contains exact side-sill water, informational trunk-strut-noise and coolant-pump-leak guidance while its separate thermostat-housing aggregation is archived. All 20 commerce claims and 30 URL occurrences are removed, including the cohort's one clicked/priority claim. Seven separately sourced findings remain controlled proposals with `insert: false`; no new record was inserted. Exact-before, guarded apply, exact-after, after-state no-op and idempotent reapply pass for every model. Complete history verification passes across 115 manifests, 108 active batches, seven superseded legacy batches and 460 guarded issue rows. These three models are database-audit complete and now share one SEO/build/Production gate; Audi has 24 database audits and 27 Production gates remaining.
- 2026-07-28: Production-verified the completed Audi A6 allroad audit on exact closing commit `d2298af6819d23bc36088affb0e2c24a9855e494` and Ready Production deployment `dpl_CgwJ7vr7be5THDFSEeRu5XrsTyWw`. Vercel reports target `production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases; both local and cloud builds passed TypeScript and generated 1,531/1,531 static pages. The first live gate correctly withheld closure when audit commit `cad5805ff48680cfdd21203f6eb38d15738c14e9` still rendered the legacy 68-character pre-suffix title; the scoped follow-up enrolled only `audi-a6-allroad` in the concise audited-title path. After fresh CDN and data-cache purges, cache-busted HTML returns 200, renders both approved cards/anchors and omits all 19 removed URL occurrences, retail markers, commerce rails and `Open Hub`. H1/OG/Twitter/TechArticle use the exact 50-character label `2020-2024 Audi A6 allroad Problems: 2 Known Issues`; the HTML title adds `| Au7o`. Exact standard/OG/Twitter description, zero-critical FAQ/visible summary, `All 2 Known Issues`, canonical and indexability pass. Six `/get-started` occurrences, both exact DataRep assets and all three warm-paper colors remain. Every default-published API year from 2019 through 2025 matches the manifest field-for-field: both records for 2020-2024 and no rows for 2019 or 2025, with no cross-model contamination. Audi A6 allroad is production-complete at 2/2, making 17 of 44 Audi model groups complete and leaving 27.
- 2026-07-28: Completed the database audit for both frozen Audi A6 allroad records in one guarded schema-v2 transaction using the reusable full-record builder and compact model configuration. Current Audi Service Action 27BQ replaces the generic 2020-2026 starter-alternator failure/shopping card with a VIN-first, no-cost 2020-2024 dealer action; current TSB 2067906/5 replaces the battery-degradation shopping card with the exact 5%-15% low-state-of-charge recharge decision and the explicit rule that P0B2900 alone is not a replacement basis. All 15 commerce claims and 19 URL occurrences are removed; no clicked claim, record or priority traffic was displaced. Eight separately sourced recall/diagnostic paths across nine exact primary-source URLs remain controlled proposals with `insert: false`; no record was inserted. The Blind pass caught and corrected campaign code `70i2` before publication, then exact verdicts `a6_allroad_blind_review:no-blocker` and `a6_allroad_edge_review:no-blocker` approved combined reviewed generator SHA-256 `ba73050eeb6fb41965e86267d7677ca5c4f3645c31f8dc491ab9c754cbe1ca43`. Six commerce tests, 25 applicator/coverage tests and three candidate tests pass (34/34); exact-before, one guarded apply, exact-after, after-state no-op, receipt refusal and complete history verification pass across 112 manifests, 105 active batches, seven superseded legacy batches and 450 guarded issue rows. Audi A6 allroad is database-audit complete at 2/2 and awaits its exact two-card Production gate; 27 Audi database audits and 28 full Production gates remain.
- 2026-07-28: Production-verified the completed Audi A4 allroad audit on exact audit commit `583ee25c3960194f8af23ad1d23aada86b002e7a` and Ready Production deployment `dpl_AzvaY9GLndkr4CdREWMjdza17pDr`. Vercel reports target `production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases; both local and cloud builds passed TypeScript and generated 1,531/1,531 static pages. After explicit CDN and data-cache purges, cache-busted HTML returns 200, renders only the approved 19N8 title/anchor and omits the archived differential-seal ID/title, all five removed URL occurrences, retail markers, commerce rails and `Open Hub`. Exact H1/HTML/OG/Twitter titles, singular standard/OG/Twitter description, TechArticle, one-critical FAQ/visible summary, `All 1 Known Issue`, canonical and indexability pass. Six `/get-started` occurrences, both exact DataRep assets and all three warm-paper colors remain. Every default-published API year from 2012 through 2025 matches the manifest field-for-field: only the 19N8 campaign record for 2013-2016 and no rows for 2012 or 2017-2025, with no archived or cross-model contamination. Audi A4 allroad is production-complete at 2/2, making 16 of 44 Audi model groups complete and leaving 28.
- 2026-07-28: Completed the database audit for both frozen Audi A4 allroad records in one guarded schema-v2 transaction. NHTSA recall 18V229 and current Audi Service Action 19N8 replace the generic water-pump shopping card with an exact VIN-first, no-commerce 2013-2016 A4 allroad EA888 Evo2 after-run coolant-pump campaign path; the unsupported 2013-2024 rear-differential-seal aggregation is archived because current exact Audi material supports a distinct 2017-2025 quattro Ultra vibration/binding diagnosis, not the seeded chronic seal, climate, mileage, fluid or repair claims. All three commerce claims and five URL occurrences are removed; no clicked claim, record or priority traffic was displaced. Thirteen separately sourced paths across 14 primary-source URLs remain controlled proposals with `insert: false`; no record was inserted. Exact Blind and Edge verdicts are `a4_allroad_blind_review:no-blocker` and `a4_allroad_edge_review:no-blocker` on combined reviewed generator SHA-256 `a049f01f0bc6340554e6800e7e318afd3584e07f72fea074560ecfeb1a41158c`. Six commerce tests, 25 applicator/coverage tests and three candidate tests pass (34/34); exact-before, one guarded apply, exact-after, after-state no-op, receipt refusal and complete history verification pass across 111 manifests, 104 active batches, seven superseded legacy batches and 448 guarded issue rows. Audi A4 allroad is database-audit complete at 2/2 and awaits its exact one-card Production gate; 28 Audi database audits and 29 full Production gates remain.
- 2026-07-28: Production-verified the completed Audi S5 audit on exact audit commit `e450d2e60e901a50a8b25e5628df9a290f23798f` and Ready Production deployment `dpl_4t4FQn4J8A9VqoY1gbLKocdorT4k`. Vercel reports target `production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases; both local and cloud builds passed TypeScript and generated 1,531/1,531 static pages. After explicit CDN and data-cache purges, cache-busted HTML returns 200, renders exactly the two approved S5 titles/anchors and omits all four archived IDs/titles, all 21 removed URL occurrences, retail markers, commerce rails and `Open Hub`. Exact H1/HTML/OG/Twitter titles, current plural standard/OG/Twitter description, TechArticle, zero-critical FAQ/visible summary, `All 2 Known Issues`, canonical and indexability pass. Six `/get-started` occurrences, both exact DataRep assets and all three warm-paper colors remain. Every default-published API year from 2008 through 2025 matches the manifest field-for-field: only the P052E00 diagnosis for 2010-2017, only the P000000/33688 diagnosis for 2018, and no rows in 2008-2009 or 2019-2025, with no archived or cross-model contamination. Audi S5 is production-complete at 6/6, making 15 of 44 Audi model groups complete and leaving 29.
- 2026-07-28: Completed the database audit for all six frozen Audi S5 records in one guarded schema-v2 transaction. Exact Audi/NHTSA primary sources retain two diagnosis-first records: 2018 S5/S5 Cabriolet/S5 Sportback 3.0L EA839 mechanical coolant-pump fault P000000/33688 under TSB 2058890/4, and the body/year-branched 2010-2017 3.0L crankcase-breather P052E00 paths under TSBs 2060033/3 and 2060259/1. Four unsupported cross-generation carbon, crankshaft-pulley, supercharger-intercooler-pump and thermostat/water-pump aggregations are archived. All 11 commerce claims and 21 URL occurrences are removed, including two claim clicks, two record clicks and two priority clicks. Fourteen exact recall/TSB paths remain controlled proposals with `insert: false`; no record was inserted. The reviewed generator SHA-256 `ec96a3c679f0adf329064e05099978c7e61150f36200cf2a36d1cae1d7d3b004` passed `s5_blind_review:no-blocker` and `s5_edge_review:no-blocker`. Six commerce tests, 25 applicator/coverage tests and three candidate tests pass (34/34); exact-before, one guarded apply, exact-after, after-state no-op and complete history verification pass across 110 manifests, 103 active batches, seven superseded legacy batches and 446 guarded issue rows. Audi S5 is database-audit complete at 6/6 and awaits an exact two-card Production gate; 29 Audi database audits and 30 full Production gates remain.
- 2026-07-27: Production-verified the completed Audi RS7 audit on exact audit commit `cca8b8d006f59dca6a52c59251c0fd50e5eb3bf3` and Ready Production deployment `dpl_3wYkPjdQGBPtXHTxLTRU2wXRN46n`. Vercel reports target `Production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases; its build passed TypeScript and generated 1,531/1,531 static pages. After explicit CDN and data-cache purges, cache-busted HTML returns 200, renders exactly the two approved titles/anchors and omits both archived IDs/titles, all 14 removed URL occurrences, commerce markers/rail and `Open Hub`. Exact H1/HTML/OG/Twitter titles, standard/OG/Twitter descriptions, TechArticle, FAQ, visible GEO summary, `All 2 Known Issues`, canonical and indexability pass. Six `/get-started` occurrences, both exact DataRep assets and all three warm-paper colors remain. Every default-published API year from 2013 through 2026 matches the manifest: only the recall for 2014-2017, only the air-suspension diagnosis for 2021-2025, and no rows in 2013, 2018-2020 or 2026, with no archived or cross-model contamination. Audi RS7 is production-complete at 4/4, making 14 of 44 Audi model groups complete and leaving 30.
- 2026-07-27: Completed the database audit for all four frozen Audi RS7 records in one guarded schema-v2 transaction. Current Audi/NHTSA primary sources narrow the air-suspension row to 2021-2025 TSB 2059363/6 and replace the seeded wastegate/carbon shopping aggregation with VIN-first, no-cost safety recall 21H7/22V178 for 2014-2017 RS7 vehicles. The unsupported carbon and turbo-coolant degradation aggregations are archived; distinct TSB 2060420/2 coolant-pump noise remains an `insert: false` proposal. All eight commerce claims and 14 URL occurrences are removed, including two claim clicks, two record clicks and two priority clicks. Twelve exact recall/TSB paths remain controlled proposals with `insert: false`. The rejected copied RS5 draft SHA-256 `91628ca47db687a060ce37aff821cb1f7a6e368284d36c4e8de047c2a88a0d86` was deleted before review or mutation; exact final generator SHA-256 `4890278f8a1951bda792830099fe4b1a47e6aa32a6b6556f2e734efbdb081333` passed `rs7_blind_review:no-blocker` and `rs7_edge_review:no-blocker`. Six commerce tests, 25 applicator/coverage tests and three candidate tests pass (34/34); exact-before, one guarded apply, exact-after, after-state no-op, receipt refusal and complete history verification pass across 109 manifests, 102 active batches, seven superseded legacy batches and 440 guarded issue rows. Audi RS7 is database-audit complete at 4/4 and awaits an exact two-card Production gate; 30 Audi database audits and 31 full Production gates remain.
- 2026-07-27: Production-verified the completed Audi RS5 audit and singular Known Issues metadata repair on exact commit `4c7eaae690b285cf58b65a42873a4b362e6e6833` and Ready Production deployment `dpl_6tM1YYhxmT2ujARAtJ4vijn7JDJc` with the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases. The Vercel build passed TypeScript and generated 1,531/1,531 static pages. After explicit CDN and data-cache purges, cache-busted HTML returns 200, renders exactly the approved RS5 card/anchor and omits both archived IDs/titles, all eight removed commerce-link occurrences, commerce rails and `Open Hub`. Exact HTML/H1/Open Graph/Twitter title, standard/Open Graph/Twitter description, TechArticle description, FAQ/visible singular labels, canonical and indexability pass; six `/get-started` occurrences, both exact DataRep assets and all three warm-paper colors remain. Default-published API responses are empty for 2020/2025 and match the one manifest after-state field-for-field for 2021-2024 with no archived or cross-model contamination. Audi RS5 is production-complete at 3/3, leaving 31 of 44 Audi model groups.
- 2026-07-26: Completed the database audit for all three frozen Audi RS5 records in one guarded schema-v2 transaction after current Audi/NHTSA/manufacturer-hosted primary-source research, a superseding-bulletin correction before generator publication, root release inspection and exact-hash Blind/Edge review. The current after-state publishes one diagnosis hold, `2021-2024 RS5 V6 Coolant-Pump Leak Diagnosis - TSB 2070349/4`, and archives both unsupported 2013-2015 4.2 FSI and B9 2.9 TFSI carbon-buildup aggregations. All six commerce claims and eight commerce-link URL occurrences are removed, including both claim clicks, both record clicks and both priority clicks. Ten distinct recall/TSB paths remain controlled proposals with `insert: false`; superseded PODS campaign 74D9 is deduplicated behind 74E3. The reviewed generator SHA-256 is `4225e012fbe6d9dc184f20c81cb6b43b196e20932c081f2cb0064b58d64f9b16`; exact Blind and Edge verdicts are `rs5_blind_review:no-blocker` and `rs5_edge_review:no-blocker`. The applicator/candidate suite passes 28/28 and the exact-model API regression passes 1/1; exact-before, one guarded apply, exact-after, after-state no-op, field-validated receipt refusal and complete historical verification all pass across 108 manifests, 101 active batches, seven superseded legacy batches and 436 guarded issue rows. Audi RS5 is database-audit complete at 3/3 and awaits an exact one-card Production render gate; 31 Audi database audits and 32 full Production gates remain.
- 2026-07-26: Production-verified the completed Audi e-tron GT audit and exact-model API boundary repair on exact commit `ba492cc855a5dbfcd6c31df275f49afe320e7a29` and Ready Production deployment `dpl_2k33mxy7Y21y4ySmG9Y7bApu3YJ6` with all production aliases. The Vercel build passed TypeScript and generated 1,531/1,531 static pages. After explicit CDN and data-cache purges, cache-busted HTML renders exactly five approved cards/anchors and omits the archived title/ID, all 15 removed commerce-link occurrences, commerce rails and `Open Hub`. Exact HTML/H1/OG/Twitter title, standard/OG/Twitter description, canonical and indexability pass; six `/get-started` occurrences, two DataRep badges and all three warm-paper colors remain. Default-published API responses now match the exact 2021-2025 manifest ID sets and fields with zero RS e-tron GT contamination. Audi e-tron GT is production-complete at 6/6, leaving 32 of 44 Audi model groups.
- 2026-07-26: Completed the database audit for the full frozen Audi e-tron GT model cohort: all six records were researched against current Audi/NHTSA-hosted primary sources, reviewed in exact-hash Blind and Edge passes, and applied once through the guarded schema-v2 pipeline. Five records remain published as three VIN-first recall/dealer paths and two diagnosis holds; the unsupported high-voltage coolant-seep aggregation is archived. All 13 commerce claims and 15 commerce-link URL occurrences are removed, including both claim clicks, both record clicks and both priority clicks. Eleven separately sourced recall/TSB paths remain controlled proposals with `insert: false`. The reviewed generator SHA-256 is `5457b72b9170d8886b69b5c502d0ffdb23f5177fc26689cf566d8b03f74ee836`; exact Blind and Edge verdicts are `etron_gt_blind_review:no-blocker` and `etron_gt_edge_review:no-blocker`. The applicator/candidate suite passes 28/28; exact-before, one guarded apply, exact-after, after-state no-op, field-validated local receipt refusal and complete historical verification all pass across 107 manifests, 100 active batches, seven superseded legacy batches and 433 guarded issue rows. Audi e-tron GT is database-audit complete at 6/6 and awaits an exact five-card Production render gate; 32 Audi database audits and 33 full Production gates remain.
- 2026-07-26: Production-verified the completed Audi A8 audit on exact commit `2e58dbf02719e0f13de89e583d3bb1e07e9d0b62` and Ready Production deployment `dpl_9ohq2QQYLQtcFzY2PvbGCXsjfXf3` with the `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly six approved cards and omits all twelve archived titles and stable IDs. All 45 removed commerce-link occurrences and commerce rails remain absent. The title/H1, standard/OG/Twitter description, exact canonical and indexability pass; 15 boundary-year live API queries match all six manifest after-states field-for-field and expose no archived IDs. Six `/get-started` occurrences, zero `Open Hub`, both restrained DataRep badges and the approved warm-paper palette are intact. Audi A8 is production-complete at 18/18, leaving 33 of 44 Audi model groups.
- 2026-07-25: Completed the database audit for all 18 frozen Audi A8 records in one guarded schema-v2 transaction after current Audi/NHTSA-hosted primary-source research and two exact-hash Blind/Edge passes. Initial reviews withheld approval on generator SHA-256 `99ce8505edd9888b6159f3c063ee0618e48cef2414a5c0a54fa7f096e9eb342d` for wrong MMI and timing-bulletin labels; both were corrected, and fresh reviews cleared exact SHA-256 `1884d1f47b1ef6302ad0a9d512b9be514ac5b7c8a428405415dcd9904a6b16d5`. Six records remain published as five diagnosis holds and one VIN-first 69BT recall path; twelve unsupported, duplicate, market-mismatched or semantically distinct aggregations are archived. All 29 commerce claims and 45 commerce-link URL occurrences are removed, including both claim clicks, both record clicks and both priority clicks. Ten distinct newly surfaced recall/TSB paths remain controlled proposals with `insert: false`. The applicator/candidate suite passes 28/28; exact-before, one-transaction apply, exact-after, no-op dry-run, exact local receipt refusal, final direct verification and complete historical verification all pass across 106 manifests, 99 active batches and 427 guarded issue rows. Audi A8 is database-audit complete at 18/18 and awaits an exact six-card Production render gate; 33 Audi database audits and 34 full Production gates remain.
- 2026-07-25: Production-verified the completed Audi A4 audit on exact commit `c2572851d07139ee66a1ad1b01de153ec7920a44` and Ready Production deployment `dpl_7Nz9EubKyRLsTKNf4WWsxPVKn4Zd`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly 13 approved cards and omits all 12 archived titles. The title and H1 agree at `1996-2025 Audi A4 Problems: 13 Issues Every Owner Should Know`; the exact canonical remains indexable, zero commerce markers are present, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi A4 is production-complete at 25/25, leaving 34 of 44 Audi model groups.
- 2026-07-25: Completed the database audit for all 25 frozen Audi A4 records in one guarded schema-v2 transaction after current Audi/NHTSA-hosted primary-source research and exact-hash Blind/Edge review. Thirteen records remain published as nine diagnosis holds and four VIN-first recall/dealer paths; twelve duplicate, unsupported or semantically mismatched aggregations are archived. All 59 original commerce claims and 95 commerce-link URL occurrences are removed, and the packet's two claim clicks, two record clicks and two priority clicks reconcile exactly. Seven distinct newly surfaced recall/TSB paths remain controlled proposals with `insert: false`, including the 99V248/00V414 tie-rod recalls rather than repurposing a control-arm identifier. The applicator/candidate suite passes 28/28; exact-before, one-transaction apply, exact-after, no-op dry-run, integrity-checked receipt refusal and complete historical verification all pass across 105 manifests, 98 active batches and 409 guarded issue rows. Audi A4 is database-audit complete at 25/25 and awaits an exact 13-card Production render gate; 34 Audi database audits and 35 full Production gates remain.
- 2026-07-25: Production-verified the completed Audi Q5 audit on exact commit `139ed0ec5f1abfdb6a6bf9d1515358bc71c9be5a` and Ready Production deployment `dpl_2rXgsWhPZrefdEz8wuYD1LNvDG3M`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly seven approved cards and omits both archived titles. The title and H1 agree at `2009-2025 Audi Q5 Problems: 7 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi Q5 is production-complete at 9/9, leaving 35 of 44 Audi model groups.
- 2026-07-24: Completed the database audit for all nine frozen Audi Q5 records in one guarded schema-v2 transaction after current Audi/NHTSA-hosted Audi primary-source research, Blind review, Edge review, twelve accepted content and pipeline patches, and clean final exact-hash re-reviews. Seven records remain published as five diagnosis holds and two VIN-first recall/dealer paths; two duplicate or unsupported aggregations are archived. All 22 original commerce claims and 34 outbound occurrences are removed, and the packet's two claim clicks, five record clicks and two priority clicks reconcile exactly. Complete verification covers 104 manifests, 97 active batches and 384 guarded issue rows without drift. Audi Q5 is database-audit complete at 9/9 and awaits a seven-card Production render gate; 35 of 44 Audi model groups remain.
- 2026-07-24: Production-verified the completed Audi RS3 audit on exact commit `65ba9f6723a50eacc350b35b3de9c24c0087d95f` and Ready Production deployment `dpl_BeVzQeyAKpabLAWsUQZv3qYSFbho`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly three approved cards and omits all three archived titles. The title and H1 agree at `2015-2023 Audi RS3 Problems: 3 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi RS3 is production-complete at 6/6, leaving 36 of 44 Audi model groups.
- 2026-07-24: Completed the database audit for all six frozen Audi RS3 records in one guarded schema-v2 transaction after current Audi/NHTSA primary-source research, Blind review, Edge review, three accepted patches and clean final exact-hash re-reviews. Three records remain published as two diagnosis holds and one VIN-first emissions recall/dealer path; three unsupported or duplicate carbon/injector aggregations are archived. All 13 original commerce claims and 21 outbound occurrences are removed, and the packet's three claim clicks, three record clicks and three priority clicks reconcile exactly. Complete verification covers 103 manifests, 96 active batches and 375 guarded issue rows without drift. Audi RS3 is database-audit complete at 6/6 and awaits a three-card Production render gate; 36 of 44 Audi model groups remain.
- 2026-07-24: Production-verified the completed Audi TTS audit on exact commit `cf6b73348cca52aee010b18d34aadbec80b498d9` and Ready Production deployment `dpl_21JEz82KWVNBCrEFwFi5zoQau839`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly four approved cards and omits all three archived titles. The title and H1 agree at `2012-2023 Audi TTS Problems: 4 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi TTS is production-complete at 7/7, leaving 37 of 44 Audi model groups.
- 2026-07-24: Completed the database audit for all seven frozen Audi TTS records in one guarded schema-v2 transaction after current Audi primary-source research, Blind review, Edge review, six accepted patches and a clean focused re-review. Four diagnosis-first records remain published and three unsupported, duplicate or wrong-powertrain aggregations are archived. All 10 original commerce claims and 16 outbound occurrences are removed; the packet's three commerce-linked priority clicks and six total record clicks are reconciled, including three historical non-commerce magnetic-ride clicks. Complete verification covers 102 manifests, 95 active batches and 369 guarded issue rows without drift. Audi TTS is database-audit complete at 7/7 and awaits a four-card Production render gate; 37 of 44 Audi model groups remain.
- 2026-07-24: Production-verified the completed Audi SQ7 audit on exact commit `15d85197b85a437d97c92487f598cf5a92f4ad4e` and Ready Production deployment `dpl_5X5B4UUsAwrNAURVs7NKJ1Jud2vb`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly three approved cards and omits the archived duplicate. The title and H1 agree at `2020-2026 Audi SQ7 Problems: 3 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi SQ7 is production-complete at 4/4, leaving 38 of 44 Audi model groups.
- 2026-07-24: Completed the database audit for all four frozen Audi SQ7 records in one guarded schema-v2 transaction after current Audi/NHTSA primary-source research, Blind review, Edge review, 13 accepted patches and a clean focused Edge re-review. Three records remain published as two diagnosis holds and one VIN-first recall/dealer path; the duplicate unsupported air-suspension aggregation is archived. All seven original commerce claims, 11 outbound occurrences and four priority clicks are classified and removed. Empty published trim arrays preserve runtime visibility, receipt reconciliation is exact, and complete verification covers 101 manifests, 94 active batches and 362 guarded issue rows without drift. Audi SQ7 is database-audit complete at 4/4 and awaits a three-card Production render gate; 38 of 44 Audi model groups remain.
- 2026-07-24: Production-verified the completed Audi SQ5 audit on exact commit `10bf5d3e0ec06080b2a906f63d01bdef2d8a94bc` and Ready Production deployment `dpl_4bTwAAGmtcWMfDgqi94p2xmDYjHD`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly four approved cards and neither archived title. The title and H1 agree at `2014-2025 Audi SQ5 Problems: 4 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi SQ5 is production-complete at 6/6, leaving 39 of 44 Audi model groups.
- 2026-07-24: Completed the database audit for all six frozen Audi SQ5 records in one guarded schema-v2 transaction after current primary-source research and a focused Blind/Edge review. Four records remain published as diagnosis holds and two unsupported supercharger aggregations are archived. All 11 original commerce claims, 19 outbound occurrences and four priority clicks are classified and removed. Empty published trim arrays preserve runtime visibility, superseding Audi bulletin revisions control, and unsupported report counts, costs and mileage claims are cleared. Complete verification covers 100 manifests, 93 active batches and 358 guarded issue rows without drift. Audi A6, S8, e-tron, S6 and SQ5 are database-audit complete with 39 of 44 Audi model groups remaining; SQ5 now awaits its Production render gate.
- 2026-07-24: Production-verified the completed Audi S6 audit on exact commit `dd56639a8c178a5063f3e578e821992c2442ff4e` and Ready Production deployment `dpl_2JsddHhMjgovGnaLh8czKpXQFLDp`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly four approved cards and none of the three archived titles. The title and H1 agree at `2007-2025 Audi S6 Problems: 4 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi S6 is production-complete at 7/7, leaving 40 of 44 Audi model groups.
- 2026-07-23: Completed the database audit for all seven frozen Audi S6 records in one guarded schema-v2 transaction after independent primary research, Blind Hunter, Edge Case Hunter and a clean focused follow-up review. Four records remain published as two diagnosis holds and two VIN-first recall/dealer paths; both overlapping carbon-buildup rows and the unsupported C5 transmission aggregation are archived. All nine original commerce claims, 13 outbound occurrences and four priority clicks are classified and removed. Published trim arrays remain empty so API trim filtering cannot suppress the records, while generation, equipment, VIN and production boundaries remain explicit in public prose. Complete verification covers 99 manifests, 92 active batches and 352 guarded issue rows without drift. At this database checkpoint Audi A6, S8, e-tron and S6 were database-audit complete with 40 groups remaining; the production entry above records the later successful S6 render gate.

- 2026-07-23: Production-verified the completed Audi e-tron audit on exact commit `a9d84353b861db7fac827802451bc4b01c69a2a2` and Ready Production deployment `dpl_HUev7WdKs3TccbHHPLwYY82zUrT1`. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly five approved cards and none of the two archived titles. The title and H1 now agree at `2019-2023 Audi e-tron Problems: 5 Issues Every Owner Should Know`; the exact canonical remains indexable, and the approved Get Started CTA, restrained DataRep badges and warm-paper design are intact. Audi e-tron is production-complete at 7/7, leaving 41 of 44 Audi model groups.
- 2026-07-23: Completed the database audit for all seven frozen Audi e-tron records. The initial guarded schema-v2 transaction was followed by one guarded seven-row BMAD review-correction transaction; the amended active schema-v2 manifest then recorded an exact `already-applied` receipt. Five records remain published as four diagnosis holds and one VIN-first recall/dealer path; the generic CCS-port duplicate and generic OTA/infotainment aggregation are archived. All 21 original commerce claims and 29 outbound occurrences are removed. Legacy e-tron and 2024 Q8 e-tron naming boundaries are explicit, reconciliation is exact, and the next production render is expected to contain five cards. Complete verification covers 98 manifests, 91 active batches and 345 guarded issue rows without drift. At this database checkpoint Audi A6, S8 and e-tron were database-audit complete with 41 groups remaining; the production entry above records the later successful e-tron render gate.
- 2026-07-23: The make-completion invariant is now explicit: finish every frozen Audi model before leaving Audi, then complete Cadillac, then complete BMW, and thereafter continue make-by-make. Never hop to another make after completing only one model. Traffic and clicks determine order only inside the active make and model; they never authorize an early make switch.
- 2026-07-23: Production-verified the completed Audi S8 audit on exact commit `e416c2c6265888bcad2294258065656ddb0f246f` and Ready Production deployment `dpl_GkZ9BsD3iauxnYyouWQukHEHeWmF`. After explicit CDN and data-cache purges, the cache-busted public route renders exactly 11 approved cards, includes all 11 published titles and none of the eight archived titles, keeps the exact canonical indexable, and retains the approved Get Started CTA, restrained DataRep footer badges and warm-paper design.
- 2026-07-23: Completed all 19 frozen Audi S8 records across four guarded schema-v2 batches. Eleven records remain published as eight diagnosis holds and three VIN-first recall/dealer paths; eight unsupported, duplicate, maintenance-only or generic aggregations are archived. All 66 original commerce claims and 179 outbound occurrences are removed, reconciliation is exact, and the next production render is expected to contain 11 cards. Newly surfaced recalls remain controlled delta proposals rather than unguarded inserts. Audi A6 and S8 are now model-complete, leaving 42 of the fresh inventory's 44 Audi model groups in the active make queue.
- 2026-07-23: User replaced the traffic-shortlist sequence with full make completion. Starting with Audi, every model present in the fresh full-catalog inventory must be frozen, audited and production-verified before advancing to the next make. The former general "later makes alphabetically" rule is superseded by the explicit Audi -> Cadillac -> BMW sequence recorded above; after BMW, continue make-by-make. Traffic and clicks may prioritize models and records only within the active make. The 2026-07-22 snapshot contains 7,639 published records across 53 makes; Audi contains 44 model groups and Audi A6 is already database-audit complete. A make is not complete merely because its shortlist models are complete.
- 2026-07-22: Completed and production-verified the Toyota RAV4 audit at 70/70 unique schema-v2 records across 14 guarded batches: 20 diagnosis holds, five no-commerce records, 18 VIN-first recall/dealer paths and 27 archived records. All 140 original commerce claims and 340 outbound occurrences are classified and removed; 43 records remain published, 27 are archived, zero commerce remains, and complete historical verification is drift-free. The closing production checkpoint is exact HEAD `0efb2a95c01307351565c6ab247f1c44d41a7955` on Ready Production deployment `dpl_77N4FZWG2oaTNz8vRokzeHwmHy4d` with the production aliases; after CDN and data-cache purges, the cache-busted render passed the final content, SEO, CTA, design and footer gate.
- 2026-07-22: Selected Toyota Corolla Cross as the next model from the latest Search Console coverage workbooks because its base and year Known Issues routes lead measured traffic among the remaining Toyota candidates. The frozen model inventory contains 23 unique records in five packets. Cohorts 1-2 complete 10 records in two guarded schema-v2 batches: five remain published, five are archived, all 11 original commerce claims and 21 outbound occurrences are removed, and progress is 10/23. Cohort 1 is live and production-verified on exact commit `96747735cf78d212016451c1ef1eb2c50442927d`; cohort 2 is database-verified and awaits its live release gate.
- 2026-07-20: Completed and production-verified all 78 Toyota Camry schema-v2 records in 16 guarded batches: 19 diagnosis holds, eight recall/dealer paths, two evidence-only no-commerce records, two diagnosis-qualified replacements, and 47 archived records. All 235 original commerce claims and 631 outbound occurrences are classified; only two exact verified Toyota water-pump product pages remain. Reconciliation is zero-unclassified with no drift. After CDN/data cache purge, the live page exposes exactly 31 published after-states, omits the archived records, and retains the approved warm-paper design. Toyota RAV4 is next.
- 2026-07-20: Completed and production-verified all 28 Lincoln Aviator schema-v2 records in six guarded batches: 12 diagnosis holds, 10 recall/dealer paths, five archived records, and one evidence-only no-commerce record. All nine original commerce claims and 27 search-link occurrences are covered and removed; reconciliation is zero-unclassified with no drift. The live API and hydrated page match the approved after-state, shared empty cost/date/parts boilerplate discovered during the browser gate was fixed, and the approved warm-paper card design was merged from its preview branch and released to Production in `e536128`. Toyota Camry is next.
- 2026-07-20: Completed and production-verified all 13 BMW X5 schema-v2 records. The release also hardened all-manifest verification so runtime recommendation click telemetry does not create content drift and fully covered legacy link-only batches are superseded without allowing partial overlap. Lincoln Aviator is the next traffic-ranked model.
- 2026-07-17: User clarified that passing over an issue means a complete issue audit, not a link audit. Traffic/clicks determine order only. Completion now requires schema-v2 full-record evidence, all public fields guarded/applied/verified together, and a live production after-state check. Existing schema-v1/link-only batches remain historical evidence but do not count toward full-record coverage.
- 2026-07-15: User authorized ShowMeTheParts as a non-LLM candidate and fitment source. Ultra/web review remains the repair-accuracy and final product-link gate; bulk Hub seeding remains out of this bugfix pending licensing and schema approval.
- 2026-07-15: User changed execution priority from a clicks-only queue to traffic-ranked make batches. Rank each make by its highest-traffic Known Issues page, then review that make's models in page-traffic order so engine, fitment, supersession, and retailer evidence can be reused. This changes work order only; all 10,850 baseline commerce claims remain in scope.
- 2026-07-15: User required one canonical commerce location across all Known Issue pages after the BMW X5 valve-stem-seal card exposed both repair-part links and generic oil/filter "Upgrade" searches. Only verified `fixParts.buyLinks` may be clickable commerce; owner tips remain text-only.
- 2026-07-15: User requested a professional sand/ink Known Issue card palette. Remove red, purple, yellow, and green card treatments; make state and recency understandable without color, using explicit copy, icons, borders, and hierarchy.

## Review Triage Log

### 2026-07-28 — Audi RS4, RS6 and A5 Sportback release review

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- review_notes:
  - Exact audit commit `f6aeacdfb6c864668e5eef53827bc9486bf63aa1` passed the 34 focused tests, page ESLint, staged diff checks, local and Vercel 1,531-page builds, Ready/Production/alias inspection and both cache purges.
  - Cache-busted HTML and the 35-response API matrix passed all content, archived-record, field, year, exact-model, SEO, structured-label, commerce, CTA, DataRep and warm-paper invariants for the three routes.

### 2026-07-28 — Audi A6 allroad release review

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` The first cache-busted Production gate found that the target page still used the legacy 68-character title before the root suffix. The scoped follow-up added only `audi-a6-allroad` to the existing concise audited-title path, producing the exact 50-character base label without altering previously indexed model titles or the Known Issues design.
- review_notes:
  - Exact staged release bytes passed `a6_allroad_release_blind:no-blocker` and `a6_allroad_release_edge:no-blocker` before the closing commit.
  - Exact closing commit `d2298af6819d23bc36088affb0e2c24a9855e494` passed ESLint, local and Vercel 1,531-page builds, Ready/Production/alias inspection, both cache purges, HTTP 200 live render verification, the concise SEO/structured-data/design/commerce contract and a field-for-field 2019-2025 API matrix.

### 2026-07-28 — Audi A6 allroad pre-apply review

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` The Blind source pass found that NHTSA 21V159 uses Audi campaign code `70i2`, not the draft's `69BY`; the proposal title was corrected before config hashing, manifest generation or database mutation.
- review_notes:
  - The final two-record manifest contains two published no-commerce paths: VIN-first emissions Service Action 27BQ and the exact 48V low-state-of-charge recharge/replacement boundary from TSB 2067906/5. Eight `insert: false` proposals span nine exact NHTSA-hosted primary-source URLs.
  - Blind and Edge passes inspected the exact core/config generator SHA-256 `ba73050eeb6fb41965e86267d7677ca5c4f3645c31f8dc491ab9c754cbe1ca43` and returned `a6_allroad_blind_review:no-blocker` and `a6_allroad_edge_review:no-blocker` before manifest publication or mutation.
  - The exact-before two-row state, one atomic transaction, receipt-backed exact-after state, no-op dry-run, receipt no-clobber refusal and all-history verification across 450 guarded rows pass without drift.

### 2026-07-28 — Audi A4 allroad release review

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- review_notes:
  - Exact staged release bytes passed `a4_allroad_release_blind:no-blocker` and `a4_allroad_release_edge:no-blocker` before commit.
  - Exact audit commit `583ee25c3960194f8af23ad1d23aada86b002e7a` passed local and Vercel 1,531-page builds, Ready/Production/alias inspection, both cache purges, HTTP 200 live render verification, the exact SEO/structured-data/design/commerce contract and a field-for-field 2012-2025 API matrix.

### 2026-07-28 — Audi A4 allroad pre-apply review

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Repeated the supersession sweep against current NHTSA-hosted Audi publications and moved proposal evidence from older transmission, quattro Ultra, display and J775 bulletin revisions to current TSBs 2064312/7, 2059057/12, 2063913/6 and 2067531/6 before freezing the final generator.
- review_notes:
  - The final two-record manifest contains one published VIN-first recall/service-action path, one archived unsupported aggregation and thirteen `insert: false` proposals across 14 exact primary-source URLs; both after-states contain zero commerce, costs, mileage ranges or seeded owner telemetry.
  - Independent Blind and Edge reviewers inspected the exact combined core/config generator SHA-256 `a049f01f0bc6340554e6800e7e318afd3584e07f72fea074560ecfeb1a41158c` and returned `a4_allroad_blind_review:no-blocker` and `a4_allroad_edge_review:no-blocker` before manifest publication or database mutation.
  - The exact-before two-row state, one atomic transaction, receipt-backed exact-after state, no-op dry-run, receipt no-clobber refusal and all-history verification across 448 guarded rows pass without drift.

### 2026-07-28 — Audi S5 release review

- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Aligned the exact live metadata contract with the current plural renderer's `Symptoms, and solutions...` output instead of changing shared metadata across the indexed Known Issues route during a model audit.
  - `[medium]` `[patch]` Restored the manifest's exact archived title `Archived - Unsupported 2010-2017 S5 Crankshaft-Pulley Aggregation` so the live leakage assertion cannot pass against a shortened label.
- review_notes:
  - Blind review returned `s5_release_blind:no-blocker`; Edge review found both contract mismatches above, and the focused patched re-review returned `s5_release_edge_followup:no-blocker`.
  - Exact audit commit `e450d2e60e901a50a8b25e5628df9a290f23798f` passed the local and Vercel 1,531-page builds, Ready/Production/alias inspection, both cache purges, HTTP 200 live render verification, the exact SEO/structured-data/design/commerce contract and a field-for-field 2008-2025 API matrix.

### 2026-07-28 — Audi S5 pre-apply review

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 1, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Replaced the unsupported 2018-2024 2.9T water-pump/internal-migration aggregation with exact 2018 3.0L EA839 TSB 2058890/4 scope, P000000 symptom 33688 and its staged coolant, software, N649, vacuum and pump-sleeve diagnosis.
  - `[medium]` `[patch]` Visually inspected current TSB 2070349/5 and corrected every controlled proposal identity from generic S5 to the bulletin's exact 2018-2024 S5 Cabriolet/S5 Sportback scope.
  - `[medium]` `[patch]` Corrected proposal body-style boundaries for 22V742 and TSB 2059057/7, then bound all 14 proposal title/source identities to the frozen reviewed generator.
- review_notes:
  - The final six-record manifest contains two published diagnosis holds, four archived removals and fourteen `insert: false` proposals; all published after-states contain zero commerce, costs, mileage ranges or seeded owner telemetry.
  - Independent Blind and Edge reviewers inspected exact generator SHA-256 `ec96a3c679f0adf329064e05099978c7e61150f36200cf2a36d1cae1d7d3b004` and returned `s5_blind_review:no-blocker` and `s5_edge_review:no-blocker` before manifest publication or database mutation.
  - The exact-before six-row state, one atomic transaction, receipt-backed exact-after state, no-op dry-run and all-history verification across 446 guarded rows pass without drift.

### 2026-07-27 — Audi RS7 release review

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Expanded the future Production gate to pin the exact TechArticle headline/description with no false repair-cost claim, FAQ JSON-LD plural wording and one-critical count, the visible GEO summary and the exact `All 2 Known Issues` heading.
- review_notes:
  - The initial Blind pass returned `rs7_release_blind:no-blocker`; Edge review found the one gate omission above while confirming that the staged package contains exactly the two ledgers, the 3D/model work is unstaged, and all other commit, Production-target/alias, identity, year-gap API, commerce, canonical/indexability, CTA, DataRep and warm-paper checks are correct.
  - Fresh focused re-reviews inspected the patched staged ledger and returned `rs7_release_blind_followup:no-blocker` and `rs7_release_edge_followup:no-blocker`.
  - Exact commit `cca8b8d006f59dca6a52c59251c0fd50e5eb3bf3` subsequently passed the local and Vercel 1,531-page builds, Ready/Production/alias inspection, both cache purges, HTTP 200 live render verification, the exact SEO/structured-data/design/commerce contract and a field-for-field 2013-2026 API matrix.
  - Final closure reviewers returned `rs7_closure_blind:no-blocker` and `rs7_closure_edge:no-blocker`; the closure package remains limited to the two audit ledgers and excludes all user 3D/model work.

### 2026-07-27 — Audi RS7 pre-apply review

- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 2, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Rejected and deleted prepublication generator SHA-256 `91628ca47db687a060ce37aff821cb1f7a6e368284d36c4e8de047c2a88a0d86`, which copied RS5 three-row IDs, 4.2 FSI/2.9 V6 powertrains, RS5 coolant bulletin 2070349/4 and a three-record packet guard into RS7. The immutable four-row packet caught the mismatch before any review token, manifest, database write or ledger mutation.
  - `[high]` `[patch]` Replaced the seeded wastegate-rattle/carbon and parts-shopping narrative with the semantically related, safety-critical turbo oil-supply path in VIN-first Audi recall 21H7/NHTSA 22V178, including its free dealer remedy and zero commerce.
  - `[medium]` `[patch]` Bound the air-suspension diagnosis to current superseding TSB 2059363/6, exact RS7 model years 2021-2025, required equipment, C1260F0/U112100 symptom 262400, J775/J1135 wiring checks and first-versus-recurrent fault-state branches.
  - `[medium]` `[patch]` Replaced a tautological proposal-identity check with twelve hard-coded title/source identities and changed three indirect/API landing links to exact NHTSA-hosted primary PDFs before freezing the review hash.
- review_notes:
  - Current TSB 2060420/2 documents a reproducible 2020-2021 RS7 4.0 TFSI mechanical-coolant-pump croak/jar at idle, not the seeded turbo-line degradation/leak aggregation, so the broad row is archived and the exact pump-noise path remains proposal-only.
  - Independent Blind and Edge reviewers inspected exact generator SHA-256 `4890278f8a1951bda792830099fe4b1a47e6aa32a6b6556f2e734efbdb081333` and returned `rs7_blind_review:no-blocker` and `rs7_edge_review:no-blocker` before manifest publication or database mutation.

### 2026-07-26 — Audi RS5 release review

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 1, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Tightened the Vercel gate from an ambiguous Ready deployment to Ready with target `Production` and the exact `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app` aliases, preventing a Preview deployment from satisfying closure.
  - `[medium]` `[patch]` Corrected the singular-only metadata path and pinned the exact standard/Open Graph/Twitter description to `1 documented problem for the 2021-2024 Audi RS5. Symptoms and solutions compiled from NHTSA recalls, TSBs, and owner forums.`
  - `[medium]` `[patch]` Pinned the exact published ID/anchor/title, both archived IDs/titles, all eight removed URL occurrences, six `/get-started` occurrences, zero `Open Hub`, the exact UK/EU DataRep assets and all three warm-paper colors.
- review_notes:
  - The initial release Blind pass returned `rs5_release_blind:no-blocker`; Edge review found the three gate gaps above before commit or deployment. The targeted metadata correction does not alter a Known Issues URL, canonical, indexability, route, sitemap, robots directive or the warm-paper visual design. A fresh focused follow-up review is required on the patched bytes and ledgers.

### 2026-07-26 — Audi RS5 release follow-up review pass 1

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 2, low 1)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Corrected TechArticle JSON-LD to use singular `problem` and to omit `repair costs` when the rendered issue set has no published cost estimate.
  - `[medium]` `[patch]` Corrected both FAQ answers, including their FAQ JSON-LD representation, to use singular `documented issue` and `known issue` labels for a one-card model.
  - `[low]` `[patch]` Corrected the visible GEO summary and issue-section heading to `has 1 documented issue` and `All 1 Known Issue`.
- review_notes:
  - The first focused follow-up Blind review returned `rs5_release_followup_blind:no-blocker`; Edge review found these three remaining singular-copy paths. The standard/Open Graph/Twitter metadata, Production target/aliases, stable IDs/titles, CTA/footer/palette assertions, canonical/indexing boundaries and 31/32 queue counts were already correct. A second focused follow-up review is required on the final patched bytes.
  - The second focused Blind and Edge follow-up reviews inspected the final page and ledger bytes and returned `rs5_release_followup2_blind:no-blocker` and `rs5_release_followup2_edge:no-blocker` with no findings.

### 2026-07-26 — Audi RS5 pre-apply review pass 1

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- review_notes:
  - Before the generator hash was frozen, independent primary-source inspection caught that Audi TSB 2070349/2 had been superseded. The reviewed bytes use current revision 2070349/4 and its exact 2021-2024 RS5 Coupe/Sportback, normal-seepage, dried-deposit, N649/P0299, evidence and diagnosis-before-parts boundaries; a bounded official-source check found no later revision.
  - Root release inspection and fresh Blind and Edge reviews independently inspected exact generator SHA-256 `4225e012fbe6d9dc184f20c81cb6b43b196e20932c081f2cb0064b58d64f9b16`. The review passes returned `rs5_blind_review:no-blocker` and `rs5_edge_review:no-blocker` with no findings before manifest publication or database mutation.

### 2026-07-26 — Audi e-tron GT exact-model API follow-up review

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- review_notes:
  - Fresh Blind and Edge follow-up reviewers returned `no-blocker` after checking exact case-insensitive model equality, preservation of make/year/status/severity/trim behavior, valid Next route exports, the focused regression test and accurate pending-Production ledger wording.

### 2026-07-26 — Audi e-tron GT first live gate

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 1, medium 0, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Withheld Production closure when the default 2022 `model=e-tron GT` API response also exposed five `RS e-tron GT` rows through a pre-existing substring predicate. Replaced the model `contains` filter with an exact case-insensitive equality helper and added a regression test that forbids a `contains` key.
- review_notes:
  - Ready Production deployment `dpl_DMxGTttFcKq83rUwB2RreWW98vPu` on exact audit commit `01ec1881ec8e13e4ceb0bfac47bf68195ac74a84` passed the five-card HTML, metadata, canonical, archived-record, commerce, CTA, DataRep and palette checks after CDN/data-cache purges, but it is not the closing deployment because the API boundary failed.
  - The focused regression test passes; scoped lint passes for the new helper/test. Repository-wide TypeScript remains blocked only by the user's unrelated `scripts/scrape-mopar-diagram.ts` Puppeteer dependency.

### 2026-07-26 — Audi e-tron GT release follow-up review

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- review_notes:
  - Fresh Blind and Edge follow-up reviewers returned `no-blocker` after checking the exact SEO/social labels, 2021-2025 API ID sets, card/archive/commerce/CTA/DataRep/palette contract and receipt wording against the final six-row manifest.

### 2026-07-26 — Audi e-tron GT release review

- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 0, medium 3, low 1)
- defer: 0
- reject: 1: (high 0, medium 1, low 0)
- addressed_findings:
  - `[medium]` `[patch]` Pinned the exact HTML/H1/Open Graph/Twitter title and exact standard/OG/Twitter e-tron GT description rather than accepting merely aligned metadata.
  - `[medium]` `[patch]` Pinned the live API boundary-year contract to exact 2021-2025 published-ID sets, including both negative boundary years.
  - `[medium]` `[patch]` Pinned six `/get-started` occurrences, zero `Open Hub`, exactly two restrained DataRep badges and all three approved warm-paper colors, alongside exact card/anchor/archive/commerce checks.
  - `[low]` `[patch]` Replaced `integrity-checked generator refusal` with precise `field-validated local receipt refusal` wording.
- review_notes:
  - A proposal to let the generator cryptographically attest its own reviewed file hash was rejected as a release blocker: a self-hash cannot be embedded without changing the file, while the external Blind/Edge outputs, immutable generator SHA and manifest approval metadata already bind this exact release candidate. A separately signed approval artifact would be pipeline hardening, not an e-tron GT correctness defect.

### 2026-07-26 — Audi e-tron GT pre-apply review pass 1

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- review_notes:
  - Fresh focused Blind and Edge reviews independently inspected exact generator SHA-256 `5457b72b9170d8886b69b5c502d0ffdb23f5177fc26689cf566d8b03f74ee836` and returned `etron_gt_blind_review:no-blocker` and `etron_gt_edge_review:no-blocker`.

### 2026-07-25 — Audi A8 release follow-up review

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- review_notes:
  - Fresh Blind and Edge follow-up reviewers returned `no-blocker` after checking the expanded Production contract, exact 6/12 model split, metadata and API expectations, corrected queue counts and receipt wording against the final A8 manifest.

### 2026-07-25 — Audi A8 release review

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 2, low 1)
- defer: 0
- reject: 9
- addressed_findings:
  - `[medium]` `[patch]` Corrected the closing queue ledger to distinguish A8's database-complete state from its pending Production gate and to report 33 database audits versus 34 Production gates remaining.
  - `[medium]` `[patch]` Expanded the pending Production contract to pin the exact title/H1, model-specific standard/OG/Twitter description, canonical, indexability, Ready deployment identity and aliases, cache purges, stable published/archived IDs, all 45 removed commerce-link occurrences, the live API after-state, Get Started CTA, DataRep badges and warm-paper palette.
  - `[low]` `[patch]` Replaced `integrity-checked result-receipt file SHA-256` with precise wording that distinguishes field validation from the separately recorded receipt-file hash.
- review_notes:
  - Archived records remain non-public, and their removal decisions are based on the frozen record's complete source set plus the review matrix rather than the generic NHTSA lookup URL alone; the adversarial request for source-content attestation of an analytical negative-evidence conclusion was rejected as a release blocker.
  - Caller-supplied approval tokens are bound to the reviewed generator hash and corroborated by the recorded reviewer outputs; cryptographic reviewer attestation is outside this model gate.
  - Direct database, 28-test and complete-history results are independently rerun command evidence recorded in the audit ledger; they are not required to be embedded inside the immutable manifest or applicator receipt.

### 2026-07-25 — Audi A8 pre-apply review pass 1

- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 2, medium 0, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Corrected the MMI primary-source identity from nonexistent/mismatched TSB 2047576/2 to the linked PDF's exact Audi TSB 2030465/12 in the citation, decision, evidence and public description.
  - `[high]` `[patch]` Corrected the 3.0 TFSI cold-start-rattle source revision from 2039995/1 to the linked PDF's exact Audi TSB 2039995/2 in the citation, decision, evidence and public description.
- review_notes:
  - Blind and Edge review both withheld approval on generator SHA-256 `99ce8505edd9888b6159f3c063ee0618e48cef2414a5c0a54fa7f096e9eb342d`; the corrected generator requires fresh exact-hash review before manifest generation.

### 2026-07-25 — Audi A8 pre-apply review pass 2

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 9
- addressed_findings:
  - none
- review_notes:
  - Fresh Blind and Edge re-reviews both inspected exact generator SHA-256 `1884d1f47b1ef6302ad0a9d512b9be514ac5b7c8a428405415dcd9904a6b16d5` and returned `no-blocker`.
  - Blind's non-blocking hardening notes concern cross-batch cryptographic provenance, external-document content hashing, schema boundaries or Windows best-effort durability and do not contradict this exact generator's current packet, evidence, applicator validation, no-clobber or direct-database verification gates.

### 2026-07-25 — Audi A4 release follow-up review

- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 0, low 1)
- defer: 0
- reject: 0
- addressed_findings:
  - `[low]` `[patch]` Aligned the Remaining Work summary with the exact A4 checkpoint: 34 Audi database audits remain, while 35 full Production gates remain until A4 passes its live render.
- review_notes:
  - Follow-up Blind review returned no findings; follow-up Edge review returned only the corrected progress-summary ambiguity.

### 2026-07-25 — Audi A4 release review pass

- intent_gap: 0
- bad_spec: 0
- patch: 7: (high 0, medium 2, low 5)
- defer: 0
- reject: 6
- addressed_findings:
  - `[medium]` `[patch]` Preserved the applied manifest's immutability and added an append-only erratum for its stale non-public camera `decision` sentence; every public after-state field and citation already has the correct 2021 91DZ / 2022 91CR population.
  - `[medium]` `[patch]` Expanded the Production acceptance gate to the exact title/H1, canonical/indexability, all 13 published titles, all 12 archived omissions, zero commerce, Get Started CTA, DataRep badges and warm-paper palette.
  - `[low]` `[patch]` Corrected receipt reconciliation from 31 to the actual 30 full-record after-state hashes.
  - `[low]` `[patch]` Qualified the 95 removed URLs as commerce/claim-link occurrences so retained primary-source citation URLs are not described as removed.
  - `[low]` `[patch]` Replaced unsupported `durable receipt` wording with `integrity-checked receipt`; file-system durability is not inferred from the applicator's atomic rename alone.
  - `[low]` `[patch]` Distinguished the 34 remaining Audi database audits from the 35 incomplete full Production gates while A4 awaits its live render.
  - `[low]` `[patch]` Separated the 14 pre-apply patches from review-process notes and enumerated all eight rejected findings so the triage totals are auditable.
- rejected_findings:
  - Tracking the ignored packet/manifest/result bundle would violate the established two-ledger commit boundary; hashes plus live database verification remain the current release evidence.
  - Generic NHTSA vehicle lookup URLs on archived negative-research rows are treated as search-provenance pointers, not as positive proof of a defect; the unsupported rows remain non-public and archived.
  - `review_loop_iteration: 0` is correct because the counter advances only for `bad_spec` re-derivation loops; all A4 findings were classified as bounded patches or rejects.
  - Preserving raw `--verify --all` console output is not required for current-state verification because the command is rerunnable and independently passed at the release gate.
  - Adding database/environment identity to the shared receipt schema is a separate cross-batch contract change and is not necessary to verify this exact Production database state.
  - Pre-apply reviewer labels are local attestations rather than cryptographic signatures; the exact-hash review outputs and this independent release review supply the bounded human-readable audit trail.

### 2026-07-25 — Audi A4 pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 14: (high 6, medium 6, low 2)
- defer: 0
- reject: 8
- addressed_findings:
  - `[high]` `[patch]` Added nonempty primary-research evidence/citations to every archived row and invoked the applicator's schema-v2 validator inside the generator, closing a manifest-rejection gap that the local citation enum check had missed.
  - `[high]` `[patch]` Corrected the rear-camera campaign populations: 91DZ/22V742 is the 2021 A4 Sedan/allroad branch, while 91CR/21V825 is the 2022 A4 Sedan branch.
  - `[high]` `[patch]` Archived the unsupported control-arm/bushing row and moved the distinct 99V248/00V414 tie-rod recalls to an exact controlled-delta proposal with `insert: false`, preventing a semantic insert under a legacy identifier.
  - `[high]` `[patch]` Removed the unauditable oil-measurement warning symptom and do-not-add-oil instruction, retaining complaint-driven CAEB diagnosis and manual/current-Audi oil-warning guidance.
  - `[high]` `[patch]` Preserved both official 69BT A4 filing branches—20V056 for 1999-2000 and 22V471 for 1997-1998—plus the campaign criteria, yielding an explicit VIN-first 1997-2000 scope with an exact generation invariant.
  - `[high]` `[patch]` Required exact per-claim claim-ID-to-URL association, so URLs cannot move between adjacent claims while flattened cohort totals remain unchanged.
  - `[medium]` `[patch]` Read each frozen source file once, hashed those exact bytes and parsed the same bytes, closing a hash/read time-of-check gap.
  - `[medium]` `[patch]` Guarded all seven controlled-delta titles, source groupings, unique URLs, HTTPS NHTSA hosts and proposal-only/no-insert dispositions exactly.
  - `[medium]` `[patch]` Added explicit 13-published/12-archived and nine-diagnosis/four-recall/twelve-remove invariants after moving the semantically distinct tie-rod recall out of the legacy row.
  - `[medium]` `[patch]` Disclosed intentional removal of unsupported/artificial owner-report counts and last-reported dates in each affected public correction summary.
  - `[medium]` `[patch]` Bound receipt reconciliation to exact ordered issue IDs, dispositions and all 30 applicator-compatible after-state hashes, with manifest-file presence/content/hash validation before regeneration refusal.
  - `[medium]` `[patch]` Retained exact CAEB, engine, body, factory-CVT, VIN-suffix and year-branch scopes in public titles/descriptions while preserving intentionally empty runtime trim/engine arrays so filtering cannot hide applicable cards.
  - `[low]` `[patch]` Added the VIN/engine-specific oil-standard boundary to the archived sludge row's neutral low-pressure guidance.
  - `[low]` `[patch]` Added best-effort containing-directory fsync after atomic hard-link publication, with an explicit Windows durability warning fallback and no false rollback after publication.
- review_notes:
  - Initial review withheld approval on generator SHA-256 `4e58dfde345fbef03e535b01ebc87acde75a6ffd1f47799952aeff913bb804ea`. Blind re-review cleared interim SHA-256 `cf6aa9abb37931ef0daf2b211dff1800f778843bd16178babd660111a182cbfe`, but Edge review found that its 69BT correction had dropped the original 20V056 branch. The final patch restored both filing branches and added the exact invariant.
  - Final pre-apply Blind and Edge re-reviews both inspected generator SHA-256 `a8215a017ca39bf0213fb719b83bc451d4190fc6743416d10a9ac9005140c87f` and returned `no-blocker`; the later release-ledger review found a stale non-public camera `decision` sentence and triggered the append-only erratum recorded below.
- rejected_findings:
  - Intentionally empty runtime trim/engine arrays are retained because incomplete normalized labels can hide applicable cards; exact engine, body, drivetrain, VIN and year gates remain explicit in public titles and prose.
  - Cryptographic reviewer signatures are outside this local reviewed-generator workflow; exact-hash reviewer outputs and the later independent release review remain the approval evidence.
  - An authenticated database attestation inside the local receipt is outside the applicator contract; direct and complete-history database verification establish current state.
  - Continuous post-receipt database monitoring is a separate operational control and is not represented as part of this one-shot corrective transaction.
  - The hard-coded `2026-07-25` approval/update date matches the actual reviewed execution date; later execution is refused by the validated existing result.
  - Requiring `completedAt` as generator approval evidence was rejected because content and database state are bound by manifest identity and exact after-state hashes, not wall-clock provenance.
  - Importing one shared full-record field contract is a future refactor; the generator's 30-field list was checked against the current applicator and receipt.
  - Requiring a separately signed receipt before refusing regeneration was rejected because refusal is the safe behavior and the applicator independently verifies the database before release.

### 2026-07-24 — Audi Q5 release review pass

- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 0, low 2)
- defer: 0
- reject: 2
- addressed_findings:
  - `[low]` `[patch]` Clarified that the Q5 gasoline-quality/deposit diagnosis applies to gasoline-powered vehicles so the database's intentionally empty runtime engine filter cannot be misread as diesel applicability.
  - `[low]` `[patch]` Renamed the receipt's parsed-manifest digest as order-sensitive rather than canonical, matching the applicator's exact `JSON.stringify` hash semantics.
  - Blind release review returned no findings. The two rejected Edge scenarios do not expose current after-state drift: the independent applicator validates receipt after-hashes and manifest presence/content during direct and complete-history verification, both of which pass for this batch.

### 2026-07-24 — Audi Q5 pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 12: (high 4, medium 4, low 4)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Replaced superseded transmission TSB 2032812/8 with superseding Audi TSB 2032812/9 and restored its complete conditional repair path: crankcase-pressure valve inspection, exact valve/seal/bolt branches, matching TCM/ECM SVM updates, and distinct 2011/2012 adaptation procedures.
  - `[high]` `[patch]` Bound approval to the actual fresh Edge reviewer identity as well as the Blind reviewer identity and exact reviewed generator SHA-256, closing a provenance gap that could otherwise approve a different review path.
  - `[high]` `[patch]` Rejected invalid pre-apply citation/severity enum values before any database mutation, removed the unapplied invalid artifact from the active decision set and advanced to a new fail-closed batch with explicit enum invariants.
  - `[high]` `[patch]` Preserved the diagnosis-first transmission boundary: the corrected record cannot imply automatic mechatronic, valve-body or transmission replacement and cannot skip the bulletin's installed-part and model-year gates.
  - `[medium]` `[patch]` Set `nhtsa-verified` provenance only where an actual NHTSA recall filing controls, while representing Audi warranty bulletins and the current 19N8 service action with schema-supported manual provenance rather than mislabeling them as recalls.
  - `[medium]` `[patch]` Made post-publication temporary-file cleanup warning-only after successful atomic linking so an incidental cleanup failure cannot falsely report that reviewed-manifest publication failed.
  - `[medium]` `[patch]` Added explicit allowed-value guards for severity, confidence and citation provenance before manifest publication.
  - `[medium]` `[patch]` Preserved exact historical-versus-current coverage language for Warranty Key U35 and Service Action 19N8, avoiding a promise that expired or VIN-dependent coverage remains open.
  - `[low]` `[patch]` Removed the coolant workshop finding from owner-facing symptoms and kept pressure-test localization in the diagnostic path.
  - `[low]` `[patch]` Removed the sunroof workshop cause from owner-facing symptoms and kept blocked/kinked drain-hose diagnosis in the bulletin branch.
  - `[low]` `[patch]` Removed the after-run-pump internal failure mechanism from owner-facing symptoms while retaining the VIN-first fire-risk campaign guidance.
  - `[low]` `[patch]` Removed unsupported generic timing-chain symptom placeholders from the U35 diagnosis hold.
  - Final Blind and Edge re-reviews of generator SHA-256 `eeb3e277ce7f230b2348d396c9646311f5b467729df8365bddad3ff4825fc703` both returned zero findings and `no blocker`.

### 2026-07-24 — Audi RS3 pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 2, medium 1)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Restored the complete Audi TSB 2059240/1 magnetic-ride scope: all 2015-2018 RS3 vehicles plus 2019 VIN sequence `000001-906967`, with the exact range repeated consistently in decision, evidence and public correction copy.
  - `[high]` `[patch]` Replaced every abbreviated 2019 magnetic-ride upper-bound reference with the exact `000001-906967` VIN sequence so the public card does not overstate the bulletin boundary.
  - `[medium]` `[patch]` Removed unrelated drive-system evidence from all three archived carbon/injector rows and replaced it with carefully bounded Audi TSB 2014753/13 diagnostic counter-context that is not represented as proof of the rejected defect claims.
  - Edge review returned zero additional findings on generator SHA-256 `d7e09ddf015c79d5c1ac604a1b69e15a96340d4615577c9cc701f208efe4bb7e`.
  - Final Blind and Edge re-reviews of generator SHA-256 `2766060c893ac7f50ccbc3d386a31ea77853a520e8793f9e6feafcb9163c4df5` both returned `no blocker`.

### 2026-07-24 — Audi TTS pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 6: (high 2, medium 2, low 2)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Removed the non-canonical `2.0 TFSI (CYFB)` engine filter from the published cold-start card so exact runtime matching cannot hide it; CYFB remains an explicit public diagnostic gate.
  - `[high]` `[patch]` Replaced direct exclusive manifest writing with a fsynced same-directory temporary file and atomic create-if-absent hard-link publication so interruption cannot leave a truncated reviewed manifest and concurrency cannot overwrite one.
  - `[medium]` `[patch]` Replaced unrelated maintenance evidence on the Mk2 cam-follower archive with official 2013 TTS CDMA technical data.
  - `[medium]` `[patch]` Replaced the broad timing-drive inference with the exact Audi 2013 TTS timing-belt schedule, which directly contradicts the archived universal timing-chain premise.
  - `[low]` `[patch]` Enumerated the five exact cold-start misfire DTCs rather than rendering them as a numeric range.
  - `[low]` `[patch]` Added the original `8S0 513 353` rear shock-mount gate, replacement `8V0 513 353`, and a defer-to-diagnosis branch for nonmatching magnetic-ride vehicles.
  - The focused re-review of generator SHA-256 `f664c14cc07315e3dcb7da5f365c764041b0117f69c0c1b3c49f004663c9d140` returned `no blocker`.

### 2026-07-24 — Audi SQ7 pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 13: (high 6, medium 3, low 4)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Added explicit three-published/one-archived, zero-commerce and empty-published-trim invariants so the approved SQ7 public split cannot drift or disappear under runtime trim filtering.
  - `[high]` `[patch]` Added Audi TSB 2059363/6's improved-J1135-software-under-development production boundary without implying an owner-installed update or replacing its wiring, recurrence and module branches.
  - `[high]` `[patch]` Added TSB 2074640/1 to the oil record's evidence as well as its citations so every ODIS measurement and log-preservation instruction is traceable.
  - `[high]` `[patch]` Removed manifest regeneration, validated any existing receipt and changed initial manifest creation to atomic exclusive mode, closing the reviewed-manifest overwrite race and requiring a new batch ID for any later revision.
  - `[medium]` `[patch]` Bound approval to the exact Blind and Edge review labels plus the reviewed generator file hash rather than accepting an unqualified approval flag.
  - `[medium]` `[patch]` Added existing-receipt schema, scope, batch, canonical manifest-hash, status and issue/disposition validation before refusing regeneration.
  - `[medium]` `[patch]` Made source-snapshot-to-packet comparison insensitive to JSON object-key order while preserving array order and fail-closed exact content checks.
  - `[low]` `[patch]` Corrected possessive wording in the amended Part 573 and Audi VIN/engine/power-class guidance.
  - `[low]` `[patch]` Documented that the immutable packet exposes priority clicks only at record granularity while exact claim IDs, URLs, claim clicks and record priority totals remain guarded.
  - The focused Edge re-review of generator SHA-256 `f91ac6b43511a3a33aa78c04914d943b2d4556a9eac2d365a71bdb7433628ed8` returned `no blocker`.

### 2026-07-23 — Audi S6 pre-apply review pass

- intent_gap: 0
- bad_spec: 0
- patch: 14: (high 2, medium 10, low 2)
- defer: 3: (medium 3)
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Cleared prose-valued `trims` from all four published records so trim-filtered API requests cannot suppress either diagnosis record or either safety recall; generation, equipment, VIN and production boundaries remain in public prose.
  - `[high]` `[patch]` Added an explicit `--approved-after-review` generation gate, recorded review approval in the manifest and completed a focused independent follow-up review with no blocker.
  - `[medium]` `[patch]` Restored the free 25V900/90TV camera-software remedy, assigned both recall records `nhtsa-verified` provenance and removed non-observable Takata eligibility/no-warning text from symptoms.
  - `[medium]` `[patch]` Disclosed removal of unsupported owner-report/date, cost and mileage metadata in the affected public correction summaries.
  - `[medium]` `[patch]` Generalized the archived C5 transmission record so it no longer asserts unproven engine or ZF 5HP24A fitment.
  - `[medium]` `[patch]` Corrected the official TSB 2075515/1 title and additive-prohibition boundary; reclassified expired Service Action 21F7 as TSB evidence rather than a manual.
  - `[medium]` `[patch]` Added exact per-record claim-ID, raw-link, claim-click and priority-click reconciliation in addition to the 9-claim/13-link/4-click cohort totals.
  - `[medium]` `[patch]` Added immutable source-snapshot/packet provenance to the manifest and made an existing result artifact non-overwritable under every generator flag.
  - `[low]` `[patch]` Added exact packet schema, audit-scope, kind, cohort and packet-ID identity guards.
- deferred_findings:
  - Three pre-existing global receipt/applicator hardening ideas—exact result-body validation, post-commit receipt recovery semantics and preservation of an earlier receipt on idempotent apply—are outside this seven-row database slice. They do not block S6 because direct manifest verification, durable receipt validation and complete-history verification remain mandatory after the one guarded transaction.

### 2026-07-23 — Audi e-tron model-close review pass

- intent_gap: 0
- bad_spec: 2
- patch: 12
- defer: 0
- reject: 3
- addressed_findings:
  - Restored both index-K and index-Q N632 replacement paths from Audi TSB 2067941/3.
  - Made the TSB 2059363/5 legacy trim/year boundaries explicit and restored J1135 replacement when either specified passive/sporadic fault returns a second time.
  - Made the recall-notice-qualified interim 80-percent charge limit explicit, separated early range/performance loss from a smoke/heat/fire emergency, and removed the unsupported generic battery-warning symptom.
  - Added the VIN/connector-diagnosis qualifier to the charge-door title and restored the app-triggered no-preheat symptom/system from TSB 2061788/2.
  - Corrected database-only completion language and superseded the contradictory alphabetical queue text with Audi -> Cadillac -> BMW.
  - Hardened the ignored e-tron generator with exact unique-ID/set checks, pinned source-snapshot and packet-file hashes, exact packet-to-snapshot comparison, and explicit review-regeneration overwrite permission.
  - Corrected snapshot/hash terminology and recorded the source-snapshot file hash, packet-file hash, final active-manifest hashes and review-transition history.
  - Rejected a separate 93V2-owner-notice requirement because the amended Part 573 evidence covers both 93U9 and 93V2 and the public remedy remains VIN/current-notice qualified.
  - Rejected expanding the durable-receipt schema inside this cohort; the existing receipt plus direct and complete-history verification remain the established gate.
  - Rejected treating the two controlled-delta actions as blockers to frozen database-audit completion; neither may be inserted without separate immutable scope and authorization.

### 2026-07-23 — Audi S8 model-close review pass

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

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
- Deployment `dpl_FT1dUgCh49tFSxYfGPyxcpvaxobp` first released the audited data and empty-field safeguards. The corrected design release, commit `e536128` on deployment `dpl_DfRenReYAegqWpcdUYPgSFQNYmyN`, is Ready, explicitly targets Production, and is aliased to `au7o.io` and `www.au7o.io`; CDN and data caches were purged. The 2020-2026 API union exposes exactly 23 published audited records, omits all five archived records, and contains zero commerce/cost/mileage fields. A fresh hydrated production-alias load contains all 23 audited permalinks and update notes, none of the five archived IDs or 26 unique removed URLs (27 original link occurrences), none of the empty-data defects, and the approved warm-paper article/card format. Lincoln Aviator is production-complete; Toyota Camry is next.

**Schema-v2 Toyota Camry production completion (2026-07-20):**

- All 78 records were completed as full-record audits in 16 guarded batches. Reconciliation covers 78/78 records and 235/235 original commerce claims with zero missing, unknown, duplicate, or drifted entries.
- Dispositions are 19 diagnosis holds, eight recall/dealer paths, two no-commerce records, two diagnosis-qualified replacements, and 47 removals/archives. The original 631 outbound link occurrences reduce to two exact, verified Toyota water-pump product pages; all search/category and unsupported commerce is gone.
- Toyota/NHTSA primary evidence supplies exact recall populations/remedies and TSB symptom, production, DTC, test, and coverage gates. Broad complaint aggregations, generic wear cards, mixed-engine parts bundles, duplicate recalls, false bulletin citations, and diagnosis-free component shopping were archived.
- Complete all-manifest verification loads 74 manifests, verifies 67 active exact-after batches, safely supersedes seven fully covered legacy batches, and guards 226 unique issue rows. The fresh live Camry export contains 31 published records, two commerce claims/links, and zero invalid or search links.
- The first production render after the database apply remained at the stale 40-card page. Explicit Vercel CDN and data-cache purges regenerated it from the approved database state. A fresh production-alias browser load now shows exactly 31 cards, omits representative archived records, renders the corrected 21V890 and T-SB-0080-19 content, and retains the approved warm-paper navigation/card treatment on production deployment `dpl_CkY8yRmERMmK6639GAcd664E37zf`. Toyota Camry is production-complete; Toyota RAV4 is next.

**Schema-v2 Toyota RAV4 cohort 1 and SEO gate (2026-07-21):**

- Five of 70 RAV4 records are applied and verified in exact after-state: one recall/dealer record, two archived unsupported parts diagnoses, one diagnosis hold, and one evidence-only no-commerce campaign history. All 11 original commerce claims in the cohort were removed.
- The corrected evidence includes recall 25V595 and its distinct RAV4/PHEV remedies, exact 2006-2008 2AZ oil-consumption inspection/repair/expired-ZE7 gates, and VIN-scoped 2006-2009 LSC 90K history with the actual campaign hose kit and expiration.
- From RAV4 forward, model completion includes rendered title, description, canonical, Open Graph/Twitter, and H1 verification. The supplied Search Console exports contain no RAV4 soft 404 and list only the valid 2015 and 2019 RAV4 year variants in the 1,000-row crawled-not-indexed sample. The concise-title path is allowlisted for RAV4 without changing canonical, robots, sitemap, URL generation, or prior indexed-model metadata.
- The Known Issues header, desktop sidebar and mobile sticky CTA change from `Open Hub`/`Open Vehicle Hub` to `Get Started` at `/get-started`; the separate issue-card vehicle-hub deep link remains intact.

**Schema-v2 Toyota RAV4 cohort 2 (2026-07-21):**

- The next five records are applied and verified in exact production after-state: three archived generic/subjective parts-shopping cards and two published diagnosis holds. Combined RAV4 progress is 10/70 records.
- Toyota T-SB-0065-19 Rev2 narrows the AWD card to its exact 2019 Adventure/Limited torque-vectoring-AWD population, warmed 20-30 mph acceleration / 20-13 mph deceleration buzz or groan, and electro-magnetic clutch assembly repair path.
- Toyota T-SB-0095-20 Rev2 and T-TT-0625-20 narrow the DCM battery-discharge card to specified 2020-2021 RAV4/RAV4 Hybrid vehicles and require battery, symptom and DTC gates. Prime/2019/2022, unsupported hybrid-charging, report-count and universal-parts claims are removed.
- All 13 original commerce claims and 25 outbound occurrences are classified and removed. The five after-states contain zero retail commerce.
- The CTA follow-up is committed as `71e3489` and verified on Production deployment `dpl_9wifU6DKPHEaCssXJTpoyCu9HnZt`: the live DOM contains three `/get-started` CTAs and no old hub CTA, while the warm-paper Known Issues design, SEO metadata and restrained DataRep badges remain intact.

**Schema-v2 Toyota RAV4 cohort 3 (2026-07-21):**

- The next five records are applied and verified in exact production database after-state: two published diagnosis holds, one published evidence-only no-commerce program, one VIN-first recall/dealer path and one archived generic DTC/parts card. Combined RAV4 progress is 15/70 records.
- Toyota T-SB-0027-22 narrows the BSM card to the exact 2021-2022 RAV4 Prime stuck-mirror-indicator condition. Toyota CSP ZKG narrows the paint card to qualifying 2008-2017 RAV4s with original Blizzard Pearl 070 or Super White 040 paint, exterior metal-panel adhesion loss, exclusions and time-limited eligibility.
- Toyota CSP 24TE04 and T-SB-0112-24 Rev1 replace the coolant-valve lawsuit narrative with exact certain 2019-2021 RAV4/RAV4 Hybrid and 2021 RAV4 Prime leak/message/P268111/P268115 gates, coverage limits and updated hose assemblies. Recall 20V682/20TA02 replaces the incorrect initial 20V012 RAV4 attribution and removes unsupported Hybrid, DTC and fixed-cost scope.
- The generic 2006-2018 P0420 card is archived because the code does not identify a failed part and no RAV4-specific evidence supports the old rear-sensor-first or converter mapping. Across the cohort, all nine original commerce claims and 23 outbound search-link occurrences are classified and removed; the approved after-states contain zero retail commerce.
- Production deployment `dpl_GphgQ4kKzbNruxVcB4FEndBrgS3s` is Ready with target Production and the production aliases. After CDN/data-cache purges, cache-busted live HTML shows 64 published cards, all four retained cohort corrections, no archived P0420 card, three `/get-started` CTAs, zero old hub CTAs, canonical/robots preservation and both DataRep badges. The title and H1 agree at 64 known issues.

**Schema-v2 Toyota RAV4 cohort 4 (2026-07-21):**

- The next five records are applied and verified in exact production database after-state: four published diagnosis holds and one archived subjective shopping aggregation. Combined RAV4 progress is 20/70 records.
- Toyota T-SB-0056-09 narrows the belt-drive card to certain pre-production-change 2006-2008 2GR-FE V6 vehicles and a running-engine No. 2 idler-pulley squeak. Toyota T-SB-0156-10 Rev2 narrows the ECM card to 2001-2003 4AT harsh shift/MIL with its five supported DTCs, ECM learning/function test and only then a gated transaxle path.
- Toyota T-SB-0024-20 narrows the Entune card to listed 2016-2018 RAV4/RAV4 Hybrid Denso-Ten faceplate/software versions and exact freeze/reboot/connectivity symptoms. Toyota T-SB-0046-10 replaces the generic 2001-2012 EVAP wear card with the exact 2006-2010 liquid-fuel-in-EVAP DTC/active-test/physical-inspection gates and conditional tank/canister/filter scope.
- The subjective 2013-2024 inadequate-insulation card is archived because its owner discussion and sound-deadening vendor source do not establish a Toyota defect or universal remedy. Across the cohort, all nine original commerce claims and 21 outbound search occurrences are classified and removed; the approved after-states contain zero retail commerce.
- Production deployment `dpl_6nwugK5W8mXZgaLA8ypG7gqgkxhC` is Ready with target Production and aliases `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app`. After CDN/data-cache purges, cache-busted live HTML shows 63 published cards, all four retained cohort corrections, no archived inadequate-insulation card, three `/get-started` CTAs, zero old hub CTAs, the exact canonical, no `noindex`, and both DataRep badges. The title and H1 agree at 63 known issues.

**Schema-v2 Toyota RAV4 cohort 5 (2026-07-21):**

- The next five records are applied and verified in exact production database after-state: two archived unsupported/duplicate records, one published diagnosis hold and two VIN-first recall/dealer Customer Support Program paths. Combined RAV4 progress is 25/70 records.
- The broad 2013-2020 premature front-brake-wear card is archived because complaint and parts-discussion sources do not establish a cross-generation defect or universal repair. Toyota T-SB-0045-16 is a general long-term-storage surface-rust guideline, not the claimed RAV4 warranty bulletin. Revised Toyota SU009-07 narrows the front-suspension knock card to pre-production-change 2006-2007 2AZ-FE/2GR-FE vehicles and its exact spring, bumper, plastic-sheet and alignment procedure.
- The second low-pressure fuel-pump row is archived as a duplicate of the cohort-3 Recall 20V682/20TA02 record, removing its unsupported 2021, Hybrid, DTC and 50,000-report claims. Toyota T-SB-0109-20 Rev1 and CSP 20TE04/20TE05/20TE06 narrow the refueling card to VIN-eligible 2019-2021 RAV4 Hybrid vehicles, an eight-year/100,000-mile coverage gate, a full-tank/Techstream diagnosis and production-specific tank/sender scope; Prime is excluded.
- Toyota CSP 23TE01 retains the HPFP record as dealer-only guidance for 2019-2022 RAV4/RAV4 Hybrid and production/VIN-eligible 2021-2022 RAV4 Prime. Verified pump-origin fuel odor is covered for ten years from date of first use with unlimited mileage. The CSP summary table says 2021 Prime while its referenced T-SB-0008-23 includes 2021-2022 Prime, so the card exposes the VIN/production gate instead of asserting blanket Prime coverage.
- All 15 original commerce claims and 37 outbound search/category-link occurrences are classified and removed. The five approved after-states contain zero retail commerce, current correction metadata, no fixed repair-price or mileage claims, and no unverified owner-report counts. The applicator safety suite passes 25/25; the guarded batch dry-ran from exact before-state, applied transactionally and independently verified all five rows in exact after-state. Complete verification loads 79 manifests, verifies 72 active batches in after-state, safely supersedes seven fully covered legacy batches and guards 251 unique issue rows without drift.
- Production deployment `dpl_G3yxdJUE8bhkLwhSewxNoei75GSP` is Ready with target Production and aliases `au7o.io`, `www.au7o.io` and `autocarecompanion.vercel.app`. After CDN/data-cache purges, cache-busted live HTML shows 61 published cards, all three retained cohort corrections, neither archived cohort record, three `/get-started` CTAs, zero old hub CTAs, the exact canonical, no `noindex`, and both DataRep badges. The title and H1 agree at 61 known issues.

**Schema-v2 Toyota RAV4 cohort 6 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: three unsupported aggregations are archived and two Toyota-bulletin conditions remain as diagnosis holds. Combined RAV4 progress is 30/70 records.
- The 2019-2022 hood/headlamp-seal card is archived because owner modification threads and other-market headlamp protectors do not establish a North American missing-seal defect or hood-flutter remedy. The 2001-2012 blower-resistor card is archived because its forum home page identifies no RAV4 condition and the superficially similar Toyota bulletin applies to Tacoma. Both cards now direct owners to vehicle-specific diagnosis without guessed parts.
- Toyota T-SB-0077-19 Rev1 narrows the hybrid-battery card to specified Japan-built, pre-production-change 2019 RAV4 Hybrid vehicles with an active-test-confirmed cooling-fan flutter/rattle and revised intake duct G92D1-42020. It does not support 2020-2023, Prime, traction-battery failure, debris, warning-light or 12-volt battery/charger claims.
- The 2019-2025 A25A-FXS EGR card is archived because a secondary blog and removal procedure do not establish a common clogging/coolant-leak defect, interval, DTC set or universal six-part repair. Toyota T-SB-0104-21 Rev2 replaces the oil card's owner-UOA gasoline-dilution theory with the exact 2019-2024 RAV4 Hybrid/2021-2024 Prime extreme-cold, short-trip moisture condition, cooling-system pressure-test gate and P05202A/P052477 path; permanent 0W-20 substitution and owner-directed highway treatment are removed.
- All 15 original commerce claims and 39 outbound search/category-link occurrences are classified and removed. The five approved after-states contain zero retail commerce, current correction metadata, no fixed repair-price/mileage/report-count claims, and no unverified preventive-service promises. The applicator safety suite passes 25/25; the permanent five-row manifest verifies in exact after-state. Complete verification loads 80 manifests, verifies 73 active batches, safely supersedes seven fully covered legacy batches and guards 256 unique issue rows without drift.
- Commit `00d7b10` is live on Ready Production deployment `dpl_6bGbP5QyceWP9kRZMK9tXMG352Vj`. After CDN and data-cache purges, cache-busted HTML shows 58 published cards, the new fan and oil titles, none of the three archived titles, three `/get-started` CTAs, zero old hub CTAs, the exact canonical, no `noindex`, both DataRep badges, and matching SEO title/H1 at 58 known issues.

**Schema-v2 Toyota RAV4 cohort 7 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: one Toyota Customer Support Program path remains published and four unsupported aggregations are archived. Combined RAV4 progress is 35/70 records.
- Toyota CSP 22TE09 narrows the HV-cable record to production/VIN-eligible 2019-2022 RAV4 Hybrid AWD and 2021-2022 RAV4 Prime. The exact condition is excessive corrosion at the floor-under-harness/rear-motor-cable connector with AM-radio static, P0AA649/P1C8049, warning messages or possible non-start. Dealer-only coverage is eight years/100,000 miles; sudden shutdown, generic DTCs, $5,000-$7,000, ten-year/unlimited-mile settlement and 30-day-rental claims are removed.
- The rough-road regenerative-brake card is archived because a different 2010 Prius/HS 250h action cannot prove an XA50 RAV4 calibration defect or software remedy. The distinct production-limited 2019 RAV4 Hybrid brake-booster-pump recall 19V544 already has its own later record. The common ignition-coil card is archived because Toyota's P0300-P0304 path is multi-cause and 2009 uses the 2AR-FE, not either engine claimed. Its cylinder-4, replace-all-four and universal coil/plug mapping claims are removed.
- The knock-sensor card is archived because the 2AZ-FE P0325 procedure is a circuit diagnosis while the 2GR-FE uses P0327/P0328/P0332/P0333 and tests the harness, ECM and sensors; its V6 code and cross-engine four-part mappings were wrong. The liftgate card is archived because one owner post cannot establish a five-year defect or 450 reports, and Toyota's manual separates settings, operating conditions, obstruction protection, kick-sensor behavior and post-battery initialization before component diagnosis.
- All 15 original commerce claims and 39 outbound search/category-link occurrences are classified and removed. The one published after-state has zero retail commerce and exact production, symptom, DTC, inspection and coverage gates; the four archived records retain safety-first diagnostic guidance without diagnosis-free parts. The applicator safety suite passes 25/25; the guarded batch dry-ran from exact before-state, applied transactionally and independently verified all five rows in exact after-state. Complete verification loads 81 manifests, verifies 74 active batches, safely supersedes seven fully covered legacy batches and guards 261 unique issue rows without drift.
- Commit `94985cb` is live on Ready Production deployment `dpl_GL5K1nyWKj9Wvr8yunpM8uGQxFqx` with the production aliases. After CDN and data-cache purges, cache-busted HTML shows exactly 54 published RAV4 cards, includes the CSP 22TE09 title, excludes all four archived cohort-7 titles, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, renders both restrained DataRep badges, and has matching SEO title/H1 at 54 known issues.

**Schema-v2 Toyota RAV4 cohort 8 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: two VIN-first safety recalls remain published, one Toyota-bulletin condition remains published with no commerce, and two unsupported mixed aggregations are archived. Combined RAV4 progress is 40/70 records.
- Recall 20V-373/20TA11 narrows the steering-water-ingress card to 46 certain 2019-2020 RAV4 and 2020 RAV4 Hybrid vehicles. Toyota identifies a missing or improperly tightened steering-gear-cover screw and a free dealer replacement of the complete steering gear assembly; the old modify/seal, generic DTC, fixed-cost and retail-rack paths are removed. Recall 23V-865/23TA15 narrows the OCS card to certain 2020-2021 RAV4/RAV4 Hybrid VINs, corrects the cracked-capacitor/short-circuit mechanism and free inspect/replace remedy, removes 2022 and unsupported DTCs, resets the total multi-model recall population from `reportCount`, and removes an unrelated clock-spring recommendation and Lexus LX relationship.
- The combined 2006-2012 EPS assist-loss/motor/corrosion/intermediate-shaft card is archived because one complaint summary does not establish a common defect. Toyota's EPS manual requires code-specific sensor, motor, ECU, voltage and connector diagnosis, while the narrower steering-shaft clunk bulletin already has its own catalog record. The generic 2006-2010 P0101/MAF-contamination card is archived because Toyota's MAF path is a circuit/system diagnosis, the four-cylinder changed to 2AR-FE for 2009 and LSC 90K's V6 oil-hose condition does not establish MAF fouling.
- Toyota T-SB-0014-23 replaces the broad 2013-2024 moonroof-rattle/wind-buffeting DIY aggregation with the exact 2019-2021 RAV4/RAV4 Hybrid and 2021 Prime tilted-open rattle on bumpy roads. The bulletin's glass-removal, adjustment-nut service-kit and grease procedure is retained as qualified-service guidance; generic felt tape, wind-deflector replacement, rear-window and cross-threaded-bolt claims are removed and no part is retailed.
- All 10 original commerce claims and 28 outbound search/category-link occurrences are classified and removed. The three published and two archived after-states contain zero retail commerce, current correction metadata, no fixed repair-price/mileage claims and no recall-population-as-owner-report error. The applicator safety suite passes 25/25; the guarded five-row manifest dry-ran from exact before-state, applied transactionally and independently verifies in exact after-state. Complete verification loads 82 manifests, verifies 75 active batches, safely supersedes seven fully covered legacy batches and guards 266 unique issue rows without drift.
- Commit `3e13592` is live on Ready Production deployment `dpl_31497G6N5zHYgXX99Eq89UbTYH7t` with the production aliases. After CDN and data-cache purges, cache-busted live HTML renders exactly 52 published RAV4 cards, includes the Recall 20V-373 steering, T-SB-0014-23 moonroof and Recall 23V-865 OCS titles, excludes both archived cohort-8 titles, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, and renders both restrained UK/EU DataRep badges. The SEO title and H1 agree at `1997-2025 Toyota RAV4 Problems: 52 Known Issues`.

**Schema-v2 Toyota RAV4 cohort 9 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: one VIN-first safety recall and two qualified no-commerce report/diagnosis cards remain published, while two generic DTC aggregations are archived. Combined RAV4 progress is 45/70 records.
- The P0171/2AZ-FE card is archived because Toyota's fuel-trim procedure requires staged intake, sensor, fuel, exhaust, ignition, wiring and ECM diagnosis and does not establish a common cracked-hose defect or five-part repair. Its 2001-2010 engine scope was also wrong: Toyota identifies the 2.4-liter RAV4 introduction for 2004 and the 2009 four-cylinder as 2AR-FE. The P0174/2GR-FE card is archived because Toyota's procedure does not support three dominant RAV4-specific causes, almost-always paired-bank shortcuts, single-bank sensor conclusions or a fixed-cost repair.
- The panoramic-roof card is narrowed to allegations involving 2021 RAV4 vehicles with the optional panoramic roof. The May 2024 Gamez order let some claims/class allegations proceed past a pleading-stage motion, but did not certify a class, find a defect or determine frequency; no Toyota shattering recall or TSB was confirmed, and T-SB-0014-23 is a separate tilted-open rattle. The 2022-2023 scope, complaint-count, structural-mechanism, coverage, cost, film and glass-shopping claims are removed.
- The old 2016-2021 subjective low-beam/upgrade article is replaced with Toyota/NHTSA Recall 20V-698 (20TA15): 413 certain 2021 RAV4 Prime vehicles may have improperly closed headlamp aiming caps that permit horizontal adjustment and violate FMVSS 108. The VIN-gated remedy is free dealer closure of both caps; bulbs, LED assemblies, auxiliary lighting and broad dim-headlamp claims are removed.
- The door-lock card is retained only as a 2013-2024 pending-allegation and diagnosis record. The March 2026 Mixon order denied pleading-stage motions but did not certify a class or find an actuator defect, mechanism, prevalence, safety consequence or liability; no Toyota recall or door-lock-actuator TSB was confirmed. Toyota XA40 service information requires battery, symptom, ECU-terminal, data-list, active-test and circuit diagnosis before replacement, so the 2025, gear/motor, ejection/theft, default-replacement and cost claims are removed.
- All 10 original commerce claims and 30 outbound search/category-link occurrences are classified and removed. The three published and two archived after-states contain zero retail commerce, no fixed repair-price/mileage claims, current correction metadata and explicit litigation uncertainty. The applicator safety suite passes 25/25; the guarded batch dry-ran from exact before-state, applied transactionally and independently verifies all five rows in exact after-state. Complete verification loads 83 manifests, verifies 76 active batches, safely supersedes seven fully covered legacy batches and guards 271 unique issue rows without drift.
- Commit `24625ad` is live on Ready Production deployment `dpl_8QQTZAPPsvRzMjZmjeMnMhJTr6bt` with the production aliases. After CDN and data-cache purges, cache-busted live HTML renders exactly 50 published RAV4 cards, includes the qualified panoramic-roof, Recall 20V-698 RAV4 Prime headlamp and qualified door-lock titles, excludes both archived lean-code titles, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, and renders both restrained UK/EU DataRep badges. The SEO title and H1 agree at `1997-2025 Toyota RAV4 Problems: 50 Known Issues`.

**Schema-v2 Toyota RAV4 cohort 10 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: four VIN-first safety recalls remain published and one complaint-only phantom-braking aggregation is archived. Combined RAV4 progress is 50/70 records.
- Recall 15V-689/C0M corrects the power-window-switch card to certain 2006-2011 RAV4 VINs, adds 2011, removes engine assumptions and retains the exact inspect/specialized-lubricant-or-circuit-board-replacement remedy. The retail switch bundle and all three search/category links are removed because campaign eligibility and the inspection result determine the repair.
- The 2019-2022 PCS phantom-braking card is archived. Its two secondary sources do not establish a common RAV4 calibration defect, repeated 65-to-0 event, trigger pattern, Toyota software update or dealer remedy. Toyota's owner manual documents PCS operation, limitations, substantial braking and settings, and service information provides PCS request/data diagnosis; the audit found no RAV4-specific Toyota recall/TSB or NHTSA defect investigation supporting the old page.
- Recall 19V-544/K0L is retained for certain 2019 RAV4 Hybrid VINs with an improperly shaped brake-booster-pump brush holder. Toyota's dedicated test determines whether the pump is replaced free; the 6,925 figure is the total multi-model population, not RAV4 reports, and the old outside-recall coverage implication is removed.
- Recall 23V-478/23TA07 is retained for certain 2021-2022 RAV4 Prime VINs and updated from interim to remedy-available status. Toyota now replaces the DC-DC converter with an improved part free of charge. The current primary record does not identify stall, no-start, repeated-dead-12V or warning-light symptoms, so those claims and obsolete cold-charging interim advice are removed. The 43,442 figure is total RAV4 Prime/Lexus population; Toyota lists approximately 41,500 covered Prime vehicles.
- Recall 23V-041/23TA01 is retained for 16,679 certain 2021 RAV4 Prime vehicles. Toyota's exact condition is rapid acceleration after continuous cold-temperature EV-mode driving while battery voltage falls, which can display a warning, shut down the hybrid system and cause loss of motive power. The VIN-gated remedy is free HEV-ECU software reprogramming, not ECU replacement.
- The one original commerce claim and all three outbound search/category-link occurrences are removed. The four published recall cards and one archived card contain zero retail commerce, current correction metadata, VIN gates, exact remedies and no fixed repair-price/mileage claims. The applicator safety suite passes 25/25; the guarded batch dry-ran from exact before-state, applied transactionally and independently verifies all five rows in exact after-state. Complete verification loads 84 manifests, verifies 77 active batches, safely supersedes seven fully covered legacy batches and guards 276 unique issue rows without drift.
- Commit `2835f79` is live on Ready Production deployment `dpl_8rcmhXo19tvCDQNUCgVLn7mwnUqa` with the production aliases. After CDN and data-cache purges, cache-busted HTML shows exactly 49 published RAV4 cards, all four corrected cohort-10 recall titles, no archived phantom-braking title, three `/get-started` CTAs, zero old hub CTAs, the exact canonical without `noindex`, both restrained UK/EU DataRep badges, and matching SEO title/H1 at 49 known issues.

**Schema-v2 Toyota RAV4 cohort 11 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: two Toyota service-bulletin conditions and two VIN-first safety recalls remain published, while one unsupported multi-generation structural-corrosion aggregation is archived. Combined RAV4 progress is 55/70 records.
- The rear-differential card now uses Toyota T-SB-0022-22 Rev1 because T-SB-0009-20 was declared obsolete the next day. The current bulletin is limited to some 2019-2020 Adventure/Limited Dynamic Torque Vectoring AWD vehicles, supplies VIN/rear-carrier production gates and uses ChassisEAR plus Techstream data to distinguish front-transfer and rear-carrier failures. Carrier replacement and 4WD-ECU reflash are diagnosis-gated; Sport-mode switching is only a test aid and the original 60-month/60,000-mile warranty is generally expired. Two generic fluid/gasket shopping claims are removed.
- The 1997 and 1999-2018 subframe/front-cradle card is archived because a third-party complaint aggregator mislabeled as NHTSA cannot establish one coating defect, population or separation mechanism across four generations, and the unexplained 1998 omission further defeats the scope. Structural-corrosion safety guidance is preserved separately from Toyota's exact rear-arm recall.
- The rear-arm card uses the current superseding Recall 16V-596/G0V remedy rather than stopping at 12V-373/C0J or 13V-383/CSJ. G0V covers the still-affected subset of TMC-built 2006-2010 vehicles produced October 2005-August 2010 and TMMC-built 2009-early-2011 vehicles produced October 2008-September 2010. Because prior inspections missed corrosion and post-remedy separations continued, eligible vehicles whose two arms were not already replaced receive both rear lower Suspension Arm No.1 assemblies, alignment, epoxy and labels free. Two retail undercoating/arm claims are removed.
- The unsupported rear wheel-hub card is corrected to Toyota T-SB-0080-13 Rev1: a rear differential coupling growl from front-bearing contamination on some VIN-gated 2006-2012 RAV4 4WD vehicles. The noise must localize to the coupling before inspection and conditional rebuild-or-replacement. Warranty Enhancement ZF4's April 2017/nine-years-from-first-use coverage is expired; wheel-hub prevalence, ABS-sensor, paired-failure and automatic replacement claims are removed.
- Recall 23V-734/23TA13 is retained for approximately 1.854 million certain 2013-2018 RAV4s. Toyota's exact mechanism is that some specified SAE Group 35 replacement batteries have smaller top dimensions; if a small-top battery is installed and the clamp is not tightened correctly, forceful turns can permit positive-terminal/clamp contact and a fire-risk short. The free improved hold-down clamp, tray and positive cover replace the false oversized-tray explanation, and current status is VIN-first. Secondary citations are replaced with Toyota/NHTSA primary evidence.
- All four original commerce claims and four outbound search links are removed. The four published and one archived after-states contain zero retail commerce, current correction metadata, exact gates, no fixed repair-price/mileage claims and explicit expired-coverage language. The applicator and coverage suite passes 25/25 and the supplementary candidate helper passes 3/3; the guarded batch dry-ran from exact before-state, applied transactionally and verifies all five rows in exact after-state. Complete verification loads 85 manifests, verifies 78 active batches, safely supersedes seven fully covered legacy batches and guards 281 unique issue rows without drift.
- Commit `0dbf401` is live on Ready Production deployment `dpl_BmPDdd5CUsangfhNPBvN37fw1PrZ` with the production aliases. After explicit CDN and data-cache purges, cache-busted HTML shows exactly 48 published RAV4 cards, includes all four cohort-11 published titles, excludes the archived broad subframe-rust title, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, renders both restrained UK/EU DataRep badges and preserves the warm-paper known-issues design. The SEO title and H1 agree at `2001-2025 Toyota RAV4 Problems: 48 Known Issues`.

**Schema-v2 Toyota RAV4 cohort 12 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: Toyota's roof-rail CSP, spiral-cable recall, back-door reinforcement-weld bulletin and steering-noise bulletin remain published, while the unsupported model-wide soy-wiring rodent-attraction claim is archived. Combined RAV4 progress is 60/70 records.
- The 2012-2020 soy-wiring card is archived because the Heber appellate memorandum evaluates litigation allegations at the pleading stage, not a technical defect, affected RAV4 population or frequency. No Toyota RAV4 campaign or bulletin supports the nine-year attraction claim. Circuit-specific rodent-damage and hybrid high-voltage safety guidance is preserved; the Honda 4019-2317 tape claim and three retail searches are removed.
- Toyota CSP 22TE05/T-SB-0016-23 replaces the lawsuit-led roof-rail/electronics-short narrative. Coverage is limited to certain 2019-2021 RAV4/RAV4 Hybrid and certain 2021 RAV4 Prime vehicles with a verified mounting-clip seal leak, subject to production-effective VINs and dealer-only coverage for ten years from first use regardless of mileage. Toyota requires source confirmation, rail-configuration-specific parts, shower testing and water-damage/organic-growth inspection. Six campaign-parts bundles and eighteen search/category links are removed.
- The broad 2001-2005 spare-carrier/hinge-sag card is corrected rather than archived because Toyota NV005-04 Revised documents a narrower pre-production-change 2001-2002 back-door rattle. Its repair plug-welds four spare-tire mounting-reinforcement spot-weld locations after diagnosis; it does not establish five years of hinge sag, latch misalignment, structural cracking or water leakage. The expired 36-month/36,000-mile warranty is explicit, and two unrelated silicone/primer shopping claims are removed.
- NHTSA Recall 14V-168/Toyota E0M replaces the 2006-2012 clock-spring aggregation. The exact population is certain 2006-2008 RAV4s built late July 2005-early August 2008 with seven-channel spiral cables. Internal FFC/retainer wear can interrupt the driver-airbag circuit, illuminate the SRS lamp and deactivate the driver's frontal airbag; eligible incomplete VINs receive an improved assembly free. Unsupported 2009-2012, horn/control, DTC and mileage claims are removed.
- Toyota T-TT-0255-13/T-SB-0318-08 narrows the steering clunk/pop/knock card to some 2006-2008 RAV4s and requires bulletin VIN plus steering-gear date-code checks. The old card incorrectly cited ST001-07; Rev1 superseded ST001-08 and removed Steering Intermediate Shaft No.2 replacement. The card now requires localization and current service-part selection, states that original warranty coverage is expired, and removes two unrelated sway-link/penetrating-oil retail claims.
- Across cohort 12, all 11 original commerce claims and all 25 outbound search/category-link occurrences are removed. The four published and one archived after-states contain zero retail commerce and current correction metadata. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3. The guarded manifest dry-ran with all five rows in exact before-state, applied once transactionally, independently verifies in exact after-state and finishes with an after-state no-op dry-run. Complete verification loads 86 manifests, verifies 79 active batches, safely supersedes seven fully covered legacy batches and guards 286 unique issue rows without drift. Manifest file SHA-256: `f45c52db563505e04c8029f63a15cf2f6e6ac1f85cd3743eade555d955f39886`; canonical result-manifest hash: `e141f92e613f04404673d1e83aee09661ba4a95b853fa1beb84af31686770d15`.
- Commit `1c89ae0` is live on Ready Production deployment `dpl_2MQuEffrcK2oVvPaNgM9nP2Ny6Sy` with the production aliases. After CDN and data-cache purges, cache-busted HTML shows exactly 47 published RAV4 cards, includes all four cohort-12 published titles, excludes the archived soy-wiring title, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, renders both restrained UK/EU DataRep badges and preserves the approved warm-paper palette. The SEO title and H1 agree at `2001-2025 Toyota RAV4 Problems: 47 Known Issues`.

**Schema-v2 Toyota RAV4 cohort 13 (2026-07-22):**

- The next five records are applied and verified in exact production database after-state: two VIN-first recall/dealer paths and three Toyota-bulletin diagnosis holds remain published. Combined RAV4 progress is 65/70 records.
- The accelerator card now separates two distinct recalls. NHTSA 11V-113/Toyota 90L covers 2006 through certain 2010 RAV4s for incompatible or unsecured floor-mat pedal entrapment; the earlier 09V-388 number did not directly identify the added RAV4 population. NHTSA 10V-017/Toyota A0A separately covers certain 2009-2010 RAV4s with affected CTS accelerator pedals. Exact remedies, dual VIN checks and official stopping instructions replace complaint rankings, electronic-surge framing and Wikipedia sourcing.
- Toyota T-SB-0068-10 narrows the visor card to certain pre-production-change 2006-2010 vehicles whose roof/headliner mounting area is damaged and requires reinforcement supports/brackets. It does not establish the old 2011-2014 scope or an internal-pivot defect. The revised card separates a loose mounting base from a blade that droops on its pivot and removes unsupported prevalence, fixed-cost and glue/hook-and-loop advice.
- NHTSA 20V-286/Toyota 20TA08 remains published for VIN-eligible 2019-2020 RAV4/RAV4 Hybrid vehicles assembled with potentially affected front lower arms in the September-October 2019 production windows. Toyota identifies no dependable advance warning and replaces both front lower arms free. The 9,502 total recall population is removed from `reportCount`, and two unrelated strut/alignment shopping claims are deleted.
- Current Toyota T-SB-0023-15 Rev2 limits flex-lock shudder to pre-production-change 2013-2015 2AR-FE vehicles and requires confirmation of the brief light-load 25-50 mph condition followed by torque-converter R&R and ECM reprogramming as one procedure. The 60-month/60,000-mile warranty and ZH1's eight-year/150,000-mile secondary coverage are expired. Unsupported DTC, fixed-cost and fluid-exchange claims plus three retail parts claims and nine links are removed.
- Toyota T-SB-0107-19 Rev1 narrows the second hesitation card to some 2019 gasoline RAV4s at 6 mph or below, immediately after a 3-to-1 downshift and below 40-percent accelerator input. The remedy updates the existing ECM and completes prescribed adaptation drive patterns; it is not a 2019-2023 CVT magnetic-clutch defect. The 96-month/80,000-mile emissions warranty remains VIN/in-service-date dependent, and two CVT claims with two search links are removed.
- Across cohort 13, all seven original commerce claims and all 13 outbound search/category-link occurrences are removed. All five published after-states contain zero retail commerce, current correction metadata and exact scope/diagnosis/remedy gates. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3. The guarded manifest dry-ran in exact before-state, applied once transactionally, independently verifies in exact after-state, finishes with an after-state no-op dry-run and verifies again after the result receipt was written. Complete verification loads 87 manifests, verifies 80 active batches, safely supersedes seven fully covered legacy batches and guards 291 unique issue rows without drift. Manifest file SHA-256: `bb1b146ef8aaa262bb93ecc912045864519b4ebd87faeb68dc8265733d1da2f8`; canonical result-manifest hash: `27732dde535a6fcf948e396070429d47b00c6cfa50c991365e7e377c4d56dcad`.

- Commit `34129914b50a458b14ca7d4ec4c3685196d82d60` is live on Ready Production deployment `dpl_7wgiCZMU21P1SUv41MrSMwD2tz4U` with the production aliases. After CDN and data-cache purges, cache-busted HTML shows exactly 47 published RAV4 cards and all five cohort-13 titles, exposes three `/get-started` CTAs and zero old hub CTAs, uses the exact canonical without `noindex`, renders both restrained UK/EU DataRep badges and preserves the approved `#F7F4EC`/`#FBFAF6`/`#E3DFD4` warm-paper treatment. The SEO title and H1 agree at `2001-2025 Toyota RAV4 Problems: 47 Known Issues`.

**Schema-v2 Toyota RAV4 cohort 14 and production-database completion (2026-07-22):**

- The final five frozen records are applied and verified in exact production database after-state. The Toyota water-pump diagnostic record remains published and four unsupported broad aggregations are archived. RAV4 coverage is complete at 70/70 unique records across 14 packets and 14 guarded manifests, including the final live Production render gate.
- The 2019-2024 front-seat comfort card is archived because two forum discussions do not establish a model-wide defect, repeatable onset, height-defined population, frequency or universal cushion/seat-jacker remedy. Toyota's equipment-dependent manual and power-seat adjustments are retained as owner guidance without structural-modification advice.
- The 2001-2010 upstream A/F-sensor card is archived because Toyota's engine- and code-specific procedures require freeze-frame, circuit and active-test diagnosis. T-SB-0001-10 Rev1 is a narrow 2GR-FE DTC pattern, P2195 has multiple causes, P0125 is a coolant-temperature diagnostic, and the two old part numbers covered only a fraction of the stated population. Both parts claims and six links are removed.
- Current Toyota T-SB-0103-20 Rev1 replaces the generic common water-pump-failure narrative with non-electric-pump leak inspection. Dry residue does not by itself require replacement; fresh wet residue/drips and the applicable repair-manual mechanical checks determine action. Timing-chain drive/preventive service, thermostat bundling, 80,000-120,000-mile, unrelated cam-timing DTC, fixed-cost and 720-report claims are removed.
- The uncited 2019-2023 generic wind-noise card is archived. Toyota T-SB-0079-20 Rev1 documents a different 2019-2021 outer-mirror image-vibration condition, not a common cabin sealing defect. Weatherstrip, adhesive, deflector, sound-deadening, cost and 680-report claims are removed.
- The 2019-2021 spontaneous-windshield-cracking card is archived because an attorney investigation page and forum reports do not establish a Toyota/NHTSA defect, frequency, no-impact causation, blanket warranty denial, cost or OEM-glass recurrence benefit. Toyota's actual safety guidance remains: replace damaged glass with the VIN/equipment-correct specification and recalibrate the forward camera afterward. Five glass/camera/bracket claims and 15 links are removed.
- Cohort 14 removes all 10 original commerce claims and all 24 outbound occurrences. The 25 applicator/coverage tests and three candidate tests pass (28/28). Exact-before dry-run, single five-row transaction, exact-after verification, after-state no-op dry-run, complete verification and post-receipt re-verification all pass. Complete verification loads 88 manifests, verifies 81 active batches, safely supersedes seven fully covered legacy batches and guards 296 unique issue rows without drift. Manifest file SHA-256: `9ed06f71f9ccaf8cdb367b205d431ac4c7fed9de4f209e6bd941ff263540de2f`; canonical result-manifest hash: `aa43a1708b496ace721dc0743328650c98d0d973077d79029d93b066b09519b6`.
- Final RAV4 reconciliation is exact: 70 packet records, 70 unique manifest rows and zero missing, duplicate or unclassified records. The 140 original commerce claims and 340 outbound occurrences are all classified and removed; the approved 43 published and 27 archived after-states contain zero commerce. Final dispositions are 20 diagnosis holds, five no-commerce records, 18 recall/dealer paths and 27 removals.
- Commit `76a1e160b11b5290e66784eff048be2628e915ac` is live on Ready Production deployment `dpl_4sf6CkkwntTpMdw9DKHhB3SB5BVa` with all production aliases. After CDN and data-cache purges, cache-busted HTML shows exactly 43 published RAV4 cards, the corrected `2013-2023 RAV4 Non-Electric Water-Pump Leak Inspection - T-SB-0103-20 Rev1` title, and none of the four archived cohort-14 titles. The title and H1 agree at `2001-2025 Toyota RAV4 Problems: 43 Known Issues`; the exact canonical remains indexable, all three rendered CTAs use `/get-started`, no old hub CTA is present, both restrained DataRep badges render, and the approved warm-paper palette remains intact.
- The final closing checkpoint is exact HEAD `0efb2a95c01307351565c6ab247f1c44d41a7955` on Ready Production deployment `dpl_77N4FZWG2oaTNz8vRokzeHwmHy4d` with the production aliases. CDN and data caches were purged. A fresh cache-busted render still shows the exact 43-card after-state, corrected final water-pump title, aligned SEO title/H1/canonical with no `noindex`, three `/get-started` CTAs and no old hub CTA, restrained DataRep badges and the approved warm-paper palette.

**Schema-v2 Toyota Corolla Cross cohort 1 (2026-07-22):**

- The latest Search Console coverage workbooks place the Corolla Cross base and year Known Issues routes at the head of measured traffic among the remaining Toyota candidates. The frozen Corolla Cross inventory contains 23 unique records across five packets; this guarded five-record batch brings model progress to 5/23.
- The uncited A/C cycling card is archived because it combined gasoline-clutch and hybrid-electric compressor theories without Corolla Cross diagnostic evidence, assigned unsupported B1479/P0533 codes and recommended a coolant-flush kit and thermostat unrelated to the refrigerant circuit. Both commerce claims and two generated search links are removed.
- NHTSA recall 26V-203 and Toyota 26TB08/26TA08 replace the reverse-pedestrian-alert narrative with an exact VIN-first path for 73,528 certain 2023-2025 Corolla Cross Hybrid vehicles. The front speaker's forward calibration can leave reverse sound below FMVSS 141 after body attenuation. Toyota provides a free dealer software update; the recall population is not an owner-report count and ordinary warranty wording is removed.
- The 2022-2023 gasoline Stop & Start card remains a diagnosis hold. Replicated complaint records describe failures to restart, sometimes with wiper/rain context and engine-stopped or low-steering-power messages, but do not establish prevalence, wiper causation, a Toyota-confirmed component or a universal repair. Toyota warning and quick-reference guidance now controls the safe response; DTC, freeze-frame, 12-volt and event evidence must be preserved, and the cancel switch is not represented as a repair.
- The BSM card remains an equipment-gated diagnosis hold. Toyota documents fixed-object detection limits, rear-bumper contamination and persistent-warning/impact inspection requirements, not a common sensor defect or universal reprogram. Both undiagnosed sensor claims and six search/category links are removed because VIN, side, supersession, mounting condition and radar-axis calibration must be established first.
- The 2022-2026 CVT hesitation card is archived because it conflated the gasoline Direct Shift-CVT and hybrid eCVT, asserted an uncited Toyota software update and attached generic P0700/P0730/P0868, cost, fluid and filter claims without a model-specific procedure. Both commerce claims and two generated searches are removed; abnormal response now requires powertrain identification and configuration-specific evidence.
- Cohort 1 ends with three published and two archived records. All six original commerce claims and all 10 outbound occurrences are removed, leaving zero cohort commerce. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Exact-before dry-run, one five-row transaction, exact-after verification, after-state no-op dry-run and post-receipt verification all pass. Complete verification loads 89 manifests, verifies 82 active batches, safely supersedes seven fully covered legacy batches and guards 301 issue rows without drift.
- Snapshot SHA-256: `d6c29c41ff3837991a7d0694f012ae7314d7a59554a280c113013f1b5f8f48f2`. Manifest file SHA-256: `f59e50710d4cc3c504b5f354838082408adc913f63ff20a4e8780917a2b6a43c`. Canonical parsed-manifest/result hash: `f7ca0a7dc56535e71989ef41c48c386ca58fa8b143a56a223ae02534f181e815`. Durable result-receipt file SHA-256: `44bd98cdc896e3c47223423a4273cc09afe9d5a35eb39571c94adb0c1121efc0`.
- Commit `96747735cf78d212016451c1ef1eb2c50442927d` is live on Ready Production deployment `dpl_5DPWwFJnvbfJz9NAnHKic2kfosGq` with the production aliases. After CDN and data-cache purges, cache-busted production HTML shows exactly 21 Corolla Cross cards; all three published cohort-1 titles are present and both archived titles are absent. The SEO title and H1 agree at `2022-2026 Toyota Corolla Cross Problems: 21 Issues Every Owner Should Know`; the exact canonical remains indexable with no `noindex`. The hydrated page has three rendered `/get-started` links from six source-string occurrences, zero `Open Hub`, both restrained UK/EU DataRep assets and the approved warm palette.

**Schema-v2 Toyota Corolla Cross cohort 2 (2026-07-22):**

- The next five frozen records are applied and verified in exact production database after-state. Two VIN-first airbag recall paths remain published and three unsupported symptom/comfort aggregations are archived. Combined Corolla Cross progress is 10/23 records across the first two of five packets; the first 10 after-states contain five published and five archived records.
- The second CVT record is archived because it had no Corolla Cross citation for a common 15-30 mph shudder, belt-slip transition, cold-weather pattern or Toyota software remedy. It again conflated the gasoline Direct Shift-CVT and hybrid eCVT and attached unsupported P0741/P2757, 30,000-mile fluid, cost and replacement claims. Both fluid/filter searches are removed.
- NHTSA 23V-480/Toyota 23TA08 remains published for certain 2023 Corolla Cross and Corolla Cross Hybrid VINs whose spiral-cable flexible flat cable may have an insufficient weld. NHTSA 25V-040/Toyota 25TA02 adds a required reinspection for certain vehicles potentially inspected incorrectly under 23V-480 because manual characters were mis-entered or inspection evidence could not be confirmed. Both campaigns now direct a free current-process inspection and necessary spiral-cable replacement; unsupported horn/switch symptoms are removed.
- The cabin-road-noise record is archived because two forum threads do not establish prevalence, gas-versus-hybrid frequency, minimal-insulation or tire causation, dealer behavior, fixed costs or a universal sound-deadening/touring-tire remedy. Safe vehicle-specific tire, wheel, bearing, suspension and body-NVH checks replace invasive modification advice.
- The front-brake-squeal record is archived because forum reports do not establish its four-year scope, listed causes, dealer procedure, warranty remedy or universal parts. Toyota T-SB-0043-24 is a Tundra/Tundra Hybrid and Sequoia Hybrid bulletin, not Corolla Cross. The grease, slide-pin grease and pad claims plus all nine search/category links are removed; persistent noise now requires physical diagnosis.
- NHTSA 23V-384/Toyota 23TA04 remains published for 96,007 certain 2022-2023 gasoline Corolla Cross vehicles whose panel may lack the milled passenger-airbag perforation. NHTSA 23V-864/Toyota 23TA16 requires reinspection of 12,575 previously inspected vehicles because the original process may have missed affected panels. Both numbers are campaign populations, not owner reports. VIN lookup, free inspection/reinspection and necessary panel replacement now control, with Toyota's no-front-passenger advice preserved until an included vehicle is complete.
- Cohort 2 removes all five original commerce claims and all 11 outbound occurrences. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Exact-before dry-run, one five-row transaction, exact-after verification, after-state no-op dry-run, complete verification and post-receipt verification all pass. Complete verification loads 90 manifests, verifies 83 active batches, safely supersedes seven fully covered legacy batches and guards 306 issue rows without drift.
- Manifest file SHA-256: `dc35d76df09d1e5667c40c42e23724498af45a08962bd9151eb99c7c731302b0`. Canonical parsed-manifest/result hash: `6f4a9a3a9698d5b8fd69a471b02269acddf321b4dae6f2452a9a90e6769adfc5`. Durable result-receipt file SHA-256: `88f11fac462881dffa36c1119cf8560ad3002bae0d04b3f416d778c3645104ce`.
- Commit `4ab68b1af741a5202645687668efbb4e0ec259f9` is live on Ready Production deployment `dpl_AUrJAT6UfPBw9NL4NbKGAKJg9P1k`, targets Production and carries the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted HTML renders exactly 18 Corolla Cross cards. Both cohort-2 recall titles are present and all three archived cohort-2 titles are absent. The SEO title and H1 agree at `2022-2026 Toyota Corolla Cross Problems: 18 Issues Every Owner Should Know`; the exact canonical remains indexable with no `noindex`. `/get-started` is present, `Open Hub` is absent, both restrained UK/EU DataRep assets render, and the approved warm palette remains intact.

**Schema-v2 Toyota Corolla Cross cohort 3 (2026-07-23):**

- The third frozen five-record packet is applied and verified in exact database after-state. The 2023-2024 hybrid brake recall and a tightly scoped 2023-2025 Toyota Multimedia diagnosis card remain published; three unsupported fuel-gauge, hybrid-12V-drain and heat-shield-rattle aggregations are archived. Combined Corolla Cross progress is 15/23 records across the first three of five packets, with seven published and eight archived among the completed records.
- The fuel-gauge card is archived because forum observations do not establish a recurring sender defect, one gas-and-hybrid mechanism, a combination-meter update, self-correction after fill cycles, integrated pump/sender replacement, warranty coverage or fixed cost. Fuel accepted at one fill does not measure total tank capacity unless remaining fuel is known. Revised guidance uses repeated measured fills and separates indication/sender diagnosis from premature nozzle shutoff and tank venting.
- The alleged hybrid parasitic-drain card is archived. Toyota T-SB-0104-22 and T-SB-0025-23 Rev1 describe dealer-inventory/storage battery maintenance and general storage, temperature, state-of-charge and parasitic-load effects; they do not establish a normal few-day in-service Corolla Cross Hybrid failure or prove EVAP, DCM and smart-key causation. The universal H4/LN1 battery claim and all three searches are removed; an actual no-READY event requires manual-compliant jump points, battery capacity/state testing and sleep-current circuit diagnosis before VIN-specific battery selection.
- NHTSA 24V-708/Toyota 24TA11 remains published for 42,199 certain 2023-2024 Corolla Cross Hybrid vehicles in the original campaign population. Specific brake-actuator/skid-control ECU software can temporarily produce a hard pedal and reduced brake force during some cornering brake applications, increasing stopping distance. VIN eligibility controls and Toyota's free skid-control ECU software update is the remedy; the campaign population remains separate from owner reports.
- The infotainment card becomes a diagnosis hold limited to 2023-2025 vehicles equipped with 21MM/Toyota Multimedia. Toyota T-TT-0779-25 requires prompt Multimedia Recorder capture for CarPlay, Android Auto, Bluetooth, reboot, screen and connectivity concerns. T-SB-0015-24 separately gates a Panasonic update to qualifying 2023 units below version 2050 and forbids installing version 2060 on a 2050 unit. The fake 2022 Reddit citation, 2026 scope, backup-camera generalization, fixed cost and generic BlueDriver search are removed.
- The heat-shield card is archived because two owner discussions do not establish a common defect, fixed speed/load pattern, plastic-retainer cause, dealer/warranty pattern or universal shield/washer repair. One cited case involved trapped debris, and gas, hybrid, FWD and AWD layouts differ. Both undiagnosed shield claims and all six searches are removed; safe guidance requires cool-lift inspection and localization before any VIN/drivetrain/position-specific part.
- Cohort 3 removes all four original commerce claims and all 10 outbound occurrences. Cumulatively, the first 15 records remove all 15 original commerce claims and all 31 outbound occurrences. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Exact-before dry-run, one five-row transaction, exact-after verification, after-state no-op dry-run, complete verification and post-receipt verification all pass. Complete verification loads 91 manifests, verifies 84 active batches, safely supersedes seven fully covered legacy batches and guards 311 issue rows without drift.
- Manifest file SHA-256: `bb094ce53047d704e150a4e9c0c6a1842f709826372b72a41be3500876345b4d`. Canonical parsed-manifest/result hash: `4f635c4068f17a7f7b28858ed37c67f4ae0adf6837bfa8cd6193231ded216773`. Durable result-receipt file SHA-256: `705e4b33d4404e83a4f4cfb9336d8ae198ddfaeddf0edd395b08d4c33178f278`.
- Commit `8808e8319699e26d1bfb52f80239c501a9e64bde` is live on Ready Production deployment `dpl_DLtvayLB3qsnZUpVpigz8XNKAdPN` with the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly 15 Corolla Cross cards. `2023-2024 Corolla Cross Hybrid Temporary Hard Brake Pedal - Recall 24V-708` and `2023-2025 Corolla Cross Toyota Multimedia Connectivity or Reboot Concerns - Diagnosis Required` are present; the archived fuel-gauge, hybrid-12V-drain and heat-shield-rattle titles are absent. The title and H1 agree at `2022-2025 Toyota Corolla Cross Problems: 15 Issues Every Owner Should Know`; the exact canonical remains indexable with no `noindex`. `/get-started` is present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved warm palette remains intact.

**Schema-v2 Toyota Corolla Cross cohort 4 (2026-07-23):**

- The fourth frozen five-record packet is applied and verified in exact database after-state. Toyota special service campaign 25TC03 remains published as a VIN-first dealer path; four unsupported hardware, liftgate, suspension and USB aggregations are archived. Combined Corolla Cross progress is 20/23 records across the first four of five packets, with eight published and 12 archived among the completed records.
- The permanent-head-unit-blackout card is archived. Toyota T-SB-0015-24 applies only to qualifying 2023 Panasonic units below software version 2050 and documents reboot/software conditions, while T-TT-0779-25 requires prompt Multimedia Recorder capture for supported 2023-2025 concerns. Neither establishes a permanent hardware defect, 2022 scope, USB-failure signature, universal head-unit replacement, fixed cost or blanket warranty. The row also overlaps the retained cohort-3 multimedia diagnosis card and now points to it.
- The power-liftgate card is archived because equipment varies: Toyota's 2022 release lists the power liftgate in the XLE Convenience Package, and the owner manual documents enable/disable settings plus ice, load, spindle and sensor cautions. No Corolla Cross liftgate defect or software bulletin supports the claimed post-service causation, battery reset/reflash, universal motor/strut/module remedy, cost or warranty promise; recall 24TA11 is a brake-ECU campaign, not a liftgate update.
- Toyota 25TC03 remains published for certain 2023 Corolla Cross and Corolla Cross Hybrid vehicles. A rare software condition can damage the forward-recognition camera, leaving PCS unavailable at the next start with warning lights, chimes and a message. VIN eligibility controls; Toyota's free remedy is software version 02.02 and, if required, forward-recognition-camera replacement. Toyota directs dealers to complete 23TC01 first when applicable. The approximate 58,600 gas and 13,000 hybrid campaign populations are not owner-report counts.
- The rear-suspension-clunk aggregation is archived because Corolla Cross rear architecture varies among FWD torsion-beam, gas-AWD independent/multi-link and hybrid sport-tuned double-wishbone/multi-link configurations. No Corolla Cross campaign or bulletin establishes the asserted common defect, root cause or universal shock, stabilizer-link or torsion-beam remedy. The rear-USB card is also archived: Toyota's grade descriptions place rear ports only on equipped grades and vary by year, and no authoritative evidence supports the claimed fuse number/rating, module diagnosis, mileage, prevalence, fixed cost or blanket warranty.
- Cohort 4 removes all nine original commerce claims and all 15 outbound occurrences. Cumulatively, the first 20 records remove all 24 original commerce claims and all 46 outbound occurrences. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Exact-before dry-run, one five-row transaction, exact-after verification, after-state no-op dry-run, complete verification and post-receipt re-verification all pass. Complete verification loads 92 manifests, verifies 85 active batches, safely supersedes seven fully covered legacy batches and guards 316 issue rows without drift.
- Snapshot SHA-256: `d6c29c41ff3837991a7d0694f012ae7314d7a59554a280c113013f1b5f8f48f2`. Manifest file SHA-256: `356e96dce9643d198404939aac5068f33281b659d052aba155f968c11cda3405`. Canonical parsed-manifest/result hash: `126d2af2802704657c41331208c441b2ae24ab6a64c34207a1310f3f28e81855`. Durable result-receipt file SHA-256: `6d26ce3d8541ee1cf702c6c7e4bf9a9f9215aa2392bafbb7134126fd34ea66da`.
- Commit `f91f4acd7d2a512d5240253714894001070dc7a0` is live on Ready Production deployment `dpl_59RYBth6X5GsdUeEoT6suvz1Kh1f` with the production aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly 11 Corolla Cross cards. `2023 Corolla Cross PCS Forward-Camera Software - Campaign 25TC03` is present; the permanent-multimedia-blackout, power-liftgate, rear-suspension-clunk and rear-USB archived titles are absent. The title and H1 agree at `2022-2025 Toyota Corolla Cross Problems: 11 Issues Every Owner Should Know`; the exact canonical remains indexable with no `noindex`. `/get-started` is present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved warm palette remains intact.

**Schema-v2 Toyota Corolla Cross cohort 5 and model completion (2026-07-23):**

- The final frozen three-record packet is applied and verified in exact database after-state. All three complaint-style body/glass aggregations are archived because the available sources do not establish a Corolla Cross defect, affected population, universal component or promised warranty outcome. Final model reconciliation is exact at 23 packet records and 23 unique manifest rows with zero missing, extra, duplicate or unclassified records. The final after-state contains eight published and 15 archived records: three diagnosis holds, five VIN-first recall/dealer paths and 15 removals.
- The roof-rail whistle card is archived. Toyota's official equipment descriptions show different year/grade boundaries: 2022 gas LE/XLE and 2023 hybrid SE/XSE receive roof rails, while the two owner threads do not establish a 2022-2025 defect, common left-front location, speed/weather pattern, warranty rail replacement, universal molding 75556-0A020 cause or WeatherTech deflector remedy. Both parts/accessory claims and all six search links are removed.
- The door-seal wind-noise card is archived because its sole third-party video does not establish thin Corolla Cross seals, factory door misalignment, driver-side prevalence, a striker-adjustment procedure, replacement-seal pricing, supplemental D-shaped tape or mirror deflectors. No Corolla Cross Toyota campaign or wind-noise bulletin supporting those claims was located. The Dorman seal and 3M adhesive recommendations and both links are removed; revised guidance requires source localization and measured body/seal inspection before adjustment or parts.
- The windshield stress-crack card is archived because it has no citation for 185 reports, a four-year defect population, manufacturing-stress/body-flex cause, edge-origin pattern, repeated replacement, fixed cost, 12-month goodwill outcome or recurrence claim. Toyota's owner manual says damaged/cracked glass must be replaced and the forward camera recalibrated afterward; it does not diagnose why the glass cracked. The unrelated BlueDriver scanner and Haynes-manual recommendations and both links are removed.
- Cohort 5 removes all six original commerce claims and all 10 outbound occurrences. Across the completed model, all 30 original commerce claims and all 56 outbound occurrences are classified and removed; the eight published after-states contain zero commerce. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Exact-before dry-run, one three-row transaction, exact-after verification, after-state no-op dry-run, complete verification and post-receipt re-verification all pass. Complete verification loads 93 manifests, verifies 86 active batches, safely supersedes seven fully covered legacy batches and guards 319 issue rows without drift.
- Snapshot SHA-256: `d6c29c41ff3837991a7d0694f012ae7314d7a59554a280c113013f1b5f8f48f2`. Manifest file SHA-256: `04217613fcd26e233684dedfacdf7f6bf6962aa4d44fe8705f520de8e614c734`. Canonical parsed-manifest/result hash: `41da9fdf30d524d92ef2bd84aa3bd883ea73c93e8f58ac5051994ee26d4c5385`. Durable result-receipt file SHA-256: `3038a70620dcb9c0b937c3df23c5edde9b3a55831e9738be85585d5564db0ba6`.
- Commit `327d7e8936627b4919714c17278afdbddf719293` is live on Ready Production deployment `dpl_5m9A3CQbtg7mAZqRwztYQUqyUFxi` with the production aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly eight Corolla Cross cards and omits all three cohort-5 archived titles. The title and H1 agree at `2022-2025 Toyota Corolla Cross Problems: 8 Issues Every Owner Should Know`; the exact canonical remains indexable with no `noindex`. `/get-started` is present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved warm palette remains intact. Toyota Corolla Cross is research-, database- and production-complete at 23/23.

**Schema-v2 Audi S8 cohorts 1-4 and model completion (2026-07-23):**

- The frozen full-record inventory contains 19 Audi S8 records in four packets of five, five, five and four. All four packets were researched before mutation and then processed sequentially through exact-before dry-run, one transaction, exact-after verification, after-state no-op dry-run, complete historical verification, durable receipt and post-receipt verification. Final reconciliation is exact at 19 packet records and 19 unique manifest rows with zero missing, extra, duplicate or unclassified records. The final after-state contains 11 published and eight archived records: eight diagnosis holds, three VIN-first recall/dealer paths and eight removals.
- Cohort 1 archives the unsupported D3 V10 timing-chain aggregation, a duplicate four-strut/compressor replacement schedule and the generic two-generation turbo coolant/oil-line umbrella. The remaining air-suspension card is narrowed to 2020-2024 Audi TSB 2059363/4 and its exact C1260F0/U112100 symptom-262400 wiring, connector and J1135 path. The false 2007-2018 battery-management/parasitic-drain card is replaced by VIN-gated 2020 S8 Emissions Service Action 27BQ; it is explicitly an emissions action for the starter-alternator, not a safety recall or proof of a BEM/MMI sleep defect.
- Cohort 2 archives the sunroof/plenum defect extrapolation, D2 timing-belt maintenance card and generic direct-injection carbon-buildup card. Audi's older schedule supports drain inspection as maintenance only. The coolant card is narrowed to TSB 2065040/4 for 2020 and early-2021 S8 vehicles when the coolant pump is confirmed as the leak source. The active-mount card is narrowed to TSB 2036392/6 for 2013-2015 S8 4.0 TFSI vehicles with reproducible 1000-3000 rpm vibration and J931 software/basic-setting/exhaust-alignment gates, not automatic mount replacement or COD disabling.
- Cohort 3 keeps five diagnosis/recall records with corrected boundaries. TSB 2058489/8 narrows the front-suspension card to 2020 and early-2021 lower guide-link hydro-bushing noise and warns against unnecessary sway-bar-link replacement. TSB 2046724/5 validates the 2013-2018 warm-soak long-crank/no-start concern but requires the fuel-in-oil, ECM software and pressure-hold decision tree before injectors or both HPFPs. The display card now represents only 2020-2026 rearview/Top View camera recall 25V900/90TV. Oil-consumption TSB 2071114 is corrected from the false 2013-2018 D4 scope to 2020-2023 D5 EA825 vehicles and an authorized consumption test. TSB 2040644/6 narrows the PCV card to the 2013-2016 warm-idle whistle/grind and P2279/P0507 filler-cap-response path.
- Cohort 4 preserves NHTSA 19V057/Audi 20BM and NHTSA 22V178/Audi 21H7 as VIN-first dealer records. The 20BM title and remedy now correctly describe a porous low-pressure supply line feeding the HPFP and the free in-tank pressure-damper installation. The 21H7 record now states the free strainer replacement and oil change without unsupported heat, price, build-cutoff or retail-part claims. The uncited two-generation ZF torque-converter/valve-body card and the unsupported internal charge-cooler/service-bundle card are archived.
- The four source packets contained 66 commerce claims and 179 outbound commerce-link occurrences. Every claim and occurrence is classified and removed; all 11 published S8 after-states contain zero fix parts, commerce-bearing recommendations or retail links. The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3 (28/28 total). Final complete verification loads 97 manifests, verifies 90 active batches, safely supersedes seven fully covered legacy batches and guards 338 issue rows without drift.
- Frozen snapshot SHA-256: `3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102`. Cohort 1 manifest/canonical/result SHA-256 values are `5380648e24589edef58553d877d9a84dd7234e434008afb118a5c4d86b576b5a`, `55f670b7c05393c4d5e1c584251b2fbe2aed6cd63601dc1d71ccb343914aea0f` and `b80d9c92c515acd908d979a050f1a391a6f69d5d224b694b5b020ee49fb54e3d`. Cohort 2 values are `6831f695c138e4729df99260f6b75b15a017e4a622e09697bedea5d75c8b7aeb`, `a9e429228d8e417ce90a4ab0b54f65653028fde96e8dfce1d4711a69a3c58c58` and `271e105f8bdc11a18677ef0e8e302b0fce3b4ddbd978348eb07b6c1239aafa1d`. Cohort 3 values are `2fd02788387c73388e9309f9338aa71b253ba873065000cf3a36ae625b0c9441`, `4f1e76f1c624bcb64e8a707ece0fb982eb11316a2af941a907abc50f0d49d697` and `86b44792a81e1e7ae14383b7838bb8a1a62282d6a79ca08787219a7be58fde4b`. Cohort 4 values are `73b0fe62e0322659b8d0c56df3b02e7f5d8ecd8078bf3d6527621f2f9726a3f1`, `3bd335dd5dd989aaa91381c5fd2c14bad2101b8ce385ca39d0b659ba5b5b9dc1` and `68bc6c5e94600189b009b2e3bab1d55cfcb14d2457f7e01bcabc624ab620d229`.
- Newly surfaced recall records are controlled delta proposals only and were not inserted through this corrective audit: NHTSA 21V295/Audi 42L1 for rear-axle lock nuts on certain 2020-2021 S8 vehicles; follow-up NHTSA 22V034/Audi 42L5 for rear-alignment inspection and tire replacement where the earlier 42L1 repair lacked the revised alignment check; and NHTSA 21V111/Audi 97EV for a missing ECM-connector sealing pin on certain 2020-2021 S8 vehicles. The display correction also leaves separate controlled proposals for 2021 virtual-cockpit recall 25V201/90VC and the VIN-limited 2021 S8 infotainment-main-unit recall 22V806/91Ei. Each proposed record requires its own immutable before/insert authorization, exact campaign scope and duplicate check.
- Commit `e416c2c6265888bcad2294258065656ddb0f246f` is live on Ready Production deployment `dpl_GkZ9BsD3iauxnYyouWQukHEHeWmF` with the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly 11 S8 cards, contains all 11 approved published titles and none of the eight archived titles. The title and H1 agree at `2013-2026 Audi S8 Problems: 11 Issues Every Owner Should Know`; the exact canonical `https://au7o.io/known-issues/audi-s8` remains indexable with no `noindex`. `/get-started` is present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved warm palette remains intact. Audi S8 is research-, database- and production-complete at 19/19. Audi remains the active make: A6 and S8 are complete, with 42 of the fresh inventory's 44 Audi model groups still requiring the same full-record gate.

**Schema-v2 Audi SQ5 cohort 1 database completion (2026-07-24):**

- The frozen SQ5 inventory contains six records in one immutable packet. Research and focused adversarial review approved four diagnosis-first rewrites and two archives before mutation. The guarded manifest passed exact-before dry-run, one six-row transaction, exact-after verification, durable receipt creation and full historical verification. Reconciliation is exact at 6/6 records with zero missing, extra, duplicate or unclassified rows.
- Audi TSB 2070349/5 replaces the coolant-pump design-defect and preventive-replacement narrative with the exact leak-confirmation and possible N649 vacuum-contamination path. TSB 2059363/6 replaces the air-spring/damper aggregation with the exact C1260F0/U112100 symptom-262400 J775/J1135 communication diagnosis. TSBs 2060033/3 and 2060259/1 split P052E00 crankcase-breather diagnosis into membrane and elbow branches. TSB 2014753/13 plus the later EA839-specific 2075515/2 boundary replace universal carbon cleaning advice with fuel-quality/deposit diagnosis and prohibit unapproved additives on the relevant turbocharged generation.
- The supercharger bearing/intercooler-pump and supercharger oil-leak rows are archived because neither aggregation has one supported failure mechanism or repair. Audi's official generation information also confirms that the 2018 SQ5 replaced the predecessor's mechanical supercharger with a twin-scroll turbocharger. No controlled-delta inserts were made.
- All 11 original commerce claims and 19 outbound occurrences are removed, including all four priority clicks. The four published records contain zero fix parts, commerce-bearing recommendations, report-count telemetry, fixed costs or fixed mileage ranges. Published trim arrays are empty so the runtime API does not suppress the records; equipment, engine and generation gates remain explicit in public content.
- The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3, for 28/28 total. Complete verification loads 100 manifests, verifies 93 active batches, safely supersedes seven fully covered legacy batches and guards 358 issue rows without drift. Snapshot hash: `3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102`; packet SHA-256: `0d9983108c202c5ba81a59beab8f08632a7ab5bdd05e84188555ed6103fc2fc3`; manifest-file SHA-256: `0b95933667f23e719c4a6ce9bd272f78da5e08fa0631a9a7b5064fcab1ea6614`; canonical result-manifest hash: `b90d9622c6f5f69f73f0eb5482cbed3fee10e6a3ac402b3803a207ccdf1a92ed`; receipt-file SHA-256: `bc16cb9f21148c348bab7dd13c1e0d0dd59a82877c6bef6b0fdb8a4bfb29966d`.
- Commit `10bf5d3e0ec06080b2a906f63d01bdef2d8a94bc` is live on Ready Production deployment `dpl_4bTwAAGmtcWMfDgqi94p2xmDYjHD` with the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly four SQ5 cards, contains all four approved published titles and neither archived title. The title and H1 agree at `2014-2025 Audi SQ5 Problems: 4 Issues Every Owner Should Know`; the exact canonical `https://au7o.io/known-issues/audi-sq5` remains indexable with no `noindex`. Six source occurrences of `/get-started` are present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved `#F7F4EC`/`#FBFAF6`/`#E3DFD4` warm palette remains intact.
- Audi A6, S8, e-tron, S6 and SQ5 have passed their full model gates, leaving 39 of 44 Audi model groups. Audi remains active and the queue does not advance to Cadillac until every Audi model is complete.

**Schema-v2 Audi SQ7 cohort 1 database completion (2026-07-24):**

- The frozen SQ7 inventory contains four records in one immutable packet. Current Audi/NHTSA primary-source research and adversarial review approved two diagnosis-first rewrites, one VIN-first recall/dealer rewrite and one duplicate archive before mutation. Blind and Edge review produced 13 accepted patches and a clean focused Edge re-review. The guarded manifest passed exact-before dry-run, one four-row transaction, exact-after verification, after-state no-op dry-run, durable receipt creation and complete historical verification. Reconciliation is exact at 4/4 packet, manifest and receipt rows with zero missing, extra, duplicate or unclassified IDs.
- Audi TSB 2059363/6 replaces the air-strut/compressor aggregation with the exact 2020-2025 air-suspension-equipped SQ7 C1260F0/U112100 symptom-262400 J775/J1135 communication diagnosis. Wiring and connector checks precede the bulletin's first-sporadic clear/release and active/static-or-repeat-sporadic J1135 replacement branches. The public record states that improved J1135 software is under development without promising an owner-installed update. The overlapping generic air-suspension row is archived as a duplicate unsupported aggregation.
- The former MMI-freeze row is corrected to amended NHTSA 25V900 / Audi 90TV for certain 2020-2026 SQ7 vehicles, with VIN and installed parts/software controlling eligibility and a free more-robust driver-assistance software remedy. The former valve-cover-leak row is corrected to Audi TSB 2071114/5 and measurement TSB 2074640/1: 2020-2023 SQ7 plus 2024 only through VIN serial 002720, 4.0L, no visible leak, ODIS consumption above the allowed limit and no other technical cause before all eight pistons and rings.
- All seven original commerce claims and 11 outbound occurrences are removed, including all four priority clicks. The three published records contain zero fix parts or commerce-bearing recommendations; unsupported report telemetry, costs, mileage and unrelated repair claims are cleared. Published trim arrays remain empty so runtime filtering cannot suppress the approved cards.
- The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3, for 28/28 total. Complete verification loads 101 manifests, verifies 94 active batches, safely supersedes seven fully covered legacy batches and guards 362 issue rows without drift. Snapshot hash: `3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102`; packet SHA-256: `f96a937f0df0546b93eedf67380d5996bcdafe2452c76aef6a58abbd899fb15a`; manifest-file SHA-256: `30cb6a2013326be6c5a502c3c93154989e31cdd05390f724b7b4247f27a5813e`; canonical result-manifest hash: `81a57abb102084d19875492a74b547119de8ab24866d6f2f6182566b1f365659`; receipt-file SHA-256: `e2ab6163235284c2675d90800bb4ab7138bdf06a06ca3f272fdf75d298a8d88`.
- NHTSA 21V825 / Audi 91CR and 22V742 / Audi 91DZ remain controlled delta proposals; no insert was made.
- Commit `15d85197b85a437d97c92487f598cf5a92f4ad4e` is live on Ready Production deployment `dpl_5X5B4UUsAwrNAURVs7NKJ1Jud2vb` with the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly three SQ7 cards, contains all three approved titles and omits the archived duplicate title. The title and H1 agree at `2020-2026 Audi SQ7 Problems: 3 Issues Every Owner Should Know`; the exact canonical `https://au7o.io/known-issues/audi-sq7` remains indexable with no `noindex`. Six source occurrences of `/get-started` are present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved `#F7F4EC`/`#FBFAF6`/`#E3DFD4` warm palette remains intact.
- Audi A6, S8, e-tron, S6, SQ5 and SQ7 have passed their full model gates, leaving 38 of 44 Audi model groups. Audi remains active and the queue does not advance to Cadillac until every Audi model is complete.

**Schema-v2 Audi TTS cohort 1 database completion (2026-07-24):**

- The frozen TTS inventory contains seven records in one immutable packet. Current Audi primary-source research approved four diagnosis-first rewrites and three archives before mutation. Blind and Edge review produced six accepted patches and a clean focused re-review. The hardened generator published its reviewed manifest atomically from a fsynced temporary file with create-if-absent semantics. Exact-before dry-run, one seven-row transaction, exact-after verification, after-state no-op dry-run, durable receipt validation and complete historical verification all pass. Reconciliation is exact at 7/7 packet, manifest and receipt rows.
- Audi TSB 2060560/3 replaces the 2009-2024 DSG-mechatronic aggregation with its exact 2019-2023 clutch-K1 temperature, dark/burnt-fluid and TCM-evidence gates. The coolant card now separates VIN/action-screen-gated 2012 Update 19J2 from Audi TSB 2071515/1's reproduced 2020-2023 2.0L coolant-pump leak path. The duplicate sixteen-year water-pump/thermostat card is archived.
- Audi TSB 2051384/1 replaces the intake-carbon and preventive-cleaning narrative with the exact 2016-2017 CYFB cold-start software pattern: five enumerated misfire DTCs, simultaneous cylinders within 30 seconds at 2,000-3,000 rpm and no felt misfire. Audi TSB 2042539/4 replaces the magnetic-damper failure narrative with the 2016 rear shock-mount rumble condition; Audi technical training limits the mount path to original `8S0 513 353`, replaces both with `8V0 513 353`, and defers nonmatching vehicles to diagnosis.
- The Mk2 cam-follower row is archived because official 2013 TTS CDMA technical data does not establish the prior universal EA888, interval, failure-progression or parts premise. The Mk2 timing-chain row is archived because Audi's exact 2013 TTS schedule specifies a timing-belt replacement, contradicting its universal EA888 chain premise. No unguarded inserts were made.
- All 10 original commerce claims and 16 outbound occurrences are removed. Three claim-linked clicks and three priority clicks are classified; the magnetic-ride record's three additional historical non-priority clicks are preserved as non-commerce telemetry rather than misclassified as product evidence. All four published after-states have empty trim and engine arrays, zero fix parts, zero commerce-bearing recommendations, and no unsupported report-count, cost or mileage fields.
- The applicator/coverage suite passes 25/25 and the candidate helper passes 3/3, for 28/28 total. Complete verification loads 102 manifests, verifies 95 active batches, safely supersedes seven fully covered legacy batches and guards 369 issue rows without drift. Snapshot hash: `3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102`; packet SHA-256: `99a057c3dfed8fd52269ff8d27f21dde1c71467ba91b847d560071f93286db45`; manifest-file SHA-256: `4a87dd2a39c488a06a43d85d1cb2a3ca86bbf36e10d5a4582e56323cdc8b186d`; canonical result-manifest hash: `153d40c0ab09fe060f9bff8f7bc124dc11e0b9089aa46542211e6c3ec3fced7d`; receipt-file SHA-256: `a5e071319c1f33738e0b22135053df3aea36f7bbbf5d510302f12532b1cdb9d1`.
- Commit `cf6b73348cca52aee010b18d34aadbec80b498d9` is live on Ready Production deployment `dpl_21JEz82KWVNBCrEFwFi5zoQau839` with the `au7o.io` and `www.au7o.io` aliases. After explicit CDN and data-cache purges, cache-busted production HTML renders exactly four TTS cards, contains all four approved titles and omits all three archived titles. The title and H1 agree at `2012-2023 Audi TTS Problems: 4 Issues Every Owner Should Know`; the exact canonical `https://au7o.io/known-issues/audi-tts` remains indexable with no `noindex`. Six source occurrences of `/get-started` are present, `Open Hub` is absent, both restrained UK/EU DataRep assets render and the approved `#F7F4EC`/`#FBFAF6`/`#E3DFD4` warm palette remains intact.
- Audi A6, S8, e-tron, S6, SQ5, SQ7 and TTS have passed their full model gates, leaving 37 of 44 Audi model groups. Audi remains active and the queue does not advance to Cadillac until every Audi model is complete.

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
