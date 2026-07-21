# Known Issues catalog deep-link audit — 2026-07-15

Status: in progress. This is an evidence checkpoint, not a claim that the catalog is complete.

## Toyota RAV4 cohort 1 and SEO gate - 2026-07-21

The first five of 70 Toyota RAV4 records were audited from the frozen schema-v2 snapshot, applied transactionally, and independently verified in their exact production after-state. The cohort corrects the instrument-panel campaign from false recall 25V356 to VIN-first recall 25V595, archives unsupported 2AR-FE oil-consumption and 2AZ-FE cold-start parts diagnoses, narrows the real 2AZ oil-consumption program to Toyota's specified 2006-2008 RAV4 population and expired ZE7 coverage, and corrects LSC 90K to VIN-scoped 2006-2009 RAV4s, its actual hose kit, and its 2021 expiration. Eleven original commerce claims and their generic search/category links were removed; the five after-states contain no retail commerce.

Starting with RAV4, the model-completion gate also checks the rendered SEO title, model-specific meta description, canonical, Open Graph/Twitter labels, and H1 alignment. The supplied July 21 Search Console exports report 2,900 crawled-currently-not-indexed URLs with a 1,000-row export sample and 189 soft 404s. RAV4 has no soft-404 entry; only its valid 2015 and 2019 year variants appear in the 1,000-row not-indexed sample. The RAV4 title is therefore shortened without changing its existing base/year canonical, robots, sitemap, or URL-generation behavior, and the new title path is explicitly allowlisted from RAV4 forward so previously indexed model metadata remains unchanged. The Known Issues header CTA now reads `Get Started` and links to `/get-started`; the separate in-article vehicle-hub link remains available.

## Toyota Camry production-complete checkpoint - 2026-07-20

All 78 Toyota Camry records in the frozen schema-v2 snapshot were completed as full-record audits in 16 guarded batches. Every batch began in its exact frozen before-state, applied transactionally, and independently verified in its complete approved after-state. Reconciliation covers all 78 records and all 235 original commerce claims with zero missing, unknown, duplicate, or drifted records or claims.

The final dispositions are 19 diagnosis holds, eight VIN-first recall/dealer paths, two evidence-only no-commerce records, two diagnosis-qualified replacements, and 47 archived duplicate, generic, inapplicable, complaint-only, or unsupported records. The 78-record source set contained 59 commerce-bearing issues, 235 commerce claims, and 631 outbound link occurrences. The published after-state contains 31 records and just two commerce claims: both are diagnosis-gated mechanical water-pump records linking to exact verified Toyota product pages. All other search, category, marketplace, unsupported-part, recall-part, software-part, and ambiguous-fitment paths were removed.

Primary Toyota/NHTSA evidence materially narrowed the retained records. Examples include exact Camry populations and remedies for recalls 25V595, 25V744, 25V869, 25V059, 21V890, 20V012/25V028, 15V144, and 12V491/15V689; Toyota bulletin gates for the 2AZ oil-consumption, U760E torque-converter, hybrid brake-booster, DCM battery-discharge, A25A cold-misfire, water-pump residue, HVAC odor, and insect-obstructed drain-hose conditions; and expired customer-support or limited-service coverage that is no longer presented as a current free repair. The 47 archived cards include broad complaint aggregations, generic wear/maintenance advice, mixed-engine parts bundles, false or unrelated bulletin citations, duplicate recalls, and diagnosis-free component shopping.

Complete historical verification now loads 74 manifests, verifies 67 active batches in exact after-state, safely supersedes seven fully covered legacy batches, and guards 226 unique issue rows. The Camry-only ledger is zero-unclassified at 78/78 records and 235/235 original claims. A fresh live export contains 31 published Camry records, 31 manual/high-confidence reviews, 31 July 20 correction summaries, two commerce claims, two valid verified product-detail links, and zero invalid/search links.

