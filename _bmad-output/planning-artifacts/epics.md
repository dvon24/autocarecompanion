---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
workflowType: 'epics-and-stories'
project_name: 'Au7o'
---

# Au7o - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Au7o, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Vehicle Identification & Diagnosis (7 FRs)**
- FR1: Users can describe vehicle symptoms via AI chat interface to receive diagnostic suggestions
- FR2: Users can select their vehicle via cascading YMMT selector (Year → Make → Model → Trim)
- FR3: Users can identify their vehicle by entering VIN for automatic YMMT lookup
- FR4: Users can identify their vehicle via photo upload (deferred to Phase 2 - see ADR-006)
- FR5: Users can scan or manually enter OBD-II error codes to validate AI diagnosis
- FR6: Users can see AI confidence level on diagnosis suggestions (High/Medium/Low)
- FR7: Users can view alternative diagnoses if initial suggestion doesn't match symptoms

**Guide Generation & Execution (11 FRs)**
- FR8: Users can generate maintenance/repair guides for any vehicle via AI
- FR9: Users can view generated guides in checklist format with step-by-step instructions
- FR10: Users can mark individual steps as complete/incomplete
- FR11: Users can see progress indicator (e.g., "Step 5 of 12")
- FR12: Users can view estimated time to complete guide
- FR13: Users can pause guide progress and resume from same step later
- FR14: Users can navigate between steps (next, previous, jump to specific step)
- FR15: Users can view inline tips within each step for common stuck points
- FR16: Users can see visual indicators for safety warnings within guide steps
- FR17: Users can access step-scoped inline AI chat (3 questions per guide, free tier)
- FR18: Users can see visible counter for remaining AI questions (e.g., "2 of 3 questions remaining")

**Known Issues Management (10 FRs)**
- FR19: Users can view Known Issues briefing immediately after vehicle selection
- FR20: Users can see confidence indicators on each Known Issue (High/Medium/Low)
- FR21: Users can view source citations for each Known Issue
- FR22: Users can see "✓ Human-approved" badge on each published Known Issue
- FR23: Users can see last reviewed date for Known Issues
- FR24: Users can expand/collapse Known Issues list (progressive disclosure)
- FR25: Users can filter Known Issues by severity (High/Medium/Low)
- FR26: Users can report new issues via "Report an Issue" button (rate limited)
- FR27: System can passively capture symptom data during initial AI chat for Known Issues aggregation
- FR28: Admin can review aggregated Known Issues patterns in dashboard

**Parts Recommendations (7 FRs)**
- FR29: Users can view inline parts recommendations within guide steps
- FR30: Users can see OEM vs aftermarket comparison with decision framework
- FR31: Users can view price ranges for OEM and aftermarket parts
- FR32: Users can see curated recommendations for quality aftermarket brands
- FR33: Users can access links to purchase parts (Amazon, RockAuto, specialty retailers)
- FR34: Users can see warranty impact warnings when aftermarket parts may void coverage
- FR35: Users can view part compatibility info specific to their vehicle's trim/engine

**User Assistance & Upfront Disclosure (12 FRs)**
- FR36: Users can view Pre-Flight Modal before starting any guide
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

**Offline & Caching (8 FRs)**
- FR48: Users can cache guides for offline access via Service Worker
- FR49: Users can see cache status badge ("✓ Cached for offline")
- FR50: Users can proactively cache guides via "Cache this guide for offline?" button
- FR51: Users can view cached guides with <1s load time (no network dependency)
- FR52: Users can see clear offline state indication ("No internet. AI chat unavailable.")
- FR53: Users can access all guide steps and inline tips while offline
- FR54: Users can see graceful degradation messaging for online-only features (AI chat)
- FR55: System can store progress in localStorage across offline/online transitions

**Content Validation (6 FRs)**
- FR56: System can validate guide accuracy via six-agent pipeline
- FR57: System can enforce inline tips coverage requirement (90% of common stuck points)
- FR58: System can assign safety warnings with severity levels (High/Medium/Low)
- FR59: System can validate part compatibility for user's specific trim/engine
- FR60: System can generate adversarial test cases to validate inline tips quality
- FR61: Admin can spot-check first 10 guides before full automation enabled

**Monitoring & Administration (10 FRs)**
- FR62: Admin can track API usage and costs in dashboard
- FR63: Admin can see cost breakdown by feature
- FR64: Admin can receive warnings at 50%, 75%, 100% of monthly budget
- FR65: System can enforce hard budget cap ($25/month) with automatic rate limiting
- FR66: Admin can review aggregated Known Issues patterns in dashboard
- FR67: Admin can approve/reject Known Issues in batch mode
- FR68: Admin can see confidence scores and source citations for each Known Issue
- FR69: System can track solo operator time budget (target ≤1 hour/week maintenance)
- FR70: System can enable "vacation mode" to pause gathering agent
- FR71: Generated guides must follow standardized data model for localStorage structure

### NonFunctional Requirements

**Performance (17 NFRs)**
- NFR-P1: TTI <3 seconds on mid-range devices (iPhone 11, Pixel 4a) on 4G
- NFR-P2: TTI <5 seconds on low-end devices (iPhone SE 2020, Pixel 3a) on Fast 3G
- NFR-P3: FCP <1.5 seconds on all supported devices
- NFR-P4: Cached guide load time <1 second
- NFR-P5: Service Worker registration within 500ms
- NFR-P6: Step navigation response within 200ms
- NFR-P7: Inline AI chat response begin streaming within 5 seconds
- NFR-P8: Initial JS bundle <200KB gzipped
- NFR-P9: Guide page (cached) <500KB total
- NFR-P10: Service Worker atomic caching (all-or-nothing)
- NFR-P11: Lighthouse Performance score ≥90 on mobile
- NFR-P12: Lighthouse PWA score ≥90
- NFR-P13: Performance validated on real devices
- NFR-P14: Network throttling tests required (Fast 3G, offline)
- NFR-P15: Battery saver mode support
- NFR-P16: Edge Functions cold start <1s, subsequent <200ms
- NFR-P17: Dev environment Service Worker testing via HTTPS

**Reliability (15 NFRs)**
- NFR-R1: Cached guides functional for 30 days minimum
- NFR-R2: Service Worker 99% cache success rate
- NFR-R3: 100% offline functionality once cached
- NFR-R4: Seamless online-to-offline transitions
- NFR-R5: Online features restore within 5 seconds of reconnection
- NFR-R6: localStorage persist for 90 days minimum
- NFR-R7: Progress data survives browser close, device restart, airplane mode
- NFR-R8: Graceful degradation if localStorage full
- NFR-R9: Data corruption detection and recovery
- NFR-R10: Service Worker registration failure fallback UX
- NFR-R11: Cache failure doesn't block online guide usage
- NFR-R12: API failures show user-friendly error messages
- NFR-R13: Network timeout handling (10-second timeout)
- NFR-R14: 99.9% uptime via Vercel
- NFR-R15: Core guide viewing always works once cached

**Security (16 NFRs)**
- NFR-S1: API keys never exposed client-side
- NFR-S2: API calls proxied through Vercel Edge Functions
- NFR-S3: API keys stored as environment variables
- NFR-S4: Server-side rate limiting (10 guides/day per IP)
- NFR-S5: Anonymous passive symptom capture
- NFR-S6: Anonymous user submissions by default
- NFR-S7: No tracking cookies
- NFR-S8: GDPR/CCPA minimal compliance (no personal data)
- NFR-S9: No authentication = reduced attack surface
- NFR-S10: XSS protection via React escaping
- NFR-S11: HTTPS only
- NFR-S12: CSP headers deferred to Phase 2
- NFR-S13: Honeypot fields for bot prevention
- NFR-S14: AI spam filter for submissions
- NFR-S15: Rate limiting on submissions
- NFR-S16: <5% false positive rate on spam filter

**Accessibility (14 NFRs)**
- NFR-A1: WCAG 2.1 Level AA minimum
- NFR-A2: AAA contrast (7:1) for safety callouts
- NFR-A3: AA contrast (4.5:1) for body text
- NFR-A4: Keyboard accessibility for all interactive elements
- NFR-A5: Screen reader support
- NFR-A6: Legible at 30% screen brightness
- NFR-A7: Touch targets ≥44×44px
- NFR-A8: Guide step text ≥18px
- NFR-A9: Bottom-anchored primary actions
- NFR-A10: High-contrast execution phase
- NFR-A11: Manual accessibility testing in garage conditions
- NFR-A12: Automated accessibility testing (axe-core/Lighthouse ≥90)
- NFR-A13: Dark environment testing at 30% brightness
- NFR-A14: Contrast validation tooling for safety callouts

