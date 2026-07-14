---
title: 'Correct eight Known Issues links and disclose the corrections'
type: 'bugfix'
created: '2026-07-14'
status: 'done'
baseline_commit: '4c4bb5837125e695cfc9daa97c6ef6f8e1bfdc9d'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** Eight published issues contain 18 wrong recommendations and three incomplete `fixParts`; 13 searches drew 28 clicks at below 1% conversion. Readers cannot see corrections.

**Approach:** Audit against each published repair, remove unsupported products, add four proven pages, and leave six issues without retail CTAs. Show explicit correction metadata on collapsed cards.

## Boundaries & Constraints

**Always:** Touch eight named IDs. Search Amazon, eBay, then exact direct sources. Links must match repair, part number, and fitment. Preserve tips/warnings/unrelated data. Preflight fully, write transactionally, default to dry-run, and remain idempotent. Store ISO-date `contentUpdatedOn` plus `contentUpdateSummary`, never derived from `updatedAt`/`reviewedOn`. Record evidence, before/after, and separated timing.

**Ask First:** Expand scope, alter other copy/year coverage, replace drifted listings, add history/admin editing, or redesign the notice. Pacifica's 12-inch to 10.1-inch Uconnect 5 correction is included.

**Never:** Call an LLM API, change effort, run the broad pipeline, publish search URLs, guess fitment, misstate a partial repair, monetize recalls, or label eBay as Amazon.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output | Failure behavior |
|---|---|---|---|
| Proven products | Wrong Probe assembly and Trax `12652328` | Probe Cardone `47-1755`/`47-1756`: `https://www.wheelerfleet.com/product/motor-p-window/1349803`, `https://www.buyautoparts.com/buynow/17-41893_cpcx`. Trax GM `25193922` LUV/LUJ/VIN B and `12707589` LE2/VIN M: `https://www.ebay.com/itm/318200076111`, `https://www.ebay.com/itm/286423616243` | Reject ambiguous, partial, or broad-fit pages |
| No safe product | Pacifica 4, Q5 1, TTS 1, e-tron 6, S8 2, Taos 2; Q5/TTS/S8 search fix parts | Remove 16 recs and nine links; remove Q5/TTS parts; retain S8 `079115175G` recall-first without buy links | No CTA until published scope supports one |
| Public notice | Valid date and summary | Collapsed-header line: emerald check + `Updated Jul 14, 2026`, then muted `· summary`; wrap | Semantic `<time>`, text plus color, hidden decorative icon, no alert role |
| Missing metadata | Empty/invalid field | Existing layout, no notice | Never render partial/invalid dates |
| Drift/re-run | State differs or result exists | Drift writes nothing; re-run reports `already-applied` | Name mismatch; never partial/duplicate |
| Schema rollout | Production lacks columns | Idempotent direct DDL runs and verifies before Prisma code/data writes | Stop if verification fails |

</frozen-after-approval>

## Code Map

- `prisma/schema.prisma`, `scripts/apply-known-issue-update-metadata.js` -- public fields/DDL.
- `src/schemas/knownIssue.schema.ts`, `src/lib/known-issues.ts`, `src/lib/dtc-codes.ts`, `src/app/api/known-issues/route.ts` -- type/mappers.
- `src/components/known-issues/KnownIssueCard.tsx` -- collapsed notice; leave dirty admin code alone.
- `data/_ultra-deeplink-sample-{decisions,result}.json`, `scripts/_apply-ultra-deeplink-sample.{js,test.js}` -- evidence, mutation, tests.
- `docs/known-issues-ultra-deeplink-sample-2026-07-14.md` -- final report.

## Tasks & Acceptance

**Execution:**
- [x] `prisma/schema.prisma`, `scripts/apply-known-issue-update-metadata.js` -- add default-empty strings and `--check`/`--apply`; enforce DDL-before-deploy.
- [x] `src/schemas/knownIssue.schema.ts`, `src/lib/known-issues.ts`, `src/lib/dtc-codes.ts`, `src/app/api/known-issues/route.ts`, `src/components/known-issues/KnownIssueCard.tsx` -- map metadata and render UTC-formatted accessible copy.
- [x] `data/_ultra-deeplink-sample-decisions.json`, `scripts/_apply-ultra-deeplink-sample.{js,test.js}` -- encode counts, notices, exact preconditions, transform, and idempotence.
- [x] `data/_ultra-deeplink-sample-result.json`, `docs/known-issues-ultra-deeplink-sample-2026-07-14.md` -- capture verified evidence and timing.

