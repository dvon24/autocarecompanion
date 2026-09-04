---
title: 'Minimal Known Issues Twin article integration'
type: 'feature'
created: '2026-09-04'
status: 'done'
baseline_commit: 'cf596c4076733d444d162e1f6be408df1be116ff'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-us-known-issue-twin-paywall-pilot.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The XT6 pilot reads like a second Hub card embedded in the Known Issues article. The visual should feel native to the article: a transparent vehicle, restrained issue markers, and the existing Tech Tree—not a dashboard placed above another list.

**Approach:** Replace the bordered two-column pilot shell with a minimal, borderless XT6 visual in the introductory content area. Selecting a published issue activates the existing registered vehicle highlight and opens the Tech Tree as the same overlay interaction used in the Hub; its selected branch decomposes the affected system, failure, symptoms, repair/dealer action, and fitment-guarded products, while “Au7o explains” is anchored at the bottom and explains how that related branch fits together and how the documented failure develops.

## Boundaries & Constraints

**Always:** Keep the timeline and Show All controls visually subordinate to the vehicle. Keep the Tech Tree closed until an issue is selected, then open it as a Hub-style overlay with an explicit close action. Put “Au7o explains” inside the Tech Tree overlay at its bottom, matching the Hub placement. Its explanation must walk the currently decomposed branch—vehicle/system, implicated component or condition, documented failure mechanism, resulting symptoms, and why the prescribed action addresses that path—strictly from that issue’s title, description, affected systems, symptoms, solution, and verified commerce. Disclose that the explanation is grounded in the published record and is not a diagnosis; if the evidence does not define a relationship, say so rather than infer it. Use only exact issue-to-hotspot assignments already approved in the Twin catalog. Cross-fade the existing registered hood, wheel, rear-wheel, radiator, and drivetrain highlight layers on pointer hover or keyboard focus; click/tap locks the highlight and opens the overlay, while hover/focus alone never consumes a free issue view. Keep the written Known Issues cards below free and unchanged. Preserve the two-distinct-issue visual gate.

**Ask First:** Using the API/CLI image fallback, which requires the locally configured `OPENAI_API_KEY` and explicit approval for `gpt-image-1.5`; enabling production billing or deploying this revision to production.

**Never:** Render a surrounding dashboard/card shell; put “Au7o explains” outside the Tech Tree overlay or between its branch nodes; infer a hotspot from category keywords; invent diagnostic conclusions, mileage, parts, or fitment; bake a checkerboard into the artwork; hide the free issue list; charge a visitor from this dev preview.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Initial article | Pilot is enabled and no issue selected | Transparent XT6 floats in the intro area with minimal timeline/Show All controls | No Tech Tree or empty card occupies space |
| Highlight preview | Pointer hovers or keyboard focuses a grounded hotspot | Its registered overlay layer cross-fades above the aligned base without opening the tree or counting a view | If that overlay file is absent, keep the accessible hotspot state without substituting another layer |
| Grounded selection | Visitor selects timing-chain issue | Hood highlight activates and the Hub-style Tech Tree overlay opens to the engine/timing-chain issue | If a registered effect is unavailable, keep the precise marker active without substituting another effect |
| Explanation | Selected issue has complete or partial published text | “Au7o explains” stays at the bottom and narrates how the visible decomposed branch relates to the documented failure and recommended action | State when a relationship, repair step, or mileage is not established |
| Narrow viewport | Mobile visitor selects an issue | Tech Tree uses the Hub’s mobile overlay behavior without horizontal overflow | Preserve large tap targets, close action, and readable hierarchy |
| Asset QC failure | Generated cutout has no alpha or baked checkerboard | Reject it and retain the last truthful dev asset | Never label opaque art as transparent |

</frozen-after-approval>

## Code Map

- `src/components/known-issues/KnownIssueTwinPilot.tsx` — replace the card shell and open the grounded explanation inside a Hub-style Tech Tree overlay.
- `src/lib/known-issue-twin-pilot.ts` — expose an evidence-bounded decomposition/explanation projection and existing exact hotspot mapping.
- `public/twin-stage/cadillac/known-issues/` — registered true-alpha XT6 base and issue-highlight WebP layers; kept separate from owner-Hub artwork.
- `scripts/known-issue-twin-pilot.test.ts` — verify explanation boundaries, exact highlight mapping, gate persistence, and empty/partial records.

