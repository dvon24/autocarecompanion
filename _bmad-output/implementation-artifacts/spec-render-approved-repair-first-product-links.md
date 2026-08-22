---
title: 'Render approved repair-first product links safely'
type: 'bugfix'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: '89b5468437df3ca55dc2ca1547f61354a06894a6'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-deploy-approved-acura-fitment-links.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Honda-through-Kia repair-first batch contains 1,693 reviewed destinations, but the public commerce guard currently renders only 614. Most hidden destinations are real retailer-specific detail pages whose URL shapes are not recognized, while a smaller set of search, catalog, category, or vendor-mismatched links must remain hidden.

**Approach:** Add a deterministic, review-derived exception boundary for exact approved product destinations and vendor identities, without broadly loosening the structural guard. Make the batch generator and zero-AI checks prove which reviewed links will render and which remain excluded before any database write.

## Boundaries & Constraints

**Always:** Preserve HTTPS/public-host validation, `verified === true` requirements on both part and link, issue-level recall-first suppression, exact vendor/destination consistency, duplicate removal, and owned Amazon/eBay affiliate attribution. Treat `linkType: catalog` as non-renderable. Derive exceptions only from the approved repair-first artifact, normalize them deterministically, and keep generated output reviewable and reproducible.

**Ask First:** Replacing any destination, changing a review decision or fitment claim, allowing a marketplace URL shape other than the existing Amazon product and eBay item forms, or publishing the database batch.

**Never:** Allow a whole retailer host, trust `verified: true` by itself, admit query/search/category/catalog pages, convert evidence URLs into commerce, bypass recall-first behavior, or write to production merely because the code tests pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Reviewed direct product | Exact approved HTTPS destination and matching reviewed vendor | Link survives both guards and renders | Fail closed if the generated review entry is missing or malformed |
| Unreviewed neighbor | Same retailer with a different path, search query, category, or catalog URL | Link remains hidden | Test must fail if the broader URL is accepted |
| Catalog-marked review row | `linkType: catalog` even if the host/path resembles a product | No public CTA | Report it as intentionally excluded |
| Vendor alias | Reviewed vendor label differs from the registrable-domain label | Permit only the exact reviewed vendor/destination pairing | Any other vendor label remains hidden |
| Marketplace or recall | Amazon/eBay/RockAuto special shape, or any issue with `recallFirst` | Existing marketplace rules and issue-level suppression remain authoritative | Do not add review exceptions that bypass either rule |

</frozen-after-approval>

## Code Map

- `src/lib/known-issue-commerce.ts` -- public URL, vendor, verification, recall, deduplication, and affiliate boundary.
- `src/lib/known-issue-reviewed-retailer-links.ts` -- generated exact reviewed product paths and vendor/destination identities.
- `scripts/build-repair-first-verified-batch.mjs` -- deterministic source for the gated persistence artifact and reviewed-link manifest.
- `scripts/_check-render-guard.ts` -- pre-persist batch visibility report.
- `scripts/known-issue-commerce.test.ts` -- regression coverage for accepted exact products and rejected near-neighbors.
- `data/repair-first-honda-hyundai-infiniti-jaguar-jeep-kia-2026-08-22-gated.json` -- approved batch input; not production state.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/build-repair-first-verified-batch.mjs` and generated manifest -- emit stable, deduplicated review exceptions only for approved direct-product rows.
- [x] `src/lib/known-issue-commerce.ts` -- consume exact exceptions while retaining every existing safety and recall gate.
- [x] `scripts/known-issue-commerce.test.ts` -- cover representative OEM, specialist, alias, catalog, query, neighboring-path, marketplace, and recall cases.
- [x] `scripts/_check-render-guard.ts` -- distinguish renderable reviewed products from intentional exclusions and exit nonzero for unexpected hidden product links.

**Acceptance Criteria:**
- Given the approved batch, when the render audit runs, then every eligible reviewed direct-product link passes both guards and every exclusion is named by reason.
- Given a different URL on an approved host, when it is not the exact reviewed destination, then the review exception does not authorize it.
- Given the existing corpus, when commerce tests run, then verification, recall-first, vendor, marketplace, deduplication, and affiliate behavior remains unchanged.
- Given successful focused tests, when the production build is attempted, then no database write or deployment occurs until the separate persistence and release gates pass.

## Spec Change Log

## Design Notes

The exception data is generated rather than hand-maintained because the approved review artifact is the source of truth. Exceptions should be exact normalized destinations (and exact vendor/destination pairs where an alias is needed), not reusable host patterns. This gives future make batches a repeatable generation step without turning a reviewed URL into permission for every page on that retailer.

## Verification

**Commands:**
- `.\node_modules\.bin\tsx.cmd --test scripts\known-issue-commerce.test.ts` -- expected: all structural, identity, recall, and affiliate tests pass.
- `.\node_modules\.bin\tsx.cmd scripts\_check-render-guard.ts data\repair-first-honda-hyundai-infiniti-jaguar-jeep-kia-2026-08-22-gated.json` -- expected: zero unexpected hidden direct-product links and explicit intentional exclusions.
- `npx tsc --noEmit` -- expected: no TypeScript errors.
- `npm run build` -- expected: the same production build command used by Vercel succeeds before persistence or deployment.

## Suggested Review Order

**Approval generation**

- Start with the fail-closed product-versus-catalog decision boundary.
  [`build-repair-first-verified-batch.mjs:83`](../../scripts/build-repair-first-verified-batch.mjs#L83)

- Explicit link-type families prevent malformed review rows becoming products.
  [`build-repair-first-verified-batch.mjs:189`](../../scripts/build-repair-first-verified-batch.mjs#L189)

- Per-make modules make later approvals replaceable and revocable.
  [`build-repair-first-verified-batch.mjs:286`](../../scripts/build-repair-first-verified-batch.mjs#L286)

- Human-readable comments preserve exact reviewed destinations beside fingerprints.
  [`honda.ts:4`](../../src/lib/known-issue-reviewed-retailer-links/honda.ts#L4)

**Public safety boundary**

- Structural URL checks reject searches, lists, catalogs, and malformed paths.
  [`known-issue-commerce.ts:73`](../../src/lib/known-issue-commerce.ts#L73)

- Issue-level recall suppression and cross-part deduplication remain authoritative.
  [`known-issue-commerce.ts:282`](../../src/lib/known-issue-commerce.ts#L282)

**Release proof**

- The pre-persist audit executes the actual public commerce model.
  [`_check-render-guard.ts:7`](../../scripts/_check-render-guard.ts#L7)

- Exact module comparison detects stale, missing, or injected approvals.
  [`_check-render-guard.ts:92`](../../scripts/_check-render-guard.ts#L92)

- Regression cases cover exact approvals and rejected neighboring destinations.
  [`known-issue-commerce.test.ts:40`](../../scripts/known-issue-commerce.test.ts#L40)

- Cross-part and fragment duplicates prove issue-wide CTA deduplication.
  [`known-issue-commerce.test.ts:210`](../../scripts/known-issue-commerce.test.ts#L210)
