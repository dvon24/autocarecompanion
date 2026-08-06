/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-sonata-adjudication-2026-08-06.json',
);

const IDS = {
  ac: 'hyundai-sonata-ac-compressor-2011',
  batteryDrain: 'hyundai-sonata-battery-drain-2015',
  dct: 'hyundai-sonata-dct-shudder-2015',
  radar: 'hyundai-sonata-front-radar-forward-2022',
  injector: 'hyundai-sonata-fuel-injector-failure-causing-2022',
  infotainment: 'hyundai-sonata-infotainment-2015',
  mdpsLockup:
    'hyundai-sonata-mdps-electronic-power-steering-sudden-assist-loss-steering-l',
  p0011: 'hyundai-sonata-p0011-intake-cam-over-advanced-from-failed-oil-control-valve',
  p0016:
    'hyundai-sonata-p0016-crank-cam-correlation-fault-from-stretched-timing-chai',
  p0128:
    'hyundai-sonata-p0128-engine-not-reaching-operating-temp-from-stuck-open-the',
  p0171:
    'hyundai-sonata-p0171-bank-1-lean-from-intake-manifold-gasket-vacuum-leak-st',
  p0174: 'hyundai-sonata-p0174-bank-2-lean-from-upper-intake-plenum-gasket-leak',
  p0420: 'hyundai-sonata-p0420-bank-1-catalytic-converter-failure-from-theta-ii-2-4l',
  p0430: 'hyundai-sonata-p0430-bank-2-catalytic-converter-efficiency-failure',
  p0442: 'hyundai-sonata-p0442-small-evap-leak-from-gas-cap-seal-nvld-sensor',
  p0455: 'hyundai-sonata-p0455-gross-evap-leak-from-loose-failed-gas-cap-stuck-purge',
  sunroof: 'hyundai-sonata-panoramic-sunroof-wind-deflector-detachment-glass-shattering',
  eps: 'hyundai-sonata-steering-2011',
  bearingFire:
    'hyundai-sonata-theta-ii-2-0t-2-4l-gdi-connecting-rod-bearing-failure',
  oilConsumption: 'hyundai-sonata-theta-ii-gdi-excessive-oil-consumption',
  thetaGeneric: 'hyundai-theta2-engine',
};

const SOURCES = {
  injector: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012819-0001.pdf',
  eps: 'https://static.nhtsa.gov/odi/rcl/2016/RCLRPT-16V190-0509.PDF',
  oilConsumption: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10247597-0001.pdf',
};

const REVIEW_SOURCES = {
  batteryCitationMismatch: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10170885-0001.pdf',
  dctCitationMismatch: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174800-0001.pdf',
  evapPartialMatch: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199095-0001.pdf',
  sunroofPartialMatch: 'https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V726-9804.pdf',
  bearing2011To2012: 'https://static.nhtsa.gov/odi/rcl/2015/RCLRPT-15V568-9490.PDF',
  bearing2013To2014: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V226-6577.PDF',
};

const HOLD_EVIDENCE = {
  [IDS.batteryDrain]: [
    {
      kind: 'official-record-citation-mismatch',
      url: REVIEW_SOURCES.batteryCitationMismatch,
      verifiedOn: '2026-08-06',
      observation:
        'The cited 20-BE-003H number is a 2012-2014 Sonata rear-combination-lamp harness ordering bulletin, not a Blue Link or parasitic-battery-drain bulletin.',
    },
  ],
  [IDS.dct]: [
    {
      kind: 'official-record-citation-mismatch',
      url: REVIEW_SOURCES.dctCitationMismatch,
      verifiedOn: '2026-08-06',
      observation:
        'The cited 20-AT-015H number covers automatic-transaxle oil-temperature-sensor DTCs on other listed models; it does not list Sonata or establish DCT judder.',
    },
  ],
  [IDS.p0442]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.evapPartialMatch,
      verifiedOn: '2026-08-06',
      observation:
        'Campaign T6H supports salt-particulate NVLD intermittency and P0442/P0455/P0456 only for certain 2011-2015 Sonata Hybrid vehicles, not the combined gas-cap/NVLD identity or 2011-2019 scope.',
    },
  ],
  [IDS.p0455]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.evapPartialMatch,
      verifiedOn: '2026-08-06',
      observation:
        'Campaign T6H supports one NVLD salt-contamination mechanism only for certain 2011-2015 Sonata Hybrid vehicles; it does not establish the title\'s gas-cap or purge-valve mechanisms across 2011-2019.',
    },
  ],
  [IDS.sunroof]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.sunroofPartialMatch,
      verifiedOn: '2026-08-06',
      observation:
        'Recall 152 supports wind-deflector partial detachment and resulting movable-panel detachment, but not the title\'s separate spontaneous-glass-shattering claim or settlement terms.',
    },
  ],
  [IDS.bearingFire]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.bearing2011To2012,
      verifiedOn: '2026-08-06',
      observation:
        'Recall 15V-568 supports 2011-2012 Sonata GDI connecting-rod-bearing wear, knock and stall, but its filing does not establish the title\'s fire outcome or 2015-2019 scope.',
    },
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.bearing2013To2014,
      verifiedOn: '2026-08-06',
      observation:
        'Recall 17V-226 supports 2013-2014 Sonata GDI connecting-rod-bearing wear, knock and loss of motive power, but its filing does not establish the title\'s fire outcome or 2015-2019 scope.',
    },
  ],
};

