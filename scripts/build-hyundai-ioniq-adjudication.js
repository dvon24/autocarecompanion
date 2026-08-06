/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-adjudication-2026-08-06.json');

const IDS = {
  dct: 'hyundai-ioniq-dct-harsh-shifting-2017',
  epb: 'hyundai-ioniq-epb-autohold-malfunction-2017',
  hybridControl: 'hyundai-ioniq-hybrid-control-software-2019',
  mdps: 'hyundai-ioniq-mdps-bearing-noise-2017',
};

const SOURCES = {
  mdps: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203272-0001.pdf',
  epbUpdate: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10191793-0001.pdf',
  epbDiagnosis: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10235346-0001.pdf',
  ecuU1341: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252364-0001.pdf',
};

const KEEP_REASONS = {
  [IDS.dct]: 'The two secondary pages do not establish one Hyundai-defined 2017-2022 Ioniq 6DCT defect, the claimed mechanical failures, diagnostic codes, software history, replacement remedy, costs or warranty coverage. No exact Hyundai campaign or bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.epb]: 'Hyundai bulletins 21-BR-004H and 23-BR-001H establish specific EPB DTC update and diagnosis procedures, but they do not establish the frozen title\'s combined Electronic Parking Brake and Auto Hold malfunction identity or the claimed caliper-motor failure. Because the title cannot change, the row remains byte-for-byte unchanged.',
  [IDS.hybridControl]: 'Hyundai bulletin 24-EV-001H covers an ECU communication-delay update for DTC U1341 on 2021-2022 Ioniq PHEV vehicles. It does not establish the frozen Hybrid Control Unit/LDC identity, 2019-2022 HEV scope, state-of-charge or power-distribution claims. Because the title cannot change, the row remains byte-for-byte unchanged.',
};

const HOLD_EVIDENCE = {
  [IDS.epb]: [
    { kind: 'official-related-but-not-identity-complete', url: SOURCES.epbUpdate, verifiedOn: '2026-08-06', observation: 'TSB 21-BR-004H covers an EPB ECU update for C2416/C2417 on certain 2019-2020 Ioniq HEV/PHEV vehicles, but not the combined Auto Hold identity or claimed caliper-motor failure.' },
    { kind: 'official-related-but-not-identity-complete', url: SOURCES.epbDiagnosis, verifiedOn: '2026-08-06', observation: 'TSB 23-BR-001H covers diagnosis for C2416/C2417 on 2019-2022 Ioniq HEV/PHEV vehicles, but not the combined Auto Hold identity.' },
  ],
  [IDS.hybridControl]: [
    { kind: 'official-related-but-different-identity', url: SOURCES.ecuU1341, verifiedOn: '2026-08-06', observation: 'TSB 24-EV-001H is an ECU update for an IEB communication delay on 2021-2022 Ioniq PHEV vehicles, not the frozen HCU/LDC narrative.' },
  ],
};

const MDPS_CARD = {
  severity: 'low',
  confidence: 'high',
  description: 'Hyundai Technical Service Bulletin 21-ST-003H says certain vehicles may develop bearing noise within the Motor Driven Power Steering (MDPS) column worm shaft assembly. The bulletin applies to 2017-2022 Ioniq Hybrid and Plug-In Hybrid vehicles and 2017-2021 Ioniq Electric vehicles.',
  solution: 'Ask a Hyundai dealer to verify whether the noise comes from the C-MDPS worm shaft bearing and, if confirmed, follow TSB 21-ST-003H. The bulletin supersedes an earlier procedure and directs technicians to replace the small worm shaft bearing rather than the worm shaft assembly.',
  symptoms: ['Bearing noise from the Motor Driven Power Steering column worm shaft assembly'],
  affectedSystems: ['Motor Driven Power Steering column', 'Worm shaft bearing'],
  dtcCodes: [],
  citations: [
    { type: 'tsb', title: 'Hyundai TSB 21-ST-003H - C-MDPS Worm Shaft Bearing Noise', url: SOURCES.mdps },
  ],
  summary: 'Kept the same indexed MDPS worm-shaft-bearing identity, replaced secondary/index citations with the exact Hyundai bulletin deep link, retained the source-specific Ioniq model-year distinctions, and removed unsupported battery-weight, weather, steering-effort, repair-time, cost and full-MDPS-replacement claims.',
};

function rewriteMdps(current) {
  return fullRecord({
    ...current,
    ...MDPS_CARD,
    make: 'Hyundai',
    model: 'Ioniq',
    title: current.title,
    category: current.category,
    years: [2017, 2018, 2019, 2020, 2021, 2022],
    trims: [],
    engines: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: MDPS_CARD.summary,
    relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq');
  if (modelRows.length !== 4) throw new Error(`expected 4 Hyundai Ioniq rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isMdps = current.id === IDS.mdps;
    if (!isMdps && !KEEP_REASONS[current.id]) throw new Error(`missing Ioniq decision: ${current.id}`);
    const proposal = isMdps ? rewriteMdps(before) : before;
    return {
      id: current.id,
      model: current.model,
      action: isMdps ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isMdps ? MDPS_CARD.summary : KEEP_REASONS[current.id],
      identityRule: isMdps ? 'The same indexed MDPS worm-shaft-bearing issue stays on the existing ID, title and category; only claims supported by exact TSB 21-ST-003H remain.' : 'No content or publication-state changes; a related bulletin cannot replace or narrow this indexed issue while its title must remain unchanged.',
      commerceDecision: isMdps ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: isMdps ? [{ kind: 'official-record-specific-tsb', url: SOURCES.mdps, verifiedOn: '2026-08-06', observation: 'Hyundai TSB 21-ST-003H directly supports the MDPS worm shaft bearing-noise identity, applicability and bearing-only remedy.' }] : (HOLD_EVIDENCE[current.id] || []),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const summary = { rewrite_same_identity: 1, keep_published_pending_source: 3, total: 4 };
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'Ioniq',
    completionStatement: 'This packet reconciles all four frozen Hyundai Ioniq rows. One same-identity MDPS rewrite is proposed; three rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All four rows remain published. Three are byte-for-byte unchanged.',
      'The single rewrite preserves the indexed title and category and uses one exact Hyundai/NHTSA bulletin deep link.',
      'The rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, ioniqRecordCount: modelRows.length },
    observations: [
      { code: 'mdps-exact-tsb-rewrite', severity: 'independent-review-required', recordIds: [IDS.mdps], detail: 'TSB 21-ST-003H directly matches the existing MDPS worm-shaft-bearing identity and distinguishes HEV/PHEV applicability through 2022 from EV applicability through 2021.' },
      { code: 'epb-partial-source-held', severity: 'independent-review-required', recordIds: [IDS.epb], detail: 'Exact EPB bulletins support DTC update/diagnosis procedures but not the indexed Auto Hold identity or claimed caliper-motor defect, so the record is unchanged.' },
      { code: 'u1341-different-module-held', severity: 'independent-review-required', recordIds: [IDS.hybridControl], detail: 'TSB 24-EV-001H covers an ECU-to-IEB communication delay on 2021-2022 PHEV vehicles, not the frozen HCU/LDC narrative.' },
      { code: 'dct-secondary-only-held', severity: 'independent-review-required', recordIds: [IDS.dct], detail: 'No exact primary source was found for the broad 2017-2022 DCT narrative.' },
    ],
    publicSources: SOURCES,
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { HOLD_EVIDENCE, IDS, KEEP_REASONS, MDPS_CARD, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteMdps };
