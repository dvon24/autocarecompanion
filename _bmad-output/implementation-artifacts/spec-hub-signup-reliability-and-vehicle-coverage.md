---
title: 'Restore Hub signup conversion and vehicle coverage'
type: 'bugfix'
created: '2026-07-16'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'f963ea0'
context: []
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** Homepage vehicle visitors reach the Hub, but anonymous account controls send them to sign-in instead of account creation, Hub chat can expose a raw upstream 401 permission error, and some published Known Issue model-years cannot be selected. The free Hub also shows less Known Issues value than the premium demo, weakening the reason to create an account.

**Approach:** Make the Hub funnel signup-first while retaining a returning-user sign-in path and exact vehicle callback; restore reliable chat with a permitted configurable model/fallback and branded error handling; show the real trim-filtered Known Issues summary to free users; and reconcile selector coverage against published Known Issues through a repeatable audit rather than one-off edits.

## Boundaries & Constraints

**Always:** Preserve the selected vehicle and return users to the same Hub after signup; use real Known Issue records, costs, and report data; keep Known Issues visible without a paid plan; refund chat allowance when no usable reply is delivered; log technical failures server-side while showing users safe Au7o copy; make YMMT reconciliation deterministic and auditable.

**Ask First:** Any database migration, pricing/entitlement change, deletion or factual rewriting of published Known Issues, or broad homepage/CRO redesign beyond this funnel repair.

**Never:** Invent issue incidence, mileage ranking, social proof, or vehicle fitment; expose provider names, response bodies, credentials, or raw API errors; remove the sign-in route for existing users; blindly add unsupported model-years merely to make an audit pass; modify the separate Known Issues deep-link catalog work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| New visitor | Anonymous user on `/vehicle/{slug}` | Primary account CTA says create a free account and carries the exact Hub callback | Returning-user sign-in remains available |
| Signup return | Account is created from a vehicle Hub | User returns authenticated to the same vehicle context | If auto-signin fails, sign-in fallback preserves callback |
| Chat permission failure | Primary model is unavailable or forbidden | Server uses the configured permitted fallback once | If both fail, refund quota and show a generic retry message |
| Known Issues value | Vehicle has published matching issues | Free and paid Hub users see up to four real, trim-filtered issue rows with honest metadata and deep links | No fabricated placeholder card when none match |
| Selector mismatch | Published supported model-year is absent or named differently in YMMT | Audit resolves it through a verified entry or explicit canonical alias | Unsupported/conflicting rows remain reported for review, not guessed |

</frozen-after-approval>

## Code Map

- `src/components/vehicle/VehicleHub.tsx` -- Hub account CTAs, anonymous gate, chat error display, and Known Issues summary.
- `src/components/auth/FloatingAuthButton.tsx` -- Global unauthenticated CTA rendered over the Hub.
- `src/app/auth/signup/page.tsx` -- Callback-preserving account creation and selected-vehicle handoff.
- `src/app/api/hub-chat/route.ts` -- Model selection, fallback, quota refund, and streamed error sanitization.
- `src/lib/hub-data.ts` -- Real trim-filtered Known Issue card data.
- `public/data/ymmt.json` and `src/lib/load-ymmt.ts` -- Homepage selector coverage and runtime loading.
- `scripts/` -- Repeatable Known Issue-to-YMMT coverage audit/reconciliation.

## Tasks & Acceptance

**Execution:**
- [x] Update Hub and floating authentication controls to use a shared signup-first callback for anonymous vehicle visitors, with a clear secondary sign-in path.
- [x] Preserve a valid selected vehicle through signup and return to its exact Hub without requiring YMMT re-entry.
- [x] Replace the hardcoded Hub model failure point with permitted, environment-configurable primary/fallback behavior and sanitize streamed errors.
- [x] Promote the existing real Known Issues summary to the free Hub with up to four rows and honest trim/cost/report metadata.
- [x] Add and run a deterministic published-Known-Issue versus YMMT coverage audit; reconcile verified supported gaps and aliases, leaving an explicit report for factual conflicts.
- [x] Add focused regression checks for auth URLs/callbacks, model fallback/error masking, free-card visibility, and YMMT coverage.
- [x] Give anonymous Hub visitors five messages before the signup gate, with the server quota, IP safety limit, client counter, and limit prompt kept in sync.
- [x] Remove the redundant Au7o mark beside the desktop vehicle selector while preserving the primary top-left brand and the selector itself.
- [x] Keep one persistent Au7o mark in the dedicated mobile header while the navigation drawer is closed.
- [x] Remove the overlapping global auth control from the mobile Hub and keep a visible signup-first CTA in the Hub header.

