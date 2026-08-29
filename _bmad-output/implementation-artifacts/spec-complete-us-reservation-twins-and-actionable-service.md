---
title: 'Complete US reservation twins and actionable service'
type: 'feature'
created: '2026-08-29'
status: 'in-review'
review_loop_iteration: 1
baseline_commit: 'bca5c4cbece396dc0d13f445724f97c0b2bfc991'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Twin cards and trees have regressed into incomplete or non-actionable states: required service cannot consistently be logged, unlogged maintenance is neutral, installed equipment cannot be changed, product evidence is missing, demo/reserved vehicles lack complete trees and art, hero hotspots respond slowly, and Admin issue links lead to 404s.

**Approach:** Ship one coherent release that makes every serviceable node actionable and evidence-backed, completes the five US reservation Twins plus a 2019 Camaro ZL1 1LE, adds the correct differential/transaxle branch to every Twin, restores responsive two-tap navigation, and repairs Admin deep links.

## Boundaries & Constraints

**Always:** Use exact year/make/model/trim plus engine, transmission, drivetrain, position, and service context before approving a product. Read the complete repair/service instructions and inspect live destinations. Persist service, installed equipment, annotations, transmission, and paint selection. Show only factory colors offered for the exact model year. Make part numbers blue, underlined links when a verified destination exists; show verified price/source. A required first service is overdue only after the vehicle crosses its manual-derived first time/mileage deadline. Represent integrated FWD transaxle differentials explicitly as having no separate fluid service. Keep all changes in this release and stop before deployment.

**Ask First:** Production writes, email sends, pushes, or deployment; assigning a reservation to an unverified trim/drivetrain; publishing an owner-ready Twin without aligned art and reviewed service/parts evidence.

**Never:** Touch the Netherlands Mirai or UK Jaguar reservation; invent trim, drivetrain, interval, color, price, part, fitment, link, or known issue; use a scanner link as a repair part; silently substitute the wrong vehicle/paint image; modify unrelated user work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Required service | No record; first deadline crossed | Red overdue state and Log service on the maintainable node | Missing odometer/date shows due-at, not a false overdue claim |
| Equipment swap | User selects tire/rotor/fluid/upgrade | Installed item and lifespan/interval persist and tree recalculates | Reject mismatched fitment and keep prior selection |
| Product link | Reviewed exact-fit part | Linked part number, price/source, purchase action | Hold unverified/dead/ambiguous link visibly |
| Driveline | Separate differential/PTU/eLSD | Exact service node, interval, fluid, logging, link | Gate variants behind transmission/drivetrain choice |
| Transaxle | Integrated FWD differential | Informational node points to transmission/CVT circuit | No separate differential log button |
| Paint | Factory color selected | Vehicle/reservation color persists; matching aligned art renders | Mark unavailable art pending; never recolor by CSS |
| Admin issue | Issue row selected | Canonical model route plus issue fragment opens | Suppress malformed links and record QA failure |

</frozen-after-approval>

## Code Map

- `src/components/twin/TechTree.jsx` -- node details, service actions, links, equipment and annotations.
- `src/components/twin/LiveTwinHub.tsx` -- live persistence and vehicle controls.
- `src/lib/twin-hub-data.ts` -- maps vehicles, records, modifications and issues into tree state.
- `src/lib/twin-catalog.ts` and `src/components/twin/demo-trees.js` -- Twin definitions, palettes and complete tree evidence.
- `src/components/twin/TwinStage.jsx` -- hero/hub hotspot interaction.
- `src/components/admin/twins/TwinAdminShell.tsx` -- reservation/admin navigation and issue deep links.
- `prisma/schema.prisma` and APIs -- reservation paint and user-entered issue/equipment persistence.
- `public/twin-stage/*` -- exact aligned five-layer vehicle assets.

## Tasks & Acceptance