## Tasks & Acceptance

**Execution:**
- [x] `public/twin-stage/cadillac/known-issues/` — produce and alpha-QC the non-destructive transparent XT6 base plus registered hood, wheel, rear-wheel, radiator, and drivetrain layers; existing Hub assets remain untouched.
- [x] `src/lib/known-issue-twin-pilot.ts` — project concise “Au7o explains” content that relates the decomposed branch using only the selected published record.
- [x] `src/components/known-issues/KnownIssueTwinPilot.tsx` — remove the outer card treatment, keep the car visually primary, and open a Hub-style Tech Tree overlay after selection.
- [x] `scripts/known-issue-twin-pilot.test.ts` — add truthfulness and interaction-boundary coverage.
- [x] Verify desktop/mobile, then update only the existing dev preview branch.

**Acceptance Criteria:**
- Given the pilot article loads, when no issue is selected, then the vehicle appears without a dashboard-style card and no empty Tech Tree panel is shown.
- Given a pointer or keyboard user previews a grounded hotspot, when it receives hover or focus, then the matching registered overlay illuminates without advancing the two-view gate.
- Given the timing-chain issue is selected, when the visual updates, then the registered hood layer highlights and the Hub-style Tech Tree overlay opens with “Au7o explains” anchored at its bottom.
- Given “Au7o explains” is visible, when it describes the selected branch, then it connects system → failure mechanism → symptoms → action without adding an unsupported component or causal claim.
- Given an issue lacks a registered highlight, when selected, then its text/tree remains available without a fabricated vehicle location.
- Given the second distinct issue is selected, when the gate appears, then the free article cards below remain available.
- Given a mobile viewport, when the vehicle and tree are used, then the page has no horizontal overflow.

## Spec Change Log

## Design Notes

The vehicle should occupy the visual field directly on the page background. Controls may use small pills and hairline separators, but no enclosing dashboard panel, two-column card, or persistent right rail. Registered image layers cross-fade for premium hover/focus feedback and lock on selection. The Tech Tree overlay carries vehicle → affected system → implicated condition/component → known issue → symptoms → repair/dealer action → verified part. The bottom “Au7o explains” area narrates that same branch and failure mechanism instead of repeating the issue description. Closing it restores the clean article view.

## Verification

**Commands:**
- `npx tsx --test scripts/known-issue-twin-pilot.test.ts`
- `npx eslint src/components/known-issues/KnownIssueTwinPilot.tsx src/lib/known-issue-twin-pilot.ts scripts/known-issue-twin-pilot.test.ts`
- `npx tsc --noEmit`
- `npm run build`

**Manual checks:**
- Inspect the XT6 base asset metadata and pixels for real alpha, matching geometry, and no checkerboard.
- Review the pilot at desktop and 390×844 widths through overlay open/close, first selection, repeat selection, second distinct selection, and Show All.

**Results:**
- Focused tests: 13/13 passed; scoped ESLint, TypeScript, and diff checks passed.
- Vercel preview build completed successfully and is READY at `https://autocarecompanion-8m7og6cwn-devons-projects-cdc8ace2.vercel.app/known-issues/cadillac-xt6?year=2020&twinPilot=1`.
- Desktop and 390×844 interaction checks passed through a temporary local fixture using the production component: minimal vehicle view, registered highlight, Hub Tech Tree overlay, expandable failure/symptom branch, bottom explanation, close/focus flow, and second-distinct-selection gate. The fixture and temporary preview environment file were removed after verification.

## Suggested Review Order

- [Article interaction](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L207) — Start with vehicle, highlights, overlay, and gate behavior.
- [Tree decomposition](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L77) — Review the visible failure and repair branches.
- [Bottom explanation](../../src/components/known-issues/KnownIssueTwinPilot.tsx#L128) — Confirm it walks the selected branch without invention.
- [Hub overlay extension](../../src/components/twin/stage/TechTree.jsx#L1095) — Check the reusable footer and schedule suppression.
- [Evidence projection](../../src/lib/known-issue-twin-pilot.ts#L81) — Verify published-field grounding and fitment-guarded commerce.
- [Boundary tests](../../scripts/known-issue-twin-pilot.test.ts#L136) — Review explanation truthfulness and edge-case coverage.
