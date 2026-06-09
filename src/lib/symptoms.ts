import symptomsData from '@/data/symptoms.json';
import { getDTCDirectory } from './dtc-codes';

export type SymptomSeverity = 'safe-to-drive' | 'caution' | 'stop-driving';

export interface SymptomCause {
  cause: string;
  detail: string;
}

export interface Symptom {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  severity: SymptomSeverity;
  likelyDtcCodes: string[];
  commonCauses: SymptomCause[];
  whatToDo: string;
  searchTerms: string[];
}

const SYMPTOMS = symptomsData as unknown as Symptom[];

// Sort order for grouping the index by urgency.
const SEVERITY_ORDER: Record<SymptomSeverity, number> = {
  'stop-driving': 0,
  caution: 1,
  'safe-to-drive': 2,
};

export const SEVERITY_META: Record<
  SymptomSeverity,
  { label: string; color: string; bg: string; border: string }
> = {
  'stop-driving': { label: 'Stop driving', color: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
  caution: { label: 'Caution', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  'safe-to-drive': { label: 'Usually safe to drive', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
};

export function getAllSymptoms(): Symptom[] {
  return [...SYMPTOMS].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.title.localeCompare(b.title),
  );
}

export function getSymptom(slug: string): Symptom | null {
  return SYMPTOMS.find((s) => s.slug === slug) || null;
}

export function getAllSymptomSlugs(): string[] {
  return SYMPTOMS.map((s) => s.slug);
}

/**
 * Of a symptom's likely DTC codes, return the subset that have a real page
 * (present in DTCCode AND cited by >=1 published issue). Used so we only
 * link to codes that render — never to a 404.
 */
export async function getLinkableDtcCodes(codes: string[]): Promise<Set<string>> {
  if (!codes || codes.length === 0) return new Set();
  const dir = await getDTCDirectory();
  const live = new Set(dir.map((d) => d.code.toUpperCase()));
  return new Set(codes.map((c) => c.toUpperCase()).filter((c) => live.has(c)));
}