const KEEP_REASONS = {
  [IDS.ac]:
    'A generic complaint page and an unlinked refrigerant-service bulletin do not establish one broad 2011-2020 Sonata compressor defect, contamination mechanism, collateral-parts replacement path or cost. The row remains byte-for-byte unchanged.',
  [IDS.batteryDrain]:
    'The claimed 20-BE-003H citation is a tail-lamp harness ordering bulletin, not a Blue Link battery-discharge record, and one generic complaint does not establish the combined module/smart-key narrative. The row remains byte-for-byte unchanged.',
  [IDS.dct]:
    'The claimed 20-AT-015H citation concerns automatic-transaxle oil-temperature-sensor DTCs on other listed models, not Sonata DCT judder. A generic complaint cannot establish the combined design-characteristic, software, actuator and clutch-pack narrative, so the row remains byte-for-byte unchanged.',
  [IDS.radar]:
    'A generic NHTSA vehicle page does not establish one Hyundai-defined radar sensor, bracket, water-intrusion, non-OEM-part or calibration defect across 2022-2025 vehicles. The row remains byte-for-byte unchanged.',
  [IDS.infotainment]:
    'A generic complaint page and one owner discussion do not establish one infotainment-freeze defect, broad 2015-2021 scope, update path or replacement requirement. The row remains byte-for-byte unchanged.',
  [IDS.mdpsLockup]:
    'Owner discussions do not establish the asserted 2015-2017 component causes or warranty terms. Recall 16V-190 applies to certain 2011 vehicles and explicitly says steering remains controllable in manual mode, so it cannot replace this separate lockup title. The row remains byte-for-byte unchanged.',
  [IDS.p0011]:
    'Generic code articles and owner discussions do not establish one Sonata oil-control-valve defect, exact 2007-2019 scope, resistance specification or component-swap diagnostic. The row remains byte-for-byte unchanged.',
  [IDS.p0016]:
    'Secondary code articles do not establish that a stretched timing chain is the primary cause of P0016 across the asserted 2010-2015 Theta II population or support the claimed oil-starvation and interference-damage narrative. The row remains byte-for-byte unchanged.',
  [IDS.p0128]:
    'Secondary code articles do not establish one stuck-open thermostat-housing defect, exact 2011-2019 scope, weak-heat symptom or installation procedure. The row remains byte-for-byte unchanged.',
  [IDS.p0171]:
    'Secondary articles and an owner discussion do not establish one combined manifold-gasket, purge-valve, MAF and PCV defect across four-cylinder and V6 Sonata vehicles. The row remains byte-for-byte unchanged.',
  [IDS.p0174]:
    'Generic code articles and an owner discussion do not establish one Sonata V6 upper-plenum-gasket defect, exact 2005-2010 scope or ranked cause set. The row remains byte-for-byte unchanged.',
  [IDS.p0420]:
    'Recall 15V-568 establishes connecting-rod-bearing wear and stall, not a P0420 catalytic-converter failure caused by oil consumption. Secondary articles cannot bridge that different component and outcome, so the row remains byte-for-byte unchanged.',
  [IDS.p0430]:
    'Generic diagnostic articles do not establish one Bank 2 converter defect, 2006-2010 Sonata V6 scope, sensor-trace behavior or replacement path. The row remains byte-for-byte unchanged.',
  [IDS.p0442]:
    'Campaign T6H supports one NVLD salt-contamination mechanism for certain 2011-2015 Sonata Hybrid vehicles, but the indexed title also claims a gas-cap seal mechanism and the row spans 2011-2019. Because the official record only partially matches the identity, the row remains byte-for-byte unchanged.',
  [IDS.p0455]:
    'Campaign T6H supports one NVLD salt-contamination mechanism for certain 2011-2015 Sonata Hybrid vehicles, not the title\'s loose gas-cap or stuck-purge-valve causes across 2011-2019. The row remains byte-for-byte unchanged.',
  [IDS.sunroof]:
    'Recall 152 supports wind-deflector partial detachment and possible sunroof-panel detachment for certain 2015-2016 vehicles, but it does not establish the separate spontaneous-glass-shattering claim, class settlement or repair-cost narrative combined in this title. The row remains byte-for-byte unchanged.',
  [IDS.bearingFire]:
    'Recalls 15V-568 and 17V-226 support 2011-2014 Sonata GDI connecting-rod-bearing wear, knock and stall, but those filings do not establish the title\'s fire outcome or the asserted 2015-2019 scope. A partial rewrite would leave the indexed title broader than its evidence, so the row remains byte-for-byte unchanged.',
  [IDS.thetaGeneric]:
    'The generic NHTSA vehicle-page citation and claimed 17V-224 number do not establish this broad 2011-2019 duplicate engine-seizure identity, KSDS remedy, maintenance interval, warranty promise or cost. It remains separate from the more specific indexed bearing row and byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.injector]: {
    years: [2021, 2022, 2023],
    severity: 'medium',
    confidence: 'high',
    description:
      'Hyundai TSB 25-FL-001H covers specified production ranges of model-year 2021-2023 Sonata vehicles equipped with the 2.5-liter GDI Theta III non-turbo engine. Some affected vehicles may store one or more misfire DTCs due to GDI injectors leaking internally; the bulletin says internal filter breakage in an injector may cause the leak.',
    solution:
      'Confirm that the vehicle falls within the bulletin\'s production range and has one of the listed misfire DTCs. For an applicable vehicle, Hyundai directs technicians to replace all four GDI injectors using the specified kit. If the listed DTCs are absent or the vehicle is outside the range, the bulletin says to continue normal diagnosis instead.',
    symptoms: ['Misfire diagnostic trouble code stored', 'Check Engine warning-light illumination'],
    affectedSystems: ['2.5-liter non-turbo GDI fuel injectors'],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai TSB 25-FL-001H - GDI Injector Replacement Due to Misfire DTC(s)',
        url: SOURCES.injector,
      },
    ],
    summary:
      'Kept the indexed fuel-injector/misfire identity, replaced generic complaints with exact Hyundai TSB 25-FL-001H, narrowed the scope to its 2021-2023 2.5-liter non-turbo Sonata populations, and removed speculative testing and commerce claims.',
  },
  [IDS.eps]: {
    years: [2011],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 16V-190 (Hyundai recall 143) covers certain model-year 2011 Sonata sedans. Damage to the electronic-power-steering control-unit circuit board can illuminate the EPS warning lamp and cause loss of steering assist. The filing states that the vehicle reverts to a manual steering mode in which steering control remains available, but greater driver effort is required, particularly at low speeds.',
    solution:
      'Check the VIN for NHTSA recall 16V-190. Hyundai dealers replace the EPS control unit under the recall remedy. If the EPS warning lamp appears or steering assist is lost, reduce speed, allow for the greater steering effort and arrange service.',
    symptoms: ['Red EPS warning-light illumination', 'Loss of electric steering assist', 'Greater steering effort, especially at low speed'],
    affectedSystems: ['Electronic power steering control unit', 'EPS circuit board'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 16V-190 - 2011 Sonata EPS Control Unit',
        url: SOURCES.eps,
      },
    ],
    summary:
      'Kept the indexed EPS-failure identity, replaced a noise bulletin and generic complaint with exact recall 16V-190, limited the scope to 2011, and clarified that steering remains controllable with greater manual effort.',
  },
  [IDS.oilConsumption]: {
    years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    severity: 'medium',
    confidence: 'high',
    description:
      'Hyundai TSB 23-EM-008H provides inspection and repair guidance for gasoline-engine vehicles with oil-consumption concerns. Its engine and labor tables specifically include model-year 2011-2014 Sonata 2.4-liter GDI and 2.0-liter turbo-GDI applications and model-year 2015-2020 Sonata 2.4-liter GDI and 2.0-liter turbo-GDI applications. The bulletin states that all internal-combustion engines consume some oil in normal operation and does not assign one universal defect cause.',
    solution:
      'Ask a Hyundai dealer to follow TSB 23-EM-008H and confirm coverage. After preliminary checks and repair of any leaks or other open issues, the procedure seals the serviced engine and measures oil use over a mileage-accumulation period. A result above 1,000 miles per quart passes; a result under 1,000 miles per quart proceeds to prior-approval review for combustion-chamber cleaning. Engine replacement is considered only after the cleaning and final retest remain outside specification and prior approval is obtained.',
    symptoms: ['Engine-oil level decreases between checks', 'Measured consumption under 1,000 miles per quart'],
    affectedSystems: ['Engine lubrication system', 'Combustion chambers'],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai TSB 23-EM-008H - Engine Oil Consumption Inspection and Repair Guidelines',
        url: SOURCES.oilConsumption,
      },
    ],
    summary:
      'Kept the indexed Theta II GDI oil-consumption identity, replaced articles and owner reports with Hyundai TSB 23-EM-008H, limited the scope to the Sonata applications listed in its tables, and removed universal-cause, class-action and automatic-replacement claims.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Sonata',
    title: current.title,
    category: current.category,
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
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Sonata',
  );
  if (modelRows.length !== 21) {
    throw new Error(`expected 21 Hyundai Sonata rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Sonata decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component and failure outcome stay on the existing ID, title and category; only facts within the exact official record remain.'
        : 'No content or publication-state changes; secondary, partial, false-citation or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind:
              item.type === 'tsb'
                ? 'official-record-specific-tsb'
                : 'official-record-specific-recall',
            url: item.url,
            verifiedOn: '2026-08-06',
            observation: `${item.title} supports the proposed same-identity statements.`,
          }))
        : HOLD_EVIDENCE[current.id] || [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'Sonata',
    completionStatement:
      'This packet reconciles all twenty-one frozen Hyundai Sonata rows. Three same-identity official-source rewrites are proposed; eighteen rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All twenty-one rows remain published. Eighteen are byte-for-byte unchanged.',
      'Each rewrite preserves the indexed ID, title and category and uses one exact Hyundai or NHTSA primary record.',
      'Rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      sonataRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'three-exact-official-rewrites',
        severity: 'independent-review-required',
        recordIds: Object.keys(CARDS),
        detail:
          'Exact Hyundai or NHTSA records support the 2.5-liter non-turbo injector, 2011 EPS-control-unit and oil-consumption-inspection identities without changing indexed titles or categories.',
        sourceUrls: Object.values(SOURCES),
      },
      {
        code: 'two-cited-bulletin-numbers-mismatch',
        severity: 'high',
        recordIds: [IDS.batteryDrain, IDS.dct],
        detail:
          'The bulletin numbers cited in the battery-drain and DCT rows resolve to a tail-lamp harness bulletin and an automatic-transaxle temperature-sensor bulletin, respectively; both rows remain unchanged.',
        sourceUrls: [
          REVIEW_SOURCES.batteryCitationMismatch,
          REVIEW_SOURCES.dctCitationMismatch,
        ],
      },
      {
        code: 'combined-identities-not-partially-rewritten',
        severity: 'high',
        recordIds: [IDS.p0442, IDS.p0455, IDS.sunroof, IDS.bearingFire],
        detail:
          'Official records support only part of each combined title or a narrower population. The packet rejects partial rewrites so indexed titles never overstate their replacement evidence.',
        sourceUrls: [
          REVIEW_SOURCES.evapPartialMatch,
          REVIEW_SOURCES.sunroofPartialMatch,
          REVIEW_SOURCES.bearing2011To2012,
          REVIEW_SOURCES.bearing2013To2014,
        ],
      },
      {
        code: 'eighteen-partial-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'All combined, generic, secondary, mismatched or insufficiently sourced narratives remain byte-for-byte unchanged.',
      },
    ],
    publicSources: SOURCES,
    reviewSources: REVIEW_SOURCES,
    summary: {
      rewrite_same_identity: 3,
      keep_published_pending_source: 18,
      total: 21,
    },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary },
      null,
      2,
    ),
  );
}

if (require.main === module) main();

module.exports = {
  CARDS,
  HOLD_EVIDENCE,
  IDS,
  KEEP_REASONS,
  REVIEW_SOURCES,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewrite,
};
