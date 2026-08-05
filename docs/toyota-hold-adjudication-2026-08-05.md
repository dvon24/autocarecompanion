# Toyota 91-row hold adjudication — 2026-08-05

Status: proposal only. Independent review is required before any database write, redirect, cache purge, deployment, or production promotion.

## Outcome

| Recommendation | Rows | Production effect if later approved |
|---|---:|---|
| Keep audited correction | 2 | Leave the two corrected Camry water-pump records published |
| Rewrite and republish | 68 | Restore the existing URL with evidence-limited copy and no commerce |
| Redirect duplicate | 6 | Add the permanent canonical redirect first, then retain the duplicate as archived |
| Uphold evidence hold | 15 | Keep archived pending an issue-specific source or a better canonical destination |
| **Total** | **91** | No action is authorized by this packet |

The original rule-only review proposed 52 republications and 37 archives. This pass challenged every proposed archive against the exact audit decision, available deep links, duplicate identities, and NHTSA owner-complaint data. Eighteen of those 37 rows moved to evidence-limited republication, six are explicit duplicates, and fifteen remain held. Two initially proposed republications moved into hold because their only link was a forum homepage rather than issue-specific evidence.

Packet: `data/known-issue-toyota-hold-adjudication-2026-08-05.json`

- Packet SHA-256 (LF-normalized): `a520715dde4e7f734845092a7b49f9a7574415fff393dea847c4d65fe8918ddf`
- Frozen 91-row review SHA-256: `3e5cde0a2d1b30abb7cde144e4427afbf33187553b8bfaf3804085d987c1d956`
- NHTSA complaint-candidate evidence SHA-256: `3a58cde95de628877bf53d5f82213e2c030f2042a20439550c5f38e8f2cdc443`
- Preliminary-disposition SHA-256: `29b408ccf360eab8aaddb783327aa3b9764c111bec114cdb6757958e3076c18e`
- July 17 v2 pre-audit snapshot SHA-256: `5e2d7d475b5bf169f1d03eebff4a7e84a788c56c9f7705e79ad6e43533c22056`

## Publication safeguards

Every one of the 68 republish proposals:

- remains on the same issue ID/slug and Toyota model;
- removes visible `Archived` labeling;
- contains at least one issue-specific deep citation;
- carries empty `trims` and `engines` arrays so unverified applicability labels cannot hide the card;
- carries no `fixParts`, community commerce, search/category/storefront URL, cost range, mileage range, or scraped report count;
- is marked `humanApproved: false` until the independent review;
- distinguishes owner reports from proof of a defect, cause, prevalence, population, or remedy.

The NHTSA research queried 58 exact Toyota model-year complaint datasets for the 37 contested archive rows. Candidate matches were found for 25 rows. The file records exact ODI samples and the limitations of complaint evidence. One 2026 Camry query returned HTTP 400 and is an explicit gap; it is not silently treated as zero complaints.

## Canonical redirects

These duplicate URLs should not be allowed to become dead pages. The redirect must exist before the duplicate is retired.

- `toyota-camry-power-window-regulator-window-glass-failure` → `toyota-camry-power-window-regulator-motor-failure`
- `toyota-camry-engine-sludge-oiling-failure-and-engine-seizure-fire` → `toyota-camry-1mz-fe-3-0l-v6-oil-sludge-oil-gelling-engine-failure`
- `toyota-camry-hybrid-brake-booster-pump-accumulator-failure-long-pedal-abs` → `toyota-camry-brake-actuator-abs-2007`
- `toyota-corolla-cross-cvt-shudder-2022` → `toyota-corolla-cross-cvt-hesitation-2022`
- `toyota-corolla-cross-multimedia-head-unit-total-blackout-center-display-hardware` → `toyota-corolla-cross-infotainment-lag-2022`
- `toyota-rav4-fuel-pump-failure-2019` → `toyota-rav4-denso-low-pressure-fuel-pump-impeller-failure-causing-engine`

## Fifteen evidence holds

These are not archived merely because an OEM bulletin is absent. Each has a specific evidence defect: no issue-specific citation after generic-link removal, a single undiagnosed report converted into prevalence, an unsafe multi-component parts prescription, conflated systems, or a source that does not support the claimed issue.

- Camry rear wheel-bearing wear: the only citation was a ToyotaNation homepage.
- Camry V6 active/hydraulic mount: one complaint was expanded across engines and twelve years.
- 2025 Camry cold-weather wiper: one undiagnosed report was expanded into a two-year mechanical/software defect.
- Camry A/C compressor seizure: cooling complaints were converted into a multi-generation compressor diagnosis and parts bundle.
- Camry dogbone torque strut: multi-generation mount claims and commerce lacked issue-specific support.
- Camry HVAC blower/resistor: no usable issue-specific citation remains.
- 2000 Camry intermittent brake loss: multiple braking mechanisms were combined without a verified identity.
- Corolla Cross A/C cycling: gasoline and hybrid HVAC systems, unsupported DTCs, and unrelated products were combined.
- Corolla Cross rear USB: the original citation was a placeholder/fake URL and the equipment varies by grade/year.
- Corolla Cross door-seal wind noise: the source/repair path was not issue-specific.
- Corolla Cross windshield stress cracking: no supporting complaint or technical record was found for the claimed population and cause.
- RAV4 highway wind noise: an adjacent mirror-vibration bulletin was incorrectly used for cabin wind noise.
- RAV4 A/C compressor/clutch: the only citation was a ToyotaNation homepage.
- RAV4 stop-start rough restart: owner anecdotes were converted into a broad defect and parts path.
- RAV4 regenerative/friction brake transition: unrelated brake reports and generic parts advice did not establish the claimed transition defect.

## False or unrelated citations removed from republish proposals

- Toyota T-SB-0055-13 was a sunvisor-mount bulletin, not a Camry P0430 reflash.
- NHTSA MC-10187043-9999 was an FCA A-pillar water-leak document, not a Camry transmission bulletin.
- NHTSA 10V017 covered 2007–2010 Camry accelerator pedals, not the held 2000 Camry page.
- NHTSA MC-10145756-9999 covered 3VZ-E Truck/4Runner/T100 head gaskets, not the Camry 3VZ-FE.
- Generic NHTSA dataset/recall landing pages and unrelated Corolla Cross model-launch releases were removed where they did not support the issue claim.

## Verification

- Packet validator: 91/91 rows reconciled; zero errors.
- Unit tests: 7/7 passed.
- Live link gate: 119 unique proposed citation URLs checked; 18 NHTSA PDFs had valid PDF signatures; 10 NHTSA complaint queries still contained every named ODI sample; zero 404/410, generic-link, collapsed-homepage, or ODI failures.
- Twenty-two third-party/Toyota asset links returned 401/403/429 in the final automated run (the count varied with rate limiting). They remain access-blocked rather than content-verified; Opus should spot-check the material subset in a browser.

The packet contains no apply code. It is designed for Opus to accept, modify, or reject row-by-row without moving production underneath the review.
