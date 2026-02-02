---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type']
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

## Domain-Specific Requirements

### Compliance & Regulatory

- **Consumer maintenance guidance product:** AutoCare Companion is closer to a cooking recipe app than to vehicle-embedded software. Cars are the subject; consumer software is the regulatory context. Future requirements evaluated against this framing — not against what the broader automotive industry demands.
- No automotive safety certification required. ISO 26262, V2X, and safety certification standards do not apply.
- **Disclaimer requirement:** Surfaced contextually before safety-critical steps — not as a static footer. Covers liability without breaking the "experienced friend" trust model.
- **Parts compatibility obligation:** Recommendations must match exact vehicle (YMMT). Trim is critical — it determines equipment and which fixes apply. A fix for the SRT 392 does not apply to the base V6.
- **Parts data is crowdsourced owner experience, not app endorsement:** Known Issues reliability ratings and aftermarket recommendations are sourced from real owner feedback. The app reports what owners have found — it does not editorially endorse any product. Disclaimer must cover this explicitly.
- **US Market-First, GDPR-Compatible by Architecture:** Product targets the US market. Operator is a contractor based in Germany. GDPR compliance at MVP is achieved through data minimization:
  - **Free tier:** localStorage only. No server-side storage. No user identification. No personal data processed. No GDPR obligation.
  - **Analytics:** Cookie-free analytics only (e.g., Plausible). No tracking cookies. No consent banner needed.
  - **Ads:** Contextual ad networks (non-cookie-based targeting) preferred. If cookie-based ad networks are used, a cookie consent banner is required for EU visitors.
  - **Parts feedback loop:** Anonymous by default. No user identification required to flag an incorrect recommendation.
  - **Premium tier (Growth phase):** User accounts introduce personal data. Before Premium launches: full privacy policy, data processing agreement with Supabase, and right-to-erasure support required.
  - **Risk framing:** A solo contractor in Germany marketing to the US has minimal GDPR exposure IF the free tier genuinely processes no personal data and uses no tracking cookies. This architecture achieves that. Liability surface is near-zero at MVP.

### Technical Constraints

- **Content severity classification:** All guides and Known Issues entries are classified at generation:
  - **High-risk** (brakes, electrical, drivetrain, steering): Safety Officer blocks if issues found. Safety warning is first element rendered. Complex repairs routed to mechanic.
  - **Medium-risk** (coolant, transmission fluid, battery): Safety Officer reviews, flags warnings where relevant. Does not block.
  - **Low-risk** (oil change, air filter, wipers): Safety Officer passes through. Standard disclaimer only.
  - Severity calibration prevents warning fatigue — uniform high-alert across all content trains users to ignore warnings.
- **AI accuracy:** Safety-relevant guidance cross-referenced against known-good vehicle data. Confidence level defined — not self-reported by AI. Basis: consistency across multiple prompts or match against known vehicle data.
- **AI regression test harness:** Known vehicle/symptom pairs with expected outputs run pre-deploy. Includes adversarial test cases — intentionally wrong part numbers, mismatched trims, bad cost data — to verify the validation agent catches them.
- **AI Agent Architecture — six-agent pipeline:**
  1. **Mechanic AI (Core Specialist):** Only user-facing agent. Handles task identification, vehicle extraction, symptom diagnosis, guide generation.
  2. **Safety Officer:** Reviews all content before it reaches users. Blocking gate for high-risk content. Severity-calibrated. Core product requirement — not a compliance add-on. Maintains the trust that makes the product valuable.
  3. **Parts Specialist:** Validates parts recommendations — compatibility, discontinued parts, OEM vs aftermarket accuracy, cost estimates.
  4. **AI Validation Agent:** Quality gate on curated Known Issues data before publishing. Validated by adversarial test cases.
  5. **Privacy & Compliance Manager:** Reviews data flows and new features for GDPR compliance. Runs pre-deploy on anything that touches user data.
  6. **Content Quality Reviewer:** Final gate before user sees output. Owns tone ("experienced friend"), completeness, and consistency.
  - **Real-time pipeline:** Mechanic AI → Safety Officer → Parts Specialist → Content Quality Reviewer → User
  - **Pre-publish pipeline:** Human-curated Known Issues → AI Validation Agent → Privacy & Compliance Manager → Published
  - **Pre-deploy pipeline:** New feature → Privacy & Compliance Manager → Safety Officer → Deploy
  - Agents are pre-publish quality gates — only Mechanic AI faces the user. Validation is seamless and behind the scenes.
  - **Agent prompts are version-controlled:** Each agent's system prompt lives in the codebase. Changes go through the same deploy cycle. Claude Code can read, modify, and test agent prompts without manual intervention.
