---
title: 'Complete BMW known-issues audit and production deployment'
type: 'bugfix'
created: '2026-07-30'
status: 'done'
baseline_revision: '3cd970d59354572d6cdcbcfdc4f1e8d03baa489d'
final_revision: 'd527a5cd570f752bed8731cdb86e017d6ef857ca'
review_loop_iteration: 0
followup_review_recommended: true
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
- [x] `data/known-issues-catalog-deeplink-work/**` -- export and freeze each remaining BMW packet with exact hashes and telemetry.
- [x] `data/known-issues-catalog-deeplink-decisions/**` -- research, configure, generate, apply, verify, and commit one full-record cohort per model.
- [x] `src/app/known-issues/[slug]/page.tsx` -- register audited SEO slugs and preserve indexable route behavior when a model has zero published issues.
- [x] Release boundary -- exclude the incomplete concurrent homepage, reservation, session-middleware, `/dev`, and 3D-model work from the BMW production release.
- [x] `.vercel/project.json` -- run the make-wide build/reconciliation gate, push the clean branch, and deploy the linked project to production.

**Acceptance Criteria:**
- Given a remaining BMW record, when its cohort completes, then every field and commerce claim has one evidence-backed disposition and the second apply performs zero writes.
- Given a clicked generic or wrong-fitment URL, when audited, then the click affects priority only and no invalid URL survives.
- Given a BMW model with no surviving published issue, when its canonical route is requested, then it remains useful and indexable rather than returning a real or soft 404.
- Given the full BMW chain, when the release gate runs, then audit history, applicator tests, ShowMe tests, commerce tests, lint, diff checks, metadata invariants, and the production build pass.
- Given concurrent homepage/reservation changes, when integrated, then unrelated experiments and incomplete `/dev` links are excluded and Known Issues design/SEO remain unchanged.
- Given the pushed release, when deployed, then Vercel reports a Ready production deployment for the public au7o aliases.

## Spec Change Log

## Review Triage Log

### 2026-08-01 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 11: (high 5, medium 6, low 0)
- defer: 1: (high 0, medium 1, low 0)
- reject: 3: (high 0, medium 1, low 2)
- addressed_findings:
  - `[high]` `[patch]` Reconciled every audited BMW localized route with current published database rows so archived translated claims, including the BMW M4 DCT card, cannot render.
  - `[high]` `[patch]` Added the exact 11 audited-empty BMW identities to static generation and the sitemap with immutable audit dates.
  - `[high]` `[patch]` Replaced the broad 41-model empty fallback with manifest-derived expected counts and fail-closed behavior for expected-positive and unknown slugs.
  - `[medium]` `[patch]` Replaced moving `new Date()` empty-page labels with each model's reviewed manifest audit date.
  - `[high]` `[patch]` Made `KNOWN_ISSUE_ENV_FILE` authoritative and fail-closed so an ambient preview URL cannot override an explicit production verifier file.
  - `[high]` `[patch]` Corrected the NHTSA helper to reject either non-2xx responses or malformed `results` payloads.
  - `[medium]` `[patch]` Added route-registry, localized reconciliation, env precedence, NHTSA error, and factory-override regression tests.
  - `[medium]` `[patch]` Added an assertion that every published or archive-reason factory override ID exists in the frozen packet.
  - `[medium]` `[patch]` Corrected the spec task to document that the incomplete homepage/reservation work was intentionally excluded.
  - `[medium]` `[patch]` Removed duplicate localized `| Au7o | Au7o` titles and aligned BMW localized sitemap dates with the completed audit.
  - `[medium]` `[patch]` Added production deployment, database, build, rendered-route, and release-boundary evidence to the run record.

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

## Auto Run Result

### Summary

Completed the full BMW Known Issues audit across 41 models and hardened the release after adversarial review. The final release reconciles localized BMW pages with current published records, preserves exact audited-empty routes without masking expected-positive failures, advertises those routes in the sitemap, fixes deterministic audit dates and localized metadata, and makes the production verifier and NHTSA research helper fail closed.

### Files changed

- `data/known-issues-catalog-deeplink-work/**` and `data/known-issues-catalog-deeplink-decisions/**` -- frozen BMW packets, reviewed model configurations, and immutable schema-v2 manifests for the completed make.
- `src/lib/known-issues-audit-registry.ts` -- manifest-derived BMW identities, expected published counts, and audit dates.
- `src/app/known-issues/[slug]/page.tsx` and `src/app/sitemap.ts` -- exact audited-empty routing, metadata, static parameters, sitemap coverage, and fixed dates.
- `src/app/[locale]/known-issues/[slug]/page.tsx` and `src/lib/localized-known-issues-audit.ts` -- suppress archived translated claims and render current evidence-audited BMW issue copy.
- `scripts/apply-known-issue-catalog-deeplinks.js` -- authoritative explicit env-file resolution for production verification.
- `scripts/_nhtsa-recall-campaigns.cjs` and `_config-bmw-remaining-factory.cjs` -- fail-closed API handling and packet-override validation.
- Focused tests under `scripts/**.test.*` and `src/lib/**.test.ts` -- regression coverage for every review-driven safety fix.

### Review findings

- Patches applied: 11 (5 high, 6 medium), detailed in the Review Triage Log.
- Deferred: 1 medium future generator-hardening item in `deferred-work.md`.
- Rejected: 3 process-only or non-defect findings that did not affect committed manifests or public behavior.
- Follow-up review recommendation: `true`; the pass changed routing, localized content, sitemap behavior, and production verifier safety.

### Verification performed

- Production database: `95/95` manifests and `795/795` rows verified at exact schema-v2 after-state using an explicit Vercel production env file; the temporary env file was then deleted.
- Tests: applicator `27/27`, ShowMeTheParts `4/4`, commerce `6/6`, NHTSA/factory `5/5`, and registry/localized behavior `6/6` passed.
- Static analysis: focused ESLint, TypeScript `--noEmit --incremental false`, JavaScript syntax checks, and `git diff --check` passed.
- Production build: Next.js generated all `1,531` static pages successfully.
- Deployment: `dpl_9ZvhTksWaMhrEqZ9ybgr7HW2Pohu`, target `production`, state `Ready`, promoted to `au7o.io` and `www.au7o.io` on 2026-08-01. The clean deployed source revision was `d527a5cd570f752bed8731cdb86e017d6ef857ca`.
- Live routes: BMW M4, Z8, X7, and Z4 returned `200` with correct titles and expected audited content; English routes contained Get Started and DataRep and did not contain Open Hub; localized Portuguese M4 contained no archived DCT issue; the sitemap contained M4 and Z8 with `2026-07-31` last-modified dates.
- Release boundary: no homepage, reservation, middleware, `/dev`, twin, or 3D-model files were included in the BMW release commit.

### Residual risks

- Future factory-backed cohorts should bind transitive generator dependencies into the reviewed hash, as recorded in deferred work.
- The separately prepared homepage design is not part of this BMW release and must be rebased or cherry-picked onto the audited release chain before its own production deployment.
