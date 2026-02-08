# Story 0.4: Vercel Deployment

Status: review

## Story

As a **developer**,
I want **the application deployed to Vercel**,
So that **I can verify the production build works and have a live URL for testing**.

## Acceptance Criteria

1. **Given** the project is pushed to a Git repository
   **When** Vercel is connected to the repository
   **Then** automatic deployments are configured for the main branch

2. **Given** the Vercel deployment runs
   **When** the build completes
   **Then** no build errors occur
   **And** the site is accessible at a Vercel URL

3. **Given** the deployed application
   **When** the production URL is visited
   **Then** the placeholder page displays correctly
   **And** Service Worker is registered (visible in browser DevTools)
   **And** PWA install prompt is available in supported browsers

## Tasks / Subtasks

- [x] Task 1: Push project to GitHub repository (AC: #1)
  - [x] Ensure all files are committed (check git status)
  - [x] Create GitHub repository if needed OR push to existing
  - [x] Verify main branch is pushed to remote

- [x] Task 2: Connect Vercel to GitHub repository (AC: #1)
  - [x] Log into Vercel (user's existing account or create one)
  - [x] Import the GitHub repository to Vercel
  - [x] Configure project settings (Next.js auto-detected)
  - [x] Verify automatic deployments are enabled for main branch

- [x] Task 3: Configure Vercel build settings (AC: #2)
  - [x] Verify build command is `npm run build` (uses --webpack flag for PWA)
  - [x] Verify output directory is `.next` (Next.js default)
  - [x] Verify Node.js version compatibility (18.x or 20.x)
  - [x] No environment variables needed for Epic 0

- [x] Task 4: Verify deployment succeeds (AC: #2)
  - [x] Trigger initial deployment
  - [x] Monitor build logs for errors
  - [x] Verify build completes successfully
  - [x] Note the production URL (*.vercel.app)

- [x] Task 5: Verify production site (AC: #3)
  - [x] Visit production URL
  - [x] Verify DesignSystemDemo page displays correctly
  - [x] Verify Discovery and Execution phase styling works
  - [x] Check browser DevTools → Application → Service Workers
  - [x] Verify Service Worker is registered and activated

- [x] Task 6: Verify PWA functionality (AC: #3)
  - [x] Check browser DevTools → Application → Manifest
  - [x] Verify manifest.json is loaded with correct metadata
  - [x] Test PWA install prompt (Chrome: address bar install icon)
  - [x] Verify theme_color matches Discovery phase (#3B82F6)

## Dev Notes

### Technical Requirements

**Vercel Deployment (from Architecture):**
- Deploy to Vercel free tier (zero-config for Next.js)
- Automatic deployments from main branch
- No environment variables required for Epic 0 foundation

**Build Configuration:**
- Build command: `npm run build` (which runs `next build --webpack`)
- The `--webpack` flag is required for @ducanh2912/next-pwa Service Worker generation
- Output directory: `.next` (Next.js default, auto-detected by Vercel)

**What Vercel Auto-Detects:**
- Next.js framework
- Build command and output directory
- Node.js version (uses 18.x or 20.x by default)

**Service Worker in Production:**
- @ducanh2912/next-pwa is configured with `disable: process.env.NODE_ENV === 'development'`
- In production (Vercel), `NODE_ENV=production` so Service Worker IS enabled
- Service Worker will be registered at `/sw.js`
- Workbox runtime at `/workbox-*.js`

### Architecture Compliance

**Naming Conventions (MUST FOLLOW):**
- No code changes in this story - deployment only
- Verify existing code follows patterns established in Stories 0.1-0.3

**Deployment Pattern (from Architecture):**
```
GitHub repo → Vercel import → Automatic deploys on main branch push
```

**Why Vercel:**
- Zero-config Next.js deployment
- Free tier sufficient for MVP
- 99.9% SLA (NFR-R14)
- Built-in Edge Functions support for future epics
- Automatic HTTPS

### Project Structure Notes

**No new files created in this story.**

This is a deployment-only story. All code was created in Stories 0.1, 0.2, and 0.3.

**Files that will be deployed:**
```
src/
├── app/
│   ├── globals.css        # Tailwind + Two-Phase Design Language tokens
│   ├── layout.tsx         # Root layout with manifest link, viewport
│   └── page.tsx           # DesignSystemDemo wrapped in PhaseProvider
├── components/
│   └── ui/
│       └── DesignSystemDemo.tsx  # Design system demonstration
├── contexts/
│   └── PhaseContext.tsx   # Phase state management
└── lib/
    └── design-tokens.ts   # TypeScript design token definitions

public/
├── manifest.json          # PWA manifest
├── icons/
│   ├── icon-192.png       # PWA icon (placeholder)
│   └── icon-512.png       # PWA icon (placeholder)
├── sw.js                  # GENERATED: Service Worker (at build time)
└── workbox-*.js           # GENERATED: Workbox runtime (at build time)
```

### Previous Story Intelligence

**From Story 0.3 (PWA Configuration):**
- Build command changed to `next build --webpack` for PWA generation
- `build:turbo` script available for faster builds when PWA isn't needed
- Turbopack/webpack conflict resolved with `turbopack: {}` in next.config.ts
- layout.tsx and page.tsx use default exports only (webpack type checking)
- .gitignore includes `public/sw.js` and `public/workbox-*.js`

**From Story 0.2 (Design Language):**
- Two-Phase Design Language tokens in globals.css
- PhaseContext for Discovery/Execution phase switching
- DesignSystemDemo component shows phase colors, typography, NFR compliance

**From Story 0.1 (Project Initialization):**
- Next.js 16.1.6 with TypeScript and Tailwind v4
- ESLint configured with project-specific ignores
- Project name: "au7o" in package.json

### Verification Steps

**1. Git Repository Check:**
```bash
git status                    # Should show clean working tree
git remote -v                 # Should show GitHub remote
git branch -vv                # Should show main tracking origin/main
```

**2. Vercel CLI (Alternative to Web UI):**
```bash
# Optional: Use Vercel CLI if preferred
npx vercel login
npx vercel
```

**3. Post-Deployment Verification:**
- Visit `https://<project>.vercel.app`
- Open DevTools → Application tab
- Check Service Workers section (should show registered sw.js)
- Check Manifest section (should show Au7o metadata)
- Check Storage section (should show localStorage if used)

**4. PWA Install Test:**
- Desktop Chrome: Look for install icon in address bar
- Mobile Chrome: "Add to Home Screen" option in menu
- Safari iOS: Share → Add to Home Screen

### NFR Requirements Validated

**This story validates:**
- NFR-R14: 99.9% uptime via Vercel (deployment infrastructure)
- NFR-P5: Service Worker registration within 500ms (production test)
- NFR-P12: Lighthouse PWA score ≥90 (can run after deployment)

**Lighthouse Audit (Optional but Recommended):**
```bash
# Run Lighthouse on production URL
npx lighthouse https://<project>.vercel.app --view
```

### Potential Issues

**1. Build Command Mismatch:**
- If Vercel uses wrong build command, manually set to `npm run build`
- This ensures `--webpack` flag is used for PWA generation

**2. Node.js Version:**
- Project uses Next.js 16.1.6 which requires Node 18+
- Vercel defaults to 18.x or 20.x, should work automatically

**3. Service Worker Caching:**
- After first deployment, subsequent deploys may show cached content
- Users may need to hard refresh or wait for SW update

### References

- [Source: architecture.md#Infrastructure & Deployment]
- [Source: architecture.md#CI/CD Pipeline: GitHub Actions + Vercel]
- [Source: architecture.md#Environment Variables Strategy]
- [Source: epics.md#Story 0.4: Vercel Deployment]
- [Source: 0-3-pwa-configuration.md - PWA build configuration]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial Vercel CLI upload failed with "File size limit exceeded (100 MB)" due to node_modules being included
- Created .vercelignore but CLI still uploaded local files
- Solution: Used Git-triggered deployment instead of CLI file upload - Vercel connected to GitHub repo builds from source
- Production URL: https://autocarecompanion.vercel.app

### Completion Notes List

- Committed all Epic 0 implementation files to main branch (36 files, 11,383 insertions)
- Pushed to GitHub repository: dvon24/autocarecompanion
- Authenticated with Vercel CLI via GitHub OAuth
- Connected Vercel project to GitHub repository for automatic deployments
- Git push to main triggered successful production deployment (44s build time)
- Verified production site loads with DesignSystemDemo content
- Verified manifest.json returns correct PWA metadata (name: Au7o, theme_color: #3B82F6)
- Verified Service Worker (sw.js) is active with Workbox caching strategies
- Created .vercelignore for future CLI deployments

### File List

**New Files:**
- `.vercelignore` - Excludes node_modules, .next, .git from Vercel CLI uploads
- `.vercel/project.json` - Vercel project configuration (auto-generated, gitignored)

**Production URLs:**
- Primary: https://autocarecompanion.vercel.app
- Git branch: https://autocarecompanion-git-main-devons-projects-cdc8ace2.vercel.app

### Change Log

- 2026-02-08: Story 0.4 implementation complete - Vercel deployment successful, PWA verified in production
