/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-tribute-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['TRIBUTE', 'MAZDA TRIBUTE']);
const SEARCH_TERMS = Object.freeze([
  'REAR DIFFERENTIAL TEMPERATURE SENSOR',
  'DIAGNOSTIC TIPS FOR TROUBLESHOOTING COIL-ON-PLUG MISFIRE CONCERNS',
  'CD4E AUTOMATIC TRANSMISSION - FLUID LEAK FROM TRANSMISSION COOLER',
  'AUTOMATIC TRANSMISSION REGULATOR SOLENOID VALVE BORE WEAR',
  'Automatic Transmission/Transaxle Cooler and Lines Flushing Procedure',
]);
const IDS = Object.freeze({
  coil: 'mazda-tribute-coil-pack',
  transmission: 'mazda-tribute-escape-trans',
  differential: 'mazda-tribute-rear-differential',
  corrosion: 'mazda-tribute-rear-subframe-rust-2001',
  transferSeal: 'mazda-tribute-transfer-case-leak-2001',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([]);
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.coil, IDS.transmission, IDS.differential].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['614102', '10009915', '10025755', '10034065', '10206002']);
const CAMPAIGNS = Object.freeze([
  '00V210002', '00V223002', '00V260002', '00V277002', '00V323000',
  '00V387001', '03V515000', '04V175000', '04V583000', '04V605000',
  '05V525000', '06V116000', '07E023000', '07V157000', '12V016000',
  '12V357000', '14V174000', '14V282000', '14V552000', '15E045000',
  '15V677000', '16V788000',
]);
const PDF_SOURCES = Object.freeze({});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
  corrosionCampaign: {
    title: 'NHTSA Campaign 14V174000: 2001-2004 Tribute lower-control-arm attachment corrosion',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V174000',
  },
  remanTransmissionCampaign: {
    title: 'NHTSA Campaign 15V677000: four 2008 Tributes with specified remanufactured transmissions',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=15V677000',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: {
    '1995-1999': 0,
    '2000-2004': 81,
    '2005-2009': 48,
    '2010-2014': 30,
    '2015-2019': 80,
    '2020-2024': 40,
    '2025-2026': 2,
  },
  totalRows: 281,
  searchTerms: SEARCH_TERMS,
  relevantRowCount: 5,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 28, post: 37 },
  totalRows: 65,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function claim(description, solution, symptoms, identityConflict, evidence, summary, sources = ['datasets']) {
  return { description, solution, symptoms, identityConflict, evidence, summary, sources };
}
const CONTENT = Object.freeze({
  [IDS.coil]: claim(
    'Communication 10009915 provides diagnostic tips for coil-on-plug misfire concerns on 2001-2006 Tribute vehicles. It does not establish cracked or arcing 3.0L coils as a recurring 2001-2011 defect, that coils usually fail one at a time, the stored 200-owner total, or proactive replacement of every coil and plug.',
    'Preserve misfire codes and freeze-frame data and test plugs, coil output, power, grounds, injector operation, intake leaks and compression before replacement. Confirm engine and cylinder-specific fitment. Do not buy an ignition coil, six spark plugs or a complete coil set from this page; the failed circuit and fitment have not been established.',
    ['misfire requiring code-guided diagnosis', 'coil output outside specification', 'cracked insulation or arcing confirmed during inspection'],
    'The title and 2001-2011 range assert ignition-coil failure while the exact communication is diagnostic guidance limited to 2001-2006.',
    ['Communication 10009915 establishes coil-on-plug misfire diagnostic tips for 2001-2006, not the frozen prevalence, mechanism or 200-owner total.'],
    'Proposed the unsupported 200-owner total as zero and removed proactive coil/plug replacement and assumed cracking claims.'
  ),
  [IDS.transmission]: claim(
    'The exact Tribute corpus separates several narrow conditions: 2008 CD4E cooler leakage (10025755), 2009-2010 regulator-solenoid-valve bore wear (10034065), and cooler-line flushing after an established transmission failure (10206002). Campaign 15V677000 covers only four 2008 vehicles fitted with remanufactured transmissions rebuilt during a specified 2015 window and a loose shift-lever bolt. None establishes generic 2001-2008 CD4E premature failure, internal clutch/servo-bore wear, or the stored 350-owner total.',
    'Document the exact shift or drive concern, identify the installed transmission, check codes and fluid condition, and measure controls and pressure before authorizing repair. If replacing a failed transmission, follow the exact cooler/line flushing procedure. Check the VIN and repair-part history for campaign 15V677000. Do not buy a servo-bore kit, fluid, rebuild or remanufactured transmission from this page; cause, campaign scope and fitment have not been established.',
    ['loss of drive, slip or harsh shift requiring measured diagnosis', 'cooler leak confirmed on an applicable 2008 CD4E', 'campaign 15V677000 applicability confirmed by VIN and repair-part history'],
    'The title asserts broad CD4E failure across 2001-2008 while official records establish distinct year-, component- and repair-history-specific conditions.',
    ['Communications 10025755, 10034065 and 10206002 are narrower than the frozen identity; campaign 15V677000 covers four specified remanufactured-transmission installations.'],
    'Proposed the unsupported 350-owner total as zero and separated exact cooler, bore-wear, flushing and remanufactured-unit evidence.',
    ['datasets', 'remanTransmissionCampaign']
  ),
  [IDS.differential]: claim(
    'Communication 614102 gives brief information about the rear-differential temperature sensor only on 2001 Tribute 3.0L AWD vehicles. It does not establish rear-differential vibration or whine across 2001-2011, power-transfer-unit fluid breakdown, bearing wear, a 30,000-mile interval, or the stored 180-owner total. The frozen body also conflates the front power-transfer unit with the rear differential.',
    'Reproduce the noise or vibration and inspect tires, wheel bearings, driveshaft, joints, power-transfer unit, rear drive unit, mounts and fluid condition independently. Use only the exact specified fluid and interval for the identified unit. Do not buy differential fluid, PTU fluid, bearings or a differential from this page; the source, unit and fitment have not been established.',
    ['driveline vibration requiring source isolation', 'whine that changes with speed or load', 'rear-drive-unit or power-transfer-unit fault confirmed by inspection'],
    'The title asserts rear-differential failure while the only exact communication is a 2001 3.0L AWD temperature-sensor notice and the body conflates separate driveline units.',
    ['Communication 614102 is limited to the 2001 3.0L AWD rear-differential temperature sensor.'],
    'Proposed the unsupported 180-owner total as zero and removed PTU/differential conflation, interval and preventive claims.'
  ),
  [IDS.corrosion]: claim(
    'Campaign 14V174000 covers certain 2001-2004 Tribute vehicles in specified salt states with excessive corrosion at the forward attachment of the lower control arm. Separation could cause significant loss of steering control; dealers installed a newly designed reinforcement cross-brace. It is not campaign 14V-440 and does not establish 2001-2011 rear-subframe corrosion, premature control-arm-bushing failure, alignment shift or a dealer corrosion-treatment/subframe-replacement remedy.',
    'Treat structural corrosion or steering instability as urgent and stop driving if attachment integrity is uncertain. Check the VIN for campaign 14V174000 and have the exact lower-control-arm attachment inspected. Do not buy bushings, a subframe, corrosion treatment or alignment service from this page; campaign applicability, structural condition and fitment have not been established.',
    ['visible corrosion at a control-arm attachment', 'steering instability requiring immediate structural inspection', 'open or incomplete campaign 14V174000 identified by VIN'],
    'The title says rear subframe and bushing failure across 2001-2011, while the exact recall is a 2001-2004 salt-state forward lower-control-arm attachment condition.',
    ['Campaign 14V174000 directly establishes the salt-state scope, forward lower-control-arm attachment corrosion, steering risk and reinforcement cross-brace remedy.'],
    'Corrected the campaign identity and bounded years, geography, location and remedy while holding the overbroad indexed title.',
    ['datasets', 'corrosionCampaign']
  ),
  [IDS.transferSeal]: claim(
    'The reviewed 281-communication and 65-recall-row Tribute corpus does not establish recurring 2001-2011 AWD transfer-case output-seal leakage onto the exhaust, a 60,000-100,000-mile failure window, bearing damage, or the frozen Motorcraft XY-75W140-QL fluid prescription. No exact Mazda source supports the fabricated video identifier.',
    'Identify the actual leaking unit and fluid, clean and trace the leak, verify level and inspect the driveshaft, vent, seals and bearings using the exact workshop procedure. Avoid exhaust contact and do not drive a unit that is low on lubricant. Do not buy an output seal, fluid or rebuilt transfer unit from this page; the leak source, specification and fitment have not been established.',
    ['driveline-fluid leak requiring source identification', 'burning odor requiring immediate leak/exhaust inspection', 'low lubricant level or bearing noise confirmed at the identified unit'],
    'The title asserts an AWD output-seal failure across 2001-2011 without exact Mazda evidence and the body supplies unsupported mileage, fluid and cost claims.',
    ['No matching communication or campaign establishes the frozen transfer-case output-seal identity.'],
    'Removed the fabricated video, unsupported mileage, fluid, price and automatic seal/rebuild advice and held the identity.'
  ),
});

