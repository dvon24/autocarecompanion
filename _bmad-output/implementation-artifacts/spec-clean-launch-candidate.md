---
title: 'Prepare a validated launch candidate without activating production'
type: chore
created: '2026-09-18'
status: done
baseline_commit: 9a64b8248576a1b5393407e4f472cb1860249cc3
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Accepted member/Hub/email work is mixed with unpublished audits. Production lacks supporting schema; copying the pilot wholesale would regress newer catalog releases.

**Approach:** Assemble a traceable candidate on current main, repair verification gaps and rehearse additive schema changes locally. Deliver validation evidence, not a deployment.

## Boundaries & Constraints

**Always:** Preserve the pilot and owner data. Hash selected files; detect source drift. Retain shipped DTC/motorcycle behavior, accepted onboarding, ownership/equipment/transmission guards, saved paint, independent service records and truthful responsive emails. Include the six reviewed owner twins, but no unsupported Aviator public 2026 visual. Use synthetic data and mock providers.

**Ask First:** Push/deployment, production schema/data changes, legacy subscriber mapping, credentials/webhook/activation, charges, email sends, new vehicle/publication scope or unresolved product decisions.

**Never:** Reset or broadly stage the pilot; transfer secrets/audience exports; enable enrollment, invitations or downgrade; import unpublished DTC/commerce changes; fabricate history or weaken guards. Do not repeat accepted purchases.

## I/O & Edge-Case Matrix

| Scenario | Input/state | Expected behavior | Failure handling |
|---|---|---|---|
| Shared article | Main plus Visual additions | Preserve DTC sources/links and motorcycle safeguards | Block regressions |
| Owner setup | Owned unconfirmed XT6 | Current ownerSetup, no service payload | Foreign IDs denied |
| Maintenance | Unknown history | Neutral/unlogged | No invented overdue |
| Schema | Missing support tables | Add structures, preserve legacy rows | Transaction rollback |
| Reservation | Normalized exact collision | Refuse without merging | Preserve old uniqueness |
| Migration retry | Applied/partial schema | Verify exact structure before no-op | Stop incompatibility |
| Billing | Absent flags/attestation | Enrollment closed | No provider fallback |

</frozen-after-approval>

## Code Map

- Source: `../known-issue-twin-pilot`; its launch checklist, September 18 preflight and billing setup reports are evidence, not execution authority.
- `src/app`, `src/lib`, `src/components/twin`, `public/twin-stage`: reviewed member/runtime dependencies and artwork.
- `src/components/known-issues/{KnownIssueCard,ArticleIssuesList,CategorySection}.tsx`, `catalog/ArticleRoute.tsx`, `src/components/twin/stage/TechTree.jsx`: manual merge boundaries.
- `prisma/schema.prisma`, pilot `scripts/sql` and `prisma/migrations`: ten missing support tables, four nullable fields, recovery fields and reservation uniqueness.
- `scripts/paid-hub-account-navigation.test.cjs`, `scripts/qa-maintenance-email.ts`, `tsconfig.json`: measured verification gaps.

## Tasks & Acceptance

**Execution:**
- [x] `docs/launch-candidate-manifest-20260918.json` — inventory exact selected paths, hashes and merge decisions. Preserve main's DTC routes/components, parsers, category normalization, retailer approvals, motorcycle wrappers and hydration fixes. Exclude output, private runtime/configuration and unrelated audits.
- [x] Manifest-selected source/assets — transfer reviewed account/auth/enrollment, Hub, reservation/claim and email dependencies. Manually merge shared surfaces; retain card source/link props, motorcycle preview noindex and car-only DIY guard. Preserve activation gates.
- [x] `scripts/paid-hub-account-navigation.test.cjs` — assert current ownerSetup, confirmation, foreign/invalid denial and no unintended writes; retain `owner-hub-setup.test.ts` coverage.
- [x] `scripts/qa-maintenance-email.ts`, `tsconfig.json`, `scripts/public-account-entrypoints.test.js` — type QA callbacks, exclude archived artifacts, replace obsolete founder-only assertions with current gated-enrollment checks. Keep strictness and real tests.
- [x] `scripts/release/launch-schema.sql`, `scripts/release/rehearse-launch-schema.cjs` — assemble ordered baseline-aware SQL; rehearse fresh, collision, partial and repeated states using synthetic records in a fresh loopback PostgreSQL instance. Assert structure, constraints and row preservation. Never target production or the existing owner sandbox; exclude downgrade journal.
- [x] `scripts/release/validate-launch-candidate.cjs` — run exact-candidate type-check/build/regressions with isolated Prisma/build output and synthetic public fixtures. Reject production endpoints/credentials; do not regenerate the active preview's client.
- [x] `docs/launch-candidate-review-20260918.md` — record fresh results, independent review, manifest/diff, schema sequence and rollback/recovery requirements. Keep live subscriber mapping, runtime identity, webhook and activation as separate gates.

