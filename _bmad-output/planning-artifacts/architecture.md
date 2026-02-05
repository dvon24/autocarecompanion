---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - 'c:\Users\devon\autocarecompanion\_bmad-output\planning-artifacts\prd.md'
workflowType: 'architecture'
project_name: 'AutoCare Companion'
user_name: 'Devon'
date: '2026-02-04'
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

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack PWA (Progressive Web App)** based on project requirements for offline-first automotive maintenance guides.

### Technical Preferences Already Established (from PRD)

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Deployment:** Vercel (free tier, zero-config)
- **Architecture:** PWA with Service Worker (offline-first requirement)
- **Philosophy:** Minimal dependencies, AI-maintainable codebase, component-based

### Selected Approach

**create-next-app + @ducanh2912/next-pwa + Headless UI**

**Initialization Commands:**

```bash
# Step 1: Create Next.js app with recommended defaults
npx create-next-app@latest autocare-companion --yes

# Step 2: Install core dependencies
cd autocare-companion
npm install @ducanh2912/next-pwa @headlessui/react react-hook-form zod @hookform/resolvers
```

**Rationale:** TypeScript + Tailwind + App Router match PRD requirements. @ducanh2912/next-pwa provides proven Service Worker support. Headless UI enables accessible Pre-Flight Modal (FR36-FR44). Minimal dependencies, solo sustainable.

**Party Mode Validation:** Winston (Architect), Barry (Solo Dev), Murat (Test Architect), John (PM), and Sally (UX Designer) reviewed and enhanced this decision with localStorage limits, design system, and MVP-first sequencing.

### Design System Architecture

**Component Library:** Headless UI + Tailwind
- Accessible primitives (Dialog, Disclosure for Pre-Flight Modal)
- Two-Phase Design Language support (Discovery: calm, Execution: high-contrast AAA)
- WCAG 2.1 AA/AAA built-in

**Typography Scale (Garage-Optimized):**
- Guide Steps: 18px minimum (NFR-A8)
- Body Text: 16px (NFR-A3)
- Safety Callouts: 20px bold
- Touch Targets: 44×44px minimum (NFR-A7)

**High-Contrast Execution Phase:**
```javascript
className="bg-black text-white" // 7:1 contrast (NFR-A2)
```

### Service Worker Strategy

**Package:** @ducanh2912/next-pwa v10.2.9 (stable, proven)

**Caching Strategies:**
- **Guides:** Cache-First (100% offline, NFR-R3)
- **YMMT Data:** Precache (static JSON)
- **AI Chat:** Network-Only (real-time)
- **Parts Pricing:** Network-First with cache fallback

**localStorage Quota Management:**
- Estimate: 300-500KB per guide
- Capacity: ~10-15 cached guides (5MB limit)
- Eviction: LRU (Least Recently Used)
- Warning: Alert at 80% capacity

### Epic Sequencing (MVP-First)

**Epic 0: Foundation (2-3 days)**
- Initialize create-next-app
- Install dependencies
- Configure Service Worker (disabled in dev)
- Deploy to Vercel

**Epic 0.5: Design System (1-2 days)**
- Headless UI wrapper components
- Two-Phase Design Language toggle
- Typography and touch target utilities

**Epic 1: Core Value Validation (Journey 1)**
- FR1: AI chat symptom diagnosis
- FR8: Generate brake pad guide
- FR36-FR44: Pre-Flight Modal
- **Deliverable:** End-to-end user validation

**Epic 2: Offline Validation**
- FR48-FR51: Cache guides, offline access
- Test in garage with real user
- **Deliverable:** Validate offline necessity

**Epic 3+: Refinement (After Validation)**
- Automated testing (Playwright, Lighthouse CI)
- localStorage optimization (if needed)
- Additional journeys

**Philosophy:** Ship value → Validate assumptions → Perfect what users use.

### Dependencies Summary

**Production:**
- `@ducanh2912/next-pwa`: Service Worker
- `@headlessui/react`: Accessible UI primitives
- `react-hook-form` + `zod`: Form management

**Development (Epic 3+):**
- `@playwright/test`: E2E testing
- `@axe-core/playwright`: Accessibility testing
- `@lhci/cli`: Lighthouse CI (optional)

### Key Architectural Decisions

1. **Use proven @ducanh2912/next-pwa** (not experimental Serwist) for MVP stability
2. **Headless UI for Pre-Flight Modal** complexity and accessibility
3. **localStorage with LRU eviction** for 5MB limit management
4. **Testing deferred to Epic 3+** after user validation
5. **Service Worker disabled in dev** for fast iteration
6. **Two-Phase Design Language** via Tailwind conditional classes
7. **Epic sequencing prioritizes** user value over perfection

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- API route architecture (Edge vs Serverless) - Enables cost control and performance
- Data validation strategy (Zod schemas) - Prevents runtime errors from external APIs
- State management approach (Unified AppContext) - Enables guide execution and offline functionality
- Error handling standards - Guides PWA offline mode fallback behavior

**Important Decisions (Shape Architecture):**
- CI/CD pipeline with testing (GitHub Actions + Vercel) - Prevents broken deployments
- Cost monitoring implementation (KV store + dashboard) - Tracks budget compliance
- Code organization patterns - Ensures AI-maintainability and solo sustainability
- Epic 1 smoke tests - Validates critical assumptions before scale

**Deferred Decisions (Post-MVP):**
- Migration to Zustand (if AppContext becomes complex) - Can evaluate after Epic 2
- Advanced monitoring (error tracking, analytics) - Defer until user validation
- Comprehensive E2E test suite - Expand in Epic 3+ after critical paths proven

---

### API & Communication Architecture

**API Route Pattern: Hybrid Approach**

**Edge Functions** (Vercel Edge Runtime):
- Rate limiting middleware (IP-based, 10 guides/day per ADR-010)
- VIN decode proxy (NHTSA API passthrough)
- Parts pricing proxy (RockAuto API passthrough)
- Cost monitoring endpoints (read/write tracking data)

**Serverless Functions** (Full Node.js Runtime):
- AI chat (OpenAI/Anthropic API calls with full SDK)
- Guide generation (heavy AI processing, longer timeouts)
- Six-agent validation pipeline (complex AI orchestration)

**Rationale:** Edge Functions provide 9x faster cold starts and 40% faster response times for lightweight operations. Serverless Functions handle heavy AI workloads requiring full Node.js runtime. This hybrid approach optimizes both cost (<$20/month) and performance (TTI <3s).

**Technology Versions:**
- Vercel Edge Runtime (built-in, V8 engine)
- Node.js 18+ for Serverless Functions
- Vercel KV (Redis) for rate limiting and cost tracking

**API Route Organization:**
```
src/app/api/
├── edge/                    # Edge Functions
│   ├── rate-limit/
│   ├── vin-decode/
│   ├── parts-pricing/
│   └── costs/
└── serverless/              # Serverless Functions
    ├── ai-chat/
    ├── generate-guide/
    └── validate-guide/
```

---

**Rate Limiting & Cost Tracking Optimization**

**Redis Pipelining for Performance:**
```typescript
// Edge middleware with atomic operations
export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const dateKey = new Date().toISOString().split('T')[0];
  const estimatedCost = estimateRequestCost(request);

  try {
    // Single KV roundtrip using pipeline
    const pipeline = kv.pipeline();
    pipeline.incr(`rate:${ip}:${dateKey}`);
    pipeline.hincrby(`costs:${dateKey.slice(0, 7)}`, 'estimated', estimatedCost);
    pipeline.expire(`rate:${ip}:${dateKey}`, 86400); // 24h TTL

    const [count] = await pipeline.exec();

    if (count > 10) {
      return new Response(JSON.stringify({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Daily guide limit reached. Access cached guides offline.",
          retryable: false,
          offlineMode: true
        }
      }), { status: 429 });
    }

    return NextResponse.next();

  } catch (kvError) {
    // Circuit breaker: KV unavailable, allow request but log
    console.error('KV unavailable, bypassing rate limit', kvError);
    // Optional: Fall back to in-memory rate limiting here
    return NextResponse.next();
  }
}
```

**Rationale:** Redis pipelining reduces KV roundtrips from 2 to 1 (50% latency reduction). Circuit breaker prevents cascade failures if KV is unreachable. Atomic operations ensure consistency.

---

**Error Handling Standards**

**Standardized Error Response Format:**
```typescript
{
  error: {
    code: string,        // "RATE_LIMIT_EXCEEDED", "AI_TIMEOUT", "VIN_INVALID"
    message: string,     // User-friendly message
    retryable: boolean,  // Can user retry this operation?
    offlineMode: boolean // Should PWA switch to cached content?
  }
}
```

**Error Categories:**
- **Rate Limiting (429):** Show "daily limit reached" with prompt to use offline cached guides
- **AI Timeout (504):** Retryable with exponential backoff (3 attempts, 2s/4s/8s delays)
- **External API Failures (502/503):** Graceful degradation to cached data
- **Validation Errors (400):** Show specific field errors with correction guidance
- **Budget Cap Exceeded (402):** Block new guides, keep cached guides accessible (see Hard Cap UX below)

**Rationale:** Offline-first PWA needs structured errors that guide users to cached content when online features fail. The `offlineMode` flag triggers PWA to switch to localStorage guides instead of showing error screens.

---

**Hard Cap UX Strategy**

**When Monthly Budget Reaches $25:**

1. **Cached Guides Remain Accessible** - Users can access all previously cached guides (100% offline functionality)
2. **New Guide Generation Blocked** - Display user-friendly message:
   ```
   "Monthly AI budget reached. New guides resume on [first of next month].
   Your cached guides work offline anytime."
   ```
3. **Cost Dashboard Transparency** - Show daily breakdown: "You've generated 47 guides this month. Budget resets in 3 days."
4. **Optional Monetization Path (Post-MVP):** "Unlock 5 more guides for $5" (deferred to Epic 3+)

**Rationale:** Hard cap prevents runaway costs (FR69) while maintaining core offline value proposition. Users aren't stranded - they keep their cached guides. Transparency builds trust.

