# Story 0.3: PWA Configuration

Status: done

## Story

As a **developer**,
I want **Service Worker configured with @ducanh2912/next-pwa**,
so that **the application can be installed and function offline in future epics**.

## Acceptance Criteria

1. **Given** @ducanh2912/next-pwa is installed
   **When** `next.config.ts` is configured with PWA settings
   **Then** Service Worker is disabled in development mode (`disable: process.env.NODE_ENV === 'development'`)
   **And** Service Worker is enabled in production builds

2. **Given** a production build is created
   **When** `npm run build` completes
   **Then** Service Worker files are generated in the public directory
   **And** `manifest.json` is created with app name "Au7o"
   **And** no build errors occur

3. **Given** the PWA manifest
   **When** the app is loaded in a browser
   **Then** the manifest is properly linked in `<head>`
   **And** basic PWA metadata (name, icons placeholder, theme color) is present

## Tasks / Subtasks

- [x] Task 1: Configure @ducanh2912/next-pwa in next.config.ts (AC: #1)
  - [x] Import and wrap config with `withPWA`
  - [x] Set `dest: 'public'` for Service Worker output
  - [x] Set `disable: process.env.NODE_ENV === 'development'` to disable in dev
  - [x] Configure caching strategies per Architecture document

- [x] Task 2: Create PWA manifest.json (AC: #2, #3)
  - [x] Create `public/manifest.json` with app metadata
  - [x] Set `name: "Au7o"`, `short_name: "Au7o"`
  - [x] Set `display: "standalone"` for app-like experience
  - [x] Set `start_url: "/"`, `background_color`, `theme_color`
  - [x] Add placeholder icon references (192x192, 512x512)

- [x] Task 3: Create placeholder PWA icons (AC: #3)
  - [x] Create `public/icons/` directory
  - [x] Add placeholder `icon-192.png` (192x192px)
  - [x] Add placeholder `icon-512.png` (512x512px)
  - [x] Icons can be simple placeholders for now (replaced in UX epic)

- [x] Task 4: Link manifest in root layout (AC: #3)
  - [x] Update `src/app/layout.tsx` to include manifest link
  - [x] Add `<link rel="manifest" href="/manifest.json">`
  - [x] Add theme-color meta tag to match manifest

- [x] Task 5: Verify Production Build (AC: #1, #2)
  - [x] Run `npm run build` and verify Service Worker files generated
  - [x] Verify `public/sw.js` or similar SW file is created
  - [x] Verify `public/workbox-*.js` files are generated
  - [x] Verify build completes without errors

- [x] Task 6: Verify Dev Mode (AC: #1)
  - [x] Run `npm run dev` and verify Service Worker is NOT registered
  - [x] Confirm no SW errors in browser DevTools
  - [x] Verify dev server starts without PWA interference

## Dev Notes

### Technical Requirements

**@ducanh2912/next-pwa Configuration (from Architecture):**

The architecture specifies using `@ducanh2912/next-pwa v10.2.9` which is already installed in package.json. Configure in `next.config.ts`:

```typescript
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Caching strategies will be expanded in Epic 2
});

const nextConfig = {
  // existing config
};

export default withPWA(nextConfig);
```

**Why disable in development:**
- Service Worker caching interferes with hot reload
- Stale cache causes confusion during development
- Architecture decision: "Service Worker disabled in dev for fast iteration"

**PWA Manifest Requirements (from Architecture):**

```json
{
  "name": "Au7o",
  "short_name": "Au7o",
  "description": "AI-powered automotive maintenance guides",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Theme Color Selection:**
- Uses Discovery phase primary color (#3B82F6 - Blue-500)
- Matches the Two-Phase Design Language from Story 0.2
- Will be visible in browser address bar and OS integration

### Architecture Compliance

**Naming Conventions (MUST FOLLOW):**
- Files: `manifest.json` (standard PWA naming)
- Icons directory: `public/icons/`
- Configuration in `next.config.ts` (TypeScript config)

**Export Style (MUST FOLLOW):**
- Inline named exports ONLY: `export function MyComponent() {}`
- Exception: `next.config.ts` uses default export (Next.js requirement)

**Service Worker Strategy (from Architecture):**

Per architecture document Section "Service Worker Strategy":
- **Package:** @ducanh2912/next-pwa v10.2.9 (stable, proven)
- **Caching Strategies (to be fully configured in Epic 2):**
  - Guides: Cache-First (100% offline, NFR-R3)
  - YMMT Data: Precache (static JSON)
  - AI Chat: Network-Only (real-time)
  - Parts Pricing: Network-First with cache fallback

For Story 0.3, we establish the basic PWA structure. Full caching strategies are implemented in Epic 2 (Offline-First Garage Mode).

### Project Structure Notes

**Files to Create:**
```
public/
├── manifest.json          # NEW: PWA manifest
├── icons/
│   ├── icon-192.png      # NEW: 192x192 placeholder icon
│   └── icon-512.png      # NEW: 512x512 placeholder icon
```

**Files to Modify:**
```
next.config.ts             # UPDATE: Add withPWA wrapper
src/app/layout.tsx         # UPDATE: Add manifest link and theme-color meta
```

**Files Generated at Build Time:**
```
public/
├── sw.js                  # GENERATED: Service Worker (production only)
├── workbox-*.js          # GENERATED: Workbox runtime (production only)
```

**Alignment with Story 0.1 and 0.2:**
- Build on existing Next.js 16.1.6 setup
- @ducanh2912/next-pwa already installed (Story 0.1)
- Theme color matches Discovery phase primary from Story 0.2

### Previous Story Intelligence

**From Story 0.1:**
- Next.js 16.1.6 with TypeScript configured
- @ducanh2912/next-pwa@10.2.9 already installed
- next.config.ts has placeholder comment for PWA config
- ESLint configured to ignore `.vscode/**`, `_bmad/**`, `_bmad-output/**`

**From Story 0.2:**
- Two-Phase Design Language tokens established
- Discovery phase primary color: #3B82F6 (use for theme_color)
- Design tokens in `src/lib/design-tokens.ts` and `globals.css`

### NFR Requirements

**Performance NFRs:**
- NFR-P5: Service Worker registration within 500ms
- NFR-P12: Lighthouse PWA score ≥90

**Reliability NFRs:**
- NFR-R2: Service Worker 99% cache success rate (validated in Epic 2)
- NFR-R10: Service Worker registration failure fallback UX

**PWA Architecture NFRs:**
- Service Worker registration (<500ms)
- Web app manifest (standalone display mode)
- Lighthouse PWA score ≥90
- Installable on iOS/Android/Desktop

### Placeholder Icons Note

For Story 0.3, create simple placeholder icons (e.g., solid color squares with "Au7o" text or simple car icon). Proper branded icons will be designed in the UX phase. The placeholders ensure:
1. Manifest validates correctly
2. PWA install prompts work
3. App icon appears in home screen (even if placeholder)

**Simple Placeholder Approach:**
- 192x192: Blue square (#3B82F6) - can be created with any image editor
- 512x512: Blue square (#3B82F6) - same design, larger size

### References

- [Source: architecture.md#Service Worker Strategy]
- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Progressive Web App (PWA) Architecture]
- [Source: epics.md#Story 0.3: PWA Configuration]
- [Source: 0-1-project-initialization-core-dependencies.md - package.json dependencies]
- [Source: 0-2-two-phase-design-language-setup.md - Design tokens]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Turbopack/webpack conflict: Added `turbopack: {}` to next.config.ts and `--webpack` flag to build script
- themeColor warning: Moved from metadata export to viewport export (Next.js 16 requirement)
- Named export TypeScript error: Changed layout.tsx and page.tsx to use only default exports (webpack type checking incompatibility)
- ESLint warnings on generated files: Added public/sw.js and public/workbox-*.js to eslint ignores

### Completion Notes List

- Configured @ducanh2912/next-pwa with dest: "public" and disable in development mode
- Created PWA manifest.json with Au7o branding and Discovery phase theme color (#3B82F6)
- Created placeholder icons (192x192 and 512x512) programmatically using Node.js with Discovery phase blue
- Added manifest link, viewport export for themeColor, and apple-touch-icon to layout.tsx
- Updated build script to use `--webpack` flag for PWA generation (Turbopack doesn't support webpack plugins)
- Added `build:turbo` script for faster builds when PWA isn't needed
- Fixed layout.tsx and page.tsx to use default exports only (webpack type checking requirement)
- Added generated PWA files to ESLint ignores
- Production build verified: Service Worker files generated (sw.js, workbox-*.js)
- Dev mode verified: Server starts with Turbopack, PWA disabled as configured

### File List

**New Files:**
- `public/manifest.json` - PWA manifest with Au7o branding
- `public/icons/icon-192.png` - 192x192 placeholder icon (Discovery phase blue)
- `public/icons/icon-512.png` - 512x512 placeholder icon (Discovery phase blue)

**Modified Files:**
- `next.config.ts` - Added withPWA wrapper with @ducanh2912/next-pwa configuration
- `src/app/layout.tsx` - Added manifest link, viewport export, apple-touch-icon; changed to default export only
- `src/app/page.tsx` - Changed to default export only (webpack type checking fix)
- `package.json` - Updated build script to use --webpack flag, added build:turbo script
- `eslint.config.mjs` - Added public/sw.js and public/workbox-*.js to ignores
- `.gitignore` - Added PWA generated files (public/sw.js, public/workbox-*.js) to ignores

**Generated Files (at build time):**
- `public/sw.js` - Service Worker (7.5KB)
- `public/workbox-*.js` - Workbox runtime (23.5KB)

### Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 | **Date:** 2026-02-08

**Issues Found:** 1 High, 3 Medium, 2 Low

**Fixes Applied:**
- HIGH-1: Added PWA generated files (sw.js, workbox-*.js) to .gitignore - prevents committing build artifacts
- MEDIUM-1: Deleted stray `nul` file artifact from Windows icon generation command
- MEDIUM-2: Documented page.tsx scope expansion in File List (webpack type checking fix)
- MEDIUM-3: Documented eslint.config.mjs scope expansion in File List

**Deferred (LOW - acceptable for placeholder):**
- LOW-1: Icon purpose "any maskable" combined - can be fixed with final branded icons
- LOW-2: build:turbo script addition - already documented in Completion Notes

**AC Verification:** All 3 Acceptance Criteria PASS

### Change Log

- 2026-02-08: Code review complete - 2 issues fixed (.gitignore, nul file cleanup), story marked done
- 2026-02-08: Story 0.3 implementation complete - PWA configured with @ducanh2912/next-pwa, manifest created, placeholder icons generated
