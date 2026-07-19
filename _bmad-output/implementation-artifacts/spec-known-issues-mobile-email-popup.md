---
title: 'Restore the compact Known Issues email popup on phones'
type: 'bugfix'
created: '2026-07-18'
status: 'in-progress'
baseline_commit: '568f2802cdca94a776cc8a0c40b7e918e92db01e'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** The delayed Known Issues modal renders the full feature-carousel capture on a phone. It consumes nearly the entire viewport, interrupts reading, and makes the low-friction email action harder to reach.

**Approach:** Keep the existing feature-carousel modal on desktop, but render the existing compact email-alert capture inside the modal on phone-width viewports. Reuse the proven email form and endpoint rather than creating another capture flow.

## Boundaries & Constraints

**Always:** Treat viewports below 768px as the phone presentation. Preserve the current five-second/deep-scroll trigger, `?popup=1` test override, backdrop dismissal, close button, once-per-visitor storage behavior, vehicle-specific context, `/api/interest` submission, analytics, and post-submit close behavior. Render `KnownIssueAlertSignup` with its carousel disabled so the mobile modal contains the email capture, not either carousel. Keep the modal usable within small dynamic viewports and react when the breakpoint changes.

**Ask First:** Changing the desktop modal, trigger timing, dismissal/re-show policy, email copy, account CTA, capture endpoint, inline Known Issues capture, or local-storage key.

**Never:** Remove the desktop `KnownIssuesCaptureSplit`, duplicate email submission logic, show both modal variants at once, briefly paint the desktop carousel on a phone before breakpoint detection, or deploy/push as part of this local UI change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Phone popup | Viewport below 768px; timer, scroll, or `?popup=1` opens it | Compact email-alert card appears; no feature/value carousel is rendered | Keep the overlay scrollable if content exceeds the dynamic viewport |
| Desktop popup | Viewport 768px or wider | Existing feature-carousel split appears unchanged | Preserve current close and backdrop behavior |
| Breakpoint changes | Open modal crosses the media-query boundary | Swap to the matching presentation without mounting both | Remove the media-query listener on unmount |
| Email succeeds | Mobile visitor submits a valid email | Existing lead event/storage logic runs and the popup closes | Existing inline error state remains available on failure |

</frozen-after-approval>

## Code Map

- `src/components/known-issues/AlertSignupPopup.tsx` -- shared delayed modal used by vehicle, make, and DTC Known Issues pages; currently always mounts the feature-carousel split.
- `src/components/known-issues/KnownIssueAlertSignup.tsx` -- existing email-first capture; supports `showCarousel={false}` and an `onDone` close callback.
- `src/components/known-issues/KnownIssuesCaptureSplit.tsx` -- existing desktop feature-carousel presentation that must remain unchanged.

## Tasks & Acceptance

**Execution:**
- [ ] `src/components/known-issues/AlertSignupPopup.tsx` -- add breakpoint-aware modal content, mobile sizing, and compact close-button styling while preserving all trigger/dismiss behavior.
- [ ] `src/components/known-issues/AlertSignupPopup.tsx` -- wire the existing email capture with `showCarousel={false}` and close after successful submission.

**Acceptance Criteria:**
- Given a Known Issues page below 768px, when the popup opens, then the email form is immediately visible and neither carousel is rendered.
- Given a desktop Known Issues page, when the popup opens, then its current feature-carousel layout and behavior are unchanged.
- Given `?popup=1`, dismissal, resize, successful capture, or failed capture, when that path runs, then no regression occurs in the existing popup lifecycle.

## Spec Change Log

## Design Notes

Use `matchMedia('(max-width: 767px)')` with an unresolved initial state. Do not render modal content until the first match is known; this prevents a one-frame desktop carousel flash on phones while leaving the delayed-open path effectively instantaneous.

## Verification

**Commands:**
- `npx eslint src/components/known-issues/AlertSignupPopup.tsx` -- expected: zero errors.
- `npm run build` -- expected: production build completes.

**Manual checks:**
- Open a vehicle Known Issues URL with `?popup=1` at 390px width: compact email capture fits without a carousel.
- Repeat at 1280px width: the existing feature-carousel split remains present.
- Resize across 768px while open and submit a test-shaped invalid email to exercise variant switching and the existing error state without sending data.