---

### State Management Architecture

**Unified AppContext (Simplified)**

**Single Context Provider:**
```typescript
// src/contexts/AppContext.tsx
const AppContext = createContext<{
  guide: {
    current: Guide | null;
    currentStep: number;
    completedSteps: Set<number>;
    inlineChatCount: number; // FR14: 3 questions/guide limit
  };
  cache: {
    isOnline: boolean;
    cachedGuides: Guide[];
    quotaUsed: number; // 0-1 (0% to 100%)
    quotaWarningShown: boolean;
  };
  costs: {
    dailyUsage: Record<string, number>;
    monthlyTotal: number;
    budgetWarnings: Set<number>; // [50, 75, 100]
  };
  actions: {
    // Guide actions
    startGuide: (guide: Guide) => void;
    completeStep: (stepIndex: number) => void;
    pauseGuide: () => void;

    // Cache actions
    cacheGuide: (guide: Guide) => Promise<void>;
    evictGuide: (guideId: string) => void;
    pinGuide: (guideId: string) => void; // Never evict

    // Cost actions
    trackCost: (feature: string, cost: number) => void;
  };
}>(null);

// Single provider wrapper
export function AppProvider({ children }: { children: ReactNode }) {
  // State logic here, persists to localStorage
  return <AppContext.Provider value={...}>{children}</AppContext.Provider>;
}
```

**Custom Hooks:**
```typescript
// Clean component access
export const useGuide = () => useContext(AppContext).guide;
export const useCache = () => useContext(AppContext).cache;
export const useCosts = () => useContext(AppContext).costs;
export const useAppActions = () => useContext(AppContext).actions;
```

**Rationale:** Single provider eliminates nested hell (Barry's feedback). Three separate contexts would require `<GuideProvider><CacheProvider><CostProvider>...</>>>`. Unified context simplifies architecture and improves performance (single render cycle). localStorage persistence handled in one place. If complexity grows post-Epic 2, easy migration path to Zustand.

**Migration Path:** If AppContext exceeds ~500 lines after Epic 2, consider Zustand (2.6KB, minimal API, TypeScript-first).

---

### Data Validation & Serialization

**Schema-First Architecture with Zod**

**Guide Data Model (FR71):**
```typescript
// src/schemas/guide.schema.ts
export const GuideSchema = z.object({
  guideId: z.string().uuid(),
  vehicleVIN: z.string().length(17),
  task: z.string(),
  steps: z.array(GuideStepSchema),
  tools: z.array(z.string()),
  parts: z.array(PartSchema),
  safetyWarnings: z.array(z.string()),
  estimatedTime: z.string(),
  generatedAt: z.string().datetime(),
  version: z.literal('1.0') // Schema versioning for backward compatibility
});

// Auto-generate TypeScript type (single source of truth)
export type Guide = z.infer<typeof GuideSchema>;
```

**Schema Organization:**
```
src/schemas/
├── guide.schema.ts       // FR71 guide data model
├── vehicle.schema.ts     // YMMT, VIN validation
├── preflight.schema.ts   // Pre-Flight Modal form (FR36-FR44)
├── api/
│   ├── ai.schema.ts      // OpenAI/Anthropic response validation
│   ├── nhtsa.schema.ts   // VIN decode response validation
│   └── parts.schema.ts   // RockAuto response validation
└── index.ts              // Re-export all schemas
```

**Validation Strategy:**
- **API Boundaries:** Validate all external API responses (NHTSA, RockAuto, OpenAI/Anthropic)
- **localStorage Read:** Validate data from localStorage (corruption detection per NFR-R6)
- **Form Inputs:** React Hook Form + Zod for Pre-Flight Modal validation (if bundle budget allows)
- **Guide Generation:** Validate AI-generated guides match FR71 schema before storage

**TypeScript Integration:**
- Use `z.infer<typeof Schema>` for all types (single source of truth)
- No manual type definitions that can drift from runtime validation
- Zod schemas serve as both runtime validators and type generators

---

**localStorage Corruption Handling**

**Graceful Recovery Strategy:**
```typescript
// src/lib/localStorage.ts
export function loadGuide(guideId: string): Guide | null {
  try {
    const raw = localStorage.getItem(`guide:${guideId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = GuideSchema.parse(parsed); // Zod validation

    return validated;

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Schema validation failed - corrupted data
      console.error('Guide data corrupted', error);

      // User-friendly recovery notification
      showNotification({
        type: 'warning',
        message: 'Guide data was corrupted. Fetching fresh copy...',
        action: 'Retry',
        onRetry: () => refetchGuide(guideId)
      });

      // Remove corrupted data
      localStorage.removeItem(`guide:${guideId}`);
      return null;

    } else {
      // JSON parse error
      console.error('localStorage read failed', error);
      return null;
    }
  }
}
```

**Schema Regression Tests:**
```typescript
// tests/schemas/guide.schema.test.ts
describe('GuideSchema backward compatibility', () => {
  it('validates current version 1.0 data', () => {
    const guide = { version: '1.0', /* ... */ };
    expect(() => GuideSchema.parse(guide)).not.toThrow();
  });

  it('rejects future incompatible versions', () => {
    const futureGuide = { version: '2.0', /* ... */ };
    expect(() => GuideSchema.parse(futureGuide)).toThrow();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalGuide = { /* required fields only */ };
    expect(() => GuideSchema.parse(minimalGuide)).not.toThrow();
  });
});
```

**Rationale:** Schema-first prevents runtime errors from malformed API responses or corrupted localStorage. Validation with user-friendly recovery turns catastrophic failures into manageable UX moments. Schema versioning enables future migrations without data loss.

---

**localStorage Quota Management (Enhanced)**

**Guide Management UI (80% Capacity Trigger):**

When user reaches 80% of 5MB localStorage quota:
```typescript
// Show guide management modal
<GuideManagerModal>
  <QuotaIndicator used={4.2} total={5.0} />

  <GuideList>
    {guides.map(guide => (
      <GuideItem
        guide={guide}
        size={guide.estimatedSize}
        lastAccessed={guide.lastAccessed}
        isPinned={guide.isPinned}
        onPin={() => pinGuide(guide.id)}
        onDelete={() => evictGuide(guide.id)}
      />
    ))}
  </GuideList>

  <Actions>
    <Button onClick={clearOldestGuides}>Clear Oldest 3 Guides</Button>
    <Button onClick={clearAllUnpinned}>Clear All Unpinned</Button>
  </Actions>
</GuideManagerModal>
```

**Features:**
- Pin favorite guides (never evicted by LRU)
- Show size per guide (300-500KB estimate)
- Sort by last accessed, size, or date cached
- Bulk actions: clear oldest, clear unpinned

**Rationale:** Turns localStorage limit from failure mode into user control feature. Power users can curate their offline library. Pinning prevents accidental loss of critical guides.

---

### Infrastructure & Deployment

**CI/CD Pipeline: GitHub Actions + Vercel (with Testing)**

**Deployment Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Test, Build, and Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      # Epic 1: Smoke tests only
      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Run E2E smoke tests
        run: npm run test:e2e:smoke
        env:
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 0

      # Vercel deployment (automatic)
```

**Epic 1 Test Coverage (Minimal, Critical Paths):**
```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Epic 1 Smoke Tests', () => {

  test('Generate guide end-to-end', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="symptom-input"]', 'brake squeal');
    await page.click('[data-testid="generate-guide"]');
    await expect(page.locator('[data-testid="guide-steps"]')).toBeVisible();
  });

  test('Offline mode works in airplane mode', async ({ page, context }) => {
    // Generate and cache guide
    await page.goto('/');
    await generateGuide(page);

    // Simulate offline
    await context.setOffline(true);

    // Verify cached guide loads
    await page.goto('/guide/[id]');
    await expect(page.locator('[data-testid="guide-steps"]')).toBeVisible();
  });

  test('localStorage quota warning at 80%', async ({ page }) => {
    // Fill localStorage to 4MB (80% of 5MB)
    await fillLocalStorageToCapacity(page, 0.8);

    // Trigger quota check
    await page.goto('/');
    await expect(page.locator('[data-testid="quota-warning"]')).toBeVisible();
  });

});
```

**Rationale:** CI/CD with tests prevents broken deployments. Epic 1 smoke tests validate critical assumptions (offline mode, localStorage) without full E2E suite overhead. Playwright tests run in ~2-3 minutes. Comprehensive testing deferred to Epic 3+ after architecture proven.

---

**Environment Variables Strategy:**

**Server-Side Only (Vercel Dashboard):**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ROCKAPI_API_KEY=... (if needed for paid tier)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

**Client-Side Public Config:**
```typescript
// src/config/public.ts
export const PUBLIC_CONFIG = {
  maxGuidesPerDay: 10,
  costWarningThresholds: [0.5, 0.75, 1.0],
  monthlyBudgetCap: 25,
  cacheWarningThreshold: 0.8, // 80% localStorage quota
  maxCachedGuides: 15 // ~5MB / 350KB avg
};
```

**Rationale:** Vercel + GitHub integration provides zero-config deployments. Environment variables server-side only (NFR-S1: API keys never exposed). Public config enables client-side features without security risk.

---

**Cost Monitoring Implementation**

**Server-Side Tracking (Vercel KV):**
```typescript
// Server-side cost tracking (after AI API call)
async function trackAICost(feature: string, tokens: number, model: string) {
  const cost = calculateCost(tokens, model);
  const month = new Date().toISOString().slice(0, 7); // '2026-02'

  // Atomic increment
  await kv.hincrby(`costs:${month}`, feature, cost);

  // Check hard cap
  const totalCost = await getTotalMonthlyCost(month);
  if (totalCost >= 25) {
    // Trigger hard cap mode
    await kv.set('budget:cap:active', true);
    console.error(`Budget cap reached: $${totalCost}`);
  }

  return { cost, totalCost };
}
```

