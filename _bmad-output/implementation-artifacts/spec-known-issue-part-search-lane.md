---
title: Known-issue part discovery: web search lane
status: done
baseline_commit: 2e9b38aca05b286d6589ebebd29f383d2ae58e7e
owner: Sol
reviewer: Opus
---

# Known-issue part discovery: web search lane

## Problem

The catalog-first pipeline is safe but misses parts a person can find from the article. In the Acura benchmark, only 5 of 38 human-linked issues reached a proposal. Of 258 work items, 118 were unmapped and 44 had no catalog result, so 63% stopped before any product search.

The user’s repeatable method is:

`{year range} {make} {model} {trims} {component from How to Fix} us`

The new lane must reproduce that discovery method without weakening fitment, repair-role, direct-product, or human-review controls.

## Approach

Add open-web discovery beside ShowMeTheParts. The catalog remains preferred evidence; web discovery fills catalog and taxonomy gaps. Both lanes produce held candidates only. Nothing is published automatically.

Before searching, classify each article/component into exactly one lane:

1. repair part
2. service fluid
3. diagnostic tool
4. recall/dealer/shop
5. no commerce

Only repair-part work enters this search lane. Tool and fluid rows use their dedicated review paths. Recall/dealer rows may later receive clearly labeled locator/search links, not part links.

## Invariants

Always:

- derive components from frozen title, YMMT/trim/engine scope, and full How-to-Fix evidence;
- emit one work item per positive repair component or explicit terminal hold;
- record the exact query, discovery source, observed product identity, and retrieval time;
- accept only direct product pages whose observed identity matches the proposed part;
- retain correct existing links and allow a reviewed primary plus alternate link;
- keep scoped fitment unknown or ambiguous until proven;
- check source documentation when the article itself may be wrong, especially fluids;
- require independent repair-role and fitment review before staging.

Never:

- read the human benchmark from runtime search code or use it as an answer key;
- allowlist a merchant merely because it appears in the benchmark;
- emit search/category URLs as product links;
- turn a tool, fluid, recall, software update, or dealer instruction into a fixPart;
- widen year, trim, engine, drivetrain, transmission, side, package, or emissions scope;
- deploy, apply, or mark Acura release-ready from this work.

Ask first before changing production, frozen source content, release authorization, or moving to a second make.

## Work

- [x] Tighten Acura Parts Warehouse product paths in both current consumers so year/category pages fail. Consolidate the duplicated rule into one shared source. Add the dependency to the completion hash contract.
- [x] Add a deterministic query builder using frozen YMMT, trim/engine qualifiers, normalized component, and `us`.
- [x] Add the lane classifier and require every component to terminate in search, another commerce lane, or an explicit hold.
- [x] Add a web-discovery adapter that stores query/evidence but never returns a public search URL. Resolver results remain candidates until identity, scope, and repair-role review pass.
- [x] Preserve catalog evidence as higher-confidence fitment evidence. Web-only candidates require conservative scope or a hold.
- [x] Add component-level evaluation against the frozen Acura benchmark without importing benchmark data into runtime code.
- [x] Generate a review-only Acura packet and keep its existing release blockers intact.

## Acceptance matrix

| Scenario | Required result |
|---|---|
| Exact retailer product URL with matching observed PN and scope | Held candidate with full evidence |
| Search/category/year-only URL | Reject |
| Article says test with multimeter or scanner | Diagnostic-tool lane, never fixPart |
| Recall, programming, or dealer-only repair | Dealer/shop lane, never fixPart |
| Fluid conflicts with OEM/TSB documentation | Content-error hold; no link |
| Existing correct direct link plus reviewed alternate | Preserve both, identified as primary/alternate |
| Unknown engine/trim/application restriction | Hold and hide commerce |

## Measurement

Measure `componentMatchRecall` over the 38 Acura issues with human-linked repair parts. A match requires the same repair component and compatible YMMT/application scope; merely finding any URL does not count.

- 28 or more: proceed to independent audit, then consider the next make.
- 15–27: improve extraction/querying and rerun Acura.
- Fewer than 15: stop and redesign the lane.

Also report exact-product precision, tool/fluid/dealer misclassification count, missing-component count, and wrong-scope count. All safety error counts must be zero.

## Verification

- Regression tests reject `/oem/acura~integra~2000.html` and `/oem/acura~tlx~2021~parts.html` while accepting real PN-shaped Acura product paths.
- Tests prove benchmark independence, deterministic queries, lane separation, terminal component coverage, direct-product identity, primary/alternate preservation, and fail-closed fitment.
- Re-run TypeScript, affected lint, focused/full tests, diff checks, packet hash checks, and Opus’s independent audit.

## Out of scope

Production writes, deployment, affiliate-program assumptions, automatic dealer recommendations, and processing any make after Acura are excluded from this change.

## Review outcome

Independent review approved the corrected frozen-result benchmark: Devon 26/38 versus precision 24/38. The two authoritative-spec-conflict TLX issues remain in historical scoring but their ten work items are non-executable. The reviewer accepted moving to Acura's larger eligible discovery run instead of tuning against the 38-issue sample.

## Suggested Review Order

**Queue and lane boundaries**

- Start with deterministic terminal accounting and source-correction search suppression.
  [`known-issue-part-search.ts:216`](../../src/lib/known-issue-part-search.ts#L216)

- Enforce eligibility again at the runner before any discovery can execute.
  [`discover-known-issue-part-search-results.ts:117`](../../scripts/discover-known-issue-part-search-results.ts#L117)

- Reject held discoveries and bind accepted evidence to exact frozen work items.
  [`known-issue-part-search.ts:366`](../../src/lib/known-issue-part-search.ts#L366)

**Benchmark integrity**

- Apply conservative component profiles and fail closed on unknown components.
  [`evaluate-known-issue-part-search-experiment.ts:52`](../../scripts/evaluate-known-issue-part-search-experiment.ts#L52)

- Require exactly paired templates before scoring unchanged frozen raw results.
  [`evaluate-known-issue-part-search-experiment.ts:108`](../../scripts/evaluate-known-issue-part-search-experiment.ts#L108)

**Commerce safety**

- Reject year-first descriptive pages unless the path carries product identity.
  [`known-issue-commerce.ts:149`](../../src/lib/known-issue-commerce.ts#L149)

- Bind every new discovery behavior into the completion hash contract.
  [`known-issue-completion-contract.js:59`](../../scripts/known-issue-completion-contract.js#L59)

**Regression evidence**

- Prove source-correction holds remain visible but cannot execute or review.
  [`known-issue-part-search.test.ts:131`](../../src/lib/known-issue-part-search.test.ts#L131)

- Cover axle-bearing, dashboard-cover, timing-guide, and generic-actuator false matches.
  [`evaluate-known-issue-part-search-experiment.test.ts:8`](../../scripts/evaluate-known-issue-part-search-experiment.test.ts#L8)

- Lock the generic year-in-slug category-page regression.
  [`known-issue-commerce.test.ts:47`](../../scripts/known-issue-commerce.test.ts#L47)