**Acceptance Criteria:**
- Given an anonymous homepage YMMT visitor, when they enter the Hub and choose the primary account action, then they reach signup and return authenticated to the same vehicle Hub.
- Given a returning user, when they choose sign-in, then the same callback behavior remains available.
- Given the production key lacks access to the requested model, when Hub chat runs, then the user either receives a fallback reply or a provider-neutral retry message, never a raw 401.
- Given a vehicle with matching published issues, when any visitor opens its Hub, then up to four real Known Issues appear with working article deep links and no premium gate.
- Given the coverage audit, when it completes, then every supported published model-year is selectable or explicitly mapped, and every unresolved factual conflict is listed.
- Given a new anonymous visitor, when they use Hub chat, then the first five successfully delivered messages are allowed and the next attempt shows the signup prompt; failed replies do not consume the allowance.
- Given the desktop Hub, when it renders, then only one primary Au7o brand mark appears near the vehicle controls.
- Given the mobile Hub with its navigation drawer closed, when the header renders, then one Au7o mark remains visible without crowding out the vehicle selector or account control.
- Given an anonymous mobile Hub visitor, when the header renders, then a visible create-account action uses the exact vehicle callback and no global auth pill overlaps it.

## Verification

**Commands:**
- `npm run lint` -- expected: no new lint errors.
- `npm run build` -- expected: production build succeeds.
- Focused Node/test commands added by this change -- expected: auth, fallback, card, and coverage assertions pass.

**Manual checks (if no CLI):**
- Complete homepage YMMT -> Hub -> create account -> same Hub flow in a clean browser session.
- Verify a vehicle with Known Issues shows the free summary on mobile and desktop.
- Force an unavailable model in a non-production environment and confirm no raw provider error reaches the UI.

## Review Resolution

- Independent edge-case and blind reviews completed; every actionable finding was resolved.
- Failed, interrupted, and empty chat turns now refund both local and server reservations.
- Provider diagnostics remain server-only; user-visible errors stay branded and provider-neutral.
- Verification passed: 17 focused tests, diff check, responsive browser checks, and production build.

## Suggested Review Order

**Hub funnel and responsive entry**

- Start with the shared callback, anonymous settlement, and Hub surface orchestration.
  [`VehicleHub.tsx:252`](../../src/components/vehicle/VehicleHub.tsx#L252)

- Keep one mobile brand mark and a compact signup-first action without overlap.
  [`VehicleHub.tsx:1621`](../../src/components/vehicle/VehicleHub.tsx#L1621)

- Preserve the full Hub query when the global account control is used.
  [`FloatingAuthButton.tsx:82`](../../src/components/auth/FloatingAuthButton.tsx#L82)

- Recover safely when account creation succeeds but automatic sign-in fails.
  [`page.tsx:94`](../../src/app/auth/signup/page.tsx#L94)

**Reliable anonymous chat**

- Coordinate server quota settlement, transport fallback, and completed-stream validation.
  [`route.ts:472`](../../src/app/api/hub-chat/route.ts#L472)

- Isolate fallback selection and usable-reply rules for deterministic testing.
  [`hub-chat-model.ts:44`](../../src/lib/hub-chat-model.ts#L44)

- Persist server reconciliation and restore failed client-side reservations.
  [`useAnonymousLimit.ts:114`](../../src/hooks/useAnonymousLimit.ts#L114)

- Centralize the five-message anonymous allowance across every enforcement layer.
  [`hub-message-limits.ts:8`](../../src/lib/hub-message-limits.ts#L8)

**Known Issue value and vehicle coverage**

- Ground Hub URLs in catalog parsing while retaining legacy-link compatibility.
  [`page.tsx:22`](../../src/app/vehicle/[slug]/page.tsx#L22)

- Feed free Hub cards from real, trim-filtered Known Issue records.
  [`hub-data.ts:118`](../../src/lib/hub-data.ts#L118)

- Bound explicit catalog-to-article aliases by supported model years.
  [`known-issue-vehicle-aliases.ts:57`](../../src/lib/known-issue-vehicle-aliases.ts#L57)

- Produce a deterministic coverage report before applying reviewed YMMT additions.
  [`audit-known-issue-ymmt-coverage.js:89`](../../scripts/audit-known-issue-ymmt-coverage.js#L89)

**Regression evidence**

- Exercise callback safety, query preservation, and open-redirect rejection.
  [`auth-callback.test.ts:5`](../../src/lib/auth-callback.test.ts#L5)

- Verify transport fallback and reject incomplete or empty model streams.
  [`hub-chat-model.test.ts:60`](../../src/lib/hub-chat-model.test.ts#L60)

- Prove failed replies restore the five-message local allowance.
  [`rateLimit.test.ts:37`](../../src/lib/rateLimit.test.ts#L37)
