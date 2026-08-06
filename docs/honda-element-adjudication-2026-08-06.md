# Honda Element proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **11 / 11**
- Same-identity rewrites proposed: **0**
- Byte-for-byte holds: **11**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

No exact same-identity Honda/NHTSA source cleared the rewrite gate. Generic model pages, complaints, forums and videos do not establish the frozen Element-wide failure rates, mechanisms, scopes and remedies.

Four citation problems are explicit:

- The door-lock page claims a power actuator, while its named bulletin concerns a mechanical lock cylinder.
- Bulletin 07-024 applies to specified CR-V vehicles, not Element.
- Bulletin 09-010 does not list Element and documents a VTC-actuator rattle on other models, not a broad Element timing-chain/tensioner failure.
- Bulletin 04-037 is an Accord V6 second-gear safety-recall bulletin, not an Element harsh-shift bulletin.

The generated packet is `data/known-issue-honda-element-adjudication-2026-08-06.json`. It is proposal-only and contains no apply path.

## Verification commands

```powershell
node scripts/build-honda-element-adjudication.js
node scripts/validate-honda-element-adjudication.js
node --test scripts/validate-honda-element-adjudication.test.js
```
