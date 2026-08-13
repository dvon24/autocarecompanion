import type { FitmentVehicle } from './known-issue-part-fitment';

/**
 * Runtime-only vehicle details that an exact caller may already know. These
 * fields are deliberately not added to the persisted Vehicle schema: a YMMT
 * selection does not, by itself, prove drivetrain or transmission.
 */
export interface SelectedVehicleContext extends FitmentVehicle {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
}

export interface ReviewedVehicleContext extends SelectedVehicleContext {
  engineSource: 'selected' | 'reviewed-exact-ymmt' | null;
  engineProvenance?: {
    artifact: string;
    artifactSha256: string;
    snapshotHash: string;
    ymmtArtifact: string;
    ymmtArtifactSha256: string;
  };
}

interface ReviewedExactEngineMapping {
  year: number;
  make: string;
  model: string;
  trims: readonly string[];
  engine: string;
  provenance: NonNullable<ReviewedVehicleContext['engineProvenance']>;
}

const ACURA_AUDIT_ROOT = 'data/known-issue-part-audit/acura/'
  + 'c22aa18f11e2de2c789eebcb035ba8dbc530aadb783a5c86fe4a749eeabe908d';

/**
 * This is intentionally a tiny allow-list, not a general specs lookup.
 *
 * The reviewed Acura packet records 1990 Legend as the only C27A catalog cell,
 * while the committed YMMT list has only L and LS for that year. The same
 * packet does NOT establish an Integra trim-to-engine mapping, so no Integra
 * entry belongs here.
 */
const REVIEWED_EXACT_ENGINE_MAPPINGS: readonly ReviewedExactEngineMapping[] = [
  {
    year: 1990,
    make: 'Acura',
    model: 'Legend',
    trims: ['L', 'LS'],
    engine: '2.7L V6 C27A',
    provenance: {
      artifact: `${ACURA_AUDIT_ROOT}/03-showmetheparts-evidence.json`,
      artifactSha256: '9ea152ce6e71e75185fd08dbb9cc89b85fc1516d35c819257d3f4d5bb68258a3',
      snapshotHash: 'c22aa18f11e2de2c789eebcb035ba8dbc530aadb783a5c86fe4a749eeabe908d',
      ymmtArtifact: 'public/data/ymmt.json',
      ymmtArtifactSha256: 'a05b331834b6f4c71af58663a5a1f104e215bab2402c612026a1344386130139',
    },
  },
] as const;

function exactValue(value: string | null | undefined): string {
  return (value || '').trim().toLocaleLowerCase('en-US');
}

function selectedText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

/**
 * Preserve authoritative caller fields. When engine is absent, derive it only
 * from an explicitly reviewed exact YMMT row; never from issue scope or the
 * first year/model specs record.
 */
export function resolveReviewedVehicleContext(
  selected: SelectedVehicleContext,
): ReviewedVehicleContext {
  const engine = selectedText(selected.engine);
  const base: ReviewedVehicleContext = {
    ...selected,
    engine,
    drivetrain: selectedText(selected.drivetrain),
    transmission: selectedText(selected.transmission),
    engineSource: engine ? 'selected' : null,
  };

  if (engine || selected.year == null || !selected.make || !selected.model || !selected.trim) {
    return base;
  }

  const matches = REVIEWED_EXACT_ENGINE_MAPPINGS.filter((mapping) =>
    mapping.year === selected.year
      && exactValue(mapping.make) === exactValue(selected.make)
      && exactValue(mapping.model) === exactValue(selected.model)
      && mapping.trims.some((trim) => exactValue(trim) === exactValue(selected.trim)),
  );

  if (matches.length !== 1) return base;
  const match = matches[0]!;
  return {
    ...base,
    engine: match.engine,
    engineSource: 'reviewed-exact-ymmt',
    engineProvenance: match.provenance,
  };
}
