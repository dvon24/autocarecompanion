# Story 0.1: Project Initialization & Core Dependencies

Status: done

## Story

As a **developer**,
I want **a properly initialized Next.js 15 project with all core dependencies installed**,
so that **I have a solid foundation to build the Au7o application**.

## Acceptance Criteria

1. **Given** a fresh development environment
   **When** the project is initialized using `npx create-next-app@latest au7o --yes`
   **Then** a Next.js 15 project with App Router is created
   **And** TypeScript is configured with strict mode enabled
   **And** ESLint is configured per Next.js defaults

2. **Given** the initialized project
   **When** core dependencies are installed (`@ducanh2912/next-pwa@10.2.9`, `@headlessui/react`, `zod`)
   **Then** all dependencies install without errors
   **And** `package.json` reflects the correct versions

3. **Given** the project structure
   **When** the folder structure is created per Architecture document
   **Then** the following directories exist: `src/app`, `src/components`, `src/lib`, `src/hooks`, `src/types`, `src/schemas`, `src/contexts`
   **And** a placeholder `page.tsx` displays "Au7o" text

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js Project (AC: #1)
  - [x] Run `npx create-next-app@latest au7o --yes` (Next.js 15 + App Router + TypeScript + Tailwind + ESLint)
  - [x] Verify TypeScript strict mode is enabled in `tsconfig.json`
  - [x] Verify ESLint configuration is present
  - [x] Verify Tailwind CSS is configured

- [x] Task 2: Install Core Dependencies (AC: #2)
  - [x] Run `npm install @ducanh2912/next-pwa@10.2.9 @headlessui/react zod`
  - [x] Verify all packages installed successfully (no peer dependency warnings)
  - [x] Confirm versions in `package.json` match requirements

- [x] Task 3: Create Project Structure (AC: #3)
  - [x] Create `src/components/` directory
  - [x] Create `src/components/ui/` subdirectory
  - [x] Create `src/components/discovery/` subdirectory
  - [x] Create `src/components/execution/` subdirectory
  - [x] Create `src/components/shared/` subdirectory
  - [x] Create `src/lib/` directory
  - [x] Create `src/hooks/` directory
  - [x] Create `src/types/` directory
  - [x] Create `src/schemas/` directory
  - [x] Create `src/contexts/` directory

- [x] Task 4: Configure Placeholder Page (AC: #3)
  - [x] Update `src/app/page.tsx` to display "Au7o" heading
  - [x] Add minimal styling using Tailwind CSS
  - [x] Verify page loads without errors

- [x] Task 5: Verify Project Runs (AC: #1, #2, #3)
  - [x] Run `npm run dev` and verify dev server starts
  - [x] Run `npm run build` and verify production build succeeds
  - [x] Run `npm run lint` and verify no errors

## Dev Notes

### Technical Requirements

**Initialization Command:**
```bash
npx create-next-app@latest au7o --yes
```

The `--yes` flag accepts all defaults which gives us:
- Next.js 15 with App Router
- TypeScript enabled
- Tailwind CSS configured
- ESLint configured
- src/ directory structure

**Required Dependencies (exact versions):**
- `@ducanh2912/next-pwa@10.2.9` - Service Worker for PWA (proven, stable)
- `@headlessui/react` - Accessible UI primitives (Dialog, Disclosure for Pre-Flight Modal)
- `zod` - Schema validation (API responses, localStorage, forms)

**DO NOT INSTALL YET (deferred to Epic 3+):**
- `@playwright/test` - E2E testing
- `@axe-core/playwright` - Accessibility testing
- `react-hook-form` - May defer to native forms if bundle budget tight

### Project Structure Notes

**Required Directory Structure:**
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (placeholder for now)
│   └── layout.tsx                # Root layout
├── components/                   # Shared components (NOT in route groups)
│   ├── ui/                       # Design system primitives
│   ├── discovery/                # Discovery phase components
│   ├── execution/                # Execution phase components
│   └── shared/                   # Phase-agnostic components
├── contexts/                     # React Context (unified)
├── hooks/                        # Custom hooks
├── lib/                          # Utilities
├── schemas/                      # Zod schemas
└── types/                        # Shared TypeScript types
```

**CRITICAL - Route Groups for Layouts Only:**
- `(discovery)` and `(execution)` route groups will be added in later stories
- Shared components live in `components/`, NOT in route groups
- This prevents refactoring when components need cross-phase access

### Architecture Compliance

**Naming Conventions (MUST FOLLOW):**
- Variables & Functions: `camelCase` → `userId`, `fetchGuideData()`
- React Components: `PascalCase` → `GuideCard.tsx`
- Constants: `UPPER_SNAKE_CASE` → `MAX_RETRY_ATTEMPTS`
- CSS classes: `kebab-case` → `user-card-container`

**Export Style (MUST FOLLOW):**
- Inline named exports ONLY: `export function GuideCard() {}`
- NO default exports: ~~`export default function GuideCard()`~~
- NO barrel files (`index.ts` re-exports)
- Direct imports: `import { Component } from '@/components/Component'`

**Type vs Interface (MUST FOLLOW):**
- Prefer `type` for all definitions
- Use `interface` ONLY when extending third-party library types

### TypeScript Configuration

**Verify these settings in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

The `@/*` path alias enables clean imports like `import { x } from '@/lib/utils'`.

### Placeholder Page Content

**src/app/page.tsx should contain:**
```tsx
export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Au7o</h1>
      <p className="mt-4 text-lg text-gray-600">
        AI-powered automotive maintenance guides
      </p>
    </main>
  );
}

// Note: Using named export per architecture patterns
// The actual default export is handled by Next.js App Router
export default HomePage;
```

**Exception for page.tsx files:** Next.js App Router requires default export for page components. This is the ONLY exception to the "no default exports" rule.

### Testing This Story

**Verification Commands:**
```bash
# Start dev server (should start without errors)
npm run dev

# Build for production (should complete without errors)
npm run build

# Run linter (should pass with no errors)
npm run lint
```

**Manual Verification:**
1. Visit `http://localhost:3000` - should display "Au7o" heading
2. Check browser DevTools console - should have no errors
3. Check terminal - should have no TypeScript or build errors

### References

- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Code Organization Patterns]
- [Source: architecture.md#Implementation Patterns & Consistency Rules]
- [Source: epics.md#Epic 0: Foundation]
- [Source: epics.md#Story 0.1: Project Initialization & Core Dependencies]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- ESLint config updated to ignore `.vscode/**`, `_bmad/**`, `_bmad-output/**` directories to prevent out-of-memory errors

### Completion Notes List

- Initialized Next.js 16.1.6 project with TypeScript, Tailwind CSS v4, and ESLint
- TypeScript strict mode confirmed enabled in tsconfig.json
- Installed core dependencies: @ducanh2912/next-pwa@10.2.9, @headlessui/react@2.2.9, zod@4.3.6
- Created full project directory structure per Architecture document
- Configured placeholder page displaying "Au7o" with Tailwind styling
- All verification passed: lint (no errors), build (compiled in 2.9s), dev (ready in 1092ms)
- ESLint config updated to properly ignore non-source directories

### File List

**New Files:**
- `package.json` - Project configuration with dependencies
- `package-lock.json` - Dependency lock file
- `next.config.ts` - Next.js configuration (PWA config deferred to Story 0.3)
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `eslint.config.mjs` - ESLint flat config with proper ignores
- `postcss.config.mjs` - PostCSS config for Tailwind v4
- `next-env.d.ts` - Next.js TypeScript declarations
- `src/app/page.tsx` - Homepage displaying "Au7o" (named + default export)
- `src/app/layout.tsx` - Root layout with Au7o metadata (named + default export)
- `src/app/globals.css` - Global styles with Tailwind import
- `src/app/favicon.ico` - Default favicon
- `src/components/ui/.gitkeep` - UI components directory placeholder
- `src/components/discovery/.gitkeep` - Discovery phase components placeholder
- `src/components/execution/.gitkeep` - Execution phase components placeholder
- `src/components/shared/.gitkeep` - Shared components placeholder
- `src/contexts/.gitkeep` - React Context directory placeholder
- `src/hooks/.gitkeep` - Custom hooks directory placeholder
- `src/lib/.gitkeep` - Utilities directory placeholder
- `src/schemas/.gitkeep` - Zod schemas directory placeholder
- `src/types/.gitkeep` - TypeScript types directory placeholder
- `public/` - Public assets directory

**Modified Files:**
- `.gitignore` - Merged Next.js ignores with existing project ignores

### Change Log

- 2026-02-08: Story 0.1 implementation complete - Next.js project initialized with all core dependencies and directory structure
- 2026-02-08: Code review fixes applied - Updated layout.tsx metadata (Au7o instead of boilerplate), added named export pattern to layout.tsx, added PWA config comment to next.config.ts, corrected tsconfig.json jsx setting in Dev Notes