**Integration (15 NFRs)**
- NFR-I1: NHTSA API 95% success rate, 10s timeout, fallback to YMMT
- NFR-I2: OpenAI/Anthropic API 95% success, 30s timeout, retry mechanism
- NFR-I3: RockAuto API 90% success, 5s timeout, graceful degradation
- NFR-I4: Automatic fallback to YMMT if NHTSA unavailable
- NFR-I5: Rate limit messaging with retry button
- NFR-I6: Cached price fallback if RockAuto unavailable
- NFR-I7: Cached guides work if all APIs fail
- NFR-I8: Server-side API rate limit enforcement
- NFR-I9: Hard budget cap $25/month with automatic throttling
- NFR-I10: Admin dashboard for budget status
- NFR-I11: 4xx errors show actionable messages
- NFR-I12: 5xx errors show retry mechanism
- NFR-I13: Network timeouts don't block UI
- NFR-I14: API timeout failures allow cancel and retry
- NFR-I15: Daily cost dashboard updates with breakdown

### Additional Requirements

**From Architecture - Starter Template:**
- Initialize project using: `npx create-next-app@latest autocare-companion --yes`
- Install core dependencies: `@ducanh2912/next-pwa @headlessui/react zod`
- Configure Service Worker with @ducanh2912/next-pwa v10.2.9
- Deploy to Vercel with free tier

**From Architecture - Design System:**
- Two-Phase Design Language (Discovery: calm, Execution: high-contrast AAA)
- Typography scale: Guide steps 18px, body 16px, safety callouts 20px bold
- Touch targets: 44×44px minimum
- Headless UI for accessible primitives (Dialog, Disclosure)

**From Architecture - Epic Sequencing:**
- Epic 0: Foundation (project init, deploy to Vercel)
- Epic 0.5: Design System (UI primitives, Two-Phase Design Language)
- Epic 1: Core Value Validation (Journey 1: symptom → diagnosis → guide)
- Epic 2: Offline Validation (Service Worker, localStorage quota)
- Epic 3+: Scale & Perfect (E2E tests, performance optimization)

**From Architecture - Implementation Patterns:**
- 23 patterns preventing AI agent conflicts
- Naming: camelCase variables, PascalCase components, UPPER_SNAKE_CASE constants
- Async functions: fetch*/load* = async, get*/calculate* = sync
- No barrel files (index.ts re-exports)
- Direct imports: `import { Guide } from '@/types/guide'`
- localStorage helpers with Zod validation (never direct localStorage.setItem)
- Status enum pattern for loading states
- All tests in separated `tests/` directory

**From Architecture - API Architecture:**
- Hybrid approach: Edge Functions (rate limiting, proxies) + Serverless (AI processing)
- Runtime declaration via `export const runtime = 'edge'` or `'nodejs'`
- Redis pipelining for rate limiting + cost tracking

**From Architecture - State Management:**
- Unified AppContext (guide, cache, costs)
- Custom hooks: useGuideContext(), useCacheContext(), useCostContext()
- Immutable state updates with spread operators

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | AI symptom chat for diagnosis |
| FR2 | Epic 1 | YMMT cascading selector |
| FR3 | Epic 1 | VIN decode via NHTSA |
| FR4 | Phase 2 | Photo upload (deferred per ADR-006) |
| FR5 | Epic 1 | OBD code entry/validation |
| FR6 | Epic 1 | Diagnosis confidence level |
| FR7 | Epic 1 | Alternative diagnoses |
| FR8 | Epic 1 | Generate guide via AI |
| FR9 | Epic 1 | Checklist format display |
| FR10 | Epic 1 | Mark steps complete/incomplete |
| FR11 | Epic 1 | Progress indicator |
| FR12 | Epic 3 | Time estimates |
| FR13 | Epic 3 | Pause/resume from same step |
| FR14 | Epic 3 | Step navigation (next/prev/jump) |
| FR15 | Epic 3 | Inline tips for stuck points |
| FR16 | Epic 3 | Safety warning indicators |
| FR17 | Epic 3 | Inline AI chat (3 questions) |
| FR18 | Epic 3 | Remaining questions counter |
| FR19 | Epic 4 | Known Issues briefing |
| FR20 | Epic 4 | Confidence indicators |
| FR21 | Epic 4 | Source citations |
| FR22 | Epic 4 | Human-approved badge |
| FR23 | Epic 4 | Last reviewed date |
| FR24 | Epic 4 | Expand/collapse list |
| FR25 | Epic 4 | Filter by severity |
| FR26 | Epic 4 | Report new issues |
| FR27 | Epic 4 | Passive symptom capture |
| FR28 | Epic 4 | Admin review patterns |
| FR29 | Epic 5 | Inline parts recommendations |
| FR30 | Epic 5 | OEM vs aftermarket framework |
| FR31 | Epic 5 | Price ranges |
| FR32 | Epic 5 | Curated brand recommendations |
| FR33 | Epic 5 | Purchase links |
| FR34 | Epic 5 | Warranty impact warnings |
| FR35 | Epic 5 | Vehicle-specific compatibility |
| FR36 | Epic 1 | Pre-Flight Modal |
| FR37 | Epic 1 | Required tools list |
| FR38 | Epic 1 | Required parts list |
| FR39 | Epic 1 | Difficulty rating |
| FR40 | Epic 1 | Safety level indicator |
| FR41 | Epic 1 | Time estimate display |
| FR42 | Epic 1 | Expand/collapse Pre-Flight sections |
| FR43 | Epic 1 | Cancel guide start |
| FR44 | Epic 1 | "I Have Everything, Start" button |
| FR45 | Epic 3 | Step-specific AI assistance |
| FR46 | Epic 2 | Offline state indication |
| FR47 | Epic 3 | Offline-available inline tips |
| FR48 | Epic 2 | Cache guides via Service Worker |
| FR49 | Epic 2 | Cache status badge |
| FR50 | Epic 2 | Proactive cache button |
| FR51 | Epic 2 | <1s cached guide load |
| FR52 | Epic 2 | Clear offline messaging |
| FR53 | Epic 2 | All steps/tips available offline |
| FR54 | Epic 2 | Graceful degradation messaging |
| FR55 | Epic 2 | localStorage persistence |
| FR56 | Epic 6 | Six-agent validation pipeline |
| FR57 | Epic 6 | 90% tips coverage requirement |
| FR58 | Epic 6 | Safety warnings with severity |
| FR59 | Epic 6 | Part compatibility validation |
| FR60 | Epic 6 | Adversarial test cases |
| FR61 | Epic 6 | Admin spot-check first 10 guides |
| FR62 | Epic 7 | API usage and cost tracking |
| FR63 | Epic 7 | Cost breakdown by feature |
| FR64 | Epic 7 | Budget warnings |
| FR65 | Epic 7 | Hard budget cap with rate limiting |
| FR66 | Epic 7 | Known Issues pattern review |
| FR67 | Epic 7 | Batch approve/reject |
| FR68 | Epic 7 | Confidence scores and citations |
| FR69 | Epic 7 | Solo operator time tracking |
| FR70 | Epic 7 | Vacation mode |
| FR71 | Epic 7 | Standardized guide data model |

**Coverage Summary:**
- Epic 0: Foundation (no FRs - technical prerequisite)
- Epic 1: 19 FRs (FR1-FR3, FR5-FR11, FR36-FR44)
- Epic 2: 9 FRs (FR46, FR48-FR55)
- Epic 3: 9 FRs (FR12-FR18, FR45, FR47)
- Epic 4: 10 FRs (FR19-FR28)
- Epic 5: 7 FRs (FR29-FR35)
- Epic 6: 6 FRs (FR56-FR61)
- Epic 7: 10 FRs (FR62-FR71)
- Phase 2: 1 FR (FR4 - photo upload)

**Phase 2 Candidates (Post-MVP):**
- FR4: Photo upload for vehicle identification (deferred per ADR-006)
- SEO AI Agent: Meta tags, Open Graph, JSON-LD structured data, sitemap generation
- Motorcycle support: Vehicle-agnostic architecture enables low-friction expansion
- **Total: 70 FRs covered + 1 deferred**

## Epic List

### Epic 0: Foundation
**Goal:** Establish project infrastructure and deployment pipeline

**User Value:** Enables all future development and validates deployment works

**FRs Covered:** None (technical prerequisite)

**Scope:**
- Initialize project using `npx create-next-app@latest autocare-companion --yes`
- Install core dependencies: `@ducanh2912/next-pwa @headlessui/react zod`
- Configure Service Worker with @ducanh2912/next-pwa v10.2.9 (disabled in dev)
- Deploy to Vercel
- Set up Two-Phase Design Language utilities (Tailwind config)
- Configure project structure per Architecture document

**Deliverable:** Working Vercel deployment with basic project structure and design system primitives

---

### Epic 1: Core Diagnostic Journey
**Goal:** Users can describe symptoms, get a diagnosis, and complete a repair guide

**User Value:** Complete end-to-end journey from problem to solution - validates core product value

**FRs Covered:** FR1-FR3, FR5-FR11, FR36-FR44 (19 FRs)

**Scope:**
- AI symptom chat interface for diagnosis (FR1)
- Vehicle identification via YMMT selector and VIN decode (FR2, FR3)
- OBD code entry for diagnosis validation (FR5)
- Diagnosis confidence levels and alternatives (FR6, FR7)
- Guide generation via AI (FR8)
- Checklist format with step completion and progress (FR9, FR10, FR11)
- Complete Pre-Flight Modal with tools, parts, difficulty, safety (FR36-FR44)