The first live page request after the database apply still showed the pre-audit 40-card render, proving that the production page/data cache was stale rather than the database. After explicit Vercel CDN and data-cache purges, a fresh production-alias load shows exactly 31 cards, omits representative archived mount, wiper, wind-noise, A/F-sensor, brake-rotor, throttle-body, and TSS titles, and renders the corrected 21V890 and T-SB-0080-19 cards. Expanding the new drain-hose card shows its insect-obstruction evidence and leak/PPE gates with none of the removed pipe-cleaner, foam-cleaner, or search-link content. The approved warm-paper article navigation and card design remain intact on production deployment `dpl_CkY8yRmERMmK6639GAcd664E37zf`, which targets Production and is aliased to `au7o.io` and `www.au7o.io`. Toyota Camry is research-, database-, design-, and production-complete; Toyota RAV4 is next in the make-local traffic queue.

## Lincoln Aviator production-complete checkpoint - 2026-07-20

All 28 Lincoln Aviator records in the frozen schema-v2 snapshot were completed as full-record audits in six guarded batches. Every batch began in its exact frozen before-state, applied transactionally, and independently verified in its complete approved after-state. Reconciliation covers all 28 records and all nine original commerce claims with zero missing, unknown, duplicate, or drifted records or claims.

The final dispositions are 12 diagnosis holds, 10 VIN-first recall/dealer paths, five archived duplicate or unsupported records, and one evidence-only no-commerce record. All 27 Amazon, eBay, and RockAuto search-result links across the nine commerce claims were removed. No retail link remains because the relevant cards resolved to software, recall, VIN/build-specific inspection, multi-cause diagnosis, unverified fitment, duplicate content, or an unsupported component claim. This is an intentional safety result rather than a failure to find products.

The review replaced broad third-party and owner-report claims with current Ford, Lincoln, and NHTSA evidence where available. Material corrections include separating three distinct 10R80/park-related recalls; correcting the 3.0-liter-only engine recall; distinguishing the 12-volt B+ harness recall from unrelated PHEV battery campaigns; adding 2026 wiper and IPMA recalls; adding the 2025 corrective camera recall for incomplete 23S23 software remedies; narrowing multiple SSM/TSB records to their exact build, symptom, DTC, and repair criteria; and archiving unsafe duplicate recall, air-suspension, battery-cable, roof-leak, and ADAS-acceleration aggregations.

Complete historical verification loads 58 manifests, verifies 51 active batches in exact after-state, safely supersedes seven fully covered legacy batches, and guards 148 unique active issue rows. The applicator suite passes 25/25. Clean tracked-state and Vercel production builds both complete TypeScript, all 1,531 static pages, final optimization, and trace collection; the main workspace's first build attempt was blocked only by an unrelated untracked `scripts/scrape-mopar-diagram.ts` import of uninstalled `puppeteer`, so the local release gate was rerun in an isolated tracked worktree without modifying that user file.

The first production render exposed three shared empty-data defects that the record/API gate could not show: a blank `$ to $` cost sentence, `Invalid Date` for empty owner-report dates, and exact-parts/affiliate/fixed-owner boilerplate on no-commerce guidance. Commit `8cbc498` makes those sections conditional. A later release check found that the approved warm-paper card design was still isolated on its preview branch, so commit `e536128` merged that design with the audit safeguards. Corrected production deployment `dpl_DfRenReYAegqWpcdUYPgSFQNYmyN` is Ready, targets Production, and is aliased to `au7o.io` and `www.au7o.io`; CDN and data caches were purged after release.

The post-deploy API union for 2020-2026 matches all 23 published after-states, exposes none of the five archived IDs, and has zero commerce, cost, or mileage fields. Hydrated-page verification finds all 23 unique audited permalinks and 23 July 20 update notes, none of the five archived IDs, and none of the 26 unique removed URLs represented by the 27 original search-link occurrences. It also reports zero blank cost ranges, invalid dates, empty exact-parts headings, false `fixed this` claims, or issue-level affiliate disclaimers. A fresh production-alias browser load after `e536128` shows the approved warm-paper article navigation and card treatment together with the audited Lincoln content. Lincoln Aviator is research-, database-, design-, and production-complete; Toyota Camry is next in the traffic-ranked queue.

## BMW X5 production release checkpoint - 2026-07-20