**Client-Side Dashboard (FR67):**
```typescript
// /app/costs/page.tsx
export default function CostDashboard() {
  const { data } = useSWR('/api/costs/summary', fetcher);

  return (
    <div>
      <BudgetGauge current={data.monthlyTotal} cap={25} />

      <DailyBreakdown>
        {data.dailyUsage.map(day => (
          <DayRow
            date={day.date}
            guides={day.guidesGenerated}
            cost={day.totalCost}
            breakdown={day.byFeature} // AI chat, guide gen, validation
          />
        ))}
      </DailyBreakdown>

      {data.warnings.map(threshold => (
        <Warning level={threshold}>
          {threshold}% of monthly budget used ($25 cap)
        </Warning>
      ))}
    </div>
  );
}
```

**Rationale:** KV store tracks real API costs server-side (persistent, free tier compatible). Client dashboard provides transparency (FR67) without exposing API keys. Hard cap enforcement prevents budget overrun (FR69). Daily breakdowns help solo operator identify cost drivers.

---

### Code Organization Patterns

**Project Structure:**

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── edge/                 # Edge Functions (rate limiting, proxies)
│   │   │   ├── rate-limit/
│   │   │   ├── vin-decode/
│   │   │   ├── parts-pricing/
│   │   │   └── costs/
│   │   └── serverless/           # Serverless Functions (AI calls)
│   │       ├── ai-chat/
│   │       ├── generate-guide/
│   │       └── validate-guide/
│   ├── (discovery)/              # Discovery phase LAYOUTS only
│   │   ├── layout.tsx            # Calm UI layout
│   │   ├── page.tsx              # Home: symptom chat + YMMT
│   │   └── symptom-chat/
│   └── (execution)/              # Execution phase LAYOUTS only
│       ├── layout.tsx            # High-contrast AAA layout
│       └── guide/[id]/
│           ├── page.tsx          # Guide execution
│           └── preflight/        # Pre-Flight Modal route
├── components/                   # Shared components (NOT in route groups)
│   ├── ui/                       # Design system primitives
│   │   ├── Dialog.tsx            # Headless UI wrapper
│   │   ├── Button.tsx            # 44×44px touch targets
│   │   ├── Disclosure.tsx        # Progressive disclosure
│   │   └── Badge.tsx             # Cache status, confidence
│   ├── discovery/                # Discovery phase components
│   │   ├── SymptomChat.tsx       # FR1: AI chat symptom diagnosis
│   │   ├── YMMTSelector.tsx      # FR2: Cascading YMMT selector
│   │   └── KnownIssuesBriefing.tsx # FR24: Proactive briefing
│   ├── execution/                # Execution phase components
│   │   ├── GuideChecklist.tsx    # FR9-FR12: Step-by-step UI
│   │   ├── PreFlightModal.tsx    # FR36-FR44: Safety disclosure
│   │   └── InlineAIChat.tsx      # FR14: Step-scoped AI chat
│   └── shared/                   # Phase-agnostic components
│       ├── GuideManager.tsx      # localStorage quota management
│       └── CostDashboard.tsx     # FR67: Budget transparency
├── contexts/                     # React Context (unified)
│   └── AppContext.tsx            # Single provider for all state
├── hooks/                        # Custom hooks
│   ├── useGuide.ts               # Guide execution state
│   ├── useCache.ts               # Offline/cache state
│   ├── useCosts.ts               # Cost tracking state
│   ├── useAppActions.ts          # All actions
│   └── useOnlineStatus.ts        # Network connectivity
├── schemas/                      # Zod schemas
│   ├── guide.schema.ts           # FR71: Guide data model
│   ├── vehicle.schema.ts         # YMMT + VIN validation
│   ├── preflight.schema.ts       # Pre-Flight Modal form
│   └── api/
│       ├── ai.schema.ts          # OpenAI/Anthropic responses
│       ├── nhtsa.schema.ts       # VIN decode responses
│       └── parts.schema.ts       # RockAuto responses
├── lib/                          # Utilities
│   ├── localStorage.ts           # LRU eviction + quota + corruption handling
│   ├── api-client.ts             # Fetch wrappers with error handling
│   ├── cost-estimator.ts         # Client-side cost estimation
│   └── service-worker.ts         # PWA registration helpers
└── types/                        # Shared TypeScript types
    └── index.ts                  # Re-exports from z.infer<>
```

**Key Changes from Original:**
- **Route groups for LAYOUTS only** (Barry/Winston feedback) - Shared components live in `components/`, not route groups
- **`components/shared/`** for phase-agnostic components (guide manager, cost dashboard)
- **Single `AppContext.tsx`** instead of three separate context files
- **`hooks/useAppActions.ts`** exposes all actions from unified context

**Naming Conventions:**
- **Components:** PascalCase (`GuideChecklist.tsx`)
- **Hooks:** camelCase with `use` prefix (`useGuideExecution.ts`)
- **Utilities:** camelCase (`localStorage.ts`)
- **Schemas:** kebab-case with `.schema.ts` suffix (`guide.schema.ts`)
- **API Routes:** kebab-case folders (`/api/edge/rate-limit/`)

**Two-Phase Design Language Clarification:**

Route groups `(discovery)` and `(execution)` apply ONLY to page layouts:
- **Discovery layout:** Calm colors, polished UI, exploratory interactions
- **Execution layout:** High-contrast AAA (7:1), bottom-anchored actions, large text

**Components can be used across phases.** Example: `InlineAIChat.tsx` (Discovery-styled) can be embedded in a guide execution page (Execution layout). The layout sets the phase tone, components adapt.

**Rationale:** Next.js App Router conventions (app/ directory). Clear separation of Edge vs Serverless API routes. Route groups for layouts prevent refactoring hell if shared components needed. Unified AppContext simplifies state. AI-maintainable through predictable locations and clear naming.

---

**Bundle Size Budget Monitoring**

**Current Framework Overhead:**
- React Hook Form: ~8KB gzipped
- Zod: ~12KB gzipped
- Headless UI: ~15KB gzipped
- @ducanh2912/next-pwa: ~5KB gzipped
- **Total Framework:** ~40KB of 200KB budget (20%)

**If Pre-Flight Modal Pushes Over Budget:**

Option 1: Use native HTML5 form validation for MVP
```html
<form>
  <input type="checkbox" required>
  <input type="number" min="1" max="10" required>
  <!-- Native validation, 0KB overhead -->
</form>
```

Option 2: Defer React Hook Form to Epic 3+
- Epic 1: Native forms with basic Zod validation
- Epic 3+: Upgrade to React Hook Form if user feedback demands better UX

**Bundle Size Monitoring:**
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

Run `npm run analyze` before each Epic to verify bundle stays under 200KB gzipped.

**Rationale:** Pre-Flight Modal is safety-critical (FR36-FR44), but native forms can meet WCAG 2.1 AA requirements. Bundle budget is a hard constraint (low-end devices). Monitor, adapt, optimize.

---

### Decision Impact Analysis

**Implementation Sequence (Updated):**

1. **Epic 0: Foundation** - Initialize project, configure tooling, deploy to Vercel
2. **Epic 0.5: Design System** - Build UI primitives with Two-Phase Design Language
3. **Epic 1: Core Value + Smoke Tests** - API routes, state management, guide generation, **offline mode validation**
4. **Epic 2: Offline Refinement** - Service Worker optimization, localStorage quota management
5. **Epic 3+: Scale & Perfect** - Comprehensive E2E tests, performance optimization, expand coverage

**Critical Epic 1 Additions (from Party Mode feedback):**
- Story 1.5: Validate offline mode in airplane mode with real device
- Story 1.6: Test localStorage quota warning at 80% capacity
- Story 1.7: Verify Service Worker atomic caching (all-or-nothing)
- Story 1.8: Smoke test CI/CD pipeline (unit + E2E critical paths)

**Cross-Component Dependencies:**

- **API Architecture → State Management:** Error responses with `offlineMode` flag trigger CacheContext to switch to localStorage
- **Rate Limiting → Cost Monitoring:** Redis pipelining combines both in single KV roundtrip (performance optimization)
- **Data Validation → localStorage:** Zod schemas validate data on read with graceful recovery UI (corruption handling)
- **Code Organization → Two-Phase Design Language:** Route groups for layouts only, shared components in `components/`
- **Error Handling → PWA Experience:** Structured errors guide users to offline mode seamlessly (NFR-R3)
- **Hard Cap → Offline Mode:** Budget exceeded blocks new guides but keeps cached guides accessible (business continuity)
- **localStorage Quota → Guide Management:** 80% warning triggers UI for pinning/evicting guides (failure mode → feature)

---

**Party Mode Validation:** Winston (Architect), Barry (Solo Dev), Murat (Test Architect), John (PM), and Sally (UX Designer) reviewed and enhanced these decisions with: KV optimization (Redis pipelining + circuit breaker), unified AppContext (no nested providers), Epic 1 smoke tests (offline mode validation), localStorage corruption handling, hard cap UX strategy, and bundle size monitoring.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 23 areas where AI agents could make different choices without explicit patterns

**Purpose:** These patterns ensure multiple AI agents write compatible, consistent code that works together seamlessly. Every pattern addresses a specific conflict point where agents might diverge without guidance.

---

### Naming Patterns

#### TypeScript Naming Conventions

**Variables & Functions:**
- `camelCase` for variables and functions: `const userId = 123;`, `function getUserData() {}`
- `PascalCase` for React components and types: `UserCard.tsx`, `type UserProfile = {...}`
- `UPPER_SNAKE_CASE` for constants: `const MAX_RETRY_ATTEMPTS = 3;`
- `kebab-case` for CSS class names only: `class="user-card-container"`

**Async Function Naming (CRITICAL - prevents sync/async confusion):**
- `fetch*` or `load*` prefix = async function: `fetchGuideData()`, `loadUserProfile()`
- `get*` or `calculate*` prefix = sync function: `getUserId()`, `calculateCost()`
- Example violation: ❌ `async function getData()` → ✅ `async function fetchData()`

**Component Props Naming:**
- Handler props: `on` prefix → `onClick`, `onSubmit`, `onGuideComplete`
- Boolean props: omit `is` prefix → `loading` not `isLoading`, `disabled` not `isDisabled`
- Data props: descriptive nouns → `guide`, `stepData`, `costSummary`

**localStorage Keys:**
- Namespace pattern: `autocare:{category}:{identifier}`
- Examples:
  - `autocare:guide:fr71-active` (current guide state)
  - `autocare:cache:guides` (cached guide data)
  - `autocare:costs:2024-01` (monthly cost tracking)
- Why: Prevents key collisions, enables category-based clearing, debuggable in DevTools

---

### Structure Patterns

#### Type vs Interface

**Rule:** Prefer `type` for all definitions. Use `interface` ONLY when extending third-party library types.

**Rationale:** Consistency > flexibility. Types are more predictable for AI agents.

```typescript
// ✅ Good - use type
type Guide = {
  id: string;
  title: string;
  steps: Step[];
};