**Deliverable:** User Journey 1 complete - symptom → diagnosis → Pre-Flight → guide completion

---

### Epic 2: Offline-First Garage Mode
**Goal:** Users can execute guides in their garage without internet

**User Value:** Validates the offline-first assumption - guides work where users need them most

**FRs Covered:** FR46, FR48-FR55 (9 FRs)

**Scope:**
- Offline state indication in UI (FR46)
- Service Worker caching for guides (FR48)
- Cache status badge ("✓ Cached for offline") (FR49)
- Proactive cache button (FR50)
- <1s cached guide load time (FR51)
- Clear offline messaging (FR52)
- All steps and tips available offline (FR53)
- Graceful degradation for online-only features (FR54)
- localStorage persistence across offline/online transitions (FR55)

**Deliverable:** Validated offline-first PWA - test in real garage conditions

---

### Epic 3: Enhanced Guide Experience
**Goal:** Users have a polished, full-featured guide execution experience

**User Value:** Delightful guide experience with AI assistance and safety guidance

**FRs Covered:** FR12-FR18, FR45, FR47 (9 FRs)

**Scope:**
- Time estimates for guide completion (FR12)
- Pause/resume from same step (FR13)
- Step navigation (next/previous/jump) (FR14)
- Inline tips for stuck points (FR15, FR47)
- Safety warning visual indicators (FR16)
- Inline AI chat with 3 questions limit (FR17, FR45)
- Remaining questions counter (FR18)

**Deliverable:** Complete, polished guide execution with AI assistance

---

### Epic 4: Known Issues Intelligence
**Goal:** Users receive proactive briefings about known problems with their vehicle

**User Value:** Proactive intelligence that builds trust and prevents surprises

**FRs Covered:** FR19-FR28 (10 FRs)

**Scope:**
- Known Issues briefing after vehicle selection (FR19)
- Confidence indicators (High/Medium/Low) (FR20)
- Source citations for each issue (FR21)
- Human-approved badge (FR22)
- Last reviewed date (FR23)
- Expand/collapse list (FR24)
- Filter by severity (FR25)
- Report new issues (rate limited) (FR26)
- Passive symptom capture for aggregation (FR27)
- Admin review of aggregated patterns (FR28)

**Deliverable:** Proactive vehicle intelligence system

---

### Epic 5: Parts Decision Support
**Goal:** Users can confidently choose parts with OEM vs aftermarket guidance

**User Value:** Confident parts purchasing without leaving the app

**FRs Covered:** FR29-FR35 (7 FRs)

**Scope:**
- Inline parts recommendations in guide steps (FR29)
- OEM vs aftermarket decision framework (FR30)
- Price ranges (FR31)
- Curated aftermarket brand recommendations (FR32)
- Purchase links (Amazon, RockAuto) (FR33)
- Warranty impact warnings (FR34)
- Vehicle-specific compatibility info (FR35)

**Deliverable:** Complete parts decision support system

---

### Epic 6: Content Quality & Validation
**Goal:** System ensures guide accuracy through six-agent validation pipeline

**User Value:** Trustworthy, validated content users can rely on

**FRs Covered:** FR56-FR61 (6 FRs)

**Scope:**
- Six-agent validation pipeline (Mechanic AI, Safety Officer, Parts Specialist, Content Quality) (FR56)
- 90% inline tips coverage requirement (FR57)
- Safety warnings with severity levels (FR58)
- Part compatibility validation (FR59)
- Adversarial test cases for tips quality (FR60)
- Admin spot-check first 10 guides (FR61)

**Deliverable:** Automated content validation with human oversight

---

### Epic 7: Admin Dashboard & Monitoring
**Goal:** Solo operator can sustainably manage costs and content (≤1 hour/week)

**User Value:** Solo sustainability - manage everything efficiently

**FRs Covered:** FR62-FR71 (10 FRs)

**Scope:**
- API usage and cost tracking dashboard (FR62)
- Cost breakdown by feature (FR63)
- Budget warnings at 50%/75%/100% (FR64)
- Hard budget cap ($25/month) with automatic rate limiting (FR65)
- Known Issues pattern review (FR66)
- Batch approve/reject Known Issues (FR67)
- Confidence scores and citations display (FR68)
- Solo operator time budget tracking (FR69)
- Vacation mode (FR70)
- Standardized guide data model (FR71)

**Deliverable:** Complete admin dashboard for solo-sustainable operations

---

## Epic 0: Foundation

Establish project infrastructure and deployment pipeline. This technical prerequisite enables all future development and validates that deployment works before building features.

### Story 0.1: Project Initialization & Core Dependencies

As a **developer**,
I want **a properly initialized Next.js 15 project with all core dependencies installed**,
So that **I have a solid foundation to build the AutoCare Companion application**.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the project is initialized using `npx create-next-app@latest autocare-companion --yes`
**Then** a Next.js 15 project with App Router is created
**And** TypeScript is configured with strict mode enabled
**And** ESLint is configured per Next.js defaults

**Given** the initialized project
**When** core dependencies are installed (`@ducanh2912/next-pwa@10.2.9`, `@headlessui/react`, `zod`)
**Then** all dependencies install without errors
**And** `package.json` reflects the correct versions

**Given** the project structure
**When** the folder structure is created per Architecture document
**Then** the following directories exist: `src/app`, `src/components`, `src/lib`, `src/hooks`, `src/types`
**And** a placeholder `page.tsx` displays "AutoCare Companion" text

---

### Story 0.2: Two-Phase Design Language Setup

As a **developer**,
I want **Tailwind CSS configured with the Two-Phase Design Language tokens**,
So that **UI components can use consistent Discovery and Execution phase styling**.

**Acceptance Criteria:**

**Given** the initialized Next.js project
**When** Tailwind CSS configuration is extended
**Then** Discovery phase colors are defined (calming blues, soft grays)
**And** Execution phase colors are defined (high-contrast AAA compliant)
**And** Touch target utilities are available (min 44x44px)

**Given** the design tokens are configured
**When** a component uses `bg-discovery-primary` or `bg-execution-primary`
**Then** the correct phase-specific colors are applied
**And** the build completes without Tailwind errors

**Given** the typography configuration
**When** text styles are applied
**Then** Discovery phase uses relaxed, readable typography
**And** Execution phase uses high-contrast, large touch-friendly text

---

### Story 0.3: PWA Configuration

As a **developer**,
I want **Service Worker configured with @ducanh2912/next-pwa**,
So that **the application can be installed and function offline in future epics**.

**Acceptance Criteria:**

**Given** @ducanh2912/next-pwa is installed
**When** `next.config.js` is configured with PWA settings
**Then** Service Worker is disabled in development mode (`disable: process.env.NODE_ENV === 'development'`)
**And** Service Worker is enabled in production builds

**Given** a production build is created
**When** `npm run build` completes
**Then** Service Worker files are generated in the public directory
**And** `manifest.json` is created with app name "AutoCare Companion"
**And** no build errors occur

**Given** the PWA manifest
**When** the app is loaded in a browser
**Then** the manifest is properly linked in `<head>`
**And** basic PWA metadata (name, icons placeholder, theme color) is present

---

### Story 0.4: Vercel Deployment

As a **developer**,
I want **the application deployed to Vercel**,
So that **I can verify the production build works and have a live URL for testing**.

**Acceptance Criteria:**

**Given** the project is pushed to a Git repository
**When** Vercel is connected to the repository
**Then** automatic deployments are configured for the main branch

**Given** the Vercel deployment runs
**When** the build completes
**Then** no build errors occur
**And** the site is accessible at a Vercel URL

**Given** the deployed application
**When** the production URL is visited
**Then** the placeholder page displays correctly
**And** Service Worker is registered (visible in browser DevTools)
**And** PWA install prompt is available in supported browsers

---

## Epic 1: Core Diagnostic Journey

Users can describe symptoms, get a diagnosis, and complete a repair guide. This epic validates the core product value - the complete end-to-end journey from problem to solution.

### Story 1.1: Vehicle Selection via YMMT

As a **vehicle owner**,
I want **to select my vehicle using Year, Make, Model, and Trim dropdowns**,
So that **I receive accurate guides specific to my exact vehicle configuration**.

**Acceptance Criteria:**

**Given** the user is on the vehicle selection screen
**When** the page loads
**Then** the Year dropdown displays years from current year down to 1990
**And** Make, Model, Trim dropdowns are disabled until prior selection is made

**Given** the user selects a Year
**When** the Year value is confirmed
**Then** the Make dropdown becomes enabled
**And** the Make dropdown shows only makes with vehicles for that year

**Given** the user selects Year and Make
**When** the Make value is confirmed
**Then** the Model dropdown becomes enabled
**And** the Model dropdown shows only models for that year and make

**Given** the user selects Year, Make, and Model
**When** the Model value is confirmed
**Then** the Trim dropdown becomes enabled
**And** the Trim dropdown shows available trims (or "Base" if none)

**Given** the user completes all YMMT selections
**When** the selections are confirmed
**Then** the vehicle is stored in application state
**And** the screen fades into the AI symptom chat interface
**And** the selected vehicle is displayed as context at the top of the chat