All 13 BMW X5 records in the prepared schema-v2 queue were completed as full-record audits, applied transactionally, and verified in their exact production after-state. The set contains eight diagnosis-qualified replacement records, four diagnosis holds with no commerce, and one VIN-first recall/dealer record. Twelve live exact product-detail pages remain across the eight replacement records.

Three stale or mismatched eBay links were removed: the E70 air-supply item now redirected to a non-purchasable catalog page, the E70 transfer-case item used an older part number rather than the published current exchange servomotor, and the N55 electric-pump item no longer resolved. The limited-quantity G05 DTF-1 eBay listing was replaced with a stable exact dealer product page. Unsupported owner-report counts, last-reported dates, fixed costs, fixed mileages, generic trouble codes, and overbroad symptom claims were removed or corrected across the cohort.

Production verification passes for all three BMW batches and for the complete manifest history. The all-manifest verifier sees 52 manifests, verifies 45 active batches in after-state, and safely supersedes seven older partial Audi/BMW batches only where every issue is covered by a schema-v2 full-record manifest. The verified inventory contains 120 unique issues: 114 completed schema-v2 model records across Audi A6, BMW X5, Jeep Grand Cherokee, Mazda CX-60, Mazda CX-70, and Mazda3, plus six earlier guarded link-audit records that remain historical evidence rather than full-record completion.

The applicator safety suite passes 25/25. The local and Vercel production builds both complete with all 1,531 static pages generated. Production deployment `dpl_32wQKStXEqk6DFVH7Vf6nDEby1ev` is Ready and aliased to `au7o.io`; the CDN and data caches were purged. A six-model-year API union exposes exactly the 13 audited records and 12 unique product links, with zero removed/search links, costs, mileage ranges, missing approvals, or missing correction summaries. The rendered BMW X5 page contains all 13 issue IDs and all 12 approved URLs, and none of the four removed/replaced marketplace item IDs. BMW X5 is research-, database-, and production-complete; catalog-wide completion remains open, with Lincoln Aviator next in the traffic-ranked make queue.

## Production release checkpoint - 2026-07-18

Twenty-five guarded schema-v2 batches were applied and independently verified against production: 34 Jeep Grand Cherokee records and 44 Mazda records across CX-60, CX-70, and Mazda3. Every batch began in its frozen before-state and finished in its exact reviewed after-state; no row or manifest drift was detected.

The 78 released records previously exposed 426 marketplace search/category URLs. The reviewed after-state exposes 25 verified product-detail links and zero Amazon, eBay, or RockAuto search-result links, a net removal of 401 outbound links. Thirteen duplicate or unsupported cards were archived. The remaining records resolve to 27 diagnosis holds, 15 recall/dealer paths, 15 exact-part replacements, eight other no-commerce outcomes, and the 13 removals. Recall, software-only, conflicting-fitment, and insufficient-evidence paths intentionally carry no purchase link.

The catalog safety suite passes 25/25 and the production Next.js build completes with 1,531 generated pages. This release is a checkpoint, not a claim that the Jeep or Mazda make-wide queue is complete; unreviewed records retain their prior state until they receive the same full-record evidence gate.

## Objective and decision rule

Published repair prose is the claim under test. A purchase link survives only when current evidence supports the repair role, exact part identity, application, quantity/completeness, and a live product-detail page. Click volume sets priority but never overrides correctness. Recall/dealer, software-only, diagnosis-dependent, incomplete-kit, or ambiguous-fitment cases may intentionally end with no buy link.

Research uses the subscription workflow and current web evidence; no OpenAI, Anthropic, or other LLM API is used. The user-authorized ShowMeTheParts API is a non-LLM candidate and fitment source. Its catalog output is never treated as proof that a part repairs the Known Issue or as a final marketplace link.

## Frozen baseline

Source snapshot: `data/known-issues-catalog-deeplink-snapshot.json`