**Acceptance Criteria:**
- Given the pilot, when assembly finishes, then its source/data remain unchanged and every candidate change has manifest provenance.
- Given the exact candidate, when strict type-check, full Next build and focused regressions run, then all pass; historical results never substitute.
- Given synthetic baseline/collision/partial states, when migration runs, then compatible additions preserve rows and incompatible states refuse safely.
- Given unset launch flags, when routes are tested, then no new paid access, invitation or billing mutation occurs.
- Given the final packet, when reviewed, then local readiness and outstanding production approvals are clearly separated.

## Spec Change Log

## Verification

- `node scripts/release/rehearse-launch-schema.cjs` — local-only schema, constraint, rollback and preservation cases pass.
- `node scripts/release/validate-launch-candidate.cjs` — strict full build and regression matrix pass: billing, owner setup/navigation, reservation/claim, maintenance/email containment, six trees and current-main public catalog.
- `git diff --check`, manifest hashes and final diff — clean, scoped and no secrets. Report actual suite counts without duplication.
- No push, production migration, deployment, live billing request or email send belongs to verification.

### Implementation evidence, 2026-09-18

- All seven execution tasks and two independent review passes finished; retained findings were corrected and rechecked locally.
- Exact candidate final full runner: 15 stages exit zero, strict TypeScript before/after build, Next webpack build with 607 static pages, 638 node-reported tests, 12 actual motorcycle consumer scenarios, and 20 actual offline email renderer cases. Schema rehearsal: 10 scenario groups, independently counted.
- [Review packet](../../docs/launch-candidate-review-20260918.md) records provenance, accepted-behavior test repairs, isolated-runtime limitations, schema sequence/recovery and held live gates. [Manifest](../../docs/launch-candidate-manifest-20260918.json) covers all candidate changes and protected main content.
- Pilot source preserved; task-owned PostgreSQL stopped without deleting synthetic data. No production release or activation performed. Live legacy subscriber mapping remains unresolved and held.

### Review corrections

- [Review triage](../../docs/launch-candidate-review-triage-20260918.md) records severity, deterministic patches and follow-up limits. Frozen intent and activation gates did not change.
- Account deletion preserves unsettled billing recovery; settled owner journals are removed safely. Submitted mileage corrections retain service/equipment state.
- Exact beta equipment/history access, visible transmission choices, invoice refresh, existing canonical service fallback and reviewed Visual library are covered by 47 added/regrouped tests in the final runner.
- New receipt uploads stay closed until cleanup environment readiness; actual scheduler/provider verification is a held release gate.

## Suggested Review Order

**Release boundary**

- Start with completed local evidence and the separate approvals still needed for launch.
  [launch-candidate-review-20260918.md:3](../../docs/launch-candidate-review-20260918.md#L3)

**Billing and data preservation**

- Never erase an account while an unresolved checkout can still charge.
  [delete/route.ts:66](../../src/app/api/account/delete/route.ts#L66)

- Checkout remains gated, idempotent and serialized with billing reconciliation.
  [stripe-create-checkout-handler.ts:15](../../src/lib/stripe-create-checkout-handler.ts#L15)

- Add compatible structures transactionally; refuse collisions and incompatible partial schemas.
  [launch-schema.sql:3](../../scripts/release/launch-schema.sql#L3)

**Owner and service boundaries**

- Beta rights remain exact-vehicle; equipment recovery never grants wider access.
  [vehicle-capabilities.ts:7](../../src/lib/vehicle-capabilities.ts#L7)

- Confirm equipment before exposing the reviewed service payload.
  [twin-hub-data.ts:361](../../src/lib/twin-hub-data.ts#L361)

- Shared service saves preserve independent clocks and idempotent invoice identity.
  [maintenance-service-mutation.ts:84](../../src/lib/maintenance-service-mutation.ts#L84)

**Visuals and communications**

- Publish only reviewed mapped vehicle visuals, never the unsupported Aviator sibling.
  [known-issue-twin-visuals.ts:131](../../src/lib/known-issue-twin-visuals.ts#L131)

- Render truthful reminders with contained artwork and vehicle-specific navigation.
  [maintenance-alert-email.ts:71](../../src/lib/maintenance-alert-email.ts#L71)

**Verification and provenance**

- Reproduce the complete build and regression matrix without production providers.
  [validate-launch-candidate.cjs:1](../../scripts/release/validate-launch-candidate.cjs#L1)

- Exercise denied and allowed paths through actual guarded routes.
  [launch-review-boundaries.test.cjs:1](../../scripts/launch-review-boundaries.test.cjs#L1)

- Inspect exact selected-source hashes, integration decisions and protected main files.
  [launch-candidate-manifest-20260918.json:1](../../docs/launch-candidate-manifest-20260918.json#L1)
