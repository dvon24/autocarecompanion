---
title: 'Repair mobile hero and hub production regression'
type: 'bugfix'
created: '2026-08-27'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'e3a28697d84d6f072f7c8920f01f91fc2ec2326d'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The just-deployed experience is broken on phones: the homepage vehicle artwork is cropped into an incomplete vehicle view, and `/demo/hub` reaches the global error boundary with “Something went wrong.” Production console evidence identifies an undefined `twinMode` reference in the mobile hub; the hero stage combines a forced 300px minimum height with 16:9 artwork and `object-fit: cover`, causing destructive mobile cropping. The separate “See full hub” card remains hard-coded to the Challenger even after the carousel selects another vehicle.

**Approach:** Restore a complete, aligned vehicle preview at narrow widths, make the mobile hub obtain its owner/demo mode from the existing Twin context, and let the shared hero CTA follow the carousel’s selected vehicle. Preserve the approved status vocabulary: a red circular marker containing a warning triangle for overdue maintenance and a purple circular marker containing a shield for a documented known issue.

## Boundaries & Constraints

**Always:** Preserve the existing vehicle catalog, hotspot coordinates, owner/demo separation, reserve form, tech-tree navigation, and current desktop composition. Preserve red warning-triangle maintenance markers and purple shield known-issue markers wherever evidence supports those states; vehicles without service evidence must remain neutral rather than receiving invented alerts. Keep artwork and every overlay in one shared responsive frame so hotspots remain aligned. Exercise both direct `/demo/hub` loading and homepage-to-demo navigation at a phone-sized viewport.

**Ask First:** Any production database or Prisma schema mutation; changing the vehicle artwork itself; removing the Impact/Advance verification or consent scripts; deploying the repair to production.

**Never:** Hide the error boundary, disable mobile mode, replace the real vehicle with a generic fallback, remove hotspots to make the layout fit, or solve the crop with per-vehicle magic offsets that break the shared image coordinate system.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mobile homepage | 390x844 viewport on `/` | The full vehicle stage fits the card; base and glow layers remain aligned; controls and labels stay inside the viewport | Missing artwork follows existing image failure behavior without changing layout geometry |
| Mobile demo hub | 390x844 viewport on `/demo/hub` | Hub renders instead of the global error boundary and its composer says “Ask about this … demo” | Unknown query values continue to fail soft to the default demo |
| Selected-vehicle CTA | Carousel displays Nautilus, Murano, or XT6 | “See full hub” names/links to that selected demo just as hotspot double-click already does | Missing/unknown selection falls back to Challenger |
| Evidence markers | Hotspot has overdue or known-issue evidence | Overdue renders red warning triangle; known issue renders purple shield; neither is silently swapped | Unavailable/unlogged evidence renders the existing neutral state |
| Owner hub | Authenticated owner context | Mode-dependent labels use owner copy and real vehicle context | Missing vehicle data keeps existing guarded fallbacks |
| Desktop regression | Wide viewport on `/` and `/demo/hub` | Existing desktop stage proportions, hotspots, and hub layout remain usable | N/A |

</frozen-after-approval>

## Code Map

