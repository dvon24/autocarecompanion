---
title: 'Make the Twin hub assistant answer, teach, and source beyond the tree'
type: 'feature'
created: '2026-08-30'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'c6f8068081e7bb27eb32a14fc43d79132a649241'
context:
  - '{project-root}/_bmad-output/planning-artifacts/current-ai-prompts.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-complete-us-reservation-twins-and-actionable-service.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Twin hub composer is a local tech-tree lookup disguised as chat. It deflects questions when a component is absent, cannot explain procedures or locations, cannot calculate fluid/additive amounts, and makes owners leave Au7o for how-to videos or exact-fit parts.

**Approach:** Connect every demo and signed-in owner Twin hub to the existing vehicle-aware streaming mechanic endpoint while retaining reviewed tree facts as authoritative context. Add safe how-to video search cards and exact-fit part actions, and let missing-tree questions work without silently creating unverified nodes.

## Boundaries & Constraints

**Always:** Send exact year/make/model/trim plus known engine, transmission, drivetrain, mileage, and selected-node facts. Answer the question directly before referring to the tree. Explain observable diagnostics, fastener/component location, sequence, quantities, and calculations when supported. Treat additive as part of total fill volume and distinguish factory pre-mixed lubricant from separately added friction modifier. When an owner-manual lubricant is obsolete or unavailable, say so and verify a compatible base lubricant plus the modifier's current directions rather than pretending the named OEM product can still be bought. Resolve product links through the existing verified-part pipeline. Build video searches from exact vehicle/task terms and render them as clearly labeled external YouTube resources inside the hub response.

**Ask First:** Persist a newly inferred structural tree node; promote chat-derived fitment, torque, capacity, or procedure evidence into the reviewed catalog; add a paid external search/video API; deploy, push, or make production writes.

**Never:** Guess a torque, capacity, additive dose, part number, fitment, bolt location, or video ID. Never present a search result as a verified product. Never auto-mutate the reviewed tech tree from one conversation. Never diagnose a throw-out bearing as confirmed solely from “whirling”; ask whether noise changes with clutch-pedal position, gear, speed, and engine RPM and list safety-sensitive alternatives.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Procedure question | Owner asks where a plug/bolt is or how to fill a mapped component | Direct, vehicle-specific sequence plus cautions; reviewed node facts remain authoritative | Missing service evidence is disclosed and a precise video search is offered |
| Quantity calculation | Owner provides percentage/range or selected fluid instructions, including an unavailable OEM LSD formulation | Show the arithmetic, distinguish replacement base oil from separate modifier, and clarify that additive counts toward total capacity | Do not recommend a full bottle without verified capacity and current product directions |
| Missing component | Owner asks about a throw-out bearing absent from the tree | Diagnose conversationally and offer a verified-part action when exact fitment resolves | Explain fitment facts still needed; record chat demand but do not add a tree node |
| How-to media | Owner asks to see how the work is done | Render an in-hub YouTube resource card/link using exact YMMT/task terms | No invented individual video URL; normal answer remains available if search is blocked |
| Service unavailable | AI stream, quota, or network fails | Keep input and show a truthful retryable error | Do not fall back to the misleading “unavailable in this tree” response |

</frozen-after-approval>

## Code Map

- `src/components/twin/hub/hub-shared.jsx` -- replace synchronous tree lookup behavior with streaming response state and rich safe links.
- `src/components/twin/hub/Hub.jsx` -- supply vehicle, known-issue, and selected-node context to one shared Twin assistant conversation.
- `src/components/twin/stage/TechTree.jsx` -- retain deterministic tree commands; route unmatched mechanical questions to the full assistant.
- `src/app/api/hub-chat/route.ts` -- accept richer fitment/node context and safely resolve video-search markers alongside verified part markers.
- `src/lib/hub-chat-prompt.ts` -- require direct procedural/diagnostic answers and safe media/part marker behavior beyond mapped fields.
- `src/lib/twin-assistant-client.js` -- bounded SSE client shared by desktop, mobile, and tree chat.
- `scripts/vehicle-twin-catalog.test.ts` and focused chat tests -- cover contextual payloads, marker sanitization, missing-node behavior, and accessible links.

## Tasks & Acceptance

