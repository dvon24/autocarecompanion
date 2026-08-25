---
title: 'Combined repair-first audit, twin UI, reserve flow, and launch email release'
type: 'feature'
created: '2026-08-25'
status: 'complete'
review_loop_iteration: 3
baseline_commit: '96d0ecea3a9a151f54e3cbd32f9999514974d6c8'
context:
  - 'data/_HANDOFF-TO-SOL.md'
  - 'design/release/2026-08-24/CHANGELOG.md'
  - 'C:/Users/devon/.codex/skills/review-part-fitment-links/SKILL.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The completed repair-first audit is awaiting publication, while Opus's admin, rotating hero, signed-in twin hub, reserve picker, and one-time return campaign are split between standalone designs and partially integrated code. Releasing these separately would make campaign links land on an older experience and make verification harder.

**Approach:** Integrate the approved designs into the production components, turn admin into a reservation-to-twin fulfillment queue, preserve fitment and access gates, package the audited parts data, and deploy them as one verified release. For YMMTs reviewed as having both automatic and manual branches, capture the owner's transmission and show only that branch's fluid/service parts and order links; do not show an unnecessary field for automatic-only or unreviewed vehicles. Prepare a personalized Resend campaign, but require a final send-time approval after reporting exact audience counts and previews.

## Boundaries & Constraints

**Always:** Read full “How to Fix” text when validating parts; require `part.verified === true` and `link.verified === true`; preserve affiliate tags; keep `/demo/hub`; keep `/admin` founder-only; treat reservation email as the account-matching key; let admin track requested YMMT, conditional transmission, account match, build/ready state, assigned twin, and a 7- or 30-day offer; show a transmission selector only for an exact reviewed YMMT with both automatic and manual branches; show the live twin hub only to signed-in owners whose vehicle has truthful mapped art/tree data, selected drivetrain, usable mileage, and an unexpired offer; retain classic hub fallback; retain accessible reserve fallback when YMMT fails; use active, unsuppressed, deduplicated recipients and personalized one-click unsubscribe URLs.

**Ask First:** Any real campaign send; any campaign audience/subject/from-address change after preview; any substitution or generation of missing twin art; any automatic paid-subscription/trial entitlement; any destructive DB correction beyond the reviewed audit payload.

**Never:** Display Challenger art/parts as another owner's vehicle; deploy broken/local email image URLs; expose admin data; auto-promote citation-gate failures; send to unsubscribed/suppressed addresses; deploy UI separately from the accepted audit batch.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Reserve | Valid catalog Y/M/M/T and email | Verified reservation, deduped/upgraded record, success state | Catalog failure exposes free-text fallback; server independently verifies |
| Transmission | Exact reviewed dual-transmission YMMT | Required Automatic/Manual choice; stored and revalidated server-side | Automatic-only, incomplete, or unreviewed YMMTs show no field and store no guessed value |
| Hero | Auto rotation or manual steering | Challenger, Nautilus, Murano rotate; manual action stops auto-advance | Only twins with complete shipped assets render; no broken image frame |
| Hub | Signed-in owner with supported mapped twin | Real mileage/service-backed twin hub with only the selected transmission branch and orderable correct fluid | Unsupported/no-mileage/no-transmission/expired-offer vehicle receives classic hub; `?twin=0` remains escape hatch |
| Fulfillment | Reservation email and optional existing account | Admin sees exact account match, chooses build state/assigned twin and 7- or 30-day offer | A ready state cannot be assigned to an unmapped twin; no automatic billing or entitlement |
| Campaign | Active recipient with Nautilus context vs all others | Nautilus creative for Nautilus; Challenger creative otherwise; actual vehicle prefilled in CTA | Deduplicate, suppress, skip invalid address, log dry-run reasons |
| Commerce | Reviewed issue with accepted part/link | Buy link renders with fitment text intact | Render guard blocks invisible/unverified/vendor-mismatched links |

</frozen-after-approval>

## Code Map

- `src/components/home/TwinHero.tsx` -- production homepage composition and rotating twin stage.
- `src/components/home/HeroReserveForm.tsx`, `src/app/api/reservation/route.ts`, `src/lib/reservation*.ts` -- cascading YMMT, prefill, and server verification.
- `src/app/admin/page.tsx`, `src/app/api/admin/data/route.ts` -- preserve operational tabs while adding the reservation-to-twin fulfillment hub and exact email/account matching.
- `src/app/vehicle/[slug]/page.tsx`, `src/lib/twin-hub-data.ts`, `src/components/twin/**` -- signed-in mapped-twin routing and live hub.
- `scripts/build-reserve-links.js`, `scripts/send-twin-launch-email.js` -- recipient segmentation, preview, and explicitly gated one-time send.
- `data/**repair-first-review/**`, `scripts/_check-render-guard.ts`, `scripts/_audit-render-guard-db.ts` -- reviewed audit payload and visibility gates.

