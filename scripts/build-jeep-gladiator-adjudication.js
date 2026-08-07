/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-gladiator-adjudication-2026-08-06.json');

const IDS = {
  clutchHydraulic: 'jeep-gladiator-clutch-hydraulic-2020',
  clutchFire: 'jeep-gladiator-clutch-recall-fire',
  deathWobble: 'jeep-gladiator-death-wobble',
  eLocker: 'jeep-gladiator-elocker-actuator-2020',
  frameRust: 'jeep-gladiator-frame-weld-rust',
  instrumentCluster: 'jeep-gladiator-instrument-cluster-failure',
  rearWindow: 'jeep-gladiator-rear-window-leak-2020',
  tpms: 'jeep-gladiator-tpms-sensor-failure-2020',
  autoPark: 'jeep-gladiator-transmission-auto-park',
};

const CAMPAIGNS = {
  originalClutch: {
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V124000',
    campaign: '20V124000',
    model: 'GLADIATOR',
    years: ['2020'],
    markers: ['manual transmissions', 'clutch pressure plate may overheat and fracture', 'reroute a wire harness', 'inspect the clutch system', 'replace components as needed'],
  },
  expandedClutch: {
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V116000',
    campaign: '23V116000',
    model: 'GLADIATOR',
    years: ['2020', '2021', '2022', '2023'],
    markers: ['2020-2023 Jeep Gladiator', 'manual transmissions', 'clutch pressure plate may overheat and fracture', 'replace the clutch assembly', 'update the software', 'free of charge'],
  },
  miscitedDeathWobble: {
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V853000',
    campaign: '21V853000',
    model: 'TIGUAN',
    years: ['2022'],
    markers: ['Volkswagen', 'brake pipe', 'right-front wheel well', 'brake fluid to leak', 'inspect and tighten the brake pipe nut'],
  },
};

const EXPECTED_RECALLS = {
  2020: ['19V636000', '20V124000', '20V191000', '20V580000', '21V028000', '23V116000', '24V652000'],
  2021: ['21V028000', '22V638000', '22V767000', '23V116000', '23V263000', '24V572000', '24V652000', '26V363000'],
  2022: ['22V639000', '22V766000', '22V767000', '23V116000', '23V263000', '23V641000', '24V652000', '26V363000'],
  2023: ['23V116000', '23V263000', '23V641000', '24V199000', '24V652000', '26V363000'],
  2024: ['24V652000', '26V363000'],
  2025: ['26V363000'],
};