function contentFor(id) { const content = CONTENT[id]; if (!content) throw new Error(`Unexpected Tribute row ${id}`); return content; }
function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) { return contentFor(id).sources.map((key) => citation(OTHER_SOURCES[key])); }
function commerceDecisionFor(id) {
  const noun = {
    [IDS.coil]: 'identify the failed ignition circuit and engine fitment first',
    [IDS.transmission]: 'identify the exact transmission fault, campaign scope and fitment first',
    [IDS.differential]: 'isolate the noise to the exact driveline unit first',
    [IDS.corrosion]: 'verify campaign scope and structural attachment condition first',
    [IDS.transferSeal]: 'trace the leak and verify the exact unit and fluid specification first',
  };
  return `No universal retail part; ${noun[id]}.`;
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Tribute').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 5) throw new Error(`Expected 5 frozen Tribute rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    return {
      id: row.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true,
      identityConflict: content.identityConflict,
      reason: content.summary,
      evidence: { primaryEvidence: content.evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' },
      commerceDecision: commerceDecisionFor(row.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: 'Tribute',
    completionStatement: 'All 5 frozen Tribute pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All five identities materially exceed exact primary evidence; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 5 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 200-, 350- and 180-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Campaign 14V174000 is not relabeled as 14V-440 or generalized beyond its exact years, geography, attachment location and cross-brace remedy.',
      'Campaign 15V677000 is not generalized beyond its four specified 2008 remanufactured-transmission installations.',
      'Every selected PDF page was rendered and visually inspected; this Tribute packet selects no PDFs.',
      'Every named replaceable item has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'tribute-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'All five pages exceed exact evidence; every indexed page remains published pending review.' },
      { code: 'tribute-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 200-, 350- and 180-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'tribute-corrosion-campaign-corrected', severity: 'identity-conflict', recordIds: [IDS.corrosion], detail: 'The exact campaign is 14V174000 for a 2001-2004 salt-state forward lower-control-arm attachment condition, not 14V-440 or a generic rear-subframe/bushing condition.' },
      { code: 'tribute-transmission-records-separated', severity: 'identity-conflict', recordIds: [IDS.transmission], detail: 'Distinct cooler leak, 2009-2010 bore-wear, post-failure flushing and four-vehicle reman-unit records do not establish the broad CD4E identity.' },
      { code: 'tribute-driveline-units-separated', severity: 'identity-conflict', recordIds: [IDS.differential, IDS.transferSeal], detail: 'The rear differential, power-transfer unit and transfer-case terminology is not treated as interchangeable.' },
      { code: 'all-tribute-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Tribute page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {},
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 5 },
    rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, proposalFor };
