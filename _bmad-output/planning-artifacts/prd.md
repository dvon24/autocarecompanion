---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys']
classification:
  projectType: web_app
  domain: automotive
  complexity: medium
  projectContext: greenfield
inputDocuments:
  - '_bmad-output/brainstorming/Autocarecompanion/brainstorming-session-2026-01-28.md'
  - '_bmad-output/brainstorming/Autocarecompanion/brainstorming-session-2026-01-28-resource-constraints.md'
  - '_bmad-output/brainstorming/Autocarecompanion/brainstorming-session-2026-01-28-what-if-scenarios.md'
workflowType: 'prd'
project_name: 'AutoCare Companion'
brainstormingCount: 3
briefCount: 0
researchCount: 0
projectDocsCount: 0
---

# Product Requirements Document - AutoCare Companion

**Author:** Devon
**Date:** 2026-01-31

## Success Criteria

### User Success

- **Diagnosis Confidence:** User describes an issue and AI identifies the likely cause and correct action — matching the knowledge an experienced mechanic would have without needing to visit a shop
- **Parts Accuracy:** AI surfaces the correct part for the user's vehicle on first suggestion, with no wrong-fit guesswork
- **Aftermarket Intelligence:** When aftermarket parts are genuinely better than OEM (backed by reviews and real-world evidence), AI recommends them — not brand-loyal defaults. Example: DSS one-piece driveshaft over repeated OEM failures on Challengers
- **End-to-End Task Completion:** User goes from "I have this problem" → correct diagnosis → correct guide → correct parts → task complete, without leaving the app
- **Offline Reliability:** Guide works seamlessly in the garage with no internet — builds trust in the moment it matters most

### Business Success

- **3-Month Priority (in order):**
  1. **User Acquisition:** Traffic volume to the site — Challenger forum referrals + SEO targeting vehicle-specific maintenance queries
  2. **Ad Revenue:** Ad-supported free tier generates first revenue before any subscription converts
  3. **Subscriber Conversion:** Free → Premium upgrades driven by cloud sync, dashboard, and notification value
- **Cost Efficiency:** Monthly operational cost stays under $20 (AI APIs + hosting) vs. previous $134/month on Bubble
- **Sustainability:** Owner spends ≤1 hour/week on maintenance, features, and troubleshooting

### Technical Success

- **Zero Backend MVP:** Deploys and runs with no server — AI API is the only external call
- **AI Maintainability:** Claude Code can read, understand, and modify the codebase without manual intervention
- **Bus Factor 1:** Solo sustainable — one person can maintain, update, and ship features
- **Offline-First PWA:** Service Worker caches generated guides automatically; works in garages with spotty or no connectivity
- **YMMT Without a Database:** Cascading selector (Year → Make → Model → Trim) works via lightweight JSON — no manual database maintenance

### Measurable Outcomes

| Metric | Target | Timeframe |
|---|---|---|
| First user visits | >100 unique visitors | Month 1 |
| Guide completion rate | >60% of started guides completed | Month 2 |
| Ad revenue | First $1 earned | Month 2 |
| Operational cost | <$20/month | Ongoing |
| Developer time | ≤1 hour/week | Ongoing |
| Aftermarket recommendation accuracy | AI flags aftermarket when reviews support it | MVP launch |

## Product Scope

### MVP - Minimum Viable Product

- AI chat interface with symptom-based diagnosis
- AI-generated maintenance guides (checklist-centric)
- Inline parts recommendations (OEM + aftermarket, review-informed)
- Cascading YMMT selector (Challenger data at launch)
- Offline-first PWA (Service Worker cached guides)
- Ad-supported free tier
- localStorage progress tracking

### Growth Features (Post-MVP)

- User accounts (frictionless magic link signup)
- Vehicle dashboard with mileage-based service tracking
- Cloud sync across devices (Supabase)
- Service interval notifications
- Service history export (PDF for resale/insurance)
- One-click cart for parts purchasing
- Premium subscription tier

### Vision (Future)

- 3D model cars showing part locations synced with checklist progress
- Multi-vehicle garage
- Expanded vehicle coverage beyond Challengers
- Community-validated aftermarket recommendations
- Advanced AI confidence scoring

## User Journeys

### Journey 1: The Uncertain Diagnoser — "Something's Wrong But I Don't Know What"
*Covers: Uncertain Diagnoser, First-Time Car Owner*

**Persona:** Jake, 24. Just bought his first Challenger off a used lot. A week later, the check engine light comes on. He's never done any car maintenance. A friend sent him a link to AutoCare Companion from a Challenger forum.

**Opening Scene:** Jake sits in his driveway staring at the check engine light. He types into AutoCare Companion: *"My check engine light just came on."* He doesn't know what task to select. He doesn't even know if this is serious.

