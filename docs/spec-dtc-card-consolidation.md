---
title: Consolidate DTC content into the new issue-card layout
type: bugfix
created: 2026-09-12
status: done
baseline_commit: 9a8a0d4813e0834836b412c177a95b1019fc5786
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The released parent DTC page added new full issue cards above its legacy template, repeating the definition, costs and vehicle issues. Useful supporting content belongs in the card experience rather than a second design below. The user approved this consolidation and requested that the useful code context, related codes, FAQs and sources be rolled into cards.

**Approach:** Present one coherent card-based page for parent and make-specific DTC routes. Keep code-level reference information once, clearly separated from vehicle-specific evidence, within a compact reference card if needed. Keep issue-specific content and citations within the relevant issue card. Remove obsolete duplicate sections and their navigation. Retain discovery for every covered make/model without serializing hundreds of expanded full records onto parent pages.

## Boundaries & Constraints

**Always:** Preserve published-only diagnostic/commerce guards, fitment qualifications, recall-first handling, step-specific tools and applicable vehicle identity. Retain working navigation to every published code/make page and linked issue, including beyond the first five featured records. Keep source attribution attached to the claims it supports, with safe external URLs. FAQs must be visible and supported; structured FAQ data must match displayed FAQ content. Generic code guidance must not be represented as a diagnosis for a specific car. Use neutral diagnostic-code wording so manufacturer codes such as 00290 are not labeled standard OBD-II.

**Ask First:** Deployment, commits, data promotion, billing, account changes or expanding into a diagnostic research run. Work in the existing release workspace without altering unrelated dirty files.

**Never:** Invent diagnoses, vehicle applicability, new FAQs or citations; copy the same reference text/FAQ into every card; remove known-issue repair products; replace link guards; use a cosmetic CSS hide to leave duplicated legacy content in rendered HTML; remove all navigation to non-featured vehicles; change unrelated car or motorcycle issue-card experiences by default.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Single-vehicle code | 00290-style manufacturer code with one issue | One issue card plus nonduplicated code context; no obsolete lower template or OBD-II classification claim | Do not infer root cause beyond source record |
| Large parent | Many makes and more than five issues | Bounded featured full cards plus compact routes to all makes; content is not repeated as old mini issue cards | No disappearing make coverage |
| Make-specific | Several models and triage | Existing model/triage navigation works; supporting information uses card design without duplicated lower issue listing | Preserve same-hash reopening behavior |
| Missing support | Empty causes, citations, FAQ fields | Omit empty subsections, retain available issue content | No empty FAQ headings or fake source claims |
| Unsafe source | Unsupported source URL scheme | Source not linked | Existing safe-URL handling remains |
| Narrow device | 390px viewport, long code/vehicle names | Wrapped readable cards, usable disclosures and chips | No overflow or nested interactive controls |

</frozen-after-approval>

## Code Map

- `src/app/known-issues/dtc/[code]/page.tsx` — current five featured issue cards followed by legacy definition, sidebar, causes, costs, vehicles, related, FAQ, sources; primary cleanup target.
- `src/app/known-issues/dtc/[code]/[make]/page.tsx` — inspect and align make-specific supporting content while retaining triage and model selection.
- `src/components/known-issues/KnownIssueCard.tsx` — shared issue renderer already provides symptoms, fix, commerce and sources; avoid default behavior changes on ordinary known-issue articles.
- `src/components/known-issues/DtcModelSection.tsx`, `DtcSidebar.tsx`, `DtcAnchorLink.tsx` — current model grouping and same-hash navigation.
- `src/lib/dtc-codes.ts` — existing published data and linkability providers; no data edits required.
- `scripts/public-dtc-release.test.cjs`, `scripts/qa-public-dtc-release.cjs` — existing actual-source and browser QA harnesses.

## Tasks & Acceptance

**Execution:**
- [x] DTC page modules and narrowly scoped supporting component(s) — consolidate code reference in card design once; delete obsolete lower layout while preserving all make discovery and safe issue content.
- [x] DTC test scripts — assert single/multi-make, empty-support and manufacturer-code output; verify structured FAQ consistency, source attribution and no duplicate legacy blocks.
- [x] Browser QA — inspect 390px and 1280px renderings and disclosure/navigation interactions, capturing screenshots.
- [x] This spec — record evidence, review outcomes and no-deployment status.