**Execution:**
- [x] Add a reusable Twin assistant SSE client and preserve retry/error state.
- [x] Upgrade both Twin composers to render streaming answers, verified purchase links, and precise YouTube search resources.
- [x] Pass exact configuration and selected-node evidence; keep local tree layout commands deterministic.
- [x] Extend server prompt/marker guards for procedures, calculations, videos, missing components, and symptom triage.
- [x] Add regression tests and run lint, typecheck, focused tests, and production build.

**Acceptance Criteria:**
- Given a question not represented by a tree node, when it is automotive and vehicle-specific, then Au7o answers it instead of saying the field is unavailable.
- Given any user opens a demo or owner Twin, when they use its hub assistant, then the broader mechanic behavior is available without founder-only gating.
- Given a user asks for a part, when exact fitment resolves, then a safe clickable purchase link appears without an AI-invented part number.
- Given a user asks how to perform a task, when an exact video is not verified, then Au7o provides a precise YouTube search resource rather than fabricating a video.
- Given a likely clutch-release-bearing symptom, when the user asks for diagnosis, then the response asks discriminating clutch/gear/speed questions and does not label the bearing confirmed.
- Given a missing component is discussed, when the conversation ends, then the reviewed tree is unchanged while the existing prompt-insight record captures demand.

## Spec Change Log

## Design Notes

The tree remains a reviewed vehicle model, while chat is the exploratory layer. Chat may teach, diagnose, calculate, and source; only reviewed evidence can change the tree. A YouTube search link is intentionally safer than a model-invented video ID and still keeps the owner’s exact search one tap away.

## Verification

**Commands:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts src/lib/hub-chat-model.test.ts` -- focused behavior passes.
- `npx tsc --noEmit` -- typecheck passes.
- `npx eslint <changed files>` -- no new lint failures.
- `npm run build` -- production build passes without deploying.

**Manual checks:**
- On mobile and desktop, ask the differential-additive, throw-out-bearing, bolt-location, video, and part-ordering questions; confirm readable streaming answers and clickable resources remain inside the hub.

**Completed verification:**
- `npx tsx --test scripts/vehicle-twin-catalog.test.ts src/lib/twin-assistant-client.test.ts src/lib/hub-chat-video.test.ts src/lib/hub-chat-model.test.ts` — 50/50 passed.
- `npx tsc --noEmit` — passed.
- Focused ESLint across every changed implementation/test file — passed with zero warnings.
- `git diff --check` — passed; only repository line-ending/config-ignore notices were emitted.
- `npm run build` — passed; existing bundle-size, OpenTelemetry dynamic-import, and Browserslist-age warnings remain.

## Suggested Review Order

**Shared Twin mechanic**

- Start with the composer that replaces tree-only lookup across every Twin surface.
  [`hub-shared.jsx:128`](../../src/components/twin/hub/hub-shared.jsx#L128)

- Exact vehicle context and SSE handling are isolated in one reusable client.
  [`twin-assistant-client.ts:100`](../../src/lib/twin-assistant-client.ts#L100)

- Demo Twins now send their active transmission with the shared identity.
  [`DemoHubClient.tsx:44`](../../src/app/demo/hub/DemoHubClient.tsx#L44)

- Owner Twins merge reviewed engine and selected transmission into the same path.
  [`LiveTwinHub.jsx:238`](../../src/components/twin/LiveTwinHub.jsx#L238)

**Grounding and safety**

- The mechanic prompt answers beyond mapped nodes without guessing fitment or procedures.
  [`hub-chat-prompt.ts:19`](../../src/lib/hub-chat-prompt.ts#L19)

- Server validation bounds configuration and selected-node evidence before prompting.
  [`route.ts:298`](../../src/app/api/hub-chat/route.ts#L298)

- Server-side marker rewriting creates safe video searches and verified part links.
  [`route.ts:765`](../../src/app/api/hub-chat/route.ts#L765)

- Unmapped tree questions hand off without mutating the reviewed tree.
  [`TechTree.jsx:1208`](../../src/components/twin/stage/TechTree.jsx#L1208)

- The obsolete LSD-labelled fluid is withheld in favor of review-gated base oil plus modifier.
  [`twin-trees.js:343`](../../src/components/twin/twin-trees.js#L343)

**Regression evidence**

- Streaming tests cover exact context, selected nodes, incremental tokens, and retry errors.
  [`twin-assistant-client.test.ts:49`](../../src/lib/twin-assistant-client.test.ts#L49)

- Video tests prove exact-fit search construction and marker split handling.
  [`hub-chat-video.test.ts:5`](../../src/lib/hub-chat-video.test.ts#L5)