**Implementation Note - YMMT Data Source Strategy:**
- **Year/Make/Model**: NHTSA vPIC API provides comprehensive data (free, government-maintained)
- **Trim**: NHTSA does not include trim data. Requires AI Gathering Agent to research and curate trim levels per model from manufacturer sites, Edmunds, KBB, etc.
- **MVP**: Static JSON with sample data (2020-2025, major makes) for UI validation
- **Production**: Hybrid approach - NHTSA API for YMM + AI-gathered trim data stored in database

---

### Story 1.2: VIN Decode Integration

As a **vehicle owner**,
I want **to enter my VIN and have my vehicle automatically identified**,
So that **I don't have to manually select Year/Make/Model/Trim**.

**Acceptance Criteria:**

**Given** the user is on the vehicle selection screen
**When** they choose "Enter VIN" option
**Then** a 17-character VIN input field is displayed
**And** input validation prevents non-alphanumeric characters

**Given** the user enters a valid 17-character VIN
**When** they submit the VIN
**Then** the NHTSA API is called to decode the VIN
**And** a loading state is displayed during the API call

**Given** the NHTSA API returns successfully
**When** the VIN decodes to valid YMMT data
**Then** the Year, Make, Model, and Trim fields are auto-populated
**And** the user sees confirmation of their decoded vehicle

**Given** the NHTSA API fails or times out (>10 seconds)
**When** the error is detected
**Then** the user sees a friendly error message
**And** the user is prompted to use manual YMMT selection instead

**Given** the VIN decodes but Trim is ambiguous
**When** multiple trims are possible
**Then** the Trim dropdown shows the options
**And** the user manually selects their specific trim

---

### Story 1.3: AI Symptom Chat Interface

As a **vehicle owner**,
I want **to describe my vehicle's symptoms in natural language via chat**,
So that **AI can help diagnose the problem based on my description**.

**Acceptance Criteria:**

**Given** the user has selected their vehicle
**When** the screen transitions to the diagnosis chat
**Then** the AI chat interface fades in smoothly
**And** the selected vehicle (Year Make Model Trim) is shown as a compact header
**And** the user can tap the vehicle header to change selection if needed
**And** a welcome message prompts them to describe their symptoms

**Given** the user types a symptom description
**When** they send the message
**Then** the message appears in the chat history
**And** a loading indicator shows AI is processing
**And** the AI response streams in within 5 seconds (NFR-P7)

**Given** the AI is analyzing symptoms
**When** it needs clarifying information
**Then** the AI asks follow-up questions
**And** the conversation continues until diagnosis is possible

**Given** the AI has enough information
**When** it determines a likely diagnosis
**Then** the AI presents the diagnosis with confidence level
**And** the user can proceed to view diagnosis details

**Given** the user is offline
**When** they try to use the chat
**Then** a clear message indicates AI chat requires internet
**And** previously cached guides remain accessible

---

### Story 1.4: OBD Code Entry & Validation

As a **vehicle owner**,
I want **to enter OBD-II codes from my scanner**,
So that **the diagnosis can be validated against known error codes**.

**Acceptance Criteria:**

**Given** the user is in the diagnosis flow
**When** they choose to enter OBD codes
**Then** an input field accepts OBD-II code format (P0XXX, B0XXX, C0XXX, U0XXX)
**And** input validation shows error for invalid formats

**Given** the user enters a valid OBD code
**When** they submit the code
**Then** the code is validated against known OBD-II code database
**And** the code description is displayed (e.g., "P0300 - Random/Multiple Cylinder Misfire Detected")

**Given** the user enters multiple OBD codes
**When** they add additional codes
**Then** all codes are listed with their descriptions
**And** the user can remove individual codes

**Given** OBD codes are entered
**When** combined with symptom description
**Then** the AI diagnosis incorporates the OBD data
**And** diagnosis confidence may increase if codes align with symptoms

**Given** the user has no OBD codes
**When** they choose to skip this step
**Then** diagnosis proceeds based on symptoms alone
**And** the system notes that OBD data was not provided

---

### Story 1.5: Diagnosis Results Display

As a **vehicle owner**,
I want **to see the AI diagnosis with confidence level and alternatives**,
So that **I understand how certain the diagnosis is and can consider other possibilities**.

**Acceptance Criteria:**

**Given** the AI has completed diagnosis
**When** the diagnosis results are displayed
**Then** the primary diagnosis is shown prominently
**And** confidence level is displayed as High/Medium/Low with visual indicator

**Given** the diagnosis has High confidence
**When** displayed to the user
**Then** a green indicator shows "High Confidence"
**And** the user is encouraged to proceed with the guide

**Given** the diagnosis has Medium or Low confidence
**When** displayed to the user
**Then** a yellow/orange indicator shows the confidence level
**And** the user is advised to verify before proceeding

**Given** alternative diagnoses exist
**When** the results are displayed
**Then** up to 3 alternative diagnoses are shown
**And** each alternative has its own confidence level
**And** the user can select an alternative to generate that guide instead

**Given** the user wants to proceed with a diagnosis
**When** they select "Generate Guide"
**Then** the selected diagnosis is used for guide generation
**And** the flow proceeds to guide generation

---

### Story 1.6: Guide Generation via AI

As a **vehicle owner**,
I want **an AI-generated repair guide for my specific vehicle and diagnosis**,
So that **I have step-by-step instructions to fix my vehicle**.

**Acceptance Criteria:**

**Given** the user has confirmed a diagnosis
**When** they request guide generation
**Then** the AI generates a guide specific to their YMMT and diagnosis
**And** a loading state with progress indication is shown
**And** generation completes within 30 seconds (NFR-I2)

**Given** the guide is generated
**When** the data is returned
**Then** the guide follows the standardized data model (FR71)
**And** the guide includes: title, steps[], tools[], parts[], difficulty, safetyLevel, timeEstimate

**Given** the guide data model
**When** steps are generated
**Then** each step has: number, instruction, tips[], safetyWarnings[]
**And** inline tips cover common stuck points

**Given** the guide generation fails
**When** an API error occurs
**Then** a user-friendly error message is displayed
**And** the user can retry generation
**And** the error is logged for debugging

**Given** the guide is successfully generated
**When** the user proceeds
**Then** the Pre-Flight Modal is displayed
**And** the guide data is stored in application state

---

### Story 1.7: Pre-Flight Modal

As a **vehicle owner**,
I want **to review tools, parts, difficulty, and safety info before starting a guide**,
So that **I know if I'm prepared to complete the repair**.

**Acceptance Criteria:**

**Given** the guide has been generated
**When** the Pre-Flight Modal opens
**Then** it displays: required tools, required parts, difficulty rating, safety level, time estimate
**And** the modal uses progressive disclosure (collapsed sections by default)

**Given** the tools section is displayed
**When** the user expands it
**Then** each tool shows: name, purpose, cost range, alternatives if available
**And** the user can see what they need to gather

**Given** the parts section is displayed
**When** the user expands it
**Then** each part shows: name, OEM vs aftermarket options, price ranges
**And** the user understands what to purchase

**Given** the difficulty rating is displayed
**When** shown to the user
**Then** it uses a 1-5 star scale with description
**And** lower ratings indicate beginner-friendly tasks

**Given** the safety level is displayed
**When** shown to the user
**Then** one of three levels is shown: "DIY-Safe", "DIY-Safe with Care", "Requires Mechanic"
**And** "Requires Mechanic" level shows a prominent warning

**Given** the user reviews the Pre-Flight info
**When** they decide to proceed
**Then** they can click "I Have Everything, Start" button
**And** the guide execution interface opens

**Given** the user is not prepared
**When** they decide not to proceed
**Then** they can click "Cancel" to return to diagnosis
**And** the guide remains available to start later

---

### Story 1.8: Guide Execution Interface

As a **vehicle owner**,
I want **to execute the guide as a checklist with step completion tracking**,
So that **I can follow along and track my progress through the repair**.

**Acceptance Criteria:**

**Given** the user starts the guide from Pre-Flight
**When** the guide execution interface loads
**Then** the first step is displayed prominently
**And** a progress indicator shows "Step 1 of N"

**Given** a step is displayed
**When** the user views it
**Then** the step instruction is shown in large, readable text (18px minimum)
**And** any safety warnings are prominently highlighted
**And** inline tips are accessible via expansion

**Given** the user completes a step
**When** they mark it complete
**Then** a checkbox or button marks the step as done
**And** the progress indicator updates (e.g., "Step 2 of N")
**And** the next step is displayed

**Given** the user needs to revisit a step
**When** they mark a completed step as incomplete
**Then** the step is unchecked
**And** they can re-do that step

**Given** the user is partway through the guide
**When** they view progress
**Then** the progress indicator shows current position (e.g., "Step 5 of 12")
**And** completed steps are visually distinguished from remaining steps

**Given** the user completes all steps
**When** the final step is marked complete
**Then** a completion message is displayed
**And** the user can return to the home screen

---

## Epic 2: Offline-First Garage Mode

Users can execute guides in their garage without internet. This epic validates the offline-first assumption - guides work where users need them most.