// ❌ Avoid - interface for app types
interface Guide {
  id: string;
  title: string;
  steps: Step[];
}

// ✅ Exception - extending library
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
}
```

#### Export Style

**Rule:** Inline named exports ONLY. No default exports. No barrel files (`index.ts` re-exports).

```typescript
// ✅ Good - inline named export
export function GuideCard({ guide }: { guide: Guide }) {
  return <div>{guide.title}</div>;
}

export type GuideCardProps = {
  guide: Guide;
};

// ❌ Avoid - default export
export default function GuideCard() {}

// ❌ Avoid - barrel file
export { GuideCard } from './GuideCard';
export { StepCard } from './StepCard';
```

**Imports:** Always use direct imports: `import { GuideCard } from '@/components/GuideCard';`

#### Component File Order

**Mandatory sequence for all React component files:**

1. External imports (React, libraries)
2. Internal imports (components, utils)
3. Type definitions
4. Helper functions/constants (non-exported)
5. Main component
6. Exported helper functions (if any)

```typescript
// 1. External imports
import { useState } from 'react';
import { useSWR } from 'swr';

// 2. Internal imports
import { fetchGuideData } from '@/lib/api';
import { GuideCard } from '@/components/GuideCard';

// 3. Types
type GuideListProps = {
  category: string;
};

// 4. Helpers (non-exported)
const filterActiveGuides = (guides: Guide[]) => guides.filter(g => g.status === 'active');

// 5. Component
export function GuideList({ category }: GuideListProps) {
  // component code
}

// 6. Exported helpers (if needed)
export function isGuideComplete(guide: Guide) {
  return guide.completedSteps.length === guide.steps.length;
}
```

#### Test Organization

**Component Tests:** Co-located with component files
- `GuideCard.tsx` → `GuideCard.test.tsx` in same directory

**API Route Tests:** Separate tests directory
- `app/api/guides/route.ts` → `tests/api/guides.test.ts`

**Shared Test Utilities:**
```
tests/
  factories/        # Test data factories: createGuide(), createStep()
  fixtures/         # Static test data: SAMPLE_GUIDE, EMPTY_GUIDE
  helpers/          # Test utilities: mockLocalStorage(), waitForAsync()
```

**Test Structure Pattern:**
```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { createGuide } from '@/tests/factories/guideFactory';

describe('GuideCard', () => {
  beforeEach(() => {
    // setup
  });

  test('should display guide title when guide is provided', () => {
    const guide = createGuide({ title: 'Test Guide' });
    // test implementation
  });

  test('should show loading state when guide is null', () => {
    // test implementation
  });
});
```

---

### Format Patterns

#### API Response Formats

**Success Response:** Return data directly (no wrapper object)

```typescript
// ✅ Good - direct response
export async function GET(request: Request) {
  const guide = await fetchGuide(id);
  return Response.json(guide);
}
// Client receives: { id: '123', title: '...' }

// ❌ Avoid - wrapped response
return Response.json({ data: guide, success: true });
```

**Error Response:** Structured format with offline mode flag

```typescript
// ✅ Standard error format
return Response.json(
  {
    error: {
      code: 'GUIDE_NOT_FOUND',
      message: 'Guide not found. Check your offline cache.',
      offlineMode: !isOnline,
    },
  },
  { status: 404 }
);
```

**Status Codes:**
- `200` - Success with data
- `201` - Created (new resource)
- `400` - Client error (validation failed)
- `404` - Not found
- `429` - Rate limited (with `Retry-After` header)
- `500` - Server error (with offline fallback guidance)
- `503` - Service unavailable (AI API down)

#### Date Formats

**Rule:** ISO 8601 strings everywhere. Format at component level only.

```typescript
// ✅ API returns ISO 8601
return Response.json({
  guide: {
    createdAt: new Date().toISOString(), // "2024-01-15T10:30:00.000Z"
  },
});

// ✅ localStorage stores ISO 8601
localStorage.setItem('autocare:guide:created', new Date().toISOString());

