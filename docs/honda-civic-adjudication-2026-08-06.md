# Honda Civic known-issue adjudication - 2026-08-06

Status: proposal only; independent approval required before any database write, cache purge, deployment or production promotion.

## Result

- Frozen Honda Civic baseline: 69 published records.
- Same-identity rewrite proposals: 14.
- Published records held byte-for-byte unchanged: 55.
- Archive, delete, unpublish, redirect or slug changes: 0.
- Commerce additions: 0.
- Every rewrite clears costs, mileage, shopping data, trim tags and engine tags. Unsupported applicability cannot hide a record behind a filter.

Packet: `data/known-issue-honda-civic-adjudication-2026-08-06.json`

- Packet SHA-256 (LF-normalized): `b780a00684556ba9b2da413827ea5baa7425b73962c0219269286b0b0a8fe0a9`
- Frozen Honda snapshot SHA-256 (LF-normalized): `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`
- Frozen snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Exact recall corrections

The packet replaces secondary summaries with the exact NHTSA or Honda record for these existing page identities:

- 2016 2.0L piston-pin snap ring: [Honda owner notice for recall 16V-074](https://static.nhtsa.gov/odi/rcl/2016/RCRN-16V074-0915.pdf).
- 2020-2021 brake master-cylinder/booster fastener: [NHTSA acknowledgment for recall 23V-458](https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V458-8185.pdf).
- 2018-2020 in-tank fuel-pump impeller: [NHTSA acknowledgment for recall 23V-858](https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V858-9680.pdf) and [Honda owner notice](https://static.nhtsa.gov/odi/rcl/2023/RIONL-23V858-6970.pdf). This corrects the frozen card's 2019 start year to 2018.
- 2023-2024 driver-seat cushion frame: [NHTSA Part 573 report 24V-859](https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V859-7804.PDF) and [Honda Service Bulletin 24-129](https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V859-9544.pdf). This corrects the frozen card's 2023-only scope.
- 2016 electric parking brake: [NHTSA acknowledgment for recall 16V-725](https://static.nhtsa.gov/odi/rcl/2016/RCAK-16V725-3551.pdf) and [Honda owner notice](https://static.nhtsa.gov/odi/rcl/2016/RCRN-16V725-0835.pdf).
- 2022-2025 sticky/increased-effort steering: [NHTSA acknowledgment for recall 24V-744](https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V744-1977.pdf).
- 2025 high-pressure fuel-pump leak: [NHTSA acknowledgment for recall 24V-763](https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V763-7158.pdf) and [Honda Service Bulletin 24-124](https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V763-3099.pdf).

Recall remedies remain no-commerce. The proposal removes generic Amazon, RockAuto and eBay searches from the two recall cards that carried parts.

## Exact Honda bulletin corrections

- 2016-2021 condenser leak: [Honda warranty-extension notice 19-091](https://static.nhtsa.gov/odi/tsbs/2021/MC-10199342-0001.pdf).
- 2016-2021 compressor shaft-seal leak: [Honda Service Bulletin 23-039](https://static.nhtsa.gov/odi/tsbs/2024/MC-10249628-0001.pdf). The broad frozen "compressor failure" card is narrowed to the source-supported shaft-seal mechanism.
- 2022-2025 front suspension noise while turning, all Civic trims except Type R: [Honda Service Bulletin 23-094 version 2](https://static.nhtsa.gov/odi/tsbs/2025/MC-11015016-0001.pdf).
- 2016-2018 1.5L engine-oil-dilution campaign: [Honda campaign announcement](https://static.nhtsa.gov/odi/tsbs/2018/MC-10152439-0001.pdf) and [revised procedure notice](https://static.nhtsa.gov/odi/tsbs/2019/MC-10152769-0001.pdf). This removes the unsupported 2019-2020 tags.
- 2012-2013 paint cracking, chalking or clouding intersection: [Honda Service Bulletin 14-034](https://static.nhtsa.gov/odi/tsbs/2014/MC-10124263-9999.pdf). The proposal removes the unrelated 19-055 Taffeta White claim, which concerns other Honda models.

## Overlaps preserved for SEO review

Two indexed steering IDs both describe recall 24V-744. Both receive the same exact-source correction, but neither is redirected or removed.

Three indexed A/C IDs overlap the verified condenser and compressor-shaft-seal mechanisms. Each is corrected within its existing identity. Canonicalization, redirect or consolidation is intentionally left to independent review so this packet cannot silently remove indexed pages.

## Fifty-five byte-equivalent holds

The remaining rows are unchanged when exact same-identity primary evidence was not completed. Notable holds exposed to the reviewer include:

- The cold-weather misfire/injector card cites Honda bulletin 19-038 but labels it A19-033. The bulletin supports driveability DTCs and a warranty extension; it does not establish leaking injectors or injector replacement as the cause and remedy claimed by the frozen card.
- The rear-brake-squeal card names Service Bulletin 19-011 without a source; no exact Civic bulletin was verified.
- The CVT lower-valve-body hot-start card cites only secondary pages and does not identify a verified Honda bulletin.
- The EGR-port card attributes Civic scope to TSB 99-085 but cites only secondary pages; no exact same-identity Honda record was verified.

These gaps are not treated as permission to rewrite, archive or remove an indexed page.

## Gates

- Packet validator: 69/69 rows reconciled; 0 errors.
- Civic unit tests: 8/8 passed.
- Combined Genesis/GMC/Honda regression: 32/32 passed.
- Live-source gate: all 17 exact proposal PDFs returned HTTP 200, `application/pdf`, valid PDF magic and nontrivial content; 0 blocked and 0 failed.
- NHTSA's extracted copies were reviewed for exact make/model/year scope, component, mechanism, consequence and remedy before the cards were written. Representative recall and bulletin pages were also visually inspected.

The packet has no apply path. It can become a production mutation only through a separately reviewed, guarded apply step.
