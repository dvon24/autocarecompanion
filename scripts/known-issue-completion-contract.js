/** Exact implementation surface bound by every known-issue make completion. */
const DIAGNOSTIC_IMPLEMENTATION_FILES = Object.freeze([
  'scripts/build-known-issue-diagnostic-evidence.js',
  'scripts/rebuild-known-issue-classification-ledger.js',
  'src/lib/diagnostic-procedures.js',
  'src/data/diagnostic-tools.ts',
  'src/components/known-issues/IssueDiagnosticTools.tsx',
  'src/components/known-issues/KnownIssueCard.tsx',
  'src/components/known-issues/CategorySection.tsx',
  'src/components/known-issues/ArticleIssuesList.tsx',
  'src/app/garage/[id]/maintenance/page.tsx',
  'src/components/vehicle/VehicleDashboard.tsx',
]);

const COMMERCE_PIPELINE_IMPLEMENTATION_FILES = Object.freeze([
  'scripts/known-issue-completion-contract.js',
  'scripts/finalize-known-issue-make-packet.js',
  'scripts/apply-known-issue-catalog-deeplinks.js',
  'scripts/audit-known-issue-catalog-deeplinks.js',
  'scripts/build-known-issue-part-audit-ledger.js',
  'public/data/ymmt.json',
  'src/lib/prescription.ts',
  'src/lib/known-issue-fitment-worklist.ts',
  'src/data/component-catalog-map.ts',
  'scripts/build-fitment-worklist.ts',
  'scripts/showmetheparts-known-issue-candidates.js',
  'scripts/verify-parts-fitment.js',
  'scripts/build-part-proposals.ts',
  'src/lib/part-recommendation.ts',
  'src/data/replacement-part-suppliers.ts',
  'src/lib/aftermarket-tier.ts',
  'src/lib/vendor-catalog.ts',
  'src/data/aftermarket-brands.ts',
  'src/lib/part-proposal-coverage.ts',
  'src/lib/part-type-evidence.ts',
  'src/lib/catalog-candidate-safety.ts',
  'scripts/build-known-issue-part-links.ts',
  'scripts/merge-reviewed-retailer-links.ts',
  'scripts/build-quoted-part-retailer-queue.ts',
  'scripts/review-quoted-part-direct-links.ts',
  'scripts/build-quoted-part-commerce-gap-summary.ts',
  'scripts/build-reviewed-quoted-part-proposals.ts',
  'scripts/build-quoted-part-repair-role-review.ts',
  'scripts/build-existing-public-claim-review.ts',
  'scripts/build-standard-quoted-part-stage.ts',
  'scripts/build-standard-independent-review.ts',
  'src/lib/part-link-builder.ts',
  'src/lib/resolve-part-link.ts',
  'src/data/supplies-catalog.ts',
  'src/lib/part-vocabulary.ts',
  'src/lib/verified-parts.ts',
  'src/lib/ebay-part-link-resolver.ts',
  'src/lib/ebay-resolver.ts',
  'src/lib/known-issue-part-fitment.ts',
  'src/schemas/knownIssue.schema.ts',
  'src/lib/reviewed-vehicle-context.ts',
  'src/lib/known-issue-commerce.ts',
  'src/lib/external-http-url.ts',
  'src/lib/ebay-affiliate.ts',
  'src/lib/vendor-resolver.ts',
  'src/lib/vendor-link-validator.ts',
  'src/lib/vision-related-issue-parts.ts',
  'src/lib/vision-vehicle-context.ts',
  'src/components/known-issues/KnownIssueCard.tsx',
  'src/components/known-issues/CategorySection.tsx',
  'src/components/known-issues/ArticleIssuesList.tsx',
  'src/contexts/AppContext.tsx',
  'src/lib/known-issue-trim-filter.ts',
  'src/components/known-issues/KnownIssuesBriefing.tsx',
  'src/components/vehicle/VehicleDashboard.tsx',
  'src/components/vehicle/VisionResultCard.tsx',
  'src/components/diagnose/TapToIdentifyPhoto.tsx',
  'src/components/diagnose/LiveCameraShutter.tsx',
  'src/app/api/vision/route.ts',
  'src/app/api/vision/identify/route.ts',
  'scripts/build-known-issue-deeplink-manifest.js',
]);

const HASH_RE = /^[a-f0-9]{64}$/;

function assertExactImplementationHashMap(hashMap, requiredFiles, label) {
  if (!hashMap || typeof hashMap !== 'object' || Array.isArray(hashMap)) {
    throw new Error(`${label} must be an object with the exact required implementation keys.`);
  }
  const actual = Object.keys(hashMap).sort();
  const expected = [...requiredFiles].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const missing = expected.filter((file) => !Object.prototype.hasOwnProperty.call(hashMap, file));
    const extra = actual.filter((file) => !requiredFiles.includes(file));
    throw new Error(
      `${label} must contain the exact required implementation keys`
      + `${missing.length ? `; missing: ${missing.join(', ')}` : ''}`
      + `${extra.length ? `; extra: ${extra.join(', ')}` : ''}.`,
    );
  }
  for (const file of requiredFiles) {
    if (!HASH_RE.test(hashMap[file] || '')) {
      throw new Error(`${label}.${file} has no SHA-256 binding.`);
    }
  }
}

module.exports = {
  COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
  assertExactImplementationHashMap,
};