| Measure | Baseline |
| --- | ---: |
| Generated | 2026-07-15T02:30:33.271Z |
| Snapshot SHA-256 | `4f5d0f7ca0468dafa175450cdd3f69755eaa6a775a2877aa5e3cf8f44bc42ecc` |
| Published Known Issues | 7,731 |
| Commerce-bearing Known Issues | 4,351 |
| Commerce claims | 10,850 |
| `fixParts` claims | 4,318 |
| Community commerce claims | 6,532 |
| Outbound commerce links | 19,520 |
| Structurally product-detail links | 1,311 |
| Search, category, or otherwise non-product links | 18,209 |
| DTC-linked commerce issues | 1,954 |
| Clicked commerce issues | 184 |
| Recorded clicks | 310 |
| Clicks to structurally deep-linked URLs | 11 |
| Clicks to non-product URLs | 299 |

Structural product shape is only a first gate. Several high-click exact-looking URLs still pointed to recalled, incomplete, wrong-scope, duplicate, or non-repair products.

## Schema-v2 full-record checkpoint - 2026-07-17

The completion unit is now the entire published Known Issue, not a commerce claim. The schema-v2 gate hashes, applies, and verifies every public field together: vehicle scope, category, title, description, solution, severity, confidence, symptoms, affected systems, DTCs, costs, mileage, citations, owner guidance, parts, approval/reporting/source/status fields, review/update metadata, and related-issue IDs. Legacy link-only manifests remain historical evidence and do not count toward full-record completion.

The immutable v2 snapshot contains 7,731 published records, 10,811 commerce claims, and 19,438 outbound links. It began with 1,320 structurally valid product links and 18,141 search/category/invalid links. Audi A6 was split into 23 record packets. Cohort 1 completed and production-verified eight records:

- gateway liquid-ingress recall;
- headlight-switch wiring recalls;
- tie-rod seal recalls;
- C7 3.0T cold-start timing-chain TSB;
- 2.0T PCV service action 17F9;
- 2.7T ignition-coil diagnosis;
- 48V starter-generator recall; and
- the unsupported broad supercharger nose-cone claim.

Only three exact retailer links survived or were added: both position-specific C7 3.0T upper tensioners and the APB ignition coil. Recall, software, diagnosis-dependent, and unverified BEL paths intentionally have no retail link. The post-apply snapshot reports 1,323 valid product links and 18,115 invalid/search links. Fifteen Audi A6 records remain open; this checkpoint does not count the model or catalog complete.

The public Audi A6 HTML and vehicle API were checked after deployment. They expose the corrected timing-chain part numbers and exact links, the APB/BEL split, and the correction metadata. Deployment `dpl_5QvajMeLEvVe8rMqePNEe1ZwqRXP` is aliased to `au7o.io`; the CDN and data caches were purged.

## Jeep Grand Cherokee clicked cohort 1 - historical pre-release checkpoint, 2026-07-18

The first Jeep Grand Cherokee schema-v2 cohort covers the two records with recorded commerce clicks: the wheel-speed/ABS card and the front-differential/CV card. Together they carried 9 commerce claims, 23 search/category links, and 4 priority clicks. Both finished as diagnosis holds with zero commerce links because the published universal part mappings were not safe.

- The wheel-speed card was narrowed from an unsupported 2011-2021 range to FCA's documented 2019 model-year condition. FCA says connector water intrusion/corrosion can require harness repair rather than a sensor, and tone-wheel rust can require cleaning and retesting. ShowMeTheParts also returned multiple engine/equipment-qualified sensor candidates. The corrected record therefore removes all three universal part groups, generic DTCs, cost claims, and unsupported right-front guidance.
- The front-driveline card was narrowed from an unsupported 2005-2010 common-failure claim to 2008 4WD 4.7L front-axle diagnostic evidence. ShowMeTheParts returned separate limited-slip and non-limited-slip CV candidates plus multiple differential families; the old axle cross-references conflicted with that catalog evidence. The corrected record separates CV-joint, mount, axle-bearing, differential-bearing, and gear-noise diagnosis and removes four part groups plus two recommendation searches.

Guarded artifacts:

- `data/known-issues-catalog-deeplink-patches/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json`
- `data/known-issues-catalog-deeplink-decisions/jeep-grand-cherokee-full-record-cohort-1-2026-07-17.json`
- four ShowMeTheParts evidence files for 2014/2019 ABS components and 2008 CV/differential candidates.

