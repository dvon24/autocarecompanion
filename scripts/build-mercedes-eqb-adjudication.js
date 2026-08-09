/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-eqb-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['EQB', 'EQB 250', 'EQB250', 'EQB 300', 'EQB300', 'EQB 350', 'EQB350', 'EQB 250+', 'EQB 300 4MATIC', 'EQB 350 4MATIC']);
const SEARCH_TERMS = Object.freeze(['brake', 'regenerative', 'regen', 'MBUX', 'infotainment', 'display', 'screen', 'navigation', 'range', 'EPA', 'state of charge', 'software', 'OTA', 'powertrain']);
const IDS = Object.freeze({
  brakes: 'mercedes-eqb-brake-pedal-regen-inconsistency-2022',
  infotainment: 'mercedes-eqb-infotainment-lag-crash-2022',
  range: 'mercedes-eqb-range-below-rated-2022',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10248203', '10251122', '10253703', '11024405', '11029023']);
const CAMPAIGNS = Object.freeze(['23V677000', '24V331000', '25V050000', '25V487000', '25V894000', '26V073000']);
const PDF_SOURCES = Object.freeze({});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 171, '2025-2026': 332 }, totalRows: 503, relevantRowCount: 288, uniqueRelevantCommunications: 92, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 111 }, totalRows: 111, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const CONTENT = Object.freeze({
  [IDS.brakes]: {
    description: 'Mercedes communication 11029023 describes a normal hydraulic-brake noise when regenerative settings are active and high-voltage battery state of charge exceeds 80%; communication 11024405 separately describes normal low-speed groan under light brake pressure. Neither record establishes the frozen dead-zone, spongy-then-grabbing pedal, battery-level-dependent loss of braking force or a brake-blending software defect across every 2022-2025 EQB trim.',
    solution: 'Document the exact pedal travel, deceleration, battery state of charge, regeneration setting, speed, warnings and fault codes. If braking force or pedal response is abnormal, stop driving and obtain a qualified brake-system diagnosis; normal noises described in 11029023 or 11024405 do not prove the frozen pedal condition. Do not buy brake, regeneration or hydraulic parts from this page; no failed component or universal retail part is established.',
    symptoms: ['pedal response and deceleration documented separately from noise', 'battery state of charge and regeneration setting recorded', 'warnings and brake-system fault codes preserved'], affectedSystems: ['service brakes', 'regenerative braking'],
    conflict: 'Exact communications address normal noises, not the frozen pedal-response identity or universal software remedy.', evidence: ['Communication 11029023 says high-SOC hydraulic noise under regeneration is normal with no parts or action required.', 'Communication 11024405 says light-pressure low-speed groan is normal frictional vibration and parts exchange will not rectify it.'], summary: 'Separated normal EQB braking noises from the unsupported pedal-response and software-defect identity.',
  },
  [IDS.infotainment]: {
    description: 'Mercedes campaigns do support specific EQB MBUX software conditions: communication 10251122 covers a radio-inoperative condition on certain 2024-2025 vehicles, while 10248203 and 10253703 describe OTA robustness and navigation-service improvements on narrower populations. They do not establish frequent 2-5-second touchscreen lag, spontaneous black-screen reboots, voice-assistant failure and load-related crashes across every 2022-2025 EQB trim.',
    solution: 'Record the exact affected function, software version, time and conditions, preserve fault logs, and check the VIN for an applicable MBUX service campaign or OTA release. Follow the symptom-specific Mercedes diagnostic path. Do not buy or replace a head unit, screen, amplifier or telematics module from this page; the failed path and universal retail part are not established.',
    symptoms: ['exact affected MBUX function recorded', 'software version and fault data preserved', 'VIN campaign status checked before hardware replacement'], affectedSystems: ['MBUX infotainment', 'head-unit software'],
    conflict: 'Exact campaigns support narrower radio, navigation and robustness updates, not the frozen frequent-lag/crash symptom bundle and full scope.', evidence: ['Communication 10251122 identifies radio inoperative on certain 2024-2025 platform-243 vehicles and dealer software update.', 'Communications 10248203 and 10253703 describe narrower OTA robustness and navigation-service improvements, not the frozen complete symptom set.'], summary: 'Bound exact EQB MBUX campaigns and removed unsupported crash-frequency and reset claims.',
  },
  [IDS.range]: {
    description: 'The frozen page claims owners consistently receive 20-30% less than a 243-mile EPA rating across every 2022-2025 EQB 250+, EQB 300 4MATIC and EQB 350 4MATIC. The reviewed 503-row manufacturer corpus and six-campaign recall inventory do not establish that population, percentage, common rated range, cause or a Mercedes efficiency update. Range varies with model year, trim, speed, temperature, climate use, tire condition, load and battery state.',
    solution: 'Compare the exact VIN and model-year rating with measured energy use over a controlled route, record temperature, speed, climate use, tire pressures, load and battery state, and obtain battery diagnostics if range changes abruptly or warnings appear. Follow the tire-pressure label rather than a universal 42-PSI instruction. Do not buy a battery, tires or powertrain component from this page; no failed component or universal retail part is established.',
    symptoms: ['VIN-specific rated range identified', 'energy use measured with driving conditions recorded', 'abrupt change or battery warnings diagnosed separately'], affectedSystems: ['high-voltage battery', 'vehicle energy consumption'],
    conflict: 'No exact reviewed primary record supports the frozen 20-30% shortfall, common 243-mile rating, causes or universal 42-PSI instruction.', evidence: ['No communication among 503 EQB manufacturer rows establishes the frozen percentage or owner frequency.', 'None of the six EQB recall campaigns concerns a general EPA-range shortfall identity.'], summary: 'Removed unsupported range percentage, owner-frequency, common-rating and universal tire-pressure claims.',
  },
});
function citationsFor() { return [{ url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type, title: OTHER_SOURCES.datasets.title }]; }
function commerceDecisionFor(id) { return {
  [IDS.brakes]: 'pedal condition and cause are unresolved; no universal retail part',
  [IDS.infotainment]: 'software condition and failed path are unresolved; no universal retail part',
  [IDS.range]: 'range conditions and any failed component are unresolved; no universal retail part',
}[id]; }
function proposalFor(before, id) { const content = CONTENT[id]; return { ...clone(before), description: content.description, solution: content.solution, confidence: 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary }; }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'EQB').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 3 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen EQB coverage does not match the 3-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'EQB',
    completionStatement: 'All 3 frozen EQB pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All three identities materially exceed exact evidence or contain scope and frequency conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 3 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 510-, 720- and 890-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'No PDF was selected for these three verdicts; exact dataset rows and frozen source-file hashes are the primary evidence.',
      'Every named replaceable item has an explicit no-universal-retail-part or diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'eqb-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen EQB identity exceeds exact primary evidence or contains a scope/frequency conflict; all remain indexed pending review.' },
      { code: 'eqb-brake-noise-is-not-pedal-defect', severity: 'identity-conflict', recordIds: [IDS.brakes], detail: 'Exact communications describe normal high-SOC hydraulic or light-pressure frictional noise, not the frozen dead-zone/grab identity.' },
      { code: 'eqb-mbux-campaigns-narrower', severity: 'identity-conflict', recordIds: [IDS.infotainment], detail: 'Exact campaigns support narrower radio, navigation and robustness conditions, not the full frozen lag/crash bundle.' },
      { code: 'eqb-range-claim-unsupported', severity: 'identity-conflict', recordIds: [IDS.range], detail: 'No exact reviewed primary record supports the 20-30% shortfall, common 243-mile rating or universal 42-PSI guidance.' },
      { code: 'eqb-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'All three positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-eqb-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No EQB page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 3, total: 3 }, rows,
  };
}
if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
