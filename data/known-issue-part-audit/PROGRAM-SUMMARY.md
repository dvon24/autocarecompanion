# Known-Issue Part-Link Audit Program

Status: **review-ready, not applied**  
Frozen sources: 2026-08-13 program snapshot plus the earlier hash-bound Acura/Alfa Romeo/Audi sources  
Production writes, deployments, commits, pushes, and staging performed by this audit: **none**

## Program totals

- Makes completed in alphabetical order: **54 / 54**
- Published issues frozen and classified: **7,674**
- Component/application work rows reconciled: **29,575**
- Fitment-backed proposals: **183** proposals / **270** candidate part rows
- Repair-role approvals: **88** candidate rows
- Selected primary rows staged by guarded manifests: **12**, affecting **11** issues
- Existing verified public part claims reviewed: **187**
  - Preserve as safe: **21**
  - Block as unsafe/incomplete: **166**
- Diagnostic dispositions with reviewed tool links: **2,322**
- Explicit unresolved diagnostic-tool holds: **1,794**
- No-tool diagnostic/inspection dispositions: **6,412**
- Uncovered diagnostic instructions: **0**

Every make is intentionally `AUDIT_COMPLETE_RELEASE_BLOCKED`; none is authorized for production. Across the 54 packets, release blockers are recorded as:

- **314** unapplied existing-claim removal proposals
- **52** selected-vehicle context requirements
- **46** makes with no reviewed commerce write
- **32** full-record release guards

## Retailer policy captured by the audit

- Preserve a correct exact manufacturer, OEM-retailer, NAPA, Advance Auto, Mishimoto, MoparPartsGiant, or similar direct product page.
- When available, add one exact vendor-distinct eBay product page as the alternate.
- Expose at most two links per part; do not replace a stronger primary with eBay merely for uniformity.
- Reject searches, category pages, lookalike hosts, wrong affiliate ownership, used or bundled listings that do not prove the reviewed exact part, and any link whose scope cannot be enforced for the selected vehicle.
- NAPA pages may be reviewed now; affiliate attribution must wait for the approved account details.

## Final alphabetical boundary

- **Toyota:** 579 issues / 3,360 work rows. Both existing Toyota Genuine Parts Camry water-pump links were preserved. The 2.5L `16100-09515` application was independently listed for Camry 2009-2017 including 2AR-FE; live eBay results were used pumps or mixed kits and were not approved as alternates. The 3.5L `16100-09442` official link was preserved.
- **Triumph:** 6 issues / 28 work rows. No existing verified public claims or fitment-backed proposals; no commerce guessed.
- **Volkswagen:** 329 issues / 803 work rows. Four Tiguan links were held because CCTA-versus-DGUA scope exists only in prose and is not enforceable by the current stored part variants.
- **Volvo:** 180 issues / 599 work rows. No existing verified public claims or fitment-backed proposals; staged/non-public part-number evidence remains frozen for later manual work.

## Verification

- All **54** `COMPLETE.json` files match every bound artifact on disk.
- All **54** diagnostic and commerce implementation hash maps match the current worktree.
- Focused TypeScript tests: **56 / 56** pass.
- Apply/finalizer safety tests: **113 / 113** pass.
- Full TypeScript no-emit check: pass.
- Focused ESLint: pass.
- `git diff --check`: pass (line-ending notices only).

The next authorized step is an independent Opus review of the isolated worktree. A later release still requires a separate explicit release authorization and must reverify the frozen records against current production before any write.