**Acceptance Criteria:**
- Given an issue card on either DTC route, when reading its repair content, then supporting issue sources remain within that card without a second copy below the page.
- Given a parent DTC page, when passing the featured cards, then no legacy description/cost/vehicle-card template follows them.
- Given a code with numerous makes, when looking for a non-featured vehicle, then every published make remains reachable through a compact directory.
- Given shared reference material, when it is displayed, then it appears once in the card-based experience and does not imply vehicle-specific applicability.
- Given numeric manufacturer code 00290, when reading metadata or visible introductory copy, then no generic template calls it a standard OBD-II code.
- Given existing triage navigation, when opening and reopening the same target, then the correct issue remains accessible and expanded.

## Spec Change Log

## Design Notes

This records the user's repeated approved card-consolidation intent. Retain existing source-based text rather than manufacture issue-specific FAQs from generic reference data. A single clearly labeled code-reference card is preferable to duplicating generic guidance into every vehicle issue. Preserve the site's existing paper background and restrained border/radius styles.

## Verification

Implementation evidence (2026-09-12):

- Actual-source regression suite: 13/13 pass, including manufacturer code 00290, empty support, every make/model beyond five featured cards, matching visible/structured FAQs, published related routes, malformed citations, safe per-issue sources without the old global 12-source cap, and unchanged ordinary card source defaults.
- Full TypeScript check passed after the DTC-only source and separate-header-link options were added.
- Browser harness passes hydrated model/triage same-hash navigation, issue permalinks and DTC chip isolation, retained engine/trim badges, and six full-route SSR checks at 390px/1280px (multi-make parent, 00290 parent, make route). Native reference/source disclosures, repeated FAQ navigation, no nested controls and no horizontal overflow verified.
- Full-route HTML and screenshots: `outputs/public-dtc-release/consolidated-{parent-multi,parent-00290,make}{,-390,-1280}.{html,png}` (HTML omits viewport suffix). These use explicitly synthetic fixtures with intercepted providers; they do not represent newly published diagnostic procedures or triage.
- Root inspected mobile and desktop complete-route screenshots, including the fixed local mascot and synthetic-fixture label. Cards, citations, reference disclosures and make navigation remain readable without the former lower template.
- Independent blind and edge-case reviews of the frozen DTC diff found no actionable regressions. The root also independently ran all 13 regression tests and TypeScript successfully. The optional DTC header-link row fixes nested interactions while preserving ordinary article defaults.
- No commit, push, deployment, database write, data promotion, or external network request performed. Unrelated dirty `external-http-url.ts` and motorcycle scope were not edited.

- `node --test scripts/public-dtc-release.test.cjs` — existing guard tests and new consolidation assertions pass.
- `node scripts/qa-public-dtc-release.cjs` — responsive and interaction checks pass with updated fixtures.
- `node ../../node_modules/typescript/bin/tsc --noEmit --incremental false` — no type errors.
- Inspect screenshots at mobile/desktop widths; no commit, push, deployment or database writes.

## Suggested Review Order

- Start with the consolidated page and compact all-make navigation.
  [page.tsx:308](../src/app/known-issues/dtc/[code]/page.tsx#L308)
- Shared reference material appears once, with matching visible and structured FAQs.
  [DtcReferenceCard.tsx:12](../src/components/known-issues/DtcReferenceCard.tsx#L12)
- Citations stay with their applicable issue; invalid legacy entries are excluded.
  [DtcIssueSources.tsx:4](../src/components/known-issues/DtcIssueSources.tsx#L4)
- DTC-only options preserve ordinary article behavior and separate navigation from disclosure controls.
  [KnownIssueCard.tsx:119](../src/components/known-issues/KnownIssueCard.tsx#L119)
- Regression fixtures cover supporting content and non-featured vehicle discovery.
  [public-dtc-release.test.cjs:1](../scripts/public-dtc-release.test.cjs#L1)
- Full route screenshots complement hydrated navigation checks.
  [qa-public-dtc-release.cjs:1](../scripts/qa-public-dtc-release.cjs#L1)

Work is ready for review alongside the motorcycle landing change. No local commit was created: the approved boundaries require asking first. Nothing was pushed or deployed.
