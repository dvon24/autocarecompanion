import { getKnownIssueCommerce } from '@/lib/known-issue-commerce';
import { slugNorm } from '@/lib/vehicle-slug';

export interface TwinIssueSummary {
  id: string;
  title: string;
  severity: string;
  href: string;
  description: string;
  solution: string;
  fixParts: ReturnType<typeof getKnownIssueCommerce>['fixParts'];
}

export interface TwinIssueRow {
  id: string;
  title: string;
  severity: string;
  make: string;
  model: string;
  description: string;
  solution: string;
  fixParts: unknown;
  communityRecommendations: unknown;
}

export function buildTwinIssueSummary(issue: TwinIssueRow): TwinIssueSummary {
  const commerce = getKnownIssueCommerce({
    fixParts: Array.isArray(issue.fixParts) ? issue.fixParts : [],
    communityRecommendations: Array.isArray(issue.communityRecommendations) ? issue.communityRecommendations : [],
  } as Parameters<typeof getKnownIssueCommerce>[0]);
  return {
    id: issue.id,
    title: issue.title,
    severity: issue.severity,
    href: `/known-issues/${slugNorm(issue.make)}-${slugNorm(issue.model)}#${issue.id}`,
    description: issue.description,
    solution: issue.solution,
    fixParts: commerce.fixParts,
  };
}
