# Honda Insight proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **10 / 10**
- Same-identity rewrites proposed: **3**
- Byte-for-byte holds: **7**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

The three proposed rewrites keep their indexed identity while replacing broad or secondary-source material with exact Honda/NHTSA records: the 2019-2020 body-control-module recall, the 2020-2021 DC-DC-converter recall and the fuel-pump recall covering VIN-eligible 2019-2020 and 2022 Insight vehicles.

Two high-risk citation errors are frozen for independent disposition. Honda Bulletin 21-079 is a 2022 Civic key-fob campaign—not an Insight 12-volt-battery update—and Bulletin 15-086 is a 2012-2014 CR-V light-acceleration-vibration bulletin—not an Insight CVT warranty extension.

The 12-volt battery, first-generation catalytic-converter and EGR, second-generation CVT and ground-cable, all-generation IMA-battery and rear-suspension cards remain byte-for-byte unchanged. Their sources do not establish the full model-wide claims, and no unrelated source is substituted.

The generated packet is `data/known-issue-honda-insight-adjudication-2026-08-06.json`. It is proposal-only and requires independent row-by-row approval.

## Verification commands

```powershell
node scripts/build-honda-insight-adjudication.js
node scripts/validate-honda-insight-adjudication.js
node --test scripts/validate-honda-insight-adjudication.test.js
node scripts/verify-honda-insight-primary-sources.js
```
