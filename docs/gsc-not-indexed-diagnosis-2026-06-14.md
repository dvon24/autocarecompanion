# GSC "Crawled — currently not indexed" — diagnosis & plan (2026-06-14)

**Report size:** 934 Pending + 199 Failed validation = ~1,133 URLs, some dating to Mar 24.
**Context:** ~8,650 URLs indexed. Daily new content.

## What I checked directly (WebFetch, not theory)

| URL | Finding |
|---|---|
| `/known-issues/honda-civic` (base, "not indexed") | Canonical correct (self), **no** noindex, **26 issue cards, ~20k words** — a complete, high-quality page. |
| `/known-issues/honda-civic?year=2018` (variant) | Unique title, content filtered to 11 cards. Per code, **self-canonicalizes to `?year=2018`**. |
| `/known-issues/dtc/2e85` | **404 ("Not Found")** — a phantom. Issue cards linked DTC chips for codes with no reference page. |

## Root cause (high confidence)

**This is not a page-quality problem on the base pages — it's sitewide index bloat.**

1. **Year-variant self-canonicalization (the big one).** Task #80 made every `?year=YYYY` a self-canonical indexable page to "multiply index footprint 5-7×." With ~1,200 models × ~5-13 years each, that's **~8,000+ near-duplicate URLs**, each being the base page filtered to a subset (80%+ shared content). Google's site-quality classifier is **sitewide**: a large mass of thin, near-duplicate self-canonical URLs dilutes crawl budget and lowers the domain's perceived quality, which suppresses indexing of the **good** pages too. That's why honda-civic / camaro / corolla — genuinely strong pages — sit unindexed alongside the variants. The strategy isn't working: the variants themselves aren't getting indexed *either*.
2. **Phantom DTC 404 links (secondary, NOW FIXED + deployed).** ~70 codes cited by issues had no `/dtc/[code]` page, but issue cards linked all of them → thousands of internal links to 404s. Crawl-budget waste + a low-quality signal. Fixed in commit `e396eee` (`getLinkableDtcCodes` gates chip linking; unknown codes render as plain text). 15 of the most-cited codes also got real reference pages this week.
3. **Expected noise (ignore).** `citro-n-*` slugs (301 → `citroen-*`), `?make=cadillac` param URLs, redirect legacy slugs — these drop on their own.

## Recommended fix (NEEDS YOUR CALL — reverses task #80)

**Collapse year variants into their base page:**
- Change the `?year=YYYY` canonical from self → the **base** page (`/known-issues/<model>`).
- **Remove** year variants from `sitemap.ts`.
- Keep the year filter working for users (it already filters client-side; the URL just won't be a separate indexable doc).

**Why:** turns ~8,000 thin duplicates into ~1,200 strong canonical pages, concentrating all ranking signal on the page that should rank. Google stops wasting crawl budget on variants and re-assesses the domain. Expectation: the base model pages move to Indexed over the following weeks.

**Trade-off:** you lose the *theoretical* per-year SERP entries (e.g. "2018 honda civic problems" landing on the year URL). But they're **not indexed today anyway**, so there's nothing real to lose — and the base page can still rank for those queries (it contains the 2018 content). If you later want per-year pages, the right way is a *smaller* set of genuinely differentiated pages (only model-years with unique high-volume issues), not all of them.

**My recommendation: do it.** The evidence is clear — the variant strategy is costing more than it returns. But it's your call since #80 was deliberate. Say the word and it's a ~30-min change (canonical logic + sitemap), build, deploy.

**Optional confirmation step:** the full adversarial GSC workflow (4 inspector agents + synthesis) was queued but hit the weekly workflow limit (resets 8pm Berlin). It can run after reset to independently confirm before any change — but the direct WebFetch evidence above is already strong.

## Already shipped this cycle (commit e396eee, live)
- Phantom DTC links fixed sitewide (the #2 cause).
- Don't need your approval; already deployed.