## Tasks & Acceptance

**Execution:**
- [x] Import only the user-facing approved twin art into public assets and fail validation on every missing live reference; optional admin paint variants remain non-blocking inventory.
- [x] Port the rotating hero and build an admin fulfillment hub without removing existing production actions or responsive/accessibility behavior.
- [x] Add durable reservation fulfillment state for requested vehicle, exact email/account match, assigned twin, build readiness, and admin-selected 7/30-day offer; do not auto-start paid entitlement.
- [x] Finish reserve persistence/prefill and widen the live hub from founder-only to all signed-in owners of mapped twins only.
- [x] Build dry-run-first Resend campaign with Nautilus/Challenger segmentation, hosted HTTPS imagery, unsubscribe/suppression handling, and send confirmation.
- [x] Persist only the reviewed audit batch and run render, duplicate, campaign, test, lint, type, and webpack build gates.
- [x] Capture transmission only for reviewed dual-transmission YMMTs and expose separate automatic/manual Challenger fluid branches with verified direct product links.
- [x] Resolve review blockers: enforce trial expiry, prevent cross-vehicle reservation corruption, select the exact garage trim, remove live-only fake service logging, fail campaign suppression closed, isolate test sends, align campaign art/copy, and label non-live hero state as preview data.
- [x] Commit/push once, deploy once, and smoke-test production.

**Acceptance Criteria:**
- Given a supported or unsupported owner vehicle, the hub never shows wrong-body or wrong-fitment data.
- Given any reviewed commerce row, every visible buy button survives the same guard used by production rendering.
- Given manual hero navigation, rotation pauses and every visible image has a shipped asset and truthful status label.
- Given campaign dry-run, totals reconcile across selected, deduplicated, Nautilus, Challenger, suppressed, invalid, and sendable cohorts before approval.
- Given a reservation, admin can see whether its normalized email matches an account and can track it through reserved/building/ready without exposing the hub before mapped art/tree data exists.
- Given an automatic-only vehicle, the reserve form never asks for transmission; given an exact reviewed dual-transmission vehicle, it requires Automatic or Manual and the hub exposes only that fluid branch.
- Given a successful combined deploy, homepage, reserve API, admin, demo/live hubs, known-issue buy links, sitemap, and ads/affiliate verification remain healthy.

## Spec Change Log

- 2026-08-25 — Devon clarified that admin is the vehicle-twin fulfillment hub, not just an art gallery. Added email/account matching, durable build/ready assignment, and 7/30-day offer selection; kept automatic billing/entitlement out of scope. Reduced the blocking art gate from every admin paint variant to only user-facing renders.
- 2026-08-25 — Devon added a conditional transmission requirement: dual-transmission cars must let the owner choose Automatic or Manual and receive the correct orderable fluid branch; automatic-only cars must not see the extra field. Review loop 1 also tightened trial, routing, live-state, and campaign safety gates.

## Verification

**Commands:**
- `npx tsc --noEmit` and targeted ESLint/tests -- expected: zero new errors.
- `npx tsx scripts/_check-render-guard.ts <gated-output.json>` -- expected: written equals renderable.
- `npx tsx scripts/_audit-render-guard-db.ts` plus duplicate/link audits -- expected: no release regression.
- `npm run build` (retry only for documented intermittent WasmHash race) -- expected: successful webpack production build.
- Campaign `--dry-run` -- expected: no email sent and cohort totals reconcile.

**Latest verified results (2026-08-25):** 1,726 reviewed issues / 3,536 verified parts and links persisted with zero skips; whole-corpus reader-visible commerce 1,057 → 2,762 issues and 87.2% → 95.0% renderable links; production schema synced; campaign dry run 176 rows / 173 unique / 173 sendable / 7 Nautilus / 166 Challenger / 0 sent / 0 pending / 0 missing images; 25 targeted tests passed; two independent final reviews reported no remaining blockers; targeted ESLint, TypeScript, duplicate audit, local and Vercel webpack/PWA builds passed. Vercel deployment `dpl_e8tgJXd3eB5KgGFaWpQv1TqN5sDj` is Ready and aliased to `https://au7o.io`; authenticated production smoke checks passed for the homepage/Impact tag, ads.txt, demo hub, reservation count API, twin assets, and Dodge repair-part anchors.
