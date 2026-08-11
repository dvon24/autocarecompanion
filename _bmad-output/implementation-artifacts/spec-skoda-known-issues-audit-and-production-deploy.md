---
title: 'Complete Skoda known-issues audit and production deployment'
type: 'chore'
created: '2026-08-11'
status: 'done'
baseline_commit: '32bec43571f3028856977175c6cc1013689f43fc'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Production has 60 published Skoda pages across seven models. Fourteen are uncited, 58 lack an obvious OEM/government primary source, four duplicate-looking clusters overlap, and some recall IDs contradict their frozen titles or vehicle scope. Eighteen rows also have no legitimate overlap with selectable YMMT trims, so filtering can hide them. A broad cleanup could change indexed URL meaning, hide model pages, or repeat the prior SEO loss.

**Approach:** Freeze the complete case-insensitive inventory, audit every model alphabetically against opened primary evidence, retain only bounded same-identity corrections, and make unsupported or conflicted rows byte-identical published holds. Independently review the complete packet before a hash-guarded production apply, build, deployment, and live verification.

## Boundaries & Constraints

**Always:** Preserve ID, make casing, model, years, trims, engines, category, title, severity, status, related IDs, valid owner telemetry, and all live commerce in the content packet; keep all 60 pages published; audit Enyaq, Fabia, Kodiaq, Octavia, Scala, Superb, then Yeti; enumerate case/Unicode make variants; verify source claims and YMMT/trim routing separately; keep unknown owner count at `0` without rendering “0+ owners”; add a no-buy boundary when no universal part is proven; abort on drift, incomplete coverage, citation mismatch, or catalog/model-count loss.

**Ask First:** Any archive, redirect, consolidation, new issue, title or indexed vehicle-metadata change, status/severity change, commerce removal, or retail-link addition.

**Never:** Use Volkswagen, Audi, SEAT, Cupra, or generic platform similarity as Skoda proof without an exact applicability path; infer prevalence, fitment, warranty, DTC, repair outcome, mileage, or cost; treat a search result, reachable URL, forum consensus, or old seed script as primary evidence; mutate held rows; touch unrelated workspace changes; deploy from dirty main.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Exact support | Primary evidence proves frozen identity and scope | Bounded prose/citation cleanup only | Reject expanded or unsupported claims |
| Weak/conflicted support | Evidence is sibling-only, generic, narrower, or contradicts title | Published byte-identical hold | Record conflict; do not rewrite under the indexed slug |
| False recall identity | Campaign belongs to another defect, year, or model | Keep the frozen row unchanged and flag it | Do not replace its body with the unrelated campaign |
| Duplicate-looking IDs | Two URLs cover a similar timing-chain, DSG, EGR, or cooling problem | Preserve both indexed identities | Require separate redirect/consolidation approval |
| Routing metadata mismatch | Frozen trim/engine has no exact YMMT overlap or substring matching creates a false fit | Hold the content row and create a separate evidence-backed correction candidate | No metadata write without explicit reviewed approval |
| Concurrent drift | Any live field differs after freeze | No partial write | Abort and regenerate from a new snapshot |
| Release | Reviewed retains pass every gate | Catalog stays 7,642; Skoda stays 60 with exact model counts | Stop on any test, build, deploy, API, or inventory failure |

</frozen-after-approval>

## Code Map

- `data/_skoda-deeplink-snapshot-2026-08-11.json` — immutable 60-row production baseline.
- `data/known-issue-skoda-primary-evidence-2026-08-11.json` — dated, hash-pinned evidence capture.
- `scripts/skoda-snapshot-contract.js` — case-insensitive inventory, file/internal hash, and per-field freeze gate.
- `scripts/skoda-model-adjudication-contracts.js` — model decisions and exact evidence boundaries.
- `scripts/build-skoda-model-adjudication.js` — deterministic packet builder.
- `scripts/validate-skoda-model-adjudication.js` — identity, source, owner-count, prose-precision, and commerce gates.
- `scripts/build-skoda-make-reconciliation.js` — complete model/row coverage proof.
- `scripts/build-reviewed-adjudication-apply-manifest.js` — reviewed live-state overlay with stale-write protection.
- `scripts/apply-known-issue-catalog-deeplinks.js` — transactional production applicator.
- `scripts/verify-reviewed-make-production.js` — exact make and catalog inventory gate.

## Tasks & Acceptance

**Execution:**
- [x] Freeze all case-insensitive Skoda rows and pin exact counts: Enyaq 2, Fabia 16, Kodiaq 9, Octavia 13, Scala 9, Superb 10, Yeti 1.
- [x] Build and validate deterministic per-model adjudication packets from opened exact evidence.
- [x] Explicitly adjudicate the four duplicate clusters, false recall identities, mechanical contradictions, Haldex scope, and the impossible 2020–2023 Kodiaq iV row without changing frozen identities.
- [x] Compare every row against YMMT and the production trim matcher; report all hidden/false-positive routes and stage metadata corrections separately from content.
- [x] Reconcile every frozen ID exactly once with zero identity, status, owner, commerce, or hold drift.

## Post-Review Release Checklist

- [ ] Run independent adversarial review and resolve every valid finding without weakening the frozen contract.
- [ ] Commit and push only reproducible Skoda audit artifacts; because the approved write set is empty, do not create a dummy manifest or production write.
- [ ] Include the reviewed Skoda artifacts in the final combined remaining-makes build and production deployment.
- [ ] Given a successful combined release, verify the production commit, deployment, catalog totals, Skoda totals, model counts, and representative live held content.

