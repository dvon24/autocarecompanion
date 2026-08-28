---
title: 'Restore the connected vehicle-twin experience'
type: 'bugfix'
created: '2026-08-25'
status: 'in-review'
review_loop_iteration: 6
baseline_commit: 'c8dda949e655d87b7207fb71f362ee3ce8e97624'
context:
  - 'design/release/2026-08-24/Au7o Admin.html'
  - 'design/release/2026-08-24/src/web/hero-twins.jsx'
  - 'design/release/2026-08-24/src/web/hub-techtree.jsx'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The combined release disconnected four representations of the same product. It replaced the intended hero glyphs with dots, stretched half-resolution Challenger overlays, hard-coded the demo to Challenger, replaced Devon's founder hub access with a claimed-trial gate, and appended fulfillment controls to the legacy admin instead of porting the new admin experience.

**Approach:** Establish one vehicle-twin catalog used by hero, demo, owner hub, and admin; restore the accepted interaction and status language; restore the founder access path without weakening customer fulfillment gates; and port the new admin shell around the existing operational APIs.

## Boundaries & Constraints

**Always:** Keep exact vehicle identity, art, hotspot coordinates, tree, and fulfillment readiness in one registry. Red circle + warning triangle means overdue; green circle + check means on track; violet circle + shield means known issue. Every displayed hero vehicle must open its own demo identity and model-specific tree; unsourced fields stay visibly unavailable. Preserve existing admin data/actions and founder authentication. Keep public owner activation exact-email, claimed, unexpired, and exact-fit.

**Ask First:** Adding a visual-only twin to owner fulfillment; inventing or researching a missing exact part number, price, interval, or buy link; changing reservation/trial business rules; sending email or deploying production.

**Never:** Fall back from an unconfigured vehicle to the Challenger tree or Mopar parts; show demo mileage as owner history; silently replace the new hub with the classic hub for a supported founder vehicle; copy prototype localStorage as production persistence; retain the floating hero detail box.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Founder owner hub | Founder owns supported Challenger with positive mileage | New hub uses real mileage/history; reservation/trial does not downgrade it | Classic hub only for unsupported vehicle, missing mileage, or `?twin=0`; surface a diagnostic reason in development |
| Customer owner hub | Exact claimed, unexpired, matched reservation | New hub opens | Ready/unclaimed links to claim flow; invalid or expired access remains classic |
| Hero node | Single click then double click on any displayed twin | Single click reveals aligned art only; double click opens `/demo/hub?vehicle=<id>&open=<node>` | Query is allowlisted; unknown id defaults explicitly to Challenger |
| Vehicle demo | Challenger, Nautilus, Murano, or XT6 selected | Header, stage art, hotspots, mileage label, and model-specific tree all match | Unsourced nodes omit fitment claims rather than inheriting another model |
| Admin gallery | Founder opens `/admin`, selects a twin | New Overview/Twin Gallery shell and selected preview reflect the shared registry and live API status | Existing operations remain accessible; missing art/tree is labeled, not masked |

</frozen-after-approval>

## Code Map

- `src/lib/vehicle-twin-catalog.ts` -- shared identities, art strategy, hotspots, evidence state (including unlogged/unavailable), tree resolver key, system metadata, demo mileage, and fulfillment readiness; validate status against the resolved tree at that mileage.
- `src/components/twin/demo-trees.*` -- model-specific demo trees selected only through the catalog; port accepted Murano data without future service history and keep unsourced Nautilus/XT6 fields empty.
- `src/components/home/RotatingTwinStage.tsx` -- restore glyph markers, remove overlay card, and route the selected node/vehicle.
- `src/app/demo/hub/*`, `src/components/twin/twin-context.jsx`, `src/components/twin/stage/TwinStage.jsx` -- consume allowlisted selection and render matching stage/tree.
- `src/lib/twin-hub-data.ts`, `src/app/vehicle/[slug]/page.tsx` -- restore founder path while retaining public fulfillment rules.
- `src/app/admin/page.tsx`, `src/components/admin/twins/*` -- port the new shell/gallery without deleting legacy operations.
- `public/twin-stage/*` -- replace Challenger highlight/reveal layers with aligned full-resolution edits.

## Tasks & Acceptance