**Execution:**
- [x] Service state/action model, record logging, installed-part/tire lifecycle, and user issue annotations.
- [x] Verified linked product presentation with price/source and branch-aware fitment.
- [ ] Complete Challenger, Murano, Nautilus, XT6, Kicks, MDX, Aviator, and Camaro ZL1 1LE trees, manuals, applicable issues and driveline nodes.
- [ ] Persist transmission only where variants exist and factory paint; generate/register aligned required art.
- [x] Make hero two-tap activation match the reliable hub behavior and fix Admin issue routes.
- [ ] Add regression tests, build, render/link/data audits and desktop/mobile visual QA.
- [x] Restore an obvious mobile sign-in entry and verify signed-out/signed-in navigation.
- [x] Add a discrete founder sign-in location for mobile/admin access without restoring a competing public sign-in CTA.
- [x] Replace every visible demo placeholder, generic search URL, and vague condition-only instruction with reviewed model-specific evidence or an explicit non-commerce service/dealer action.
- [x] Add brake fluid and every other omitted owner-maintainable circuit to each applicable demo tree, with interval, specification, logging, price, part number, and verified destination when a responsible product link exists.
- [x] Keep known-issue summaries and repair/dealer actions inside mobile node details so users can decide before leaving the hub.
- [x] Remove transmission vehicle hotspots on mobile, realign remaining wheel/hood/radiator hotspots to their visible components, and use a transmission-fluid component image inside the tree.
- [x] Rebuild off-angle vehicle art against the established Challenger/Nautilus/Murano/XT6 stage geometry and add an accurate PTU component image where the XT6 tree identifies that hardware.
- [x] Make factory-color selection switch to the matching rendered art in both demo and owner hubs; never report success while displaying the prior color.
- [x] Recompose narrow detail cards and installed-part forms so price, source, fitment, labels, and actions remain legible without overlap or smashed typography.
- [x] Move color/transmission controls into a restrained top-left vehicle-stage control; remove their sidebar copies and the duplicate sidebar Known Issues block; fix collapse/profile and thumbnail-background collisions.
- [x] Replace the blocked Challenger Tire Rack results URL and link the Hawk HPS 5.0 recommendation with live exact product destinations; audit every demo for the same unlinked/blocked pattern.
- [x] Restore the hub chat as a real interactive control: editable text, stable focus, Enter/button submission, and a visible response or explicit unavailable state.
- [x] Let an owner open contextual part help from a tree node without leaving the hub; preload exact vehicle/configuration/node context and keep reviewed deterministic fitment and purchase links authoritative over generated suggestions.
- [x] Make the 2019 Camaro ZL1 1LE rear-differential-fluid node a complete due-now purchase path with the GM-specified fluid, quantity, exact part number, reviewed direct destination, and separate treatment of the eLSD hydraulic circuit.

**Acceptance Criteria:**
- Given a maintainable radiator, rotor, tire, transmission or driveline node, when opened on desktop or mobile, then the owner can log service on that node and its status updates.
- Given an eligible unlogged vehicle past its first factory deadline, when the tree loads, then that item is overdue rather than gray.
- Given a fully sourced Twin, when any actionable node opens, then its correct image/details, installed choice, known issues, price and verified purchase link are available without placeholder text.
- Given any completed US reservation or the Camaro, when selected, then exact configuration choices and a complete evidence-backed tree are available; foreign reservations remain unchanged.
- Given an Admin issue link or a hero hotspot, when activated, then the canonical destination opens on the second tap without repeated tapping or a 404.
- Given a signed-out mobile visitor, when they open navigation, then a clearly labeled sign-in action reaches the sign-in screen without closing the app.
- Given the founder is signed out on mobile, when the private founder entry location is opened, then authentication returns to the founder/admin surface; the special route is not treated as an authorization boundary.
- Given a user opens any demo node, when the detail card renders, then it contains no “not sourced for this demo,” “price not sourced,” generic search link, or unexplained inspection-only lifespan.
- Given brakes are condition-based, when the card opens, then it explains concrete inspection symptoms such as pedal pulsation, steering-wheel vibration, noise, scoring, thickness/runout limits, and fluid condition as applicable without inventing a replacement deadline.
- Given a known issue applies to a mobile node, when the node opens, then the issue summary and repair/dealer action are visible in the hub before any external navigation.
- Given the tree is viewed on mobile, when vehicle hotspots render, then transmission is omitted and tire/hood/radiator hotspots do not overlap or drift away from the referenced component.
- Given a factory color with rendered artwork, when it is selected, then the hub immediately renders that exact color and persists it for an owner; colors without art cannot pretend to have switched.
- Given a narrow mobile card or editor, when price/fitment/source/actions render, then each field remains visually distinct, readable, and touchable with no badge or text overlap.
- Given a demo recommendation names an aftermarket product, when it is presented as fitting, then its exact part number is linked to a reviewed live product page; search/results pages and access-denied destinations cannot publish as buy actions.
- Given the hub chat is visible, when a user taps the field and types, then text entry retains focus and both Enter and the submit control invoke the same response flow; a nonfunctional backend is disclosed rather than leaving a decorative input.
- Given an owner requests help from a service node, when hub chat opens, then it already knows the selected Twin, drivetrain/transmission branch and node; it may explain or ask for a missing fitment fact but cannot manufacture a fitment or silently replace the reviewed product.
- Given the 2019 Camaro ZL1 1LE rear differential is due, when its card opens, then the owner can buy the exact GM-specified rear-axle fluid in the required quantity without using Google, and the card does not conflate it with the separate eLSD clutch-actuation fluid.

