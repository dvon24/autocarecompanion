# Known Issues Ultra deep-link sample — July 14, 2026

## Outcome

The approved eight-issue sample was applied and independently verified on July 14, 2026. The transaction removed unsupported commerce, added only exact product pages that matched the published repair and fitment, and added a small public correction notice to every affected card.

| Measure | Before | After |
|---|---:|---:|
| Issues in sample | 8 | 8 verified |
| Part recommendations removed | 18 | 0 remain |
| Clicked search recommendations | 13 | 0 remain |
| Historical clicks on those searches | 28 | Preserved in this report/result artifact |
| Observed conversion baseline | Less than 1% | Too early to measure |
| Search-style buy links | 9 | 0 |
| Exact direct product links | 0 in the corrected records | 4 |
| Public correction notices | 0 | 8 |
| Useful non-part tips/warnings | 9 | 9 retained |

The apply script committed all eight rows in one drift-guarded transaction. A separate post-commit verification returned `already-applied`, proving the stored state matched the manifest and a rerun would not duplicate or partially reapply the update.

## Product decisions

| Known Issue | Published repair match | Before | Verified after decision |
|---|---|---|---|
| 1993–1997 Ford Probe power window motor | Replace the failed motor; reuse a serviceable regulator; side matters | Wrong combined regulator/motor assembly | Front-left Cardone `47-1755`: [WheelerFleet exact product](https://www.wheelerfleet.com/product/motor-p-window/1349803). Front-right Cardone `47-1756`: [BuyAutoParts exact product](https://www.buyautoparts.com/buynow/17-41893_cpcx). |
| 2015–2022 Chevrolet Trax coolant outlet | Outlet depends on engine and eighth VIN digit | Wrong GM `12652328` | GM `25193922` for LUV/LUJ and 2021 VIN B: [eBay exact product](https://www.ebay.com/itm/318200076111). GM `12707589` for LE2/2021–2022 VIN M: [eBay exact product](https://www.ebay.com/itm/286423616243). |
| 2017+ Chrysler Pacifica UConnect freeze | Software/reset path comes before VIN/radio-specific hardware | Four unrelated products and incorrect 12-inch display wording | Removed products; corrected the text to 8.4-inch UConnect 4 and 10.1-inch UConnect 5; retained two reset/software tips; no retail CTA. |
| 2009–2017 Audi Q5 timing chain | Published repair requires a complete chain, tensioner, guides, and hardware scope | Chain-only recommendation labeled as a complete kit; tensioner-only search links | Removed both incomplete paths; no retail CTA until engine/build scope supports a complete kit. |
| 2009–2024 Audi TTS magnetic ride | Generation, axle/corner, PR code, and repair path must all match | Unverified generic Bilstein recommendation and one-generation/one-corner searches | Removed; no retail CTA pending exact fitment. |
| 2019–2022 Audi e-tron battery overheating | Recall 93U9 dealer monitoring/module replacement | Six unrelated consumer products | Removed all six; retained three safety/recall tips; no retail CTA. |
| 2013–2017 Audi S8 turbo oil strainer | Recall 21H7 / NHTSA 22V178 dealer remedy | Two unrelated products and three retail searches | Removed commerce; retained `079115175G` as recall-first identity with no buy links and retained three safety/maintenance tips. |
| 2022 Volkswagen Taos A/C compressor noise | TSB repair can branch to compressor, bracket, or software | Coolant-flush kit and thermostat | Removed both; no retail CTA until dealer diagnosis selects the repair branch. |

Amazon and eBay were checked first as requested. When neither produced an exact approved Ford motor page, exact direct-retailer pages were used. The original left-motor retailer page became unavailable before apply, so the human-approved WheelerFleet `47-1755` page replaced it. Availability was observed on July 14, 2026 and can change; part number, side, engine, VIN, and vehicle fitment should still be confirmed at checkout.

## Public correction notices

Affected cards now show an always-visible, non-alert line while collapsed: an emerald check, semantic `Updated Jul 14, 2026` date, and a short muted summary. Cards without valid correction metadata remain unchanged.

| Issue | Public summary |
|---|---|
| Ford Probe | Corrected part and left/right fitment. |
| Chevrolet Trax | Corrected outlet part numbers and engine/VIN fitment. |
| Chrysler Pacifica | Removed unrelated parts; clarified software-first repair. |
| Audi Q5 | Removed an incomplete timing-chain kit. |
| Audi TTS | Removed an unverified damper pending fitment. |
| Audi e-tron | Removed products; recall 93U9 is the repair path. |
| Audi S8 | Removed retail links; recall 21H7 is the repair path. |
| Volkswagen Taos | Removed unrelated parts; repair requires dealer diagnosis. |

## Timing and comparison caveat

- Audit start: `2026-07-14T15:43:33.6227170Z`
- Verified completion: `2026-07-14T18:13:25.793Z`
- End-to-end wall time: 8,992.171 seconds (2 hours, 29 minutes, 52.171 seconds)
- Known tool stalls: 3,598.4 seconds (about 59 minutes, 58 seconds)
- Pre-approval active-work estimate: 1,370.734 seconds (about 22 minutes, 51 seconds)
- Approval-wait upper bound: 2,878.182 seconds (about 47 minutes, 58 seconds)
- Post-approval-clock-capture wall segment: 2,450.611 seconds (about 40 minutes, 51 seconds)

The exact approval event was not instrumented, so the active-work total is deliberately not presented as an exact number. The approval-wait value is an upper bound, and the post-capture value is wall time rather than pure active time. Known stalls included a marketplace page request, a stalled delegated file read, and a delayed local timestamp command.

The earlier Sol result of 7/8 correct parts cannot be compared fairly with this run because its effort level was not recorded. The earlier 4.6 pipeline and this Ultra run also used subscription sessions rather than the API; no model API was called by this implementation.

## Verification evidence

- Metadata schema preflight passed after the two default-empty correction fields were added.
- Ten transformation, URL/vendor, result-artifact, idempotence, and drift tests passed.
- Dry run matched the expected 8 notices, 18 removals, 3 existing fix-part transitions, 9 removed search links, and 4 exact links.
- Post-review `--verify` matched both the live database and the exact machine-readable result; the patched `--apply` rerun returned `already-applied` without writes.
- The Next.js production build passed, including TypeScript and 1,531 generated static pages.
- Local production HTML returned HTTP 200 with the Ford, Trax, and Pacifica notices and corrected parts/links; the old Probe assembly, Trax `12652328`, Pacifica display wording, and BlueDriver recommendation were absent.
- Headless Edge loaded the corrected DOM, but its viewport screenshots were blank in this environment; responsive visual sign-off should therefore happen on the Vercel Preview before Production.
- Repository-wide lint remains blocked by pre-existing generated/design-file violations; scoped checks identified no new production-code category beyond existing `any` usage in touched legacy mappers/card code.
- Machine-readable decisions: [`data/_ultra-deeplink-sample-decisions.json`](../data/_ultra-deeplink-sample-decisions.json)
- Exact committed before/after result: [`data/_ultra-deeplink-sample-result.json`](../data/_ultra-deeplink-sample-result.json)

No source-control push or Vercel deployment was performed as part of this sample.
