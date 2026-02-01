## WHAT IF SCENARIOS

**Technique Type:** Creative
**Goal:** Explore radical possibilities by questioning all constraints and assumptions
**Context:** Path C selected — full migration off Bubble to self-hosted custom build

---

### Scenario #1: What if AI wrote and maintained the entire app?
**Devon's Response:** "I like the idea of this and one of the reasons I use the BMAD method."

**Decision:** ✅ CONFIRMED — Core development strategy
**Implication:** Every architecture decision optimizes for AI maintainability. Simplest possible stack, clear file structure, strong documentation. Less magic = better AI agent performance.

---

### Scenario #2: What if there was no YMMT database at all?
**Devon's Response:** "I have a colleague that doesn't know her trim for her car, so the idea was the suggestion chips when she clicks Nissan, it only shows the models that are current to the year and make. And it dwindles down to trim in the same fashion to help with jogging her memory. I mean I guess this is a bit lazy to address this when she could enter her VIN or look at her registration."

**Decision:** ✅ REFRAMED — YMMT is a UX discovery pattern, not a database problem

**Critical Distinction:**
- What Devon originally built: A pre-populated database of every YMMT combination (maintenance burden)
- What Devon actually needs: A cascading selector UI that helps users discover/remember their vehicle

**Architecture Solution:**
The cascading selector (Year → Make → Model → Trim) needs structured vehicle data, but NOT a manually maintained database:

- **Challenger-first launch:** Trivial — Dodge → Challenger → [years + trims]. Hardcoded or tiny JSON.
- **Generalization (later):** Lightweight car data API or curated JSON file. NOT a hand-maintained database.
- **Fallback always exists:** VIN entry or free-text input for users who know their car

**The real insight:** The suggestion chip pattern serves users who don't know their trim (real use case). But the solution is a structured data source + cascading UI, not a manually curated database Devon updates by hand. AI can populate and maintain this data.

---

### Scenario #3: What if AutoCare Companion was a PWA with zero backend?
**Devon's Response:** "Sounds good."

**Decision:** ✅ APPROVED — Zero backend for MVP

**MVP Architecture (No Backend):**
| Feature | Client-Side Solution |
|---|---|
| AI Chat + Guides | Direct API call to OpenAI |
| Parts Links | Affiliate URLs constructed in browser |
| Progress Tracking | localStorage (guest) / IndexedDB (offline) |
| Offline Guides | Service Worker auto-caches generated guides |
| Vehicle Memory | localStorage saves YMMT + suggestion chip state |
| Cascading Selector | JSON data file loaded client-side |

**Backend added ONLY for:** Premium tier (cloud sync, accounts, multi-device) — Tier 2 feature.

---

### Scenario #4: What if you launched with just ONE car first?
**Devon's Response:** "That's the goal and advertise strictly on Challenger Forums and SEO as I discussed this with a colleague and about 800,000 consumers bought challengers, so that's a good base to work from. But with AI I feel like I can generalize."

**Branding Decision:** REBRAND TO **Auto.io** ✅
- Will NOT brand specifically to Challengers
- Keep Auto.io branding general
- Subtle Challenger silhouette somewhere in background design (inspired by Huly.io / Reflect.app design language)
- Challenger is the launch vehicle, not the identity

**Decision:** ✅ APPROVED — Challenger-first launch strategy with Auto.io branding

**Launch Strategy:**
- Brand: Auto.io
- Marketing: Challenger forums + SEO targeting Challenger-specific maintenance queries
- Design: Subtle Challenger silhouette as background design element (Easter egg feel)
- Market size: ~800,000 Challengers sold — viable niche
- Generalization: AI handles expansion to other vehicles naturally once pattern is proven

**Design Note:** The subtle silhouette approach aligns perfectly with the "stunning but simple" / glassmorphism design system from SCAMPER. A frosted-glass panel with a faint Challenger outline behind it would be on-brand.

---

### Scenario #5: What if the $134/month Bubble cost went to AI API budget instead?
**Devon's Response:** "Agreed"

**Decision:** ✅ APPROVED — Redirect budget to AI APIs

**Cost Reality:**
- Current: $134/month on Bubble (no-code platform)
- Projected MVP costs:
  - OpenAI API: ~$5-15/month at launch volume
  - Vercel hosting: $0 (free tier)
  - Domain: Already owned
  - **Total MVP: ~$5-15/month**
- Savings: $119-129/month immediately
- $134/month AI budget covers massive scale — hundreds of guides/day

---

### Scenario #6: What if AI hallucination was your biggest risk?
**Devon's Response:** "Currently I always tell users to reference Owner's manuals and confirm specs, parts, etc. In my guides on the top and bottom this disclaimer is there as well as in my terms and agreements."

**Decision:** ✅ APPROVED — Existing guardrails sufficient for MVP

**Current Guardrails:**
- Disclaimer at top and bottom of every guide
- Users told to reference owner's manual
- Terms and agreements cover liability

**Recommended Addition for Path C:**
- In-guide spec flagging: "⚠️ Verify this spec against your owner's manual"
- Simple AI prompt instruction — no extra engineering
- Doesn't slow down guide generation or kill agility

---

### Scenario #7: What if you could launch in 2 weeks?
**Devon's Response:**
- Day 1: AI Chat + Parts + Guides
- Deployment stack: Deferred to recommendation
- Cuts: N/A
- Realistic: Yes

**Decision:** ✅ APPROVED — 2-week launch is the target

**Recommended Tech Stack (Devon approved):**

| Layer | Choice | Cost | Why |
|---|---|---|---|
| Frontend | Next.js | $0 | AI-maintainable, PWA-ready, fast |
| Hosting | Vercel | $0 (free tier) | Instant deploys from GitHub, handles traffic |
| AI | OpenAI API | $5-15/mo | Best guide quality, well-documented |
| Database (MVP) | None | $0 | localStorage + IndexedDB handles everything |
| Database (Premium, later) | Supabase | $0 (free tier) | Auth + cloud sync when needed |
| Parts | Client-side URL gen | $0 | Affiliate links constructed in browser |
| Domain | autocarecompanion.com → auto.io | TBD | Rebrand pending |

**Stack Philosophy:** Zero backend. AI-maintainable. Add complexity only when PMF demands it.

---

## What If Scenarios — Final Summary

| # | Scenario | Decision | Key Outcome |
|---|---|---|---|
| 1 | AI writes the app | ✅ Core strategy | Optimize everything for AI maintainability |
| 2 | No YMMT database | ✅ Reframed | Cascading selector UX, not a database. AI populates data. |
| 3 | PWA zero backend | ✅ MVP architecture | Client-side everything until premium tier |
| 4 | One car first | ✅ Launch strategy | Challenger-first, Auto.io brand, subtle silhouette design |
| 5 | Redirect $134 to AI | ✅ Major savings | $5-15/mo vs $134/mo. Budget freed for scale. |
| 6 | Hallucination risk | ✅ Guardrails in place | Disclaimers + spec flagging layer |
| 7 | 2-week launch | ✅ Realistic target | Next.js + Vercel + OpenAI, zero backend |

---

## What If Scenarios Technique: COMPLETE ✅

---
