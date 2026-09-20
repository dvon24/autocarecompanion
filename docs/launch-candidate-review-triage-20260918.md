# Independent launch-candidate review — scoped corrections

The two independent review passes inspected the complete tracked/untracked candidate against baseline `9a64b8248576a1b5393407e4f472cb1860249cc3`. The parent deduplicated findings and assigned severity. Each retained finding below is a deterministic patch to an existing approved behavior, not a new product decision or authorization to activate it.

| Finding | Severity | Correction / verification |
|---|---|---|
| Account deletion can race or discard an unfinished checkout | High | Use the existing billing lock; refuse unsettled attempts and uncertain provider identity/cancellation before deleting account or recovery journals. Mocked provider/concurrency tests. |
| New enrollment and checkout journals survive account erasure | High | Remove proven owner-scoped journals only after safe settlement, using the locked database identity and enrollment lock. Ambiguous identity refuses. |
| Claimed beta cannot open its own service history | Medium | Exact-vehicle server guard on records; keep account-wide index/settings/showcase guards. Foreign/unclaimed/expired vehicles deny. |
| Equipment recovery is blocked by its own access gate | Medium | Permit only exact current-profile, revision-checked confirmation for an already-claimed eligible vehicle; no other mutations or trial reset. Unclaimed owners return to claim flow. |
| Resubmitting actual mileage silently reuses old value | Medium | Explicit mileage correction is guarded and recorded without replacing identity/equipment or fabricating service history. |
| New private receipt upload can run with cleanup disabled | High | Upload, extraction and storage fail closed unless the existing cleanup environment is ready. Existing reads/deletes remain possible. Scheduling and actual worker verification remain held launch gates. |
| Visual library lists only XT6 | Medium | Derive cards from reviewed Visual definitions with nonempty mappings; exclude unsupported Aviator. Preserve membership/article publication gates. |
| Exact transmission service is absent from the selector | Medium | Display the automatic/manual values supplied by the tree; retain server branch validation. |
| Invoice cost transfer leaves stale totals after deletion | Medium | Reload canonical surviving records. Failed reload retains confirmed deletion and withholds stale totals/print with retry. |
| Unsupported saved Twin has no usable receipt/service entry | Medium | Authorized maintenance member uses the existing shared review component; supported vehicles continue to tree/setup. No legacy editor or new write path. |

Root review fixes were independently rechecked. The follow-up found an unclaimed-equipment dead end, corrected by routing `canConfirm=false` to `/twin/claim`; the actual route regression exercises both claimed and unclaimed outcomes. Static follow-up found no introduced data leak in the scoped guards or service-history corrections. One reviewer's execution was blocked by sandbox directory permissions before assertions; the parent reproduced that environment failure and reran offline tests successfully with approved normal filesystem access.

These checks are local synthetic/mock evidence. They do not prove production provider identity, data mapping, inbox delivery, scheduler execution or live webhook operation. No pilot data, production services or customer communications were changed.
