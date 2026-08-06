# Honda Crosstour known-issue adjudication - 2026-08-06

Status: proposal only; independent approval required before any database write, cache purge, deployment or production promotion.

## Result

- Frozen Honda Crosstour baseline: 7 published records.
- Same-identity rewrite proposals: 3.
- Published records held byte-for-byte unchanged: 4.
- Archive, delete, unpublish, redirect or slug changes: 0.
- Commerce additions: 0.
- Every rewrite clears costs, mileage, shopping data, trim tags and engine tags.

Packet: `data/known-issue-honda-crosstour-adjudication-2026-08-06.json`

- Packet SHA-256 (LF-normalized): `6e8843eef5063b623da60cdece8bf2b856a8de910cbe9612c21a477f25727aaa`
- Frozen Honda snapshot SHA-256 (LF-normalized): `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`
- Frozen snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Exact Honda-source corrections

- 2013-2015 V6 automatic starter grinding or spinning at startup: [Honda Service Bulletin 16-002](https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf). The proposal removes the frozen card's unrelated dashboard-warning, VCM/GDI, DTC, cost and parts claims and retains only the documented starter/ring-gear condition and repair.
- 2014-2015 NH-603P White Diamond Pearl paint peeling: [Honda Engineering Request AER19050A](https://static.nhtsa.gov/odi/tsbs/2019/MC-10160916-0001.pdf). The proposal explicitly describes this as an investigation, not a warranty extension, and removes the unsupported 2010-2015/color/cost assertions and paint-product links.
- Torque-converter lock-up clutch judder on eligible 2010 vehicles and 2013-2015 V6 automatics: [Honda Bulletin 16-066](https://static.nhtsa.gov/odi/tsbs/2017/SB-10108047-9340.pdf), [Bulletin 16-067](https://static.nhtsa.gov/odi/tsbs/2016/SB-10086084-2280.pdf), [Bulletin 17-041](https://static.nhtsa.gov/odi/tsbs/2018/MC-10139550-9999.pdf), and [Bulletin 17-042](https://static.nhtsa.gov/odi/tsbs/2018/MC-10139551-9999.pdf). The proposal excludes 2011-2012 because these exact procedures do not cover those model years and removes unsupported hard-shift, slipping, damage, cost and shopping claims.

## Four byte-equivalent holds

- A/C compressor-clutch relay failure: the generic NHTSA vehicle page does not establish relay failure, the stated part number, diagnosis or remedy. No exact Honda bulletin was verified.
- Front strut wear: [Honda Bulletin 12-082](https://static.nhtsa.gov/odi/tsbs/2013/SB-10086863-2280.pdf) documents a hot-weather clunk caused by lower ball joints, not strut wear. Substituting a different component would violate the identity gate.
- Parking-pawl roll-away: the frozen narrative matches [NHTSA recall 11V-395](https://static.nhtsa.gov/odi/rcl/2011/RCAK-11V395-5977.pdf), but the official record names Accord, CR-V and Element and the [NHTSA 2010 Accord Crosstour recall lookup](https://api.nhtsa.gov/recalls/recallsByVehicle?make=Honda&model=Accord%20Crosstour&modelYear=2010) does not return that campaign. The page is held for independent disposition instead of being silently removed or rewritten.
- VCM oil consumption: [Honda Bulletin 13-079](https://static.nhtsa.gov/odi/tsbs/2018/MC-10152431-0001.pdf) documents rotating/aligned piston rings, spark-plug fouling and misfire DTCs P0301-P0304. It does not substantiate the frozen severe oil-consumption rate, VCM causation, engine-damage estimate or VCM-disabler remedy.

These mismatches are evidence gaps, not authorization to replace one defect with another or remove an indexed page.

## Gates

- Packet validator: 7/7 rows reconciled; 0 errors.
- Crosstour unit tests: 7/7 passed.
- Combined Genesis/GMC/Honda regression: 45/45 passed.
- Live-source gate: all 6 exact proposal PDFs returned HTTP 200, `application/pdf`, valid PDF magic and nontrivial content; 0 blocked and 0 failed.
- Every proposed rewrite remains published, preserves its existing issue identity, and contains no commerce.

The packet has no apply path. It can become a production mutation only through a separately reviewed, guarded apply step.
