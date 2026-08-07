/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-grand-cherokee-l-adjudication-2026-08-06.json');

const IDS = {
  eTorque: 'jeep-grand-cherokee-l-etorque-2021',
  uconnect: 'jeep-grand-cherokee-l-infotainment-uconnect5-2021',
  sunroof: 'jeep-grand-cherokee-l-panoramic-roof-leak-2021',
};

const PDF_SOURCES = {
  uconnect: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239977-9999.pdf',
    sha256: 'b5717f6c148ea08ef1a4f2a3812b5c228952eb56dc4051824ec424ace76fb0bd',
    visuallyInspectedPages: [1],
    markers: ['TSB: 08-131-23', '2022 (WL) Jeep Grand Cherokee/Grand Cherokee L', 'Uconnect 5', 'Radio reset', 'Wireless CarPlay'],
  },
  sunroof: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10248624-9999.pdf',
    sha256: 'f44b6fb62d915f528bac84564b37d57e0b2db0566ecd1e9e26a52ca8b2654936',
    visuallyInspectedPages: [1],
    markers: ['TSB: 23-102-23', '2021 - 2023 (WL) Jeep Grand Cherokee', 'Dual-Pane Panoramic Sunroof', 'Wind deflector assembly', 'replacing the dual-pane wind deflector assembly'],
  },
};

const EXPECTED_RECALLS = {
  2021: { status: 200, campaigns: ['24V897000', '25V083000', '26V051000'] },
  2022: { status: 200, campaigns: ['24V897000', '25V083000', '26V051000'] },
  2023: { status: 200, campaigns: ['24V897000', '25V430000', '25V472000', '26V051000', '26V328000'] },
  2024: { status: 200, campaigns: ['24V872000', '24V897000', '24V926000', '24V944000', '25V472000', '26V328000', '26V413000'] },
  2025: { status: 200, campaigns: ['26V328000'] },
  2026: { status: 400, campaigns: [] },
};

const RECALL_QUERIES = Object.fromEntries(
  Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=GRAND%20CHEROKEE%20L&modelYear=${year}`]),
);

const KEEP_REASONS = {
  [IDS.eTorque]: 'One forum home page does not establish a 2021-2024 Grand Cherokee L 48V battery defect, stop/start calibration, belt-starter-generator vibration, battery life or dealer-only replacement. The page also combines unverified 48V and 12V battery advice with unrelated conventional starter commerce. The row remains byte-for-byte unchanged.',
  [IDS.uconnect]: 'Visually inspected Stellantis TSB 08-131-23 supports specified 2022 Grand Cherokee and Grand Cherokee L Uconnect 5 radios and a defined software symptom list, not the frozen 2021-2026 frequency, every display, hard-reset, cost or backup-camera-delay aggregation. The placeholder video and generic scanner commerce do not bridge that gap, so the row remains byte-for-byte unchanged.',
  [IDS.sunroof]: 'Visually inspected Stellantis TSB 23-102-23 covers certain 2021-2023 WL vehicles whose wind deflector can become trapped and cause a leak. It does not establish the frozen 2021-2025 drain blockage, longer Grand Cherokee L tube routing, C-pillar clog, compressed-air procedure or unrelated body-filler commerce. The wind deflector source cannot replace a drain blockage identity, so the row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.uconnect) return [{ kind: 'official-tsb-partial-year-and-radio-scope', url: PDF_SOURCES.uconnect.url, verifiedOn: '2026-08-06', sha256: PDF_SOURCES.uconnect.sha256, visuallyInspectedPages: [1], observation: 'TSB 08-131-23 covers specified 2022 WL Uconnect 5 radios, not the full 2021-2026 aggregate.' }];
  if (id === IDS.sunroof) return [{ kind: 'official-tsb-different-cause-and-partial-year-scope', url: PDF_SOURCES.sunroof.url, verifiedOn: '2026-08-06', sha256: PDF_SOURCES.sunroof.sha256, visuallyInspectedPages: [1], observation: 'TSB 23-102-23 identifies a trapped wind deflector on certain 2021-2023 WL vehicles, not clogged drain tubes across 2021-2025.' }];
  return [{ kind: 'official-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[2021], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: 'The complete 2021-2026 recall inventory does not establish the broad eTorque battery, belt-starter-generator and commerce claims.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee L');
  if (modelRows.length !== 3) throw new Error(`expected 3 Jeep Grand Cherokee L rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(Object.values(IDS).sort())) throw new Error('Grand Cherokee L IDs do not match snapshot');

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'A partial-year bulletin, different failure cause, placeholder citation or unverified powertrain and commerce requires a byte-for-byte hold.',
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
    model: 'Grand Cherokee L',
    completionStatement: 'All three frozen Grand Cherokee L rows remain byte-for-byte holds. Two visually inspected official bulletins are materially narrower than the indexed pages, and the eTorque row lacks an exact primary source.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All three Grand Cherokee L rows remain published and byte-for-byte unchanged.',
      'A one-year software bulletin or different sunroof failure cause cannot replace a multi-year aggregate identity.',
      'Placeholder videos, forum home pages and search-query commerce cannot authorize a rewrite.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 3,
    },
    observations: [
      { code: 'grand-cherokee-l-uconnect-tsb-is-2022-only', severity: 'critical', recordIds: [IDS.uconnect], detail: 'TSB 08-131-23 covers specified 2022 WL radios, not 2021-2026.' },
      { code: 'grand-cherokee-l-sunroof-source-is-wind-deflector-not-drains', severity: 'critical', recordIds: [IDS.sunroof], detail: 'TSB 23-102-23 identifies a trapped wind deflector on certain 2021-2023 vehicles, not drain blockage across 2021-2025.' },
      { code: 'grand-cherokee-l-etorque-commerce-is-unverified', severity: 'high', recordIds: [IDS.eTorque], detail: 'The 48V page carries search links for 12V batteries and conventional starters without exact fitment proof.' },
      { code: 'all-grand-cherokee-l-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS).sort(), detail: 'Every frozen Grand Cherokee L record remains published and byte-for-byte unchanged.' },
    ],
    pdfSources: PDF_SOURCES,
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor };
