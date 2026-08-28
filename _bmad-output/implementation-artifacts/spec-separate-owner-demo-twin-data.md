---
title: 'Separate owner and demo twin data safely'
type: 'bugfix'
created: '2026-08-26'
status: 'in-review'
review_loop_iteration: 6
baseline_commit: 'f2816bb215b09ac18f68fb1b78d1d0e7d2920b51'
context:
  - '_bmad-output/implementation-artifacts/spec-restore-connected-twin-experience.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Demo/owner modes, claim routing, exact fitment, transmission branches, and missing-evidence counts can cross-contaminate, exposing the wrong surface or parts.

**Approach:** Use one fail-closed access result, exact owner-tree contract, persisted conditional transmission choice, and nullable evidence presentation.

## Boundaries & Constraints

**Always:** Founder access needs a directly matched supported garage vehicle and positive mileage. Reviewed dual-transmission founder vehicles show Automatic/Manual; until saved, all transmission content is hidden, then server refresh reveals only the exact branch. Single-transmission vehicles show no picker. Customers need exact assignment, a valid claimed trial, and a choice only for dual fitments. Ready means claimable, not owner-accessible. Modes stay explicit; missing evidence stays nullable/unlogged.

**Ask First:** Changing the allowed 7/30-day trial policy, making another vehicle owner-ready, changing exact-fit rules, any schema change beyond the approved nullable `Vehicle.transmission`, applying production DDL, or deploying.

**Never:** Infer owner mode from a provider; allow non-claimed customer access, invalid/future claims, or non-7/30 trials; default owner data or transmission; show false zero counts.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Public demo | `mode: demo` | Demo behavior/copy only | Missing data unavailable |
| Founder | Exact supported garage row + mileage | Owner hub without reservation | Otherwise classic hub |
| Ready customer | Exact valid ready assignment | `/twin/claim` only | Invalid stays classic |
| Claimed customer | Exact valid unexpired 7/30-day claim | Owner hub | Invalid/future/expired denied |
| Transmission | Single, saved dual, or unsaved founder dual | No picker for single; dual picker refreshes exact branch; unsaved founder hides transmission | Unsaved dual customer denied; no defaults |
| Missing evidence | Incomplete clock | Nullable unlogged copy | Known issue may coexist |
| Unmapped owner | No owner-ready builder | Fail closed | No Challenger fallback |

</frozen-after-approval>

## Code Map

