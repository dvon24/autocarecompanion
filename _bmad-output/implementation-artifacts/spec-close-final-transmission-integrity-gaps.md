---
title: 'Close Final Transmission Integrity Gaps'
type: 'bugfix'
created: '2026-08-27'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'f2816bb215b09ac18f68fb1b78d1d0e7d2920b51'
context:
  - '_bmad-output/implementation-artifacts/spec-harden-owner-twin-server-contracts.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A reviewed single-transmission vehicle can hold a contradictory non-null saved branch, yet some maintenance and owner paths currently derive the catalog branch and continue. Unfiltered maintenance and assistant reads can also expose the opposite branch, while picker, identity, and claim CAS writes do not explicitly guarantee a later revision token.

**Approach:** Centralize the reviewed transmission-state and maintenance-readability decisions, then apply them consistently at every approved write, owner-access, unfiltered-read, and assistant-read boundary. Advance vehicle and reservation revisions explicitly with `max(operation time, prior revision + 1 ms)` inside their existing serializable CAS transactions.

## Boundaries & Constraints

**Always:** A valid reviewed single-fitment vehicle stores `transmission: null`; its exact automatic/manual branch comes only from the reviewed registry. Any contradictory non-null single-fitment state must reject transmission-maintenance writes and owner/claim access. Generic maintenance reads may include legacy generic evidence plus only the exact reviewed/saved branch; they must never include the opposite branch. Picker, identity, and claim mutations must make the successful revision strictly later than the prior persisted revision.

**Ask First:** Changing the schema, repairing or backfilling persisted rows, treating corrupt state as safe to auto-correct outside an explicit identity edit, changing the reviewed fitment registry, widening this work to other assistant-tool issues, or deploying any result.

**Never:** Silently trust a contradictory persisted branch, expose opposite-branch maintenance evidence, rewrite production data, weaken existing ownership/provenance/CAS checks, modify UI behavior, include the duplicate assistant tool-call-ID finding, or deploy from this workflow.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Valid reviewed single fitment | 2019 Nautilus Reserve with `transmission: null` | Generic service writes normalize to automatic; generic reads show legacy generic plus automatic records only | N/A |
| Corrupt reviewed single fitment | Same vehicle with any non-null stored transmission | Transmission-maintenance writes and owner/claim access fail closed; maintenance/assistant reads omit the contradictory opposite branch | Return the existing fitment/access conflict class; perform no mutation |
| Reviewed dual fitment | Saved automatic or manual branch | Generic writes/read filters use only the selected exact branch plus legacy generic evidence | Missing or invalid selection remains rejected |
| Unfiltered maintenance request | `GET` has vehicle ID but no `type` | Return non-transmission records, legacy generic transmission records, and only the readable exact branch | Never leak the opposite exact branch |
| Assistant vehicle information | Recent history contains both exact branches | Serialize only records readable for the vehicle's reviewed state | Never include the opposite exact branch |
| Same-millisecond or regressed clock | Picker, identity, or claim CAS succeeds when operation time is not later | Persist a revision at least one millisecond after the previous revision | Invalid prior/operation timestamps fail with a conflict and no partial write |

</frozen-after-approval>

## Code Map

