---
title: 'Restore demo hub evidence, navigation, and admin design fidelity'
type: 'feature'
created: '2026-08-27'
status: 'done'
review_loop_iteration: 0
baseline_commit: '07b5c406c605eeed4f72d68b4d1146d2520cb865'
context:
  - 'design/release/2026-08-24/Au7o Admin.html'
  - 'data/_HANDOFF-TO-SOL.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The public hero and demo hub have diverged from the authored Twin experience: Engine Air Filter is duplicated as a vehicle hotspot, known-issue shields can be hidden by overdue markers, several demo vehicles show evidence-free circles, mobile navigation cannot reliably return home, and the React admin shell no longer resembles the supplied release design.

**Approach:** Restore one evidence and marker contract shared by the hero, hub, and admin; give each demo vehicle accurate, explicitly labeled sample maintenance evidence plus curated published issue mappings; and port the authored admin information architecture into React while retaining the live catalog and existing operations tools.

## Boundaries & Constraints

**Always:** Treat `design/release/2026-08-24/Au7o Admin.html` as the visual/interaction reference. Keep Engine Air Filter as an Engine tree item but remove its standalone vehicle hotspot. Let violet known-issue status win the primary marker while retaining overdue service context in text/tree detail. Use only applicable published issue IDs and manufacturer-backed service intervals. Label fictional demo mileage and service history as sample state. Make the Au7o brand and mobile drawer Home action navigate to `/`. Preserve the legacy operations surface within the redesigned admin.

**Ask First:** Any production database write, email send, schema migration, destructive cleanup, or scope expansion beyond the four current demo vehicles and admin shell.

**Never:** Deploy or promote this package; invent issue IDs, service claims, prices, or user analytics; iframe or ship the standalone HTML; replace user-authored unrelated work; expose founder/admin data publicly.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Demo marker | Node has known issue and overdue sample service | Violet shield is primary; tree/detail still reports overdue service | Do not discard either evidence dimension |
| Unmapped evidence | No approved issue-to-node mapping | No purple marker is fabricated | Keep accurate maintenance state or neutral evidence |
| Admin API unavailable | `/api/admin/twins` fails or returns empty | Authored admin chrome remains usable and reports unavailable data | No mock KPI or fake inventory values |
| Mobile return | User is inside hub/tree/drawer | Au7o brand and Home row return to `/` | Accessible anchors work without client state |

</frozen-after-approval>

## Code Map

- `src/lib/vehicle-twin-catalog.ts` -- demo identities, hotspots, art, systems, and deep-link contract.
- `src/components/twin/demo-trees.js` -- model-specific sample service nodes and approved issue mappings.
- `src/components/twin/stage/TwinStage.jsx` -- hub marker evidence resolution and vehicle stage.
- `src/components/home/RotatingTwinStage.tsx` -- homepage hero marker rendering and demo entry.
- `src/components/twin/hub/hub-shared.jsx` and `Hub.jsx` -- shared brand and mobile/desktop navigation.
- `src/components/admin/twins/TwinAdminShell.tsx` -- live React port of the authored admin overview, gallery, and detail.
- `scripts/vehicle-twin-catalog.test.ts` -- catalog, deep-link, evidence, marker, and shell regressions.

## Tasks & Acceptance

**Execution:**
- [x] Consolidate canonical marker visuals and precedence across hero, hub, minimal hub, and admin.
- [x] Remove the standalone air-filter hotspot while retaining `engine.airFilter` tree navigation.
- [x] Replace stale demo issue IDs and structure-only trees with curated issue mappings and manufacturer-backed sample maintenance records.
- [x] Add reliable Home navigation to the hub header and mobile drawer.
- [x] Rebuild the admin shell around the release HTML's Overview, Twin Gallery, vehicle detail, readiness, asset coverage, and operations structure using live catalog data only.
- [x] Add focused automated coverage and perform desktop/mobile visual verification.

**Acceptance Criteria:**
- Given any demo vehicle, when its hero or hub stage renders, then every marker uses the same shape, color, glyph, and evidence precedence.
- Given Challenger nodes with both known-issue and overdue evidence, when rendered, then purple shields are visible and overdue context remains available in the tree.
- Given the demo catalog, when inspected, then no `airbox` hotspot/deep link exists while Engine still contains an air-filter service node.
- Given Nautilus, Murano, or XT6, when opened, then their visible service states come from documented intervals and explicitly labeled sample records, not blank generic circles or false issue claims.
- Given a founder opens `/admin`, when switching Overview, Twin Gallery, a vehicle detail, and Operations, then the structure materially matches the supplied release design and uses real catalog/API values.
- Given a narrow viewport, when using the hub header or drawer, then Home is reachable and no content-blocking overlay or runtime error appears.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts` -- focused contract tests pass.
- `npx tsc --noEmit` -- TypeScript passes.
- `npx eslint <changed source files>` -- changed files pass lint or only documented pre-existing disables remain.
- `git diff --check` -- no whitespace errors.
- `npm run build` -- production build succeeds; retry only the documented Windows hash race.

**Manual checks (if no CLI):**
- Inspect all four hero vehicles and corresponding hub states at desktop and mobile widths; confirm shields, service markers, deep links, Home navigation, admin tabs/detail, and no “Something went wrong” state.

## Suggested Review Order

**Evidence contract**

- Start with the canonical vehicle, artwork, hotspot, service, and issue evidence model.
  [`vehicle-twin-catalog.ts:83`](../../src/lib/vehicle-twin-catalog.ts#L83)

- Follow how catalog evidence becomes truthful demo chrome, summaries, and trees.
  [`demo-trees.js:190`](../../src/components/twin/demo-trees.js#L190)

- Confirm owner history overrides sample status without losing applicable published issues.
  [`demo-trees.js:214`](../../src/components/twin/demo-trees.js#L214)

**Shared visual behavior**

- Review the single marker precedence and visual vocabulary used across all surfaces.
  [`TwinMarker.tsx:33`](../../src/components/twin/stage/TwinMarker.tsx#L33)

- Inspect stage evidence resolution, asset fallbacks, and vehicle-specific X-ray handling.
  [`TwinStage.jsx:47`](../../src/components/twin/stage/TwinStage.jsx#L47)

- Verify selected-vehicle state drives both hero markers and destination links.
  [`RotatingTwinStage.tsx:21`](../../src/components/home/RotatingTwinStage.tsx#L21)

- Check mobile brand and drawer navigation return users to Home.
  [`hub-shared.jsx:103`](../../src/components/twin/hub/hub-shared.jsx#L103)

**Admin fidelity**

- Review the authored Overview, Gallery, detail, assets, readiness, and Operations shell.
  [`TwinAdminShell.tsx:49`](../../src/components/admin/twins/TwinAdminShell.tsx#L49)

**Verification**

- Confirm published-issue applicability and sample-service provenance gates.
  [`vehicle-twin-catalog.test.ts:102`](../../scripts/vehicle-twin-catalog.test.ts#L102)

- Confirm runtime rendering, fallbacks, and selected admin artwork coverage.
  [`vehicle-twin-catalog.test.ts:367`](../../scripts/vehicle-twin-catalog.test.ts#L367)
