---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
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

## Executive Summary

AutoCare Companion is an offline-first PWA that generates AI-powered automotive maintenance guides for DIY car owners who need expert guidance in their garage. Unlike generic repair manuals or chatbots, it delivers vehicle-specific, validated guides through a six-agent validation pipeline (Mechanic AI, Safety Officer, Parts Specialist, Content Quality Reviewer, Cost Estimator, Known Issues Gatherer) that ensures accuracy and safety. The app works fully offline after initial setup, proactively surfaces known issues before the user encounters them, and operates within solo sustainability constraints (<$20/month API costs, ≤1 hour/week maintenance).

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
- **Year, Make, Model, Trim (YMMT) Without a Database:** Cascading selector works via lightweight JSON — no manual database maintenance

## User Journeys

### Journey 1: The Uncertain Diagnoser (Jake, Dodge Challenger SRT 392 Owner)

**Context:** Check engine light illuminates. Jake notices slight bucking during acceleration. He's unsure if it's a serious issue.

**Steps:**
1. Opens AutoCare Companion PWA
2. Selects vehicle (2015 Dodge Challenger SRT 392)
3. Initiates AI chat: "My check engine light is on and the car is bucking a bit when I accelerate"
4. AI asks clarifying questions (RPM when bucking occurs? Any other symptoms? Recent maintenance?)
5. AI suggests diagnosis: Likely ignition coil failure (cylinder 3 misfire based on symptom pattern)
6. Jake confirms or scans OBD code (P0303) → AI validates diagnosis
7. **Known Issues briefing surfaces:** "Owners of 2015 Challenger SRT 392 have reported premature ignition coil failures. See 47 reports, 2 TSBs."
8. AI generates guide: "Replace Ignition Coil (Cylinder 3)"
9. **Before guide starts, Pre-Flight Modal appears:**
   - Required tools: Socket set, torque wrench
   - Required parts: Ignition coil (OEM $65 vs Aftermarket $35-45)
   - Difficulty: ⭐⭐ Easy-Moderate
   - Safety: ✅ DIY-Safe
   - Decision framework: Choose OEM if under warranty, aftermarket otherwise
   - Jake clicks "I Have Everything, Start"
