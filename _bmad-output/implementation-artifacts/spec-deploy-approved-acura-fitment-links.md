---
title: 'Deploy approved Acura fitment links'
type: 'feature'
created: '2026-08-19'
status: 'done'
review_loop_iteration: 0
baseline_commit: '013e4ef338fc3d2c42b8cc39f5fde43d6203755e'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Published Acura known issues currently expose only three product/service destinations, while the corrected workbook review found usable publishing paths for 61 of the other 63 supplied link occurrences. The shared diagnostic-tool component also recommends an OBD scanner whenever a DTC exists, which produces irrelevant scanner commerce on repairs such as the MDX timing-belt service.

**Approach:** Release the corrected repair-first Acura decisions as drift-guarded `fixParts`, apply the 12 required source-content corrections, and allow scanner commerce only when the repair instructions explicitly call for scanning. Apply the reviewed Acura batch transactionally, deploy production to refresh cached pages, and verify the published links and holds.

## Boundaries & Constraints

**Always:** Treat the final corrected review as the sole decision source: 63 reviewed occurrences, 36 Keep, 27 Replace, 61 occurrences with one or more approved paths, and two explicit holds. Preserve the three existing destinations outside that queue, distinguish occurrence/path/unique-URL/UI-CTA counts, encode narrower year/engine/trim fitment, label partial or companion products, deduplicate repeated destinations within an issue, and retain evidence and source fingerprints. Apply all 12 unique content corrections needed to make the repair text and offered products agree.

**Ask First:** Any new product research, substitution for an approved destination, publication of either held row, or production change beyond Acura data plus the shared explicit-scan rule.

**Never:** Reuse the prior category/DTC-based sourcing verdicts; infer commerce from a DTC; publish search/category pages; broaden a part beyond verified fitment; convert evidence/reference URLs into buy links; publish the VCM tuner for the 2010–2013 J37 MDX; or publish a distributor for the 1996–2004 RL until a complete VIN-matched unit is verified.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Approved supplied product | Keep decision with verified subset fitment | Create a verified product CTA with a visible scope/note | Reject missing issue, invalid host, or scope outside the article |
| Wrong supplied product | Replace decision with one or more scoped destinations | Publish only the approved replacement variants | Reject empty replacement unless it is one of the two named holds |
| DTC without scan instruction | MDX timing-belt solution plus P0340/P0341 | Show repair parts and no scanner commerce | Test fails if a DTC alone produces a scanner |
| Live source changed | Database hashes differ from the reviewed snapshot | No rows are written | Abort the transaction and report exact drift |

</frozen-after-approval>

## Code Map

- `data/acura-corrected-link-release/review-ledger.json` -- normalized, immutable copy of the 63 corrected occurrence decisions and content-correction requirements.
- `scripts/build-acura-corrected-link-release.js` -- converts the ledger and a read-only live Acura snapshot into a full-record, drift-guarded release manifest.
- `scripts/apply-known-issue-catalog-deeplinks.js` -- existing transaction, before-state, product-URL, result-artifact, and post-write verification boundary.
- `src/components/known-issues/IssueDiagnosticTools.tsx` and `src/data/diagnostic-tools.ts` -- shared rule that must stop deriving scanners from DTC presence alone.
- `src/lib/known-issue-commerce.ts` and `src/lib/known-issue-part-fitment.ts` -- public URL/vendor gate and machine-readable subset-fitment behavior.

## Tasks & Acceptance

**Execution:**
- [x] `data/acura-corrected-link-release/review-ledger.json` -- preserve every reviewed occurrence, supplied URL, final decision, approved destination, scope, evidence, and the 12 unique content corrections.
- [x] `scripts/build-acura-corrected-link-release.js` -- build idempotent full-record updates for only the 36 reviewed issues while preserving unrelated fields and the three existing out-of-queue destinations.
- [x] `scripts/build-acura-corrected-link-release.test.js` -- lock the 63/61/2 occurrence contract, approved URLs, holds, deduplication, fitment bounds, content corrections, and no evidence-to-commerce leakage.
- [x] `src/components/known-issues/IssueDiagnosticTools.tsx`, `src/data/diagnostic-tools.ts`, and tests -- require an explicit scan procedure before recommending a scanner.
- [x] `data/known-issues-catalog-deeplink-decisions/acura-corrected-links-final-hotfix-2026-08-19.json` -- generate from a fresh read-only production snapshot, dry-run, transactionally apply, verify, and retain the result artifact.
- [x] Production release -- build, deploy, and inspect representative Acura pages for CL ATF, Integra motor mounts, MDX timing service, TLX Type 3.1 fluid, plus both held rows.