- `src/lib/twin-access.ts`, `src/lib/twin-fulfillment.ts`, `src/lib/twin-hub-data.ts`, `src/app/vehicle/[slug]/page.tsx` -- access, identity, routing.
- `src/app/twin/claim/page.tsx`, `src/app/api/twin/claim/route.ts` -- claim clock/state.
- `prisma/schema.prisma`, `scripts/apply-vehicle-transmission.js`, `src/app/api/vehicles/[id]/route.ts` -- persistence.
- `src/components/twin/twin-context.jsx`, `src/components/twin/LiveTwinHub.jsx`, `src/components/twin/twin-trees.js`, `src/components/twin/demo-trees.js` -- mode, picker, exact trees/evidence.
- `src/components/twin/hub/Hub.jsx`, `src/components/twin/stage/TwinStage.jsx`, `src/components/twin/stage/TechTree.jsx`, `scripts/*.test.ts` -- rendering and regression gates.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/twin-hub-data.ts`, `src/app/api/twin/claim/route.ts` -- require transmission equality only for registered dual fitments and fetch one latest eligible record per supported type with bounded payload.
- [x] `src/app/api/vehicles/[id]/route.ts`, `scripts/apply-vehicle-transmission.js` -- make PATCH schema strict and validate existing columns are non-generated, non-identity nullable text without default.
- [x] `src/lib/maintenance.ts`, `src/app/api/maintenance/route.ts`, `src/components/twin/twin-trees.js` -- reject prototype keys; normalize new generic dual-transmission logs to the persisted exact branch or reject when unselected; keep legacy generic history unassigned.
- [x] `src/components/twin/LiveTwinHub.jsx`, `src/components/twin/demo-trees.js`, `src/components/twin/stage/TwinStage.jsx` -- order date-only next services chronologically, compute date progress, and render risk from explicit service status even when aggregate counts are nullable.
- [x] `src/components/twin/stage/TechTree.jsx`, `src/components/twin/stage/TwinStage.jsx` -- guard removed branches/overlays and label date-driven versus mileage-driven overdue evidence accurately.
- [x] `scripts/*.test.ts` -- execute claim/PATCH/maintenance route seams, bounded latest-per-type history, pending full component state, removed overlay, date ordering/progress/labels, strict unknown fields, generated-column DDL rejection, and single-transmission claim behavior.
- [x] `src/lib/twin-hub-data.ts` -- load a transactionally consistent access/vehicle/reservation/history snapshot; reject ambiguous customer garage matches; return only generic legacy plus the selected exact transmission branch, no opposite or unselected branch records; break same-date/mileage history ties deterministically.
- [x] `src/app/api/maintenance/route.ts`, `src/lib/maintenance.ts` -- revalidate the saved transmission inside the guarded create transaction; normalize generic writes for registered single- and dual-transmission fitments to the exact branch, rejecting branchless dual writes.
- [x] `src/lib/twin-route-contracts.ts` -- validate real calendar dates and cross-field chronology/mileage invariants so impossible deadlines return a client validation error rather than normalization or 500.
- [x] `src/components/twin/twin-trees.js`, `src/components/twin/LiveTwinHub.jsx` -- compute month/year deadlines with calendar arithmetic, not fixed-day approximations, and rank already-overdue mixed-clock services by actual lateness rather than a clamped tie.
- [x] `src/components/twin/twin-context.jsx` -- make malformed owner providers fail closed to unavailable identity/catalog/tree data and never inherit Challenger demo defaults.
- [x] `src/components/twin/stage/TwinStage.jsx`, `src/components/twin/stage/TechTree.jsx` -- give proven overdue evidence red precedence while preserving known-issue copy/details independently.
- [x] `scripts/*.test.ts` -- execute the claim, PATCH, and maintenance handlers; exercise transaction/race, real-date and impossible-deadline rejection, single/dual normalization, payload branch filtering, deterministic tie-breaking, ambiguous garage denial, malformed-owner fallback, calendar arithmetic, mixed-clock overdue ranking, red-plus-known-issue coexistence, and the stateful picker save/pending/failure path. Include all three focused test files in the recorded gate.

**Acceptance Criteria:**
- Given public demo, founder, ready customer, claimed customer, expired customer, and malformed customer states, when the same access contract evaluates them, then each reaches only its intended demo, owner, claim, or classic surface.
- Given a founder with no dual-transmission selection, when the owner tree renders, then the hub remains available but no transmission branch, node, system, hotspot, fluid, part, buy link, URL, or copy exists.
- Given a reviewed dual-transmission founder vehicle, when Automatic or Manual is saved, then the refreshed hub reveals only that exact branch; given a single-transmission vehicle, no picker is rendered.
- Given automatic, manual, and unmapped owner inputs, when trees are built and catalog evidence is merged, then each retains only its exact existing nodes and shared car/branch identity; no automatic node or Challenger fallback leaks into another state.
- Given absent or partial maintenance evidence, when owner presentation, Hub, and Stage render, then counts stay nullable and no demo-overdue or green on-track claim replaces the computed owner evidence.
- Given a save/claim race or stale caller, when identity, mileage, or transmission changes concurrently, then the write conflicts and no trial or unsupported fitment is persisted.
- Given transmission-specific service records or time-based intervals, when owner evidence is built, then only the selected branch is updated and overdue/unlogged date evidence remains visible.
- Given a claimed dual-transmission customer, when the garage choice is null or differs from the reservation, then owner access is denied rather than falling back to founder-style branchless mode.
- Given legacy generic transmission history, when a branch is selected later, then that record remains unassigned and is never reinterpreted as automatic or manual service.
- Given a new generic transmission service on a reviewed dual fitment, when an exact branch is saved, then the write is normalized to that branch; without a saved branch it is rejected.
- Given incomplete history with a proven date/mileage overdue item, when any surface renders it, then it is red and its label names the actual deadline source while aggregate counts remain nullable.

## Spec Change Log

- 2026-08-26 — Implemented the approved narrow recovery slice. Access is now a discriminated fail-closed result, ready offers route separately from owner payloads, claim surfaces share strict trial validation, demo providers no longer enter owner behavior, owner trees require an exact registered builder, and missing/partial service evidence remains nullable across Hub and Stage.
- 2026-08-26 — Devon resolved the founder dual-transmission intent gap: keep the founder owner hub available, but hide all transmission-specific content until automatic/manual is explicitly selected; dual-transmission customers remain gated on a confirmed choice.
- Iteration 1 — adversarial review found reservation YMMT was not checked, automatic nodes were reinserted into manual/no-transmission trees, partial owner history could become green numeric evidence, owner presentation reused demo statuses, claim surfaces used inconsistent clocks, and already-allowed users still saw acceptance. The tasks now require complete reservation/garage identity, one database clock, annotate-existing-only merges with shared node identity, Option A branch-negative output, owner-only computed evidence, and negative regression assertions. KEEP: typed access outcomes, founder direct-fit bypass, strict customer gates, owner-ready fail-closed mapping, `mode === 'owner'`, and nullable evidence semantics.
- 2026-08-26 — Devon approved nullable `Vehicle.transmission` persistence and the conditional hub picker: dual-transmission founders choose Automatic/Manual in the hub; single-transmission vehicles show no field. Production DDL remains separately deployment-gated.
- Iteration 2 — review found optional fail-closed inputs, unverified/non-owner-ready claims, stale route normalization, claim/PATCH races, stale automatic UI during refresh, cross-transmission service mapping, missing time evidence, and hidden coexisting unlogged state. Tasks now require mandatory garage/database-clock inputs, verified owner-ready transactional revalidation, optimistic concurrency, filtered deep links/catalog presentation, registered single-transmission handling, branch-specific records, pending-state suppression, date evidence, and full negative tests. KEEP: approved schema/picker, exact YMMT, transactional transmission copy, annotate-existing-only merge, shared references, Option A founder access, 17 passing baseline tests, and no DDL execution.
- Iteration 3 — review found mismatched claimed customers still entered branchless owner mode, legacy generic transmission history rebound to a new choice, branch-specific records were not loggable, date/unlogged evidence vanished in TechTree, due-mile/date state disagreed across surfaces, retryable serializable conflicts returned 500, and DDL/PATCH/history caps lacked fail-closed verification. Tasks now require customer choice equality, unassigned generic history, branch-safe maintenance writes, independent detail evidence, explicit due fields everywhere, P2034 conflicts, guarded companion updates, schema-shape inspection, complete latest-record retrieval, and executable component/race tests. KEEP: mandatory garage/clock, verified owner-ready exact claims, serializable/revision guards, normalized routing, registered branch rules, filtered stale links, pending branch suppression, date preservation, 23 passing baseline tests, and no DDL execution.
- Iteration 4 — review found nullable aggregate counts could still render green beside proven overdue evidence; date-only next service ordering/progress and labels were wrong; single-transmission claims were over-gated; new generic dual-transmission logs succeeded but stayed invisible; prototype keys, unknown PATCH fields, generated DDL columns, stale overlays, and unbounded supported history remained unsafe; route/full-component coverage was still shallow. Tasks now require service-status-driven color, chronological date progress, source-accurate labels, dual-only equality, generic-write normalization, own-property/strict validation, generated/identity DDL rejection, missing-branch guards, bounded latest-per-type history, and executable route/full-state tests. KEEP: all Iteration 1-3 guarantees, 26 passing focused tests, clean build, and no DDL execution.
- Iteration 5 — the final permitted review found opposite/unselected transmission history still crossed the server boundary, maintenance and owner reads lacked a consistent transaction snapshot, single-transmission generic writes stayed invisible, date validation/arithmetic accepted impossible or drifting deadlines, same-clock rows and mixed overdue services were ordered ambiguously, malformed owner providers could inherit Challenger demo defaults, known-issue purple masked proven overdue red, and route/picker tests remained shallower than claimed. Tasks now require exact-branch server filtering, transactional revalidation/snapshots, single/dual normalization, exact calendar and cross-field guards, deterministic ordering, fail-closed owner context, overdue color precedence with independent issue evidence, and executable handler/state tests. KEEP: strict access outcomes, exact YMMT and claim clocks, nullable evidence, bounded latest-per-type retrieval, dual-only customer equality, strict schemas, generated/identity DDL rejection, date-source labels, stale-state guards, the 27 independently passing focused tests, clean build, and no DDL or remote mutation.
- 2026-08-26 — Implemented iteration 2. Claim activation now revalidates verified owner-ready exact YMMT and copies the registered branch inside one serializable DB-clock transaction; founder transmission writes use a client revision plus guarded vehicle identity; pending refresh removes the prior branch; owner catalog/deep links and service records are branch-specific; date-overdue, known-issue, and incomplete evidence coexist without numeric false zeros. All 23 focused tests, TypeScript, scoped lint, whitespace, and the 1,553-page production build pass. No DDL or remote mutation was run.
- 2026-08-26 — Implemented iteration 3. Claimed dual-transmission customers now require garage/reservation branch equality; retryable Prisma `P2034` failures return 409; transmission PATCHes reject companion edits; the DDL helper validates nullable-text/no-default shape; generic transmission history stays unassigned while exact branch records are loggable; explicit mileage/date deadlines drive next service, hotspot, and TechTree state; annotations preserve shared node identity; removed branches clear their active glow; independent date/unlogged/known detail renders; and supported history has no global cap. All 23 focused tests, TypeScript, scoped lint, whitespace, and the 1,553-page production build pass. No DDL, database, staging, commit, push, deploy, email, or remote operation was run.
- 2026-08-26 — Implemented iteration 4. Customer transmission equality now applies only to reviewed dual fitments; supported service payloads are bounded to one latest eligible row per type; strict route contracts reject unknown and prototype-shaped inputs; new generic dual-transmission writes normalize to the saved exact branch or fail closed; DDL inspection rejects generated/identity columns; date-only services sort chronologically with date progress; explicit service status drives risk even when counts are nullable; deadline labels name date versus mileage; and stale branches/effects clear safely. All 24 focused tests, TypeScript, scoped lint, whitespace, and the 1,555-page production build pass. No DDL, database, staging, commit, push, deploy, email, or remote operation was run.
- 2026-08-26 — Implemented final iteration 5. Owner access, vehicle, reservation, and branch-filtered latest history now share one serializable snapshot; ambiguous exact garage rows fail closed; deterministic history ties include row identity; maintenance writes revalidate and normalize registered single/dual fitment inside their transaction; impossible/cross-field dates and mileage are rejected; calendar intervals clamp month ends; overdue ranking uses actual lateness; malformed owner providers use neutral unavailable sentinels; and proven overdue red no longer hides known-issue evidence. Claim, vehicle PATCH, maintenance POST, owner snapshot, and picker state paths now execute through dependency-injected production handlers/loaders. All 32 tests across the three focused files, TypeScript, scoped lint, whitespace, and the 1,555-page production build pass. No DDL, database, staging, commit, push, deploy, email, or remote operation was run.

## Design Notes

Access remains a domain result, not `payload | null`; garage proof and database time are mandatory. Reservation, verified status, assigned definition, owner-ready catalog, garage identity, and dual-fitment customer choice must agree. Legacy generic transmission history stays unassigned; new generic writes normalize only from a saved exact branch. Explicit service status and deadline source control every color/label. During refresh no prior branch, glow, or overlay remains actionable. Known issues and unlogged/time evidence coexist.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts scripts/transmission-options.test.ts scripts/twin-transmission-tree.test.ts` -- 32/32 access, executable claim/PATCH/maintenance routes, transactional owner snapshot, ambiguous-garage denial, branch-filtered bounded history, deterministic ties, strict calendar/cross-field contracts, single/dual normalization, calendar deadline arithmetic, actual-lateness ordering, owner-unavailable sentinels, red-plus-known evidence, stale guards, and stateful picker cases pass.
- `npx tsc --noEmit` -- passes with no type errors.
- `npx eslint <iteration-5 changed files excluding the pre-existing maintenance.ts findings>` -- passes; the wider scoped command confirms `src/lib/maintenance.ts` still has the same six pre-existing `no-explicit-any` findings outside this iteration's added lines and no new lint finding.
- `git diff --check` -- passes with no whitespace errors.
- `npm run build` -- production build succeeds for all 1,555 generated pages (only existing Sentry/Browserslist/PWA warnings).

**Manual checks:**
- Check demo; founder without/with each transmission; single-trans no-field behavior; ready, claimed, and expired customer routes.
