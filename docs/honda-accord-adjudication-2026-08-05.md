# Honda Accord known-issue adjudication — 2026-08-05

Status: proposal only; independent approval required before any database write, cache purge, deployment, or production promotion.

## Result

- Frozen Honda Accord baseline: 56 published records.
- Same-identity rewrite proposals: 13.
- Published records held byte-for-byte unchanged: 43.
- Archive, delete, unpublish, redirect, or slug changes: 0.
- Commerce additions: 0.
- Every rewritten row keeps `trims` and `engines` empty. Applicability is stated in prose so a guessed label cannot hide a valid card from a trim/engine filter.

Packet: `data/known-issue-honda-accord-adjudication-2026-08-05.json`

- Packet SHA-256 (LF-normalized): `86ad4bef6b48780dac4d7fa36e6dd81fa838b5ff7f3c1a62a678f30107a702c0`
- Frozen Honda snapshot SHA-256 (LF-normalized): `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`
- Frozen snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Why 43 rows were not rewritten

The previous Accord lead set was not safe to apply. It assigned sources by sequence rather than by record identity. Examples found during review:

- an A/C condenser bulletin was assigned to a head-gasket/coolant-intrusion page;
- an Acura TSX piston-ring bulletin was assigned to an Accord VCM page;
- a 2017 P0741 bulletin was assigned to a 2003–2012 P0741 page;
- a front-wheel-bearing bulletin was assigned to a rear-wheel-bearing page.

Those sources may be useful for other cards, but they do not authorize changing the IDs they were paired with. The affected published rows remain exactly as they were in the frozen Honda snapshot.

## Reviewed primary-source mappings

### Honda/NHTSA documents

- A/C condenser corrosion/leak: Honda service bulletin 21-018, [NHTSA MC-10194961-0001](https://static.nhtsa.gov/odi/tsbs/2021/MC-10194961-0001.pdf). Proposed scope is 2018–2020 only; impact damage is not treated as a covered manufacturing condition.
- V6 automatic starter/ring-gear clearance: Honda service bulletin 16-002, [NHTSA MC-10115802-9999](https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf). Proposed scope is 2013–2016 V6 automatic Accord vehicles.
- Inadvertent CMBS/AEB activation: [NHTSA EA24-002 opening resume](https://static.nhtsa.gov/odi/inv/2024/INOA-EA24002-11766P1.pdf). The proposal calls this an open investigation, not a recall or final defect finding.
- L4 oil consumption/sticking rings: Honda service bulletin 12-087, [NHTSA MC-10108586-9999](https://static.nhtsa.gov/odi/tsbs/2015/MC-10108586-9999.pdf). Proposed scope is 2008–2011 Accord L4 vehicles.
- EPS torque-sensor fault: [NHTSA MC-10152445-0001](https://static.nhtsa.gov/odi/tsbs/2018/MC-10152445-0001.pdf). The proposal retains the 2013–2014 and DTC 53-01/53-02 gates.
- Cold-start VTC actuator rattle: Honda service bulletin 09-010, [NHTSA MC-10204264-9999](https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf). Proposed scope is 2008–2012.

### NHTSA recall campaigns

- 12-volt battery sensor corrosion: [17V418](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=17V418000), 2013–2016.
- Rearview-camera software: [18V629](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V629000), 2018.
- BCM software: [20V771](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V771000), 2018–2020 Accord/Accord Hybrid.
- V6 power-steering pressure hose: [12V222](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=12V222000), 2003–2007.
- Ignition-switch wear/interlock: [03V423](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V423000), 1998–1999.
- Ignition-key park interlock: [05V025](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V025000), 1999–2002.
- Low-pressure fuel-pump failure: [20V314](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V314000), [21V215](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V215000), and [23V858](https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V858000). The existing false `20V-374` identifier is removed. The proposed copy deliberately omits an impeller-mechanism claim because the current NHTSA API summaries support pump failure, stall risk, and free pump replacement but do not state that mechanism.

## Gates

- Packet validator: 56/56 rows reconciled; 0 errors.
- Unit tests: 6/6 passed.
- Live official-source gate: 9 recall mappings and 6 primary PDFs checked; 0 source-scope mismatches and 0 failures.
- The live gate checks exact campaign, Honda make, Accord/Accord Hybrid model, required years, component/remedy terms, citation-to-card mapping, official host, HTTP success, and PDF signature.

The packet has no apply path. It exists for independent review and can only become a production mutation through a separately reviewed, guarded apply step.
