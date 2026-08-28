---
title: 'Restore actionable Twin trees and Admin release fidelity'
type: 'bugfix'
created: '2026-08-28'
status: 'done'
review_loop_iteration: 0
baseline_commit: '23722beae1cbf0a83edfb957cb36e9593ded68be'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The owner Twin regressed into a partly read-only experience: unlogged service nodes have no action, live upgrades cannot be confirmed, known-issue context is incomplete, tree state resets during use, mobile navigation is constrained, and the transmission choice obstructs desktop content. The deployed Admin overview also omits the operational and analytical panels present in the approved release reference.

**Approach:** Restore persisted owner actions and stable responsive tree interaction while preserving evidence honesty, then port the Admin overview using live founder-only data and clearly labeled unavailable states wherever the reference used mock data that Au7o does not collect.

## Boundaries & Constraints

**Always:** Persist owner maintenance through the authenticated maintenance API and fitted parts through vehicle modifications; refresh the owner payload after writes; derive service status only from real records; distinguish an unlogged service from an overdue one; label a published known issue only when an applicable issue ID exists; keep all Admin data founder-gated and computed from database records; preserve current Operations and Twin Gallery functions.

**Ask First:** Production database changes, new third-party analytics connections, email sends, destructive data changes, or production deployment.

**Never:** Use demo/localStorage state as owner truth; mark the rear tire overdue without a supporting service deadline; present legacy tire prose as a published known issue; copy the release HTML's fictional visitor, referrer, click, audit, or sweep numbers; claim an upgrade resolved an issue before its modification write succeeds.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Unlogged rear tire | Owner has no applicable tire service record | Card says service history is needed, shows interval/context, and offers Log service; it is not red overdue | Failed write leaves state unchanged and displays an inline retryable error |
| Logged maintenance | Valid owner, node mapping, date and mileage | Record persists, tree refreshes, and next-due state becomes visible | API validation/tier/conflict response is shown without optimistic false success |
| Radiator upgrade | Owner confirms MMRAD-SRT-15 is fitted | Modification persists by stable part number; radiator issue renders resolved after refresh | Failed write keeps issue open and the button enabled for retry |
| Tree interaction | Branches expanded while assistant/UI rerenders | Expansion, selection, and scroll position remain stable; explicit collapse still works | Branch/vehicle changes reset only the newly opened tree |
| Mobile wide tree | More columns than viewport | Nodes remain legible and can be panned/scrolled both ways; parent nodes expose expand/collapse | Native page scrolling remains usable outside the canvas |
| Transmission | Dual-fitment owner with null/current selection | Missing choice and the saved Automatic/Manual · Change action live in the Twin sidebar only; no transmission control appears in the header or over the canvas | Save error stays inline and does not hide the existing branch |
| Admin metrics | Founder opens Overview | Real KPIs, time-series bars/lines, affiliate quality, coverage gaps, make coverage, and actionable queue summaries render from APIs | Each panel has its own loading/error/empty state; other panels remain usable |
| Unsupported analytics | No session/referrer analytics backend | UI says analytics is not connected and does not render invented visitor/referrer values | No synthetic fallback |
| Admin identity | Founder opens Admin with the global account control present | Exactly one named account/menu control renders at top right | The Admin shell does not add a second avatar or login button |

</frozen-after-approval>

## Code Map

- `src/components/twin/stage/TechTree.jsx` -- shared tree state, detail cards, mobile layout, service and upgrade actions.
- `src/components/twin/LiveTwinHub.jsx` and `src/components/twin/twin-context.jsx` -- owner identity, persisted callbacks, transmission setup.
- `src/components/twin/twin-trees.js` -- serviceability metadata and node-to-maintenance mappings independent of current risk.
- `src/components/twin/hub/Hub.jsx` and `HubMinimal.jsx` -- stable branch handlers and non-obstructive owner controls.
- `src/lib/twin-hub-data.ts` -- owner records, modifications, and applicable issue summaries.
- `src/components/admin/twins/TwinAdminShell.tsx` -- release-fidelity overview, single account affordance, and existing Gallery/Operations navigation.
- `src/app/api/admin/overview/route.ts` -- founder-only aggregate metrics and chart series.
- `scripts/vehicle-twin-catalog.test.ts` -- Twin/Admin regression coverage.

