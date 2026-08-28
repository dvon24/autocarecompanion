---
title: 'Complete demo Twin trees and streamline Admin gallery'
type: 'bugfix'
created: '2026-08-28'
status: 'done'
review_loop_iteration: 0
baseline_commit: '6392faf8e1bf35632e143f9ad8644b55ec11f1a5'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The non-Challenger demos open sparse trees whose nodes lack part artwork, useful vehicle-specific descriptions, and applicable known-issue context. Hotspots also require repeated taps on mobile, while the Admin overview contains an unwanted large graph and the Twin Gallery hides the factory paint choices for each year/model.

**Approach:** Make every shipped demo a complete, evidence-honest product sample: populate model-specific service trees from the existing verified demo/release data, attach applicable published issues to the correct nodes, make mobile hotspots open reliably with one tap, remove only the 12-month Admin graph, and expose factory paint palettes with honest artwork-readiness states.

## Boundaries & Constraints

**Always:** Give every visible demo node a meaningful label, part/system image, vehicle-specific context, and service/issue state where verified; use existing part images; preserve the sample-state label; map known issues only when they apply to the exact demo year/model/engine; derive paint choices from manufacturer material for the represented year/model; distinguish the active rendered paint from factory colors whose layered art is not generated.

**Ask First:** Generating the missing color-layer image sets, production deployment, database writes, or expanding the public demo roster.

**Never:** Reuse Challenger part numbers/specifications on another model; invent maintenance history, product fitment, prices, issue applicability, or missing vehicle art; let an unavailable paint chip silently swap to the wrong render; remove the useful commerce/coverage bar panels when removing the requested overview graph.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Non-Challenger tree | Nautilus, Murano, or XT6 demo hotspot opens | Expanded nodes show images and useful model-specific descriptions; verified sample services and applicable issues appear in detail | Unsupported part numbers/prices remain explicitly unsourced rather than blank or borrowed |
| Mobile hotspot | User taps a visible vehicle marker once | Its mapped tree opens immediately with a touch target at least 44 px | A marker without a valid mapped branch is filtered out and cannot appear inert |
| Admin overview | Founder opens Overview | Large 12-month demand/click graph is absent; operational KPI, commerce, queue, and coverage panels remain | Partial API sources continue to degrade panel-by-panel |
| Paint palette | Founder views a Twin Gallery card/detail | Factory year/model colors appear; active art is marked rendered and missing color-layer sets are marked awaiting art | Unrendered colors cannot display a false preview |

</frozen-after-approval>

## Code Map

- `src/components/twin/demo-trees.js` -- model-specific graph definitions, node images/content, sample state, and known-issue annotations.
- `src/components/twin/stage/TwinStage.jsx` and `src/components/twin/hub/HubMinimal.jsx` -- hotspot touch behavior and hit targets.
- `src/lib/vehicle-twin-catalog.ts` -- exact demo identities, factory paint palettes, art availability, and evidence mappings.
- `src/components/admin/twins/TwinAdminShell.tsx` -- overview graph removal and Gallery paint presentation.
- `scripts/vehicle-twin-catalog.test.ts` -- catalog, tree-completeness, touch, graph-removal, and paint-honesty regressions.

## Tasks & Acceptance

**Execution:**
- [x] Expand Nautilus, Murano, and XT6 model-specific trees with existing part artwork, useful specs/service context, and exact applicable issue mappings.
- [x] Make mobile vehicle hotspots open their tree on the first tap and provide accessible minimum touch targets without breaking desktop hover/select behavior.
- [x] Remove the large Admin 12-month series graph while retaining the rest of the operational dashboard.
- [x] Add documented factory paint palettes to the catalog and render them in Gallery cards/detail with rendered-versus-awaiting-art labels.
- [x] Add focused structural and rendered-markup tests for every regression and honesty boundary.

**Acceptance Criteria:**
- Given any shipped demo, when each hotspot tree is opened, then its visible nodes contain part/system images and useful content rather than empty white circles or label-only placeholders.
- Given an applicable published issue for the demo YMMT, when its mapped node opens, then the issue is shown; non-applicable issues are absent.
- Given a mobile viewport, when a hotspot is tapped once, then the correct tree opens without repeated tapping.
- Given Admin Overview, when it renders, then the 12-month SVG graph is gone and all non-graph operational panels remain.
- Given Admin Twin Gallery, when a vehicle is inspected, then its real year/model paint choices are visible and only generated layered artwork is presented as ready.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts scripts/twin-transmission-tree.test.ts` -- all Twin/Admin regressions pass.
- `npx tsc --noEmit` -- typecheck passes.
- `npm run build` -- production build succeeds.

**Manual checks:**
- At desktop and mobile widths, open every hotspot on Challenger, Nautilus, Murano, and XT6; confirm one-tap mobile entry, node imagery/content, applicable issues, honest sample status, factory paint states, and the graph-free Admin overview.

## Suggested Review Order

**Demo completeness and issue truth**

- Model-specific service and issue trees are the main product change.
  [`demo-trees.js:15`](../../src/components/twin/demo-trees.js#L15)

- Catalog evidence binds exact demo identities, issue sets, and factory paint readiness.
  [`vehicle-twin-catalog.ts:122`](../../src/lib/vehicle-twin-catalog.ts#L122)

- Unsourced parts, prices, thumbnails, and issue links stay explicit and honest.
  [`TechTree.jsx:19`](../../src/components/twin/stage/TechTree.jsx#L19)

**Interaction and Admin presentation**

- Stage hotspots now open their mapped tree on the first activation.
  [`TwinStage.jsx:87`](../../src/components/twin/stage/TwinStage.jsx#L87)

- Minimal mobile hotspots retain desktop selection while opening immediately on touch.
  [`HubMinimal.jsx:38`](../../src/components/twin/hub/HubMinimal.jsx#L38)

- Admin removes the trend graph and exposes factory palettes without false previews.
  [`TwinAdminShell.tsx:43`](../../src/components/admin/twins/TwinAdminShell.tsx#L43)

**Regression coverage**

- Structural tests enforce complete rendered nodes and every reviewed exact-fit issue.
  [`vehicle-twin-catalog.test.ts:94`](../../scripts/vehicle-twin-catalog.test.ts#L94)