**Rising Action:** AI asks one clarifying question: *"Did it come on suddenly or has it been flashing?"* Jake says suddenly. AI responds: *"This is likely a sensor or emissions issue — not an emergency, but worth addressing. Here's what to check first."* A custom task is generated — not from the 9 core tasks, but built on the fly for his symptom. The checklist opens with a simple first step.

**Climax:** Jake follows step 3 and sees an inline parts recommendation. AI flags: *"For your 2023 Challenger, this O2 sensor replacement is a common fix for this code."* The part is the right one. First suggestion, no guesswork. Jake realizes he can actually do this himself.

**Resolution:** Jake completed the task. The guide cached offline so he could follow it in his driveway with his phone on the dashboard. Progress bar hits 100%. He didn't need a mechanic. He didn't need to understand cars beforehand. The app was the experienced friend he didn't have.

**Requirements Revealed:** Symptom-based AI task generation, single clarifying question flow, inline parts with vehicle-specific accuracy, offline caching, progress visualization.

---

### Journey 2: The Inexperienced Owner — "I Need Someone Who Knows Cars"
*Covers: Inexperienced Owner, Safety-First User*

**Persona:** Sarah. Not a car person. Recently drove down a mountain in Austria and burned up her brakes. Her friend, panicking, threw water on the hot rotors. Sarah doesn't know what happened mechanically — she just knows something went very wrong.

**Opening Scene:** Sarah opens AutoCare Companion. She types: *"My brakes feel weird after driving downhill a lot."* She doesn't know the technical term. She doesn't know her trim.

**Rising Action:** AI doesn't immediately jump to a guide. It asks: *"Did the brakes feel spongy, or did they stop working well while you were still driving downhill?"* Sarah says both. AI flags a **safety warning first**: *"⚠️ If your brakes overheated, do NOT pour water on them — this can crack the rotors. If someone already did this, the rotors likely need replacement."* This single line would have saved Sarah's situation. Then AI guides her to the YMMT cascading selector. She clicks her year, then the make, then the model — the trim options narrow down and she recognizes hers. *Memory jogged.*

**Climax:** AI generates a full brake replacement guide: inspect rotors for heat cracks, replace pads and shoes, source the right parts. Sarah can't do this herself — and AI knows that. The guide includes a clear recommendation: *"This repair requires professional installation. Here's what to tell your mechanic, and here are the parts to buy yourself to save money."* Sarah goes to RockAuto with the exact part numbers. Saves money. Arrives at the mechanic knowing exactly what's needed.

**Resolution:** Sarah didn't need to be a mechanic. She needed an experienced friend who could diagnose, warn her about dangerous mistakes, and tell her exactly what to do — even if "what to do" is "go see a pro, but buy the parts yourself." The app transferred Devon's knowledge to her.

**Requirements Revealed:** Safety warnings as first-priority content, cascading YMMT selector for memory-jogging, AI-generated mechanic-vs-DIY recommendation, parts sourcing with exact part numbers, natural language symptom input.

---

### Journey 3: The Mid-Task Stuck User — "This Doesn't Match What the Guide Says"
*Covers: Mid-Task Stuck User, Cautious DIYer*

**Persona:** Marcus, experienced enough to do his own oil changes and brake pads, but not a full mechanic. He's halfway through a coolant flush on his Challenger and the drain plug won't budge.

**Opening Scene:** Marcus is on step 4 of the coolant flush guide, wrench in hand, in his driveway. No internet signal. The guide is cached offline — good. But the bolt is seized and the guide just says "remove drain plug."

**Rising Action:** Marcus taps the step. An inline tip appears: *"Seized drain plugs are common on older models. Try penetrating oil (PB Blaster) and wait 15 minutes. If still stuck, use an impact wrench. Do NOT overtorque — you'll crack the housing."* Safety callout included. He doesn't have to leave the checklist, doesn't have to Google, doesn't have to leave his driveway.

**Climax:** The tip works. Marcus continues. Two steps later, he sees an unexpected fluid color. He taps again: *"Rusty coolant is normal if it hasn't been flushed in a while. Drain completely before refilling. If it's milky/creamy, that indicates oil contamination — stop and consult a mechanic."* His fluid is rusty. He continues confidently.

**Resolution:** Marcus completed the task without leaving the app, without losing his place, without a moment of real anxiety. The guide anticipated the problems he'd actually encounter — not just the textbook version.

**Requirements Revealed:** Inline pro tips per step, safety callouts with clear stop/go guidance, offline-first reliability, contextual media references, AI-generated "what you're seeing is normal" reassurance.

---

### Journey 4: The Aftermarket Discoverer — "OEM Isn't Always Right"
*Covers: Aftermarket-Aware Owner, Time-Constrained DIYer*

**Persona:** Devon. His Challenger is back in the shop for a second OEM driveshaft failure. He wants the app to give him the full picture — not just a brand-loyal default.

**Opening Scene:** Devon opens AutoCare Companion and selects driveshaft replacement for his Challenger. The guide loads. He scrolls to the parts section.