**Acceptance Criteria:**
- Given the baseline, when applied, then 18 recommendations/nine searches are gone, four links are added, and unrelated values are unchanged.
- Given the six held issues, when rendered, then no retail CTA appears; useful tips/recall guidance remain.
- Given correction metadata, when collapsed, then accessible date/summary is visible and wrapping; unmarked cards are unchanged.
- Given drift/re-run, when executed, then no partial writes/duplicates occur; the report separates timing and marks prior Sol/4.6 effort unknown.

## Spec Change Log

- 2026-07-14 - Expanded to all commerce in eight issues.
- 2026-07-14 - Added public correction metadata/notice.

## Design Notes

All notices use `2026-07-14`. Summaries: Probe, “Corrected part and left/right fitment.” Trax, “Corrected outlet part numbers and engine/VIN fitment.” Pacifica, “Removed unrelated parts; clarified software-first repair.” Q5, “Removed an incomplete timing-chain kit.” TTS, “Removed an unverified damper pending fitment.” e-tron, “Removed products; recall 93U9 is the repair path.” S8, “Removed retail links; recall 21H7 is the repair path.” Taos, “Removed unrelated parts; repair requires dealer diagnosis.” Internal artifacts retain history; public fields show the latest correction.

## Verification

- Run metadata `--check`, Node tests, and data `--dry-run`; expect 8 notices, 18 removals, 3 fix-part transitions, 9 removed links, 4 additions, zero writes.
- Run lint, build, and post-apply `--verify`; inspect corrected, recall, and unmarked cards at mobile/desktop widths.

## Suggested Review Order

**Decision contract and safe write**

- Exact marketplace policy and per-row decisions drive every mutation.
  [`_ultra-deeplink-sample-decisions.json:4`](../../data/_ultra-deeplink-sample-decisions.json#L4)

- Guarded transaction fails closed and stages evidence before committing all eight rows.
  [`_apply-ultra-deeplink-sample.js:373`](../../scripts/_apply-ultra-deeplink-sample.js#L373)

- Verification cross-checks live rows against the machine-readable result artifact.
  [`_apply-ultra-deeplink-sample.js:277`](../../scripts/_apply-ultra-deeplink-sample.js#L277)

- Result preserves exact affected-field before/after state and separated timing.
  [`_ultra-deeplink-sample-result.json:4`](../../data/_ultra-deeplink-sample-result.json#L4)

**Public correction disclosure**

- Schema separates meaningful public corrections from mechanical row timestamps.
  [`schema.prisma:493`](../../prisma/schema.prisma#L493)

- Idempotent DDL enforces non-null empty defaults before application rollout.
  [`apply-known-issue-update-metadata.js:35`](../../scripts/apply-known-issue-update-metadata.js#L35)

- Strict UTC parsing prevents timezone shifts and silently rejects invalid dates.
  [`KnownIssueCard.tsx:35`](../../src/components/known-issues/KnownIssueCard.tsx#L35)

- Collapsed cards show accessible, non-alert correction text with responsive wrapping.
  [`KnownIssueCard.tsx:366`](../../src/components/known-issues/KnownIssueCard.tsx#L366)

- Every mapper path carries correction metadata, including DTC-derived cards.
  [`dtc-codes.ts:48`](../../src/lib/dtc-codes.ts#L48)

**Evidence and supporting checks**

- Boundary tests cover alternate searches, vendor identity, drift, and artifact consistency.
  [`_apply-ultra-deeplink-sample.test.js:125`](../../scripts/_apply-ultra-deeplink-sample.test.js#L125)

- Report captures conversion baseline, exact decisions, rendered checks, and timing caveats.
  [`known-issues-ultra-deeplink-sample-2026-07-14.md:1`](../../docs/known-issues-ultra-deeplink-sample-2026-07-14.md#L1)

- Pre-existing repository lint debt remains explicitly outside this story.
  [`deferred-work.md:1`](deferred-work.md#L1)
