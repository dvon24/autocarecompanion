import { mapComponent } from '@/data/component-catalog-map';
import { extractPrescriptionComponents } from '@/lib/prescription';

export type IssueDisposition =
  | 'buyable'
  | 'diagnosis-dependent'
  | 'recall/dealer'
  | 'service/tool/fluid'
  | 'no-commerce';

export interface FrozenIssueRecord {
  id: string;
  make: string;
  model: string;
  years: number[];
  trims?: string[];
  engines?: string[];
  drivetrain?: string[] | string;
  transmission?: string[] | string;
  title: string;
  solution: string;
  fixParts?: Array<{
    component?: string;
    oemPartNumber?: string | null;
    aftermarketXref?: string[];
    fitment?: Record<string, unknown>;
    variants?: Array<{ oemPartNumber?: string | null }>;
    buyLinks?: unknown[];
  }>;
  before?: Record<string, unknown>;
}

export interface FitmentWorkItem {
  id: string;
  workItemId: string;
  prescriptionKey: string;
  issueId: string;
  source: 'prescription' | 'existing-fix-part';
  component: string;
  repairRoleEvidence: string;
  diagnosisDependent: boolean;
  condition?: string;
  existingPartIndex?: number;
  partNumber: string;
  make: string;
  model: string;
  years: number[];
  trims: string[];
  engines: string[];
  drivetrains: string[];
  transmissions: string[];
  engineMatch?: string;
  declaredEngine?: string;
  productMatch: string[];
  partTypeMatch: string;
  mappingStatus: 'mapped' | 'unmapped';
  articleScope: {
    make: string;
    model: string;
    years: number[];
    trims: string[];
    engines: string[];
    drivetrains: string[];
    transmissions: string[];
  };
  existingFixParts: FrozenIssueRecord['fixParts'];
}

export interface IssueLedgerEntry {
  issueId: string;
  disposition: IssueDisposition;
  reason: string;
  prescriptionCount: number;
  existingFixPartCount: number;
  workItemIds: string[];
  before: Record<string, unknown>;
}

const DEALER = /\b(recall|campaign|reflash|re-?program|software update|warranty extension|free of charge|no charge|dealer will|service action)\b/i;
const SERVICE = /\b(flush|lubricat|clean|adjust|relearn|reset|bleed|fluid|oil|grease|sealant|adhesive|scan tool|diagnostic tool|special tool)\b/i;