10. Follows checklist guide (8 steps, estimated 20 minutes)
11. **Mid-task:** Stuck on step 5 (coil won't come out). Taps inline tip: "Wiggle gently while pulling. If stuck, spray penetrating oil and wait 5 min."
12. If tip doesn't help, taps "Ask AI" (1 of 3 questions): "The coil won't budge." AI: "Common on SRT 392s due to heat cycling. Try rocking motion + WD-40."
13. Completes repair, marks guide complete
14. **Result:** Check engine light off, bucking resolved, $200+ saved vs shop visit

**Key Capabilities Required:**
- AI symptom-based diagnosis (all vehicles)
- OBD code interpretation and validation
- Known Issues proactive briefing
- Pre-Flight Modal with tools/parts/difficulty/safety upfront
- VIN decode for vehicle identification (NHTSA API)
- AI-generated maintenance guides with checklist UX
- Inline tips (offline-available, covers 90% of stuck points)
- Step-scoped inline AI chat (3 questions per guide, visible counter)
- Parts recommendations with OEM vs aftermarket decision framework
- Offline guide execution (Service Worker cached)
- Progress tracking (localStorage, pause/resume from same step)

### Journey 2: The Inexperienced Owner (Sarah, First-Time DIYer)

**Context:** Sarah's 2018 Honda Civic needs an oil change. She's never done this before and wants to try DIY to save money.

**Steps:**
1. Opens AutoCare Companion
2. Selects vehicle (2018 Honda Civic LX)
3. Searches: "Oil change"
4. **Known Issues briefing:** "No significant issues reported for oil changes on your vehicle."
5. **Pre-Flight Modal appears:**
   - Required tools: Oil filter wrench, drain pan, funnel, jack stands
   - Required parts: 5 quarts 0W-20 synthetic oil (OEM Honda $35 vs Mobil 1 $28), oil filter (OEM $8 vs Fram $5)
   - Difficulty: ⭐ Easy
   - Safety: ⚠️ DIY-Safe with Care (jack safety critical)
   - **Sarah sees:** "Requires jack stands. Never work under car supported only by jack."
6. Sarah clicks "Cancel" — realizes she doesn't have jack stands and wants to buy them first
7. **Later:** Returns, clicks "I Have Everything, Start"
8. Follows guide with high-contrast, large text (garage-optimized)
9. **Step 3 shows inline tip:** "Jack stand placement: Look for reinforced frame rails, never place on body panels."
10. Sarah taps "Ask AI" (1 of 3): "Where exactly are the frame rails on my car?" AI provides specific photo reference description
11. Completes oil change successfully
12. **Result:** Saved $50, gained confidence for future maintenance

**Key Capabilities Required:**
- Simple task search (no symptom diagnosis needed)
- Pre-Flight Modal prevents starting without proper equipment
- Safety warnings prominently displayed before starting
- High-contrast, large-text guide design for garage visibility
- Inline tips for safety-critical steps (offline-available)
- Step-scoped inline AI chat with clear question limit visibility
- Progress tracking with pause/resume (can stop and resume tomorrow)

### Journey 3: The Mid-Task Stuck User (Marcus, Experienced DIYer)

**Context:** Marcus is replacing front brake pads on his 2017 Ford F-150. He's done this before, but the caliper bolt is seized and won't budge.

**Steps:**
1. Already mid-task (Step 4 of 9: Remove caliper bolts)
2. **Offline in garage** (no internet)
3. Reads inline tip: "Seized caliper bolts: Apply penetrating oil, wait 10 min, use breaker bar for extra leverage."
4. Tries tip, still stuck
5. Taps "Ask AI" button → sees "No internet connection. Try inline tips or reconnect for AI assistance."
6. Tries alternate approach from different inline tip: "If severely seized, apply heat with propane torch (avoid brake line)"
7. **Later, back inside with WiFi:**
8. Taps "Ask AI" (1 of 3 questions): "I tried penetrating oil and heat but the bolt still won't move. What else can I do?"
9. AI: "If torch + penetrating oil failed, the bolt may be cross-threaded or corroded into the bracket. Last resort: Cut the bolt with angle grinder, replace bolt ($3 part). Hardware stores carry M10x1.5 caliper bolts."
10. Marcus buys replacement bolt, cuts seized bolt, completes repair
11. **Result:** Unstuck, completed repair without tow to shop

**Key Capabilities Required:**
- Guide works fully offline (Service Worker cached)
- Inline tips cover 90% of common stuck points (offline-available)
- Inline AI chat available when online (step-scoped, 3 questions per guide)
- Clear offline vs online state indication
- Progress persists across offline/online transitions (localStorage)
- Pause/resume from same step when switching between garage and house

### Journey 4: The Aftermarket Discoverer (Jake, Cost-Conscious Enthusiast)

**Context:** Jake's 2015 Challenger SRT 392 needs a driveshaft replacement (known issue: OEM 2-piece driveshaft develops vibration at 50k+ miles).

**Steps:**
1. AI diagnosis: Vibration at 70+ mph, noise during acceleration → likely driveshaft issue
2. **Known Issues briefing surfaces:** "Owners of 2015-2020 Challenger SRT models have reported premature driveshaft failures. OEM 2-piece design develops vibration. Aftermarket 1-piece aluminum driveshafts eliminate issue. Based on 89 owner reports, 1 TSB."
3. AI generates guide: "Replace Driveshaft"
4. **Pre-Flight Modal shows OEM ($450) vs Aftermarket ($650-850) decision framework** with recommendation: DSS 1-piece aluminum eliminates OEM design flaw (see ADR-008 in Functional Requirements for full decision framework)
5. Jake chooses DSS aftermarket, clicks "I Have Everything, Start"
6. Follows guide, completes install
7. **Result:** Vibration eliminated permanently, no repeat failures

**Key Capabilities Required:**
- Known Issues briefing surfaces common problems proactively
- Parts recommendations include OEM vs aftermarket decision framework
- Framework explains WHEN to choose each option (not just price comparison)
- Curated recommendations for quality aftermarket brands
- Links to purchase sources (Amazon, specialty retailers)
- Decision guidance based on owner reports and real-world evidence

### Journey 5: The Solo App Owner (Devon, Developer & Product Owner)

**Context:** Devon needs to update the Known Issues database weekly without spending more than 15 minutes.

**Steps:**
1. **Weekly cron job runs:** Gathering agent searches NHTSA TSBs, forums, Reddit for new Known Issues (max 10 vehicles, max 50 results per vehicle)
2. AI Validation Agent scores findings: High/Medium/Low confidence
3. Devon opens approval dashboard (10:00 AM Monday)
4. **Dashboard shows aggregated patterns:**
   - "47 users reported radiator issues on 2015 Challenger SRT 392, avg mileage 52k" (HIGH confidence)
   - "12 users reported transmission slip on 2020 F-150, avg mileage 28k" (MEDIUM confidence, no TSB)
   - "3 users reported headlight condensation on 2019 Civic" (LOW confidence, auto-rejected)
5. Devon reviews HIGH confidence items (10 seconds each):
   - Radiator issue: TSB confirms, 47 reports align → **Approve**
6. Devon reviews MEDIUM confidence items (hold for 30 days, check if user reports emerge)
7. **Batch action:** "Approve all HIGH confidence items?" → Approves 12 items in one click
8. Total review time: 12 minutes
9. **Result:** Known Issues stay current, solo operator time budget holds (<15 min/week)

**Key Capabilities Required:**
- Semi-automated Known Issues gathering agent (internet-wide search)
- AI Validation Agent scores findings (High/Medium/Low confidence)
- Three-source validation (gathering agent + passive user capture + active submissions)
- Automated aggregation (review patterns, not individual reports)
- Priority queue (sorted by confidence × user count × severity)
- Batch review mode ("Approve all HIGH confidence")
- Dashboard tracks approval time (stays within 10-15 min/week)

### Journey 6: The Remote Helper (Sarah, Helping Her Dad Over Phone)

**Context:** Sarah's dad (not tech-savvy) needs to change his cabin air filter. Sarah wants to walk him through it remotely.

**Steps:**
1. Sarah opens AutoCare Companion on her laptop
2. Selects dad's vehicle (2016 Toyota Camry)
3. Searches: "Cabin air filter replacement"
4. **Pre-Flight Modal:** Tools (none needed), Parts (cabin air filter $15-25), Difficulty ⭐ Very Easy, Safety ✅ DIY-Safe
5. Sarah clicks "I Have Everything, Start"
6. **Guide renders identically on Sarah's laptop and would render same on dad's phone** (responsive, consistent layout)
7. Sarah reads step-by-step instructions to dad over phone: "Step 1: Open glove box..."
8. Dad follows along, completes replacement in 5 minutes
9. **Result:** Task completed without dad needing to download app or navigate interface

**Key Capabilities Required:**
- Responsive design (identical layout on desktop, tablet, phone)
- Large text, high contrast for easy reading
- No account required (anyone can access guides immediately)
- Simple task search (non-technical users can find guides)
- Pre-Flight Modal shows clearly what's needed upfront
- Guide is linear and easy to read aloud over phone

## Domain Requirements

### Automotive Industry Compliance

**Regulatory Context:**
AutoCare Companion provides informational maintenance guides and does NOT provide professional repair services, safety certifications, or warranties. All guidance is presented as educational content with explicit disclaimers.

**Disclaimer Requirements:**
- Every guide must display: "⚠️ This is not professional advice. Consult a certified mechanic for safety-critical repairs."
- Known Issues must be framed as informational: "Owners have reported..." (not "You will experience...")
- Parts recommendations must include: "AutoCare Companion is not responsible for parts quality, fit, or performance."
- Safety warnings must be severity-calibrated (High/Medium/Low) and prominently displayed

**Warranty Considerations:**
- Guides must flag when aftermarket parts may void manufacturer warranty
- Pre-Flight Modal must warn: "Vehicle under warranty? Check if DIY repair affects coverage."
- Known Issues must note if OEM repair is required to maintain warranty

**Liability Protection:**
- General liability insurance required (Phase 2, before 1000+ active users)
- User-submitted Known Issues include: "This is not verified by AutoCare Companion" badge until human-approved
- Community voting on accuracy (Phase 2) with fast correction path if issues flagged

**Data Privacy (GDPR/CCPA Considerations):**
- MVP: No user accounts = no personal data collection = minimal compliance burden
- Passive user capture (symptom data): Anonymous, no IP/email stored, aggregated patterns only
- Active user submissions: Anonymous by default, optional email for follow-up
- Phase 2 (user accounts): Magic link auth (no passwords), minimal data collection, export/delete features

**Automotive Data Standards:**
- Vehicle identification via VIN decode (NHTSA vPIC API, free, government-maintained)
- YMMT data structure: Year, Make, Model, Trim (standard automotive taxonomy)
- OBD-II code interpretation (standard SAE J1979 protocol)

## Innovation Requirements

### Six-Agent Content Validation Pipeline

**Innovation:** Multi-agent validation ensures safety, accuracy, and quality before guides reach users.

**Agent Roles:**
1. **Mechanic AI:** Validates technical accuracy, part compatibility, torque specs
2. **Safety Officer:** Identifies risks (jack safety, brake fluid, electrical hazards), assigns severity levels
3. **Parts Specialist:** Verifies part numbers, OEM vs aftermarket compatibility, pricing accuracy
4. **Content Quality Reviewer:** Enforces inline tips coverage (90% of stuck points), validates guide clarity

**Validation Flow:**
- AI generates guide → Mechanic AI reviews → Safety Officer reviews → Parts Specialist reviews → Content Quality Reviewer reviews → Human spot-check (first 10 guides) → Published

**Success Metric:**
- Zero safety-critical errors reach users in first 100 guides

### Proactive Known Issues Briefing

**Innovation:** Surface common problems BEFORE users encounter them, building trust through transparency.

**Architecture:**
- Three-source validation: Automated gathering agent + passive user capture + active user submissions
- AI aggregates patterns (not individual reports) → Human approves before publication
- Confidence scoring: High (>90%), Medium (60-89%), Low (<60%)
- Source credibility tiers: Tier 1 (NHTSA/TSBs auto-trusted), Tier 2 (forums require user validation), Tier 3 (anonymous/unverified auto-rejected)

**User Experience:**
- Known Issues briefing displays immediately after vehicle selection
- Progressive disclosure: Most critical issues first, full list expandable
- Transparency: "✓ Human-approved" badge, source citations, last reviewed date
- Framing: "Owners have reported..." (informational, not fear-mongering)

**Success Metrics:**
- Known Issues briefing open rate >40%
- Return visit within 7 days after briefed issue becomes relevant

### Step-Scoped Inline AI Chat with Visible Limits

**Innovation:** AI assistance available mid-task, scoped to current step, with clear free-tier limits to prevent abandonment.

**Architecture:**
- Free tier: 3 questions per guide (not per day), resets when starting new guide
- Premium tier: Unlimited questions
- Visible counter: "2 of 3 questions remaining" (transparency, no surprise limits)
- Step context passed to AI: Current step number, step instructions, inline tips already shown

**User Experience:**
- Opt-in only: User taps "Ask AI" on step (no latency for users who don't need it)
- AI has full context: Vehicle, guide, current step, previous questions in this session
- Static inline tips are primary (offline-available), AI chat is fallback for edge cases

**Success Metrics:**
- Inline AI chat tap rate >20%
- Completion rate lift with chat engagement vs without
- Mid-task abandonment <10% for free tier users (limit doesn't block completion)

### Offline-First PWA Architecture

**Innovation:** Guides work fully in garage with no internet, building trust when it matters most.

**Architecture:**
- Service Worker caches guides atomically (guide + images + inline tips)
- localStorage persistence for progress tracking (no account required)
- Cache status badge: "✓ Cached for offline" (user visibility and control)
- Graceful degradation: Inline AI chat disabled offline, inline tips remain functional

**User Experience:**
- User generates guide online → Service Worker auto-caches → Works offline in garage
- Progress persists across offline/online transitions (localStorage)
- Clear offline state indication: "No internet. AI chat unavailable. Inline tips work offline."
- Proactive caching UI: "Cache this guide for offline?" button

**Success Metrics:**
- Users proactively cache guides >50%
- Cached guide load <1s (no network dependency)
- Offline usage >30% of total guide executions

## Project-Type Requirements (Web Application)

### Progressive Web App (PWA) Requirements

**Installation:**
- Web app manifest (name, icons, theme color, display: standalone)
- Service Worker (offline functionality, cache management)
- Add to Home Screen prompt (iOS: explicit onboarding, Android: native browser prompt)

**Offline Capabilities:**
- Cached guides fully functional offline
- localStorage for progress tracking (no server dependency)
- Fallback UX for features requiring internet (AI chat, parts price lookup)

**Performance:**
- Lighthouse PWA score >90
- Time to Interactive (TTI): <3s on mid-range devices, <5s on low-end devices
- First Contentful Paint (FCP): <1.5s
- Service Worker registration: <500ms

**Cross-Platform:**
- Safari iOS (explicit "Add to Home Screen" onboarding due to PWA limitations)
- Chrome Android (native PWA prompt)
- Desktop browsers (responsive, works in browser or installed as PWA)

### Responsive Design Requirements

**Mobile-First:**
- Single-column layout for guides (no horizontal scrolling)
- 44×44px minimum touch targets (iOS Human Interface Guidelines)
- Large text (18px+ for guide steps, 16px+ for body text)
- High contrast (AAA 7:1 for safety callouts, AA 4.5:1 for body text)

**Breakpoints:**
- Mobile: 320px - 767px (primary target, garage use case)
- Tablet: 768px - 1023px (secondary, remote helper use case)
- Desktop: 1024px+ (tertiary, research/planning use case)

**Touch Optimization:**
- Swipe gestures for step navigation (optional, arrow buttons primary)
- No hover states required (touch-first interaction)
- Bottom-anchored primary actions (thumb-friendly zones)

### Deployment & Hosting Requirements

**Deployment Pipeline:**
- GitHub repository (version control, CI/CD triggers)
- Vercel deployment (zero-config, automatic deploys on push to main)
- Preview deployments for PRs (test before merge)

**Hosting:**
- Vercel free tier (generous limits for MVP traffic)
- CDN (Vercel Edge Network, global distribution)
- SSL/TLS (automatic, Vercel-managed certificates)

**Cost:**
- Hosting: $0/month (Vercel free tier)
- API calls: <$20/month (OpenAI/Anthropic for guide generation, AI chat)
- Total: <$20/month operational cost target

### AI-Maintainable Codebase Requirements

**Architecture Constraints:**
- Next.js App Router (latest stable patterns, Claude Code familiar)
- TypeScript (type safety, self-documenting)
- Component-based (reusable, modular, easy to understand)
- Minimal dependencies (reduce maintenance burden, fewer breaking changes)

**Code Quality:**
- Clear naming conventions (verbose > terse, `generateMaintenanceGuide` not `genGuide`)
- Inline comments for complex logic (explain WHY, not WHAT)
- README with architecture overview (AI can read and understand project structure)
- No magic numbers (constants with semantic names)

**Deployment:**
- One-command deploy: `git push` → Vercel auto-deploys
- No manual server configuration
- No database migrations (YMMT data via JSON, Known Issues via API)

### Accessibility Requirements

**WCAG 2.1 Level AA Compliance:**
- AAA contrast (7:1) for safety-critical callouts (garage visibility in low light)
- AA contrast (4.5:1) for body text
- Keyboard navigation (all interactive elements accessible via keyboard)
- Screen reader support (semantic HTML, ARIA labels where needed)

**Dark Garage Optimization:**
- Two-Phase Design Language:
  - Discovery Phase (index, search): Polished, calm, standard contrast
  - Execution Phase (guide steps): High-contrast, task-focused, 7:1 AAA contrast
- Screen brightness compensation (legible at 30% brightness)
- Large text (18px+ for guide steps, compensates for distance from phone)

**Low-End Device Support:**
- Performance targets: <5s TTI on Pixel 3a (low-end Android)
- Reduce JavaScript bundle (dynamic imports, code splitting)
- Graceful degradation (core functionality works without JS for first paint)

**Testing Protocol:**
- Manual testing on real devices: iPhone SE (iOS Safari), Pixel 3a (low-end Android), desktop Firefox
- Network throttling: Fast 3G, offline mode
- Battery saver mode enabled during testing
- Dark environment testing with screen brightness at 30%

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving + Experience MVP

MVP delivers: complete tasks offline in garage. Core features (six-agent validation, Known Issues briefing, offline reliability) launch day one. Supports all vehicles via AI-generated guides. Solo sustainable: ≤1 hour/week maintenance, <$20/month API costs.

**Resource Constraints:**
- Solo operator (Devon) + Claude Code as primary developer
- Vercel free tier hosting
- OpenAI API: $20/month target, $25/month hard cap
- 10-15 min/week maintenance

**Critical Path Dependencies:**
1. Six-agent validation pipeline (see Innovation Requirements > Six-Agent Validation Pipeline)
2. Semi-automated Known Issues gathering (see Innovation Requirements > Proactive Known Issues Briefing)
3. Offline-first PWA architecture (Service Worker, atomic caching)
4. Next.js deployment via GitHub + Vercel

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1: Uncertain Diagnoser (AI diagnosis → guide → parts → completion)
- Journey 2: Inexperienced Owner (YMMT selector, safety warnings, mechanic routing)
- Journey 3: Mid-Task Stuck User (inline tips offline, inline AI chat online)
- Journey 4: Aftermarket Discoverer (balanced OEM vs aftermarket presentation)
- Journey 5: Solo App Owner (AI-maintainable codebase, simple monitoring)
- Journey 6: Remote Helper (consistent cross-device layout)

**Must-Have Capabilities:**

*AI & Intelligence:*
- AI chat interface with symptom-based diagnosis (all vehicles)
- AI-generated maintenance guides with checklist UX (all vehicles)
- Six-agent validation pipeline (see Innovation Requirements > Six-Agent Validation Pipeline)
- AI Validation Agent (scores Known Issues: High/Medium/Low confidence with source credibility tiers)
- **Semi-automated Known Issues gathering agent** (internet-wide search: NHTSA TSBs, manufacturer recalls, forums, Reddit, automotive news)
- **Three-source Known Issues validation:**
  1. Automated gathering agent (batch/scheduled weekly)
  2. Passive user capture (initial AI chat symptoms, automatic, anonymous)
  3. Active user submissions ("Report an Issue" button, optional)
- **Cross-validation & aggregation:** AI aggregates patterns (not individual reports), human approves aggregated findings
- Step-scoped inline AI chat (free tier: 3 questions **per guide** with visible counter, Premium: unlimited)

*Data & Vehicle Support:*
- Cascading YMMT selector (all vehicle data via lightweight JSON)
- Known Issues briefing (all vehicles via semi-automated gathering + human approval)
- **Known Issues transparency:**
  - "✓ Human-approved" badge on each entry
  - Source citation: "Based on 47 owner reports, 3 TSBs, 1 recall"
  - Last reviewed date: "Reviewed Jan 2026"
  - Confidence framing: "Owners of your [YMMT] have reported..." (not "You will experience...")
- Inline parts recommendations (OEM + aftermarket, review-informed, balanced presentation)

*Offline & PWA:*
- Offline-first PWA (Service Worker, atomic guide caching, cache status badge)
- Safari iOS PWA workaround (explicit "Add to Home Screen" onboarding)
- Cached guide load <1s (no network dependency)

*Safety & Trust:*
- Safety warnings (severity-calibrated: High/Medium/Low risk classification)
- AAA contrast (7:1) for safety callouts (dark garage visibility)
- **Inline tips (critical path, not nice-to-have):**
  - Baked into guide at generation, offline-available
  - Must cover 90% of common stuck points (validated via adversarial test cases)
  - Content Quality Reviewer enforces coverage requirement
  - Inline AI chat is fallback for 10% edge cases

*UX & Design:*
- Two-Phase Design Language (Discovery Phase: polished/calm; Execution Phase: high-contrast/task-focused)
- Progress tracking (localStorage only, no account required)
- Responsive mobile-first design (44×44px touch targets, single-column guide layout)
- Performance targets: <3s TTI mid-range devices, <5s TTI low-end devices

*Monetization & Sustainability:*
- Ad-supported free tier (contextual ads, no cookies)
- AI-maintainable codebase (Claude Code can read, modify, deploy)
- Next.js App Router + Vercel deployment (zero-config, GitHub-triggered)

*Chaos Monkey Hardenings (Critical MVP Requirements):*
- **API cost protection:** Hard budget limit ($25/month cap), gathering agent cost controls (weekly batch, max 10 vehicles, max 50 results per vehicle), GPT-4o-mini for gathering agent
- **Spam defense:** Rate limiting (3 submissions/IP/24h, 1 per YMMT/IP/7d), AI spam filter, honeypot fields, passive capture prioritized over explicit submissions
- **Data quality gates:** 30-day cross-validation hold for MEDIUM confidence (agent-only findings without user validation), source credibility tiers (Tier 1: NHTSA/TSBs auto-trusted, Tier 2: forums require user validation, Tier 3: anonymous/unverified auto-rejected)
- **Scale prevention:** Automated aggregation (review patterns not individual reports), priority queue (sorted by confidence × user count × severity), batch review mode
- **Graceful degradation:** Multi-source redundancy (3-5 forums per vehicle), stable sources prioritized (NHTSA API, OEM databases), manual override always available

**What's NOT in MVP:**
- User accounts (localStorage-only for free tier at launch)
- Cloud sync
- Dashboard / mileage-based service tracking
- Service interval notifications
- Service history export
- Multi-vehicle garage
- Parts purchasing integration (search links only; affiliate partnerships in Phase 2)
- 3D model visualization (Phase 2.5 showcase, Phase 3 full feature)
- Community voting on parts quality
- Auto-approval for HIGH confidence Known Issues (Phase 2, after learning period)

### Post-MVP Features

**Phase 2 (Growth) — Retention & Depth**

*Goal: Users return, track history, sync across devices. Premium tier monetization.*

**Key Additions:**
- User accounts (frictionless magic link signup, no passwords)
- Premium subscription tier ($4.99/month):
  - Unlimited inline AI chat (vs. 3 questions per guide on free tier)
  - Cloud sync across devices
  - Vehicle dashboard with mileage-based service tracking
  - Service interval notifications (push where supported, email fallback)
  - Service history export (PDF for resale/insurance proof)
  - **Parts discounts** (5-10% cashback from affiliate revenue share)
  - **Priority access to new Known Issues** (Premium users see approved issues first)
- Anonymous parts feedback loop (one-tap flag inline with parts, rate-limited to prevent spam)
- One-click parts cart integration (affiliate partnerships: RockAuto, Amazon Auto, O'Reilly)
- **Auto-approval for HIGH confidence Known Issues** (after 2-3 months learning period, Devon spot-checks weekly)
- **Community voting on Known Issues accuracy** ("Is this accurate?" voting, >20% "No" triggers re-review)

**Revenue Diversification:**
- Ad revenue (already in MVP)
- Premium subscriptions (new)
- Affiliate partnerships for parts (new)

**Phase 2.5 (Post-Growth, Pre-Vision) — 3D Model Showcase**
- Static 3D model showcase on index page (Challenger only, existing asset)
- Demo of future vision (builds excitement, uses existing 3D model)
- WebGL/Three.js viewer (no guide integration yet, just showcase)

**Phase 3 (Expansion) — Platform & Scale**

*Goal: Advanced capabilities, platform features, expanded use cases.*

**Key Additions:**
- **3D model visualization** (part locations synced with checklist progress)
- **AI-powered 3D model generation** (Blender integration for all vehicles)
- Multi-vehicle garage (enthusiasts with multiple cars can track all in one dashboard)
- Community-validated aftermarket recommendations (users vote on parts quality, reliability ratings crowd-sourced)
- Advanced AI confidence scoring (transparent accuracy metrics, self-reported confidence on diagnoses)
- Expanded use cases (motorcycles, RVs, boats — if user demand validates)
- API for third-party integrations (repair shops, parts retailers, fleet management)

**Known Issues Architecture:** See Innovation Requirements > Proactive Known Issues Briefing for complete three-source validation model (automated gathering agent + passive user capture + active submissions), confidence scoring, and approval workflow.

### Architecture Decision Records (Summary)

**ADR-001: Semi-Automated Known Issues Gathering with Human-in-the-Loop**
- Decision: Gathering agent searches internet, AI scores findings, human approves before publication
- Rationale: Balances automation (speed, coverage) with human oversight (quality, trust)
- Time budget: 10-15 min/week (sustainable)

**ADR-002: Inline AI Chat Limit - 3 Questions Per Guide (Not Per Day)**
- Decision: Free tier gets 3 questions per guide, resets when starting new guide
- Rationale: Prevents mid-task abandonment (Jake persona), maintains Premium upgrade path
- Alternative rejected: 3 per day (causes mid-task blocks)

**ADR-003: Known Issues Data Sourcing Transparency**
- Decision: Display "✓ Human-approved" badge, source citations, last reviewed date
- Rationale: Trust signal for risk-averse users (Sarah persona)
- Impact: Builds credibility, reduces "Is this AI guessing?" concerns

**ADR-004: Inline Tips Quality Bar - Critical Path (Not Nice-to-Have)**
- Decision: Inline tips must cover 90% of common stuck points, validated via adversarial test cases
- Rationale: Offline-first architecture requires tips to work standalone, Marcus validated quality tips reduce AI chat need
- Owner: Content Quality Reviewer agent enforces coverage requirement

**ADR-005: MVP Phasing Rationale - Core Validation Over Feature Breadth**
- Decision: MVP prioritizes core validation (guide completion, Known Issues accuracy, offline reliability) over feature breadth (user accounts, dashboard, 3D models)
- Rationale: Solo sustainability, faster launch, clear validation signals
- Deferred to Phase 2: User accounts, cloud sync, Premium tier monetization

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation |
|---|---|
| Automated Known Issues gathering agent generates bad data | AI Validation Agent gates all findings. 30-day cross-validation hold for MEDIUM confidence. Source credibility tiers (NHTSA/TSBs trusted, forums require user validation). Human review for severe issues. Adversarial test cases. |
| Gathering agent scraping breaks when sources change structure | Prioritize stable data sources (NHTSA API, OEM databases = 80% weight, forums = 20%). Multi-source redundancy (3-5 forums per vehicle). Graceful degradation UX ("Data gathering in progress" vs. "No known issues"). Manual override always available. |
| Six-agent + gathering agent + inline AI chat = high API costs | Hard budget limit ($25/month cap). Gathering agent cost controls (weekly batch, max 10 vehicles, max 50 results, GPT-4o-mini). Inline AI chat rate limits (3 questions/guide free tier). Cost monitoring dashboard from day one. |
| Service Worker complexity on Safari iOS | Already mitigated via explicit onboarding flow with visual "Add to Home Screen" guide. Fallback UX if Service Worker fails to register. |
| Inline AI chat adds latency to guide experience | Opt-in only (user taps "Ask AI" on step). Static tips are default and offline-available. Chat is enhancement, not requirement. |
| Spam attacks on user submissions | Rate limiting (3/IP/24h, 1 per YMMT/IP/7d). AI spam filter. Honeypot fields. Passive capture prioritized (requires completing AI chat flow). |
| Approval dashboard overwhelmed at scale | Automated aggregation (review patterns not raw reports). Priority queue (sorted by confidence × user count × severity). Batch review mode. Auto-approve HIGH confidence in Phase 2. |

**Market Risks:**

| Risk | Mitigation |
|---|---|
| Users don't trust AI-generated Known Issues (vs. manually curated) | AI Validation Agent enforces quality bar. Transparency: "✓ Human-approved" badge, source citations, "Based on owner reports from [sources]". Tone framing: "Owners reported..." (not "You will experience..."). |
| Known Issues briefing feels like fear-mongering, not help | Progressive disclosure: most critical issues first, full list expandable. Severity-calibrated warnings prevent fatigue. Disclaimers: "This is not a recommendation. Consult a mechanic." |
| Ad revenue doesn't materialize in Month 2 | Validation path built in: if ad revenue <$1 by Month 2, pivot to Premium-first monetization. Free tier remains but Premium features expand. |

**Resource Risks:**

| Risk | Mitigation |
|---|---|
| Building gathering agent takes longer than MVP timeline allows | Architecture decision at MVP: data sources (NHTSA API priority), validation flow (human-in-the-loop), YMMT keying. If not ready: Manual Challenger Known Issues as fallback, gathering agent ships as Phase 1.5. |
| Solo operator can't maintain gathering agent + six-agent pipeline + product | AI-maintainability is non-negotiable. Automated aggregation reduces review time to 10-15 min/week. Vacation mode: Pause gathering agent, approve all HIGH confidence items before absence. Scheduled batch reviews (flexibility for travel/illness). |
| API costs exceed $20/month during MVP development or operation | Development uses rate-limited test keys. Production cost monitoring from day one. Hard cap at $25/month prevents runaway costs. If costs spike: Reduce gathering frequency, tighten inline chat limits, or shift to Premium-first model faster. |
| Solo operator unavailable (vacation/illness) | Vacation mode toggle. Batch review flexibility (can review every 2 weeks for 30 min instead of weekly 15 min). Auto-approve Tier 1 sources (NHTSA/TSBs) if unavailable >7 days. Phase 2: Trusted backup reviewer. |
| Published Known Issue causes damage (liability) | Disclaimers: "⚠️ This is not a recommendation. Consult a mechanic." Framing: "Owners have reported..." (informational, not advice). Warranty-voiding flags for modifications. General liability insurance. Phase 2: Community voting on accuracy, fast correction path. |

### Validation Metrics (MVP Success Criteria)

**Core Validation Signals (Month 1-2):**
1. **Guide completion rate >60%** - Users finish tasks they start
2. **Known Issues briefing open rate >40%** - Users engage with proactive warnings
3. **Ad revenue >$0 by Month 2** - Monetization path validates
4. **Operational cost <$20/month** - Sustainability proven
5. **Solo operator maintenance ≤1 hour/week** - Time budget holds under real load

**Innovation Validation Signals:**
- Six-agent pipeline: Zero safety-critical errors reach users in first 100 guides
- Proactive Known Issues: Return visit within 7 days after briefed issue becomes relevant
- Inline AI chat: Tap rate >20%, completion rate lift with chat engagement
- Offline-first: Users proactively cache guides, cache badge viewed >50%

**Cross-Validation Signals (Month 2-3):**
- User reports align with gathering agent findings (confidence validation)
- Known Issues with both sources (agent + users) have higher engagement
- Approval time stays within 10-15 min/week despite growing user base

## Functional Requirements

This section defines the capability contract for the entire product. Every feature implemented will trace back to these requirements. UX designers will design only what's listed here, architects will support only what's listed here, and epic breakdown will implement only what's listed here.

### Vehicle Identification & Diagnosis

- FR1: Users can describe vehicle symptoms via AI chat interface to receive diagnostic suggestions
- FR2: Users can select their vehicle via cascading YMMT selector (Year → Make → Model → Trim)
- FR3: Users can identify their vehicle by entering VIN for automatic YMMT lookup
- FR4: Users can identify their vehicle via photo upload (deferred to Phase 2 - see ADR-006)
- FR5: Users can scan or manually enter OBD-II error codes to validate AI diagnosis
- FR6: Users can see AI confidence level on diagnosis suggestions (High/Medium/Low)
- FR7: Users can view alternative diagnoses if initial suggestion doesn't match symptoms

**Architectural Decision - Vehicle Identification Strategy (ADR-006):**

**Decision:** VIN decode only (MVP), image recognition deferred to Phase 2

**Options Considered:**
- **Option A: VIN Decode Only (Selected)** - NHTSA vPIC API (free, 100% accurate, $0/month cost, low complexity)
- **Option B: Image Recognition (Deferred)** - GPT-4 Vision (60-80% accurate, $0.01-0.03/image = $60/month at scale, high complexity)

**Rationale:**
1. Solo sustainability constraint makes $60/month image costs prohibitive (3× total monthly budget)
2. VIN provides 100% accuracy vs 60-80% for image recognition
3. Parts compatibility requires VIN-level precision (trim/engine variations matter)
4. Image recognition better suited as Phase 2 premium feature when revenue supports costs
5. VIN lookup helpers ("Where do I find my VIN?") reduce user friction adequately for MVP

**Trade-offs Accepted:**
- User must locate and enter 17-character VIN (30 seconds friction)
- Image recognition convenience deferred until revenue model validates
- Clear upgrade path: Free tier (VIN), Premium tier (image recognition)

### Guide Generation & Execution

- FR8: Users can generate maintenance/repair guides for any vehicle via AI
- FR9: Users can view generated guides in checklist format with step-by-step instructions
- FR10: Users can mark individual steps as complete/incomplete
- FR11: Users can see progress indicator (e.g., "Step 5 of 12")
- FR12: Users can view estimated time to complete guide
- FR13: Users can pause guide progress and resume from same step later (see ADR-007)
- FR14: Users can navigate between steps (next, previous, jump to specific step)
- FR15: Users can view inline tips within each step for common stuck points
- FR16: Users can see visual indicators for safety warnings within guide steps
- FR17: Users can access step-scoped inline AI chat (3 questions per guide, free tier)
- FR18: Users can see visible counter for remaining AI questions (e.g., "2 of 3 questions remaining")

**Architectural Decision - Guide Pause/Resume Strategy (ADR-007):**

**Decision:** localStorage persistence (MVP), cloud sync deferred to Phase 2

**Options Considered:**
- **Option A: localStorage (Selected)** - Device-specific, survives browser close, $0 cost, works offline, low complexity
- **Option B: Cloud Sync** - Cross-device, requires auth + database, $5-20/month cost, high complexity
- **Option C: Hybrid** - localStorage primary + cloud backup, very high complexity (conflict resolution, offline-first patterns)

**Rationale:**
1. User behavior analysis: Repairs completed in single 20-60 minute sessions at vehicle
2. Switching devices mid-repair is rare (phone in garage → tablet in garage?)
3. localStorage is free, works offline (critical for garage), no auth friction
4. No GDPR concerns about storing progress server-side
5. Clear Phase 2 enhancement path: Cloud sync as premium feature

**Data Model:**
```javascript
localStorage.setItem('guide-progress-{guideId}', JSON.stringify({
  vehicleVIN: '1HGBH41JXMN109186',
  guideId: 'replace-brake-pads',
  currentStep: 7,
  totalSteps: 12,
  completedSteps: [1,2,3,4,5,6],
  timestamp: '2025-01-15T14:32:00Z',
  toolsChecked: true,
  partsGathered: true
}));
```

**Trade-offs Accepted:**
- User clears browser data → loses progress (acceptable, rare)
- User switches device → can't resume (acceptable, rare use case)
- localStorage full → degrade to session-only (acceptable, 5MB is plenty for 50+ paused guides)

### Known Issues Management

- FR19: Users can view Known Issues briefing immediately after vehicle selection
- FR20: Users can see confidence indicators on each Known Issue (High/Medium/Low)
- FR21: Users can view source citations for each Known Issue (e.g., "Based on 47 owner reports, 3 TSBs, 1 recall")
- FR22: Users can see "✓ Human-approved" badge on each published Known Issue
- FR23: Users can see last reviewed date for Known Issues (e.g., "Reviewed Jan 2026")
- FR24: Users can expand/collapse Known Issues list (progressive disclosure)
- FR25: Users can filter Known Issues by severity (High/Medium/Low)
- FR26: Users can report new issues via "Report an Issue" button (rate limited)
- FR27: System can passively capture symptom data during initial AI chat for Known Issues aggregation
- FR28: Admin can review aggregated Known Issues patterns (not individual reports) in dashboard

### Parts Recommendations

- FR29: Users can view inline parts recommendations within guide steps
- FR30: Users can see OEM vs aftermarket comparison with decision framework (see ADR-008)
- FR31: Users can view price ranges for OEM and aftermarket parts
- FR32: Users can see curated recommendations for quality aftermarket brands
- FR33: Users can access links to purchase parts (Amazon, RockAuto, specialty retailers)
- FR34: Users can see warranty impact warnings when aftermarket parts may void coverage
- FR35: Users can view part compatibility info specific to their vehicle's trim/engine

**Architectural Decision - OEM vs Aftermarket Comparison Strategy (ADR-008):**

**Decision:** Decision framework pattern (MVP), rich comparison table deferred to Phase 2

**Options Considered:**
- **Option A: Simple Price Comparison** - OEM $X vs Aftermarket $Y-Z (minimal data, lacks decision guidance)
- **Option B: Rich Comparison Table** - Price + warranty + specs + ratings (extensive data, high maintenance burden)
- **Option C: Decision Framework (Selected)** - "When to choose OEM" vs "When to choose aftermarket" with curated recommendations

**Rationale:**
1. Users need decision confidence, not exhaustive comparison (they're not shopping, they need guidance)
2. Rich table requires extensive data collection (noise levels? dust ratings? 10-15 hours/week maintenance) - unsustainable
3. Framework pattern scales from simple to complex parts without API dependency
4. Curated recommendations (2-3 quality brands) more valuable than 10+ unvetted options
5. Data sourcing: OEM prices (dealership sites), aftermarket ranges (RockAuto API free tier), recommendations (static curated list)

**Framework Example:**
```markdown
### Required Part: Front Brake Pads

**OEM (Honda Genuine): $85**
Choose OEM if:
- Vehicle is under warranty (aftermarket may void)
- You want exact factory specifications
- Budget is less important than peace of mind

**Aftermarket: $35-60**
Choose Aftermarket if:
- You want to save 40-65%
- Vehicle is out of warranty
- You're okay with equivalent (not identical) performance

**Recommendation:** Wagner ThermoQuiet or Akebono ProACT ($45-60) are reliable brands used by many shops.

[View on Amazon] [View on RockAuto]
```

**Trade-offs Accepted:**
- No exhaustive brand comparison (5+ brands with specs) in MVP
- Manual curation of recommendations (1-2 hours/week vs 10-15 for automated scraping)
- Affiliate revenue opportunity deferred to Phase 2 (framework still supports affiliate links)

### User Assistance & Upfront Disclosure

- FR36: Users can view Pre-Flight Modal before starting any guide (see ADR-009)
- FR37: Users can see required tools list with cost ranges and alternatives
- FR38: Users can see required parts list with OEM vs aftermarket pricing
- FR39: Users can see difficulty rating (⭐ scale, 1-5) before starting guide
- FR40: Users can see safety level indicator (DIY-Safe, DIY-Safe with Care, Requires Mechanic)
- FR41: Users can see time estimate for guide completion
- FR42: Users can expand/collapse sections in Pre-Flight Modal (progressive disclosure)
- FR43: Users can cancel guide start if they lack required tools/parts
- FR44: Users can acknowledge Pre-Flight Modal to proceed ("I Have Everything, Start" button)
- FR45: Users can access inline AI chat for step-specific questions (3 questions per guide, free tier)
- FR46: Users can see offline state indication when internet unavailable
- FR47: Users can view inline tips for stuck points (offline-available, baked into guide)

**Architectural Decision - Upfront Disclosure Strategy (ADR-009):**

**Decision:** Pre-Flight Modal (blocking, expandable sections) before guide starts

**Options Considered:**
- **Option A: Pre-Flight Modal (Selected)** - Blocking modal, forces review before starting, progressive disclosure (tools/parts/safety expandable)
- **Option B: Inline Guide Header** - Non-blocking, sticky header at top of guide, always visible but user can ignore
- **Option C: Separate Pre-Planning Phase** - Dedicated "Plan Your Repair" screen with gamified checklist

**Rationale:**
1. Safety-critical info requires forced acknowledgment (not skippable header)
2. Modal creates conscious pause: "Do I have what I need?" before commitment
3. Progressive disclosure balances thoroughness vs friction (collapsed by default, expand for details)
4. Proportional to task complexity: Simple tasks (2 items), complex tasks (15 items)
5. User explicitly opts in ("I Have Everything, Start") = commitment + safety

**Modal Structure:**
```
┌─────────────────────────────────────────┐
│  Before You Start: Replace Brake Pads   │
├─────────────────────────────────────────┤
│  Difficulty: ⭐⭐⭐ Intermediate          │
│  Time: 60-90 minutes                    │
│  Safety Level: ⚠️ DIY-Safe with Care   │
│                                         │
│  Required Tools (5)                [▼]  │
│  Required Parts (3)                [▼]  │
│  Safety Warnings (2)               [▼]  │
│                                         │
│  [Cancel]  [I Have Everything, Start]  │
└─────────────────────────────────────────┘
```

**Trade-offs Accepted:**
- Adds friction before starting guide (acceptable for safety)
- Requires metadata generation for every guide (tools, parts, difficulty, safety level)
- User can still proceed without actually having tools/parts (honor system, acceptable)

### Offline & Caching

- FR48: Users can cache guides for offline access via Service Worker
- FR49: Users can see cache status badge ("✓ Cached for offline")
- FR50: Users can proactively cache guides via "Cache this guide for offline?" button
- FR51: Users can view cached guides with <1s load time (no network dependency)
- FR52: Users can see clear offline state indication ("No internet. AI chat unavailable.")
- FR53: Users can access all guide steps and inline tips while offline
- FR54: Users can see graceful degradation messaging for online-only features (AI chat)
- FR55: System can store progress in localStorage across offline/online transitions

### Content Validation

- FR56: System can validate guide accuracy via six-agent pipeline (Mechanic AI, Safety Officer, Parts Specialist, Content Quality Reviewer)
- FR57: System can enforce inline tips coverage requirement (90% of common stuck points)
- FR58: System can assign safety warnings with severity levels (High/Medium/Low)
- FR59: System can validate part compatibility for user's specific trim/engine
- FR60: System can generate adversarial test cases to validate inline tips quality
- FR61: Admin can spot-check first 10 guides before full automation enabled

### Monitoring & Administration

- FR62: Admin can track API usage and costs in dashboard
- FR63: Admin can see cost breakdown by feature (guide generation, parts lookup, Known Issues gathering, inline AI chat)
- FR64: Admin can receive warnings at 50%, 75%, 100% of monthly budget
- FR65: System can enforce hard budget cap ($25/month) with automatic rate limiting
- FR66: Admin can review aggregated Known Issues patterns in dashboard (10-15 min/week)
- FR67: Admin can approve/reject Known Issues in batch mode
- FR68: Admin can see confidence scores and source citations for each Known Issue
- FR69: System can track solo operator time budget (target ≤1 hour/week maintenance)
- FR70: System can enable "vacation mode" to pause gathering agent and auto-approve Tier 1 sources
- FR71: Generated guides must follow standardized data model: `{ guideId, vehicleVIN, task, steps[], tools[], parts[], safetyWarnings[], estimatedTime, generatedAt }` for consistent localStorage structure and offline retrieval

**Architectural Decision - Cost Monitoring Strategy (ADR-010):**

**Decision:** Client-side estimation + anonymous IP-based rate limiting (MVP)

**Options Considered:**
- **Option A: Client-side Estimation + Anonymous Rate Limiting (Selected)** - Browser localStorage tracks estimates, Cloudflare Workers enforce IP limits, no auth required
- **Option B: Server-side Tracking** - Real API usage in database, requires auth, hard rate limits enforced server-side
- **Option C: Hybrid** - Client estimation + monthly server reconciliation, lighter than full tracking

**Rationale:**
1. Client-side estimation gives user visibility without auth complexity
2. Cloudflare IP-based rate limiting prevents abuse anonymously (no user tracking, no GDPR concerns)
3. Conservative limits protect solo budget: 10 guides/day × 30 days = 300 guides/month (sufficient for MVP validation)
4. Anonymous = no user accounts required = no privacy policy complexity for MVP
5. Educational UX: Cost dashboard turns monitoring into user optimization ("Learn about costs", "Cache guides offline")

**Architecture:**
```
┌─────────────┐
│   Client    │ Tracks estimated costs in localStorage
│  (Browser)  │ Shows warnings at 50%/75%/100%
└──────┬──────┘
       │ API calls
┌──────▼──────┐
│ Cloudflare  │ Anonymous rate limiting:
│  Workers    │ - 10 guide generations/day per IP
└──────┬──────┘ - 100 parts lookups/day per IP
       │       - 1000 cache hits/day per IP
┌──────▼──────┐
│   OpenAI    │ Actual API costs incurred here
│   Anthropic │
└─────────────┘
```

**Cost Dashboard UI:**
```
Monthly Usage (Estimated)
━━━━━━━━━━━━━━━━━━━━━ 65% ($13 / $20)

Guide generations:  8 × $0.20 = $1.60
Parts lookups:     42 × $0.02 = $0.84
Known issues:       3 × $0.15 = $0.45
Vehicle ID:        12 × $0.00 = $0.00 (free)

⚠️ Approaching monthly limit (75% warning)

[Learn about costs] [Optimize usage tips]
```

**Trade-offs Accepted:**
- Client-side estimation not exact (acceptable, user education not billing)
- IP-based limits can be evaded via VPN (acceptable, 90% abuse prevention sufficient for MVP)
- Daily limits reset (user blocked for 24h if exceeded, acceptable vs permanent bans)
- Phase 2 can add account-based tracking for premium tier

---

### Functional Requirements Summary

**Total:** 70 functional requirements across 8 capability areas

**Capability Area Breakdown:**
1. Vehicle Identification & Diagnosis (FR1-FR7) - 7 FRs
2. Guide Generation & Execution (FR8-FR18) - 11 FRs
3. Known Issues Management (FR19-FR28) - 10 FRs
4. Parts Recommendations (FR29-FR35) - 7 FRs
5. User Assistance & Upfront Disclosure (FR36-FR47) - 12 FRs
6. Offline & Caching (FR48-FR55) - 8 FRs
7. Content Validation (FR56-FR61) - 6 FRs
8. Monitoring & Administration (FR62-FR70) - 9 FRs

**Architecture Decision Records Integrated:**
- **ADR-006:** VIN decode only (MVP), image recognition (Phase 2) - Cost/accuracy trade-off
- **ADR-007:** localStorage pause/resume (MVP), cloud sync (Phase 2) - Single-device pattern
- **ADR-008:** Decision framework for parts comparison (MVP), rich table (Phase 2) - Solo sustainability
- **ADR-009:** Pre-Flight Modal with progressive disclosure - Safety-critical forced acknowledgment
- **ADR-010:** Client-side cost estimation + IP rate limiting - Anonymous protection without auth

**Coverage Validation:**
✅ All user journeys mapped to FRs
✅ All MVP capabilities have corresponding FRs
✅ All innovation requirements captured (six-agent validation, Known Issues, inline AI chat, offline-first)
✅ All architectural decisions documented with explicit trade-offs
✅ Solo sustainability constraint addressed in every architectural decision

**This FR list is now the binding capability contract. Any feature not listed here will not exist in the final product unless explicitly added.**

## Non-Functional Requirements

This section defines quality attributes that specify HOW WELL the system must perform. We only document NFRs that matter for AutoCare Companion - skipping categories that don't apply to prevent requirement bloat.

**Categories Included:** Performance, Reliability, Security, Accessibility, Integration
**Deliberately Excluded:** Scalability (solo sustainability constraint means we cap scale, not plan for it)

### Performance

**Response Time Requirements:**

- **NFR-P1:** Time to Interactive (TTI) must be <3 seconds on mid-range devices (iPhone 11, Pixel 4a) on 4G connection
- **NFR-P2:** Time to Interactive (TTI) must be <5 seconds on low-end devices (iPhone SE 2020, Pixel 3a) on Fast 3G connection
- **NFR-P3:** First Contentful Paint (FCP) must be <1.5 seconds on all supported devices
- **NFR-P4:** Cached guide load time must be <1 second (no network dependency)
- **NFR-P5:** Service Worker registration must complete within 500ms of page load
- **NFR-P6:** Step navigation (next/previous) must respond within 200ms
- **NFR-P7:** Inline AI chat response must begin streaming within 5 seconds of user question submission, with loading indicator shown immediately (display "AI is thinking..." with animated indicator during wait time)

**Resource Efficiency:**

- **NFR-P8:** Initial JavaScript bundle size must be <200KB (gzipped)
- **NFR-P9:** Guide page (cached) must be <500KB total (HTML + CSS + JS + images)
- **NFR-P10:** Service Worker must cache guides atomically (all-or-nothing, no partial caches)

**Performance Testing:**

- **NFR-P11:** Lighthouse Performance score must be ≥90 on mobile
- **NFR-P12:** Lighthouse PWA score must be ≥90
- **NFR-P13:** Performance must be validated on real devices: iPhone SE (iOS Safari), Pixel 3a (Chrome Android), desktop Firefox
- **NFR-P14:** Network throttling tests required: Fast 3G, offline mode
- **NFR-P15:** Battery saver mode must not degrade core functionality (guide viewing, step navigation)
- **NFR-P16:** Vercel Edge Functions must handle cold starts gracefully. First request <1s, subsequent requests <200ms
- **NFR-P17:** Development environment must support Service Worker testing via HTTPS localhost or ngrok tunnel

### Reliability

**Offline Functionality:**

- **NFR-R1:** Cached guides must remain functional for 30 days minimum without re-caching
- **NFR-R2:** Service Worker must successfully cache 99% of guides on first attempt (all-or-nothing atomic caching). Cache failures must display user-visible error with retry option and be logged for monitoring
- **NFR-R3:** Guide functionality must work 100% offline once cached (all steps, inline tips, progress tracking, step navigation)
- **NFR-R4:** Online-to-offline transitions must be seamless (no data loss, no UI breaking)
- **NFR-R5:** Offline-to-online transitions must restore online features (inline AI chat) within 5 seconds of reconnection

**Data Persistence:**

- **NFR-R6:** localStorage progress data must persist for 90 days minimum
- **NFR-R7:** Progress data must survive browser close, device restart, and airplane mode
- **NFR-R8:** If localStorage is full (5MB limit), system must gracefully degrade to session-only storage with user notification
- **NFR-R9:** Progress data corruption must be detected and recoverable (fallback to last known good state or fresh start with user notification)

**Error Handling:**

- **NFR-R10:** Service Worker registration failure must display fallback UX: "Offline mode unavailable. Guides will work online only."
- **NFR-R11:** Cache storage failure must not block guide generation (user can still use guides online)
- **NFR-R12:** API failures (OpenAI, NHTSA) must display user-friendly error messages with actionable next steps
- **NFR-R13:** System must handle network timeout gracefully (10-second timeout for API calls, then fallback behavior)

**Uptime & Availability:**

- **NFR-R14:** Static hosting (Vercel) must have 99.9% uptime (Vercel SLA)
- **NFR-R15:** Offline-first architecture means degraded experience (online features unavailable) is acceptable, but core guide viewing must always work once cached

### Security

**API Key Protection:**

- **NFR-S1:** OpenAI/Anthropic API keys must NEVER be exposed in client-side code
- **NFR-S2:** API calls must be proxied through Vercel Edge Functions or similar serverless functions to protect keys
- **NFR-S3:** API keys must be stored as environment variables, never committed to version control
- **NFR-S4:** Rate limiting must be enforced server-side (Cloudflare Workers or Vercel Edge): 10 guide generations/day per IP, 100 parts lookups/day per IP

**Data Privacy:**

- **NFR-S5:** Passive symptom capture must be anonymous (no IP addresses, no user identifiers stored)
- **NFR-S6:** User-submitted Known Issues must be anonymous by default (optional email for follow-up, not required)
- **NFR-S7:** No cookies for tracking (contextual ads only, no third-party tracking cookies)
- **NFR-S8:** GDPR/CCPA minimal compliance: No personal data collection in MVP, no need for consent banners (anonymous usage only)

**Attack Surface Mitigation:**

- **NFR-S9:** No authentication system in MVP = no password breaches, no session hijacking, no account takeover vectors
- **NFR-S10:** Client-side XSS protection via React's built-in escaping (use dangerouslySetInnerHTML only when necessary with sanitization)
- **NFR-S11:** HTTPS only (enforced by Vercel, no HTTP fallback)
- **NFR-S12:** Content Security Policy (CSP) headers deferred to Phase 2 (React's built-in XSS protection sufficient for MVP)

**Abuse Prevention:**

- **NFR-S13:** Honeypot fields in user submission forms to catch bots
- **NFR-S14:** AI spam filter pre-screens all user-submitted Known Issues before human review
- **NFR-S15:** Rate limiting on submissions: 3 submissions/IP/24h, 1 per YMMT/IP/7 days
- **NFR-S16:** AI spam filter must have <5% false positive rate on legitimate submissions, with manual override path for blocked users

### Accessibility

**WCAG 2.1 Compliance:**

- **NFR-A1:** All pages must meet WCAG 2.1 Level AA compliance minimum
- **NFR-A2:** Safety-critical callouts (jack safety, brake fluid warnings) must meet WCAG 2.1 Level AAA contrast (7:1 ratio)
- **NFR-A3:** Body text must meet WCAG 2.1 Level AA contrast (4.5:1 ratio minimum)
- **NFR-A4:** All interactive elements must be keyboard accessible (tab navigation, enter/space activation)
- **NFR-A5:** Screen reader support via semantic HTML and ARIA labels where needed

**Environmental Accessibility (Garage Use Case):**

- **NFR-A6:** Text must be legible at 30% screen brightness (dark garage testing protocol)
- **NFR-A7:** Touch targets must be ≥44×44px (iOS Human Interface Guidelines) to accommodate gloves and imprecise taps
- **NFR-A8:** Guide step text must be ≥18px font size (readable from arm's length, phone on workbench)
- **NFR-A9:** Primary actions must be bottom-anchored (thumb-friendly zone for one-handed operation with dirty hands)
- **NFR-A10:** High-contrast mode for Execution Phase (guide steps): AAA contrast throughout, task-focused design

**Testing & Tooling:**

- **NFR-A11:** Manual accessibility testing on real devices in simulated garage conditions (low light, distance, gloves) - Budget 1 full day for pre-launch testing
- **NFR-A12:** Automated accessibility testing via axe-core or Lighthouse Accessibility audit (score ≥90)
- **NFR-A13:** Dark environment testing with screen brightness at 30% to validate legibility
- **NFR-A14:** Design system must include contrast validation tooling to enforce WCAG AAA (7:1) for safety callouts at build time

### Integration

**External API Reliability:**

- **NFR-I1:** NHTSA vPIC API (VIN decode): 95% success rate expected, 10-second timeout, fallback to manual YMMT selector if API fails
- **NFR-I2:** OpenAI/Anthropic API (guide generation): 95% success rate expected under normal conditions, 30-second timeout, user-friendly retry mechanism for failures
- **NFR-I3:** RockAuto API (parts pricing): 90% success rate acceptable (free tier, no SLA), 5-second timeout, graceful degradation to "Price not available" if fails

**Fallback Behaviors:**

- **NFR-I4:** If NHTSA API is unavailable, system must automatically fallback to cascading YMMT selector (no user intervention required)
- **NFR-I5:** If OpenAI/Anthropic API is rate-limited, system must display: "High demand. Please try again in 1 minute." with retry button
- **NFR-I6:** If RockAuto API is unavailable, parts recommendations must display price ranges from cached data or "Price temporarily unavailable"
- **NFR-I7:** If all external APIs fail simultaneously, system must still allow browsing of cached guides (offline functionality unaffected)

**Rate Limiting & Cost Control:**

- **NFR-I8:** Client must respect OpenAI/Anthropic rate limits (enforced server-side via Vercel Edge Functions)
- **NFR-I9:** Hard budget cap of $25/month must be enforced via cost monitoring dashboard with automatic throttling at 100% budget
- **NFR-I10:** Admin dashboard shows budget status with manual weekly review (10 min/week). Email notifications deferred to Phase 2

**API Error Handling:**

- **NFR-I11:** 4xx errors (client errors) must display actionable user messages: "Invalid VIN format. Please check and try again."
- **NFR-I12:** 5xx errors (server errors) must display retry mechanism: "Service temporarily unavailable. Retry now?"
- **NFR-I13:** Network timeouts must not block UI (loading spinners with timeout handling, fallback to cached data when available)
- **NFR-I14:** API timeout failures must not block UI. User can cancel and retry without page reload
- **NFR-I15:** API cost dashboard must update daily with cost breakdown by feature (guide generation, AI chat, Known Issues gathering). Alert at 50%, 75%, 100% budget

### NFR Summary

**Total:** 66 non-functional requirements across 5 categories

**Category Breakdown:**
1. Performance (NFR-P1 to NFR-P17) - 17 NFRs
2. Reliability (NFR-R1 to NFR-R15) - 15 NFRs
3. Security (NFR-S1 to NFR-S16) - 16 NFRs
4. Accessibility (NFR-A1 to NFR-A14) - 14 NFRs
5. Integration (NFR-I1 to NFR-I15) - 15 NFRs

**Quality Attributes Validated:**
✅ All NFRs are specific and measurable
✅ Connected to user needs and business context
✅ Testable with clear success criteria
✅ Solo-sustainable for MVP execution
✅ Technically validated by Winston (Architect), Murat (Test Architect), and Barry (Solo Dev)

**Deliberately Excluded:** Scalability (solo sustainability constraint means we cap scale, not plan for it. Scale becomes a Phase 2 concern if MVP succeeds.)
