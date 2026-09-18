import reviewed from '@/data/xt6-visual-explanations.json';
import { REVIEWED_SIBLING_COPY } from './known-issue-sibling-copy';

export interface ReviewedKnownIssueSource {
  id?: string;
  description: string;
  solution: string;
  vehicleMatch?: { years:number[]; trims?:string[]; engines?:string[] };
  citations?: unknown;
}

/** Scoped approvals require the whole reviewed fingerprint at every boundary.
 * Legacy XT6 wording-only entries retain their existing contract. */
export function reviewedKnownIssueTwinCopy(issue: ReviewedKnownIssueSource) {
  const row = [...reviewed, ...REVIEWED_SIBLING_COPY].find(row => row.id === issue.id
    && row.sourceDescription === issue.description && row.sourceSolution === issue.solution);
  if (!row) return null;
  if (!row.sourceYears) return row;
  if (!issue.vehicleMatch || !Array.isArray(issue.citations)
    || !issue.citations.every(citation => citation && typeof citation === 'object' && !Array.isArray(citation))) return null;
  const citationsMatch = 'sourceCitationRecords' in row
    ? JSON.stringify(row.sourceCitationRecords) === JSON.stringify(issue.citations)
    : JSON.stringify(row.sourceCitations) === JSON.stringify(issue.citations.map(citation => citation.url));
  return JSON.stringify(row.sourceYears) === JSON.stringify(issue.vehicleMatch.years)
    && JSON.stringify(row.sourceTrims) === JSON.stringify(issue.vehicleMatch.trims || [])
    && JSON.stringify(row.sourceEngines) === JSON.stringify(issue.vehicleMatch.engines || [])
    && citationsMatch ? row : null;
}