## Spec Change Log

- **2026-08-29 · Review loop 1:** Live mobile/desktop review found incomplete demo evidence, generic search destinations, omitted brake-fluid nodes, vague condition-based guidance, missing mobile issue summaries, overlapping/misaligned hotspots, off-contract vehicle angles, and repeated transmission placeholder imagery including the XT6 PTU. Tightened tasks and acceptance gates so visible demo nodes require model-specific guidance, reviewed links or responsible service actions, complete fluid circuits, component-correct images, mobile sign-in, and mobile-first issue context. Known-bad state avoided: declaring a Twin complete because the tree renders while its cards still contain placeholders or generic commerce searches. **KEEP:** the Tire Rack tire deep link, reliable hub two-tap interaction, desktop known-issue summary/fix presentation, established Challenger/Nautilus/Murano/XT6 stage angle, and already-working service logging controls.
- **2026-08-29 · Founder/color clarification:** The live hub has no discoverable mobile sign-in because all public account entry points were suppressed, and selecting a factory color can leave the old artwork onscreen. Added a discrete founder entry location plus a hard requirement that color success means matching rendered art actually changed. Known-bad state avoided: using route obscurity as security or telling an owner a color was saved while showing another paint.
- **2026-08-29 · Screenshot refinement:** Narrow part cards smashed price/source/fitment text, installed-part actions/forms lacked hierarchy, sidebar controls and duplicate issues consumed space, profile/collapse controls collided, the vehicle thumbnail showed two backgrounds, the Challenger Tire Rack results route returned Access Denied, and a named Hawk HPS 5.0 fitment lacked a link. Added explicit layout and commerce gates plus stage-embedded color/transmission controls. **KEEP:** the overall hub visual language and the user's approved Tire Rack deep-link pattern where the destination actually resolves.
- **2026-08-29 · Hub chat regression:** The visible chat field would not accept input. Added an interaction gate covering typing, focus, keyboard/button submission, and an explicit unavailable state so the field cannot ship as decorative chrome.
- **2026-08-29 · Contextual part help:** The owner had to leave Au7o and use Google to buy due Camaro differential fluid. Added node-context chat handoff and made the exact ZL1 1LE differential-fluid card the first complete purchase-path acceptance case; reviewed data remains authoritative and AI is constrained to explanation or missing-fitment clarification.

## Design Notes

Transmission belongs in the restrained top-left vehicle-stage control and appears only for vehicles with real transmission choices; neither transmission nor color is duplicated in the sidebar. Differential is a universal tree concept, not a universal separate service: RWD/AWD hardware gets the documented fluid circuit; integrated transaxles explicitly inherit the transmission/CVT circuit.

On mobile, transmission remains selectable in the sidebar when a real choice exists but is not a vehicle hotspot. Condition-based parts must name observable symptoms and measurable inspection criteria; they must not receive invented replacement intervals. A retailer search-results page is evidence discovery, never a publishable buy link.

## Verification

**Commands:**
- `npm run lint` -- no new lint failures.
- `npx tsc --noEmit` -- typecheck passes.
- `npm run build` -- production build passes.
- Targeted unit/integration tests -- service state, fitment branches, persistence, routes and two-tap behavior pass.
- Render/link guards -- every registered owner-ready product renders and every deep link resolves canonically.

**Manual checks:**
- Desktop and mobile inspect every Twin, hotspot, maintainable node, chooser, linked part and Admin issue route; confirm no placeholder cards, blank images, accidental collapse, false overdue status or wrong paint.

**Completed verification (2026-08-29):**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts` -- 37/37 pass.
- `npx tsc --noEmit` -- pass.
- Targeted ESLint on changed typed files -- pass.
- `git diff --check` -- pass (line-ending notices only).
- `npm run build:turbo` -- pass; 1,556 pages generated.
- `npm run build` -- pass; production Webpack build generated all 1,556 pages.
- Built-server smoke test -- homepage and Camaro/Kicks/MDX/Aviator demo routes return 200; all 20 new aligned vehicle assets return 200.

**Open fitment gate:** Murano FWD/AWD, Kicks trim and FWD/AWD, MDX FWD/SH-AWD, and Aviator RWD/AWD were not available from the offline reservation data. Their complete demos and art are packaged, but they remain deliberately `ownerReady: false` until those exact owner choices are supplied. This preserves the approved Ask First boundary and prevents an unverified Twin assignment.

**Open paint-art gate:** Exact factory palettes are registered, but only colors with matching rendered five-layer artwork can be selected. Pending colors remain visible and disabled instead of recoloring the wrong asset or claiming that a change succeeded.

**Contextual part-help result:** The tree assistant now answers from the selected reviewed Twin branch. For the Camaro rear differential it returns GM 88862624 / ACDelco 10-4034, two 32-ounce bottles, the reviewed price and official purchase destination, and keeps the separate eLSD hydraulic circuit explicit. It does not use unconstrained generation to invent fitment.

## Suggested Review Order

**Service state and owner evidence**

- Start with the owner-state composition and fitment-scoped persistence boundary.
  [`LiveTwinHub.jsx:345`](../../src/components/twin/LiveTwinHub.jsx#L345)

- Required deadlines become overdue only after crossing the real threshold.
  [`LiveTwinHub.jsx:50`](../../src/components/twin/LiveTwinHub.jsx#L50)

- Every maintainable node exposes logging with truthful condition-based copy.
  [`TechTree.jsx:511`](../../src/components/twin/stage/TechTree.jsx#L511)

- Installed parts, lifespan, fitment confirmation, and owner issue notes share one flow.
  [`TechTree.jsx:558`](../../src/components/twin/stage/TechTree.jsx#L558)

**Model evidence and configuration**

- Model-specific trees separate confirmed differential service from integrated transaxles.
  [`demo-trees.js:108`](../../src/components/twin/demo-trees.js#L108)

- Camaro transmission choice preserves eLSD while withholding unselected fluid evidence.
  [`demo-trees.js:202`](../../src/components/twin/demo-trees.js#L202)

- Catalog entries bind factory palettes, five-layer art, hotspots, and issue evidence.
  [`vehicle-twin-catalog.ts:198`](../../src/lib/vehicle-twin-catalog.ts#L198)

**Interaction and navigation**

- Sidebar paint controls expose factory choices without pretending pending art exists.
  [`Hub.jsx:80`](../../src/components/twin/hub/Hub.jsx#L80)

- Admin affiliate issue links resolve only against published canonical issue rows.
  [`route.ts:88`](../../src/app/api/admin/affiliates/track/route.ts#L88)

**Safety and deployment gates**

- Vehicle patches reject arbitrary colors outside the exact reviewed factory palette.
  [`vehicle-patch-handler.ts:34`](../../src/lib/vehicle-patch-handler.ts#L34)

- Webpack skips Sentry build injection when required credentials are absent.
  [`next.config.ts:225`](../../next.config.ts#L225)

- Regression coverage exercises art, links, service states, branches, and responsive rendering.
  [`vehicle-twin-catalog.test.ts:1`](../../scripts/vehicle-twin-catalog.test.ts#L1)
