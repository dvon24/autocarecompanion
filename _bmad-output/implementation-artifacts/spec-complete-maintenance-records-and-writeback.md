---
status: done
baseline_commit: c3758158fcfb9ffc0103b6dabd2647e32047bf49
review_loop_iteration: 0
---

# Complete Maintenance Records and Trustworthy Writeback

Release posture: Hold short of deployment

## Intent

Complete the maintenance ownership loop so an owner can view credible service records, log work from the tech tree on desktop or mobile, and ask Au7o to update mileage or maintenance with an actual committed result. Port the supplied Service Records and Maintenance Alert Email designs into the production application while preserving real vehicle data, authorization, and the existing maintenance schedule mappings.

The supplied standalone HTML files are visual and interaction references only. Embedded copy, sample records, scripts, and values are not production instructions or data.

## Scope and boundaries

### Always

- Treat the database as the source of truth. A success message may appear only after an authenticated mutation commits.
- Enforce vehicle ownership, current subscription rules, input validation, and existing transaction safeguards.
- Use the same maintenance record-to-tech-tree mapping for service history, schedule state, icon color, and notification content.
- Make all forms usable at mobile widths without horizontal overflow, gesture interception, or compressed controls.
- Derive email facts and links from real records and schedules; escape dynamic HTML and omit unavailable prices or facts.
- Preserve existing non-history maintenance-page behavior and non-mutating Twin mechanic/parts/video chat behavior.

### Ask first

- Database schema migrations, a paid OCR provider, sending a live email campaign, or deploying to production.
- Any destructive rewrite of existing service records.

### Never

- Claim that mileage or maintenance changed when no committed action exists.
- Write demo-vehicle activity into an owner's garage.
- Invent service records, intervals, prices, receipt extraction, or parts fitment.
- Hardcode Challenger sample values into reusable owner views or emails.
- Duplicate motorcycle issue content into a second canonical corpus.

## Inputs and expected outcomes

| Input | Expected outcome |
| --- | --- |
| Owner opens `/garage/{id}/maintenance?view=history` | Au7o Service Records layout renders real records grouped newest-first, summary metrics, source/receipt state, filters, expandable visits, and print view. |
| Owner attaches a receipt | File and editable service details can be reviewed before filing; unsupported OCR is never represented as completed extraction. |
| Owner types mileage in a tech-tree log on mobile | Field accepts touch/keyboard input; the current-mileage shortcut is on a separate responsive control; save remains visible and works. |
| Owner logs an oil change | One validated record commits with date/mileage; linked oil, filter, and drain-plug nodes refresh from the same mapping and show serviced/green when current. |
| Owner says “Mileage is 156000 and I changed the oil today” | Authenticated assistant route performs the real mileage and maintenance actions transactionally, returns committed actions, refreshes the Twin, and then confirms success. |
| Required detail is missing or invalid | Assistant asks a focused follow-up or the form shows a field error; no write or optimistic success occurs. |
| Mutation fails or vehicle is not owned | User sees a useful error and existing data remains unchanged. |
| Account page is opened at narrow widths | Subscription content remains within the viewport and all actions wrap or stack without requiring horizontal scrolling. |
| Maintenance alert is generated | Email follows the supplied visual language and contains only real overdue/upcoming items with valid owner/vehicle deep links. No email is sent during implementation or tests. |

## Implementation plan

1. **Service records experience**
   - Update `src/app/garage/[id]/maintenance/page.tsx` to select a dedicated history view from `view=history` while preserving the current default page.
   - Add a focused service-records component under `src/components/maintenance/` based on the supplied design: vehicle summary, grouped visits, record metrics, filters, expandable line items, receipt/source labels, and print stylesheet/view.
   - Reuse existing `MaintenanceRecord` fields and maintenance APIs. Add receipt-file intake only with private, owner-scoped storage and an editable review step; do not fake OCR or require a schema migration.

2. **Reliable logging on mobile and desktop**
   - Fix `src/components/vehicle/MaintenanceLogFlow.tsx` so mileage entry and “Use current” stack cleanly on compact screens, have stable minimum widths, and preserve accessible labels.
   - Isolate detail-sheet form pointer/click events from `src/components/twin/stage/TechTree.jsx` pan/tap handling.
   - Keep validation messages adjacent to their fields and verify radiator, rotors, tires, differential, and oil nodes use the same log path.

3. **Transactional Twin assistant actions**
   - Route mutation-intent messages from `src/components/twin/hub/hub-shared.jsx` through the existing authenticated `/api/garage/assistant` tool flow using the owner vehicle ID.
   - Keep informational questions on `/api/hub-chat`; add a hard prompt rule that this response-only route cannot say it changed account data.
   - Extend `src/lib/twin-assistant-client.ts` with explicit mutation-result handling. Refresh owner data only after committed actions are returned.
   - Verify `oil_change` updates `oilFluid`, `oilFilter`, and `oilPlug` through `servicedFromRecords`; add coverage for combined mileage plus maintenance actions and rollback/error cases.