**Execution:**
- [x] Implement strict registry/access primitives: per-model coordinates; null-safe fulfillment lookup; direct garage fit required for founder; exact `claimed` required for customers; explicit known-issue IDs only; catalog/tree status parity; per-hotspot node summaries; deduplicated roots; owner merge preserves catalog evidence and rejects future maintenance records.
- [x] Implement one shared presentation layer consumed by every Hub/Minimal/Stage/Tree surface: evidence-aware summaries with no numeric false zeros; selected-tree threads/next-service/prompts/known-issue answers; field-safe responses; “Known issue on record”; correct violet shield in both layouts/details; explicit demo/owner language; null mileage stays unavailable; owner root has no demo VIN/mileage.
- [x] Implement catalog-driven rendering without runtime hazards: declare hooks before use; resolve URL clearing; use registered model systems/art/targets; filter missing transmission targets; 16:9 minimal stage with masks for opaque effects; guard absent hotspots; preserve fallback effects only when no catalog exists; whole-car/sidebar art never rewrites to missing thumbnails.
- [x] Implement the accepted hero/admin experience: focus-safe rotation; effect-backed accessible markers with exact per-model coordinates; Overview/Twin Gallery/Operations; independent twin loading; selected art preview; neutral readiness; circular warning triangle/check/shield only for actual evidence; no `any` or unused imports in new code.
- [x] Rebuild and inspect five full-resolution Challenger assets. Add executable/runtime checks that render or invoke the affected paths, plus exact assertions for every iteration-5 reviewer finding; do not rely only on source-string presence.

**Acceptance Criteria:**
- Given any homepage twin, when its overdue or known-issue marker renders, then it uses the required triangle or shield glyph and no floating box covers the vehicle.
- Given any homepage twin/node, when it is double-clicked, then the demo opens with that same vehicle, art, hotspot, and a non-Challenger model-specific tree where applicable.
- Given Devon's supported signed-in vehicle, when its hub opens, then the new real-data hub renders without requiring a claimed trial.
- Given `/admin`, when Devon changes the selected twin, then the preview and readiness/tree information change together while the operational dashboard remains reachable.
- Given an active Challenger layer, then it matches the base dimensions and registration and no longer softens the full vehicle.
- Given a structure-only vehicle, when its hero, demo, or admin markers render, then no marker claims on-track/overdue/known-issue state without supporting data; it uses a neutral unavailable treatment.
- Given a known issue without a purchasable upgrade, when its marker and tree node render, then both show the violet known-issue state without claiming a fix is available.
- Given a non-Challenger node with missing optional fields, when tree guidance renders, then it omits undefined fields and never emits Challenger-specific advice.
- Given admin data is loading or unavailable, when Overview/Twin Gallery renders, then it shows loading/error rather than authoritative zero counts or readiness.
- Given a demo URL without `open`, when the page loads, then no arbitrary system is selected; given a retained glass/airbox link, it opens its actual registered target.
- Given a demo or owner tree, when its chrome, assistant, whole-car node, and sidebar render, then labels, counts, prompts, state language, and art come from that selected vehicle and mode.
- Given owner service evidence is absent, when the live twin renders, then the affected system is neutral/unlogged rather than green with zero due; given demo history, no service event occurs after the declared demo mileage.
- Given `/admin`, when it loads, then Overview/Twin Gallery form the new primary shell and all legacy actions remain reachable within Operations rather than appearing as thirteen peer tabs.
- Given a known-issue node, when either tree layout or detail renders, then violet shield semantics apply independently of mileage risk and upgrades.
- Given any assistant query or fallback, when optional fields are absent, then no `undefined`, null identity, or other-model suggestion is emitted.
- Given a system without hero effect art, when it appears in navigation, then it still has an explicit working branch/node target and is not advertised as an inert hero marker.
- Given a founder missing mileage, when live eligibility fails, then the classic hub renders rather than the customer claim CTA.
- Given any customer reservation status other than exact `claimed`, when owner access is evaluated, then the owner hub remains locked; cancelled/unknown states never fall through.
- Given owner mode, when the whole-car node renders, then demo odometer/VIN placeholders are absent and all chrome says owner rather than demo; public demos never say “your car.”
- Given any selected model, when hotspots and mobile stage render, then they use that model's coordinates and a 16:9 frame; duplicated branch roots and absent hotspots cannot crash or inflate counts.
- Given readiness in admin, when it renders, then it uses a neutral badge; warning/check/shield carriers only communicate actual vehicle evidence status.

## Spec Change Log