- `src/lib/transmission-options.ts` -- reviewed fitment registry and shared persisted-state integrity predicate.
- `src/lib/maintenance.ts` -- write normalization plus reusable branch-aware maintenance readability.
- `src/lib/maintenance-get-handler.ts` -- filtered explicit and unfiltered maintenance history reads.
- `src/lib/garage-assistant-production-tool.ts` -- branch-safe recent-maintenance serialization.
- `src/lib/twin-hub-data.ts` -- owner payload access gate before exact-fit records are loaded.
- `src/lib/twin-claim-post-handler.ts` -- claim fitment gate and reservation/vehicle CAS transition.
- `src/lib/vehicle-patch-handler.ts` -- guarded transmission and semantic-identity vehicle writes.
- `src/lib/maintenance-mutation.ts` -- existing monotonic vehicle-revision primitive or home for a generalized equivalent.
- `scripts/transmission-options.test.ts` -- focused contract, race, read-filter, and corrupt-state tests.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/transmission-options.ts`, `src/lib/maintenance.ts` -- add shared fail-closed state validation and record-readability helpers without changing the reviewed registry.
- [x] `src/lib/maintenance-get-handler.ts`, `src/lib/garage-assistant-production-tool.ts` -- apply the shared branch filter when no maintenance type is requested and when assistant vehicle history is serialized.
- [x] `src/lib/twin-hub-data.ts`, `src/lib/twin-claim-post-handler.ts` -- deny contradictory reviewed single-fitment state before owner records are loaded or claim state changes.
- [x] `src/lib/vehicle-patch-handler.ts`, `src/lib/twin-claim-post-handler.ts`, `src/lib/maintenance-mutation.ts` -- explicitly calculate and persist strictly monotonic revisions in existing CAS predicates/transactions.
- [x] `scripts/transmission-options.test.ts`, `scripts/vehicle-twin-catalog.test.ts` -- cover every matrix row, including same-millisecond and clock-regression cases, denied-owner no-write/no-record-load assertions, and both transmission branches.

**Acceptance Criteria:**
- Given the same vehicle state, every maintenance, owner, claim, and assistant surface reaches the same reviewed branch decision.
- Successful picker, semantic identity, and claim writes invalidate the exact revision token used to start them.
- Existing valid single- and dual-fitment behavior, strict request validation, provenance checks, and serializable race protection remain intact.
- No unrelated dirty-worktree file, schema, production data, or deployment state is changed.

## Spec Change Log

- 2026-08-27 — Implemented shared reviewed-state integrity and branch-readable history filtering across maintenance, assistant, owner, and claim boundaries. Picker, identity, reservation-claim, and claim vehicle CAS writes now persist strictly monotonic revisions. Focused tests pass 63/63, TypeScript and scoped diff checks pass, and scoped lint is clean outside the six documented pre-existing `src/lib/maintenance.ts` `no-explicit-any` findings.
- 2026-08-27 — Adversarial review patches closed the remaining metadata-only legacy transmission PATCH bypass, made unfiltered maintenance reads use one serializable vehicle/history snapshot, and reject monotonic revision overflow at JavaScript's maximum valid date. The expanded focused suite remains 63/63 with TypeScript, scoped lint, and scoped diff checks passing.

## Design Notes

The integrity predicate should distinguish reviewed state from derived display branch: a single-option registry entry derives its branch only when the stored field is null. Record readability is less destructive than access: legacy generic evidence remains readable, the reviewed/selected exact branch remains readable, and the opposite exact branch is excluded. This allows diagnostics without converting corrupt state into owner eligibility.

## Verification

**Commands:**
- `npx tsx --test scripts/transmission-options.test.ts scripts/vehicle-twin-catalog.test.ts scripts/twin-transmission-tree.test.ts` -- expected: all focused server-contract tests pass.
- `npx tsc --noEmit` -- expected: no TypeScript errors.
- `npx eslint src/lib/transmission-options.ts src/lib/maintenance-get-handler.ts src/lib/garage-assistant-production-tool.ts src/lib/twin-hub-data.ts src/lib/twin-claim-post-handler.ts src/lib/vehicle-patch-handler.ts src/lib/maintenance-mutation.ts src/lib/maintenance-patch-handler.ts scripts/transmission-options.test.ts scripts/vehicle-twin-catalog.test.ts` -- expected: no new lint errors; `src/lib/maintenance.ts` retains six documented pre-existing `no-explicit-any` findings.
- `git diff --check` -- expected: no whitespace errors in this slice.

## Suggested Review Order

**Shared fitment truth**

- Separate persisted-state validity from the registry-derived display branch.
  [`transmission-options.ts:107`](../../src/lib/transmission-options.ts#L107)

- Normalize writes and readable history through one reviewed branch decision.
  [`maintenance.ts:623`](../../src/lib/maintenance.ts#L623)

- Preserve generic evidence while excluding the opposite exact branch.
  [`maintenance.ts:663`](../../src/lib/maintenance.ts#L663)

**Fail-closed boundaries**

- Deny corrupt owner state before catalogs or service records load.
  [`twin-hub-data.ts:204`](../../src/lib/twin-hub-data.ts#L204)

- Reject corrupt reservation and garage states before claim transitions.
  [`twin-claim-post-handler.ts:26`](../../src/lib/twin-claim-post-handler.ts#L26)

- Close the legacy generic metadata-only PATCH bypass.
  [`maintenance-patch-handler.ts:58`](../../src/lib/maintenance-patch-handler.ts#L58)

**Consistent history reads**

- Read vehicle identity and filtered history from one serializable snapshot.
  [`maintenance-get-handler.ts:28`](../../src/lib/maintenance-get-handler.ts#L28)

- Filter assistant recent history before records cross the tool boundary.
  [`garage-assistant-production-tool.ts:43`](../../src/lib/garage-assistant-production-tool.ts#L43)

**Monotonic revisions**

- Centralize strict revision advancement and reject date-range overflow.
  [`maintenance-mutation.ts:71`](../../src/lib/maintenance-mutation.ts#L71)

- Advance picker and identity CAS tokens explicitly.
  [`vehicle-patch-handler.ts:66`](../../src/lib/vehicle-patch-handler.ts#L66)

- Advance reservation and garage revisions atomically during claim.
  [`twin-claim-post-handler.ts:34`](../../src/lib/twin-claim-post-handler.ts#L34)

**Regression coverage**

- Exercise corrupt states, read filters, races, and revision overflow.
  [`transmission-options.test.ts:508`](../../scripts/transmission-options.test.ts#L508)

- Prove corrupt owner state denies record and exact-fit payload loads.
  [`vehicle-twin-catalog.test.ts:283`](../../scripts/vehicle-twin-catalog.test.ts#L283)
