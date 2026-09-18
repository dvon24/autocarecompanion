# Clean launch candidate — local review packet, 2026-09-18

Status: local implementation, independent review corrections and final validation complete. Ready for human release review, not production activation. The exact owned local PostgreSQL cluster was identity-verified and stopped cleanly after final validation; all synthetic data and evidence remain available.

## Scope and provenance

Baseline: 9a64b8248576a1b5393407e4f472cb1860249cc3. Source: sibling known-issue-twin-pilot checkout, with its reviewed dirty state. No source pilot edits, account reset, shared Prisma regeneration, remote operation, push, production SQL/data change, provider charge, or email send was performed.

The exact path-level inventory is [launch-candidate-manifest-20260918.json](launch-candidate-manifest-20260918.json). It records source and candidate SHA-256, baseline hashes, text-normalized comparison, manual merge decisions, protected main content, and excluded pilot changes. The manifest does not recursively hash itself. Its updater checks complete changed-path coverage and rejects selected-source/evidence drift. Generated build output, private dependency copies and synthetic databases are ignored, not candidate source. Temporary assembly transport files were removed after provenance was retained; source originals remain available.

Selected source provenance includes 169 reviewed artwork files: 163 changed pilot assets plus six preexisting XT6 transparent assets missing from main. Runtime image decoding/tree tests verify the reference closure, including dynamic trees. Narrow fixtures contain public issue records, public template constants, paint hashes, or artwork evidence only. No audience exports, owner records, runtime secrets, or broad pilot output directories were transferred.

Main DTC code/make routes, Dtc* source/link components, parser, category normalization, diagnostic publication filters, approved retailer links, ShareButtons hydration and motorcycle wrappers remain protected. KnownIssueCard retains showSources, separateHeaderLinks, DtcIssueSources and DtcAnchorLink. ArticleRoute retains motorcycle preview absolute title/noindex, neutral no-critical wording and car-only DIY navigation. Reviewed member header, filters, owner tree/service behavior and Visual dependencies are integrated at the documented shared boundaries. Six reviewed twins are owner-ready; Aviator public 2026 Visual remains unsupported and is not enabled.

## Fresh verification

The final runner report is output/launch-validation/results.json; every group has its own same-directory log. Its mode=full distinguishes the final build run from diagnostic tests-only runs. The final build directory is .next-launch-validation-1789757338226. All 15 stages exited zero after review fixes. Counts below are node-reported tests (638 total), not sums of repeated executions; schema, browser and email scenario counts are separate.

| Check | Evidence |
|---|---|
| Full strict TypeScript | Passed before build and after restoring authored config |
| Next 16.1.6 production webpack build | Passed; 607 static pages generated, optimization/tracing completed |
| Main public DTC + enrollment/navigation | 20 passed, including all 13 preserved public DTC tests |
| Billing | 97 passed |
| Owner/setup/reservation/claim/maintenance/six trees/paint | 381 passed |
| Public six Visual routes/source binding/artwork | 22 passed |
| Account twin destinations | 9 passed |
| Independent review regressions | 47 passed: deletion/billing races, mileage correction, beta boundaries, canonical service entry, invoice totals, transmission selector and Visual library |
| Accepted Hub/layout/invitation artwork/fulfillment/diagnostic tools/commerce/dealer | 60 passed |
| Node network guard | 2 passed; normalized connect arguments, outside targets, pipes, TLS and fetch refusal |
| Motorcycle catalog | 19 synthetic route screens, 94 scoped reads, no real writes/network |
| Motorcycle actual interactive consumers | 12 passed; output/motorcycle-catalog-release/consumer-results.json |
| Maintenance email actual renderer | 20 offline Chromium cases: 320/390/430/1280 widths × normal, stripped CSS, blocked images, client-size stress, stress with stripped CSS |
| PostgreSQL rehearsal | 10 scenario groups passed, detailed below |
| Diff/manifest | git diff --check passed; full changed-path coverage and hashes in manifest; selected source/evidence checks detect drift; 36 protected main files |

