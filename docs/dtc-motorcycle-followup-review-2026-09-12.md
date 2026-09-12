# DTC cards and motorcycle discovery — local follow-up

Base: 9a8a0d4813e0834836b412c177a95b1019fc5786. Changes are local and uncommitted; nothing pushed or deployed.

## Included

- Parent DTC legacy definition/TOC/causes/cost/vehicle-list sections removed. Five featured issue cards remain, plus compact navigation to every documented make.
- Parent and make-specific routes share a single card for code reference, FAQs and related codes. Visible FAQs and FAQ structured data use the same entries.
- DTC issue citations appear with their applicable repair cards, deduplicated and safe-URL checked. Invalid legacy citation entries cannot crash the renderer. Standard article defaults remain unchanged.
- DTC links are siblings of, not nested inside, the expansion button. Same-hash navigation, engine/trim context, published-only diagnostics and existing commerce guards remain intact.
- Known Issues landing gets Popular Makes - Motorcycles, All Makes - Motorcycle, Browse by Category - Motorcycle immediately after Common Error Codes. Published/type-scoped data and canonical motorcycle routes are used. Empty catalogs stay discoverable without fabricated make/category coverage.
- Isolated preview motorcycle descriptions, counts and empty states explicitly identify synthetic examples.

## Verification

- 13 actual-source DTC regression groups pass.
- Eight DTC browser scenarios pass: two hydrated navigation tests plus six complete parent/make route and viewport checks.
- Motorcycle directory: 19 fixture states at 390/1280, 94 scoped reads; zero real writes or external requests.
- Existing shared-card browser suite: 12 scenarios pass, preserving ordinary car and motorcycle behavior.
- Final-source TypeScript, diff whitespace checks and webpack compile-mode check passed after the preview-label correction. Existing workspace-root, middleware-deprecation, Browserslist-age and Sentry/OpenTelemetry dependency warnings remain nonfatal. Compile mode used an unreachable local database URL, does not perform the production data-generation step, and is not a deployed build.
- DTC blind/edge reviews had no actionable findings. Motorcycle blind/edge reviews identified one shared synthetic-preview labeling issue; patched, regression-tested and independently rechecked as resolved.
- Root visually inspected mobile and desktop screenshots. Fixtures are labeled synthetic, not newly researched/published content.

## Exclusions and next gate

No research promotion, schema/database mutation, owner account, Stripe, customer email, Hub, paid XT6 Visual, or production deployment change. Existing unrelated external-http-url.ts state and main/pilot worktrees are preserved. Review these layout changes before approving a commit and deployment; the normal production build/data-generation and live smoke checks remain deployment steps.

## Review artifacts

- [DTC desktop fixture](../outputs/public-dtc-release/consolidated-parent-00290-1280.png)
- [DTC mobile fixture](../outputs/public-dtc-release/consolidated-parent-00290-390.png)
- [Motorcycle desktop fixture](../output/motorcycle-catalog-release/car-index-1280.png)
- [Motorcycle mobile fixture](../output/motorcycle-catalog-release/car-mixed-motorcycles-390.png)
- [Empty motorcycle mobile fixture](../output/motorcycle-catalog-release/car-empty-motorcycles-390.png)

Detailed code-review trails are in the two task specs alongside this file.

## Approved design and final local gate

The user approved the reference-card design after reviewing related codes below the FAQs: two columns on desktop, one column on mobile. Additional actual-component previews with four sample related links are in `outputs/public-dtc-release/related-codes-design-{390,1280}.png`. These are synthetic layout examples, not research or production coverage.

Following that approval, the final local rerun passed all 13 DTC regression groups, all eight DTC browser scenarios, TypeScript, and diff whitespace checks. The motorcycle browser rerun passed 19 fixture states at both widths with 94 scoped reads, zero real writes, and zero external requests. Its compiler needed the same local filesystem permission escalation as the earlier run; the rerun completed successfully.

### Release checklist

- [x] Approved reference-card layout, including visible related codes.
- [x] No duplicate legacy DTC sections; relevant citations stay inside issue cards.
- [x] Published-only related-code destinations and diagnostic guards verified.
- [x] Exact motorcycle headings and responsive discovery links verified.
- [x] Fresh local regression, browser, TypeScript, and whitespace checks passed.
- [x] Keep Hub, paid XT6 Visual, signup, billing, and research promotion outside this layout release.
- [x] Obtain commit/deployment go-ahead; user approved the release gate after the completed local checklist.
- [ ] Commit only the listed layout/components/tests and review documents, excluding generated QA artifacts and unrelated `external-http-url.ts` state.
- [x] Complete the normal production build/data-generation gate against the intended release environment. Full webpack/PWA build passed and generated all 1,564 static pages using the existing database configuration; no migrations invoked.
- [ ] After deployment, smoke-test 00290, a multi-make DTC, a make-specific DTC, and motorcycle discovery on mobile and desktop; verify related links and source/FAQ disclosures.

The release base remains `9a8a0d4813e0834836b412c177a95b1019fc5786`, verified against remote main and the current Vercel production deployment before release. At this pre-commit checkpoint, no commit, push, deployment, database changes, or customer communications have been made. Publishing pending motorcycle research remains a separate content decision.
