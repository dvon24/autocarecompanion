---
title: 'US known-issue visual Twin paywall pilot'
type: 'feature'
created: '2026-09-03'
status: 'done'
baseline_commit: 'ae8ed475'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** Model Known Issues pages explain failures well in text, but they do not let a visitor see where those failures live on the vehicle or follow the affected systems and repair parts through the Twin-style tree. Au7o needs a narrow paid experiment that tests whether the visual-plus-text experience is worth $4.99/month without hiding the existing free issue catalog.

**Approach:** Add a dev-only pilot to the 2020 Cadillac XT6 Known Issues page. It is the highest-interest non-Challenger model with usable issue-mileage data. The Twin replaces the introductory summary when explicitly enabled, uses the existing XT6 camera and hotspot geometry, filters the timeline only from published `typicalMileage` evidence, and opens an issue-grounded component/fix tree. After two different issue selections in the same session, gate only the Twin visual and offer the $4.99 Known Issues Visual plan or the $14.99 full Hub.

## Boundaries & Constraints

**Always:** Keep the complete existing Known Issues cards below the pilot free and unchanged. Use only published Cadillac XT6 issues that apply to model year 2020. Use `getKnownIssueCommerce()` before showing a product or buy link. Count two distinct issue IDs, not repeated taps on one issue. Let “Show all” display issues without a documented mileage while labeling that mileage as not established. Make preview/local builds reviewable outside the U.S.; make any eventual production exposure U.S.-only and dependent on an explicit feature flag. Instrument impressions, timeline/show-all use, issue selections, gate display, and CTA intent without recording personal data.

**Ask First:** Enabling the pilot in production, creating a Stripe product or price, adding an entitlement, charging a user, changing the existing $14.99 Hub checkout, editing issue records, or expanding the experiment to another make/model.

**Never:** Use the Challenger for this pilot; invent mileage, symptoms, affected systems, parts, links, or hotspots; expose unverified commerce; block or blur the free article cards; imply that the $4.99 checkout is live before its billing/entitlement path exists; deploy to production.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Review entry | Preview/local URL for `/known-issues/cadillac-xt6?year=2020&twinPilot=1` | Twin replaces the large summary and uses the existing XT6 art/geometry | Without the query, render the original page exactly |
| Production entry | Same query on production | Render only when country is US and the production flag is enabled | Fail closed to the original summary |
| Mileage mode | Slider moved | Show only mapped 2020 issues whose published mileage window intersects the selected mileage neighborhood | Never synthesize a missing mileage |
| Show-all mode | Visitor chooses Show all | Show every applicable issue; unmapped issues remain readable without a fake marker | Label missing mileage as “Mileage not established” |
| Issue selection | First distinct issue | Focus the grounded hotspot/effect and open its issue/component/fix branch | Re-selecting the same issue does not advance the gate counter |
| Conversion gate | Second distinct issue | Hide the interactive Twin and show $4.99 visual-only and $14.99 Hub choices | Free issue cards beneath remain usable |
| Repair products | Issue has stored fix parts | Show only verified, renderable commerce returned by the central guard | Fall back to repair/dealer guidance when no eligible product exists |

</frozen-after-approval>

## Code Map

- `src/app/known-issues/[slug]/page.tsx` — resolves the pilot entry conditions and supplies the already-fetched 2020 issues.
- `src/components/known-issues/KnownIssueTwinPilot.tsx` — interactive Twin, mileage timeline, Show all, issue tree, and visual-only gate.
- `src/lib/known-issue-twin-pilot.ts` — pure eligibility, mapping, mileage, commerce projection, and distinct-view rules.
- `src/lib/vehicle-twin-catalog.ts` — source of the existing 2020 XT6 identity, art, and hotspot coordinates; no duplicate vehicle definition.
- `src/components/analytics/GoogleAnalytics.tsx` — existing anonymous event transport.
- `scripts/known-issue-twin-pilot.test.ts` — focused behavioral and truthfulness tests.

## Tasks & Acceptance

