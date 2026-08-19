# Acura corrected-link release audit

The initial production batch `acura-corrected-links-2026-08-19` was applied and
verified. Its immutable receipt is
`data/known-issues-catalog-deeplink-results/acura-corrected-links-2026-08-19.json`
and records manifest hash
`7a282a9741d73600f847decdc2e4de48642759365ad637905e21b178304f8357`.

The corresponding local decision file was regenerated after application and no
longer matched that receipt. It was therefore removed from the live decisions
directory rather than falsely presenting a mismatched manifest/receipt pair.
The receipt's per-issue after-state hashes remain the authoritative record of
what the applicator wrote and verified.

The applied display hotfix decision and receipt remain an exact hash-matched
pair. `final-target.json` is a separately named, reproducible target generated
from the frozen source snapshot and review ledger. Any later production delta
must use a new batch ID and decision file; release tooling must never overwrite
an applied batch manifest.
