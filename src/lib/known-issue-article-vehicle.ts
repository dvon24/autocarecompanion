export interface ArticleVehicleSelection {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
}

export interface ArticleVehicleInfo {
  year: number;
  make: string;
  model: string;
  trim?: string;
}

export function vehicleInfoForKnownIssueArticle(
  selected: ArticleVehicleSelection | null | undefined,
  make: string,
  model: string,
  routeYear: number | null,
): ArticleVehicleInfo | undefined {
  const selectedMatches = Boolean(
    selected
    && selected.make.toLowerCase() === make.toLowerCase()
    && selected.model.toLowerCase() === model.toLowerCase()
    && (routeYear === null || selected.year === routeYear),
  );
  if (selectedMatches && selected) {
    return {
      year: routeYear ?? selected.year,
      make,
      model,
      ...(selected.trim ? { trim: selected.trim } : {}),
    };
  }
  return routeYear === null ? undefined : { year: routeYear, make, model };
}
