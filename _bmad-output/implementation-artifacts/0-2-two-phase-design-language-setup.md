# Story 0.2: Two-Phase Design Language Setup

Status: done

## Story

As a **developer**,
I want **Tailwind CSS configured with the Two-Phase Design Language tokens**,
so that **UI components can use consistent Discovery and Execution phase styling**.

## Acceptance Criteria

1. **Given** the initialized Next.js project
   **When** Tailwind CSS configuration is extended
   **Then** Discovery phase colors are defined (calming blues, soft grays)
   **And** Execution phase colors are defined (high-contrast AAA compliant)
   **And** Touch target utilities are available (min 44x44px)

2. **Given** the design tokens are configured
   **When** a component uses `bg-discovery-primary` or `bg-execution-primary`
   **Then** the correct phase-specific colors are applied
   **And** the build completes without Tailwind errors

3. **Given** the typography configuration
   **When** text styles are applied
   **Then** Discovery phase uses relaxed, readable typography
   **And** Execution phase uses high-contrast, large touch-friendly text

## Tasks / Subtasks

- [x] Task 1: Create Tailwind CSS v4 Theme Extension (AC: #1)
  - [x] Create `src/lib/design-tokens.ts` with color definitions
  - [x] Define Discovery phase colors (calming blues: `#EBF4FF`, `#3B82F6`, soft grays)
  - [x] Define Execution phase colors (high-contrast AAA: black `#000`, white `#FFF`, warning red, safety yellow)
  - [x] Define shared semantic tokens (success, error, warning, info)

- [x] Task 2: Configure Tailwind v4 Theme in CSS (AC: #1, #2)
  - [x] Update `src/app/globals.css` with `@theme` block for custom colors
  - [x] Add `--color-discovery-*` custom properties (primary, secondary, background, text)
  - [x] Add `--color-execution-*` custom properties (primary, secondary, background, text, warning, safety)
  - [x] Add touch target utility `--spacing-touch-target: 44px`

- [x] Task 3: Create Typography Scale (AC: #3)
  - [x] Define Discovery typography (body: 16px, relaxed line-height)
  - [x] Define Execution typography (guide-step: 18px min, safety: 20px bold)
  - [x] Add `--font-size-*` custom properties to `@theme` block
  - [x] Ensure typography meets NFR-A8 (18px guide steps) and NFR-A3 (16px body)

- [x] Task 4: Create Utility Classes for Touch Targets (AC: #1)
  - [x] Add CSS utility for minimum touch target size (44×44px per NFR-A7)
  - [x] Create `.touch-target` utility class in globals.css
  - [x] Ensure utility works with flex and grid layouts

- [x] Task 5: Create Phase Context Provider (AC: #2)
  - [x] Create `src/contexts/PhaseContext.tsx` with phase state (discovery | execution)
  - [x] Export `usePhase` hook for components to access current phase
  - [x] Export `PhaseProvider` component for app-level phase management

- [x] Task 6: Create Demo Component for Verification (AC: #1, #2, #3)
  - [x] Create `src/components/ui/DesignSystemDemo.tsx` showing both phases
  - [x] Display Discovery phase colors with sample text
  - [x] Display Execution phase colors with sample text and safety callout
  - [x] Update `src/app/page.tsx` to render DesignSystemDemo

- [x] Task 7: Verify Build and Lint (AC: #2)
  - [x] Run `npm run build` and verify no Tailwind errors
  - [x] Run `npm run lint` and verify no ESLint errors
  - [x] Verify phase colors render correctly in browser

## Dev Notes

### Technical Requirements

**Two-Phase Design Language (from Architecture):**
- **Discovery Phase:** Calm, exploratory, low-stress colors for vehicle selection and symptom input
- **Execution Phase:** High-contrast AAA (7:1) for garage conditions with dirty hands and low light

**Tailwind v4 Approach:**
Tailwind CSS v4 uses CSS-first configuration via `@theme` blocks in CSS files instead of `tailwind.config.js`. All custom tokens should be defined in `src/app/globals.css`.

**Color Definitions:**

```css
/* Discovery Phase - Calming, exploratory */
--color-discovery-primary: #3B82F6;      /* Blue-500 */
--color-discovery-secondary: #60A5FA;    /* Blue-400 */
--color-discovery-background: #EBF4FF;   /* Blue-50 */
--color-discovery-text: #1E3A5F;         /* Dark blue-gray */
--color-discovery-muted: #64748B;        /* Slate-500 */

/* Execution Phase - High-contrast AAA (7:1 ratio) */
--color-execution-primary: #FFFFFF;      /* White on black */
--color-execution-secondary: #E5E7EB;    /* Gray-200 */
--color-execution-background: #000000;   /* Black */
--color-execution-text: #FFFFFF;         /* White */
--color-execution-warning: #FCD34D;      /* Amber-300 for visibility */
--color-execution-safety: #EF4444;       /* Red-500 for critical warnings */
```

**Typography Scale (NFR Compliance):**

```css
/* Typography - Garage optimized */
--font-size-body: 1rem;           /* 16px - NFR-A3 */
--font-size-guide-step: 1.125rem; /* 18px minimum - NFR-A8 */
--font-size-safety: 1.25rem;      /* 20px bold - Safety callouts */
--font-size-heading: 1.5rem;      /* 24px */
--line-height-relaxed: 1.625;     /* Discovery phase */
--line-height-tight: 1.375;       /* Execution phase - more steps visible */
```

**Touch Targets (NFR-A7):**

```css
/* Minimum touch target for glove-friendly interaction */
--spacing-touch-target: 44px;

.touch-target {
  min-width: var(--spacing-touch-target);
  min-height: var(--spacing-touch-target);
}
```

### Architecture Compliance

**Naming Conventions (MUST FOLLOW):**
- Variables & Functions: `camelCase` → `phaseColors`, `getPhaseClass()`
- React Components: `PascalCase` → `PhaseProvider.tsx`, `DesignSystemDemo.tsx`
- Constants: `UPPER_SNAKE_CASE` → `DISCOVERY_COLORS`, `EXECUTION_COLORS`
- CSS custom properties: `kebab-case` → `--color-discovery-primary`

**Export Style (MUST FOLLOW):**
- Inline named exports ONLY: `export function PhaseProvider() {}`
- NO default exports (exception: page.tsx/layout.tsx for Next.js)
- NO barrel files (`index.ts` re-exports)
- Direct imports: `import { usePhase } from '@/contexts/PhaseContext'`

**Type vs Interface (MUST FOLLOW):**
- Prefer `type` for all definitions
- Example: `type Phase = 'discovery' | 'execution'`

### Project Structure Notes

**Files to Create:**
```
src/
├── app/
│   └── globals.css              # UPDATE: Add @theme block with design tokens
├── components/
│   └── ui/
│       └── DesignSystemDemo.tsx # NEW: Demo component for verification
├── contexts/
│   └── PhaseContext.tsx         # NEW: Phase state management
└── lib/
    └── design-tokens.ts         # NEW: TypeScript token definitions for type safety
```

**Alignment with Story 0.1:**
- Build on existing Tailwind v4 setup (globals.css already has `@import "tailwindcss"`)
- Extend existing `@theme` block (currently has `--color-background`, `--color-foreground`)
- Maintain existing font variable references (`--font-geist-sans`, `--font-geist-mono`)

### Previous Story Intelligence

**From Story 0.1 Implementation:**
- Tailwind v4 uses `@theme inline` blocks in CSS (NOT tailwind.config.js)
- Current globals.css structure:
  ```css
  @import "tailwindcss";
  :root { --background: #ffffff; --foreground: #171717; }
  @theme inline { --color-background: var(--background); ... }
  ```
- ESLint config ignores: `.vscode/**`, `_bmad/**`, `_bmad-output/**`
- Named + default export pattern for page.tsx/layout.tsx files

**Code Patterns Established:**
- Component files use `.tsx` extension
- Contexts directory exists at `src/contexts/`
- UI components go in `src/components/ui/`

### Accessibility Requirements

**WCAG Compliance:**
- Discovery: AA minimum (4.5:1 contrast ratio) - NFR-A3
- Execution: AAA (7:1 contrast ratio) - NFR-A2
- Touch targets: 44×44px minimum - NFR-A7
- Guide step text: 18px minimum - NFR-A8

**Garage Environment Testing (from Architecture):**
- Test at 30% screen brightness (NFR-A6, NFR-A13)
- Execution phase must be legible in low-light
- High-contrast styling for safety callouts

### References

- [Source: architecture.md#Design System Architecture]
- [Source: architecture.md#Two-Phase Design Language]
- [Source: epics.md#Story 0.2: Two-Phase Design Language Setup]
- [Source: prd.md#NFR-A1 through NFR-A14 - Accessibility Requirements]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- No debug issues encountered

### Completion Notes List

- Created design-tokens.ts with TypeScript definitions for Discovery and Execution phase colors, semantic tokens, typography scale, and phase class helpers
- Updated globals.css with complete @theme block containing all design tokens (colors, typography, spacing)
- Created typography utility classes: .text-body, .text-guide-step, .text-safety, .text-heading
- Created .touch-target utility class for NFR-A7 compliance (44×44px minimum)
- Created PhaseContext.tsx with PhaseProvider, usePhase hook, and usePhaseClass helper
- Created DesignSystemDemo.tsx demonstrating both phases with color swatches, typography samples, and NFR compliance checklist
- Updated page.tsx to render DesignSystemDemo wrapped in PhaseProvider
- All verification passed: lint (no errors), build (compiled in 2.4s)

### File List

**New Files:**
- `src/lib/design-tokens.ts` - TypeScript design token definitions
- `src/contexts/PhaseContext.tsx` - Phase state management context and hooks
- `src/components/ui/DesignSystemDemo.tsx` - Demo component for design system verification

**Modified Files:**
- `src/app/globals.css` - Extended with Two-Phase Design Language tokens, typography, and utilities
- `src/app/page.tsx` - Updated to render DesignSystemDemo with PhaseProvider

**Deleted Files:**
- `src/lib/.gitkeep` - Replaced with design-tokens.ts
- `src/contexts/.gitkeep` - Replaced with PhaseContext.tsx
- `src/components/ui/.gitkeep` - Replaced with DesignSystemDemo.tsx

### Change Log

- 2026-02-08: Story 0.2 implementation complete - Two-Phase Design Language configured with Tailwind v4, PhaseContext provider, and demo component
- 2026-02-08: Bug fix - Changed execution phase ring from `ring-white` to `ring-execution-warning` for visibility on light backgrounds
- 2026-02-08: Code review fixes applied:
  - HIGH-1: DesignSystemDemo now imports and uses design-tokens.ts constants (displays token values in demo)
  - MEDIUM-3: Consolidated CSS variables - removed duplication between :root and @theme inline (design tokens now defined directly in @theme block)
  - MEDIUM-4: Discovery text color verified consistent via CSS inheritance from .phase-discovery container
  - MEDIUM-2: Testing framework not in story scope - noted as technical debt for Epic 0 infrastructure
