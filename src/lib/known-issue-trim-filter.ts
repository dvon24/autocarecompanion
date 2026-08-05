/**
 * KnownIssue.trims is a routing field, not a free-form applicability note.
 * A prior catalog audit placed campaign prose in this array, which caused a
 * user's literal trim selection to hide otherwise relevant issues. Fail open
 * whenever any entry looks like applicability prose: the issue remains visible
 * until its catalog metadata is repaired.
 */
export function isApplicabilityProseTrim(value: string): boolean {
  const trim = value.trim();
  return /^(?:only\s+)?vehicles?\b/i.test(trim)
    || /\b(?:vin(?:-specific)?|verify|confirm|applicability|campaign|recall|included in|production date|built (?:from|between|before|after|on)|sales code|equipped with|open action|software level)\b/i.test(trim);
}

export function filterableKnownIssueTrims(trims: readonly string[] | null | undefined): string[] {
  if (!trims || trims.length === 0) return [];
  if (trims.some(isApplicabilityProseTrim)) return [];
  return trims.map((trim) => trim.trim()).filter(Boolean);
}

export function knownIssueMatchesTrim(
  issueTrims: readonly string[] | null | undefined,
  selectedTrim: string | null | undefined,
): boolean {
  if (!selectedTrim) return true;
  const trims = filterableKnownIssueTrims(issueTrims);
  if (trims.length === 0) return true;
  const selected = selectedTrim.trim().toLowerCase();
  return trims.some((trim) => {
    const candidate = trim.toLowerCase();
    return selected.includes(candidate) || candidate.includes(selected);
  });
}