- **Known Issues data is curated, not AI-generated:** Verified fixes, predicted costs, and reliability comparisons stored per vehicle. Includes: predicted repair cost range, OEM part + price, aftermarket alternative + price, reliability rating from owner feedback. Cost figures labeled as estimates with last-updated date and "verify before purchasing" callout.
- **Known Issues keyed to full YMMT:** A fix valid for one trim is not valid for another. Trim determines equipment. AI Validation Agent confirms full YMMT match before surfacing.
- **Known Issues resolution tracking is Premium:** Free tier sees all Known Issues warnings and can dismiss with a basic "I've addressed this" — prevents warning fatigue from eroding trust in safety callouts. Premium adds full tracking: installed parts history, resolution notes, service timeline. Upgrade path is depth of tracking, not the ability to dismiss.
- **Priority cache invalidation for safety-relevant Known Issues:** Safety issues checked and pushed before any other content when online. On first reconnection after a safety recall, update surfaces as a blocking modal — not an inline update that can be scrolled past. Acknowledges inherent offline-first limitation: priority invalidation reduces the window, does not eliminate it.
- **Atomic caching:** Guides cache as a complete unit or not at all. No partial state. A half-cached guide in a garage is worse than no guide.
- **Cache status badge:** Every guide shows explicit cached/not-cached indicator. No ambiguity before the user leaves for the garage.
- **Offline-first is trust architecture:** A guide that lives on the device, works without internet, is the user's in a way cloud-dependent products aren't. Cache badge, atomic caching, "last verified" date are trust features — not just reliability features. Competitive moat online-only products can't match.
- **Step-scoped inline AI assistance:** Within a guide, users can tap any step to open an inline AI dialogue scoped to that step. Example: "Can you explain more on step 5?" Step expands with contextual chat below it — AI responds with context scoped to vehicle, guide, and that specific step. Other steps unaffected. Dialogue collapses when user is done. Inline AI chat requires API call — unavailable offline. Existing inline tips (baked into guide at generation) remain available offline. UX makes this clear — no silent failure.
- **"Not sure?" trim helper:** If a user doesn't know their trim, clarifying questions narrow it down (engine size, package features). No one stuck at YMMT selection.
- **Human review escalation:** If AI Validation Agent rejects curated data, escalates to solo operator for review before blocking. Prevents false negatives from locking out correct information.
- **Rate-limited anonymous parts flagging:** One-tap flag inline with parts. Zero friction. Anonymous — no account required. Rate-limited to prevent spam. Multiple flags trigger AI Validation Agent review.
- **Cascading YMMT data:** Accepts all vehicles from day one. AI generates guides for any vehicle. Known Issues curated for Challenger at launch, expanding over time. Architected for data-source swap without restructuring.
- **Parts linking strategy:** MVP uses Google/Bing search links. Growth phase: affiliate partnerships with automotive retailers (RockAuto, Amazon Auto, O'Reilly) as a third revenue stream. Architecture supports swapping search links for direct retailer links without restructuring.
- **Parts feedback loop:** Users flag incorrect recommendations inline. Anonymous — no account required. Feeds accuracy tracking.

### Domain Patterns

- **Known Issues Registry (proactive, cost-aware, owner-reported):** Recurring problems surfaced before the user hits them — with predicted costs, OEM vs aftermarket comparison, and reliability ratings. Design issues, not mileage predictions. Driving style and conditions vary; mileage is not a reliable indicator. Example: Dodge used plastic end-tanked radiators on the Challenger — owners reported repeated failures regardless of mileage. Briefing framed as: "Owners of your [YMMT] have reported [issue]. Here's what they found and how they fixed it."
- **Vehicle Onboarding Briefing:** Immediately after YMMT selection, the full AI-powered experience is available for any vehicle — diagnosis, guides, parts. For vehicles with curated Known Issues (Challenger at launch): briefing also surfaces owner-reported issues with costs and fixes. For other vehicles: "Owner-reported issues for this vehicle will appear here as they're reported." All vehicles fully supported from day one. Known Issues is a bonus layer that expands as the community contributes.
- **Progressive disclosure on Known Issues briefing:** Most critical issues surfaced first. Full list expandable. Doesn't overwhelm new owners.
- **Guides are the primary product. Chat is the entry point.** User describes symptom via AI chat → guide generates → user enters checklist mode. The agent pipeline, offline caching, Safety Officer review — all optimized for the guide experience. Chat UX matters for the first 30 seconds. Guide UX matters for the next hour.
- **Safety callouts are structural, not optional:** First element rendered in any high-risk guide. Undismissable. Severity-calibrated — present on High-risk content, contextual on Medium-risk.
- Scheduled maintenance follows predictable mileage/time-based intervals. Known Issues are separate — design-specific, not interval-based.
- Forum-sourced aftermarket feedback is the most reliable consumer signal for parts quality.
- The **"experienced friend" mental model** is the core domain pattern.

### Risk Mitigations

| Risk | Likelihood | Impact | Agent(s) / Mitigation |
|---|---|---|---|
| AI hallucinates incorrect part numbers | Medium | High | Parts Specialist + Safety Officer + regression harness with adversarial test cases |
| User follows guide for wrong vehicle | Medium | High | Mechanic AI (YMMT gate) + Parts Specialist + "Not sure?" trim helper |
| Known Issue fix is wrong for trim | Medium | High | AI Validation Agent + adversarial tests + keyed to full YMMT |
| Cost estimates erode trust | Medium | Medium | Parts Specialist labels as estimates; freshness indicator; "verify before purchasing" |
| Aftermarket recommendation damages trust | Low | High | Parts Specialist + Safety Officer; disclaimer: crowdsourced experience, not endorsement |
| Liability for mechanical advice | Medium | Medium | Safety Officer (blocking gate on high-risk); contextual disclaimer; mechanic routing |
| Offline guide becomes stale | Low | Medium | Priority cache invalidation; safety recalls as blocking modal on reconnection |
| Community trust destruction | Medium | High | Regression harness; rapid deploy cycle; anonymous parts feedback loop |
| GDPR liability | Low | High | Privacy & Compliance Manager; free tier processes no personal data by architecture |
| Warning fatigue undermines safety | Medium | High | Severity classification; progressive disclosure; free-tier dismiss; safety callouts undismissable |
| Incomplete guide shipped | Medium | High | Content Quality Reviewer (step completeness check) |
| Partial cache in garage | Medium | High | Atomic caching; cache status badge |
| AI Validation Agent approves bad data | Low | High | Adversarial test cases fed through validator; human review escalation on rejections |
| Inline chat fails silently offline | Medium | Medium | Explicit UX indicator: inline chat unavailable offline; inline tips remain |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Six-Agent AI Validation Pipeline for Consumer Software**
Consumer apps use a single AI model end-to-end. AutoCare Companion introduces a multi-agent pipeline where specialized agents (Safety Officer, Parts Specialist, Content Quality Reviewer) each own a validation domain and run silently before output reaches the user. Enterprise-grade validation, first in this category. Value compounds through operational learnings — tuning adversarial test cases, latency optimization, and severity gating. Proves itself in retention (guide accuracy correlates with 30-day return rate), not in feature metrics.

**2. Proactive Known Issues Registry**
The maintenance app category is entirely reactive: user has a problem → looks it up. AutoCare Companion flips the paradigm: surface known design issues *before* the user encounters them, based on real owner experience. The product knows what's coming for your car. Transforms maintenance from break-fix to preventive. Strongest innovation — data moat compounds over time. Ships first, feeds first. Architecture decision on automated gathering path made at MVP; automation ships at Growth.

**3. Step-Scoped Inline AI Chat (New Interaction Pattern)**
Guides are static checklists in every competing product. AutoCare Companion introduces: tap any step → expands with a contextual AI dialogue scoped to that step and vehicle → collapses when done → checklist continues. The AI assistant is embedded *in* the workflow, not beside it. A completion accelerator — users who engage with inline chat have measurably higher guide completion rates. Don't overstate in positioning: table stakes within 12–18 months. 3-question limit on free tier with counter visible from first tap ("AI Help: 3 questions remaining").

**4. Vehicle Onboarding Briefing as First Value Delivery**
No maintenance app delivers value before the user has a problem. AutoCare Companion's first interaction after YMMT selection: *"Here's what owners of your car have reported."* Immediate, community-powered, zero-task value. Real value from a single input, in a category where no one does this. Forms a retention loop with Known Issues: the briefing plants the seed; the Known Issues entry harvests it when the issue surfaces in the user's workflow.

**5. Offline-First as Trust Architecture**
Offline capability in consumer apps is typically a connectivity fallback. AutoCare Companion positions it as a trust signal: the guide is yours, on your device, works when you need it. Cache status badge and atomic caching aren't reliability features — they're trust features. First-mover advantage — competitors will copy once they see it. Ship fast and lock the narrative. Cache badge is the highest-conversion UX surface in the product — design priority equivalent to YMMT selector and parts card. Users who proactively cache guides are the highest-engagement segment.

**6. AI-Maintainable Product for Solo Sustainability**
The entire product is architected so an AI agent (Claude Code) can read, understand, modify, and deploy without human developer intervention. Agent prompts are version-controlled. Codebase designed for AI readability. Bus factor 1 — one person, ≤1 hour/week. Operational moat only — never market it. Real competitive advantage is response speed: feedback loop closure in hours vs. sprint cycles. That speed compounds — users who see issues fixed come back.

### Market Context & Competitive Landscape

The automotive maintenance app market is dominated by three categories — none of which compete on any of AutoCare Companion's innovation axes:

| Competitor Category | Examples | What They Do | What They Don't Do |
|---|---|---|---|
| OBD-II Scanner Apps | Torque Pro, CarScanner | Read error codes from vehicle | No guides, no parts, no AI assistance |
| Dealer/Manufacturer Apps | MyDodge, MyFord | Brand-locked service scheduling | OEM-only, no aftermarket intelligence, no community knowledge |
| Generic How-To | YouTube, forums | Unstructured vehicle-specific content | No offline, no AI, no structure, buried in noise |

**Innovation whitespace:** No competitor has proactive known issues, multi-agent AI validation, step-scoped inline AI, offline-first trust architecture, or community-powered reliability data at the product level. The product enters a market with no direct competitor on any of these axes.

### Innovation Tiers & Durability

| Tier | Innovation | Score | Durability | Window |
|---|---|---|---|---|
| Lead differentiator | Known Issues Registry | 4.55 | Compounds over time | Open — data moat grows |
| Lead differentiator | Onboarding Briefing | 3.95 | Tied to Known Issues data | Open while data grows |
| UX delight | Step-Scoped Inline Chat | 3.55 | Table stakes by 2027 | 12–18 months |
| Invisible enabler | Six-Agent Pipeline | 3.45 | Operational learnings compound | Open — tuning advantage grows |
| Trust foundation | Offline-First | 3.25 | Table stakes by 2027 | 6–12 months for positioning |
| Operational moat | AI-Maintainable Product | 3.25 | Compounds passively | Open — no action needed |

**Marketing headline:** "Your car already knows what's going to break. AutoCare Companion tells you before it does."

### Validation Approach

Each innovation has a specific signal that proves it's working:

| Innovation | Validation Signal | Timeframe |
|---|---|---|
| Six-agent pipeline | Zero safety-critical errors reach users in first 100 guides generated | Month 1–2 |
| Proactive Known Issues | Onboarding briefing open rate >40%; return visit within 7 days after a briefed Known Issue becomes relevant (loop closing signal) | Month 1–2 |
| Step-scoped inline chat | Step-help tap rate >20% of guides; completion rate lift: guides with chat engagement vs. without | Month 2 |
| Onboarding Briefing | First-session: user completes YMMT + reads briefing before leaving | Month 1 |
| Offline-first trust | Users cache guides proactively; cache badge viewed >50% of guides | Month 2 |
| AI-maintainable product | Bug fixes and deploys via Claude Code without manual developer intervention | Ongoing |

**Cross-innovation validation signals:**

| Innovation Loop | Validation Signal | Timeframe |
|---|---|---|
| Known Issues + Onboarding Briefing (retention loop) | Return visit within 7 days after a briefed Known Issue surfaces in user's workflow | Month 2–3 |
| Pipeline accuracy + trust (invisible retention driver) | Guide accuracy correlated with 30-day return rate | Month 2–3 |
| Inline chat + guide completion (engagement accelerator) | Completion rate lift: guides with chat engagement vs. without | Month 2 |

### Risk Mitigation

| Innovation | Risk | Mitigation |
|---|---|---|
| Six-agent pipeline | Pipeline latency makes guide generation feel slow | Agents run in parallel where dependencies allow; loading state sets expectations ("Building your guide...") |
| Proactive Known Issues | Curated data is wrong — damages trust before user starts a task | AI Validation Agent + adversarial test cases gate all Known Issues before publish |
| Step-scoped inline chat | Inline chat pulls users out of checklist mode, slows them down | Chat is opt-in (tap to expand). Default is the static checklist. Users who don't need help never see it |
| Onboarding Briefing | Briefing feels like a sales pitch, not genuine help | Framed as owner-reported experience. Tone matches "experienced friend" model. No editorial endorsement |
| Offline-first trust | Users don't realize guide isn't cached until they're in the garage | Cache status badge always visible. Cache badge is highest-conversion UX surface — design priority equivalent to YMMT selector and parts card |
| AI-maintainable product | AI makes a bad deploy without human review | All deploys go through regression harness + adversarial tests. Devon reviews deploy output. Enables feedback loop closure in hours vs. sprint cycles — response speed is the compounding advantage |

**Future consideration:** Automated Known Issues gathering agent(s) — architecture decision (data flow, validation, YMMT keying) at MVP. Automation ships at Growth.

## Web App Specific Requirements

### Project-Type Overview

AutoCare Companion is a Next.js PWA targeting mobile-first garage use. The product lives at the intersection of two technical needs: SEO-crawlable vehicle/task pages that rank for maintenance queries, and an app-like guide experience that works offline. Next.js App Router handles both natively — server components for SEO pages, client components for the interactive guide experience. No architectural tension to resolve.

### Technical Architecture Considerations

- **Next.js App Router** — hybrid rendering by default. Server Components for landing and SEO pages. Client Components for guide UI, inline chat, progress tracking.
- **Service Worker** — handles offline caching. Atomic guide caching (all-or-nothing). Cache-first for guides, network-first for AI API calls.
- **State:** localStorage for MVP (progress, dismissed Known Issues). IndexedDB for larger cached data at Growth.
- **External dependencies at MVP:** OpenAI API only. AI calls routed server-side via Next.js API routes — key never touches client code.
- **Hosting:** Vercel free tier. Zero-config deploys from GitHub. Claude Code can trigger deploys via git push.

### Browser Matrix

| Browser | Platform | Support Level | Notes |
|---|---|---|---|
| Chrome | Android | Full | Best PWA support. Install prompt appears automatically. Primary target. |
| Safari | iOS | Partial | Service Worker works. Install prompt does NOT auto-appear — requires manual Share → Add to Home Screen. Push notifications limited on older iOS. |
| Edge | Windows / Android | Full | Chromium-based. Same PWA behavior as Chrome. |
| Firefox | Desktop | Full | Desktop is secondary. No PWA install prompt but full site functionality. |

**Safari iOS mitigation:** Onboarding flow includes an explicit "Add to Home Screen" instruction with a visual guide. This is the single biggest PWA friction point for the target audience — worth the UX investment. Detect iOS Safari on first visit, show the prompt once, make it dismissible.

### Responsive Design

- **Mobile-first:** Phone in garage is the primary use case. All layouts designed mobile-first, scaled up for desktop.
- **Touch targets:** Minimum 44×44px. Garage use means gloved hands, greasy fingers, varying light. No small tappables.
- **Single-column guide layout:** Checklist steps, inline tips, parts cards, and inline chat all flow vertically. No horizontal scrolling in the guide experience.
- **Desktop as secondary:** Dashboard and monitoring views benefit from wider layouts. Guide experience stays single-column even on desktop — consistency across devices supports the Remote Helper journey (Journey 6).

### Performance Targets

| Metric | Target | Why |
|---|---|---|
| Time to Interactive (TTI) — Mid-range devices | <3s on 4G mobile | Guide must be usable before patience runs out in a driveway. Target: iPhone 12, Pixel 5, similar. |
| Time to Interactive (TTI) — Low-end devices | <5s on 3G | Older devices with slower processors. Performance Profiler Panel identified this as real-world constraint. |
| Cached guide load | <1s | No network dependency. Instant in the garage. |
| AI pipeline end-to-end | <8s | Full pipeline: Mechanic AI → Safety Officer → Parts Specialist → Content Quality Reviewer. Loading state sets expectations. Low-risk guides skip Safety Officer blocking gate — faster. |
| Initial JS bundle | <150KB gzipped | Next.js code splitting handles this. Guide pages are the hot path. |

**Stratified TTI targets (Performance Profiler Panel):** Mid-range devices (<3s) are the primary target. Low-end device detection triggers simplified UI — fewer animations, reduced bundle. Low battery mode detection uses same simplified path.

### SEO Strategy

- **Target queries:** Vehicle-specific maintenance. "2015 Dodge Challenger SRT 392 oil change", "Challenger known issues radiator", "how to replace brake pads Challenger".
- **URL structure:** `/guides/[task]/[year]-[make]-[model]-[trim]` — clean, crawlable, human-readable. Each guide is a unique indexable URL.
- **Server rendering:** Next.js server-renders all SEO-facing pages. Google indexes full content, not a blank JS shell.
- **Structured data:** JSON-LD on guide pages — vehicle, task type, estimated difficulty. Helps Google categorize the content.
- **Internal linking:** Known Issues briefing links to relevant guides. Parts sections link to related tasks. Builds topical authority in automotive maintenance.

### Accessibility Level

- **Target: WCAG AA (AA for general UI, AAA for safety callouts)**
- **Color contrast:**
  - General UI: Minimum 4.5:1 (WCAG AA). Garage use in variable light — phone in sunlight, dim garage, night work.
  - Safety callouts: 7:1 contrast ratio (WCAG AAA). Chaos Monkey Scenarios validated this for dark garage visibility with low phone brightness.
- **Screen reader support:** Semantic HTML. Guide steps as ordered lists. Safety callouts use `role="alert"` for high-risk warnings. Parts cards have descriptive labels.
- **Touch and keyboard:** Full keyboard traversability for desktop. Visible focus rings on all interactive elements. System font sizing respected — no fixed pixel sizes that break on accessibility zoom.
- **Error messages:** Descriptive text, not just color. "Part not found for your vehicle" — not a red highlight with no explanation.

### Design Direction & Micro-Interactions

- **UI inspiration:** [Next.js showcase](https://nextjs.org/showcase), [huly.io](https://huly.io), [reflect.app](https://reflect.app) — polished, subtle micro-interactions and smooth visual transitions.

#### Two-Phase Design Language (Genre Mashup)

AutoCare Companion uses different visual treatments for different product phases:

**Discovery Phase (index, briefing, chat):**
- Calm, polished aesthetics from productivity apps (huly.io, reflect.app, Next.js showcase)
- Ambient background motion, floating elements, gradient shifts
- Builds trust and confidence before the user commits to a task
- Goal: "This product knows what it's doing."

**Execution Phase (guides, checklists):**
- High-contrast, task-focused automotive maintenance context
- Clean, stripped-down UI with no decorative motion
- Safety callouts use AAA contrast (7:1) for visibility in dark garages
- Goal: "I can read this with grease on my hands in dim light."

This phase shift mirrors the user's mental state: browsing → confident task execution.

**Micro-Interactions Scope:**

| Surface | Micro-Interactions | Rationale |
|---|---|---|
| Index / landing page | Full treatment — ambient background motion, floating elements, gradient shifts | First impression. No competing UI elements. Polish earns trust before the user touches a guide. |
| Briefing page | Subtle — smooth card reveals, gentle transitions | Still in Discovery Phase but moving toward task focus. |
| Chat interface | None | Typing indicator and AI response appearing are already dynamic. Background motion competes with text the user is reading. Entering Execution Phase. |
| Guide experience | None | Step expand/collapse, inline chat, progress bar — the UI itself is the micro-interaction. Background motion distracts from an active task. Full Execution Phase. |

**Implementation constraints (Performance Profiler Panel + Architecture Decision Records):**
- CSS `@keyframes` only. `transform` and `opacity` properties exclusively — no layout or paint triggers.
- No animation libraries at MVP. Zero JS bundle cost for animations.
- Max 3–4 animated elements on screen simultaneously.
- `prefers-reduced-motion` disables ALL animations completely. Product is visually complete and intentional without them.
- Animations are enhancement, never structure. Test with animations disabled as the baseline.

**Animation Architecture (ADR):**
- File organization: `/styles/animations/discovery.css` (index, briefing), `/styles/animations/execution.css` (guides — currently empty, reserved for future)
- Server Component rendering: animations load inline via `<style>` tags, not separate CSS files — eliminates FOUC (flash of unstyled content)
- CSS fallbacks: all animations wrapped in `@media (prefers-reduced-motion: no-preference)` — baseline UX is motion-free
- Inline loading strategy: Discovery Phase animations inline in page `<head>`, Execution Phase has no animations to load

### Inline Tips vs. Inline Chat (User Persona Focus Group)

**Inline Tips (static, offline):**
- Baked into the guide at generation time by Content Quality Reviewer
- Available offline — part of the cached guide
- Examples: "Seized drain plugs are common on older models. Try penetrating oil and wait 15 minutes."
- Rendered as expandable step details — no AI call required

**Inline Chat (dynamic, online-only):**
- User taps "Ask AI" on a step → opens scoped dialogue
- Requires network connection — makes real-time API call
- Clarifying questions, troubleshooting, "explain more about step 5"
- UX makes online requirement clear — "AI Help (requires connection)" label, disabled state when offline

This separation ensures the core guide experience (static tips) works offline while preserving the option for deeper help when connected.

### Implementation Considerations

- **PWA manifest:** App name, icons, theme color, standalone display mode. Configured for mobile install.
- **Service Worker strategy:** Cache-first for guide content (atomic). Network-first for AI API calls (each guide is unique — can't cache). Stale-while-revalidate for static assets.
- **Environment variables:** OpenAI API key in Vercel environment only. Server-side AI calls via Next.js API routes or Server Actions.
- **Safari PWA workaround:** iOS Safari detection on first visit → onboarding prompt with visual "Add to Home Screen" guide. Shown once, dismissible.

### Resilience Testing (Chaos Monkey Scenarios)

The following stress tests and hardenings were identified to ensure the product works in real-world failure modes:

#### Safari iOS PWA Gaps
**Scenario:** Install prompt doesn't auto-appear. Push notifications limited. Service Worker has iOS-specific quirks.

**Hardenings:**
- Explicit onboarding flow with "Add to Home Screen" visual guide (iOS Safari detection)
- Push notifications marked as "Premium feature — limited on iOS" in settings
- Service Worker tested on iOS Safari specifically — cache eviction behavior differs from Chrome
- Fallback: if Service Worker fails to register, show "Offline mode unavailable on this browser" and disable cache badge

#### Low Battery Mode
**Scenario:** Phone detects low battery → disables animations, throttles JS, reduces background tasks.

**Hardenings:**
- CSS animations wrapped in `@media (prefers-reduced-motion)` — respects system battery saver
- Low-end device detection (from Performance Profiler Panel) applies same constraints as low battery mode
- Simplified UI path: reduced bundle, no Discovery Phase animations, Execution Phase baseline only

#### Dark Garage Lighting
**Scenario:** User opens guide in dim garage. Phone brightness at 30%. Safety callouts must remain visible.

**Hardenings:**
- Safety callouts use 7:1 contrast ratio (WCAG AAA) — validated for low-light visibility
- Two-Phase Design Language uses high-contrast Execution Phase for guides
- Dark mode support (system `prefers-color-scheme`) with inverted safety callout colors tested for same 7:1 ratio

#### Offline Navigation Edge Cases
**Scenario:** User starts guide online, loses connection mid-task, taps back/forward, or navigates to uncached page.

**Hardenings:**
- Atomic guide caching: entire guide cached or nothing — no partial state
- Service Worker serves offline fallback page for uncached routes: "This page requires connection. Cached guides: [list]"
- Navigation within cached guide works fully offline (all steps, inline tips, progress tracking)
- Inline chat shows "Requires connection" label and disabled state when offline — no silent failure

#### Low-End Device Performance
**Scenario:** Older Android phone (3GB RAM, slower CPU). Animations cause jank. Large JS bundle delays interactivity.

**Hardenings:**
- Device detection based on `navigator.hardwareConcurrency` and `navigator.deviceMemory` (where available)
- Low-end path: skip Discovery Phase animations, reduce JS bundle via dynamic imports, simplify DOM
- TTI target stratified: <5s for low-end devices (vs. <3s for mid-range)
- Guide experience prioritized over index polish — low-end users get full guide functionality, simplified landing page

**Testing Protocol:**
- Manual testing on real devices: iPhone SE (iOS Safari), Pixel 3a (low-end Android), desktop Firefox
- Network throttling: Fast 3G, offline mode
- Battery saver mode enabled during testing
- Dark environment testing with screen brightness at 30%
