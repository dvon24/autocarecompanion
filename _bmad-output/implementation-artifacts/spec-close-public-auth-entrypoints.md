---
title: 'Close public account access'
type: 'bugfix'
created: '2026-08-10'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'e62481f35e24d8d7f728d45eae5b81cc31a305ca'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Public sign-up and sign-in entry points still allow visitors to create and access accounts; one email/password account was created on August 9 even though public accounts are not intended to be open. Only Devon's two established owner emails should be able to authenticate.

**Approach:** Close account creation at both page and API boundaries, remove unauthenticated sign-up/sign-in CTAs from public surfaces, and enforce the existing canonical two-address owner list for every credentials or Google authentication attempt and existing JWT session.

## Boundaries & Constraints

**Always:** Preserve the two authorized owner accounts and their direct `/auth/signin` route; keep authenticated owner menus and protected-page redirects working; leave known-issue alert email capture, feedback, reservations, and unsubscribe behavior unchanged; return a deterministic closed response from direct signup API calls; remove rather than visually hide public auth actions; invalidate non-owner sessions on their next auth check.

**Ask First:** Deleting or anonymizing existing user records; changing the two authorized addresses; disabling paid Stripe checkout or altering subscription records; sending a reply to submitted feedback.

**Never:** Put email addresses or secrets into client bundles; delete Sarah Weeks or any other user as part of this patch; remove `/api/interest` or the Monday alert signup; remove owner password reset, sign-out, account, or admin access; stage unrelated work from the primary workspace.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Owner login | Either canonical owner email via credentials or Google | Authentication and owner session continue normally | Invalid password retains generic error |
| Non-owner login | Any other email, including an existing user | Authentication is denied and an existing JWT no longer yields a session | Do not reveal whether the account exists |
| Direct signup | GET `/auth/signup` or POST `/api/auth/signup` | Page returns home; API refuses creation without hashing or DB writes | Stable 410 JSON response |
| Anonymous UI | Any public route or exhausted free feature | No Sign up, Create account, Join free, or Sign in action is rendered | Non-auth alternatives may remain, such as known issues, reset timing, alerts, or pricing |
| Alert capture | Known-issues email alert form | InterestEmail capture continues without an account | Existing validation and unsubscribe rules remain |

</frozen-after-approval>

## Code Map

- `src/lib/founder.ts` — canonical owner identities and server-only access predicate.
- `src/lib/auth.ts` — credentials, Google, JWT, and session enforcement.
- `src/app/auth/signup/page.tsx` — currently exposes the account form.
- `src/app/api/auth/signup/route.ts` — currently creates password accounts.
- `src/components/auth/*` and `src/components/shared/SiteHeader.tsx` — global public auth controls.
- `src/components/vehicle/VehicleHub.tsx`, `src/components/chat/UpgradePrompt.tsx`, and diagnose/drive gates — feature-level account prompts.
- `src/components/known-issues/KnownIssueAlertSignup.tsx` — protected non-account alert capture.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/founder.ts`, `src/lib/auth.ts` — add and enforce an exact owner-account predicate for all login methods and stale JWTs.
- [x] `src/app/auth/signup/page.tsx`, `src/app/api/auth/signup/route.ts` — close the browser form and direct write endpoint.
- [x] Public auth controls and feature gates — remove unauthenticated sign-in/sign-up actions while retaining useful non-auth content.
- [x] Subscription free-tier action and make-page CTA — remove their signup destinations without changing paid checkout.
- [x] Tests — cover owner allowlisting, closed signup behavior, and a source-level regression scan for public auth CTAs.

**Acceptance Criteria:**
- Given an anonymous visitor, when public pages and feature gates render, then no account signup or existing-user sign-in control is offered.
- Given a direct signup POST, when any valid payload is submitted, then no user is created and HTTP 410 is returned.
- Given either owner email, when valid credentials or authorized Google identity is used, then sign-in succeeds; every other email receives the same generic denial.
- Given a non-owner JWT minted before deployment, when auth refreshes it, then it is invalidated.
- Given a known-issues visitor, when they submit an alert email, then the account closure does not affect the capture.

## Spec Change Log

- 2026-08-10 adversarial review: closed the checkout auto-login JWT bypass,
  required an authenticated owner before Stripe checkout, normalized owner
  credentials, rate-limited rejected identities, and removed stale account
  promises. A read-only production check found zero active non-owner
  subscriptions; no billing or user record was changed.
- Review dispositions: checkout/auth timing/normalization/stale-copy findings
  were patched; the secure-cookie finding became inapplicable when checkout
  auto-login was removed; the paid-subscriber lockout risk was rejected after
  the zero-active-subscription production check.

## Verification

**Commands:**
- `npx tsx --test <targeted tests>` — owner, signup closure, and public-CTA regression tests pass.
- `npx tsc --noEmit` — no type errors.
- `npm run lint -- <changed source files>` — no lint errors.
- `npm run build` — production build passes from the isolated worktree.
- `git diff --check` — no whitespace errors.

**Result:** 11/11 targeted tests pass; TypeScript, focused ESLint, production
build (1,535 static pages), and whitespace checks pass.

## Suggested Review Order

**Authentication boundary**

- Enforce the exact two-email allowlist across credentials, providers, and stale JWTs.
  [`auth.ts:83`](../../src/lib/auth.ts#L83)

- Keep runtime QA bypasses from expanding the private account allowlist.
  [`founder.ts:39`](../../src/lib/founder.ts#L39)

- Reject direct signup before parsing, hashing, or database access.
  [`route.ts:6`](../../src/app/api/auth/signup/route.ts#L6)

**Hidden account-creation paths**

- Require an authenticated owner before request parsing or Stripe contact.
  [`create-checkout/route.ts:23`](../../src/app/api/stripe/create-checkout/route.ts#L23)

- Retire checkout-session JWT minting with a deterministic closed response.
  [`checkout-signin/route.ts:8`](../../src/app/api/auth/checkout-signin/route.ts#L8)

**Public interface closure**

- Redirect stale signup bookmarks without rendering the old form.
  [`signup/page.tsx:3`](../../src/app/auth/signup/page.tsx#L3)

- Render no global auth control for anonymous visitors.
  [`FloatingAuthButton.tsx:78`](../../src/components/auth/FloatingAuthButton.tsx#L78)

- Remove anonymous user-menu entry points while preserving owner controls.
  [`UserMenu.tsx:43`](../../src/components/auth/UserMenu.tsx#L43)

- Replace public pricing enrollment with an account-closed information state.
  [`SubscribeClient.tsx:88`](../../src/components/subscribe/SubscribeClient.tsx#L88)

- Replace exhausted-account prompts with the public known-issues route.
  [`UpgradePrompt.tsx:94`](../../src/components/chat/UpgradePrompt.tsx#L94)

**Preserved public capture and regression gates**

- Preserve Monday vehicle-alert capture without requiring an account.
  [`KnownIssueAlertSignup.tsx:40`](../../src/components/known-issues/KnownIssueAlertSignup.tsx#L40)

- Scan all source for revived signup CTAs, sign-in destinations, and client allowlist leaks.
  [`public-account-entrypoints.test.js:17`](../../scripts/public-account-entrypoints.test.js#L17)

- Prove only the canonical owner identities pass the pure access predicate.
  [`founder.test.ts:5`](../../src/lib/founder.test.ts#L5)