### Story 2.1: Guide Caching via Service Worker

As a **vehicle owner**,
I want **my guides cached by the Service Worker**,
So that **I can access them instantly without network dependency**.

**Acceptance Criteria:**

**Given** a guide has been generated and viewed
**When** the Service Worker intercepts the guide data
**Then** the complete guide (steps, tips, safety warnings) is cached
**And** caching uses atomic all-or-nothing strategy (NFR-P10)

**Given** a guide is cached
**When** the user loads that guide again
**Then** the guide loads in <1 second (NFR-P4, FR51)
**And** no network request is made for cached content

**Given** the Service Worker attempts to cache a guide
**When** caching succeeds
**Then** the cache success rate is ≥99% (NFR-R2)
**And** cached data is valid for 30 days minimum (NFR-R1)

**Given** caching fails partway through
**When** the atomic cache detects incomplete data
**Then** the partial cache is discarded
**And** the guide remains available online
**And** caching can be retried

---

### Story 2.2: Cache Status Badge & Proactive Caching

As a **vehicle owner**,
I want **to see which guides are cached and manually cache guides for offline use**,
So that **I can prepare guides before going to the garage**.

**Acceptance Criteria:**

**Given** a guide is fully cached
**When** the user views the guide list or guide header
**Then** a "✓ Cached for offline" badge is displayed (FR49)
**And** the badge is visually distinct (e.g., green checkmark)

**Given** a guide is not cached
**When** the user views the guide
**Then** no cache badge is shown
**And** a "Cache for offline" button is available (FR50)

**Given** the user taps "Cache for offline"
**When** they are online
**Then** a loading indicator shows caching progress
**And** on success, the cache badge appears
**And** a confirmation message is shown

**Given** the user taps "Cache for offline"
**When** they are offline
**Then** an error message explains caching requires internet
**And** the button remains available for later

---

### Story 2.3: Offline State Detection & Indication

As a **vehicle owner**,
I want **to clearly see when I'm offline**,
So that **I understand which features are available**.

**Acceptance Criteria:**

**Given** the device loses network connectivity
**When** the app detects the offline state
**Then** an offline indicator is displayed prominently (FR46)
**And** the indicator uses clear messaging (e.g., "You're offline")

**Given** the device regains network connectivity
**When** the app detects the online state
**Then** the offline indicator is removed within 5 seconds (NFR-R5)
**And** online features become available again

**Given** the user is offline
**When** they view the app
**Then** clear messaging indicates "No internet connection" (FR52)
**And** available offline features are still accessible

**Given** the network status changes
**When** transitioning between online/offline
**Then** the transition is seamless (NFR-R4)
**And** no data is lost during the transition

---

### Story 2.4: Offline Guide Access

As a **vehicle owner**,
I want **to access all guide steps and tips while offline**,
So that **I can complete repairs in my garage without internet**.

**Acceptance Criteria:**

**Given** the user has a cached guide
**When** they open it while offline
**Then** all guide steps are accessible (FR53)
**And** all inline tips are accessible (FR53)
**And** all safety warnings are visible

**Given** the user is executing a cached guide offline
**When** they navigate between steps
**Then** navigation works normally
**And** step completion can be marked
**And** progress is tracked

**Given** the user completes steps offline
**When** they mark steps complete/incomplete
**Then** the changes are persisted locally
**And** the guide state is maintained

**Given** a guide is cached
**When** accessed offline
**Then** 100% of guide content is available (NFR-R3)
**And** the experience matches online guide execution

---

### Story 2.5: Graceful Degradation for Online Features

As a **vehicle owner**,
I want **clear messaging when online-only features are unavailable**,
So that **I understand why certain features don't work offline**.

**Acceptance Criteria:**

**Given** the user is offline
**When** they try to access AI chat
**Then** a clear message displays "AI chat unavailable offline" (FR54)
**And** the message explains internet is required

**Given** the user is offline
**When** they try to generate a new guide
**Then** a message explains guide generation requires internet
**And** they are directed to cached guides instead

**Given** the user is offline
**When** they view the Pre-Flight modal
**Then** static content (tools, parts, difficulty) is available
**And** any online-only content shows appropriate messaging

**Given** the user is offline
**When** online-only features are attempted
**Then** error messages are user-friendly (NFR-R12)
**And** alternative actions are suggested where possible

---

### Story 2.6: localStorage Persistence

As a **vehicle owner**,
I want **my guide progress saved in localStorage**,
So that **my progress survives app restarts and offline/online transitions**.

**Acceptance Criteria:**

**Given** the user marks steps complete in a guide
**When** progress is saved
**Then** progress is stored in localStorage using typed helpers with Zod validation
**And** data follows the standardized guide data model (FR71)

**Given** the user closes the app mid-guide
**When** they reopen the app
**Then** their progress is restored from localStorage (FR55)
**And** they can resume from the same step (related: FR13)

**Given** the user transitions between offline and online
**When** the network state changes
**Then** localStorage data persists across the transition (FR55)
**And** no progress is lost

**Given** localStorage data exists
**When** loaded by the application
**Then** data is validated with Zod schema
**And** corrupt data triggers recovery mechanism (NFR-R9)

**Given** localStorage approaches quota limits
**When** new data needs to be saved
**Then** graceful degradation messaging is shown (NFR-R8)
**And** oldest cached guides may be cleared with user consent

**Given** localStorage data
**When** stored on the device
**Then** data persists for 90 days minimum (NFR-R6)
**And** survives browser close, device restart, airplane mode (NFR-R7)

---

## Epic 3: Enhanced Guide Experience

Users have a polished, full-featured guide execution experience. This epic adds time estimates, navigation controls, tips, safety indicators, and AI assistance for a delightful guide experience.

### Story 3.1: Time Estimates Display

As a **vehicle owner**,
I want **to see estimated time to complete the guide**,
So that **I can plan my repair session accordingly**.

**Acceptance Criteria:**

**Given** a guide has been generated
**When** the user views the Pre-Flight modal
**Then** a time estimate is displayed (e.g., "Estimated time: 45 minutes")
**And** the estimate is prominent and easy to read

**Given** the user is executing a guide
**When** they view the guide header
**Then** the total estimated time is visible
**And** remaining time could be shown based on progress

**Given** the time estimate data
**When** displayed in the guide
**Then** the format is user-friendly (e.g., "1-2 hours" or "30-45 min")
**And** estimates account for skill level disclaimers if needed

---

### Story 3.2: Pause & Resume Guide Progress

As a **vehicle owner**,
I want **to pause my guide and resume from the exact same step later**,
So that **I can take breaks without losing my place**.

**Acceptance Criteria:**

**Given** the user is partway through a guide
**When** they leave the app or navigate away
**Then** their current step position is saved automatically
**And** completed steps remain marked

**Given** the user returns to a previously started guide
**When** they open the guide
**Then** they are returned to their last active step (FR13)
**And** a "Resume from Step X" message is shown

**Given** the user has paused a guide
**When** they choose to restart from the beginning
**Then** an option to "Start Over" is available
**And** selecting it resets progress with confirmation

**Given** the user pauses mid-guide
**When** they close the browser or restart their device
**Then** progress is persisted via localStorage
**And** resuming works correctly after reopening

---

### Story 3.3: Step Navigation Controls

As a **vehicle owner**,
I want **to navigate between steps using next, previous, and jump controls**,
So that **I can move through the guide at my own pace**.

**Acceptance Criteria:**

**Given** the user is viewing a step
**When** they want to proceed
**Then** a "Next" button advances to the next step (FR14)
**And** the button is touch-friendly (44x44px minimum)

**Given** the user is viewing a step (not the first)
**When** they want to go back
**Then** a "Previous" button returns to the prior step (FR14)
**And** the button is easily accessible

**Given** the user wants to jump to a specific step
**When** they tap the progress indicator or step list
**Then** a step overview/list is shown (FR14)
**And** they can tap any step to jump directly to it

**Given** the user navigates between steps
**When** moving forward or backward
**Then** navigation response is within 200ms (NFR-P6)
**And** transitions are smooth

**Given** the user is on the first step
**When** viewing navigation controls
**Then** the "Previous" button is disabled or hidden
**And** only "Next" is available

**Given** the user is on the last step
**When** viewing navigation controls
**Then** the "Next" button shows "Complete" or similar
**And** tapping it completes the guide

---

### Story 3.4: Inline Tips for Stuck Points

As a **vehicle owner**,
I want **to see helpful tips when I get stuck on a step**,
So that **I can overcome common obstacles without external help**.

**Acceptance Criteria:**

**Given** a step has associated tips
**When** the user views the step
**Then** an expandable "Tips" section is visible (FR15)
**And** the section is collapsed by default

**Given** the user expands the tips section
**When** tips are displayed
**Then** each tip addresses a common stuck point
**And** tips are concise and actionable

**Given** the guide is cached for offline
**When** the user accesses tips offline
**Then** all tips are available without network (FR47)
**And** tips function identically to online mode

**Given** the AI generates the guide
**When** tips are included
**Then** 90% of common stuck points have tips (FR57)
**And** tips are validated for quality