- Iteration 1 — adversarial review found that the first implementation split tree selection outside the catalog, rendered unsourced vehicles green, lost known-issue semantics without an upgrade, exposed opaque full-frame overlays, retained Challenger-only assistant copy, and presented static admin readiness during failed/loading API state. The code map, tasks, acceptance, and verification now require explicit tree/art strategies, neutral unavailable state, field-aware model-scoped guidance, catalog-driven deep links, live admin state, exact accessible glyphs, mobile coordinate integrity, and stronger zero-AI tests. Avoids a visually connected UI whose underlying identity/status/fitment data still drift. KEEP: founder bypass with strict customer claim gates; removed floating hero card; double-click vehicle/node routing; exact warning/check/shield vocabulary; full-resolution aligned Challenger assets; preserved legacy admin operations.
- Iteration 2 — fresh reviews found Murano future service history and marker/tree contradictions, unlogged owner systems presented green, demo state labeled as a live garage, static Challenger prompts/counts/art and system chrome leaking across models, default/misrouted deep links, keyboard-focus rotation, an unbacked wheel-finish picker, and Overview/Gallery appended to the legacy admin rather than becoming its shell. Tasks and verification now require status derivation from the resolved tree, evidence-state parity, no future history, tree-owned prompts/system metadata, mode-specific labels, neutral default demos, complete hotspot allowlisting, selected-catalog owner construction/art, focus-safe rotation, finish capability gating, and the new admin shell wrapping preserved operations. This avoids a visually improved release that still misstates vehicle state or identity. KEEP: the shared catalog/resolver/art-strategy architecture; exact accessible glyphs; masked opaque art; contained mobile stage; founder bypass plus strict customer claims; claim CTA; model-scoped field-aware guidance; full-resolution localized Challenger assets; live admin loading/error propagation; no floating hero card; double-click routing; all existing admin operations remain reachable.
- Iteration 3 — final iteration-2 reviews found violet `knownIssue` missing inside tree layouts, runtime guidance still emitting `undefined` and Challenger fallbacks, catalog whole-car art rewritten to nonexistent thumbnails, null identity text, inert hero markers, undefined watch counts and false zero-due summaries, transmission without a navigation target, founder fallback incorrectly reaching claim, non-reactive URL selection, missing keyboard routing, admin glyphs without circular carriers, upgrade incorrectly implying known issue, accepted demos allowing null mileage, fulfillment IDs not mapped to catalog IDs, and a TypeScript-incompatible verification command. Tasks and verification now require runtime-response tests, violet precedence, preserved art URLs, filtered identity labels, effect-backed hero markers, explicit system targets, evidence-aware summaries, reason-aware claim routing, reactive allowlisted aliases, keyboard activation, shared circular glyph carriers, explicit known-issue evidence, accepted-demo mileage validation, fulfillment lookup, and the actual `tsx` runner. This avoids passing static catalog tests while failing in rendered interaction. KEEP: the tree/catalog presentation layer; RED/GREEN gates; model isolation; neutral states; exact deep links; three-area admin shell; founder/customer access split; full-resolution localized RGBA assets; successful main-workspace build; all earlier KEEP requirements.
- Iteration 4 — iteration-3 reviews found permissive cancelled/unknown customer access, owner demo VIN/mileage leakage, duplicate roots, shared coordinates, green watch markers, contradictory/false-zero summaries, Challenger known-issue copy and commerce prompts on other models, false “fix available” legends, missing mobile shield, static owner/demo chrome, unsafe minimal-hotspot handling and aspect drift, readiness glyph vocabulary misuse, and twin loading coupled to secondary operations. Tasks/ACs now require strict claimed-only access, owner-root sanitation, deduplication, per-model coordinates, one evidence-summary layer, selected-tree guidance/prompts, “known issue on record,” both-layout shield rendering, explicit mode chrome, guarded 16:9 minimal rendering, neutral readiness, and independent twin loading. KEEP: the validated registry/access architecture, effect-backed hero, reactive deep links, three-area admin shell, exact assets, clean build/lint/tests, and all prior KEEP requirements.
- Iteration 5 — iteration-4 reviews found a render-blocking temporal-dead-zone crash; null fulfillment resolving to Nautilus; founder cross-vehicle leakage; null demo mileage becoming 65,000; generic issue text promoted to known-issue evidence; catalog/tree contradictions; owner evidence loss; static Challenger sidebar/service/assistant content; false-zero summaries; missing minimal masks; stale URL selection; missing focus pause; static rail systems; inert transmission; future owner records; absent admin art; wrong admin glyphs; and new lint errors. The final tasks collapse identity, access, evidence, presentation, rendering, and admin into shared executable paths and require runtime invocation/render checks for each finding. KEEP: exact user-approved UX/status vocabulary, strict customer gates, founder direct-fit bypass, per-model catalog/tree/art isolation, three-area admin shell, aligned assets, and every prior KEEP requirement.
- Iteration 6 escalation — the final review still found public demos entering owner-only branches, false-zero evidence summaries, stale static assistant counts/copy, ready customers unable to reach claim, readiness using overdue/on-track glyphs, coupled presentation data left unused, incomplete focus/touch routing, unsafe/malformed access dates, catalog default/order coupling, insufficient cross-model art/effect validation, and runtime tests that omit Hub/TechTree/full-admin interaction. The configured five-loop limit is exceeded; no further automatic re-derivation or production deployment is allowed without Devon choosing a narrower recovery plan.

