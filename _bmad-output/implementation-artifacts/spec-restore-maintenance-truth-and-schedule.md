---
status: done
baseline_commit: afd6c79c2b242714b17663f0160bbd928a561919
review_loop_iteration: 0
---

# Restore Maintenance Truth and Schedule

Release posture: complete and verify locally; do not commit, push, or deploy.

## Intent

Restore the owner-maintenance experience to the supplied August 29 design while keeping every status grounded in actual service evidence. An unlogged service must remain “Never logged,” an upcoming routine milestone must remain visible, completed work must remain reflected in the tree, and owners must be able to move between the tree, mileage schedule, and service records without the obsolete maintenance-status screen.

The supplied standalone HTML files and screenshots are interaction and visual references only. Their sample vehicle values, records, prices, and scripts are not production data or instructions.

## Scope and boundaries

### Always

- Use real owner mileage, service records, Twin nodes, intervals, products, and prices.
- Distinguish missing service history from evidence that a logged service is overdue.
- Calculate the next routine mileage for unlogged items even when the first interval is behind the odometer.
- Keep the schedule usable by touch and keyboard at phone, tablet, and desktop widths.
- Preserve ownership checks, maintenance logging, installed-part updates, known-issue evidence, and assistant behavior.
- Redirect obsolete maintenance URLs to service records so existing deep links do not strand owners.

### Never

- Mark an item overdue solely because the owner never logged its history.
- Invent a completed service, provider type, price, interval, or part.
- Copy prototype sample records into production.
- Commit, push, deploy, or implement the future known-issue visual paywall in this release.

## Implementation

1. **Truthful maintenance state**
   - Update `src/components/twin/twin-trees.js`, `src/components/twin/demo-trees.js`, `src/components/twin/stage/TechTree.jsx`, and `src/components/twin/LiveTwinHub.jsx` so unlogged nodes are neutral “Never logged” states.
   - For an unlogged mileage-based node, expose the next routine occurrence at or after the current odometer instead of treating the missed first interval as proof of overdue maintenance.
   - Keep logged records eligible for overdue, due-soon, and serviced states using the existing mileage/date evidence.

2. **Mileage schedule in the Tech Tree**
   - Add a reusable schedule builder under `src/components/twin/` that deduplicates maintainable leaf nodes, derives mileage columns, groups cards by system, and counts purchasable items.
   - Add Tree/Schedule controls and a horizontally scrollable schedule view to `src/components/twin/stage/TechTree.jsx`.
   - Wire the Hub’s Next Service card to open Schedule mode in `src/components/twin/hub/Hub.jsx` and preserve normal branch/node navigation.

3. **Service records fidelity and routing**
   - Replace the service-record filter taxonomy with Everything, Dealer, Independent, Tire shop, and You in `src/lib/service-records.ts` and `src/components/maintenance/ServiceRecords.tsx`.
   - Derive provider type conservatively from existing shop/source fields, display distinct prototype-aligned dots/badges, and retain receipt/owner provenance.
   - Remove the Maintenance status action, add `/garage/[id]/records`, redirect `/garage/[id]/maintenance`, and update internal/email deep links.

4. **Release and Twin-build audit**
   - Add focused regression tests for state semantics, schedule generation, provider classification, and route/link changes.
   - Review the pre-existing approved working-tree edits, run typecheck, scoped tests/lint, and a production build.
   - Count distinct published US-market car make/model pages that would require visual Twin artwork; separately report existing reusable Twins and the generation/color multiplication risk.

## Tasks & Acceptance

- [x] Given an unlogged node at any mileage, when state is calculated, then it says “Never logged,” is not red/overdue, and shows its next routine mileage where an interval exists.
- [x] Given a logged service whose real due mileage/date has passed, when state is calculated, then it remains overdue.
- [x] Given an owner opens the Tech Tree, when Schedule is selected, then mileage columns, system groups, maintenance cards, and purchasable-item counts use real tree data and remain horizontally reachable on mobile.
- [x] Given the Hub’s Next Service card, when “Open the schedule” is selected, then the Tech Tree opens directly in Schedule mode.
- [x] Given real service records, when a provider filter is selected, then Dealer, Independent, Tire shop, or You records filter correctly and use distinct visual treatment without sample data.
- [x] Given `/garage/{id}/maintenance`, when opened, then it redirects to `/garage/{id}/records`; the records page contains no Maintenance status button.
- [x] Given the release candidate, when verification runs, then focused tests, typecheck, scoped lint, and production build pass and no commit or deployment occurs.
- [x] Given the published known-issue corpus, when artwork demand is audited, then the final report states the minimum distinct vehicle builds, already-covered Twins, remaining builds, and why generation/color variants increase the final asset count.

## Suggested Review Order

**Maintenance truth**

- Start with the evidence boundary that separates missing history from actual overdue work.
  [`twin-trees.js:198`](../../src/components/twin/twin-trees.js#L198)

- Review sidebar prioritization using real logged deadlines and neutral unlogged milestones.
  [`LiveTwinHub.jsx:50`](../../src/components/twin/LiveTwinHub.jsx#L50)

- Confirm Challenger demo records override neutral defaults with their logged due mileage.
  [`demo-trees.js:209`](../../src/components/twin/demo-trees.js#L209)

- Confirm model-specific owners never inherit fictional demo history.
  [`demo-trees.js:512`](../../src/components/twin/demo-trees.js#L512)

**Mileage schedule**

- Review schedule construction, action deduplication, and linked-item counting first.
  [`maintenance-schedule.js:39`](../../src/components/twin/maintenance-schedule.js#L39)

- Review the touch-scrollable schedule cards and exact due-mileage copy.
  [`TechTree.jsx:1047`](../../src/components/twin/stage/TechTree.jsx#L1047)

- Confirm desktop and mobile Next Service entry points open Schedule directly.
  [`Hub.jsx:286`](../../src/components/twin/hub/Hub.jsx#L286)

**Service records**

- Review real owner/history loading and mutation refresh behavior.
  [`GarageServiceRecordsClient.tsx:37`](../../src/components/maintenance/GarageServiceRecordsClient.tsx#L37)

- Review prototype-aligned filters, timeline styling, receipt intake, and print output.
  [`ServiceRecords.tsx:220`](../../src/components/maintenance/ServiceRecords.tsx#L220)

- Review conservative provider classification from legacy shop names.
  [`service-records.ts:62`](../../src/lib/service-records.ts#L62)

- Confirm obsolete detail and maintenance routes redirect server-side to records.
  [`maintenance/page.tsx:3`](../../src/app/garage/%5Bid%5D/maintenance/page.tsx#L3)

- Confirm maintenance email actions now target service records.
  [`maintenance-alert-email.ts:80`](../../src/lib/maintenance-alert-email.ts#L80)

**Verification and planning**

- Review the reproducible live-corpus visual-Twin workload audit.
  [`audit-known-issue-twin-visual-demand.ts:25`](../../scripts/audit-known-issue-twin-visual-demand.ts#L25)

- Review schedule and evidence regressions, including duplicate repair-action products.
  [`vehicle-twin-catalog.test.ts:67`](../../scripts/vehicle-twin-catalog.test.ts#L67)

- Review route, provider, and responsive schedule assertions.
  [`maintenance-records-writeback.test.ts:42`](../../scripts/maintenance-records-writeback.test.ts#L42)
