# Volvo Known-Issues Final Audit

Status: done

## Intent

Account for every Volvo known-issue page without changing an indexed identity or suppressing a model page on uncertain evidence.

## Scope

- 180 published rows across 28 models.
- Three pre-existing archived rows pinned separately; no restoration or status change is authorized.
- Full-record integrity, citation/risk inventory, owner telemetry, commerce preservation, and per-year/selectable-trim routing.

## Acceptance criteria

- Exact snapshot and all-status hashes pass.
- 180 unique published IDs, three archived IDs, and all per-model counts reconcile.
- Every full-record field hash passes.
- Every published row is a compact, byte-identical, published hold with zero authorized writes.
- Routing accounts for every production matcher route and authorizes no metadata mutation.
- Risk signals expose uncited/invalid citations, applicability prose, owner-language/counts, commerce, and exact model/title duplicates.
- Routing records 174 rows with no exact selectable-trim overlap, but zero rows hidden for every selectable trim; these findings authorize no silent metadata rewrite.
- Mutation tests, validators, ESLint, TypeScript, and diff checks pass before local commit.

## Release note

This make has no catalog write manifest. Its artifacts will join the final remaining-makes branch and the independently reviewed Opus citation/deep-link work for one production release.

## Verification

- Deterministic Volvo, Volkswagen, Toyota, and Triumph validators: passed.
- Generic and Volvo mutation suite: 10/10 passed.
- Targeted ESLint: passed.
- TypeScript no-emit with incremental output disabled: passed.
- `git diff --check`: passed.

## Suggested Review Order

1. `scripts/volvo-hold-audit-config.js`
2. `scripts/volvo-hold-audit.test.js`
3. `data/known-issue-volvo-make-audit-2026-08-11.json`
4. `data/_volvo-status-inventory-2026-08-11.json`