**Acceptance Criteria:**
- Given the frozen inventory, when reconciliation runs, then all 60 IDs appear once and no identity, status, owner telemetry, commerce, model count, or unrelated catalog count drifts.
- Given a retained rewrite, when validation runs, then each material claim is supported by exact opened evidence and citations use approved types and direct URLs.
- Given a hold, when packets and manifests build, then its full record remains byte-identical and produces no write.
- Given a trim/engine mismatch, when routing validation runs, then the affected ID and exact YMMT conflict are reported without silently changing indexed metadata.
- Given concurrent production change, when the manifest or applicator compares live state, then the batch aborts before any commit.

## Spec Change Log

- 2026-08-11: Completed the authorized local implementation without production mutation: pinned the 60-row freeze, produced seven deterministic all-hold packets, captured two exact conflict/scope sources, reported YMMT routing mismatches, and reconciled every frozen ID once. Result: 0 retained rewrites, 60 byte-identical published holds, and zero authorized writes.
- 2026-08-11: Separated completed local implementation from independent review and the user-authorized combined remaining-makes release. BMad Step 3 forbids remote operations, and an all-hold make must not receive a dummy manifest or database write merely to satisfy a checklist.
- 2026-08-11: Resolved independent-review findings outside the frozen contract: Unicode-normalized and independently counted the 7,642-page live inventory, added byte-pinned local evidence captures and a 60-row conservative review ledger, added the Kodiaq DSG duplicate candidate, classified all 3,061 issue/year/selectable-trim routes (including every substring-only route), added pre-write reconciliation gates and source-tree provenance, and retained the 0-write/60-hold result.

## Design Notes

Reuse the hardened SEAT freeze, evidence, mutation-test, stale-overlay, and global-count patterns, but derive Skoda contracts from its own snapshot and sources. Evidence determines the write set; validators never force a rewrite merely to make a packet look complete.

Local adjudication found no rewrite meeting the exact same-identity evidence threshold. The routing report identifies 19 rows with no exact selectable-trim overlap: 18 are hidden for all selectable trims, while `skoda-kodiaq-iv-battery` falsely matches `Active` through bidirectional substring matching. All routing corrections remain separate, unpopulated candidates with no write authority.

## Verification

**Local results (2026-08-11):** Skoda evidence validation, all seven packet validators, routing validation, make reconciliation, 39 JavaScript tests, two TypeScript production-matcher equivalence tests, targeted ESLint, TypeScript no-emit, and `git diff --check` all pass. Read-only live verification passed exact catalog, make, and model counts. Production apply, push, and deployment were not run; the reviewed write set is empty.

**Commands:**
- `node --test scripts/validate-skoda-model-adjudication.test.js scripts/verify-skoda-all-hold-live.test.js scripts/build-reviewed-adjudication-apply-manifest.test.js scripts/verify-reviewed-make-production.test.js` — deterministic positive, mutation, live-inventory, and shared release gates pass.
- `..\node_modules\.bin\tsx.cmd --test scripts/skoda-routing-equivalence.test.ts` — audit routing matches production trim normalization and matching behavior.
- `node scripts/validate-skoda-primary-evidence.js` — evidence fingerprints, pages, excerpts, model, and scope match.
- `node scripts/build-skoda-make-reconciliation.js` — 60 rows/seven models with zero drift and complete classification.
- `node scripts/verify-skoda-all-hold-live.js` — production remains at catalog 7,642, Skoda 60, with exact model counts and no stale held row.
- `npx tsc --noEmit --incremental false`, targeted ESLint, `git diff --check`, and `npm run build` — all exit 0.
- `vercel inspect <deployment>` plus authenticated API checks — production is Ready on the intended commit with reviewed content live.

## Suggested Review Order

**Conservative adjudication**

- Start with the independent 60-row decision ledger and zero-write authorization boundary.
  [`skoda-review-ledger.js:10`](../../scripts/skoda-review-ledger.js#L10)

- Follow packet construction consuming reviewed holds instead of inventing dispositions.
  [`build-skoda-model-adjudication.js:13`](../../scripts/build-skoda-model-adjudication.js#L13)

**Evidence and inventory integrity**

- Verify captured source bytes, required excerpts, and exact conflict-only use.
  [`validate-skoda-primary-evidence.js:30`](../../scripts/validate-skoda-primary-evidence.js#L30)

- Review Unicode make normalization, provenance, catalog total, and per-field freeze checks.
  [`skoda-snapshot-contract.js:12`](../../scripts/skoda-snapshot-contract.js#L12)

- Confirm all-hold release verification uses a read-only production transaction.
  [`verify-skoda-all-hold-live.js:14`](../../scripts/verify-skoda-all-hold-live.js#L14)

**Trim-routing accuracy**

- Inspect the shared mirror of production fail-open and substring matching behavior.
  [`known-issue-trim-routing-contract.js:12`](../../scripts/known-issue-trim-routing-contract.js#L12)

- Review per-year/selectable-trim route classification and zero metadata-write output.
  [`build-skoda-routing-report.js:25`](../../scripts/build-skoda-routing-report.js#L25)

**Reconciliation and regression proof**

- Confirm the make union, source-tree digest, and fail-before-write release gate.
  [`build-skoda-make-reconciliation.js:37`](../../scripts/build-skoda-make-reconciliation.js#L37)

- Check mutations covering holds, evidence, routing, duplicates, and reconciliation failure.
  [`validate-skoda-model-adjudication.test.js:29`](../../scripts/validate-skoda-model-adjudication.test.js#L29)

- Verify every frozen route remains equivalent to the TypeScript production matcher.
  [`skoda-routing-equivalence.test.ts:10`](../../scripts/skoda-routing-equivalence.test.ts#L10)
