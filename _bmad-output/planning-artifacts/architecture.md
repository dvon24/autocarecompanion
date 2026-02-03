---
stepsCompleted: [1, 2]
inputDocuments:
  - 'c:\Users\devon\autocarecompanion\_bmad-output\planning-artifacts\prd.md'
workflowType: 'architecture'
project_name: 'AutoCare Companion'
user_name: 'Devon'
date: '2026-02-03'
---

# Architecture Decision Document - AutoCare Companion

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements: 71 Total**

The application requires 8 distinct capability areas:

1. **Vehicle Identification & Diagnosis (7 FRs):** AI chat symptom diagnosis, cascading YMMT selector, VIN decode via NHTSA API, OBD-II code interpretation, confidence scoring
2. **Guide Generation & Execution (11 FRs):** AI-generated step-by-step guides, checklist UX, progress tracking (pause/resume), inline tips, step-scoped AI chat (3 questions/guide free tier)
3. **Known Issues Management (10 FRs):** Proactive briefing after vehicle selection, confidence indicators, source citations, human-approved badges, passive symptom capture, admin review dashboard
4. **Parts Recommendations (7 FRs):** OEM vs aftermarket decision framework, price ranges, curated brand recommendations, warranty impact warnings, purchase links
5. **User Assistance & Upfront Disclosure (12 FRs):** Pre-Flight Modal (tools/parts/difficulty/safety), progressive disclosure, offline state indication
6. **Offline & Caching (8 FRs):** Service Worker atomic caching, cache status badge, <1s cached load time, 100% offline functionality
7. **Content Validation (6 FRs):** Six-agent validation pipeline, inline tips coverage requirement (90%), adversarial test cases
8. **Monitoring & Administration (10 FRs):** Cost tracking dashboard, budget warnings (50%/75%/100%), hard cap enforcement ($25/month), aggregated Known Issues review (10-15 min/week)

**Non-Functional Requirements: 66 Total**

Critical quality attributes that will drive architectural decisions:

- **Performance (17 NFRs):** TTI <3s mid-range/<5s low-end, FCP <1.5s, cached guides <1s, bundle <200KB gzipped, Lighthouse ≥90
- **Reliability (15 NFRs):** 99% cache success, 30-day offline persistence, seamless online/offline transitions, 90-day localStorage retention
- **Security (16 NFRs):** API keys never exposed client-side, server-side rate limiting (10 guides/day/IP), anonymous data capture, no auth system in MVP
- **Accessibility (14 NFRs):** WCAG 2.1 AA minimum, AAA (7:1) for safety callouts, 44×44px touch targets, 18px+ text, garage environment testing
- **Integration (15 NFRs):** NHTSA API (95% success), OpenAI/Anthropic (95% success), RockAuto (90% acceptable), automatic fallbacks

**Scale & Complexity:**

- **Primary domain:** Full-stack PWA with AI integration and content validation
- **Complexity level:** Medium-High
  - 137 total requirements with intricate dependencies
  - But deliberately designed for solo sustainability
- **Estimated architectural components:** 12-15 major components
  - Frontend: PWA shell, Service Worker, guide UI, chat interface, Pre-Flight Modal
  - Backend: Vercel Edge Functions (API proxy), cost monitoring
  - AI Services: Guide generation, six-agent validation, Known Issues gathering, inline chat
  - Data: localStorage (progress/cache), JSON (YMMT data), external APIs (NHTSA, RockAuto)

### Technical Constraints & Dependencies

**Hard Constraints:**
- **Cost:** <$20/month operational (AI APIs + hosting), $25/month absolute hard cap
- **Time:** ≤1 hour/week solo operator maintenance
- **Performance:** Must work on low-end devices (Pixel 3a, iPhone SE 2020)
- **Offline:** 100% guide functionality without internet after initial cache

**Technology Decisions Already Made (from PRD ADRs):**
- **ADR-006:** VIN decode only (NHTSA API free), no image recognition in MVP
- **ADR-007:** localStorage for progress (single-device), no cloud sync in MVP
- **ADR-008:** Decision framework for parts (curated), not rich comparison table
- **ADR-009:** Pre-Flight Modal with progressive disclosure (safety-critical)
- **ADR-010:** Client-side cost estimation + IP-based rate limiting (anonymous)

**External Dependencies:**
- NHTSA vPIC API (VIN decode) - free, government-maintained, 95% expected uptime
- OpenAI/Anthropic API (guide generation, validation, chat) - rate limited, cost-sensitive
- RockAuto API (parts pricing) - free tier, 90% acceptable reliability
- Vercel hosting (free tier) - 99.9% SLA
- Next.js App Router - AI-maintainable, TypeScript, component-based

**Platform Requirements:**
- PWA with Service Worker (offline-first architecture)
- Safari iOS support (explicit "Add to Home Screen" onboarding)
- Chrome Android (native PWA prompt)
- Desktop browsers (responsive fallback)

### Cross-Cutting Concerns Identified

**1. Offline-First Architecture (Highest Priority)**
- Service Worker must cache guides atomically (all-or-nothing)
- localStorage for progress tracking across sessions
- Graceful degradation when online features unavailable
- Clear offline/online state indication
- Cache status visibility and control

**2. Cost Control & Monitoring**
- Client-side estimation with visible dashboard
- Server-side rate limiting (Cloudflare Workers or Vercel Edge)
- Hard budget cap with automatic throttling
- Daily cost breakdowns by feature
- Gathering agent cost controls (weekly batch, max 10 vehicles, GPT-4o-mini)

**3. AI Agent Orchestration**
- Six-agent validation pipeline (sequential: Mechanic → Safety → Parts → Content Quality)
- Known Issues gathering agent (weekly batch, multi-source)
- Inline AI chat (step-scoped, rate-limited to 3 questions/guide)
- Cost-effective model selection (GPT-4o-mini for gathering, standard for generation)

**4. Solo Operator Scalability**
- Automated aggregation (review patterns, not individual reports)
- Priority queue (confidence × user count × severity)
- Batch review mode (approve all HIGH confidence)
- Vacation mode (pause gathering, auto-approve Tier 1 sources)
- Time budget tracking (<15 min/week Known Issues review)

**5. Security Without Authentication**
- No user accounts in MVP = no password/session/account vulnerabilities
- IP-based rate limiting for abuse prevention
- Anonymous data capture (no IP/email stored)
- API keys protected via server-side proxies
- GDPR/CCPA minimal compliance (no personal data)

**6. Accessibility in Harsh Environments**
- Two-Phase Design Language (Discovery: calm, Execution: high-contrast AAA)
- Screen brightness compensation (legible at 30%)
- Large touch targets (44×44px, glove-friendly)
- Large text (18px+, readable from arm's length)
- Bottom-anchored actions (dirty hands, one-handed operation)

**7. Progressive Web App (PWA) Architecture**
- Service Worker registration (<500ms)
- Web app manifest (standalone display mode)
- Add to Home Screen prompts (platform-specific)
- Lighthouse PWA score ≥90
- Installable on iOS/Android/Desktop

**8. Data Persistence Strategy**
- localStorage as primary (5MB limit, device-specific)
- Graceful degradation if full (session-only with notification)
- 90-day retention minimum
- Survives browser close, device restart, airplane mode
- Corruption detection with recovery fallback

