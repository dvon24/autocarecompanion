---
title: 'Acura and Buick commerce-correctness release'
type: 'bugfix'
created: '2026-08-17'
status: 'in-progress'
baseline_commit: '3a572d8c45021ef797cb8d32818ef4cb887b2cfa'
review_loop_iteration: 1
context:
  - '_bmad-output/implementation-artifacts/spec-make-by-make-known-issue-part-links.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Production currently markets one generic OBD-II reader on an Acura issue spanning 1994–1999 even though 1994–95 use OBD1 and the named Acura manufacturer codes are not proven readable by that tool. Separately, Acura and Buick have 156 distinct direct-product URLs across 301 held placements and 56 issues, while only three reviewed links were published.

**Approach:** Make scanner commerce year- and capability-aware, then convert the frozen Acura/Buick discovery pool into a fresh-production-bound, independently reviewable release containing only exact product pages that match the article’s repair branch and proven vehicle scope. Preserve correct existing links, prefer a strong direct-retailer primary plus a vendor-distinct eBay alternate, and deploy the resulting code and guarded data batch together.

## Boundaries & Constraints

**Always:** Treat diagnostic tools separately from repair parts. For a mixed OBD1/OBD2 article, use the selected year when available; otherwise present accurate diagnostic guidance without a universal product CTA. Require explicit tool capability for manufacturer-specific codes. Re-freeze current Acura and Buick production rows before building the manifest. For each part candidate, bind issue, component, observed product identity, seller/vendor, YMMT/engine/application evidence, repair role, and exact PDP URL. Retain a correct existing link and add at most one vendor-distinct alternate. Key-merge approved changes and preserve unrelated article fields byte-for-byte. Record every candidate as approved, held, or rejected with a reason.

**Ask First:** Any article title/status/SEO identity change, new database field, or repair-prose rewrite beyond the diagnostic wording necessary to distinguish OBD1 from OBD2.

**Never:** Publish a raw-discovery hold; treat a search/category page as a PDP; infer fitment from a query or title alone; market a tool as a fixPart; recommend an OBD-II reader for a pre-1996 selection; widen a product beyond its evidenced years/engine/trim/application; replace an entire `fixParts` array when a keyed merge suffices; remove a correct existing retailer link merely to favor eBay; include another make; or bypass current-production before-state and release authorization checks.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| OBD1 selection | 1994–95 Integra distributor issue | OBD1 retrieval guidance; no AD310 CTA | Hold scanner commerce |
| OBD2 selection | 1996–99 with codes whose exact capability is proven | Compatible OBD-II product may render | Suppress when capability is unproven |
| Mixed/no year | 1994–99 issue without a selected year | Explain both diagnostic eras without universal scanner commerce | Fail closed |
| Exact part | PDP identity, repair role, and full vehicle scope agree | Key-merge primary and optional alternate | Reject any mismatch |
| Conditional or partial fitment | Product covers only part of article scope | Scoped variant or explicit hold | Never widen coverage |
| Existing good link | Existing reviewed PDP remains correct | Preserve it and optionally add one distinct alternate | No destructive replacement |
| Production drift | Live row differs from frozen before | Abort the affected write | Re-freeze and re-review |

</frozen-after-approval>

## Code Map

- `src/lib/diagnostic-procedures.js` — scanner capability and diagnostic-era decision boundary.
- `src/data/diagnostic-tools.ts` — public tool selection shared with audit evidence.
- `src/components/known-issues/IssueDiagnosticTools.tsx` — year-aware public diagnostic copy and CTA suppression.
- `src/components/known-issues/KnownIssueCard.tsx` and `src/components/vehicle/VehicleDashboard.tsx` — selected-year propagation.
- `data/known-issue-part-audit/acura/**/part-search-codex-discovery.json` — frozen Acura raw candidate pool.
- `data/known-issue-part-audit/buick/**/part-search-codex-discovery.json` — frozen Buick raw candidate pool.
- `scripts/finalize-known-issue-make-packet.js` — candidate/review reconciliation and guarded manifest creation.
- `scripts/apply-known-issue-catalog-deeplinks.js` — drift-checked production transaction.

## Tasks & Acceptance

