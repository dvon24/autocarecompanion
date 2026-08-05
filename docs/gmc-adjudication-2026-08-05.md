# GMC known-issues adjudication handoff

Status: proposal only. This branch does not write production, archive records, purge caches, change public pages, or deploy.

## Frozen scope

- Make: GMC
- Published records reviewed: 173
- Model groups: 19
- Production snapshot: `data/_gmc-deeplink-snapshot-2026-08-05.json`
- Snapshot SHA-256: `2820e5e553196f9acfbbe7e1dda2d98d4be8c2431d1e83e6777063a73e7229f5`
- Adjudication packet: `data/known-issue-gmc-adjudication-2026-08-05.json`
- Packet SHA-256: `df0b87f9860e3a2206c5de080b9f6a47ef1c80bd9216cce3bd88c448ce9dd757`

## Proposed decisions

| Action | Count |
| --- | ---: |
| Same-identity, primary-source rewrite | 21 |
| Keep the current published record byte-for-byte unchanged pending a same-identity source | 152 |
| Archive | 0 |
| Total | 173 |

All 152 keep decisions have identical before/proposal hashes. They preserve the current title, content, metadata, slug identity, and published status. The packet deliberately proposes no commerce links because it does not contain verified product-level repair-role and fitment evidence.

## Why the earlier GMC audit was rejected

The previous artifacts frequently assigned consecutive official recalls to unrelated existing IDs. Examples included:

- P0011 VVT-solenoid content replaced by a brake-booster hose recall.
- 3.6L Canyon oil consumption replaced by a seat-belt-buckle recall.
- Sierra instrument-cluster stepper-motor content replaced by a 6.2L engine-bearing recall.
- Hummer EV SUV infotainment content replaced by an electronic owner-manual recall.
- Acadia 9T65 harsh-shift content assigned an 8L45/8L90 bulletin that does not cover the claimed transmission.

An official source is not sufficient unless it supports the same component, symptom, vehicle, and scope. The new packet rejects those substitutions without removing the existing pages.

## Source gates

- 15 recall-backed rows checked against 14 exact NHTSA campaign-number API responses.
- Every campaign check validates campaign number, GMC make, exact model, every proposed year, and issue-specific source terms.
- Six unique GM bulletin URLs returned direct NHTSA PDFs with the PDF signature.
- The 21 rewrites have exact frozen year scopes and one primary citation each.
- The 152 held rows are byte-for-byte identical to the frozen production snapshot.
- No proposal has `status: archived`.

## Reproducible checks

```powershell
node scripts\build-gmc-adjudication.js
node scripts\validate-gmc-adjudication.js
node scripts\verify-gmc-primary-sources.js
node --test scripts\audit-known-issue-catalog-deeplinks.test.js scripts\showmetheparts-known-issue-candidates.test.js scripts\validate-genesis-adjudication.test.js scripts\validate-gmc-adjudication.test.js
```

## Independent-review instructions

Review every rewrite row in `data/known-issue-gmc-adjudication-2026-08-05.json`, especially component identity, model years, engine/equipment scope, and whether the prose says no more than the linked primary source. Spot-check the keep rows to confirm that the rejected earlier title is unrelated and that `beforeSha256` equals `proposalSha256`.

Do not apply, merge, deploy, or mutate production during review. Report blockers by issue ID. The 152 keep decisions remain a separate deep-research queue; they are not evidence that the underlying content has been fully verified.
