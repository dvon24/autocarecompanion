# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-known-issues-ultra-deeplink-sample.md`
  summary: Repair the repository-wide ESLint gate independently of this Known Issues change.
  evidence: `npm run lint` fails on thousands of pre-existing generated and design-file violations beginning in `design/15-FeatureCarousel.jsx`; scoped story lint has no new errors after accounting for legacy `no-explicit-any` findings.

- source_spec: `_bmad-output/implementation-artifacts/spec-known-issues-catalog-deeplinks.md`
  summary: Add exact model, engine, and drivetrain matching to the Known Issues vehicle API before engine- or 4WD-scoped audit records are exposed in the Hub.
  evidence: `src/app/api/known-issues/route.ts` uses a contains-model query, post-filters only an optional trim, and receives no engine or drivetrain constraint; a Cherokee query can include Grand Cherokee rows, while a 2008 4WD 4.7L record can be returned for another engine or a 2WD vehicle.

- source_spec: `_bmad-output/implementation-artifacts/spec-complete-bmw-known-issues-audit-and-production-deploy.md`
  summary: Bind transitive manifest-generator dependencies into the reviewed generator hash for future factory-backed audit cohorts.
  evidence: `_build-full-record-model-manifest-core.cjs` hashes the core and thin per-model config but does not include `_config-bmw-remaining-factory.cjs`; this does not change committed immutable BMW manifests, but a future regeneration could execute changed factory code under the same reviewed core/config hashes.

- source_spec: none
  summary: Integrate repair-first commerce-link discovery and fitment review into the known-issue creation workflow.
  evidence: The user selected Split so the approved Acura link release can be reviewed, tested, and deployed independently before changing the known-issue authoring workflow.

- source_spec: none
  summary: Harden owner twin presentation against malformed provider payloads and restore nullable evidence, chronological date ordering, and the X-ray layer.
  evidence: Devon approved splitting the final owner/demo review blockers so server-side fitment, claim, validation, and concurrency safety can be completed and reviewed independently first.

- source_spec: none
  summary: Restore the mobile homepage hero and hub interactions, including the mobile runtime error, exact glyphs, touch routing, focus-safe rotation, sharp art, and model-specific tech-tree navigation.
  evidence: Devon approved splitting the remaining recovery work into narrow slices; the mobile hero/hub repair is independently shippable after the server/data safety slice.

- source_spec: `_bmad-output/implementation-artifacts/spec-harden-owner-twin-server-contracts.md`
  summary: Make non-transmission vehicle PATCH side effects and the final vehicle update atomic.
  evidence: The server-contract review found primary-vehicle and mileage-log side effects can succeed before a later vehicle update fails; this behavior predates the narrow trim/date/transmission safety slice and requires its own mutation-atomicity review.

- source_spec: `_bmad-output/implementation-artifacts/spec-harden-owner-twin-server-contracts.md`
  summary: Add an isolated disposable-PostgreSQL integration gate for Prisma serializable conflicts, row-version monotonicity, and transaction rollback.
  evidence: The server-contract unit suite executes production handlers with deterministic transaction fakes, but proving PostgreSQL and Prisma rollback/conflict behavior requires a dedicated disposable database harness and is not safe to run against the shared production-configured database during this local release slice.

- source_spec: `_bmad-output/implementation-artifacts/spec-complete-maintenance-records-and-writeback.md`
  summary: Add durable idempotency for assistant maintenance batches before retrying an ambiguously acknowledged write.
  evidence: The current serializable batch is atomic, but guaranteeing replay after a response drops requires a persisted idempotency key/result; the approved implementation explicitly excluded schema migration.

- source_spec: `_bmad-output/implementation-artifacts/spec-complete-maintenance-records-and-writeback.md`
  summary: Introduce a deletion outbox or tombstone workflow for atomic maintenance-record and private-receipt erasure.
  evidence: Blob deletion and Prisma deletion cannot commit atomically; retries and owner-prefix cleanup reduce exposure, but a durable cross-system guarantee needs persisted deletion state excluded from this no-migration slice.

- source_spec: `_bmad-output/implementation-artifacts/spec-complete-maintenance-records-and-writeback.md`
  summary: Standardize latest-service ordering across history metrics, schedule evaluation, and Twin node state.
  evidence: History presentation orders by completion date while existing maintenance status and Twin helpers use different mileage/date precedence, so backdated corrections can disagree across surfaces.

- source_spec: `_bmad-output/implementation-artifacts/spec-restore-maintenance-truth-and-schedule.md`
  summary: Add US-only interactive vehicle Twins above known-issue lists, allow one or two issue interactions, then offer either the $14.99 full Hub or $4.99 visual-known-issues product.
  evidence: This is a separate paid product surface with entitlement, geography, interaction-metering, generation-specific artwork, and issue-to-hotspot mapping requirements. The visual-only tier must exclude maintenance and AI chat. The current KnownIssue schema has vehicle type but no sales-market field, so a separate market decision is required before “US-only” can reduce vehicle artwork scope.

- source_spec: `_bmad-output/implementation-artifacts/spec-restore-maintenance-truth-and-schedule.md`
  summary: Persist an explicit service-provider category instead of permanently inferring Dealer, Independent, Tire shop, or You from provider names.
  evidence: Existing MaintenanceRecord rows store only shopName, so this release uses conservative display-only classification; an automaker-named independent specialist can still be mistaken for a dealer without a schema-backed provider type.
