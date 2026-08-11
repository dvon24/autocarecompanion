# Triumph Known-Issues Audit

Status: done

## Intent

Freeze and audit every currently published Triumph known-issue record without repeating the earlier SEO failure caused by changing indexed identities or hiding model pages.

## Scope

- Exact production freeze: six published Triumph TR6 records captured on 2026-08-11 in a repeatable-read, read-only transaction.
- Review the full frozen record, citation metadata, owner telemetry, commerce, and selector routing.
- Preserve every record byte-identical unless exact same-identity primary evidence supports a separately reviewed correction.
- Do not write to production, archive, redirect, change title/URL/model/year/trim/status/severity, or add commerce during this audit.

## Acceptance criteria

- The frozen normalized file hash and internal snapshot hash are pinned.
- Exactly six unique records and the exact `{ TR6: 6 }` model count are enforced.
- Every `FULL_RECORD_FIELDS` before-hash verifies.
- Six decisions are deterministic, byte-identical published holds with zero authorized writes.
- Owner telemetry and commerce stay unchanged.
- The routing report records that all covered 1969-1976 years are outside the current 1990-2027 selector range and authorizes no metadata mutation.
- Mutation tests reject content, identity, status, owner, commerce, missing-row, and duplicate-row drift.
- Targeted tests, lint, TypeScript, and diff checks pass before local commit.

## Release note

This make produces no catalog write manifest. Its artifacts will be combined with the remaining-make audit work and Opus's independently reviewed citation/deep-link work for one final production deployment.

## Verification

- Deterministic build and validator: passed.
- Mutation tests: 5/5 passed.
- Targeted ESLint: passed.
- TypeScript no-emit with incremental output disabled: passed.
- `git diff --check`: passed.

## Suggested Review Order

1. `scripts/triumph-hold-audit-config.js`
2. `scripts/build-conservative-make-hold-audit.js`
3. `scripts/validate-conservative-make-hold-audit.js`
4. `scripts/conservative-make-hold-audit.test.js`
5. `data/known-issue-triumph-make-audit-2026-08-11.json`
