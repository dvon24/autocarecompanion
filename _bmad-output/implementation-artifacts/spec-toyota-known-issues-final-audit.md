# Toyota Known-Issues Final Audit

Status: done (production apply intentionally deferred to the final combined release)

## Intent

Close Toyota without risking the indexed catalog: freeze every live Toyota row, reconcile archived history separately, preserve all uncertain identities, and prepare only already reviewed safe restoration candidates for the final guarded batch.

## Frozen scope

- 547 published Toyota rows across 39 models.
- 107 archived Toyota rows, for 654 all-status rows total.
- The existing reviewed cohort spans 91 rows: two canonical replacements are already published and 89 remain archived. Its decisions are 2 keep replacement, 32 rewrite then publish, 7 duplicate holds, and 50 archive holds.
- The other 18 archived rows remain outside the reviewed cohort and stay archived.

## Safety invariants

- Published identities, URLs, titles, vehicle metadata, status, severity, owner telemetry, commerce, and related IDs are unchanged by the 547-row audit.
- Compact decisions are cryptographically tied to the committed full-record snapshot; no duplicate full content is added to Git.
- No archived row is blanket restored.
- Only the 32 already reviewed rewrite candidates may enter a later guarded apply manifest, and only if the live after-state hash still matches.
- The seven duplicate decisions remain archived. Their IDs are card anchors on model-level article URLs, not standalone routes, so there is no issue-detail 404 route to redirect.
- The final apply must happen before the single production deployment and must re-run published/model-count gates afterward.

## Acceptance criteria

- Exact snapshot hashes, 547 unique IDs, and all 39 per-model counts pass.
- Every full-record field hash passes.
- The 547-row audit is deterministic, all-hold, published, compact, and zero-write.
- Risk signals expose uncited rows, invalid/search citations, applicability prose in trims, owner-claim language, positive telemetry, commerce, and exact model/title duplicate clusters without mutating them.
- All-status inventory proves 547 published and 107 archived.
- The 91-row adjudication and all three rewrite packets pass their validators.
- A fresh read-only production verifier is cryptographically bound to the exact adjudicated 32-ID set, pinned proposal-file hashes, and after-state digest; all 32 remain archived and hash-identical.
- Targeted tests, ESLint, TypeScript, and diff checks pass before local commit.

## Release sequencing

1. Finish and independently review the remaining makes.
2. Build a guarded apply manifest for the 32 Toyota rows from the frozen proposal files.
3. Verify current row hashes inside the write transaction, apply, and post-verify all fields.
4. Run global/model routing and catalog invariants.
5. Reconcile Opus citation/deep-link work.
6. Deploy the combined production commit once.

## Verification

- Deterministic Toyota and backward-compatible Triumph validators: passed.
- Audit/adjudication mutation suite: 15/15 passed.
- Fresh read-only production verification: 32/32 rewrite candidates matched and remained archived.
- Targeted ESLint: passed.
- TypeScript no-emit with incremental output disabled: passed.
- `git diff --check`: passed.

## Suggested Review Order

1. `scripts/toyota-hold-audit-config.js`
2. `scripts/build-conservative-make-hold-audit.js`
3. `scripts/validate-conservative-make-hold-audit.js`
4. `scripts/toyota-hold-audit.test.js`
5. `data/known-issue-toyota-make-audit-2026-08-11.json`
6. `data/known-issue-toyota-adjudication-2026-08-05.json`
7. The three `known-issue-toyota-*-rewrite-proposals-2026-08-05.json` files

## Reviewed republish release gate (2026-08-11)

- The 32 independently reviewed `rewrite_then_publish` rows are frozen in `data/known-issue-toyota-reviewed-release-manifest-2026-08-11.json`.
- The manifest is rebuilt deterministically from the hash-pinned 91-row hold packet, adjudication, and three proposal files. It cannot introduce an unreviewed ID or patch.
- Every write requires the exact archived full-record before hash under row lock, an exact pre-release catalog inventory of 7,642 published / 547 published Toyota / 107 archived Toyota, and the explicit batch confirmation token.
- The transaction is all-or-nothing at `SERIALIZABLE`; it verifies all 32 full-record after hashes and the projected 7,674 / 579 / 75 inventory before commit.
- The release changes only the reviewed non-identity patch fields. `make`, `model`, and `category` are absent from the generated SQL. All 32 title restorations are explicitly justified and apply only to currently archived rows.
- This tooling remains unapplied until the all-make release batch has passed independent review.
