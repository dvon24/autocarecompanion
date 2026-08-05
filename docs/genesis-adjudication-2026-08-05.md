# Genesis known-issues adjudication handoff

Status: proposal only. This branch does not write the production database, purge caches, change public pages, or deploy.

## Frozen scope

- Make: Genesis
- Published records reviewed: 63
- Models: G70, G80, G90, GV60, GV70, GV80, and GV80 Coupe
- Production snapshot: `data/_genesis-deeplink-snapshot-2026-08-05.json`
- Snapshot SHA-256: `9297b6522903bb69b7cad5fcfdcbb6a93535103b072472b4efd73b072c2d8432`
- Adjudication packet: `data/known-issue-genesis-adjudication-2026-08-05.json`
- Packet SHA-256: `b2f30812dded70e3d57fd3aa3d8a7838df9a395f6cad1d04f250015e49010bf1`

## Proposed decisions

| Action | Count |
| --- | ---: |
| Rewrite within the existing issue identity, then publish | 36 |
| Archive as a duplicate | 1 |
| Archive because the evidence does not support the issue identity or scope | 26 |
| Total | 63 |

The packet deliberately proposes no commerce links. The verified conditions are mostly VIN-scoped recalls, software campaigns, dealer procedures, or configurations for which the frozen ShowMeTheParts evidence does not establish one exact repair part and fitment.

## Safety rules applied

- An unrelated recall or bulletin never replaces the issue named by an existing ID.
- A rewrite must retain the original component and symptom identity.
- Model years, engines, and production dates are narrowed to the cited primary document.
- `trims` contains trim names only; applicability prose is prohibited.
- Every proposed citation is a direct `static.nhtsa.gov` PDF.
- All proposals remain `humanApproved: false` until an independent row-by-row review.

Examples of rejected matches include a Hyundai Genesis (DH) sunroof bulletin attached to a Genesis G90 row, a non-retailed dealer-stock brake campaign presented as a multi-year GV70 owner issue, a starter recall attached to G70 oil consumption, and a trunk-latch recall attached to brake-rotor pulsation.

## Reproducible gates

Run from the repository root:

```powershell
node scripts\build-genesis-adjudication.js
node scripts\validate-genesis-adjudication.js
node scripts\verify-genesis-citation-documents.js
node --test scripts\audit-known-issue-catalog-deeplinks.test.js scripts\showmetheparts-known-issue-candidates.test.js scripts\validate-genesis-adjudication.test.js
```

The citation gate checked all 29 unique proposed NHTSA documents for a successful response, a `static.nhtsa.gov` final URL, and PDF content. The packet validator checks all 63 before/proposal hashes, action counts, citation hosts, status rules, empty commerce fields, trim hygiene, and the independent-approval flag.

## Independent-review instructions

Review every row in `data/known-issue-genesis-adjudication-2026-08-05.json`, with particular attention to:

1. Whether each of the 36 rewrites preserves the original issue identity.
2. Exact model-year, engine, drivetrain, VIN, and production-date scope in the cited document.
3. Whether each description and solution says no more than its primary source.
4. The 26 unsupported decisions and the single G80 duplicate decision.
5. The absence of applicability prose in `trims` and the deliberate absence of unverified commerce links.

Do not apply, merge, deploy, or mutate production during the independent review. Report blockers by issue ID so the proposal can be corrected before any separately authorized apply step is designed.
