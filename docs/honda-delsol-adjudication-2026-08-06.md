# Honda Del Sol proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **9 / 9**
- Same-identity rewrites proposed: **0**
- Byte-for-byte holds: **9**
- Archives, deletes, redirects, slug changes, model-casing changes, database writes and deployments: **0**

The frozen catalog splits this vehicle across three `Del Sol` records and six `del Sol` records. This packet audits them as one cohort but preserves each stored model value and indexed ID.

No exact Honda/NHTSA source cleared the same-identity gate for the distributor, PGM-FI main relay, trailing-arm bushing/corrosion, roof, timing-belt or combined gasket cards. Generic vehicle pages, complaints, videos, retailers and forums were not promoted into authoritative defect or remedy claims.

Independent review should address two overlapping page pairs (roof seal versus targa leak, and broad distributor failure versus internal seal/bearing failure), plus clearly unrelated frozen commerce on the broad distributor and roof pages. The strict unverified-row contract prevents silently editing those rows in this packet.

The generated packet is `data/known-issue-honda-delsol-adjudication-2026-08-06.json`. It is proposal-only and contains no apply path.

## Verification commands

```powershell
node scripts/build-honda-delsol-adjudication.js
node scripts/validate-honda-delsol-adjudication.js
node --test scripts/validate-honda-delsol-adjudication.test.js
```
