export interface CatalogRestrictionFields {
  application?: string;
  comment?: string;
  location?: string;
}

const REQUIRED_FIELDS = ['application', 'comment', 'location'] as const;

/** Reject verifier artifacts created before all restriction channels existed. */
export function assertFreshCatalogRestrictionFields(
  candidate: CatalogRestrictionFields,
  context = 'candidate',
): asserts candidate is Required<CatalogRestrictionFields> {
  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(candidate, field)) {
      throw new Error(`stale verifier artifact for ${context}: candidate is missing ${field}; rerun verify-parts-fitment.js`);
    }
  }
}

/**
 * The public fitment contract cannot enforce arbitrary catalog prose such as
 * VIN, side, package, sensor-hole or WITH/WITHOUT equipment restrictions.
 */
export function hasUnrepresentableCatalogScope(candidate: Required<CatalogRestrictionFields>): boolean {
  return REQUIRED_FIELDS.some((field) => candidate[field].trim().length > 0);
}
