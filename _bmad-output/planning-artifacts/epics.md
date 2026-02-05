---
stepsCompleted: [1, 2]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
workflowType: 'epics-and-stories'
project_name: 'AutoCare Companion'
---

# AutoCare Companion - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AutoCare Companion, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

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

