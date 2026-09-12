---
title: 'Render the reviewed Nissan NATS conditional battery offer'
type: 'bugfix'
created: '2026-09-12'
status: 'done'
route: 'one-shot'
baseline_commit: '5e5a63ebefbf7692b832972fe334aa12ebc77d83'
---

# Render the reviewed Nissan NATS conditional battery offer

## Intent

**Problem:** The exact reviewed Interstate MTP-35 URL is hidden by the structural commerce guard because its short SKU does not match the generic product pattern.

**Approach:** Add only the reviewed URL and matching vendor fingerprints to the existing Nissan registry. Keep URL safety, search rejection, metadata verification, recall gating and vehicle fitment unchanged. The related content release covers one 350Z procedure and two Nissan code/make triage entries. No Hub or billing changes are included.

## Suggested Review Order

- Exact reviewed approval; no retailer-wide URL allowance.
  [nissan.ts:4](../../src/lib/known-issue-reviewed-retailer-links/nissan.ts#L4)
- Prove nearby URLs and unrelated vendors remain rejected.
  [known-issue-commerce.test.ts:13](../../scripts/known-issue-commerce.test.ts#L13)
- Review the corrected diagnostic content and conditional, aftermarket battery scope.
  [nissan-manifest.json:1](../../outputs/public-dtc-release/nissan-manifest.json#L1)
- Check selected-year/engine exclusions and actual public-page projection.
  [test-nissan-release.cjs:1](../../outputs/public-dtc-release/test-nissan-release.cjs#L1)
- Review bounded transaction, freshness checks and rollback snapshot requirements.
  [nissan-release.cjs:1](../../outputs/public-dtc-release/nissan-release.cjs#L1)
