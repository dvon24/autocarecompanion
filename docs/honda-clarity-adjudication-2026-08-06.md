# Honda Clarity known-issue adjudication - 2026-08-06

Status: proposal only; independent approval required before any database write, cache purge, deployment or production promotion.

## Result

- Frozen Honda Clarity baseline: 4 published records.
- Same-identity rewrite proposals: 2.
- Published records held byte-for-byte unchanged: 2.
- Archive, delete, unpublish, redirect or slug changes: 0.
- Commerce additions: 0.
- Both rewrites clear costs, mileage, shopping data, trim tags and engine tags.

Packet: `data/known-issue-honda-clarity-adjudication-2026-08-06.json`

- Packet SHA-256 (LF-normalized): `14690a9f9ee2b526e886ee00b631e118f3d21a15ec56d748360c97a29f3c4f93`
- Frozen Honda snapshot SHA-256 (LF-normalized): `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`
- Frozen snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Exact Honda bulletin corrections

- 2018-2021 Clarity Plug-In Hybrid A/C condenser refrigerant leak: [Honda Service Bulletin 21-017](https://static.nhtsa.gov/odi/tsbs/2021/MC-10194957-0001.pdf) and its [Honda owner notice](https://static.nhtsa.gov/odi/tsbs/2021/MC-10199344-0001.pdf). The proposal retains the condenser-leak identity, limits the remedy to VIN-eligible manufacturing-condition leaks, states the 10-year/unlimited-mile extension, and excludes foreign-object damage.
- 2018 Clarity Plug-In Hybrid and Electric charging that fails to start or stops early: [Honda Service Bulletin 18-097](https://static.nhtsa.gov/odi/tsbs/2018/MC-10147178-9999.pdf). The proposal corrects the broad frozen 2017-2021 scope to 2018 and limits the mechanism and remedy to the bulletin's battery-charger software behavior under poor or fluctuating power quality.

The charging proposal removes unsupported range-degradation and battery-warranty claims. Both corrected cards remove generic parts searches, cost estimates and unverified trim or engine applicability.

## Two byte-equivalent holds

- The 12-volt battery-drain aggregation cites a secondary article and an owner forum. No exact Honda defect bulletin or campaign was verified, so the indexed row and all its current fields remain unchanged for independent review.
- The highway-power-loss aggregation cites a generic NHTSA vehicle page and an owner forum. Honda records found for DTC P1D8D and P0010 concern a PCU internal failure and PCM emissions DTCs; they do not establish the claimed highway transition behavior, over-rev symptom or named 19-056/20-008 software remedy. No unrelated source was substituted.

These evidence gaps are exposed in the packet and are not treated as permission to rewrite, archive or remove either page.

## Gates

- Packet validator: 4/4 rows reconciled; 0 errors.
- Clarity unit tests: 6/6 passed.
- Combined Genesis/GMC/Honda regression: 38/38 passed.
- Live-source gate: all 3 exact proposal PDFs returned HTTP 200, `application/pdf`, valid PDF magic and nontrivial content; 0 blocked and 0 failed.
- Every proposed rewrite remains published, preserves the existing issue identity, and contains no commerce.

The packet has no apply path. It can become a production mutation only through a separately reviewed, guarded apply step.
