export interface VehicleName {
  make: string;
  model: string;
}

interface VehicleYearRange {
  from: number;
  to: number;
}

export interface KnownIssueVehicleAlias {
  /** Canonical name used by the homepage YMMT selector and Hub URL parser. */
  selector: VehicleName;
  /** Name used by the published KnownIssue article rows. */
  knownIssue: VehicleName;
  years: VehicleYearRange[];
}

/**
 * Explicit naming bridges only. These do not claim that two distinct models
 * share fitment; each entry represents the same vehicle under a catalog name
 * and a published-article name for a bounded model-year range.
 */
export const KNOWN_ISSUE_VEHICLE_ALIASES: readonly KnownIssueVehicleAlias[] = [
  {
    selector: { make: 'Ford', model: 'F-250 Super Duty' },
    knownIssue: { make: 'Ford', model: 'F-250' },
    years: [{ from: 1999, to: 2025 }],
  },
  {
    selector: { make: 'Mazda', model: 'MX-5 Miata' },
    knownIssue: { make: 'Mazda', model: 'Miata' },
    years: [
      { from: 1990, to: 1997 },
      { from: 1999, to: 2005 },
    ],
  },
  {
    selector: { make: 'Volkswagen', model: 'New Beetle' },
    knownIssue: { make: 'Volkswagen', model: 'Beetle' },
    years: [{ from: 2006, to: 2011 }],
  },
] as const;

const normalized = (value: string) => value.trim().toLowerCase();

const sameVehicle = (left: VehicleName, right: VehicleName) =>
  normalized(left.make) === normalized(right.make) &&
  normalized(left.model) === normalized(right.model);

export const aliasAppliesToYear = (
  alias: KnownIssueVehicleAlias,
  year: number,
) => alias.years.some((range) => year >= range.from && year <= range.to);

/** Return the exact selector vehicle plus any bounded KnownIssue name alias. */
export function getKnownIssueVehicleCandidates(
  vehicle: VehicleName & { year: number },
): VehicleName[] {
  const candidates: VehicleName[] = [
    { make: vehicle.make, model: vehicle.model },
  ];

  for (const alias of KNOWN_ISSUE_VEHICLE_ALIASES) {
    if (
      sameVehicle(alias.selector, vehicle) &&
      aliasAppliesToYear(alias, vehicle.year)
    ) {
      candidates.push(alias.knownIssue);
    }
  }

  return candidates;
}

/** Convert a published-article name into the YMMT name used by Hub routes. */
export function getSelectorVehicleForKnownIssue(
  vehicle: VehicleName & { year: number },
): VehicleName {
  const alias = KNOWN_ISSUE_VEHICLE_ALIASES.find(
    (candidate) =>
      sameVehicle(candidate.knownIssue, vehicle) &&
      aliasAppliesToYear(candidate, vehicle.year),
  );

  return alias?.selector ?? { make: vehicle.make, model: vehicle.model };
}