The private candidate node_modules directory was copied locally and is not a symlink. Prisma generation only targeted that private client. The production build used a newly named candidate-local .next-launch-validation-* directory, a synthetic local database, disabled Next telemetry, no provider credentials, and the exact dependency's bundled Geist font fixtures. Synthetic BMW route records satisfy the shipped audited-model nonempty assertions; those assertions were not weakened. Build content is not a production dataset, defect review, or publishable site snapshot.

Next performs its own strict route type-check with generated types during the real build. The runner then restores authored tsconfig.json and next-env.d.ts and reruns strict tsc, so timestamped validation paths do not enter release configuration. The explicit tracing root is the candidate checkout, not the shared root or owner preview.

The environment is allowlisted. Node socket connections are bounded to the verified fixture PostgreSQL endpoint; TLS/fetch are denied. Browser QA intercepts fixture traffic independently. This is Node/browser defense in depth, not a claim of OS-wide network isolation. Node test processes use NODE_ENV=test; the application build uses production and tests explicitly exercise production refusal/attestation branches. No activation flags are supplied by the runner.

Warnings are separate from failures: Next middleware-to-proxy deprecation, Sentry/OpenTelemetry dynamic-dependency compilation warnings, and the edge-runtime/static-generation notice remain. Build exits successfully.

Verification repairs preserve meaningful assertions: obsolete equipmentSetup expectations now test current ownerSetup, confirmation and foreign/invalid denial without writes; QA callbacks have explicit types; archived output is excluded without relaxing strictness. Older tests expecting six non-ready twins, duplicate schedule requirements UI, and the old car dealer button were aligned to accepted UI. Independent history, exact equipment, no invented deadlines, motorcycle Maps-only/no automotive requests, and source/fitment guards remain asserted. Original tree-extraction parity uses a narrow accepted pre-extraction literal fixture rather than older main's superseded part copy.

## Local schema rehearsal and recovery

[launch-schema.sql](../scripts/release/launch-schema.sql) is an explicit additive transaction, not authority to run it elsewhere. Order:

1. VisualSignup.
2. Three nullable User enrollment/legacy fields, AccountEnrollment, BillingAttempt, BillingEvent, TwinInvitationDelivery.
3. Signup-recovery returnTo fields.
4. MaintenanceSubmission and MaintenanceReceiptCleanup.
5. BillingEnrollmentReview.
6. HubUpgradeAttempt and HubUpgradeRetiredQuote.
7. Nullable Vehicle.reviewedEquipmentId.
8. Reservation normalization helpers, locked Unicode collision precheck and exact-request uniqueness replacement.
9. Exact post-addition compatibility verification before commit.

The ten support tables and four nullable User/Vehicle fields are checked against shadow expected structures. Columns/types/nullability/defaults, uniqueness/index validity, checks and FK semantics must match. IF NOT EXISTS alone does not establish compatibility. Existing reservation helper functions must also have the expected signature/body/properties. SubscriptionDowngrade is deliberately not created.

Only the task-owned cluster at output/launch-rehearsal/postgres-data on 127.0.0.1:55438 is used. Before SQL writes, the helper verifies host, port, current_user=launch_fixture, exact data_directory and pg_control_system identifier against its local ownership marker. Database names are constrained to fresh launch_<timestamp>_<case> names. The existing owner sandbox/signup data are never targets.

The final schema report is output/launch-rehearsal/schema-results.json. Fresh and repeated compatible migrations preserve every synthetic User, Vehicle (including mileage/paint), Reservation, MaintenanceRecord and MileageLog row. Separate oil/tire services and independent mileage logs are included. All new nullable preservation fields remain null; no subscriber mapping is inferred.

The ten scenario groups prove fresh application, same-session repeat, database constraint refusals, intentional cleanup-survives-owner-delete behavior, Unicode exact-reservation collision rollback, compatible partial schema acceptance, and incompatible column/index/FK/function refusal. The collision test keeps old Reservation_email_key and all rows and rolls back table/function additions. Cleanup intent deliberately has no cascade FK, while owned submissions follow vehicle deletion.