- `src/components/twin/hub/Hub.jsx` -- `THMobile` renders mode-dependent composer copy but currently references `twinMode` without calling `useTwinMode()` in its scope.
- `src/components/home/RotatingTwinStage.tsx` -- homepage stage fixes a 16:9 frame to a 300px minimum height and covers the artwork, which crops the vehicle on narrow screens.
- `src/components/home/TwinHero.tsx` -- contains a hard-coded Challenger description and `/demo/hub` link outside the rotating stage.
- `src/components/landing/LandingPage.tsx` -- composes the rotating stage with the hero and must preserve the client-side selected-vehicle signal.
- `src/components/twin/twin-context.jsx` -- existing authoritative owner/demo mode hook; reuse rather than adding new state.
- `src/app/demo/hub/DemoHubClient.tsx` -- demo provider and selected-vehicle entry point used for live verification.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/twin/hub/Hub.jsx` -- bind the mobile hub to `useTwinMode()` in the component that consumes it -- eliminate the production-only reference error while preserving owner/demo wording.
- [x] `src/components/home/RotatingTwinStage.tsx` -- make the image frame responsive at narrow widths without changing the base/overlay coordinate space -- show the complete vehicle instead of a vertically forced crop.
- [x] `src/components/home/TwinHero.tsx`, `src/components/landing/LandingPage.tsx`, and `src/components/home/RotatingTwinStage.tsx` -- share the selected demo vehicle with the external “See full hub” card and build its label/link from the selection -- make every carousel vehicle reachable through both navigation paths.
- [x] Hero and hub evidence marker rendering -- verify the approved red-triangle and purple-shield vocabulary still follows truthful evidence status; change code only if the deployed mapping violates it -- avoid reintroducing fabricated maintenance states on incomplete demos.
- [x] Focused regression coverage -- add the smallest maintainable automated guard available for the mobile mode binding and responsive frame, then exercise the rendered pages locally -- prevent another build-green/runtime-red release.

**Acceptance Criteria:**
- Given a 390x844 viewport, when the homepage loads, then the vehicle is not clipped by a forced 300px stage and the base, highlights, and hotspots share the same frame.
- Given a 390x844 viewport, when `/demo/hub` loads, then no `twinMode is not defined` error occurs and the full mobile hub renders.
- Given demo and owner Twin providers, when mobile composer copy renders, then demo copy refers to the selected demo and owner copy refers to the user’s car.
- Given a desktop viewport, when the same routes load, then the current desktop vehicle card and hub remain intact.
- Given any non-Challenger carousel selection, when “See full hub” is activated, then the matching `vehicle` query is sent and that vehicle opens in the demo hub.
- Given known-issue, overdue-maintenance, and unavailable hotspots, when markers render, then they use the purple shield, red warning triangle, and neutral unavailable treatments respectively.

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: no TypeScript errors.
- `npx eslint src/components/home/RotatingTwinStage.tsx` -- expected: no new lint errors.
- `npm run build` -- expected: production build completes.
- focused regression test command selected during implementation -- expected: all hub/mobile guards pass.

**Manual checks (if no CLI):**
- At 390x844, inspect `/` and `/demo/hub`; confirm a complete vehicle composition, aligned hotspots, no horizontal overflow, no global error boundary, and no new console errors from the hub bundle.
- At a wide desktop viewport, repeat both routes and confirm no visible regression.

## Suggested Review Order

**Selected vehicle flow**

- Hero owns the selection so stage and external CTA cannot disagree.
  [`TwinHero.tsx:165`](../../src/components/home/TwinHero.tsx#L165)

- Carousel reports each displayed vehicle through one explicit callback.
  [`RotatingTwinStage.tsx:34`](../../src/components/home/RotatingTwinStage.tsx#L34)

- Landing uses the stateful production hero while retaining preview compatibility.
  [`LandingPage.tsx:29`](../../src/components/landing/LandingPage.tsx#L29)

- Resolver preserves the supported whole-car deep-link boundary.
  [`vehicle-twin-catalog.ts:123`](../../src/lib/vehicle-twin-catalog.ts#L123)

**Mobile stability and truthful markers**

- Mobile hub binds mode before all owner-versus-demo copy is rendered.
  [`Hub.jsx:331`](../../src/components/twin/hub/Hub.jsx#L331)

- Shared 16:9 coordinates eliminate forced-width overflow on phones.
  [`RotatingTwinStage.tsx:27`](../../src/components/home/RotatingTwinStage.tsx#L27)

- Every catalog hotspot remains reachable even without a glow layer.
  [`RotatingTwinStage.tsx:47`](../../src/components/home/RotatingTwinStage.tsx#L47)

- Explicit visual vocabulary keeps alerts evidence-based and stable.
  [`RotatingTwinStage.tsx:7`](../../src/components/home/RotatingTwinStage.tsx#L7)

**Regression coverage**

- Focused guards cover mobile wiring, responsive geometry, CTA state, and marker semantics.
  [`vehicle-twin-catalog.test.ts:36`](../../scripts/vehicle-twin-catalog.test.ts#L36)

- Deep-link regression test protects the whole-car route alongside system routes.
  [`vehicle-twin-catalog.test.ts:342`](../../scripts/vehicle-twin-catalog.test.ts#L342)
