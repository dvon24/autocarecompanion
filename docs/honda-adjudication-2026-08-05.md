# Honda Known-Issues Priority Adjudication - 2026-08-05

## Status

Proposal only. Nothing in this packet authorizes a production database write, cache purge, deployment, archive, deletion, or public-page change. Independent review is required before any apply step.

This packet reconciles all 383 currently published Honda records but intentionally limits content changes to the two rows with recorded commerce clicks. The other 381 records remain byte-for-byte identical to the production snapshot and are explicitly pending full-record primary-source research.

## Frozen inventory

- Published records: 383
- Commerce-bearing records: 236
- Commerce claims: 516
- Outbound commerce-link occurrences: 842
- Valid product-detail links: 0
- Invalid, search, or category links: 842
- Clicked commerce records: 2
- Recorded clicks: 2, both on non-product search links
- Case-sensitive model labels: 21; case-normalized models: 20

Snapshot file SHA-256: `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`

Snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Proposed decisions

| Action | Count | Publication effect |
|---|---:|---|
| Correct clicked integrity | 1 | Published page retained |
| Remove invalid clicked search link | 1 | Published page retained |
| Keep published pending source | 381 | Byte-for-byte unchanged |
| Archive/delete/replace identity | 0 | None |

### Ridgeline rear-differential card

`honda-ridgeline-rear-differential-noise-2006` keeps its model, 2006-2014 scope, title, slug identity, symptoms, severity, confidence, status, and reporting telemetry.

The clicked recommendation incorrectly names Honda DPSF. Honda's official 2006 Ridgeline manual, page 242, says to always use Honda VTM-4 Differential Fluid and have the dealer replace it when the Maintenance Minder indicates service. The official 2014 boundary-year manual independently lists Honda VTM-4 Differential Fluid in its service-information summary.

The proposal:

- corrects the solution and owner guidance to Honda VTM-4;
- removes the Amazon search-results link;
- removes unsupported fixed cost and 30,000-50,000-mile claims;
- replaces generic complaint/forum citations with the two Honda boundary-year manuals;
- retains zero `fixParts` and adds no commerce.

ShowMeTheParts returned eight products in the 2006 Ridgeline fluid category, but they were coolant, fuel additive, ATF, and brake fluid. It returned no VTM-4 rear-differential-fluid candidate, so no substitute or guessed product link is proposed.

Primary sources:

- [2006 Honda Ridgeline Owner Manual](https://techinfo.honda.com/rjanisis/pubs/OM/AH/AJC0606OM/enu/JC0606OM.pdf)
- [2014 Honda Ridgeline Owner Manual](https://techinfo.honda.com/rjanisis/pubs/om/jc1414/jc1414om.pdf)

### S2000 AP1 valve-retainer card

`honda-s2000-valve-retainer-failure-2000` keeps every content and identity field. The only content-array change removes the clicked Amazon search-results URL; correction metadata records why it was removed.

Honda's 2000 S2000 manual warns owners not to enter the tachometer red zone and not to over-rev the engine on a downshift. It does not establish an AP2 valve-retainer conversion as a Honda remedy. ShowMeTheParts returned a timing-chain tensioner and VVT-solenoid filter for the 2000 S2000 valve-train category, not a valve retainer or spring. The proposal therefore adds no product, part number, remedy claim, or citation to the public card. The underlying retainer narrative remains pending same-identity primary-source review.

Primary source reviewed:

- [2000 Honda S2000 Owner Manual](https://techinfo.honda.com/rjanisis/pubs/OM/AH/AS20000OM/enu/S20000OM.pdf)

## Model-name anomaly

The production snapshot contains three rows labeled `Del Sol` and six labeled `del Sol`. They normalize to the same model and include likely overlapping distributor, rear trailing-arm, and targa-roof records. This packet does not silently normalize or deduplicate them because casing and duplicate handling can change grouping, URLs, page counts, and SEO. Review those nine rows as one bounded model cohort before any mutation.

## Verification

Generated packet: `data/known-issue-honda-adjudication-2026-08-05.json`

Packet SHA-256: `ec0cd964046712cb3bc186318af322f8b2ee7d925034dbbafe69187e9e18ac26`

Commands:

```powershell
node scripts\build-honda-adjudication.js
node scripts\validate-honda-adjudication.js
node --test scripts\validate-honda-adjudication.test.js
```

All five focused tests pass. The validator proves exact 383/383 ID reconciliation, exact before-state hashes, zero publication-state changes, 381 byte-equivalent keeps, identity preservation for both changed rows, exact allowed-field diffs, exact Honda manual URLs, no search/category commerce URL on either clicked proposal, and zero `fixParts` on both.

## Independent review order

1. Confirm the two Honda manual statements and that the Ridgeline recommendation correction is limited to VTM-4 and Maintenance Minder guidance.
2. Confirm the S2000 proposal changes only `communityRecommendations`, `contentUpdatedOn`, and `contentUpdateSummary`.
3. Confirm all 381 keep rows have identical before/proposal hashes.
4. Treat the Del Sol casing/duplicate cluster as a separate bounded review, not a mass normalization.
5. Do not approve production apply from this packet until the reviewer explicitly accepts the two changed rows.
