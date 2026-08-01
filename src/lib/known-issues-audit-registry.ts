export interface AuditedKnownIssueModel {
  slug: string;
  make: string;
  model: string;
  expectedPublishedCount: number;
  auditedOn: string;
}

type AuditedModelRow = readonly [
  slug: string,
  model: string,
  expectedPublishedCount: number,
  auditedOn: string,
];

// This registry is a compact, runtime-safe projection of the immutable BMW
// full-record manifests. It is deliberately explicit: an audited-empty route
// is allowed only when the reviewed after-state expected zero published rows.
// That prevents a transient database failure or an accidental archival from
// turning a model that should have cards into a plausible-looking empty page.
const BMW_AUDITED_MODEL_ROWS: readonly AuditedModelRow[] = [
  ['bmw-1-series', '1 Series', 4, '2026-07-30'],
  ['bmw-2-series', '2 Series', 2, '2026-07-30'],
  ['bmw-2-series-active-tourer', '2 Series Active Tourer', 2, '2026-07-30'],
  ['bmw-3-series', '3 Series', 9, '2026-07-30'],
  ['bmw-4-series', '4 Series', 1, '2026-07-30'],
  ['bmw-5-series', '5 Series', 5, '2026-07-31'],
  ['bmw-6-series', '6 Series', 2, '2026-07-31'],
  ['bmw-7-series', '7 Series', 2, '2026-07-31'],
  ['bmw-8-series', '8 Series', 2, '2026-07-31'],
  ['bmw-i3', 'i3', 5, '2026-07-31'],
  ['bmw-i4', 'i4', 3, '2026-07-31'],
  ['bmw-i5', 'i5', 7, '2026-07-31'],
  ['bmw-i7', 'i7', 2, '2026-07-31'],
  ['bmw-i8', 'i8', 5, '2026-07-31'],
  ['bmw-ix', 'iX', 4, '2026-07-31'],
  ['bmw-ix3', 'iX3', 2, '2026-07-31'],
  ['bmw-m2', 'M2', 1, '2026-07-31'],
  ['bmw-m240i', 'M240i', 1, '2026-07-31'],
  ['bmw-m3', 'M3', 3, '2026-07-31'],
  ['bmw-m3-cs', 'M3 CS', 0, '2026-07-31'],
  ['bmw-m340i', 'M340i', 2, '2026-07-31'],
  ['bmw-m4', 'M4', 0, '2026-07-31'],
  ['bmw-m4-cs', 'M4 CS', 0, '2026-07-31'],
  ['bmw-m5', 'M5', 0, '2026-07-31'],
  ['bmw-m6', 'M6', 0, '2026-07-31'],
  ['bmw-m8', 'M8', 0, '2026-07-31'],
  ['bmw-x1', 'X1', 1, '2026-07-31'],
  ['bmw-x2', 'X2', 2, '2026-07-31'],
  ['bmw-x3', 'X3', 1, '2026-07-31'],
  ['bmw-x3-m', 'X3 M', 3, '2026-07-31'],
  ['bmw-x4', 'X4', 1, '2026-07-31'],
  ['bmw-x4-m', 'X4 M', 0, '2026-07-31'],
  ['bmw-x5', 'X5', 13, '2026-07-20'],
  ['bmw-x5-m', 'X5 M', 0, '2026-07-31'],
  ['bmw-x6', 'X6', 1, '2026-07-31'],
  ['bmw-x6-m', 'X6 M', 0, '2026-07-31'],
  ['bmw-x7', 'X7', 1, '2026-07-31'],
  ['bmw-xm', 'XM', 2, '2026-07-31'],
  ['bmw-z3', 'Z3', 0, '2026-07-31'],
  ['bmw-z4', 'Z4', 3, '2026-07-31'],
  ['bmw-z8', 'Z8', 0, '2026-07-31'],
];

export const BMW_AUDITED_MODELS: readonly AuditedKnownIssueModel[] =
  BMW_AUDITED_MODEL_ROWS.map(([slug, model, expectedPublishedCount, auditedOn]) => ({
    slug,
    make: 'BMW',
    model,
    expectedPublishedCount,
    auditedOn,
  }));

const BMW_AUDITED_MODEL_BY_SLUG = new Map(
  BMW_AUDITED_MODELS.map((entry) => [entry.slug, entry]),
);

export function getBMWAuditedModel(slug: string): AuditedKnownIssueModel | null {
  return BMW_AUDITED_MODEL_BY_SLUG.get(slug) ?? null;
}

export function getBMWAuditedEmptyModel(slug: string): AuditedKnownIssueModel | null {
  const entry = getBMWAuditedModel(slug);
  return entry?.expectedPublishedCount === 0 ? entry : null;
}

export function getBMWAuditedEmptyModels(): readonly AuditedKnownIssueModel[] {
  return BMW_AUDITED_MODELS.filter((entry) => entry.expectedPublishedCount === 0);
}