SQL failure is transactionally rolled back. Any future live execution requires an approved backup/recovery plan, reviewed current schema/collision inventory, lock window and verification before commit. Do not automatically drop additive structures or new records to reverse a release. Restoring old email-only uniqueness is safe only after separately approved checks prove it can be recreated without losing legitimate requests; otherwise freeze relevant writes and use reviewed forward repair or approved backup recovery. No live rollback/mapping/backfill was attempted.

## Reproduce locally

Use the private candidate dependency tree and the Node runtime recorded for this workstation. Do not substitute the shared preview's generated Prisma client.

~~~text
node scripts/release/local-postgres.cjs start
node scripts/release/rehearse-launch-schema.cjs
node scripts/release/validate-launch-candidate.cjs
node scripts/release/update-launch-manifest.cjs
git -c core.safecrlf=false diff --check
node scripts/release/local-postgres.cjs stop
~~~

The helper defaults to locally installed PostgreSQL 17.11-3 binaries in pilot output; AU7O_LOCAL_PG_BIN may point to another local binary directory. It refuses an unmarked existing data directory. Rehearsal creates fresh uniquely named synthetic databases and leaves them for inspection, with no broad cleanup. Starting/stopping is scoped to this owned cluster. The updater uses the real apply_patch executable; AU7O_APPLY_PATCH_EXE can identify that local executable on another machine. The runner refuses candidate .env files and symlinked dependency roots. No package download, migration deploy or remote database URL is part of reproduction.

## Independent checkpoints and remaining gates

The parent independently checked the initial 506 selected source hashes with zero missing/changed files and confirmed main public DTC preservation via git diff despite LF/CRLF raw differences. Its separate candidate billing run passed 97 tests; the final implementation runner independently reruns those tests, so that checkpoint is not substituted or double-counted. Parent visual inspection of the 390px stripped-CSS/client-size-stress email confirmed both full-frame vehicle artworks, readable cards, contained layout, vehicle-specific links and truthful missing-history footer. This is offline Chromium evidence, not new native Apple Mail/Yahoo or inbox delivery.

Two independent reviewers examined the complete candidate diff; retained findings were corrected and independently rechecked. See [review triage](launch-candidate-review-triage-20260918.md). The final full runner includes 47 review-specific regressions. A reviewer's test execution was blocked by filesystem sandbox permissions before assertions; the parent reran those offline suites with approved normal filesystem access, then included them in the network-guarded full runner. Static follow-up found no further introduced issues in the bounded fixes. Enrollment, invitation and downgrade gates remain default-closed; no credentials, webhook or runtime identity were activated.

Account deletion deliberately returns 409 while a checkout, upgrade or billing review is unsettled; it does not automatically expire provider operations. The owner must resolve billing or request support before deletion. A queued webhook arriving after safe account erasure can return retryable 503 without recreating the account or changing billing; full live webhook lifecycle verification is still held.

New receipt uploads/extraction require the existing cleanup environment to be ready; private reads/deletes remain available while uploads are held. Configure and verify the actual scheduled cleanup worker in the intended environment before enabling uploads. No scheduler or cleanup activation was performed here.

The live preflight's one active/trial subscription-bound account still requires an explicitly reviewed legacySubscriptionTier preservation mapping before any live release that depends on this entitlement model. The local synthetic test proves independent founder access and explicitly reviewed legacy behavior; it does not validate or backfill that live account. Production schema approval/application, runtime mode/account identity, billing-address enforcement attestation, webhook delivery/ordering and separate activation approval remain held. Native-client email/provider delivery verification is separate from these offline layout checks.

## Next release checklist

- [x] Assemble only the approved member/Hub/email/six-twin work while preserving shipped catalog behavior.
- [x] Resolve independent review findings and pass exact-candidate build/regressions.
- [x] Rehearse additive schema changes and preserve synthetic legacy rows without mapping guesses.
- [ ] Review the one live legacy subscription mapping and production backup/migration plan.
- [ ] Verify live Stripe account/mode, webhook signing/delivery and US billing enforcement; separately approve activation.
- [ ] Configure and smoke-test receipt cleanup scheduling before accepting uploads.
- [ ] Approve the release, then validate the deployed flows before any reservation or newsletter emails.

The owner preview and previously accepted native purchase/email tests were not reset or repeated. This candidate is a separate local branch, not an update to the public site or existing preview.
