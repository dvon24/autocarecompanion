# Honda HR-V proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **15 / 15**
- Same-identity rewrites proposed: **7**
- Byte-for-byte holds: **8**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**

The seven proposed rewrites keep their indexed identity while replacing unsupported or incorrect scope with exact Honda/NHTSA records: seat-belt pretensioners, the 2018-2020 fuel-pump recall, the 2016-2020 CVT campaign, White Orchid Pearl paint peeling, the 2019-2022 rear-camera recall, the 2023 rear-glass product update and the 2023-2025 steering-gearbox recall.

Two high-risk citation errors are frozen for independent disposition rather than silently edited: Honda Bulletin 23-010 covers idle-stop restart on Passport, Pilot and Ridgeline—not HR-V infotainment—and Bulletin 23-017 covers a 2023 CR-V Hybrid active-grille software update—not HR-V oil leakage.

The door-lock, A/C compressor, drive-belt tensioner, battery-drain, infotainment, oil-leak, wheel-bearing and window-gasket rows remain byte-for-byte unchanged. Their current complaints, forums, videos or mismatched bulletins do not establish the full model-wide claims.

The generated packet is `data/known-issue-honda-hrv-adjudication-2026-08-06.json`. It is proposal-only and requires independent row-by-row approval.

## Verification commands

```powershell
node scripts/build-honda-hrv-adjudication.js
node scripts/validate-honda-hrv-adjudication.js
node --test scripts/validate-honda-hrv-adjudication.test.js
node scripts/verify-honda-hrv-primary-sources.js
```
