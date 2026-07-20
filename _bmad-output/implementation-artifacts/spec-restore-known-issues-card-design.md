---
title: 'Restore the approved Known Issues card design'
type: 'bugfix'
created: '2026-07-19'
status: 'done'
review_loop_iteration: 0
baseline_commit: '2919af88801aa1ad37733350e67d5766c8868d60'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The production deploy from `known-issues-catalog-deeplinks` omitted the two newer `origin/main` commits, causing Known Issues articles to show the previous card hierarchy, colors, icons, and link affordances. The catalog/deep-link release must remain intact.

**Approach:** Reapply the already-approved Known Issues presentation from `origin/main` onto the deployed catalog baseline, resolving the two overlapping article/card files so both the visual behavior and newer catalog analytics/routing survive.

## Boundaries & Constraints

**Always:** Preserve the catalog audit, affiliate-source analytics, year-correct Hub links, free-Hub search routing, mobile email popup, issue facts, and part-link data. Restore deep-red Critical, orange Moderate, collapsed child cards, expanded categories, monochrome category icons, hash auto-expansion, and Au7o-blue actions on standard and localized articles.

**Ask First:** Any resolution that would change issue content, commerce eligibility rules beyond the already-reviewed `origin/main` implementation, authentication behavior, database data, or unrelated Hub functionality.

**Never:** Replace current files wholesale when that discards `c253916` behavior; merge unrelated `origin/main` application changes; alter the frozen catalog audit; deploy before focused checks and the production build pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Normal article | Model article without a hash | Categories remain expanded; each issue body starts collapsed | Content remains server-rendered for SEO/accessibility |
| Deep link | URL contains a valid `#issue-id` | Matching category/card opens and scrolls into view | Unknown hashes leave the normal collapsed state |
| Catalog commerce | Verified, unverified, or non-product recommendation | Only eligible verified product links render as purchase actions | Preserve audit metadata and source tracking |
| Localized article | Localized route with or without hash | Matches the standard collapse/hash behavior | Translated copy remains server-rendered |

</frozen-after-approval>

## Code Map