function list(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return [...value];
  return value ? [value] : [];
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function catalogEngineQuery(value: string | undefined): string | undefined {
  const displacement = String(value || '').match(/\b\d(?:\.\d)?\s*L\b/i)?.[0];
  return displacement ? displacement.replace(/\s+/g, '') : undefined;
}

function normalizedPartNumbers(part: NonNullable<FrozenIssueRecord['fixParts']>[number]): string[] {
  return [...new Set([
    part.oemPartNumber,
    ...(part.aftermarketXref || []),
    ...(part.variants || []).map((variant) => variant.oemPartNumber),
  ].map((value) => String(value || '').trim()).filter(Boolean))];
}

function classify(record: FrozenIssueRecord): { disposition: IssueDisposition; reason: string } {
  const prescriptions = extractPrescriptionComponents(record.solution);
  const existing = record.fixParts || [];
  if (DEALER.test(record.solution) && !/aftermarket|purchase|order the part|buy/i.test(record.solution)) {
    return { disposition: 'recall/dealer', reason: 'The prescribed remedy is dealer, campaign, recall, or software work.' };
  }
  if (prescriptions.some((item) => item.diagnosisDependent)) {
    return { disposition: 'diagnosis-dependent', reason: 'At least one replacement is conditional on a stated diagnostic result.' };
  }
  if (prescriptions.length || existing.length) {
    return { disposition: 'buyable', reason: 'The solution prescribes an owner-buyable component or existing commerce requires re-review.' };
  }
  if (SERVICE.test(record.solution)) {
    return { disposition: 'service/tool/fluid', reason: 'The remedy is a service, tool, consumable, or fluid procedure rather than a repair part.' };
  }
  return { disposition: 'no-commerce', reason: 'No positive owner-buyable repair prescription was found.' };
}

export function buildFitmentPacket(records: FrozenIssueRecord[], make: string) {
  const selected = records
    .filter((record) => record.make.localeCompare(make, undefined, { sensitivity: 'accent' }) === 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  const entries: FitmentWorkItem[] = [];
  const ledger: IssueLedgerEntry[] = [];

  for (const record of selected) {
    const whole = `${record.title} ${record.solution}`;
    const prescriptions = extractPrescriptionComponents(record.solution);
    const classification = classify(record);
    const candidates = [
      ...prescriptions.map((item, index) => ({
        source: 'prescription' as const,
        component: item.component,
        evidence: item.evidence,
        diagnosisDependent: item.diagnosisDependent,
        condition: item.condition,
        partNumber: '',
        ordinal: index,
        numberIndex: 0,
      })),
      ...(record.fixParts || []).flatMap((part, index) => {
        const partNumbers = normalizedPartNumbers(part);
        return (partNumbers.length ? partNumbers : ['']).map((partNumber, numberIndex) => ({
        source: 'existing-fix-part' as const,
        component: String(part.component || '').trim() || `existing fix part ${index + 1}`,
        evidence: `Existing fixParts:${index} must be reverified and keyed-merged.`,
        diagnosisDependent: false,
        condition: undefined,
        partNumber,
        ordinal: index,
        numberIndex,
      }));
      }),
    ];
    const workItemIds: string[] = [];

    const commerceCandidates = classification.disposition === 'buyable'
      || classification.disposition === 'diagnosis-dependent'
      ? candidates
      : [];
    for (const candidate of commerceCandidates) {
      const mapping = mapComponent(candidate.component, whole);
      const engineSlices = record.engines?.length ? record.engines : [undefined];
      for (const engine of engineSlices) {
        const prescriptionKey = [candidate.source, candidate.ordinal, candidate.numberIndex].map(String).map(slug).join('--');
        const workItemId = [record.id, prescriptionKey, engine || 'all-engines'].map(String).map(slug).join('--');
        workItemIds.push(workItemId);
        entries.push({
          id: record.id,
          workItemId,
          prescriptionKey,
          issueId: record.id,
          source: candidate.source,
          component: candidate.component,
          repairRoleEvidence: candidate.evidence,
          diagnosisDependent: candidate.diagnosisDependent,
          ...(candidate.condition ? { condition: candidate.condition } : {}),
          ...(candidate.source === 'existing-fix-part' ? { existingPartIndex: candidate.ordinal } : {}),
          partNumber: candidate.partNumber,
          make: record.make,
          model: record.model,
          years: [...new Set(record.years)].sort((a, b) => a - b),
          trims: list(record.trims),
          engines: list(record.engines),
          drivetrains: list(record.drivetrain),
          transmissions: list(record.transmission),
          ...(engine ? { declaredEngine: engine } : {}),
          ...(catalogEngineQuery(engine) ? { engineMatch: catalogEngineQuery(engine) } : {}),
          productMatch: mapping ? (Array.isArray(mapping.productMatch) ? mapping.productMatch : [mapping.productMatch]) : [],
          partTypeMatch: mapping?.partTypeMatch || candidate.component,
          mappingStatus: mapping ? 'mapped' : 'unmapped',
          articleScope: {
            make: record.make,
            model: record.model,
            years: [...new Set(record.years)].sort((a, b) => a - b),
            trims: list(record.trims),
            engines: list(record.engines),
            drivetrains: list(record.drivetrain),
            transmissions: list(record.transmission),
          },
          existingFixParts: record.fixParts || [],
        });
      }
    }

    ledger.push({
      issueId: record.id,
      ...classification,
      prescriptionCount: prescriptions.length,
      existingFixPartCount: record.fixParts?.length || 0,
      workItemIds: [...new Set(workItemIds)],
      before: record.before || {},
    });
  }

  return { entries, ledger };
}