## Design Notes

Owner fulfillment readiness remains stricter than demo readiness. Nautilus and XT6 may use honest structure-only demo trees, but no part number, price, interval, buy link, or owner activation is allowed until separately reviewed. This preserves the requested per-model interaction without making fitment claims the source material cannot support.

Opaque full-frame effect art must be revealed through a localized mask; only registered RGBA overlays may be faded over the full frame. Catalog status is evidence-backed: unavailable is not on track. Known issue and purchasable fix are separate facts.

Demo and owner state are distinct modes. A demo may use declared sample mileage only when its service history does not occur in the future; a structure-only demo has unavailable service evidence rather than a synthetic zero-mile odometer. Owner records without logged service evidence are unlogged/neutral, not on track. All system names, counts, prompts, thumbnails, whole-car art, and tree construction come from the selected catalog/tree.

The admin release is a shell replacement, not two more legacy tabs: Overview and Twin Gallery are the primary navigation/workspace, with the existing operational dashboard grouped beneath an Operations area. No operational action may be removed.

`knownIssue` is explicit evidence, not inferred from `upgrade`; its violet presentation is shared by hero, tree rings, details, and admin. Summary counts are evidence-aware: missing logs produce unavailable/unlogged copy, never numeric zero. Preserve registered whole-car image URLs directly; thumbnail rewriting is only valid when the catalog registers a real thumbnail.

Webpack output uses SHA-256 hashing to bypass the reproducible local Next/Webpack `WasmHash._updateWithBuffer` race. The traced failure occurred inside Webpack after application compilation; the serialized hash configuration completed all 1,550 pages.

## Verification

**Commands:**
- `npx tsc --noEmit` -- no type errors.
- `npm run lint` -- no new lint errors in changed code.
- `npm run build` -- production build succeeds.
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts` -- all registry, routing, runtime-response, rendering-source, and access cases pass.
- The test must verify every asset and system/hotspot target, matching dimensions/channel strategy, explicit tree resolvers, fulfillment-id lookup, cross-surface unavailable/known-issue parity, circular admin carriers, and non-Challenger runtime guidance without Challenger-only, null, or `undefined` copy.
- Zero-AI tests must also reject empty hotspots, shared coordinate objects, duplicate roots, accepted demos without mileage, future history, demo VIN/mileage in owner roots, catalog/tree status mismatches, green watch/unlogged state, false-zero or contradictory summaries, static cross-model prompts/known-issue copy, “fix available” legends without upgrades, missing mobile shields, broken art rewriting, unresolved aliases/targets, inert markers, permissive non-claimed access, founder-to-claim fallback, readiness misuse of evidence glyphs, coupled admin loading, unsafe missing-hotspot calls, non-16:9 mobile geometry, and finish controls without art.
- A component/runtime smoke must execute `TwinStage`, selected-tree guidance, demo-to-owner context, null mileage, URL clear, minimal masked effect, and admin selected-preview paths so variable-order, fallback, and rendering failures cannot pass through source-string checks.

**Manual checks:**
- Desktop and mobile homepage: exact icons, no overlay card, sharp Challenger, single-click reveal, double-click selected demo.
- Demo: cycle all four allowlisted vehicles and confirm identity/art/hotspots/tree remain aligned.
- Founder Challenger URL, public claim flow, and `/admin` Overview/Twin Gallery/Operations.
- Mobile hero at 320px and 390px widths: no crop-coordinate drift; hover does not permanently stop rotation.
