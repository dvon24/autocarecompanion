---
title: 'Review complete Twin tech trees in Admin'
type: 'feature'
created: '2026-09-02'
status: 'done'
review_loop_iteration: 0
baseline_commit: '927838d2122718c6910df73bee8d0c410009d2a4'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Admin Twin Gallery lists all eight completed vehicles and summarizes their mapped systems, but the founder cannot inspect the actual interactive tech trees, detail cards, prices, part numbers, purchase destinations, service guidance, and known-issue actions that users will receive. A summary-only view is not a sufficient pre-delivery quality gate.

**Approach:** Add a founder-only, read-only interactive tech-tree review surface to each Twin Gallery detail page. It must render from the same catalog resolver, sample mileage, branch configuration, and `TechTree` component used by the demo/user experience, including both reviewed transmission branches when an exact YMMT has automatic and manual options.

## Boundaries & Constraints

**Always:** Keep all eight current catalog Twins reviewable. Use the shared catalog and tree resolver as the single source of truth. Show every available branch and allow full node navigation. Render the existing product cards, verified prices, linked part numbers, purchase links, service instructions, and known-issue summaries/actions without duplicating their data in Admin. Label this as sample/read-only review and make automatic/manual branch selection visible only for reviewed dual-transmission vehicles.

**Ask First:** Deployment, production writes, user notifications, reservation assignment, schema changes, or changes to part fitment evidence.

**Never:** Create a separate Admin-only mock tree; silently fall back to the Challenger when an ID/resolver is invalid; expose owner mutation controls; claim that an awaiting-art color is rendered; or alter unrelated Admin operations.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Standard review | Founder selects any Gallery vehicle | Detail page exposes its complete interactive tree and all available branches | Missing branch is omitted rather than opening an inert panel |
| Dual transmission | Challenger or Camaro is selected | Founder can switch automatic/manual and review the corresponding exact nodes and products | Branch switch resets node selection so data cannot bleed between configurations |
| Invalid tree | Catalog row has no registered resolver/root | Admin displays a truthful unavailable state | Never substitute another vehicle's tree |
| Narrow viewport | Founder reviews on phone/tablet | Branch and transmission controls wrap; tree uses compact vertical detail behavior | Content remains scrollable and actions/links remain reachable |

</frozen-after-approval>

## Code Map

- `src/lib/vehicle-twin-catalog.ts` -- Admin catalog projection must carry the resolver identifier needed to build the shared tree.
- `src/components/admin/twins/TwinAdminShell.tsx` -- Twin detail page, read-only review provider, configuration controls, and responsive layout.
- `src/components/twin/demo-trees.js` -- existing shared resolver and presentation builder; no duplicated Admin tree data.
- `src/components/twin/stage/TechTree.jsx` -- existing interactive tree/card renderer reused by Admin.
- `scripts/vehicle-twin-catalog.test.ts` -- rendered Admin review and configuration-isolation regressions.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/vehicle-twin-catalog.ts` -- include `treeResolver` in founder-only Admin Twin definitions so the shared resolver can fail closed.
- [x] `src/components/admin/twins/TwinAdminShell.tsx` -- add an exported read-only review component using `TwinDataCtx`, `buildDemoTwinPresentation`, and `TechTree`; provide responsive branch controls and reviewed transmission selection.
- [x] `src/components/admin/twins/TwinAdminShell.tsx` -- place the review immediately after the selected vehicle preview/configuration so it is part of the pre-delivery workflow.
- [x] `scripts/vehicle-twin-catalog.test.ts` -- prove all eight Admin definitions render their own exact tree, linked commerce content is visible, dual branches differ correctly, and invalid rows fail closed.

**Acceptance Criteria:**
- Given any of the eight Twin Gallery cards, when the founder opens it, then the actual shared interactive tree is available without leaving Admin.
- Given a sourced maintenance leaf, when it is opened in Admin review, then the same price, part number, fitment copy, and product destination available to the user are present.
- Given a published issue leaf, when it is opened, then its summary, fix guidance, and canonical known-issue action are present.
- Given a dual-transmission vehicle, when the founder changes the review configuration, then transmission-specific labels, fluids, parts, and intervals update without mutating owner data.

## Spec Change Log

## Design Notes

The review is embedded in the existing Twin detail page rather than opening the public hub. That keeps the founder in the release workflow while still rendering the production `TechTree` under the exact demo context. Admin-only controls choose review context; they do not fork or rewrite tree content.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts` -- all Admin/Twin catalog and rendered-tree checks pass.
- `npm run audit:twin-commerce` -- all 181 leaf nodes across 10 reviewed configurations pass with zero strict failures.
- `npm run audit:twin-links` -- 110 unique product destinations checked; 75 live/redirected, 35 retailer bot-blocked, 0 failed.
- `npx tsc --noEmit` -- TypeScript passes.
- `npx eslint src/components/admin/twins/TwinAdminShell.tsx src/lib/vehicle-twin-catalog.ts scripts/vehicle-twin-catalog.test.ts` -- changed files pass lint.
- `npm run build` -- production build succeeds without deploying.

**Manual checks (if no browser runtime):**
- Inspect each Gallery detail at desktop and mobile widths; traverse every branch, both dual-transmission configurations, commerce links, and known-issue actions.

## Suggested Review Order

**Founder review boundary**

- Start with the fail-closed model and exact shared-tree composition.
  [`TwinAdminShell.tsx:103`](../../src/components/admin/twins/TwinAdminShell.tsx#L103)

- Review the responsive branch and transmission controls plus embedded read-only tree.
  [`TwinAdminShell.tsx:129`](../../src/components/admin/twins/TwinAdminShell.tsx#L129)

- Confirm Admin fetches every mapped published issue across all reviewed configurations.
  [`route.ts:11`](../../src/app/api/admin/twins/route.ts#L11)

**Shared-tree safety and completeness**

- Verify read-only mode prevents service, equipment, styling, and chat mutations.
  [`TechTree.jsx:1049`](../../src/components/twin/stage/TechTree.jsx#L1049)

- Check missing product destinations are filtered before card rendering.
  [`TechTree.jsx:48`](../../src/components/twin/stage/TechTree.jsx#L48)

- Review the manual Challenger base-oil-plus-modifier service set and exact directions.
  [`demo-trees.js:208`](../../src/components/twin/demo-trees.js#L208)

**Release gates**

- Confirm structural commerce covers both configurations for every dual-transmission Twin.
  [`audit-twin-tree-commerce.ts:36`](../../scripts/audit-twin-tree-commerce.ts#L36)

- Confirm network link collection also includes every reviewed transmission branch.
  [`audit-twin-tree-links.ts:11`](../../scripts/audit-twin-tree-links.ts#L11)

- Finish with the eight-Twin, invalid-tree, issue-card, and read-only regressions.
  [`vehicle-twin-catalog.test.ts:685`](../../scripts/vehicle-twin-catalog.test.ts#L685)
