# Honda Fit proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **11 / 11**
- Same-identity rewrites proposed: **3**
- Byte-for-byte holds: **8**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

The three rewrites keep their indexed issue identity while replacing unsupported broad narratives with exact Honda records:

- The CVT card is narrowed to VIN-eligible 2015 Fit CVTs under recall 15V574 and Honda Bulletin 15-065.
- The EPS card is corrected from a nonexistent Fit Bulletin 13-043 and 2009-2020 scope to VIN-eligible 2007-2008 Fit vehicles under Honda Bulletin 14-058.
- The fuel-pump card is narrowed to VIN-eligible 2018-2019 Fit vehicles under recall 23V858 and Honda Bulletin 24-023.

The A/C compressor, door-latch, idle/stalling, ignition-coil, infotainment, oil-consumption, spark-plug and starter cards remain byte-for-byte unchanged. Their current generic pages, complaints, videos or absent citations do not establish the exact model-wide claims, and no unrelated source is substituted.

The generated packet is `data/known-issue-honda-fit-adjudication-2026-08-06.json`. It is proposal-only and requires independent row-by-row approval.

## Verification commands

```powershell
node scripts/build-honda-fit-adjudication.js
node scripts/validate-honda-fit-adjudication.js
node --test scripts/validate-honda-fit-adjudication.test.js
node scripts/verify-honda-fit-primary-sources.js
```