The manifest validator reported zero errors. The applicator safety suite passed 21/21 and the ShowMeTheParts parser/filter suite passed 3/3. At the time of this overnight checkpoint no database dry-run, apply, commit, push, cache purge, or deployment had been performed. The later 2026-07-18 production release checkpoint above supersedes that temporary local-only state and records all 34 Jeep Grand Cherokee records as applied and verified.

Wall-clock timing runs from the first Jeep API evidence artifact at `2026-07-17T20:33:20.766Z` to the final reviewed guarded manifest at `2026-07-18T11:32:19.343Z`: 14 hours 58 minutes 59 seconds. This interval includes overnight research, evidence retrieval, adversarial review, validation, and tool waits; it is not an active-hours throughput estimate.

## Applied and verified checkpoint

Reconciliation currently covers 26 of 10,850 claims across eight issues in seven guarded batches. All seven result artifacts report a verified after-state. The six earlier issues remain idempotent, and the newly reviewed BMW X5 pair was applied and verified without drift.

| Known Issue | Claims | Recorded clicks | Before links | After links | Disposition | Material correction |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| BMW i3 12V battery drain | 3 | 3 | 5 searches | 2 exact products | Replace | Removed incompatible Exide EK151 and made replacement conditional on battery testing versus software/controller diagnosis. |
| Dodge Challenger stalls while driving | 2 | 6 | 5 exact-looking products | 0 | Recall/dealer | Removed a recalled alternator path and a generic build-specific TIPM; added VIN-first recall and diagnosis guidance. |
| Dodge Challenger 6.4L valve springs | 2 | 9 | 6 exact products | 6 corrected exact products | Replace | Corrected individual-versus-16-spring quantity, removed false seat contents, and added FCA all-spring guidance for confirmed MY2021–22 failures. |
| Cadillac Escalade AFM lifter | 3 | 4 | 3 searches | 0 | Diagnosis hold | Corrected active-AFM engine scope, false VLOM PN 12639516, generation-specific repair quantities, and nonexistent fixed-content delete-kit SKU. |
| Dodge Challenger lifter tick | 5 | 4 | 14 exact-looking products | 4 exact mechanical parts | Replace | Corrected automatic/manual MDS scope and OEM pack quantities; removed oil, duplicate tuner, and electronic MDS-disable paths as mechanical repairs. |
| Volkswagen Tiguan water-pump/thermostat leak | 6 | 4 | 6 searches | 7 exact products | Replace | Split CCTA Tiguan Limited from redesigned DGUA fitment, distinguished the thermostat housing from the separate pump, updated G12Evo coolant, and removed unrelated EGR DTCs and an unrelated bulletin. |
| BMW X5 N63/N63TU1 oil consumption | 2 | 1 | 4 searches | 2 exact products | Replace | Corrected program scope and diagnosis order, updated the seal-kit supersession, and fixed the required V8 quantity from one kit to two. |
| BMW X5 early-N63 timing-chain wear | 3 | 1 | 5 product/search links | 0 | Diagnosis hold | Narrowed the scope to the 2010-2013 E70 xDrive50i, removed a lone tensioner and generic kit, and required BMW's measured chain-wear result before the both-chain repair path. |
| **Checkpoint total** | **26** | **32** | **48** | **21** |  | **Net 27 fewer outbound links; the nine BMW originals were removed and only two diagnosis-conditional exact products were added.** |

Disposition counts: five `replace`, one `recall-dealer`, and two `diagnosis-hold`. No manifest overlap, unknown claim, duplicate claim, or before-state drift is present. The remaining queue is 10,824 claims and is intentionally reported as incomplete.

## Traffic-ranked make queue

The user supplied a 242-page traffic list and changed the execution order from a clicks-only queue to make-based batches. Each make is ranked by its highest-traffic vehicle page; models within a make are then reviewed in page-traffic order. This reuses OEM catalog, engine-family, supersession, and retailer research while keeping each database mutation bounded and independently verifiable.

The leading sequence is Jeep (Grand Cherokee first), Audi (A6 first), BMW (X5 first), Lincoln (Aviator first), then Toyota (Camry first). Clicked claims within each page are reviewed first. This is an ordering rule only: all 10,850 frozen-baseline claims remain in scope.

