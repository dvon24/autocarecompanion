# Honda NSX proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **6 / 6**
- Same-identity rewrites proposed: **0**
- Byte-for-byte holds: **6**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

No NSX card cleared the primary-source gate. The ABS accumulator, climate-control unit, clutch hydraulics, cooling system, timing-belt service and countershaft snap-ring pages rely on forums, vendors, buyer guides or secondary engine-reference sites.

The snap-ring page names Honda Bulletin 93-010 and a narrow transmission-serial range, but its citations do not include the official bulletin. That potentially valuable page remains byte-for-byte unchanged until the exact Honda document can verify the scope, failure mechanism and repair.

The generated packet is `data/known-issue-honda-nsx-adjudication-2026-08-06.json`. It is proposal-only and requires independent row-by-row approval.

## Verification commands

```powershell
node scripts/build-honda-nsx-adjudication.js
node scripts/validate-honda-nsx-adjudication.js
node --test scripts/validate-honda-nsx-adjudication.test.js
```
