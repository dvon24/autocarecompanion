/**
 * Canonical helper for converting a make name to its logo filename slug.
 *
 * Centralized here so all call sites agree. Previously this lived as three
 * separate copies in three pages (page.tsx + category page + dashboard),
 * which drifted when new makes with special characters were added.
 *
 * Rules:
 *   - lowercase
 *   - spaces → hyphens (e.g. "Land Rover" → "land-rover", "Mercedes-Benz" stays)
 *   - umlaut/diacritic stripping for filename safety (Citroën → citroen)
 */
export function makeLogoSlug(make: string): string {
  return make
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining marks (ë, ñ, é, etc.)
    .replace(/\s+/g, '-');
}

/**
 * Generate up-to-2-character initials for the initials-fallback case
 * when a logo file is missing.
 *
 *   "Skoda"         → "S"
 *   "Land Rover"    → "LR"
 *   "Mercedes-Benz" → "MB"
 *   "MG"            → "MG"
 */
export function makeInitials(make: string): string {
  const parts = make.split(/[\s-]+/).filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    // For all-caps short names (MG, BMW, GMC), use the first 2 letters as-is.
    if (word === word.toUpperCase() && word.length <= 3) return word.slice(0, 2);
    return word[0]?.toUpperCase() ?? '';
  }
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}
