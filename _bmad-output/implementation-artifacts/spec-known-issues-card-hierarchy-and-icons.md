---
title: 'Clarify Known Issues cards, icons, and link affordance'
type: 'ux-fix'
created: '2026-07-16'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'f963ea0'
context: []
---

<frozen-after-approval reason="User explicitly added this visual cleanup to the active release on 2026-07-16.">

## Intent

**Problem:** Known Issue cards open with too much content, Critical and Moderate labels do not scan distinctly enough, colorful emoji compete with the sand/ink theme, and actionable links are difficult to distinguish from ordinary copy.

**Approach:** Keep article categories open but start each issue card collapsed; give Critical and Moderate explicit label treatments; replace article/category emoji with consistent monochrome symbols; and reserve Au7o blue for actionable links and primary conversion controls.

## Boundaries

**Always:** Preserve hash deep links so a linked issue opens automatically; keep issue copy present in server-rendered markup; retain category names, issue ordering, filters, and the sand/ink foundation; use `#3B82F6` consistently as the action color.

**Never:** Change issue facts, part links, severity values, category assignments, or the separate repair-link audit as part of this visual change.

</frozen-after-approval>

## Tasks & Acceptance

- [x] Render Critical in deep red with white text.
- [x] Render Moderate in orange with the existing ink text color.
- [x] Keep every article category expanded while each child issue starts collapsed.
- [x] Preserve direct `#issue-id` navigation, including automatic card expansion.
- [x] Replace emoji in desktop/mobile “In This Article” navigation and category headers with consistent monochrome SVG icons.
- [x] Use Au7o blue for affected-vehicle links, DTC links, verified part/vendor links, Open Hub, and Get Started primary CTAs.
- [x] Apply the collapsed issue hierarchy, severity labels, and hash expansion behavior to localized Known Issues articles.
- [x] Verify responsive markup, lint, and production build.

**Acceptance criteria:**

- Given a Known Issues article loads without a hash, when the issue list renders, then category sections are visible and individual issue bodies are collapsed.
- Given a direct issue anchor, when the page loads, then its category and card open and the card scrolls into view.
- Given Critical or Moderate severity, when the card header renders, then the requested label colors are legible without changing the issue title color.
- Given desktop or mobile article navigation, when category links render, then icons share one restrained SVG treatment instead of colorful emoji.
- Given actionable Known Issues content, when it renders, then Au7o blue makes the link or primary CTA visibly distinct from non-clickable sand/ink text.
- Given a localized Known Issues article, when it loads normally or through an issue hash, then cards start collapsed or open the targeted issue respectively while keeping translated copy server-rendered.

## Review Resolution

- Independent edge-case and blind reviews completed; localized-page parity was the only additional UI gap.
- Localized cards now collapse natively and hash targets expand without hiding server-rendered copy.
- Responsive browser checks and the full 1,531-page production build passed.

## Suggested Review Order

**Card hierarchy and severity**

- Start with collapsed card state, hash expansion, and the restrained severity system.
  [`KnownIssueCard.tsx:107`](../../src/components/known-issues/KnownIssueCard.tsx#L107)

- Apply deep red Critical and orange Moderate labels without recoloring titles.
  [`KnownIssueCard.tsx:144`](../../src/components/known-issues/KnownIssueCard.tsx#L144)

- Keep categories open while every child issue starts collapsed.
  [`ArticleIssuesList.tsx:283`](../../src/components/known-issues/ArticleIssuesList.tsx#L283)

- Share category expansion and icon treatment at the section boundary.
  [`CategorySection.tsx:36`](../../src/components/known-issues/CategorySection.tsx#L36)

**Navigation and action affordance**

- Replace colorful emoji with one reusable monochrome category icon family.
  [`IssueCategoryIcon.tsx:32`](../../src/components/known-issues/IssueCategoryIcon.tsx#L32)

- Bind the new icon language into desktop article navigation.
  [`ArticleSidebar.tsx:27`](../../src/components/known-issues/ArticleSidebar.tsx#L27)

- Reserve Au7o blue for DTC, vehicle, and verified commerce actions.
  [`KnownIssueCard.tsx:366`](../../src/components/known-issues/KnownIssueCard.tsx#L366)

- Use the same blue for the primary Open Hub header action.
  [`page.tsx:413`](../../src/app/known-issues/[slug]/page.tsx#L413)

**Localized parity**

- Render translated issues as collapsed native details with styled severity summaries.
  [`page.tsx:167`](../../src/app/[locale]/known-issues/[slug]/page.tsx#L167)

- Open and scroll direct localized issue anchors after hydration.
  [`LocalizedIssueHashExpander.tsx:10`](../../src/components/known-issues/LocalizedIssueHashExpander.tsx#L10)
