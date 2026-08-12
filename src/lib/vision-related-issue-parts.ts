/**
 * A known-issue repair kit is scoped to the garage vehicle. If the image model
 * says the photographed vehicle is different, no link may cross that identity
 * boundary. This is shared by the API and client as defense in depth.
 */
export function relatedIssuePartsForVehicle<T>(
  parts: readonly T[] | null | undefined,
  vehicleMismatch: boolean,
): T[] {
  if (vehicleMismatch || !Array.isArray(parts)) return [];
  return [...parts];
}
