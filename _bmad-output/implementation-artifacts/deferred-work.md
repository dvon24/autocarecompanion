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