**Rising Action:** AI doesn't just list the OEM part, and it doesn't just say "go aftermarket." It presents what consumers are actually saying:

> **OEM Driveshaft**
> ⚠️ Documented failure reports on this model. Multiple owners report repeat breakage within 2 years.

> **Aftermarket: DSS One-Piece Driveshaft**
> Higher rated specs. Some owners report minor vibrations at highway speed. Significantly more durable long-term based on forum feedback.

Both options are there. Both have the real-world context behind them. No spin.

**Climax:** Devon reads both sides. He already knows the answer for his situation — two broken OEM shafts means the vibration tradeoff is worth it. He selects the DSS part. But a first-time Challenger owner with only one OEM shaft might weigh it differently. The app respects that. It's not making the decision — it's giving the information an experienced owner would have.

**Resolution:** The app didn't tell Devon what to do. It told him what other owners have experienced — the good and the bad — and let him decide. That's the trust builder. That's what makes it feel like advice from a knowledgeable friend, not a sales pitch.

**Requirements Revealed:** Balanced consumer feedback on parts (pros AND cons), OEM failure documentation, aftermarket trade-off presentation, user-driven final decision.

---

### Journey 5: The Solo App Owner — "One Hour a Week"
*Covers: Admin/Operations (Devon)*

**Persona:** Devon. Career Knowledge Manager. AutoCare Companion is live. It's Tuesday evening after work. He has an hour.

**Opening Scene:** Devon opens the site on his laptop. Checks the dashboard — visitor count, guide completions, ad revenue. Everything looks healthy. No alerts.

**Rising Action:** He checks for user feedback — a comment on a Challenger forum thread mentions the app helped them with a transmission issue but the parts link was wrong. Devon notes it. He opens Claude Code, describes the issue. The AI agent fixes the parts link generation logic, tests it, and deploys. Took 10 minutes.

**Climax:** Devon spends the remaining time thinking bigger. He's been reading about AI-to-3D-printer workflows — could users generate a small model of their car's engine bay for reference? He notes it for a future sprint. He also sketches out how to expand beyond Challengers once the pattern is proven.

**Resolution:** Devon spent 1 hour: 10 minutes reviewing, 10 minutes on a bug fix via AI, 40 minutes on strategy and future planning. The app runs itself. AI agents handle the code. He's the product thinker, not the developer.

**Requirements Revealed:** Simple usage monitoring, AI-maintainable codebase, fast deploy cycle via GitHub/Vercel, feedback collection path, low-friction bug reporting and resolution.

---

### Journey 6: The Remote Helper — "Let Me Help From Here"
*Covers: Helper/Advisor (Secondary Participant)*

**Persona:** Devon's friend calls him while working on their Challenger. Devon isn't there — he's at work. The friend has the app open but is stuck on whether to use the OEM or aftermarket part.

**Opening Scene:** Devon's friend texts: *"Hey, the app says OEM but I remember you said aftermarket was better for this."* Devon opens AutoCare Companion on his phone during lunch.

**Rising Action:** Devon navigates to the same guide his friend is on. He can see the exact step and parts recommendation. The aftermarket flag is there — his friend just missed it. Devon texts: *"Scroll down past the first part — there's an aftermarket recommendation flagged. That's the one."*

**Climax:** Friend finds it. Buys the right part. Continues the guide.

**Resolution:** The app's clear structure — consistent steps, explicit aftermarket flags, same layout on any device — made remote troubleshooting possible without a real-time collaboration feature. The guide is the shared reference point.

**Requirements Revealed:** Consistent cross-device layout, clear visual hierarchy for aftermarket flags, structured steps that are easy to navigate to remotely, future: shareable checklist state.

---

### Journey Requirements Summary

The table below documents **which journeys validate the need for each capability** — not which journeys are the only place that capability appears. Each capability, once built, serves users across all relevant interactions.

| Capability | Validated By Journey |
|---|---|
| Symptom-based AI task generation | 1, 2 |
| Cascading YMMT selector | 2 |
| Safety warnings (first priority) | 2, 3 |
| Inline pro tips per step | 3 |
| Balanced consumer feedback on parts (pros + cons) | 4 — *global product principle* |
| OEM failure documentation | 4 |
| Time estimates + difficulty ratings | 4 |
| Offline-first PWA (cached guides) | 1, 3 |
| Parts links inline with checklist | 1, 2, 4, 6 |
| AI mechanic-vs-DIY recommendation | 2 |
| Progress visualization | 1 |
| AI-maintainable codebase | 5 |
| Usage/feedback monitoring | 5 |
| Consistent cross-device layout | 6 |

**Global Product Principle:** Parts recommendations always present balanced consumer feedback — both the strengths and the reported issues — so users make informed decisions. This applies to every parts interaction across the product, not just aftermarket alternatives.
