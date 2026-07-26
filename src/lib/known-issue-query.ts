export function buildKnownIssueVehicleFilter(
  year: number,
  make: string,
  model: string,
  status: string,
) {
  return {
    make: { equals: make, mode: 'insensitive' as const },
    model: { equals: model, mode: 'insensitive' as const },
    years: { has: year },
    status,
  };
}
