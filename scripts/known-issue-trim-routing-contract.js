function normalizeKnownIssueTrim(value) {
  return String(value || '').trim().toLowerCase();
}

function isApplicabilityProseTrim(value) {
  const normalized = normalizeKnownIssueTrim(value);
  return /^(?:only\s+)?vehicles?\b/.test(normalized)
    || /\b(?:vin(?:-specific)?|verify|confirm|applicability|campaign|recall|included in|production date|built (?:from|between|before|after|on)|sales code|equipped with|open action|software level)\b/.test(normalized);
}

function filterableKnownIssueTrims(trims) {
  const normalized = (trims || []).map((trim) => String(trim || '').trim()).filter(Boolean);
  return normalized.some(isApplicabilityProseTrim) ? [] : normalized;
}

function knownIssueMatchesTrim(issueTrims, selectedTrim) {
  if (!selectedTrim) return true;
  const filterable = filterableKnownIssueTrims(issueTrims);
  if (!filterable.length) return true;
  const selected = normalizeKnownIssueTrim(selectedTrim);
  return filterable.some((candidate) => {
    const normalizedCandidate = normalizeKnownIssueTrim(candidate);
    return selected.includes(normalizedCandidate) || normalizedCandidate.includes(selected);
  });
}

module.exports = { filterableKnownIssueTrims, isApplicabilityProseTrim, knownIssueMatchesTrim, normalizeKnownIssueTrim };
