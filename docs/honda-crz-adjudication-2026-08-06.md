# Honda CR-Z proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **3 / 3**
- Same-identity rewrites proposed: **1**
- Byte-for-byte holds: **2**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

The proposed IMA rewrite narrows the broad 2011-2016 permanent battery-degradation narrative to Honda Bulletin 14-064: a VIN-eligible 2011-2012 software-related battery memory effect, possible DTC P0A7F, and IMA battery-control-module software update. Honda explicitly says the memory effect is not permanent degradation.

The A/C compressor and clutch-slave-cylinder cards remain byte-for-byte unchanged. Their forum, generic vehicle-page, video and search-link material does not establish a CR-Z-specific defect or Honda remedy, and no unrelated source is substituted.

The generated packet is `data/known-issue-honda-crz-adjudication-2026-08-06.json`. It is proposal-only and requires independent row-by-row approval.

## Verification commands

```powershell
node scripts/build-honda-crz-adjudication.js
node scripts/validate-honda-crz-adjudication.js
node --test scripts/validate-honda-crz-adjudication.test.js
node scripts/verify-honda-crz-primary-sources.js
```