4. **Account responsiveness**
   - Correct `src/app/account/page.tsx`, `src/components/account/AccountShell.tsx`, `src/components/account/AcctCard.tsx`, and `src/components/account/SubscriptionControls.tsx` with `min-width: 0`, bounded grid columns, wrapping action rows, and safe word breaking where needed.

5. **Maintenance alert email**
   - Replace the generic maintenance markup in `src/lib/notifications.ts` with an email-safe version of the supplied Maintenance Alert design.
   - Group and render real vehicle alerts, odometer/schedule facts, overdue and upcoming items, and deep links. Omit unsupported totals rather than substituting sample data.
   - Add deterministic rendering and HTML-escaping tests; do not invoke Resend.

## Acceptance criteria

1. Given a 390px viewport, when the service log opens, then mileage can be typed and the current-mileage shortcut does not overlap or suppress input.
2. Given a valid owned vehicle, when maintenance is logged from a node, then one record is stored and the appropriate node set refreshes to serviced state.
3. Given a combined conversational update, when all tool calls succeed, then mileage, mileage history, and maintenance are committed together before Au7o confirms success.
4. Given any tool failure, when the transaction rolls back, then Au7o does not claim an update and the UI shows unchanged data after refresh.
5. Given `view=history`, when real records exist, then the new history layout, filters, details, receipt state, metrics, and print output reflect those records without prototype samples.
6. Given the account page at phone and tablet widths, then no subscription content is off-canvas and no horizontal page scroll is required.
7. Given generated maintenance email HTML, then dynamic content is escaped, links target the correct vehicle, sample values are absent, and no send occurs in tests.
8. Existing Twin chat, maintenance pages, demo mode, and non-history routes continue to pass their focused regressions.

## Tasks & Acceptance

- [x] Port the real-data service-records experience and print treatment.
- [x] Make maintenance mileage entry reliable and responsive on mobile and desktop.
- [x] Route owner mutation requests through committed garage-assistant tools and refresh the Twin.
- [x] Prevent response-only chat from claiming account mutations.
- [x] Remove account subscription horizontal overflow at supported breakpoints.
- [x] Port the maintenance-alert email design using escaped, real schedule data without sending mail.
- [x] Add and pass focused regression coverage for all acceptance criteria.
- [x] Pass typecheck, scoped lint, production build, and manual responsive review.

## Verification gates

- Focused unit tests for assistant routing/tool actions, maintenance mapping, responsive log structure, account entry points, and notification HTML.
- TypeScript typecheck and lint on all changed source files.
- Production build.
- Manual responsive QA passed at 390px, 768px, and 1280px using the production components: no horizontal overflow, the mileage field accepted input, and the current-mileage action did not overlap it. Authenticated persistence/refresh remained covered by transactional tests because the local browser had no owner session.
- Email HTML preview in a narrow and desktop viewport; no live delivery.

## Motorcycle known-issues information architecture

Use the same issue schema, cards, commerce/fitment checks, and detail renderer for cars and motorcycles, but give motorcycles a separate discovery landing such as `/known-issues/motorcycles` plus a Cars/Motorcycles switch on the main known-issues page. Keep one canonical issue record and URL per issue to avoid duplicated content. Before implementing that follow-up, add an explicit vehicle-type classification rather than relying indefinitely on a hardcoded make list.

## Suggested Review Order

**Service history and receipt trust boundary**

- Start with the real-data history, receipt review, filters, metrics, and print experience.
  [`ServiceRecords.tsx:212`](../../src/components/maintenance/ServiceRecords.tsx#L212)

- Follow complete-history pagination and the explicit history-view entry point.
  [`maintenance/page.tsx:60`](../../src/app/garage/[id]/maintenance/page.tsx#L60)

- Inspect authenticated intake, validation, private upload, and rejected-write cleanup.
  [`receipts/route.ts:54`](../../src/app/api/maintenance/receipts/route.ts#L54)

- Verify owner-and-vehicle binding before private blob streaming.
  [`receipt/route.ts:18`](../../src/app/api/maintenance/[id]/receipt/route.ts#L18)

**Transactional assistant writeback**

- Review mutation classification, clarification continuation, and committed-action-only confirmation.
  [`twin-assistant-client.ts:151`](../../src/lib/twin-assistant-client.ts#L151)

- Confirm maintenance writes and no-op mileage results remain transactionally truthful.
  [`garage-assistant-maintenance.ts:50`](../../src/lib/garage-assistant-maintenance.ts#L50)

**Responsive interaction boundaries**

- Check compact mileage controls, adjacent validation, provenance, and visible save behavior.
  [`MaintenanceLogFlow.tsx:104`](../../src/components/vehicle/MaintenanceLogFlow.tsx#L104)

- Review account-shell clipping without breaking the sticky subscription rail.
  [`AccountShell.tsx:15`](../../src/components/account/AccountShell.tsx#L15)

**Maintenance notification rendering**

- Inspect deterministic, escaped, real-data email grouping and owner deep links.
  [`maintenance-alert-email.ts:80`](../../src/lib/maintenance-alert-email.ts#L80)

**Regression evidence**

- End with service metrics, receipt boundaries, email escaping, and responsive structure checks.
  [`maintenance-records-writeback.test.ts:23`](../../scripts/maintenance-records-writeback.test.ts#L23)