const RECALL_QUERIES = Object.fromEntries(
  Object.keys(EXPECTED_RECALLS).map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=GLADIATOR&modelYear=${year}`,
  ]),
);

const KEEP_REASONS = {
  [IDS.clutchHydraulic]: 'No exact primary service source was pinned for the frozen 2020-2025 hydraulic-failure identity, 20,000-mile onset, internal slave and master-cylinder leak mechanism, updated seal, replace-both instruction, bellhousing labor or part 4581906AC fitment. Its automatic-transmission commerce is unrelated to a manual clutch hydraulic page, so the row remains byte-for-byte unchanged.',
  [IDS.clutchFire]: 'NHTSA campaign 20V124000 covers only the 2020 Gladiator and campaign 23V116000 covers manual-transmission Gladiators from 2020-2023, not the frozen 2020-2024 scope. The frozen page also adds unsupported parked-fire, DTC, trim, six-hour, retail-clutch and exact torque-reduction claims. The partial year and claim match cannot authorize a rewrite, so the row remains byte-for-byte unchanged.',
  [IDS.deathWobble]: 'The frozen page cites campaign 21V853000 as a Jeep lower-ball-joint recall, but the official campaign is a Volkswagen 2022 Tiguan brake-pipe-nut recall. It does not establish Gladiator death wobble, complaint counts, ball-joint causation, torque values, parts or repair procedure. This critical citation mismatch requires a byte-for-byte hold.',
  [IDS.eLocker]: 'The cited video uses a placeholder identifier, and no exact primary source clears the 2020-2025 moisture-ingress mechanism, C2120/C212A scope, actuator-without-differential-removal procedure, breather extension or part 68391561AA fitment. The row remains byte-for-byte unchanged.',
  [IDS.frameRust]: 'No citation establishes the frozen 2020-2023 early-corrosion frequency, inadequate factory coating, weld and drain-hole mechanism, rust-converter and rubber-undercoat sequence, oil-spray product recommendations or annual costs. Structural and corrosion-treatment advice requires an exact qualified source, so the row remains byte-for-byte unchanged.',
  [IDS.instrumentCluster]: 'The frozen page relies on a secondary news article and does not pin the official investigation file needed to support its 2020-2022 scope, 232,000-vehicle population, circuit-board-short mechanism, complete failure sequence, repair costs, programming claims or part 68336279AG fitment. The row and its generic commerce remain byte-for-byte unchanged.',
  [IDS.rearWindow]: 'The cited video uses a placeholder identifier, and no exact primary body or glazing source clears the 2020-2025 design claim, hard-top and soft-top applicability, wiring-risk statement, window assembly part 68466091AA or marine-sealant and silicone procedure. Unqualified sealant advice could interfere with drainage or adhesion, so the row remains byte-for-byte unchanged.',
  [IDS.tpms]: 'The cited video uses a placeholder identifier, and no exact primary source clears a two-to-three-year failure life, off-road or two-wheel-set causation, warranty exclusion, valve-stem versus band-clamp design, relearn procedure, DTCs or part 68339096AB fitment across 2020-2025. The unrelated battery commerce also remains untouched pending fitment review.',
  [IDS.autoPark]: 'The frozen citation concerns a Wagoneer and Ram 5.7L Hemi eTorque investigation, not a Jeep Gladiator. It does not establish the page\'s Gladiator 3.6L eTorque, 8HP75, 48-volt battery, motor-generator, TCM, Auto-Park or electronic-parking-brake identity across 2020-2023. This model and powertrain mismatch requires a byte-for-byte hold.',
};

function evidenceFor(id) {
  if (id === IDS.clutchFire) {
    return [
      { kind: 'official-recall-partial-year-and-claim-scope', url: CAMPAIGNS.originalClutch.url, supportingUrls: [CAMPAIGNS.expandedClutch.url], verifiedOn: '2026-08-06', observation: 'Campaign 20V124 covers the 2020 Gladiator; 23V116 covers 2020-2023 manual-transmission Gladiators, not the full frozen 2020-2024 page.' },
    ];
  }
  if (id === IDS.deathWobble) {
    return [
      { kind: 'official-recall-wrong-make-model-and-component', url: CAMPAIGNS.miscitedDeathWobble.url, verifiedOn: '2026-08-06', observation: 'Campaign 21V853 is a Volkswagen 2022 Tiguan brake-pipe recall, not a Jeep steering or ball-joint recall.' },
    ];
  }
  return [
    { kind: 'official-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[2020], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: 'The complete 2020-2025 Gladiator recall inventory does not establish this page\'s full identity, causes, remedies or commerce.' },
  ];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Gladiator');
  if (modelRows.length !== 9) throw new Error(`expected 9 Jeep Gladiator rows, found ${modelRows.length}`);
  const expectedIds = Object.values(IDS).sort();
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Gladiator IDs do not match snapshot');

  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Gladiator decision: ${current.id}`);
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'A wrong-model citation, partial year scope, placeholder source, unsafe advice or unverified powertrain and fitment requires a byte-for-byte hold.',
      commerceDecision: 'unchanged-commerce-pending-exact-source-and-fitment',
      changedFields: [],
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Jeep',
    model: 'Gladiator',
    completionStatement: 'All nine frozen Gladiator records remain byte-for-byte holds. The cited death-wobble campaign belongs to Volkswagen, the clutch campaigns are narrower than the indexed page, and the remaining rows lack exact primary-source, powertrain or fitment support.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All nine Gladiator rows remain published and byte-for-byte unchanged.',
      'A wrong-model campaign or narrower recall cannot be expanded across an indexed aggregate page.',
      'Placeholder citations, unsafe sealant guidance, unrelated commerce and unverified powertrains cannot authorize content changes.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 9,
    },
    observations: [
      { code: 'gladiator-death-wobble-cites-volkswagen-recall', severity: 'critical', recordIds: [IDS.deathWobble], detail: '21V853 is a 2022 Volkswagen Tiguan brake-pipe recall, not a Jeep lower-ball-joint recall.' },
      { code: 'gladiator-clutch-recall-is-2020-through-2023', severity: 'critical', recordIds: [IDS.clutchFire], detail: '23V116 covers 2020-2023 Gladiators, while the frozen page includes 2024 and additional unsupported claims.' },
      { code: 'gladiator-auto-park-source-is-other-model-powertrain', severity: 'critical', recordIds: [IDS.autoPark], detail: 'The cited investigation article concerns Wagoneer and Ram 5.7L Hemi eTorque vehicles, not the Gladiator identity asserted by the page.' },
      { code: 'gladiator-rear-window-has-unsafe-unsourced-sealant-advice', severity: 'high', recordIds: [IDS.rearWindow], detail: 'Marine sealant and silicone guidance lacks a qualified body or glazing source.' },
      { code: 'all-gladiator-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Gladiator record remains published and byte-for-byte unchanged.' },
    ],
    campaignSources: CAMPAIGNS,
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 9, total: 9 },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGNS, EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, evidenceFor };