**Given** a step has no tips
**When** the user views the step
**Then** no tips section is shown
**And** the UI remains clean

---

### Story 3.5: Safety Warning Visual Indicators

As a **vehicle owner**,
I want **prominent visual indicators for safety warnings**,
So that **I don't miss critical safety information**.

**Acceptance Criteria:**

**Given** a step has safety warnings
**When** the user views the step
**Then** safety warnings are displayed prominently (FR16)
**And** warnings use high-contrast AAA styling (7:1 ratio per NFR-A2)

**Given** a safety warning is critical
**When** displayed to the user
**Then** it uses distinct visual treatment (e.g., red/orange border, warning icon)
**And** the warning text is at least 20px bold (per Architecture)

**Given** multiple safety warnings exist on a step
**When** displayed together
**Then** each warning is clearly separated
**And** severity is indicated if applicable

**Given** the user is in a dark environment
**When** viewing safety warnings
**Then** warnings remain legible at 30% screen brightness (NFR-A6)
**And** contrast meets AAA requirements

**Given** a step has no safety warnings
**When** the user views the step
**Then** no warning section is displayed
**And** the step appears standard

---

### Story 3.6: Inline AI Chat (Step-Scoped)

As a **vehicle owner**,
I want **to ask AI questions about the current step**,
So that **I can get help when the instructions aren't clear**.

**Acceptance Criteria:**

**Given** the user is executing a guide online
**When** they view a step
**Then** an "Ask AI" button is available (FR17, FR45)
**And** the button is clearly visible

**Given** the user has questions remaining
**When** they tap "Ask AI"
**Then** a chat interface opens scoped to the current step
**And** the AI has context about the step and vehicle

**Given** the user sends a question
**When** the AI responds
**Then** the response streams in within 5 seconds (NFR-P7)
**And** the response is relevant to the current step

**Given** the user has used 3 questions on this guide
**When** they try to ask another question
**Then** a message indicates the limit is reached (FR17)
**And** they cannot send additional questions

**Given** the user has questions remaining
**When** they view the chat interface
**Then** a counter shows remaining questions (e.g., "2 of 3 remaining") (FR18)
**And** the counter updates after each question

**Given** the user is offline
**When** they try to access AI chat
**Then** a message indicates AI chat requires internet
**And** the "Ask AI" button is disabled or shows offline state

---

## Epic 4: Known Issues Intelligence

Users receive proactive briefings about known problems with their vehicle. This epic builds trust through proactive intelligence that prevents surprises.

### Story 4.1: Known Issues Briefing Display

As a **vehicle owner**,
I want **to see known issues for my vehicle immediately after selection**,
So that **I'm aware of common problems before I start diagnosing**.

**Acceptance Criteria:**

**Given** the user has selected their vehicle (YMMT or VIN)
**When** the vehicle is confirmed
**Then** a Known Issues briefing is displayed (FR19)
**And** issues are specific to the user's year/make/model/trim

**Given** known issues exist for the vehicle
**When** the briefing is displayed
**Then** issues are shown in a list format
**And** the list is collapsed by default (progressive disclosure) (FR24)

**Given** the user wants to see more detail
**When** they expand an issue
**Then** the full issue description is shown
**And** related information (citations, confidence) is visible

**Given** no known issues exist for the vehicle
**When** the briefing would be displayed
**Then** a message indicates "No known issues found for this vehicle"
**And** the user can proceed to symptom chat

**Given** the user wants to skip the briefing
**When** they dismiss it
**Then** they can proceed to the symptom chat
**And** the briefing remains accessible later if needed

---

### Story 4.2: Confidence & Trust Indicators

As a **vehicle owner**,
I want **to see confidence levels, source citations, approval badges, and review dates for each issue**,
So that **I can trust the information is accurate and current**.

**Acceptance Criteria:**

**Given** a known issue is displayed
**When** the user views the issue
**Then** a confidence indicator shows High/Medium/Low (FR20)
**And** the indicator uses color coding (green/yellow/orange)

**Given** a known issue has source citations
**When** expanded or viewed in detail
**Then** source citations are displayed (FR21)
**And** citations include recognizable sources (TSBs, forums, recalls)

**Given** a known issue has been human-approved
**When** displayed to the user
**Then** a "✓ Human-approved" badge is visible (FR22)
**And** the badge builds trust in the information

**Given** a known issue has been reviewed
**When** the user views the issue
**Then** a "Last reviewed" date is shown (FR23)
**And** the date format is user-friendly (e.g., "Reviewed Jan 2026")

**Given** an issue has low confidence or old review date
**When** displayed to the user
**Then** appropriate caveats are shown
**And** the user understands the limitation

---

### Story 4.3: Severity Filtering

As a **vehicle owner**,
I want **to filter known issues by severity**,
So that **I can focus on the most critical problems first**.

**Acceptance Criteria:**

**Given** multiple known issues exist for a vehicle
**When** the user views the Known Issues list
**Then** filter options for High/Medium/Low severity are available (FR25)
**And** filters are easily accessible (e.g., toggle buttons or dropdown)

**Given** the user selects "High" severity filter
**When** the filter is applied
**Then** only High severity issues are displayed
**And** the filter state is visually indicated

**Given** the user selects multiple severity levels
**When** the filters are applied
**Then** issues matching any selected severity are shown
**And** the user can see a combined view

**Given** no issues match the selected filter
**When** the filter is applied
**Then** a message indicates "No issues found with selected severity"
**And** the user can clear or adjust filters

**Given** the user clears all filters
**When** the view resets
**Then** all known issues are displayed again
**And** the default view is restored

---

### Story 4.4: User Issue Reporting

As a **vehicle owner**,
I want **to report a new issue I've discovered with my vehicle**,
So that **I can help other owners with the same vehicle**.

**Acceptance Criteria:**

**Given** the user is viewing Known Issues for their vehicle
**When** they want to report a new issue
**Then** a "Report an Issue" button is available (FR26)
**And** the button is clearly visible

**Given** the user taps "Report an Issue"
**When** the report form opens
**Then** they can describe the issue in a text field
**And** optional fields for severity and symptoms are available

**Given** the user submits an issue report
**When** the submission is processed
**Then** the report is queued for admin review
**And** a confirmation message thanks the user

**Given** the user has recently submitted a report
**When** they try to submit another within the rate limit window
**Then** a message indicates they must wait (FR26 - rate limited)
**And** the time remaining is shown

**Given** a submission attempt fails
**When** network or server error occurs
**Then** a user-friendly error is shown
**And** the user can retry later

---

### Story 4.5: Passive Symptom Capture

As a **system**,
I want **to passively capture symptom data during AI diagnosis chat**,
So that **I can identify emerging patterns for Known Issues**.

**Acceptance Criteria:**

**Given** the user is in the AI symptom chat
**When** they describe their vehicle symptoms
**Then** symptom data is passively captured (FR27)
**And** the capture is anonymous (no personal data)

**Given** symptom data is captured
**When** stored for aggregation
**Then** data includes: YMMT, symptom keywords, OBD codes if provided
**And** no user-identifying information is stored (NFR-S5)

**Given** the user's diagnosis is completed
**When** the session ends
**Then** captured symptoms are aggregated with similar reports
**And** patterns can emerge over time

**Given** passive capture is occurring
**When** the user is using the app
**Then** no explicit consent prompt is needed (anonymous data)
**And** the app privacy policy covers this usage

**Given** symptom patterns reach a threshold
**When** multiple users report similar symptoms for same YMMT
**Then** the pattern is flagged for admin review
**And** it could become a new Known Issue

---

### Story 4.6: Admin Pattern Review

As an **admin**,
I want **to review aggregated symptom patterns in the dashboard**,
So that **I can identify and publish new Known Issues**.

**Acceptance Criteria:**

**Given** symptom data has been aggregated
**When** the admin views the dashboard
**Then** patterns are displayed grouped by YMMT (FR28)
**And** frequency/count of similar reports is shown

**Given** a pattern shows significant frequency
**When** the admin reviews it
**Then** they can see: symptom descriptions, OBD codes, report count
**And** they can decide to create a Known Issue from the pattern

**Given** the admin wants to create a Known Issue
**When** they select a pattern
**Then** they can draft the issue with confidence level and sources
**And** they can publish it to the Known Issues database

**Given** the admin dismisses a pattern
**When** they mark it as not actionable
**Then** the pattern is archived
**And** it won't appear in the review queue again

**Given** vacation mode is enabled (FR70)
**When** the gathering agent would capture data
**Then** symptom capture continues but admin review is paused
**And** patterns queue up for later review

---

## Epic 5: Parts Decision Support

Users can confidently choose parts with OEM vs aftermarket guidance. This epic delivers confident parts purchasing without leaving the app.

### Story 5.1: Inline Parts Recommendations

As a **vehicle owner**,
I want **to see parts recommendations inline within guide steps**,
So that **I know exactly which parts I need as I work through the repair**.

**Acceptance Criteria:**

**Given** a guide step requires specific parts
**When** the user views the step
**Then** parts recommendations are displayed inline (FR29)
**And** parts are contextual to that specific step

