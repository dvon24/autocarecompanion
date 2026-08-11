export interface PartCoverageEvidence {
  partYears: number[];
  candidateModelsByYear: Record<string, string[]>;
  candidateApplicationsByYear: Record<string, string[]>;
  requiredModelsByYear: Record<string, string[]>;
  requiredApplicationsByYear: Record<string, string[]>;
}

function sameSet(left: string[], right: string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * A generic article can resolve to several catalog aliases and engines. A part
 * may claim a sampled year only when its PN appears for every resolved model
 * and model/engine application in that year. Missing evidence is a rejection,
 * never an invitation to widen fitment.
 */
export function fullyCoveredYears(evidence: PartCoverageEvidence): number[] {
  return [...new Set(evidence.partYears)].sort((a, b) => a - b).filter((year) => {
    const key = String(year);
    const requiredModels = evidence.requiredModelsByYear[key] || [];
    const requiredApplications = evidence.requiredApplicationsByYear[key] || [];
    if (requiredModels.length === 0 || requiredApplications.length === 0) return false;
    return sameSet(evidence.candidateModelsByYear[key] || [], requiredModels)
      && sameSet(evidence.candidateApplicationsByYear[key] || [], requiredApplications);
  });
}