- `src/components/known-issues/KnownIssueCard.tsx` — issue hierarchy, severity labels, blue actions, commerce rendering, and affiliate analytics.
- `src/components/known-issues/IssueCategoryIcon.tsx` — shared restrained SVG icon family.
- `src/components/known-issues/{ArticleIssuesList,ArticleSidebar,CategorySection}.tsx` — expanded-category state and navigation icon treatment.
- `src/app/known-issues/[slug]/page.tsx` — standard article header CTA and year-correct Hub routing.
- `src/app/[locale]/known-issues/[slug]/page.tsx` — localized collapsed cards and hash support.
- `src/components/known-issues/LocalizedIssueHashExpander.tsx` — localized hash opening and scrolling.
- `src/lib/known-issue-commerce.ts` — reviewed commerce visibility guard consumed by the restored card.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/known-issue-commerce.ts` and `scripts/known-issue-commerce.test.ts` — restore the reviewed product-link visibility guard and its edge-case coverage from `f963ea0`.
- [x] `src/components/known-issues/{IssueCategoryIcon,ArticleIssuesList,ArticleSidebar,CategorySection,ConfidenceBadge,SeverityFilter,VerificationBadge,MobileBottomBar}.tsx` — restore the approved hierarchy, restrained icons/colors, and blue action affordance from `origin/main`.
- [x] `src/components/known-issues/ToolRecommendations.tsx` — remove the duplicate recommendation surface restored by neither approved design nor catalog audit.
- [x] `src/components/known-issues/KnownIssueCard.tsx` — combine the approved collapsed-card/commerce presentation with the surviving verified `fixPart` source tracking from `c253916`; community shopping links are intentionally suppressed by the approved commerce guard.
- [x] `src/app/known-issues/[slug]/page.tsx` — combine the blue Open Hub action with `hubYear` and `hubHref` routing from `c253916`.
- [x] `src/app/[locale]/known-issues/[slug]/page.tsx` and `src/components/known-issues/LocalizedIssueHashExpander.tsx` — restore localized collapsed-card and hash-target parity.
- [x] `src/components/known-issues/AlertSignupPopup.tsx` and `src/components/known-issues/ModelIssueSearch.tsx` — verify they remain byte-identical to `2919af8` so the mobile popup and free-Hub routing do not regress.
- [x] All changed TypeScript files — run focused tests, lint, type-check, and build before review.

**Acceptance Criteria:**
- Given production-equivalent article data, when the page renders, then the approved card hierarchy, severity styling, icon system, and blue actionable links are restored without duplicate commerce locations.
- Given a catalog affiliate click or year-filtered article, when the user follows the action, then its source metadata and vehicle-year destination remain correct.
- Given the diff against `2919af8`, when reviewed, then it contains only the Known Issues restoration, its commerce helper/test, and this spec.

## Spec Change Log

## Design Notes

`origin/main` is the visual source of truth, but a whole-branch merge is intentionally avoided because it also contains independent Hub, authentication, and YMMT work. The two overlapping files require additive conflict resolution rather than choosing either branch wholesale.

## Verification

**Commands:**
- `tsx --test scripts/known-issue-commerce.test.ts` — commerce eligibility regression suite passes.
- `npx eslint <changed TypeScript files>` — no errors in the restoration surface.
- `npx tsc --noEmit` — combined branch type-checks.
- `npm run build` — production build completes.
- `git diff --check` — no whitespace errors before commit.

**Manual checks:**
- Inspect a standard and localized Known Issues article with and without a valid issue hash at desktop and mobile widths.

## Suggested Review Order

**Card hierarchy and visual language**

- Start with severity treatments and the restrained sand/ink badge system.
  [`KnownIssueCard.tsx:141`](../../src/components/known-issues/KnownIssueCard.tsx#L141)

- Confirm issue copy stays rendered while each card body starts hidden.
  [`KnownIssueCard.tsx:421`](../../src/components/known-issues/KnownIssueCard.tsx#L421)

- Keep categories open while child issue cards start collapsed.
  [`ArticleIssuesList.tsx:286`](../../src/components/known-issues/ArticleIssuesList.tsx#L286)

- Review the shared monochrome category, recall, and FAQ icon family.
  [`IssueCategoryIcon.tsx:32`](../../src/components/known-issues/IssueCategoryIcon.tsx#L32)

- Verify the final recalls header uses the same restrained icon treatment.
  [`page.tsx:614`](../../src/app/known-issues/[slug]/page.tsx#L614)

**Routing and localized parity**

- Preserve year-correct blue Open Hub routing from article headers.
  [`page.tsx:415`](../../src/app/known-issues/[slug]/page.tsx#L415)

- Route free search actions to the same year-correct Hub destination.
  [`page.tsx:592`](../../src/app/known-issues/[slug]/page.tsx#L592)

- Derive year filtering directly from server navigation state.
  [`ArticleIssuesList.tsx:45`](../../src/components/known-issues/ArticleIssuesList.tsx#L45)

- Clear competing timers before opening a new localized hash target.
  [`LocalizedIssueHashExpander.tsx:10`](../../src/components/known-issues/LocalizedIssueHashExpander.tsx#L10)

- Keep localized issue copy server-rendered inside native collapsed details.
  [`page.tsx:167`](../../src/app/[locale]/known-issues/[slug]/page.tsx#L167)

**Commerce safety and attribution**

- Enforce marketplace, direct-retailer identity, and product-route validation centrally.
  [`known-issue-commerce.ts:21`](../../src/lib/known-issue-commerce.ts#L21)

- Render verified repair commerce in one canonical card section.
  [`KnownIssueCard.tsx:503`](../../src/components/known-issues/KnownIssueCard.tsx#L503)

- Retain `fixPart` attribution on the surviving verified purchase action.
  [`KnownIssueCard.tsx:590`](../../src/components/known-issues/KnownIssueCard.tsx#L590)

- Finish with product, vendor, deduplication, and recall-first regression cases.
  [`known-issue-commerce.test.ts:11`](../../scripts/known-issue-commerce.test.ts#L11)