**Execution:**
- [x] Add a server-side pilot resolver that is preview/local reviewable and production-US/flag gated.
- [x] Project the actual 2020 XT6 issue set into safe visual nodes without inventing missing evidence.
- [x] Build the Twin/timeline/Show-all/tree experience in the existing Au7o visual language.
- [x] Enforce a two-distinct-issue session gate that affects only the visual.
- [x] Add analytics and honest CTA behavior; keep the $4.99 action as tracked design intent until billing exists.
- [x] Add focused automated tests and verify responsive desktop/mobile rendering.
- [x] Commit and publish a Vercel preview only.

**Acceptance Criteria:**
- Given the explicit pilot URL in preview/local, the 2020 XT6 Twin appears where the introductory summary normally sits and the normal issue cards remain below it.
- Given mileage mode, only issues backed by published mileage ranges appear; given Show all, all applicable issues are available and missing mileage is disclosed.
- Given one issue selection, its grounded vehicle region and issue tree appear; given a second different issue selection, only the visual becomes gated.
- Given an issue without an eligible verified product link, no invented or unverified buy button appears.
- Given a repeated selection of the same issue, the paywall is not triggered.
- Given the production site without the explicit production flag and US geo, the standard summary remains unchanged.
- Given either CTA, the interaction is tracked and the copy does not claim that an unavailable $4.99 checkout has completed a purchase.

## Design Notes

Use the existing 2020 Cadillac XT6 Sport Satin Steel artwork and hotspot coordinates. Visually fade the dark diagnostic-stage edges into the article background so the car sits in the summary area without a hard rectangular card. The issue tree should echo the Hub’s root → system → issue → repair/product hierarchy, but stay read-only. On mobile, keep the mileage control and issue list thumb-friendly and place the focused branch beneath the vehicle.

## Verification

**Commands:**
- `npx tsx --test scripts/known-issue-twin-pilot.test.ts`
- `npx eslint src/app/known-issues/[slug]/page.tsx src/components/known-issues/KnownIssueTwinPilot.tsx src/lib/known-issue-twin-pilot.ts`
- `npx tsc --noEmit`
- `npm run build`

**Manual checks:**
- Open the preview pilot URL at desktop and mobile widths.
- Confirm the first issue focuses the vehicle and the second different issue gates only the Twin.
- Confirm the issue cards below the Twin remain visible and navigable after gating.
- Confirm “Show all” includes issues with no mileage without fabricating a value.
- Confirm the same issue clicked repeatedly does not trigger the gate.
- Confirm the page without `twinPilot=1` is unchanged.

## Spec Change Log

- 2026-09-03 — Frozen from the user-approved overnight dev-pilot requirements.

## Suggested Review Order

**Entry and exposure boundary**

- Start with the opt-in XT6 route, production flag, and U.S. fail-closed gate.
  [`page.tsx:763`](../../src/app/known-issues/%5Bslug%5D/page.tsx#L763)

- See how the Twin visually replaces only the summary while preserving free cards.
  [`page.tsx:893`](../../src/app/known-issues/%5Bslug%5D/page.tsx#L893)

**Evidence and commerce integrity**

- Review exact catalog-ID hotspot mapping and published 2020 issue projection.
  [`known-issue-twin-pilot.ts:66`](../../src/lib/known-issue-twin-pilot.ts#L66)

- Verify exact year, trim, engine, and variant fitment guards before commerce renders.
  [`known-issue-twin-pilot.ts:116`](../../src/lib/known-issue-twin-pilot.ts#L116)

**Interactive product experience**

- Follow the grounded system → issue → guidance → verified-part tree.
  [`KnownIssueTwinPilot.tsx:54`](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L54)

- Review the honest visual-only and full-Hub paywall choices.
  [`KnownIssueTwinPilot.tsx:145`](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L145)

- Inspect mileage filtering, Show All, hotspot selection, and responsive layout together.
  [`KnownIssueTwinPilot.tsx:179`](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L179)

**Regression evidence**

- Finish with mapping, fitment, recall, gate-history, geo, and mileage tests.
  [`known-issue-twin-pilot.test.ts:35`](../../scripts/known-issue-twin-pilot.test.ts#L35)