**Given** parts are displayed inline
**When** the user views the recommendation
**Then** the part name and basic info are shown
**And** an expandable section provides more detail

**Given** a step requires multiple parts
**When** displayed inline
**Then** all required parts for that step are listed
**And** the list is organized clearly

**Given** a step does not require parts
**When** the user views the step
**Then** no parts section is displayed
**And** the step focuses on the instruction

**Given** the user wants more part detail
**When** they expand the parts section
**Then** OEM vs aftermarket options are shown
**And** pricing information is visible

---

### Story 5.2: OEM vs Aftermarket Decision Framework

As a **vehicle owner**,
I want **to understand OEM vs aftermarket options with a decision framework**,
So that **I can make informed choices based on my priorities**.

**Acceptance Criteria:**

**Given** a part has OEM and aftermarket options
**When** the user views the parts detail
**Then** a decision framework is displayed (FR30)
**And** both options are clearly compared

**Given** the decision framework is displayed
**When** the user reviews it
**Then** OEM benefits are listed (exact fit, warranty safe, OE quality)
**And** aftermarket benefits are listed (lower cost, variety, availability)

**Given** the part comparison
**When** different scenarios apply
**Then** guidance is provided (e.g., "For warranty concerns, consider OEM")
**And** the user understands trade-offs

**Given** a part only has one option
**When** displayed to the user
**Then** available option is shown
**And** explanation for limited options if relevant

**Given** the user is viewing on mobile
**When** the framework is displayed
**Then** information is readable and well-formatted
**And** touch targets meet 44x44px minimum

---

### Story 5.3: Price Ranges & Brand Recommendations

As a **vehicle owner**,
I want **to see price ranges and curated brand recommendations**,
So that **I can find quality parts within my budget**.

**Acceptance Criteria:**

**Given** a part has price information available
**When** the user views parts detail
**Then** price ranges are displayed for OEM and aftermarket (FR31)
**And** prices are presented as ranges (e.g., "$15-25")

**Given** aftermarket options exist
**When** the user views recommendations
**Then** curated quality brands are listed (FR32)
**And** brands are vetted for reliability

**Given** brand recommendations are shown
**When** the user reviews them
**Then** 2-4 recommended brands are listed
**And** brief reasoning may be included (e.g., "Known for durability")

**Given** price data is unavailable
**When** the part is displayed
**Then** a message indicates "Price varies by retailer"
**And** the user is directed to purchase links

**Given** the user's vehicle trim affects pricing
**When** specific trim data is available
**Then** prices reflect that trim's requirements
**And** compatibility is noted

---

### Story 5.4: Purchase Links Integration

As a **vehicle owner**,
I want **to access links to purchase parts from retailers**,
So that **I can buy parts without leaving the app**.

**Acceptance Criteria:**

**Given** a part is displayed
**When** the user wants to purchase
**Then** links to retailers are available (FR33)
**And** links open in a new tab/browser

**Given** purchase links are shown
**When** the user views options
**Then** Amazon link is available (if part exists)
**And** RockAuto link is available (if part exists)
**And** specialty retailer links may be included

**Given** the user taps a purchase link
**When** the link opens
**Then** it directs to the correct part listing
**And** the part matches the user's YMMT where possible

**Given** a purchase link fails or part is unavailable
**When** the user follows the link
**Then** they land on a relevant search page
**And** can find alternatives

**Given** the user is offline
**When** they view purchase links
**Then** links are visible but noted as requiring internet
**And** tapping shows offline messaging

---

### Story 5.5: Warranty & Compatibility Warnings

As a **vehicle owner**,
I want **to see warranty impact and compatibility warnings**,
So that **I don't accidentally void my warranty or buy incompatible parts**.

**Acceptance Criteria:**

**Given** a part choice may affect warranty
**When** the user views the part
**Then** a warranty warning is displayed (FR34)
**And** the warning is prominent but not alarmist

**Given** a warranty warning exists
**When** displayed to the user
**Then** specific concern is explained (e.g., "Aftermarket may affect powertrain warranty")
**And** the user can make an informed decision

**Given** a part has vehicle-specific compatibility requirements
**When** the user views the part
**Then** compatibility info for their trim/engine is shown (FR35)
**And** any fitment notes are included

**Given** a compatibility concern exists
**When** displayed to the user
**Then** the concern is clearly stated (e.g., "Verify engine code before ordering")
**And** how to verify is explained if possible

**Given** no warranty or compatibility concerns exist
**When** the user views the part
**Then** no warnings are displayed
**And** the part appears standard

**Given** the user's vehicle has a known compatibility issue
**When** parts are recommended
**Then** incompatible parts are flagged
**And** compatible alternatives are suggested

---

## Epic 6: Content Quality & Validation

System ensures guide accuracy through six-agent validation pipeline. This epic delivers trustworthy, validated content users can rely on.

### Story 6.1: Six-Agent Validation Pipeline

As a **system**,
I want **to validate guide accuracy through a six-agent AI pipeline**,
So that **generated guides are accurate, complete, and safe before users see them**.

**Acceptance Criteria:**

**Given** a guide has been generated
**When** it enters the validation pipeline
**Then** six specialized agents review the guide (FR56)
**And** each agent validates their domain

**Given** the validation pipeline runs
**When** agents are invoked
**Then** Mechanic AI validates technical accuracy
**And** Safety Officer validates safety warnings
**And** Parts Specialist validates part recommendations
**And** Content Quality validates readability/completeness
**And** remaining agents cover additional domains

**Given** an agent finds issues
**When** validation completes
**Then** issues are flagged for correction
**And** the guide can be regenerated or fixed

**Given** all agents approve the guide
**When** validation passes
**Then** the guide is marked validated
**And** it becomes available to users

**Given** the validation pipeline fails
**When** an error occurs
**Then** the error is logged for debugging
**And** the guide remains in draft state

---

### Story 6.2: Inline Tips Coverage Validation

As a **system**,
I want **to validate that 90%+ of common stuck points have inline tips**,
So that **users don't get stuck without help**.

**Acceptance Criteria:**

**Given** a guide has steps with known stuck points
**When** tips coverage is validated
**Then** the system checks that 90% of stuck points have tips (FR57)
**And** coverage percentage is calculated

**Given** tips coverage is below 90%
**When** validation runs
**Then** the guide fails validation
**And** missing tip areas are identified

**Given** tips coverage meets 90% threshold
**When** validation passes
**Then** the guide can proceed in the pipeline
**And** coverage metric is recorded

**Given** a step has no common stuck points
**When** coverage is calculated
**Then** that step doesn't penalize overall coverage
**And** tips are optional for simple steps

**Given** the system identifies missing tips
**When** regeneration is needed
**Then** the AI is prompted to add tips for uncovered stuck points
**And** coverage is re-validated

---

### Story 6.3: Safety Warning Assignment

As a **system**,
I want **to assign safety warnings with severity levels**,
So that **users understand the risk level of each warning**.

**Acceptance Criteria:**

**Given** a guide step has safety concerns
**When** the safety agent reviews it
**Then** safety warnings are assigned (FR58)
**And** each warning has a severity level (High/Medium/Low)

**Given** a High severity warning
**When** assigned to a step
**Then** it covers critical safety risks (e.g., fire, injury, vehicle damage)
**And** the warning requires prominent display

**Given** a Medium severity warning
**When** assigned to a step
**Then** it covers moderate risks (e.g., minor injury, component damage)
**And** the warning is clearly visible

**Given** a Low severity warning
**When** assigned to a step
**Then** it covers advisory information (e.g., best practices, tips)
**And** the warning is informational

**Given** no safety concerns exist for a step
**When** the safety agent reviews it
**Then** no warnings are assigned
**And** the step proceeds without safety markup

---

### Story 6.4: Part Compatibility Validation

As a **system**,
I want **to validate part compatibility for the user's specific trim and engine**,
So that **recommended parts actually fit their vehicle configuration**.

**Acceptance Criteria:**

**Given** a guide recommends specific parts
**When** compatibility is validated
**Then** parts are checked against the user's YMMT + engine (FR59)
**And** incompatible parts are flagged

**Given** a part has trim-specific part numbers
**When** the user's trim is known
**Then** the correct part number for their trim is recommended
**And** other trim part numbers are excluded (e.g., Sport vs Base brake rotors)

**Given** a part differs by transmission type
**When** part names include transmission fitment (e.g., "f/ manual transmission", "f/ automatic transmission")
**Then** both variants are displayed with clear labeling
**And** the user can select the correct variant for their vehicle

**Given** a part has engine-specific variants
**When** the user's engine code is known (turbo, displacement, fuel type)
**Then** the correct engine-specific part is recommended
**And** incompatible variants are excluded

**Given** a part is compatible
**When** validation passes
**Then** the part recommendation includes the correct part number
**And** no compatibility warning is added

**Given** a part may have compatibility issues
**When** detected by validation
**Then** a compatibility warning is added
**And** the warning specifies what to verify (e.g., "Confirm your transmission type before ordering")

**Given** trim/engine data is unavailable
**When** validation runs
**Then** generic part recommendations are used
**And** the user is advised to verify fitment with their specific configuration