**Acceptance Criteria:**
- Given the 66 supplied Acura occurrences, when the release is verified, then 64 have usable publishing paths, comprising three preserved existing occurrences plus 61 corrected reviewed occurrences, and the remaining two are named holds.
- Given a scoped or partial product, when a vehicle falls outside its verified subset, then the CTA is excluded; inside the subset, its limitation is visible.
- Given any Acura issue whose solution does not explicitly require scanning, when it renders with DTCs, then no scanner affiliate link appears.
- Given a rerun or concurrent content change, when before-state hashes do not match, then the operation is idempotent or aborts without a mixed database state.

## Spec Change Log

- 2026-08-19: Applied and verified the final 21-record Acura delta; deployed `dpl_Gr5gFUZhJWpfXqUa51qZEmzT44sc`.
- 2026-08-19: Final audit: 64/64 valid product links, zero invalid/search links, one recall-first gate, two review holds.

## Design Notes

The 64/66 figure is occurrence coverage, not the final number of distinct URLs or rendered buttons. Variant splits can create several destinations for one reviewed occurrence, while repeated replacements are deduplicated in the UI. Release reporting must state all three numbers separately.

## Verification

**Commands:**
- `node --test scripts/build-acura-corrected-link-release.test.js` -- expected: ledger, count, hold, fitment, and manifest tests pass.
- `..\..\node_modules\.bin\tsx.cmd --test src/data/diagnostic-tools.test.ts src/lib/known-issue-commerce.test.ts` -- expected: explicit-scan and public-commerce guards pass.
- `node scripts/apply-known-issue-catalog-deeplinks.js --dry-run --manifest data/known-issues-catalog-deeplink-decisions/acura-corrected-links-final-hotfix-2026-08-19.json` -- passed: clean before-state with only the final 21-record Acura delta pending.
- `npm run build` -- expected: production build succeeds before deployment.
- Apply, `--verify`, production deploy, and live page checks -- expected: verified result artifact, successful deployment, correct CTAs/scopes, and no DTC-only scanner on the MDX timing-belt issue.

## Suggested Review Order

**Repair-first release boundary**

- Start with the ledger-to-manifest conversion and its fail-closed contracts.
  [`build-acura-corrected-link-release.js:258`](../../scripts/build-acura-corrected-link-release.js#L258)

- Replacement scope derives only from the approved destination, never rejected evidence.
  [`build-acura-corrected-link-release.js:64`](../../scripts/build-acura-corrected-link-release.js#L64)

- The hotfix compares persisted fields canonically and emits only real drift.
  [`build-acura-corrected-link-hotfix.js:36`](../../scripts/build-acura-corrected-link-hotfix.js#L36)

**Public safety gates**

- Scanner recommendations now require an explicit diagnostic procedure.
  [`diagnostic-tools.ts:280`](../../src/data/diagnostic-tools.ts#L280)

- Recall-first records suppress every retail CTA until VIN eligibility is checked.
  [`known-issue-commerce.ts:232`](../../src/lib/known-issue-commerce.ts#L232)

- Scoped products fail closed for incomplete or incompatible selected vehicles.
  [`known-issue-part-fitment.ts:125`](../../src/lib/known-issue-part-fitment.ts#L125)

**Article context and cache**

- Matching selected vehicles supply real year and trim without fabricated defaults.
  [`known-issue-article-vehicle.ts:15`](../../src/lib/known-issue-article-vehicle.ts#L15)

- Versioned issue and date caches expose the verified production correction together.
  [`known-issues.ts:588`](../../src/lib/known-issues.ts#L588)

**Verification artifacts**

- Tests lock counts, holds, fitment isolation, roles, and recall behavior.
  [`build-acura-corrected-link-release.test.js:1`](../../scripts/build-acura-corrected-link-release.test.js#L1)

- The final snapshot records 64 valid links and zero invalid/search links.
  [`final-production-snapshot.json:1`](../../data/acura-corrected-link-release/final-production-snapshot.json#L1)
