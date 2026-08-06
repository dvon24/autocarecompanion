# Honda CR-V proposal-only adjudication — 2026-08-06

## Result

- Frozen rows reconciled: **53 / 53**
- Same-identity rewrites proposed: **19**
- Byte-for-byte holds: **34**
- Archives, deletes, redirects, slug changes, database writes and deployments: **0**
- Commerce, cost and mileage claims in proposed rewrites: **0**

The generated packet is `data/known-issue-honda-crv-adjudication-2026-08-06.json`. It is not an apply manifest and requires independent row-by-row approval.

## Corrected identities

The 19 proposed rewrites cover 16 distinct issues. Three identities have two already-indexed pages each; both pages are preserved and corrected without making a canonical or redirect decision:

- 2017-2018 1.5T oil dilution / oil level above full mark
- 2017-2022 1.5T A/C compressor shaft-seal leak
- 2018-2020 in-tank fuel-pump recall

The other corrected identities are the 2025 e:FCEV coolant-leak recall, 2019 steering-wheel/airbag-wire recall, 2017-2020 front buckle recall, 2023-2025 Hybrid high-pressure fuel-pump recall, 2023 Hybrid high-voltage battery recall, sticking oil-control rings, alleged inadvertent CMBS braking, 2023-2025 sticky steering recall, 2015 vibration bulletin, 2007-2011 A/C clutch bulletin, 2017-2019 center-display bulletin, 2007-2011 rear-frame corrosion recall, and 2010-2013 VTC-actuator cold-start rattle.

## Deliberate holds

Thirty-four records are unchanged because an exact same-identity Honda or NHTSA source was not completed. High-risk examples are explicit in the packet:

- Honda Bulletin 21-081 is an EVAP bulletin, not evidence for CR-V Hybrid brake grinding.
- Honda Bulletin 22-014 is an Accord/Insight active-noise-cancellation bulletin, not evidence for CR-V adaptive-cruise faults.
- Honda Bulletin 09-010 supports a later-model VTC-actuator rattle, not a 2007-2011 timing-chain-tensioner failure.
- Honda Bulletin 19-066 supports a narrow dim/dark center-display condition, not the separate freezing/rebooting/CarPlay aggregation.
- No unrelated official record is substituted into an indexed page.

## Scope corrections locked by tests

- Sticking rings: bulletin table lists 2008-2011; its warranty-extension background specifically describes 2010-2011.
- In-tank fuel pump: 2018-2020 CR-V plus 2020 CR-V Hybrid, not 2018-2022.
- Vibration Bulletin 15-046: 2015 only, not 2015-2016.
- Center display Bulletin 19-066: 2017-2019 EX/EX-L/Touring.
- VTC actuator Bulletin 09-010: all 2010-2012 plus specified 2013 VIN ranges.
- Rear-frame campaign: NHTSA 23V-228, not 23V-844.
- EA24-002 is labeled as an investigation of allegations, not a recall or proven defect.

## Verification commands

```powershell
node scripts/build-honda-crv-adjudication.js
node scripts/validate-honda-crv-adjudication.js
node --test scripts/validate-honda-crv-adjudication.test.js
node scripts/verify-honda-crv-primary-sources.js
```
