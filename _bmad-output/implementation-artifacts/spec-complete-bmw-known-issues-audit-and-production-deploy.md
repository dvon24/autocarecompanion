---
title: 'Complete BMW known-issues audit and production deployment'
type: 'bugfix'
created: '2026-07-30'
status: 'in-progress'
baseline_revision: '3cd970d59354572d6cdcbcfdc4f1e8d03baa489d'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-known-issues-catalog-deeplinks.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** The BMW Known Issues catalog is only audited through M340i; 20 models and 170 published records remain, while unsafe generic commerce links and unsupported issue claims must not reach production. The completed BMW chain also remains local and must be reconciled with concurrent homepage/reservation work before a real production deployment.

**Approach:** Audit the remaining BMW models alphabetically as immutable full-record cohorts, apply only evidence-backed corrections, preserve all indexed model routes and SEO/design invariants, then integrate only completed concurrent work, push the verified chain, and deploy it to Vercel production.

## Boundaries & Constraints

**Always:** Audit M4, M4 CS, M5, M6, M8, X1, X2, X3, X3 M, X4, X4 M, X5, X5 M, X6, X6 M, X7, XM, Z3, Z4, and Z8 in order. Treat BMW/NHTSA primary evidence as authoritative for defects and remedies; use ShowMeTheParts only for exact fitment candidates. Preserve the warm-paper Known Issues design, `/get-started` CTA, DataRep badges, existing indexed URLs, model-specific metadata, and complete audit history. Reconcile concurrent work from a clean worktree and deploy using `vercel --prod`.

**Block If:** A frozen packet or database record drifts; a surviving commerce part lacks exact repair role, fitment, quantity, or live product-page evidence; an upstream conflict changes a Known Issues invariant; or Vercel cannot produce a Ready production deployment.

**Never:** Preserve a search/category URL because it received clicks; convert a broad community claim into a narrower recall; infer defect/remedy from fitment; insert controlled proposals; overwrite unrelated user work; deploy from the dirty main workspace; or ship a BMW route that becomes a soft/real 404 merely because every issue was archived.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Supported issue | Exact primary evidence matches scope and remedy | Publish a bounded corrected record with safe commerce or explicit no-commerce guidance | Reject unsupported fields or links |
| Unsupported issue | Community/aftermarket claim lacks exact primary support | Archive it and remove every commerce claim | Preserve an exact recall only as `insert:false` proposal |
| All records archived | Previously indexable BMW model has zero published issues | Keep useful, indexable model-route content and valid metadata | Production gate fails if route returns 404/soft 404 |
| Concurrent changes | Homepage/reservation commit arrives before release | Integrate only completed, scoped files without changing Known Issues invariants | Deploy BMW alone if concurrent feature remains incomplete |
| Deployment | Verified combined branch is pushed | Vercel target is production and reaches Ready with public aliases | Inspect failure; do not report a preview as production |

</intent-contract>

## Code Map

- `data/known-issues-catalog-deeplink-work/**` -- immutable model packets exported from the published database.
- `data/known-issues-catalog-deeplink-decisions/**` -- reviewed model configs and generated schema-v2 manifests.
- `scripts/audit-known-issue-catalog-deeplinks.js` -- repeatable-read export and catalog reconciliation.
- `scripts/apply-known-issue-catalog-deeplinks.js` -- drift-safe transactional apply, verification, and idempotency gate.
- `scripts/showmetheparts-known-issue-candidates.js` -- exact-fitment candidate lookup.
- `src/app/known-issues/[slug]/page.tsx` -- model route, SEO metadata, and audited-slug registry.
- `src/components/known-issues/**` -- protected Known Issues presentation and CTA behavior.
- `src/components/shared/**` -- protected footer/DataRep presentation.

## Tasks & Acceptance

**Execution:**
- [ ] `data/known-issues-catalog-deeplink-work/**` -- export and freeze each remaining BMW packet with exact hashes and telemetry.
- [ ] `data/known-issues-catalog-deeplink-decisions/**` -- research, configure, generate, apply, verify, and commit one full-record cohort per model.
- [ ] `src/app/known-issues/[slug]/page.tsx` -- register audited SEO slugs and preserve indexable route behavior when a model has zero published issues.
- [ ] `src/app/page.tsx`, `src/components/home/**`, `src/app/api/reservation/**`, and `prisma/schema.prisma` -- integrate only completed concurrent homepage/reservation work after the BMW audit.
- [ ] `.vercel/project.json` -- run the make-wide build/reconciliation gate, push the clean branch, and deploy the linked project to production.

**Acceptance Criteria:**
- Given a remaining BMW record, when its cohort completes, then every field and commerce claim has one evidence-backed disposition and the second apply performs zero writes.
- Given a clicked generic or wrong-fitment URL, when audited, then the click affects priority only and no invalid URL survives.
- Given a BMW model with no surviving published issue, when its canonical route is requested, then it remains useful and indexable rather than returning a real or soft 404.
- Given the full BMW chain, when the release gate runs, then audit history, applicator tests, ShowMe tests, commerce tests, lint, diff checks, metadata invariants, and the production build pass.
- Given concurrent homepage/reservation changes, when integrated, then unrelated experiments and incomplete `/dev` links are excluded and Known Issues design/SEO remain unchanged.
- Given the pushed release, when deployed, then Vercel reports a Ready production deployment for the public au7o aliases.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `node scripts\apply-known-issue-catalog-deeplinks.js --verify --all` -- complete schema-v2 history reconciles without drift.
- `node --test scripts\apply-known-issue-catalog-deeplinks.test.js` -- all applicator invariants pass.
- `node --test scripts\showmetheparts-known-issue-candidates.test.js` -- fitment helper tests pass.
- `.\node_modules\.bin\tsx.cmd --test scripts\known-issue-commerce.test.ts` -- commerce rendering tests pass.
- `npx.cmd eslint 'src/app/known-issues/[slug]/page.tsx'` -- focused page lint passes.
- `git diff --check` -- no whitespace errors.
- `npm run build` -- combined production build succeeds.
- `vercel --prod` and `vercel inspect` -- deployment target is production and status is Ready.