## ShowMeTheParts enrichment

A live read-only sample confirmed that the API can return:

- year/make/model, product category, engine, and part candidates;
- supplier, brand, MPN, part type, part key, AAIA brand ID, GTIN, lifecycle, quantity per application, attributes, images, and buyer-guide applications;
- VIN product and part lookup endpoints; and
- full detail by catalog key or part number.

The same 2018 Volkswagen Tiguan water-pump query also returned unrelated timing-belt rows inside the water-pump category. A direct MPN-only detail lookup for Gates `42196` resolved to a Cardone `42-196` window motor, demonstrating that manufacturer identity and the catalog `part_key` must survive the join. Therefore the integration labels every response `candidateOnly`, preserves supplier plus part key, filters obvious part-type mismatches, and still requires published-repair review, application verification, and a fresh exact retailer-page check. The catalog returned no usable buy link in the tested detail response.

## Pipeline and safety evidence

- Immutable snapshot and clicked/remaining work packets.
- Compact reviewed patches expand into full manifests with guarded before hashes.
- Search/category URL rejection, vendor/host matching, recall/no-commerce constraints, public correction metadata, duplicate issue ownership checks, and exact after-state validation.
- Transaction per batch with row locks and rollback on drift or mixed state.
- Durable result artifacts with manifest and after-state hashes.
- Reconciliation reports compact counts/samples by default instead of dumping the entire missing ledger.
- `node --test scripts/apply-known-issue-catalog-deeplinks.test.js`: 16/16 pass at this checkpoint.
- `npm run build`: production build passed; 1,531 static pages generated, including Known Issue and DTC routes. Only pre-existing warnings were emitted.

## Timing evidence

The baseline snapshot was generated at 02:30:33Z. The first three researched batches were applied, verified, and re-applied idempotently by 03:15:47Z: 45 minutes 14 seconds end to end, including pipeline validation and build work. Later wall-clock timestamps include user/tool pauses and are not a valid measure of active research time.

For the first full-record cohort, the v2 snapshot was generated at 16:28:05Z and the eight-record applied-and-verified result was written at 16:59:32Z: 31 minutes 28 seconds elapsed. That interval includes the v2 packet/build/apply verification work and the bounded record corrections. It is the first measured full-record cohort and should not yet be extrapolated across the catalog; later cohorts will separate catalog lookup, web adjudication, manifest review, and production verification time.

ShowMeTheParts is expected to remove most manual candidate discovery. The working estimate is a 70–90% reduction in candidate-finding time and a 2–4× end-to-end improvement after repair and retailer verification remain in the loop. Once the adapter is stable, the planning range is 7–12 audited issues per active hour, putting the 184 clicked-priority issues at roughly 15–26 active working hours. These are planning estimates, not measured throughput, and will be replaced with comparable API-assisted batch timing.

## Remaining work

1. Finish and time the ShowMeTheParts adapter and its parser/filter tests.
2. Continue the Toyota make-local traffic queue with Toyota RAV4 next; within each page, handle clicked claims first. Jeep Grand Cherokee, Audi A6, BMW X5, Lincoln Aviator, and Toyota Camry are complete at the model level.
3. Continue every commerce-bearing issue not reached by the traffic list.
4. Reconcile to exactly one disposition per claim and zero unclassified claims.
5. Export a fresh post-apply snapshot, compare before/after link and click exposure, rerun all verification, and complete the BMad review gate.

Bulk Hub seeding is deliberately not part of this corrective database mutation. The adapter is being made reusable for a later canonical part/fitment import, but caching rights and any required Hub schema must be approved first.

The current `VehiclePartLookup` key is year/make/model/trim/task and has no engine or catalog identity column, while a Garage `Vehicle` stores trim and optional VIN but not engine code. It is suitable for bounded verified task results, not a lossless 500k-part catalog. A later Hub import should keep three concerns separate: canonical part identity keyed by supplier/brand plus catalog part key; application rows keyed by YMME, engine code, submodel/trim, and qualifiers; and volatile retailer offers with exact URL and last-verified time. Known Issue repair recommendations can then reference a canonical application conditionally without duplicating the whole catalog or treating every fitment match as the repair.
