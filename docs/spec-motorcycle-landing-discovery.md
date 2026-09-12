---
title: Motorcycle discovery below Common Error Codes
type: feature
created: 2026-09-12
status: done
baseline_commit: 9a8a0d4813e0834836b412c177a95b1019fc5786
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Visitors to the car Known Issues landing page cannot discover the motorcycle catalog. The user requests a second directory below Common Error Codes, not merely a navigation link.

**Approach:** Add a visibly grouped motorcycle directory using the current card, logo, typography, spacing and collapsible-section design. Use the exact user-approved headings Popular Makes - Motorcycles, All Makes - Motorcycle, Browse by Category - Motorcycle, then the existing footer. Link motorcycle destinations exclusively under /motorcycle-issues.

## Boundaries & Constraints

**Always:** Keep the automotive directory and Common Error Codes unchanged. Use only published motorcycle rows for available makes, model counts, issue counts and category coverage. Preserve vehicle-type separation for makes shared by cars and motorcycles. Keep a visible motorcycle catalog link even when published coverage is empty. Use honest empty states for the new sections rather than inventing available make pages. Keep desktop and mobile keyboard/touch access and unique section IDs.

**Ask First:** Publishing research, deploying, committing, changing catalog data or extending the directory to unrelated pages. Work in the existing public release workspace, preserving unrelated modifications and outputs.

**Never:** Promote pending motorcycle records to fill the directory; expose synthetic preview records publicly; route motorcycle makes into the automotive catalog; fabricate popularity rankings or show unavailable links as usable coverage; change Hub, billing or account flows.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Available coverage | Published motorcycle records | Configured popular makes with published coverage, all published makes, and category navigation appear beneath car error codes | Preserve normal database failure behavior; do not disguise an error as no coverage |
| Empty coverage | Zero published motorcycle records | The requested section headings and catalog link remain visible with concise not-yet-published copy | Do not render make or category links whose routes would be unavailable |
| Mixed catalog | Honda/BMW car and motorcycle rows | Motorcycle section uses motorcycle-only counts and destinations | Car directory remains independent |
| Small viewport | 390px width and expanded sections | Readable responsive grids, no horizontal overflow | Long make names wrap within cards |

</frozen-after-approval>

## Code Map

- `src/components/known-issues/catalog/IndexRoute.tsx` — shared index renderer and published directory builder; car landing insertion belongs immediately after the Common Error Codes section.
- `src/lib/known-issues-catalog.ts` — existing motorcycle popular-make list, canonical route root and make slug helper.
- `src/components/shared/MakeLogo.tsx` — existing make-logo presentation.
- `scripts/qa-motorcycle-catalog.cjs` — existing scoped catalog rendering fixtures and responsive checks.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/known-issues/catalog/IndexRoute.tsx` — reuse directory rendering through `DirectorySections.tsx` and load published motorcycle coverage for the automotive index immediately after Common Error Codes.
- [x] `scripts/qa-motorcycle-catalog.cjs` — extend fixtures/assertions for automotive landing with populated, empty and mixed-type motorcycle data; verify destinations, order, counts and mobile layout.
- [x] `docs/spec-motorcycle-landing-discovery.md` — record validation results and remaining review/deployment status.

**Acceptance Criteria:**
- Given the automotive landing page, when the user passes Common Error Codes, then Popular Makes - Motorcycles, All Makes - Motorcycle and Browse by Category - Motorcycle appear in that order before the footer.
- Given available motorcycle coverage, when a visitor selects a make/category, then they reach the corresponding motorcycle route rather than a car route.
- Given zero published coverage, when the directory renders, then its catalog entry remains discoverable without claiming that pending research is published.
- Given the standalone motorcycle index, when it renders, then it does not recursively embed a second motorcycle directory.
- Given 390px and 1280px viewports, when expanding All Makes and Browse by Category, then controls remain readable, keyboard accessible and within the viewport.

## Spec Change Log

## Design Notes

The user explicitly chose an inline directory below Common Error Codes rather than the earlier proposed header switcher. Do not add that alternative unnecessarily. DTC card consolidation remains a separate approved request; this navigation task must not silently replace or broaden it. The current empty published catalog is a content-release constraint, not a reason to hide the catalog entry point.

## Verification

- Run the existing motorcycle catalog harness with added landing fixtures, including desktop/mobile screenshots.
- Run TypeScript checking with the release workspace's established dependencies.
- Inspect actual expanded sections and link targets in the local preview; do not claim production changes.

### Implementation validation — 2026-09-12

- TypeScript passed: `node C:/Users/devon/autocarecompanion/node_modules/typescript/bin/tsc --noEmit --incremental false`.
- The fixture browser harness passed 17 rendered states at 390px and 1280px, with 88 published/type-scoped reads, zero real database writes and zero external network requests. The Windows compiler/browser run required sandbox escalation for local filesystem access.
- The new shared `DirectorySections` component renders in the harness and is explicitly excluded from its dynamic leaf stubs. Logo leaf fixtures preserve actual dimensions with local Honda/BMW PNGs and an initials fallback; other unrelated interactive islands remain stubbed.
- Assertions cover exact heading order below Common Error Codes and before the footer, unique IDs, canonical motorcycle make/category paths, pending-only exclusion, motorcycle-only model/issue counts for shared makes, alias normalization/deduplication, unknown-category exclusion, honest empty coverage, standalone-index non-recursion, and propagation of database failures.
- Browser checks expand both new collapsibles through keyboard input and verify links fit the viewport and the page has no horizontal overflow. A long motorcycle make name wraps inside its card.
- Review artifacts: `output/motorcycle-catalog-release/car-index-{390,1280}.png`, `car-empty-motorcycles-{390,1280}.png`, and `car-mixed-motorcycles-{390,1280}.png`, plus corresponding fixture HTML. These are synthetic local previews, not production screenshots.
- Root inspected the populated desktop and mixed/empty mobile screenshots: correct section order, readable wrapped makes, honest empty states and no duplicate catalog IDs.
- Two independent source reviews found the same preview-only labeling gap. Classified as a patch: the embedded directory now uses the existing isolated-preview guard and labels descriptions, counts and empty states as synthetic examples. The edge reviewer independently re-rendered six production/preview and popular/nonpopular/empty combinations and confirmed the finding resolved.
- Final browser rerun passes 19 route states at both widths (38 screenshots), 94 published/type-scoped reads, zero real writes or external requests. Populated and empty embedded-preview regressions were added. The root additionally ran the existing 12 actual shared car/motorcycle card scenarios successfully.
- No commit, push, deployment, catalog publishing, or database changes performed. The source is ready for user review; motorcycle research remains unpublished.

## Suggested Review Order

- Start where motorcycle coverage is inserted immediately after Common Error Codes.
  [IndexRoute.tsx:240](../src/components/known-issues/catalog/IndexRoute.tsx#L240)
- Shared directory layout preserves the automotive design and uses exact motorcycle headings.
  [DirectorySections.tsx:23](../src/components/known-issues/catalog/DirectorySections.tsx#L23)
- The preview guard distinguishes synthetic examples from published motorcycle coverage.
  [DirectorySections.tsx:30](../src/components/known-issues/catalog/DirectorySections.tsx#L30)
- Fixture coverage verifies boundaries, destinations, keyboard expansion and responsive layout.
  [qa-motorcycle-catalog.cjs:130](../scripts/qa-motorcycle-catalog.cjs#L130)

Review screenshots are synthetic fixtures, explicitly labeled in their banner. They demonstrate layout, not current production coverage. No local commit was created because the approved boundaries require asking first.
