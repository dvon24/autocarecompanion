# Edge Case Hunter review prompt

Use the `bmad-review-edge-case-hunter` skill in read-only mode.

Review the complete tracked and untracked implementation diff in:

`C:\Users\devon\autocarecompanion\.codex-worktrees\make-part-links`

Baseline commit: `2e9b38aca05b286d6589ebebd29f383d2ae58e7e`

Approved spec: `_bmad-output/implementation-artifacts/spec-known-issue-part-search-lane.md`

Inspect `git diff 2e9b38aca05b286d6589ebebd29f383d2ae58e7e` plus every untracked path from `git status --short`. Do not edit, stage, commit, run discovery, call production, or regenerate artifacts.

Walk boundary cases and adversarial mutations, including:

- discontinuous years, duplicate trims, missing engines, punctuation, vague components, and very long queries;
- mixed part/tool/fluid/dealer articles and dealer clauses with separate owner-paid repairs;
- duplicate/missing issue, work-item, evidence, proposal, and search identities;
- exact PN token boundaries, URL encoding, credentials, query/category paths, lookalike hosts, and APW fake year pages;
- partial failures, resume behavior, stale queue/results, duplicate URLs, malformed timestamps, and foreign vendor labels;
- benchmark/expectation drift, inflated recall, and any path that mistakes query coverage for product precision;
- raw experiment index/hash drift, a missing or duplicate one of the 76 queries, same-component false positives, and ambiguity in context-narrowed phrases;
- template comparison math and the corrected frozen-result claim (Devon 26/38 vs precision 24/38), without treating retrieval as fitment, availability, or publishability;
- source-correction-held TLX rows remaining visible for historical scoring but non-executable in the operational queue;
- missing implementation hashes or a rewritten blocked COMPLETE that could authorize production.

Reproduce findings with exact commands or mutations. Return APPROVE or BLOCK with only actionable findings.
