---
title: 'Route the Known Issues AI-search gate into the free vehicle Hub'
type: 'bugfix'
created: '2026-07-18'
status: 'in-progress'
baseline_commit: '568f2802cdca94a776cc8a0c40b7e918e92db01e'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** A free visitor can choose **AI search Plus** on a Known Issues page, describe a problem, and then reach an **Upgrade to Plus** button that sends them to `/subscribe`. That interrupts the diagnostic journey before they have tried Au7o's vehicle Hub.

**Approach:** Preserve the existing AI-search gate, but make its primary action open the free Hub for the make, model, and applicable article year the visitor is already viewing. Describe the action honestly as a free Hub trial instead of a paid upgrade.

## Boundaries & Constraints

**Always:** Keep free keyword search and subscriber AI search unchanged. Reuse the same year-selection rule as the Known Issues sidebar and mobile Hub link: the valid requested `?year=YYYY`, otherwise the newest documented year. Generate the Hub URL on the server and pass it into the client search component. Keep the link crawlable and keyboard accessible.

**Ask First:** Changing Hub quotas, creating an account automatically, changing the camera/vision gate, changing subscriber behavior, or adding analytics/events beyond the existing page instrumentation.

**Never:** Send this AI-search gate to `/subscribe` or sign-in, lose the page's vehicle context, claim the click purchases Plus, change unrelated upgrade links, or deploy/push as part of this local UI change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Anonymous/free visitor | Selects AI search, enters at least two characters, and submits | Gate appears with a free-Hub CTA linking to the page vehicle | Link remains a normal anchor so navigation works without client routing state |
| Year-filtered article | Valid `?year=YYYY` | Hub URL uses that year | Invalid/uncovered year falls back to newest documented year |
| Base article | No valid year filter | Hub URL uses newest documented issue year | Existing current-year fallback remains if no range is available |
| Active subscriber | Uses AI search | Existing in-page AI request/results flow remains unchanged | Existing API gate/error behavior remains unchanged |

</frozen-after-approval>

## Code Map

- `src/app/known-issues/[slug]/page.tsx` -- already calculates the correct Hub year for the sidebar and mobile CTA; will pass the corresponding vehicle URL to the search component.
- `src/components/known-issues/ModelIssueSearch.tsx` -- renders the non-subscriber AI-search gate and its current `/subscribe` link.
- `src/lib/vehicle-slug.ts` -- existing canonical year/make/model slug generator, already used by the page.

## Tasks & Acceptance

**Execution:**
- [ ] `src/app/known-issues/[slug]/page.tsx` -- generate/pass the vehicle-specific free-Hub URL using the page's established Hub-year rule.
- [ ] `src/components/known-issues/ModelIssueSearch.tsx` -- replace only the AI-search gate's subscription CTA with honest free-Hub copy and the supplied Hub URL.

**Acceptance Criteria:**
- Given a free visitor on a Known Issues page, when they select AI search, describe the issue, and submit, then the gate CTA opens the matching vehicle Hub rather than `/subscribe`.
- Given an active subscriber, when they submit AI search, then results continue to appear on the Known Issues page.
- Given a valid year-filtered Known Issues URL, when the free-Hub CTA is followed, then the vehicle Hub slug contains that year, make, and model.
- Given the camera/vision flow or another upgrade CTA, when its gate appears, then this change has not altered its destination or behavior.

## Spec Change Log

## Design Notes

Use concise conversion copy such as **Try it free in your Hub**. Pass a ready-to-use `hubHref` into the client component instead of importing the full vehicle-slug/YMMT helper into another client bundle.

## Verification

**Commands:**
- `npx eslint src/components/known-issues/ModelIssueSearch.tsx src/app/known-issues/[slug]/page.tsx` -- expected: zero errors.
- `npm run build` -- expected: production build completes.

**Manual checks:**
- On a base Known Issues article while signed out, enter an AI description and confirm the CTA points to the newest documented-year vehicle Hub.
- Repeat on a valid `?year=YYYY` variant and confirm that exact year appears in the Hub URL.
- Confirm keyword search still works and a subscriber still receives inline AI results.