// ✅ Component formats for display
function GuideCard({ guide }: { guide: Guide }) {
  const formattedDate = new Date(guide.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return <div>Created: {formattedDate}</div>;
}

// ❌ Avoid - storing timestamps
localStorage.setItem('created', Date.now().toString()); // NO!

// ❌ Avoid - formatting in API
return Response.json({ createdAt: '01/15/2024' }); // NO!
```

#### JSON Field Naming

**Rule:** `camelCase` for all JSON fields in API requests/responses and localStorage.

```typescript
// ✅ Good - camelCase everywhere
{
  "userId": "123",
  "guideData": {
    "currentStep": 2,
    "completedSteps": [0, 1]
  }
}

// ❌ Avoid - snake_case (only use if external API requires it)
{
  "user_id": "123",
  "guide_data": {
    "current_step": 2
  }
}
```

---

### Communication Patterns

#### State Update Patterns

**Rule:** Immutable updates with spread operators. No Immer for MVP.

```typescript
// ✅ Good - immutable spread
setGuide({
  ...guide,
  currentStep: guide.currentStep + 1,
  completedSteps: [...guide.completedSteps, guide.currentStep],
});

// ✅ Good - immutable array update
setGuides(guides.map(g => (g.id === guideId ? { ...g, status: 'complete' } : g)));

// ❌ Avoid - direct mutation
guide.currentStep++; // NO!
guide.completedSteps.push(2); // NO!
setGuide(guide); // NO!
```

#### Action Naming Conventions

**Rule:** Verb-first naming for all action functions (state updates, API calls, event handlers).

```typescript
// ✅ Good - verb-first
const actions = {
  startGuide: (guide: Guide) => void,
  completeStep: (stepIndex: number) => void,
  pauseGuide: () => void,
  cacheGuide: (guide: Guide) => Promise<void>,
  evictGuide: (guideId: string) => void,
  trackCost: (feature: string, cost: number) => void,
};

// ❌ Avoid - noun-first
const actions = {
  guideStart: (guide: Guide) => void, // NO!
  stepComplete: (stepIndex: number) => void, // NO!
};
```

---

### Process Patterns

#### Loading State Management

**Rule:** Status enum pattern prevents invalid states.

```typescript
// ✅ Good - status enum
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

const [status, setStatus] = useState<RequestStatus>('idle');
const [data, setData] = useState<Guide | null>(null);
const [error, setError] = useState<Error | null>(null);

// Impossible to have isLoading=true + isError=true simultaneously
if (status === 'loading') return <Spinner />;
if (status === 'error') return <ErrorMessage error={error} />;
if (status === 'success') return <GuideDisplay guide={data} />;

// ❌ Avoid - separate boolean flags
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
// Can accidentally set both to true → invalid state
```

#### Error Handling Patterns

**Structured Error Format:**

```typescript
type AppError = {
  code: string; // Machine-readable: 'RATE_LIMIT_EXCEEDED', 'GUIDE_NOT_FOUND'
  message: string; // User-friendly: "You've reached your daily limit"
  offlineMode: boolean; // Can user continue with cached data?
  retryable: boolean; // Should we show retry button?
};
```

**Global Error Boundary:** Catches React errors, redirects to `/error` with state recovery.

**API Error Recovery:**

```typescript
async function fetchGuideWithFallback(guideId: string): Promise<Guide> {
  try {
    const response = await fetch(`/api/guides/${guideId}`);
    if (!response.ok) throw new Error('API error');
    return response.json();
  } catch (error) {
    // Fallback to cached data
    const cached = localStorage.getItem(`autocare:cache:guide:${guideId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error; // No fallback available
  }
}
```

#### Retry Logic Patterns

**Exponential Backoff:** 3 attempts with 2s, 4s, 8s delays

```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

**Retry-After Header:** Respect rate limit headers from Vercel KV/AI APIs

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const delaySeconds = retryAfter ? parseInt(retryAfter) : 60;
  // Show user: "Rate limited. Try again in {delaySeconds} seconds."
}
```

#### localStorage Patterns (CRITICAL)

**Rule:** Ban direct `localStorage.setItem()` calls. Use typed helpers with Zod validation ONLY.

```typescript
// ✅ Good - typed helper with validation
export function saveGuide(guide: Guide): void {
  try {
    const validated = GuideSchema.parse(guide); // Zod validation
    localStorage.setItem(`autocare:guide:${guide.id}`, JSON.stringify(validated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Guide validation failed:', error.errors);
      // Show user-friendly recovery UI
    }
    throw error;
  }
}

export function loadGuide(guideId: string): Guide | null {
  try {
    const data = localStorage.getItem(`autocare:guide:${guideId}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return GuideSchema.parse(parsed); // Validate on read
  } catch (error) {
    console.error('localStorage corruption detected:', error);
    localStorage.removeItem(`autocare:guide:${guideId}`); // Clear corrupt data
    // Show user recovery UI: "We detected an issue. Starting fresh."
    return null;
  }
}

// ❌ FORBIDDEN - direct localStorage calls
localStorage.setItem('guide', JSON.stringify(guide)); // NO! Type-unsafe, no validation
const guide = JSON.parse(localStorage.getItem('guide')); // NO! No corruption handling
```

**Quota Management:** 80% threshold triggers UI for guide pinning/eviction (see Core Architectural Decisions → localStorage corruption handling).

#### Magic Numbers

**Rule:** Any number > 1 (except array indices, percentages) gets a named constant.

```typescript
// ✅ Good - named constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE_MS = 2000;
const STORAGE_QUOTA_WARNING_THRESHOLD = 0.8; // 80% - percentage exception

for (let i = 0; i < guides.length; i++) {} // ✅ Array index exception

// ❌ Avoid - magic numbers
if (attempts > 3) {} // NO! What does 3 mean?
setTimeout(() => {}, 2000); // NO! Why 2000ms?
```

**Exception:** Percentages can be inline if context is clear: `if (used / total > 0.8)`

---

### Testing Patterns

#### Test Naming Convention

**Pattern:** `describe` block + `should [behavior] when [condition]`

```typescript
describe('GuideCard', () => {
  test('should display guide title when guide is provided', () => {
    // test
  });

  test('should show loading state when guide is null', () => {
    // test
  });

  test('should call onComplete when user clicks Complete button', () => {
    // test
  });

  test('should disable Complete button when step is incomplete', () => {
    // test
  });
});
```

**API Route Tests:**

```typescript
describe('POST /api/guides', () => {
  test('should create guide when valid data is provided', async () => {
    // test
  });

  test('should return 400 when required fields are missing', async () => {
    // test
  });

  test('should return 429 when rate limit is exceeded', async () => {
    // test
  });
});
```

#### Test Data Factories

**Pattern:** Factory functions with `Partial<T>` overrides in `tests/factories/`

```typescript
// tests/factories/guideFactory.ts
export function createGuide(overrides?: Partial<Guide>): Guide {
  return {
    id: 'guide-123',
    title: 'Test Guide',
    description: 'A test guide',
    steps: [createStep(), createStep()],
    currentStep: 0,
    completedSteps: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides, // Override any defaults
  };
}

export function createStep(overrides?: Partial<Step>): Step {
  return {
    id: 'step-1',
    title: 'Test Step',
    content: 'Step content',
    estimatedCost: 0.02,
    ...overrides,
  };
}

// Usage in tests
test('should show cost warning when step exceeds budget', () => {
  const expensiveGuide = createGuide({
    steps: [createStep({ estimatedCost: 0.5 })],
  });
  // test implementation
});
```

**Fixtures vs Factories:**
- **Factories:** Dynamic data with overrides → `createGuide({ title: 'Custom' })`
- **Fixtures:** Static reference data → `SAMPLE_GUIDE`, `EMPTY_GUIDE`, `COMPLEX_GUIDE`

---

### UX Patterns

#### Copy Constants Centralization

**Rule:** All user-facing text in `lib/copy.ts` (not inline in components).

```typescript
// lib/copy.ts
export const LOADING_MESSAGES = {
  FETCHING_GUIDE: 'Loading your guide...',
  PROCESSING_STEP: 'Processing step...',
  SAVING_PROGRESS: 'Saving your progress...',
} as const;

export const ERROR_MESSAGES = {
  GUIDE_NOT_FOUND: "We couldn't find that guide. Check your offline cache.",
  RATE_LIMIT: "You've reached your daily limit. Cached guides are still available.",
  NETWORK_ERROR: 'Connection issue. Switching to offline mode.',
} as const;

export const EMPTY_STATES = {
  NO_GUIDES: 'No guides yet. Start exploring!',
  NO_CACHED_GUIDES: 'No cached guides available offline.',
} as const;

// ✅ Component usage
import { LOADING_MESSAGES } from '@/lib/copy';
<Spinner message={LOADING_MESSAGES.FETCHING_GUIDE} />

// ❌ Avoid - inline text
<Spinner message="Loading your guide..." /> // NO! Hard to update, test, translate
```

**Rationale:** Centralized copy enables easy updates, testing, and future i18n support.

#### Icon Accessibility Patterns

**Rule:**
- Primary actions: Icon + text label
- Secondary actions: Icon only + tooltip

```typescript
// ✅ Primary action - icon + text
<button>
  <SaveIcon aria-hidden="true" />
  <span>Save Guide</span>
</button>

// ✅ Secondary action - icon + tooltip
<button aria-label="Delete guide">
  <TrashIcon aria-hidden="true" />
</button>
<Tooltip>Delete guide</Tooltip>

// ❌ Avoid - icon only for primary action
<button><SaveIcon /></button> // NO! Not accessible, unclear intent
```

#### Error Message Tone

**Rule:** Friendly, actionable, and solution-focused. Never blame user.

```typescript
// ✅ Good - friendly, actionable
"We couldn't load that guide. Try checking your offline cache, or refresh when you're back online."

// ❌ Avoid - technical, blame-y
"Error: Guide not found in database. Invalid ID." // NO! Too technical
"You entered an invalid guide ID." // NO! Blames user
```

---

### Code Organization Patterns

#### Route Groups for Layouts Only

**Rule:** Use route groups `(discovery)` and `(execution)` for layout concerns ONLY (headers, nav). Shared components live in `components/`.

```
app/
  (discovery)/
    layout.tsx        # Discovery-specific header/nav
    page.tsx          # Home page
    search/page.tsx
  (execution)/
    layout.tsx        # Execution-specific header
    guide/[id]/page.tsx
  api/
    guides/route.ts

components/           # ✅ Shared components here
  GuideCard.tsx
  StepCard.tsx
  ui/
    Button.tsx
    Spinner.tsx
```

**Why:** Route groups are for layout hierarchy, not feature organization. Shared components in `components/` are discoverable by all agents.

---

### Process Patterns

#### External Library Wrapping Exceptions

**Rule:** Wrapping external libraries is ALLOWED when it provides type safety or consistency.

```typescript
// ✅ Exception - wrapping useSWR for type safety
export function useGuide(guideId: string) {
  const { data, error, isLoading } = useSWR<Guide>(
    `/api/guides/${guideId}`,
    fetcher
  );
  return {
    guide: data,
    error,
    isLoading,
  };
}

// ✅ Exception - wrapping fetch for retry logic
export async function fetchWithRetry<T>(url: string): Promise<T> {
  // retry logic
}
```

**Rationale:** Not all abstractions are premature. Wrappers that enforce patterns (type safety, error handling) are valuable.

#### Pattern Evolution Process

**Rule:** When 3+ pattern violations occur, trigger architecture review → update this doc → enforce via ESLint (Epic 3+).

```
Example:
1. Agent A uses `isLoading` prop
2. Agent B uses `loading` prop
3. Agent C uses `isLoading` prop
→ 3+ violations detected
→ Architecture review: decide `loading` is the standard
→ Update this doc: "Boolean props: omit `is` prefix"
→ (Epic 3+) Add ESLint rule: `react/boolean-prop-naming`
```

**Metrics:** Track violations in code review, not CI (for MVP).

#### ESLint Enforcement Timing

**Rule:** Defer ESLint rule enforcement to Epic 3+ (Post-MVP). MVP focuses on documentation and review-based enforcement.

**Rationale:** Premature linting slows MVP delivery. Document patterns first, enforce with tooling later.

---

## Enforcement Guidelines

### All AI Agents MUST:

1. **Read this document before implementing ANY code** - patterns prevent agent conflicts
2. **Use typed localStorage helpers with Zod validation** - corruption prevention is non-negotiable
3. **Follow async function naming** - `fetch*`/`load*` = async, `get*`/`calculate*` = sync
4. **Return direct API responses** - no wrapper objects for success responses
5. **Use ISO 8601 dates everywhere** - format only at component level
6. **Implement immutable state updates** - spread operators, no direct mutations
7. **Use status enum for loading states** - prevents invalid state combinations
8. **Centralize copy in `lib/copy.ts`** - no inline user-facing text
9. **Name constants for magic numbers** - any number > 1 gets a name (except array indices, percentages)
10. **Follow test naming convention** - `should [behavior] when [condition]`
11. **Create test data with factories** - `createGuide(overrides)` in `tests/factories/`
12. **Use inline named exports only** - no default exports, no barrel files
13. **Prefer `type` over `interface`** - use `interface` only for extending libraries
14. **Follow component file order** - imports → types → helpers → component → exported helpers
15. **Use verb-first action naming** - `startGuide`, `completeStep`, not `guideStart`

### Pattern Verification

**During Code Review:**
- Reviewer checks for pattern adherence using this document as checklist
- Flag violations with pattern reference: "Violation: Magic Numbers pattern - line 42"
- Track violations in GitHub PR comments (no automated tracking for MVP)

**During Implementation:**
- Agent self-checks patterns before marking story as complete
- Document intentional deviations with rationale (rare)

### Pattern Violations

**Process:**
1. Code reviewer identifies violation in PR
2. Comment with pattern reference: "See Implementation Patterns → Naming Patterns → Async Function Naming"
3. Developer fixes before merge
4. If 3+ violations of same pattern → trigger architecture review

**Post-MVP (Epic 3+):**
- Add ESLint rules for enforceable patterns
- Automated CI checks for violations

### Pattern Updates

**When to Update:**
- New technology added to stack
- Pattern proves impractical during implementation
- 3+ violations indicate pattern is unclear or incorrect

**How to Update:**
1. Document proposed change
2. Review with team (or Party Mode if solo)
3. Update this document
4. Announce change to all agents (e.g., Slack, PR comment)
5. (Epic 3+) Update ESLint rules

---

## Pattern Examples

### Good Examples

**Example 1: Async Function with Retry**

```typescript
// ✅ Follows: async naming, retry pattern, error handling
export async function fetchGuideData(guideId: string): Promise<Guide> {
  return fetchWithRetry(async () => {
    const response = await fetch(`/api/guides/${guideId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch guide: ${response.statusText}`);
    }
    return response.json();
  }, MAX_RETRY_ATTEMPTS);
}
```

**Example 2: Component with Loading States**

```typescript
// ✅ Follows: status enum, copy constants, prop naming
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/lib/copy';

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export function GuideDisplay({ guideId }: { guideId: string }) {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setStatus('loading');
    fetchGuideData(guideId)
      .then(data => {
        setGuide(data);
        setStatus('success');
      })
      .catch(err => {
        setError(err);
        setStatus('error');
      });
  }, [guideId]);

  if (status === 'loading') {
    return <Spinner message={LOADING_MESSAGES.FETCHING_GUIDE} />;
  }
  if (status === 'error') {
    return <ErrorMessage message={ERROR_MESSAGES.GUIDE_NOT_FOUND} />;
  }
  if (status === 'success' && guide) {
    return <GuideCard guide={guide} />;
  }
  return null;
}
```

**Example 3: localStorage Helper with Validation**

```typescript
// ✅ Follows: typed helpers, Zod validation, namespace pattern, error recovery
import { z } from 'zod';

const GuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(StepSchema),
  currentStep: z.number(),
});

export function saveGuide(guide: Guide): void {
  try {
    const validated = GuideSchema.parse(guide);
    const key = `autocare:guide:${guide.id}`;
    localStorage.setItem(key, JSON.stringify(validated));
  } catch (error) {
    console.error('Guide validation failed:', error);
    throw error;
  }
}

export function loadGuide(guideId: string): Guide | null {
  try {
    const key = `autocare:guide:${guideId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return GuideSchema.parse(parsed);
  } catch (error) {
    console.error('localStorage corruption detected:', error);
    localStorage.removeItem(`autocare:guide:${guideId}`);
    // Show recovery UI (implementation in component)
    return null;
  }
}
```

**Example 4: Test with Factory and Naming Convention**

```typescript
// ✅ Follows: test naming, factory usage, describe structure
import { describe, test, expect } from 'vitest';
import { createGuide, createStep } from '@/tests/factories';
import { GuideCard } from './GuideCard';

describe('GuideCard', () => {
  test('should display guide title when guide is provided', () => {
    const guide = createGuide({ title: 'Test Guide' });
    render(<GuideCard guide={guide} />);
    expect(screen.getByText('Test Guide')).toBeInTheDocument();
  });

  test('should show cost warning when estimated cost exceeds budget', () => {
    const expensiveGuide = createGuide({
      steps: [createStep({ estimatedCost: 0.5 })],
    });
    render(<GuideCard guide={expensiveGuide} />);
    expect(screen.getByText(/exceeds budget/i)).toBeInTheDocument();
  });
});
```

---

### Anti-Patterns

**Anti-Pattern 1: Direct localStorage + No Validation**

```typescript
// ❌ Violations: direct localStorage, no validation, no namespace, no error handling
function saveGuide(guide: Guide) {
  localStorage.setItem('guide', JSON.stringify(guide)); // NO!
}

function loadGuide(): Guide | null {
  const data = localStorage.getItem('guide'); // NO!
  return data ? JSON.parse(data) : null; // Corrupt data = crash
}
```

**Fix:** Use typed helpers with Zod validation (see Good Example 3).

**Anti-Pattern 2: Separate Boolean Flags for Loading States**

```typescript
// ❌ Violations: separate flags allow invalid states
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [data, setData] = useState(null);

// Can accidentally have isLoading=true AND isError=true
// Leads to bugs like showing spinner + error message simultaneously
```

**Fix:** Use status enum pattern (see Good Example 2).

**Anti-Pattern 3: Inline Copy + No Async Naming**

```typescript
// ❌ Violations: async function without fetch/load prefix, inline copy
export async function getData(id: string) {
  const response = await fetch(`/api/data/${id}`);
  if (!response.ok) {
    return { error: 'Failed to load data' }; // Inline copy
  }
  return response.json();
}

// Component usage
{isLoading && <div>Loading...</div>} // Inline copy
```

**Fix:**

```typescript
// ✅ async naming + copy constants
export async function fetchData(id: string) {
  const response = await fetch(`/api/data/${id}`);
  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.DATA_FETCH_FAILED);
  }
  return response.json();
}

{isLoading && <Spinner message={LOADING_MESSAGES.FETCHING_DATA} />}
```

**Anti-Pattern 4: Magic Numbers + Direct Mutations**

```typescript
// ❌ Violations: magic numbers, direct state mutation
function retryFetch() {
  for (let i = 0; i < 3; i++) { // Magic number: 3
    setTimeout(() => fetch(), 2000); // Magic number: 2000
  }
}

function addStep(step: Step) {
  guide.steps.push(step); // Direct mutation
  guide.currentStep++; // Direct mutation
  setGuide(guide); // NO! React won't detect change
}
```

**Fix:**

```typescript
// ✅ Named constants + immutable updates
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

function retryFetch() {
  for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
    setTimeout(() => fetch(), RETRY_DELAY_MS);
  }
}

function addStep(step: Step) {
  setGuide({
    ...guide,
    steps: [...guide.steps, step],
    currentStep: guide.currentStep + 1,
  });
}
```

---

## Summary

**23 Patterns Defined** across 8 categories ensure AI agent consistency:

1. **Naming:** TypeScript conventions, async function prefixes, prop naming, localStorage keys
2. **Structure:** Type vs interface, exports, file order, test organization
3. **Format:** API responses, dates, JSON field naming
4. **Communication:** State updates, action naming
5. **Process:** Loading states, error handling, retry logic, localStorage helpers, magic numbers
6. **Testing:** Test naming, data factories
7. **UX:** Copy centralization, icon accessibility, error tone
8. **Code Organization:** Route groups, component placement

**Critical Patterns (Block Implementation if Violated):**
- Typed localStorage helpers with Zod validation
- Async function naming (`fetch*`/`load*`)
- Status enum for loading states
- Immutable state updates
- Named constants for magic numbers
- Test naming convention

**Enforcement:** Review-based for MVP, ESLint automation in Epic 3+. Pattern violations trigger architecture review after 3+ occurrences.

---

**Party Mode Validation:** Winston (Architect), Barry (Solo Dev), Murat (Test Architect), John (PM), and Sally (UX Designer) reviewed and enhanced these patterns with 15 additional critical rules: localStorage corruption handling, direct `setItem()` ban, magic number naming, test naming conventions, component prop naming, async function naming, test data factories, copy centralization, icon accessibility, error message tone, component file order, type vs interface preference, external library wrapping exceptions, pattern evolution process, and ESLint timing. Together with the original 8 patterns, this creates a comprehensive 23-pattern system preventing AI agent conflicts.

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
autocarecompanion/
├── README.md
├── package.json
├── next.config.js                       # PWA plugin: withPWA({ dest: 'public', sw: 'sw.js' })
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .env.local
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                       # GitHub Actions CI (lint, test, build)
│       └── deploy.yml                   # Vercel deployment automation
│
├── public/
│   ├── manifest.json                    # PWA manifest (offline-first)
│   ├── sw.js                            # Service Worker (GENERATED from lib/cache/service-worker.ts)
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── ymmt/                            # Vehicle data JSON (Year-Make-Model-Trim)
│   │   ├── years.json
│   │   ├── makes.json
│   │   └── models.json
│   └── assets/
│       └── logo.svg
│
├── src/
│   ├── app/
│   │   ├── globals.css                  # Global Tailwind styles
│   │   ├── layout.tsx                   # Root layout (AppContext provider)
│   │   ├── page.tsx                     # Home page (vehicle selector entry)
│   │   ├── error.tsx                    # Global error boundary
│   │   │
│   │   ├── (discovery)/                 # Discovery phase layout (calm colors, polished UI)
│   │   │   ├── layout.tsx               # Discovery header (back button, offline indicator)
│   │   │   ├── vehicle-select/
│   │   │   │   └── page.tsx             # FR2: YMMT cascading selector
│   │   │   ├── vin-decode/
│   │   │   │   └── page.tsx             # FR3: VIN decode
│   │   │   ├── symptom-chat/
│   │   │   │   └── page.tsx             # FR1: AI symptom-based diagnosis
│   │   │   ├── obd-scan/
│   │   │   │   └── page.tsx             # FR5: OBD code entry/validation
│   │   │   └── known-issues/
│   │   │       └── page.tsx             # FR19-28: Known Issues briefing
│   │   │
│   │   ├── (execution)/                 # Execution phase layout (high-contrast AAA, bottom-anchored)
│   │   │   ├── layout.tsx               # Execution header (progress indicator, cache badge)
│   │   │   ├── pre-flight/
│   │   │   │   └── [guideId]/
│   │   │   │       └── page.tsx         # FR36-44: Pre-Flight Modal
│   │   │   ├── guide/
│   │   │   │   └── [guideId]/
│   │   │   │       └── page.tsx         # FR8-18: Guide execution
│   │   │   └── paused-guides/
│   │   │       └── page.tsx             # FR13: Resume paused guides
│   │   │
│   │   ├── admin/                       # Admin dashboard (separate auth boundary)
│   │   │   ├── layout.tsx               # Admin auth wrapper
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # FR62-64: Cost monitoring
│   │   │   ├── known-issues/
│   │   │   │   └── page.tsx             # FR66-68: Known Issues review
│   │   │   ├── validation-queue/
│   │   │   │   └── page.tsx             # FR61: Spot-check first 10 guides
│   │   │   └── settings/
│   │   │       └── page.tsx             # FR70: Vacation mode, budget caps, rate limits
│   │   │
│   │   └── api/                         # API routes (flat structure, runtime via export)
│   │       ├── diagnosis/
│   │       │   └── route.ts             # POST - export const runtime = 'nodejs' (AI)
│   │       ├── guides/
│   │       │   ├── generate/
│   │       │   │   └── route.ts         # POST - runtime = 'nodejs' (AI generation)
│   │       │   ├── [guideId]/
│   │       │   │   ├── route.ts         # GET - runtime = 'edge' (cached retrieval)
│   │       │   │   └── chat/
│   │       │   │       └── route.ts     # POST - runtime = 'nodejs' (AI chat)
│   │       │   └── validate/
│   │       │       └── route.ts         # POST - runtime = 'nodejs' (validation pipeline)
│   │       ├── vehicle/
│   │       │   ├── vin-decode/
│   │       │   │   └── route.ts         # GET - runtime = 'edge' (NHTSA proxy)
│   │       │   └── ymmt/
│   │       │       └── route.ts         # GET - runtime = 'edge' (static JSON)
│   │       ├── known-issues/
│   │       │   ├── list/
│   │       │   │   └── route.ts         # GET - runtime = 'edge' (KV cache)
│   │       │   ├── gather/
│   │       │   │   └── route.ts         # POST - runtime = 'nodejs' (background)
│   │       │   └── admin/
│   │       │       └── route.ts         # POST - runtime = 'nodejs' (batch approval)
│   │       ├── parts/
│   │       │   └── recommendations/
│   │       │       └── route.ts         # GET - runtime = 'nodejs' (RockAuto API)
│   │       ├── monitoring/
│   │       │   ├── costs/
│   │       │   │   └── route.ts         # GET/POST - runtime = 'edge' (KV increment)
│   │       │   └── usage/
│   │       │       └── route.ts         # GET - runtime = 'edge' (metrics)
│   │       └── rate-limit/
│   │           └── route.ts             # Middleware - runtime = 'edge' (Redis pipelining)
│   │
│   ├── components/
│   │   ├── discovery/                   # Discovery-phase styled components (calm, exploratory)
│   │   │   ├── YMMTSelector.tsx         # FR2: Cascading selector
│   │   │   ├── VINDecoder.tsx           # FR3: VIN input with helper
│   │   │   ├── SymptomChat.tsx          # FR1: AI symptom chat interface
│   │   │   └── InlineAIChat.tsx         # FR17-18: Step-scoped AI chat (calm style)
│   │   │
│   │   ├── execution/                   # Execution-phase styled components (high-contrast, action-focused)
│   │   │   ├── GuideChecklist.tsx       # FR9-11: Step-by-step checklist
│   │   │   ├── GuideStep.tsx            # FR12-16: Individual step with tips
│   │   │   ├── ProgressIndicator.tsx    # FR11: "Step 5 of 12" progress bar
│   │   │   ├── InlineTip.tsx            # FR15, FR47: Offline-available tips
│   │   │   └── SafetyWarning.tsx        # FR16: Visual safety indicators
│   │   │
│   │   ├── known-issues/                # Known Issues components (discovery-styled)
│   │   │   ├── KnownIssuesList.tsx      # FR19-26: Known Issues list with filters
│   │   │   ├── KnownIssueCard.tsx       # FR20-23: Issue card
│   │   │   └── ReportIssueButton.tsx    # FR26: "Report an Issue"
│   │   │
│   │   ├── parts/                       # Parts components (used in both phases)
│   │   │   ├── PartsComparison.tsx      # FR30: OEM vs aftermarket decision framework
│   │   │   ├── PartRecommendation.tsx   # FR32-33: Curated brand recommendations
│   │   │   └── WarrantyWarning.tsx      # FR34: Warranty impact messaging
│   │   │
│   │   ├── modals/                      # Modal components (execution-styled)
│   │   │   ├── PreFlightModal.tsx       # FR36-44: Pre-Flight Modal
│   │   │   ├── ToolsSection.tsx         # FR37: Required tools with alternatives
│   │   │   ├── PartsSection.tsx         # FR38: Required parts with pricing
│   │   │   └── SafetySection.tsx        # FR40, FR42: Safety level + warnings
│   │   │
│   │   ├── offline/                     # Offline components (phase-agnostic)
│   │   │   ├── OfflineIndicator.tsx     # FR46, FR52: Offline state badge
│   │   │   ├── CacheButton.tsx          # FR50: "Cache for offline" button
│   │   │   └── CachedBadge.tsx          # FR49: "✓ Cached for offline" indicator
│   │   │
│   │   ├── admin/                       # Admin components
│   │   │   ├── CostDashboard.tsx        # FR62-64: API cost tracking
│   │   │   ├── BudgetGauge.tsx          # FR64: Visual budget indicator (50/75/100%)
│   │   │   ├── DailyBreakdown.tsx       # FR63: Cost breakdown by feature
│   │   │   ├── BudgetWarning.tsx        # FR64: Budget warning alerts
│   │   │   ├── KnownIssuesReviewQueue.tsx  # FR66-68: Batch approval
│   │   │   ├── ValidationQueue.tsx      # FR61: First 10 guides spot-check
│   │   │   └── VacationModeToggle.tsx   # FR70: Vacation mode control
│   │   │
│   │   └── ui/                          # Reusable UI primitives (phase-agnostic)
│   │       ├── Button.tsx
│   │       ├── Spinner.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       └── states/                  # UI state components
│   │           ├── EmptyState.tsx       # Generic empty state
│   │           ├── ErrorMessage.tsx     # Generic error display
│   │           ├── LoadingSkeleton.tsx  # Generic loading skeleton
│   │           └── RetryButton.tsx      # Retry action button
│   │
│   ├── lib/
│   │   ├── context/
│   │   │   └── AppContext.tsx           # Unified AppContext (guide, cache, costs)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useGuideContext.ts       # Guide state custom hook
│   │   │   ├── useCacheContext.ts       # Cache state custom hook
│   │   │   ├── useCostContext.ts        # Cost state custom hook
│   │   │   └── useOnlineStatus.ts       # NFR-R3: Online/offline detection
│   │   │
│   │   ├── api/
│   │   │   ├── diagnosis.ts             # FR1: AI diagnosis client functions
│   │   │   ├── guides.ts                # FR8: Guide generation client functions
│   │   │   ├── vehicle.ts               # FR2-3: VIN/YMMT lookup client functions
│   │   │   ├── parts.ts                 # FR29-35: Parts lookup client functions
│   │   │   └── known-issues.ts          # FR19-28: Known Issues client functions
│   │   │
│   │   ├── localStorage/
│   │   │   ├── guideHelpers.ts          # FR13, FR71: Guide progress (typed + Zod)
│   │   │   ├── cacheHelpers.ts          # FR48-55: Cached guides (typed + Zod)
│   │   │   ├── costHelpers.ts           # FR62-64: Cost tracking (typed + Zod)
│   │   │   └── schemas.ts               # Zod schemas for all localStorage data
│   │   │
│   │   ├── validation-pipeline/
│   │   │   ├── mechanicValidator.ts     # FR56: Mechanic AI validation agent
│   │   │   ├── safetyValidator.ts       # FR56: Safety Officer validation agent
│   │   │   ├── partsValidator.ts        # FR56: Parts Specialist validation agent
│   │   │   ├── contentValidator.ts      # FR56: Content Quality Reviewer agent
│   │   │   ├── costValidator.ts         # FR56: Cost Estimator agent
│   │   │   └── pipeline.ts              # FR56: Orchestrate six-agent pipeline
│   │   │
│   │   ├── monitoring/
│   │   │   ├── costTracker.ts           # FR62-64: Client-side cost estimation
│   │   │   ├── budgetEnforcer.ts        # FR65: Hard budget cap logic
│   │   │   └── usageMetrics.ts          # FR69: Solo operator time tracking
│   │   │
│   │   ├── cache/
│   │   │   ├── service-worker.ts        # SOURCE: Generates public/sw.js at build
│   │   │   └── cacheStrategies.ts       # Cache-first, network-first strategies
│   │   │
│   │   ├── nfr/                         # Non-functional requirement utilities
│   │   │   ├── offlineDetection.ts      # NFR-R3: Offline reliability helpers
│   │   │   ├── envValidation.ts         # NFR-S1: Environment variable validation
│   │   │   └── contrastChecker.ts       # NFR-A2: High-contrast AAA validation (dev-only)
│   │   │
│   │   ├── utils/
│   │   │   ├── fetchWithRetry.ts        # Exponential backoff retry logic
│   │   │   ├── formatters.ts            # Date, currency, time formatters
│   │   │   └── validators.ts            # Input validation utilities
│   │   │
│   │   ├── copy.ts                      # Centralized user-facing copy
│   │   └── constants.ts                 # Named constants
│   │
│   ├── types/                           # NO barrel files - direct imports only
│   │   ├── vehicle.ts                   # Vehicle, VIN, YMMT types
│   │   ├── guide.ts                     # Guide, Step, InlineTip, PreFlightData (FR71)
│   │   ├── known-issues.ts              # KnownIssue, IssueConfidence types
│   │   ├── parts.ts                     # Part, PartsRecommendation types
│   │   ├── validation.ts                # ValidationResult, ValidationAgent types
│   │   ├── monitoring.ts                # CostTracker, UsageMetrics types
│   │   └── api.ts                       # API request/response types
│   │
│   └── middleware.ts                    # Rate limiting, auth checks (Edge runtime)
│
└── tests/                               # ALL tests separated (consistent organization)
    ├── unit/                            # Unit tests for lib/ functions
    │   ├── localStorage/
    │   │   ├── guideHelpers.test.ts
    │   │   ├── cacheHelpers.test.ts
    │   │   └── costHelpers.test.ts
    │   ├── validation-pipeline/
    │   │   └── pipeline.test.ts
    │   ├── monitoring/
    │   │   ├── costTracker.test.ts
    │   │   └── budgetEnforcer.test.ts
    │   └── nfr/
    │       ├── offlineDetection.test.ts
    │       └── envValidation.test.ts
    │
    ├── integration/                     # Cross-module integration tests
    │   ├── api-workflows/
    │   │   ├── diagnosis-to-guide.test.ts
    │   │   └── guide-validation.test.ts
    │   └── state-management/
    │       ├── context-persistence.test.ts
    │       └── offline-sync.test.ts
    │
    ├── api/                             # API route tests
    │   ├── diagnosis.test.ts
    │   ├── guides.test.ts
    │   ├── vehicle.test.ts
    │   ├── known-issues.test.ts
    │   └── rate-limit.test.ts
    │
    ├── e2e/                             # End-to-end tests (Playwright)
    │   ├── symptom-to-guide.spec.ts     # User Journey 1
    │   ├── offline-mode.spec.ts         # FR48-55: Offline execution
    │   └── pre-flight-modal.spec.ts     # FR36-44: Pre-Flight workflow
    │
    ├── factories/                       # Test data factories
    │   ├── vehicleFactory.ts            # createVehicle(), createVIN()
    │   ├── guideFactory.ts              # createGuide(), createStep()
    │   ├── knownIssueFactory.ts         # createKnownIssue()
    │   └── partFactory.ts               # createPart()
    │
    ├── fixtures/                        # Static test data
    │   ├── sampleGuides.ts              # SAMPLE_GUIDE, COMPLEX_GUIDE
    │   ├── sampleVehicles.ts            # SAMPLE_VEHICLE, SAMPLE_VIN
    │   └── sampleKnownIssues.ts         # SAMPLE_KNOWN_ISSUE
    │
    └── helpers/                         # Test utilities
        ├── mockLocalStorage.ts          # Mock localStorage for tests
        ├── mockServiceWorker.ts         # Mock Service Worker
        ├── waitForAsync.ts              # Async test helpers
        ├── fillLocalStorageToCapacity.ts  # Epic 1 smoke test helper
        └── generateTestGuide.ts         # Epic 1 smoke test helper
```

### Structural Decisions (Party Mode Validated)

**1. API Route Runtime Declaration (Winston):**
- Flat API structure (no `edge/` or `serverless/` folders)
- Runtime declared via export: `export const runtime = 'edge'` or `export const runtime = 'nodejs'`
- Vercel detects runtime from exports, not folder structure

**2. Route Groups Retained (Barry):**
- Discovery (5 pages) and Execution (3 pages) justify layout isolation
- Route groups enforce Two-Phase Design Language at layout level
- Trade-off accepted: deeper navigation for stronger design language enforcement

**3. Test Organization: Separated (Murat):**
- ALL tests in `tests/` directory (not co-located)
- Consistent organization: `unit/`, `integration/`, `api/`, `e2e/`
- Structure mirrors source: `tests/unit/localStorage/` matches `lib/localStorage/`

**4. Component Organization by Phase (Sally):**
- `components/discovery/` - Calm, exploratory styled components
- `components/execution/` - High-contrast, action-focused components
- `components/ui/` - Phase-agnostic primitives
- InlineAIChat in `discovery/` (calm chat style)

**5. No Barrel Files (Barry):**
- No `types/index.ts` re-exports
- Direct imports: `import { Guide } from '@/types/guide'`

**6. Service Worker Generation (Winston):**
- Source: `lib/cache/service-worker.ts`
- Generated: `public/sw.js` at build time
- Config: `next.config.js` with `withPWA({ dest: 'public', sw: 'sw.js' })`

### Architectural Boundaries

#### API Boundaries

**Edge Runtime (`export const runtime = 'edge'`):**
- `/api/vehicle/vin-decode` - NHTSA API proxy
- `/api/vehicle/ymmt` - Static JSON serving
- `/api/guides/[guideId]` - Cached guide retrieval
- `/api/known-issues/list` - Vercel KV cache
- `/api/monitoring/costs` - KV increment
- `/api/monitoring/usage` - Metrics retrieval
- `/api/rate-limit` - Redis pipelining

**Serverless Runtime (`export const runtime = 'nodejs'`):**
- `/api/diagnosis` - AI symptom analysis
- `/api/guides/generate` - AI guide generation + validation
- `/api/guides/[guideId]/chat` - Inline AI chat
- `/api/guides/validate` - Six-agent validation pipeline
- `/api/known-issues/gather` - Background aggregation
- `/api/known-issues/admin` - Batch approval
- `/api/parts/recommendations` - RockAuto API + curated data

**External API Integrations:**
- NHTSA vPIC API (VIN decode) - Free, no rate limit
- RockAuto API (Parts lookup) - Free tier, 500 requests/day
- Claude AI API (Diagnosis, Guides, Validation) - $25/month budget cap
- Vercel KV (Rate limiting, caching) - Included in Vercel Pro

#### Component Boundaries

**Discovery Phase Components:**
- Styled: Calm colors, polished UI, exploratory interactions
- Located: `components/discovery/*`
- Used in: `app/(discovery)/*` pages only

**Execution Phase Components:**
- Styled: High-contrast AAA, bottom-anchored actions, task-focused
- Located: `components/execution/*`
- Used in: `app/(execution)/*` pages only

**Shared Components:**
- Located: `components/ui/*`, `components/offline/*`, `components/parts/*`
- Phase-agnostic styling via props or context

#### State Management Boundaries

**Global State (AppContext):**
- Guide state: current guide, step, progress
- Cache state: online status, cached guides, quota
- Cost state: daily usage, monthly total, warnings
- Access via custom hooks: `useGuideContext()`, `useCacheContext()`, `useCostContext()`

**localStorage Persistence:**
- All writes via typed helpers in `lib/localStorage/*`
- Zod validation on read AND write
- Namespace: `autocare:{category}:{identifier}`

#### Data Boundaries

**Client-Side:**
- localStorage: Guide progress, cached guides, cost estimates
- AppContext: Runtime state (not persisted)

**Server-Side (Vercel KV):**
- Rate limiting: `rate:{ip}:{date}`, TTL 24h
- Cost tracking: `costs:{month}`, persistent
- Known Issues cache: `known-issues:{year}:{make}:{model}`, TTL 7d

**No Database:** MVP uses Vercel KV only, no relational DB

### Requirements to Structure Mapping

| FR Category | Pages | Components | API Routes | Lib |
|-------------|-------|------------|------------|-----|
| Vehicle ID (FR1-7) | `(discovery)/vehicle-select`, `vin-decode`, `symptom-chat`, `obd-scan` | `discovery/*` | `diagnosis/`, `vehicle/*` | `api/diagnosis.ts`, `api/vehicle.ts` |
| Guide Gen (FR8-18) | `(execution)/guide/[id]`, `paused-guides` | `execution/*` | `guides/*` | `localStorage/guideHelpers.ts` |
| Known Issues (FR19-28) | `(discovery)/known-issues`, `admin/known-issues` | `known-issues/*` | `known-issues/*` | `api/known-issues.ts` |
| Parts (FR29-35) | (embedded) | `parts/*` | `parts/recommendations` | `api/parts.ts` |
| Disclosure (FR36-47) | `(execution)/pre-flight/[id]` | `modals/*`, `discovery/InlineAIChat` | `guides/[id]/chat` | - |
| Offline (FR48-55) | - | `offline/*` | - | `cache/*`, `localStorage/cacheHelpers.ts` |
| Validation (FR56-61) | `admin/validation-queue` | `admin/ValidationQueue` | `guides/validate` | `validation-pipeline/*` |
| Monitoring (FR62-71) | `admin/dashboard`, `admin/settings` | `admin/*` | `monitoring/*`, `rate-limit` | `monitoring/*` |

### NFR to Utilities Mapping

| NFR | Utility Location |
|-----|------------------|
| NFR-R3 (Offline Reliability) | `lib/nfr/offlineDetection.ts`, `lib/hooks/useOnlineStatus.ts` |
| NFR-S1 (API Key Security) | `lib/nfr/envValidation.ts` |
| NFR-A2 (High-Contrast AAA) | `lib/nfr/contrastChecker.ts` (dev-only) |

### Integration Points

#### Data Flow: Symptom → Guide

```
1. User enters symptoms → components/discovery/SymptomChat.tsx
2. Component calls → lib/api/diagnosis.ts → POST /api/diagnosis (nodejs)
3. API route → Claude AI → Returns diagnosis
4. User confirms → app/(discovery)/known-issues → Known Issues briefing
5. User requests guide → POST /api/guides/generate (nodejs)
6. API route → Claude AI → Six-agent validation → Returns validated guide
7. Guide saved → lib/localStorage/guideHelpers.ts (Zod validation)
8. User starts → app/(execution)/pre-flight/[id] → PreFlightModal
9. User proceeds → app/(execution)/guide/[id] → Guide execution
10. Progress tracked → AppContext + localStorage (pause/resume)
11. Service Worker → Caches guide for offline access
```

#### Data Flow: Cost Tracking

```
1. API route estimates cost → lib/monitoring/costTracker.ts
2. Client-side estimation → useCostContext().trackCost(feature, cost)
3. Cost saved → localStorage (autocare:costs:{month})
4. API route increments → Vercel KV (hincrby costs:{month} estimated {cost})
5. Admin dashboard → Reads from Vercel KV → Displays breakdown
6. Budget warning → 75% threshold → Show notification
7. Budget cap → 100% threshold → Block new guide generation (FR65)
```

---

## Summary

**Complete Project Structure:** 95+ files and directories mapped to FR1-FR71 and NFRs

**Party Mode Enhancements (10 Issues Resolved):**
1. ✅ API route runtime via exports (no folder split)
2. ✅ Route groups retained (design language enforcement)
3. ✅ Test organization: ALL separated in `tests/`
4. ✅ Missing admin components added (BudgetGauge, DailyBreakdown, VacationModeToggle)
5. ✅ Component organization by phase (discovery/, execution/)
6. ✅ Service Worker generation clarified (source → generated)
7. ✅ No barrel files (direct imports only)
8. ✅ Smoke test utilities added (fillLocalStorageToCapacity, generateTestGuide)
9. ✅ NFR utilities directory added (lib/nfr/)
10. ✅ UI state components added (components/ui/states/)

---

**Party Mode Validation:** Winston (Architect), Barry (Solo Dev), Murat (Test Architect), John (PM), and Sally (UX Designer) reviewed and enhanced the project structure with 10 structural improvements: API runtime via exports, route groups retained, consistent test separation, missing admin components, phase-based component organization, Service Worker generation clarity, no barrel files, smoke test utilities, NFR utilities directory, and UI state components. The structure maps 95+ files to FR1-FR71 and NFRs with clear architectural boundaries.