**Execution:**
- [x] Add diagnostic-era/capability tests and implement year-aware scanner selection and copy.
- [x] Freeze fresh Acura/Buick production rows and reconcile all 301 held placements into an immutable review ledger.
- [x] Validate exact product identity, repair role, scope, URL/vendor safety, existing-link preservation, and two-link maximum.
- [x] Build deterministic guarded manifests/completions from approved rows; keep every hold/reject unapplied. (The fresh pool produced zero approvals, so the deterministic outcome is no new manifest or database write.)
- [ ] Run focused tests, TypeScript, ESLint, diff checks, dry-run/apply preflight, then apply and deploy only the approved Acura/Buick release.
- [ ] Verify exact production after-state and public rendering for OBD1, OBD2, mixed-year, primary-link, alternate-link, and hidden-fitment cases.

**Acceptance Criteria:**
- Given the 1994–99 Integra distributor issue, when no year or a 1994–95 year is selected, then no AD310 purchase link renders.
- Given a 1996–99 selection, when exact scanner capability is not proven for every named code, then scanner commerce remains suppressed.
- Given the 156 distinct discovered URLs, when review completes, then each URL/placement has an identity-bound terminal verdict and only approved rows enter the manifests.
- Given an approved part, when production renders it, then no more than two vendor-distinct exact PDPs appear and every required fitment dimension is enforced.
- Given live drift, a blocked candidate, or missing release evidence, when apply is attempted, then no database connection/write occurs.

## Spec Change Log

- 2026-08-17: Added an explicit OBD-era boundary to the shared scanner resolver and guidance-only rendering for pre-1996, mixed-era, and unproven manufacturer-code contexts. The selected year continues to flow through both public issue renderers; without a selected year, the article's full year range is evaluated and mixed-era commerce fails closed.
- 2026-08-17: Closed adversarial review findings by applying hybrid/EV suppression before VAG manufacturer-code selection, restoring supported no-code VCDS instructions, and making scan-procedure-only guidance avoid claiming the article named a code.
- 2026-08-17: Completed independent review of all 156 distinct raw-discovery URLs and 301 placements. The terminal result is 0 approved, 70 held, and 86 blocked URLs; therefore no new guarded manifest or database write was generated. The three previously approved links remain the exact deployed Acura/Buick release.

## Verification

**Commands:**
- Focused diagnostic, commerce, fitment, finalizer, and applicator tests — expected: all pass.
- `npx tsc --noEmit --incremental false` — expected: zero diagnostics.
- Affected-file ESLint and `git diff --check` — expected: clean.
- Guarded applicator dry-run followed by authorized apply — expected: exact approved count, zero drift.

## Dev Agent Record

### 2026-08-17 — Local implementation pass

- Implemented diagnostic-era classification and generic OBD-II suppression in `../../src/lib/diagnostic-procedures.js`.
- Exposed the shared scanner reason code through `../../src/data/diagnostic-tools.ts` and rendered accurate no-commerce guidance in `../../src/components/known-issues/IssueDiagnosticTools.tsx`.
- Added resolver, browser-selection, and server-rendered component coverage for 1994–95, mixed 1994–99, 1996+ generic, and Acura manufacturer-specific code paths.
- Confirmed the selected-year propagation already present in `KnownIssueCard.tsx` and `VehicleDashboard.tsx` supplies a one-year context when known and the article range otherwise; no renderer edit was required.
- No database connection, production write, deployment, git commit, or push was performed in this pass.

### 2026-08-17 — Independent raw-discovery review

- Acura: 141 URLs / 274 placements; 0 approve, 63 hold, 78 block URLs; 0/119/155 placements. Report SHA-256: `34842347130812ea916028dc96d66bc4836cfe53761b7c4a084535f23d0983aa`.
- Buick: 15 URLs / 27 placements; 0 approve, 7 hold, 8 block URLs; 0/13/14 placements. Report SHA-256: `f8f1bc35b6f759ec56c3116533bf0f47ca09a6895cb73dee337051a11dabb936`.
- Both reports bind the immutable discovery, queue, make-source, existing-claim, prior-review, and fresh-production read evidence; every URL and placement has a terminal verdict.
- Outcome: `NO_GUARDED_MANIFEST_OR_DATABASE_WRITE_GENERATED`. Existing live links and unrelated article fields remain unchanged.

**Local verification:**

- `node --test src/lib/diagnostic-procedures.test.js` — 13/13 passed.
- `..\..\node_modules\.bin\tsx.cmd --test src/data/diagnostic-tools.test.ts src/components/known-issues/IssueDiagnosticTools.test.tsx` — 26/26 passed.
- Commerce/fitment/finalizer/applicator focused suites — 160/160 passed.
- Affected-file ESLint, `tsc --noEmit --incremental false`, and `git diff --check` — clean (line-ending conversion warnings only).
