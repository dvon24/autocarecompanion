# Blind Hunter review prompt

Use the `bmad-review-adversarial-general` skill in read-only mode.

Review the complete tracked and untracked implementation diff in:

`C:\Users\devon\autocarecompanion\.codex-worktrees\make-part-links`

Baseline commit: `2e9b38aca05b286d6589ebebd29f383d2ae58e7e`

Approved spec: `_bmad-output/implementation-artifacts/spec-known-issue-part-search-lane.md`

Inspect `git diff 2e9b38aca05b286d6589ebebd29f383d2ae58e7e` plus every untracked path from `git status --short`. Do not edit, stage, commit, run discovery, call production, or regenerate artifacts.

Verify every invariant and acceptance row, especially:

- runtime search code cannot read the human benchmark or expectation answer key;
- the Acura Parts Warehouse rule rejects model/year/category pages in both consumers;
- repair parts, tools, fluids, recall/dealer work, and no-commerce cannot cross lanes;
- every frozen work item has exact Devon and precision query variants and no year/application scope is widened;
- raw web results remain held and search/category URLs never become public commerce;
- existing catalog evidence remains stronger and primary/alternate discovery is explicit;
- completion hashes include every new behavioral dependency;
- Acura remains `AUDIT_COMPLETE_RELEASE_BLOCKED`, `productionApplied:false`, and unauthorized.

Also audit the completed 38-issue/76-query experiment:

- `part-search-codex-raw-v2.json` is bound to `part-search-lane-evaluation.json` and contains all 76 attributable query results;
- `part-search-experiment-evaluation.json` reports the corrected frozen-result scores: Devon 26/38 strict same-component retrieval and precision 24/38, without treating either as fitment or publish approval;
- both authoritative-spec-conflict TLX rows remain in the historical benchmark but are marked non-executable in the operational queue;
- generic parser phrases are contextually narrowed before search (for example motor mounts, VTEC oil-pressure switch, rear LCA bolts, sunroof drains, and Type S Brembo front pads);
- direct-product and same-component scoring cannot be inflated by category/search pages or unrelated product titles.

Reproduce findings with exact commands or mutations. Return APPROVE or BLOCK with only actionable findings.
