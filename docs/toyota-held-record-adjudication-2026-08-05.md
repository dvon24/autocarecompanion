# Toyota held-record adjudication — 2026-08-05

Status: proposal only. No database write, cache purge, deployment, or public
status change is authorized by this packet. Independent Opus review is required
before an apply manifest may be generated.

## Frozen scope

- Input: `data/_toyota-hold-review-packet.json`
- Input SHA-256:
  `3e5cde0a2d1b30abb7cde144e4427afbf33187553b8bfaf3804085d987c1d956`
- Rows: 91 exactly — Camry 49, Corolla Cross 15, RAV4 27
- Diagnostic comparison: `data/_toyota-classified.json`
- Diagnostic SHA-256:
  `1823d426d55c20df272456a837a482a5de4f7be91559b51944507542c9d832dd`

The diagnostic file was treated as a challenge set, not an instruction. Its
automated `rewrite-then-republish` labels were rejected whenever a record had no
traceable source, used a generic DTC as a part diagnosis, combined incompatible
vehicle systems, or lacked a defensible model-year scope.

## Final proposal counts

| Model | Keep audited replacement | Rewrite, then publish | Archive with canonical | Keep archived | Total |
|---|---:|---:|---:|---:|---:|
| Camry | 2 | 16 | 3 | 28 | 49 |
| Corolla Cross | 0 | 8 | 1 | 6 | 15 |
| RAV4 | 0 | 8 | 3 | 16 | 27 |
| **Toyota** | **2** | **32** | **7** | **50** | **91** |

If every rewrite is independently approved, the 91-row held cohort would end
with 34 published rows and 57 archived rows. This is not a blanket restore: 50
records remain archived on evidentiary grounds, and seven archived records point
to a reviewed canonical topic.

## What changed from the earlier disposition draft

- The two Camry water-pump replacements remain published as audited.
- Owner reports may support a clearly labeled owner-reported page; the absence
  of an OEM bulletin alone is not a deletion rule.
- The scope was narrowed to the actual evidence wherever a source identifies a
  model year or configuration. Examples include the 1996 Camry power-window
  report, 2007 Camry V6 mount report, 2023 Corolla Cross Hybrid XSE whistle,
  and 2017 RAV4 brake complaints.
- Generic codes remain archived when the old page converted a DTC into a failed
  sensor, catalyst, coil, hose, MAF, canister, pump, or wiring diagnosis.
- Uncited records, fake or placeholder citations, unrelated bulletins, ordinary
  external damage, and unsupported cross-generation parts bundles remain dark.
- Toyota `T-SB-0330-17` replaces the unrelated FCA water-leak citation on the
  2018 Camry transmission page and limits that page to the bulletin's A25A-FKS,
  UA80E, symptom, production-change, and VIN gates.
- The RAV4 alternator page was deliberately left archived after drafting began:
  its one cited forum page did not expose a defensible model year, so publishing
  it would have invented scope.

## Rewrite rules applied to all 32 drafts

- The title labels the page as owner reports, owner complaints, or an exact
  Toyota bulletin.
- Descriptions separate observed symptoms from inferred causes and never turn
  anecdotes into fleet prevalence.
- Solutions begin with reproduction, measurement, stored-data capture, or
  exact configuration checks. No page diagnoses a part from a sound, warning,
  DTC, or complaint alone.
- `fixParts` is empty. Costs and mileage bands are null. No Amazon, eBay,
  RockAuto, search-result, or category URL survives.
- Every draft has at least one titled, direct HTTPS citation. A source probe on
  2026-08-05 returned HTTP 200, 202, or access-controlled 403 for every URL;
  zero URLs returned 404 or failed to resolve.
- Existing IDs remain stable. Every title restoration is separately marked for
  identity review because the production gate correctly blocks silent topic
  substitution.
- Seven duplicate or consolidated records declare exact canonical IDs instead
  of becoming unexplained dead pages.

## Review artifacts

- Complete 91-row decision set:
  `data/known-issue-toyota-adjudication-2026-08-05.json`
- Camry decisions and 16 field-level drafts:
  `data/known-issue-toyota-camry-adjudication-2026-08-05.json` and
  `data/known-issue-toyota-camry-rewrite-proposals-2026-08-05.json`
- Corolla Cross decisions and eight field-level drafts:
  `data/known-issue-toyota-corolla-cross-adjudication-2026-08-05.json` and
  `data/known-issue-toyota-corolla-cross-rewrite-proposals-2026-08-05.json`
- RAV4 decisions and eight field-level drafts:
  `data/known-issue-toyota-rav4-adjudication-2026-08-05.json` and
  `data/known-issue-toyota-rav4-rewrite-proposals-2026-08-05.json`
- Human-readable Camry reasoning:
  `docs/toyota-camry-adjudication-2026-08-05.md`
- Validator and tests:
  `scripts/validate-toyota-adjudication.js` and
  `scripts/validate-toyota-adjudication.test.js`

Each rewrite row freezes the SHA-256 of the corresponding audited after-state.
The validator rejects input drift, missing or extra IDs, overlapping actions,
bad totals, parent/subset disagreement, source-hash changes, unsupported patch
fields, search URLs, missing citations, archive-prefixed titles, nonempty parts,
cost or mileage claims, applicability prose in trims, and commerce language.

## Required Opus review

Opus should review the packet as an adversary and report per-ID findings. In
particular it should challenge:

1. Whether each proposed year, trim, engine and title is no broader than its
   cited evidence.
2. Whether any owner-report page still implies prevalence, a shared cause, or a
   confirmed Toyota defect.
3. Whether safety guidance is proportionate without inventing a remedy.
4. Whether each title change preserves the original slug's search intent rather
   than substituting a new topic.
5. Whether the seven canonical targets are live, materially equivalent, and the
   best redirect or relationship destination.
6. Whether any cited page is a homepage, placeholder, search result, unrelated
   bulletin, or materially different vehicle/configuration.
7. Whether a proposed publication should remain archived instead of being
   weakened into generic maintenance advice.

## Apply gate after approval

Only after all blockers are resolved:

1. Freeze the reviewed artifacts and their SHA-256 values.
2. Capture the current production full-record state for every affected ID.
3. Generate a separate apply manifest containing only approved rows.
4. Begin one guarded transaction, lock every target, and reject any mismatch
   between production and each proposal's frozen before hash.
5. Apply only the reviewed fields, preserve IDs and make/model/category identity,
   and add exact canonical relationships for the seven archived duplicates.
6. Verify every post-write field before commit; rollback the entire transaction
   on one mismatch.
7. Run the restoration and SEO regression gates, then purge Vercel Data Cache
   and verify live model pages, year filters, trim filters, canonical behavior,
   metadata, and structured data.

Until those steps pass, Toyota production remains unchanged.