---

### Story 6.5: Adversarial Test Cases

As a **system**,
I want **to generate adversarial test cases to validate tips quality**,
So that **tips actually help when users are stuck**.

**Acceptance Criteria:**

**Given** a guide has inline tips
**When** adversarial testing runs
**Then** test cases simulate common stuck scenarios (FR60)
**And** each tip is evaluated against relevant scenarios

**Given** a tip is tested
**When** the adversarial agent simulates a stuck user
**Then** the tip is evaluated for helpfulness
**And** unclear or unhelpful tips are flagged

**Given** a tip fails adversarial testing
**When** flagged for improvement
**Then** the issue is described (e.g., "Too vague", "Missing key detail")
**And** the tip can be regenerated

**Given** all tips pass adversarial testing
**When** validation completes
**Then** the guide proceeds in the pipeline
**And** tips quality is confirmed

**Given** new stuck points are discovered during adversarial testing
**When** patterns emerge
**Then** additional tips can be suggested
**And** coverage improves

---

### Story 6.6: Admin Spot-Check Gate

As an **admin**,
I want **to manually spot-check the first 10 guides before full automation**,
So that **I can verify the validation pipeline works correctly**.

**Acceptance Criteria:**

**Given** the system is newly deployed
**When** guides are generated
**Then** the first 10 guides require manual admin approval (FR61)
**And** they don't auto-publish

**Given** a guide is queued for spot-check
**When** the admin reviews it
**Then** they can see: full guide content, validation results, agent feedback
**And** they can approve or reject the guide

**Given** the admin approves a guide
**When** approval is confirmed
**Then** the guide is published and available to users
**And** the spot-check count increments

**Given** the admin rejects a guide
**When** rejection is confirmed
**Then** the guide returns to draft state
**And** issues are logged for pipeline improvement

**Given** 10 guides have been successfully spot-checked
**When** the threshold is met
**Then** full automation can be enabled
**And** future guides auto-publish after pipeline validation

---

## Epic 7: Admin Dashboard & Monitoring

Solo operator can sustainably manage costs and content (≤1 hour/week). This epic delivers complete admin functionality for solo-sustainable operations.

### Story 7.1: API Usage & Cost Dashboard

As an **admin**,
I want **to see API usage and costs broken down by feature**,
So that **I can monitor spending and identify expensive operations**.

**Acceptance Criteria:**

**Given** the admin accesses the dashboard
**When** the cost overview loads
**Then** total API costs for the current month are displayed (FR62)
**And** a daily/weekly trend chart is shown

**Given** cost data is available
**When** the admin views breakdown
**Then** costs are grouped by feature (FR63): guide generation, AI chat, validation pipeline, VIN decode
**And** each feature shows its percentage of total cost

**Given** the dashboard displays cost data
**When** updated daily
**Then** data refreshes within 24 hours (NFR-I15)
**And** the admin sees current spending status

**Given** API calls are made
**When** costs are tracked
**Then** each call's cost is logged by feature category
**And** aggregation is accurate

**Given** the admin wants to drill down
**When** they select a feature
**Then** detailed usage stats are shown (call count, avg cost per call)
**And** patterns are identifiable

---

### Story 7.2: Budget Warnings & Alerts

As an **admin**,
I want **to receive warnings at 50%, 75%, and 100% of my monthly budget**,
So that **I can take action before exceeding my budget**.

**Acceptance Criteria:**

**Given** the monthly budget is set ($25)
**When** spending reaches 50% ($12.50)
**Then** a warning notification is displayed (FR64)
**And** the dashboard shows "50% of budget used"

**Given** spending reaches 75% ($18.75)
**When** the threshold is crossed
**Then** a more urgent warning is displayed (FR64)
**And** the admin is alerted to review usage

**Given** spending reaches 100% ($25)
**When** the threshold is crossed
**Then** a critical warning is displayed (FR64)
**And** the admin knows rate limiting is active

**Given** warnings are generated
**When** displayed to the admin
**Then** warnings are visible on the dashboard
**And** include remaining budget and days left in month

**Given** the admin dismisses a warning
**When** they acknowledge it
**Then** the warning is marked as seen
**And** won't re-alert until next threshold

---

### Story 7.3: Hard Budget Cap & Rate Limiting

As a **system**,
I want **to enforce a hard $25/month budget cap with automatic rate limiting**,
So that **costs never exceed the budget even if the admin is unavailable**.

**Acceptance Criteria:**

**Given** the hard budget cap is $25/month
**When** spending approaches or reaches the cap
**Then** automatic rate limiting activates (FR65)
**And** expensive operations are throttled

**Given** rate limiting is active
**When** a user requests guide generation
**Then** requests are queued or delayed
**And** users see a friendly message about high demand

**Given** rate limiting is active
**When** the admin views the dashboard
**Then** rate limiting status is prominently shown
**And** current throttle level is displayed

**Given** a new month begins
**When** the budget resets
**Then** rate limiting is automatically lifted
**And** normal operations resume

**Given** the admin wants to adjust the cap
**When** they modify the budget setting
**Then** the cap updates (must stay ≤$25 for free tier sustainability)
**And** rate limiting thresholds adjust accordingly

---

### Story 7.4: Known Issues Batch Management

As an **admin**,
I want **to batch approve or reject Known Issues with confidence scores visible**,
So that **I can efficiently manage content in minimal time**.

**Acceptance Criteria:**

**Given** Known Issues are pending review
**When** the admin views the queue
**Then** issues are listed with confidence scores (FR68)
**And** source citations are visible (FR68)

**Given** the review queue is displayed
**When** the admin selects multiple issues
**Then** batch selection is available
**And** multiple issues can be selected at once

**Given** issues are selected
**When** the admin clicks "Approve Selected"
**Then** all selected issues are approved in batch (FR67)
**And** they become visible to users

**Given** issues are selected
**When** the admin clicks "Reject Selected"
**Then** all selected issues are rejected in batch (FR67)
**And** they are removed from the queue

**Given** the admin reviews patterns
**When** aggregated symptom data is shown (FR66)
**Then** patterns are grouped by YMMT
**And** frequency counts help prioritize review

**Given** the admin has limited time
**When** using batch management
**Then** typical review session takes <15 minutes
**And** supports ≤1 hour/week maintenance goal

---

### Story 7.5: Solo Operator Time Tracking

As an **admin**,
I want **to track time spent on maintenance tasks**,
So that **I can ensure I'm staying within my ≤1 hour/week goal**.

**Acceptance Criteria:**

**Given** the admin performs maintenance tasks
**When** time tracking is enabled
**Then** session time is tracked automatically (FR69)
**And** cumulative weekly time is displayed

**Given** the admin completes a session
**When** they log out or close the dashboard
**Then** session time is recorded
**And** weekly total updates

**Given** weekly maintenance time is tracked
**When** the admin views the dashboard
**Then** current week's time is displayed
**And** comparison to 1-hour target is shown

**Given** the admin approaches 1 hour
**When** 45 minutes have been used
**Then** a gentle reminder is shown
**And** suggestions for efficiency may be offered

**Given** historical data exists
**When** the admin reviews trends
**Then** weekly averages are shown
**And** the admin can identify patterns

---

### Story 7.6: Vacation Mode

As an **admin**,
I want **to enable vacation mode to pause the gathering agent**,
So that **content doesn't pile up while I'm away**.

**Acceptance Criteria:**

**Given** the admin is planning time away
**When** they enable vacation mode
**Then** the gathering agent pauses data collection (FR70)
**And** a vacation mode indicator is displayed

**Given** vacation mode is active
**When** the system would normally gather data
**Then** passive symptom capture continues (maintains data integrity)
**And** admin review tasks are paused

**Given** vacation mode is active
**When** users submit issue reports
**Then** submissions are queued for later review
**And** users see normal confirmation (no change to UX)

**Given** the admin returns
**When** they disable vacation mode
**Then** gathering agent resumes
**And** queued items appear in review queue

**Given** vacation mode is enabled
**When** the dashboard is viewed
**Then** a clear indicator shows "Vacation Mode Active"
**And** queued item count is displayed

---

### Story 7.7: Standardized Guide Data Model

As a **system**,
I want **generated guides to follow a standardized data model**,
So that **localStorage structure is consistent and predictable**.

**Acceptance Criteria:**

**Given** a guide is generated
**When** the data is structured
**Then** it follows the standardized data model (FR71)
**And** all required fields are present

**Given** the data model specification
**When** a guide is created
**Then** it includes: id, title, vehicle (YMMT), steps[], tools[], parts[], difficulty, safetyLevel, timeEstimate, createdAt
**And** optional fields are handled gracefully

**Given** steps are in the guide
**When** structured per data model
**Then** each step includes: number, instruction, tips[], safetyWarnings[]
**And** arrays can be empty if not applicable

**Given** the guide is stored in localStorage
**When** using typed helpers with Zod validation
**Then** the data model is enforced
**And** invalid data is rejected with clear errors

**Given** the data model needs to evolve
**When** future changes are needed
**Then** versioning is included in the model
**And** migrations can be handled gracefully