## Tasks & Acceptance

**Execution:**
- [x] Wire authenticated maintenance logging and fitted-upgrade persistence into both detail layouts.
- [x] Preserve service interval metadata for unlogged nodes and surface accurate issue/service cards.
- [x] Narrow tree reset dependencies; add mobile collapse and two-axis navigation.
- [x] Replace the fixed transmission overlay with sidebar-only setup/change UI.
- [x] Remove the Admin shell's duplicate identity affordance and retain one global named account control.
- [x] Build a founder-only Admin overview payload and render the referenced data panels using real records.
- [x] Extend focused tests for owner writes, evidence labels, stable controls, and Admin empty/error/data states.

**Acceptance Criteria:**
- Given the owner Challenger, every serviceable selected node has a working persisted log action, and MMRAD-SRT-15 can resolve the radiator issue only after persistence.
- Given desktop or mobile, tree branches do not collapse from bubble dismissal or unrelated rerenders; mobile users can collapse and navigate the full graph.
- Given the owner hub, applicable known issues remain visible in the overview and selected-node detail.
- Given a dual-fitment owner, the transmission is selectable/changeable from the sidebar and never appears in the header or over the tree.
- Given the founder Admin route, the top right contains one account/name control rather than two.
- Given Admin Overview, the release's useful charts and operational panels are present with live data or explicit not-connected states, never sample numbers.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts` -- focused Twin/Admin regressions pass.
- `npx tsc --noEmit` -- typecheck passes.
- `npm run build` -- production build passes.

**Manual checks:**
- Exercise owner Challenger and demo Challenger at desktop and mobile widths; log a service only against a non-production test owner, confirm upgrade persistence, tree stability, horizontal navigation, and Admin panel fidelity against the supplied screenshots.

## Suggested Review Order

**Owner Twin actions and evidence**

- Owner callbacks persist maintenance context, fitted upgrades, and exact transmission selection.
  [`LiveTwinHub.jsx:129`](../../src/components/twin/LiveTwinHub.jsx#L129)

- Selected nodes expose persisted service and upgrade actions without optimistic false resolution.
  [`TechTree.jsx:498`](../../src/components/twin/stage/TechTree.jsx#L498)

- Applicable issue summaries, service records, and equipment evidence enter the owner snapshot together.
  [`twin-hub-data.ts:316`](../../src/lib/twin-hub-data.ts#L316)

- Tire rotation stays actionable while unlogged history remains honestly non-overdue.
  [`twin-trees.js:71`](../../src/components/twin/twin-trees.js#L71)

**Responsive tree and fitment controls**

- Explicit node toggles and two-axis overflow keep the full mobile graph navigable.
  [`TechTree.jsx:396`](../../src/components/twin/stage/TechTree.jsx#L396)

- Tree resets follow vehicle or branch changes, not unrelated rerenders or zoom interactions.
  [`TechTree.jsx:866`](../../src/components/twin/stage/TechTree.jsx#L866)

- Dual-fitment transmission choice lives only in the owner sidebar and mobile drawer.
  [`Hub.jsx:56`](../../src/components/twin/hub/Hub.jsx#L56)

**Founder Admin overview**

- The release dashboard structure now renders live charts, coverage, queues, and explicit gaps.
  [`TwinAdminShell.tsx:49`](../../src/components/admin/twins/TwinAdminShell.tsx#L49)

- Each aggregate source fails independently behind founder authorization without leaking database errors.
  [`route.ts:10`](../../src/app/api/admin/overview/route.ts#L10)

- Snapshot aggregation preserves exact totals, canonical review links, and bounded-scan labeling.
  [`admin-overview.ts:30`](../../src/app/api/admin/overview/admin-overview.ts#L30)

**Regression coverage**

- Focused tests cover honest tire status, radiator resolution, evidence filtering, and fitment branches.
  [`twin-transmission-tree.test.ts:24`](../../scripts/twin-transmission-tree.test.ts#L24)

- Runtime tests exercise Admin partial data, canonical links, owner writes, and responsive controls.
  [`vehicle-twin-catalog.test.ts:372`](../../scripts/vehicle-twin-catalog.test.ts#L372)
