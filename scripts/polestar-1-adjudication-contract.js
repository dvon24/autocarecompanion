/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ charging: 'polestar-1-charging-issues' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);
const content = Object.freeze({
  [ids.charging]: Object.freeze({
    description: 'The frozen page has no citation and labels charging refusal, interrupted sessions and an incorrect displayed rate across every 2019-2021 Polestar 1 as documented on-board-charger faults. It also states that parts delays are documented and quotes a $2,500-$4,500 replacement before labor. Polestar\'s manual instead treats a charging error as a condition requiring connection and cable checks followed by support; supply, outlet/EVSE, ground fault, cable temperature, connector lock, scheduling, ambient or battery temperature, 12-volt supply, software, wiring, high-voltage interlock and the OBC remain separate paths. The complete reviewed NHTSA corpus contains 64 Polestar 1 communication rows and eight flat recall rows, but does not establish the indexed OBC-failure population.',
    solution: 'Stop charging and disconnect according to the manual if there is heat, damage, odor, arcing or a persistent red/critical indication. Record the vehicle, inlet, cable and EVSE indicators and displayed message; verify the supply, connector seating and an approved compatible cable/EVSE before qualified diagnostics retrieve charging-system DTCs and test the 12-volt, communication, interlock and high-voltage paths. High-voltage repair belongs with trained service personnel. Do not buy an OBC, charge cable, inlet or control module from this page; the failed path, part number, software and VIN fitment must be established first.',
    symptoms: ['charging indicators and messages recorded', 'supply, cable, inlet and vehicle paths separated', 'high-voltage diagnosis assigned to qualified service'],
    affectedSystems: ['AC supply, EVSE and charging cable', 'charge inlet, lock and communications', '12-volt supply, high-voltage interlock and on-board charger'],
    evidence: ['Polestar\'s manual documents charging-error indicators and connection/cable checks, not a Polestar 1-wide OBC defect.', 'The complete NHTSA corpus contains 64 Polestar 1 communication rows and 8 flat recall rows but no exact OBC-failure campaign for this identity.', 'The frozen parts-delay, OBC population and $2,500-$4,500 replacement claims have no cited first-party source.'],
    conflict: 'The indexed identity converts several charging symptoms into a three-year OBC-failure population and adds unsupported service exclusivity, lead-time and cost claims.',
    summary: 'Held the unsupported Polestar 1 OBC identity and replaced parts-first advice with indicator-led charging and high-voltage diagnosis.',
    citations: ['chargingManual', 'support', 'datasets'],
    commerceDecision: 'charging source, cable, inlet, software, electrical failure path, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  chargingManual: { title: 'Polestar 1 Charging Status in the Charging Cable Control Module', type: 'manufacturer', url: 'https://www.polestar.com/us/manual/polestar-1/2021/article/8438e5238a14eef5c0a801516aa1918b' },
  support: { title: 'Polestar 1 Support', type: 'manufacturer', url: 'https://www.polestar.com/us/support/polestar-1/' },
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
});
module.exports = Object.freeze({
  make: 'Polestar', model: 'Polestar 1', slug: 'polestar-1', reviewDate: '2026-08-10', snapshotFile: 'data/_polestar-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-polestar-1-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['POLESTAR'], modelAliases: ['POLESTAR 1', 'PS1'], searchTerms: ['charging', 'on-board charger', 'OBC', 'AC charge', 'charge rate'], relevantDocumentIds: [], campaigns: ['21V683000', '22V926000', '23V361000', '24V835000'], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 61, '2025-2026': 3 }, totalRows: 64, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains 64 exact POLESTAR 1 rows; none establishes the frozen three-year OBC-failure identity.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 8 }, totalRows: 8, campaignCount: 4, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'Eight flat recall rows represent four unique Polestar 1 campaigns: seat-belt retractors, superseded high-voltage battery campaigns and brake-pedal attachment; none is an OBC-failure campaign.' },
  content,
  requiredProse: [
    { id: ids.charging, field: 'description', patterns: ['no citation', '64 Polestar 1 communication rows', '\\$2,500-\\$4,500'] },
    { id: ids.charging, field: 'solution', patterns: ['persistent red/critical indication', 'Do not buy an OBC'] },
  ],
  observations: [
    { code: 'identity-held', severity: 'identity-safety', recordIds: allIds, detail: 'The Polestar 1 page remains published and held.' },
    { code: 'frozen-row-uncited', severity: 'source-integrity', recordIds: allIds, detail: 'The live page carries no citation.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 64 exact Polestar 1 NHTSA communications were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All eight flat rows/four unique Polestar 1 campaigns were reconciled.' },
    { code: 'obc-population-unverified', severity: 'source-integrity', recordIds: allIds, detail: 'No exact campaign proves the indexed OBC-failure population.' },
    { code: 'charging-paths-separated', severity: 'technical-accuracy', recordIds: allIds, detail: 'Supply, cable, inlet, software, low-voltage, interlock and OBC paths remain separate.' },
    { code: 'manual-indicator-flow', severity: 'technical-accuracy', recordIds: allIds, detail: 'Manufacturer indicator and connection guidance replaces OBC-first diagnosis.' },
    { code: 'high-voltage-boundary', severity: 'safety-accuracy', recordIds: allIds, detail: 'High-voltage repair is assigned to trained personnel.' },
    { code: 'heat-arcing-stop-boundary', severity: 'safety-accuracy', recordIds: allIds, detail: 'Heat, damage, odor, arcing or persistent critical indication stops charging.' },
    { code: 'service-exclusivity-unverified', severity: 'source-integrity', recordIds: allIds, detail: 'The frozen “only option” service claim is not retained.' },
    { code: 'cost-and-lead-time-unverified', severity: 'source-integrity', recordIds: allIds, detail: 'Replacement cost and weeks-long parts claims are unsupported.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No OBC, cable, inlet, service or other commerce is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'The existing unknown count never renders as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, category, severity, status and routing remain frozen.' },
  ],
});
