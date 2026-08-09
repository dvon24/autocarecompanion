/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-e-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['E', 'E CLASS', 'E-CLASS', 'E300', 'E 300', 'E320', 'E 320', 'E350', 'E 350', 'E400', 'E 400', 'E450', 'E 450', 'E500', 'E 500', 'E550', 'E 550', 'E53 AMG', 'E 53 AMG', 'AMG E53', 'AMG E 53', 'E63 AMG', 'E 63 AMG', 'AMG E63', 'AMG E 63', 'E320 CDI', 'E 320 CDI', 'E350 BLUETEC', 'E 350 BLUETEC']);
const SEARCH_TERMS = Object.freeze(['48V', 'starter-generator', 'ISG', 'DC/DC', 'fuel pump', 'delivery module', 'low pressure fuel', 'MBUX', 'instrument cluster', 'rearview camera', 'conductor plate', '722.9', 'AIRMATIC', 'air suspension', 'COMAND', 'crankshaft position', 'LI05.10-P-056117', 'balance shaft', 'M272', 'oil cooler', 'OM642']);
const IDS = Object.freeze({
  hybrid48v: 'mercedes-benz-e-class-48v-integrated-starter-generator--2021',
  fuelPump: 'mercedes-benz-e-class-fuel-pump-delivery-module-2021',
  mbux: 'mercedes-benz-e-class-mbux-instrument-cluster-2021',
  conductorPlate: 'mercedes-e-class-7g-conductor-plate-2003',
  airmatic: 'mercedes-e-class-air-suspension-w212-2010',
  comand: 'mercedes-e-class-comand-infotainment-freeze-2010',
  crankSensor: 'mercedes-e-class-crankshaft-position-sensor-2010',
  balanceShaft: 'mercedes-e-class-m272-balance-shaft-2005',
  oilCooler: 'mercedes-e-class-om642-oil-cooler-leak-2007',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.comand]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.conductorPlate, IDS.airmatic, IDS.comand, IDS.crankSensor, IDS.balanceShaft, IDS.oilCooler].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10043810', '10166980', '10189404', '10205237', '10208671', '11010818', '11023193', '11031629']);
const CAMPAIGNS = Object.freeze(['00V388000', '01I005000', '03V289000', '03V534000', '04V296000', '05V133000', '08V006000', '08V303000', '09E012000', '10V459000', '10V540000', '11V213000', '11V496000', '12V264000', '12V492000', '12V557000', '14V818000', '15V088000', '15V505000', '15V792000', '16V081000', '16V363000', '16V758000', '16V831000', '16V899000', '17V017000', '17V076000', '17V078000', '17V080000', '17V114000', '17V176000', '17V177000', '17V241000', '17V245000', '17V246000', '17V574000', '17V627000', '17V714000', '18V043000', '18V151000', '18V207000', '18V271000', '18V513000', '18V515000', '18V725000', '18V761000', '18V839000', '18V849000', '18V850000', '18V872000', '19V010000', '19V130000', '19V540000', '19V676000', '19V787000', '19V788000', '19V868000', '19V918000', '20V048000', '20V068000', '20V228000', '20V328000', '20V364000', '20V449000', '20V673000', '21V058000', '21V072000', '21V196000', '21V216000', '21V228000', '21V230000', '21V354000', '21V406000', '21V483000', '21V527000', '21V638000', '21V961000', '22V168000', '22V189000', '22V232000', '22V365000', '22V533000', '22V733000', '22V954000', '23V445000', '23V574000', '23V880000', '24V100000', '24V115000', '24V224000', '24V445000', '24V688000', '24V874000', '24V941000', '25V023000', '25V240000', '26V281000', '95V031000', '96V058000', '98V256000']);

const PDF_SOURCES = Object.freeze({
  hybrid48vBulletin: {
    title: 'Mercedes-Benz XENTRY LI54.10-P-069698: functional impairment of the 48V system on model series 213/238 and related platforms',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10189404-9999.pdf', localPath: 'C:/tmp/mercedes-e-class-sources/10189404.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 49427, sha256: '14a5007ddd810ccb9e99b549b9f209d5c6d1781fd5dd09262b7d2ebf0df424c2',
  },
  fuelPumpRecall: {
    title: 'Mercedes-Benz recall 23V445 / campaign 2023070012: fuel-pump impeller deformation and dealer replacement',
    type: 'government', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCMN-23V445-9154.pdf', localPath: 'C:/tmp/mercedes-e-class-sources/23V445.pdf',
    pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 552173, sha256: '6221ee543687fb3b3b9ee6c7b293cd04c33c2d073e2443da17eb8e29e88124b3',
  },
  mbuxCampaign: {
    title: 'Mercedes-Benz campaign 2022010008: 2021-2022 platform-213/238 MBUX navigation software update',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10208671-0001.pdf', localPath: 'C:/tmp/mercedes-e-class-sources/10208671.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 401048, sha256: 'ccc94be7fae84c8725fd805b7d730b9448ee067aaaa159ab356f395bd10e206d',
  },
  comandBulletin: {
    title: 'Mercedes-Benz LI82.85-P-055695: COMAND no-start/dark condition and software remedy on model series 212',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10205237-9999.pdf', localPath: 'C:/tmp/mercedes-e-class-sources/10205237.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 42155, sha256: '1ef55a29178823f18d6c0b1c3d2843787884ba646e8c7b07ac709b91d3e6ad50',
  },
  balanceShaftWarranty: {
    title: 'Mercedes-Benz balance-shaft and idle-gear warranty extension: qualifying 2005-2007 M272/M273 vehicles',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031629-0001.pdf', localPath: 'C:/tmp/mercedes-e-class-sources/11031629.pdf',
    pages: 2, visualPages: [1, 2], bytes: 179319, sha256: '0b90bafb76f147b9d89be9693d97dfe68dbafd0e9b88f1f47595207299b97670',
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS, periodCounts: { '1995-1999': 23, '2000-2004': 32, '2005-2009': 204, '2010-2014': 576, '2015-2019': 273, '2020-2024': 1390, '2025-2026': 1120 }, totalRows: 3618, relevantRowCount: 710, uniqueRelevantCommunications: 192, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 31, post: 3988 }, totalRows: 4019, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

const CONTENT = Object.freeze({
  [IDS.hybrid48v]: {
    description: 'XENTRY LI54.10-P-069698 directly includes model series 213 and 238 with code B01, but it separates software-related no-starts, a 48V-battery condition, hardware short circuits, cable or connection faults and cause-specific component tests. It does not establish one recurring integrated-starter-generator/DC-DC hardware failure across every frozen 2021-2023 E450 and E53 AMG or validate one universal replacement.',
    solution: 'Preserve the exact warning sequence and 12V/48V quick-test data, identify the applicable cause in LI54.10-P-069698 and complete the specified software, cable, connection and component tests. Do not buy an ISG, DC/DC converter, 48V battery or cable from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['exact 48V warning and no-start sequence recorded', 'complete 12V and 48V quick-test data preserved', 'software, cables and connections checked before hardware replacement'], affectedSystems: ['48V electrical system', 'energy management'],
    conflict: 'The exact bulletin proves multiple cause-specific 48V conditions, not the frozen single ISG/DC-DC hardware-failure identity and full scope.', evidence: ['All five rendered pages list model series 213/238 and distinguish software, battery, short-circuit and connection causes.', 'The bulletin requires cause-matched remedies and testing instead of universal ISG or converter replacement.'], summary: 'Separated exact 48V conditions from the unsupported universal ISG/DC-DC hardware identity.', sources: ['hybrid48vBulletin', 'datasets'],
  },
  [IDS.fuelPump]: {
    description: 'Recall 23V445 and campaign 2023070012 directly cover certain 2021-2023 E-Class platform 213/238 vehicles whose fuel-pump impeller may deform, contact the housing and stop the pump. The official sequence can include warning messages, rough running and loss of propulsion. It does not establish the frozen 2024 scope, every listed engine, or a separate delivery-module electronics failure.',
    solution: 'Check the VIN for campaign 2023070012. An authorized Mercedes-Benz dealer replaces the fuel-pump module under the recall where applicable. Do not buy a fuel pump or delivery module from this page; recall eligibility and the exact VIN-specific module are not established here.',
    symptoms: ['VIN recall status checked', 'warning and rough-running sequence documented', 'fuel delivery diagnosed when recall is not applicable'], affectedSystems: ['low-pressure fuel supply', 'fuel-pump module'],
    conflict: 'The exact recall supports a 2021-2023 impeller-deformation condition, not the frozen 2021-2024 delivery-module identity and full engine scope.', evidence: ['All eight rendered recall pages identify the impeller mechanism, affected 2021-2023 platform 213/238 vehicles and dealer module replacement.', 'The VIN-specific part table does not authorize a universal retail part.'], summary: 'Bound the fuel-pump issue to exact recall scope and dealer remedy.', sources: ['fuelPumpRecall', 'datasets'],
  },
  [IDS.mbux]: {
    description: 'Mercedes campaign 2022010008 directly includes 2021-2022 E-Class platforms 213 and 238, but its condition is narrowly that MBUX navigation may be unavailable because control-unit software is not at the latest production configuration. It does not establish the frozen 2021-2024 bundle of instrument-cluster black screens, rebooting and rear-camera failure.',
    solution: 'Preserve the exact affected display, navigation or camera symptom, fault logs and software versions, and check the VIN for applicable campaigns. Follow the symptom-specific XENTRY procedure before hardware decisions. Do not buy a display, MBUX unit, cluster, camera or cable from this page; the failed path and VIN fitment are unresolved.',
    symptoms: ['affected display or camera path identified', 'fault logs and software versions preserved', 'VIN campaign status checked before hardware replacement'], affectedSystems: ['MBUX infotainment', 'instrument cluster and display network', 'rearview display path'],
    conflict: 'The exact campaign supports only 2021-2022 navigation-software unavailability, not the frozen 2021-2024 cross-system identity.', evidence: ['All four rendered campaign pages identify navigation availability and an MBUX software update.', 'The campaign does not identify cluster black screens or rear-camera failure.'], summary: 'Narrowed exact MBUX evidence to navigation software and held the broader cluster/camera identity.', sources: ['mbuxCampaign', 'datasets'],
  },
  [IDS.conductorPlate]: {
    description: 'The frozen page turns varied 722.9 shift and communication symptoms into universal conductor-plate failure. Mercedes communications 11010818 and 11023193 instead require electrical, connector and communication checks when VGS is absent from the quick test before an electrohydraulic controller is considered. They do not establish the frozen 2003-2012 population, simultaneous valve-body failure or the 2,400-owner claim.',
    solution: 'Confirm the installed transmission, preserve the quick test and VGS data, inspect power, wiring, connectors and fluid condition, and follow the exact XENTRY path. Do not buy a conductor plate, valve body, solenoid or transmission kit from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['installed transmission confirmed by VIN', 'quick test and VGS data preserved', 'power, wiring and connectors checked before replacement'], affectedSystems: ['722.9 transmission controls', 'electrohydraulic controller'],
    conflict: 'Exact Mercedes records are narrow no-communication diagnostics, not proof of the frozen universal conductor-plate identity.', evidence: ['Communications 11010818 and 11023193 require electrical and connector checks before component replacement.'], summary: 'Replaced universal conductor-plate claims with exact diagnostic boundaries and proposed the unsupported owner total as zero.', sources: ['datasets'],
  },
  [IDS.airmatic]: {
    description: 'Mercedes communication 10043810 establishes that an AIRMATIC malfunction can result from a leaking system rather than a faulty compressor. The reviewed corpus also contains other sensor, cable and control causes. It does not establish the frozen 2010-2016 W212 pattern of universal air-spring and compressor failure, replacement of multiple corners, or stored Arnott fitment across E350, E550 and E63 AMG.',
    solution: 'Measure ride height and pressure loss, isolate the leaking corner or circuit, test compressor output and duty cycle, and inspect lines, valve block, sensors, wiring and relay. Do not buy an air spring, strut, compressor, relay or valve block from this page; the failed component and exact fitment are unresolved.',
    symptoms: ['ride-height loss measured by corner', 'leak isolated before compressor replacement', 'sensor, wiring and compressor operation tested'], affectedSystems: ['AIRMATIC suspension', 'air supply and ride-height control'],
    conflict: 'Exact communications support multiple AIRMATIC causes, not the frozen universal air-spring/compressor identity or stored retail fitment.', evidence: ['Communication 10043810 explicitly distinguishes a leaking system from a faulty compressor.'], summary: 'Separated exact AIRMATIC diagnostic causes, removed unverified commerce and proposed the unsupported owner total as zero.', sources: ['datasets'],
  },
  [IDS.comand]: {
    description: 'Mercedes LI82.85-P-055695 directly includes model series 212 and describes a COMAND unit that does not start, remains dark or cannot be operated because of software. It directs a temporary circuit-30 interruption followed by a software update and says not to replace the COMAND unit. This supports the frozen general freeze identity but not the stored hard-drive-failure mechanism, reset-button shortcut or refurbished-unit recommendation.',
    solution: 'Record the exact COMAND symptom and software version and follow LI82.85-P-055695: a qualified technician may perform the specified circuit-30 interruption and software update. Do not buy or replace the COMAND unit, hard drive or display from this page; the bulletin specifically directs software repair rather than unit replacement.',
    symptoms: ['COMAND dark or unresponsive condition reproduced', 'software version and fault data recorded', 'bulletin software procedure completed before replacement'], affectedSystems: ['COMAND infotainment', 'head-unit software'],
    conflict: null, evidence: ['All three rendered pages of LI82.85-P-055695 include model 212, identify a software cause and explicitly say not to replace the COMAND unit.'], summary: 'Retained the supported COMAND freeze identity while removing unsupported hardware and commerce claims.', sources: ['comandBulletin', 'datasets'],
  },
  [IDS.crankSensor]: {
    description: 'The frozen page asserts heat- and oil-driven crankshaft-position-sensor failure across 2010-2018 E350, E400 and E550 vehicles, recommends Bosch 0261210302 and lists M276/M274 engines despite the E550 trim. The reviewed 3,618-row manufacturer corpus does not establish that full pattern, proactive replacement or universal fitment; the stored LI05.10-P-056117 reference was not available as an exact reviewed primary document.',
    solution: 'Preserve stall/no-start fault data, verify engine speed and crank/cam synchronization while cranking, and test sensor power, ground, signal and wiring using the engine- and VIN-specific procedure. Do not buy Bosch 0261210302 or proactively replace a crankshaft-position sensor from this page; failure, engine scope and fitment are unresolved.',
    symptoms: ['stall or no-start event documented', 'engine-speed and synchronization data checked', 'sensor circuit and wiring tested before replacement'], affectedSystems: ['engine position sensing', 'engine management'],
    conflict: 'No exact reviewed primary record supports the frozen mechanism, full scope or Bosch fitment; the trim and engine metadata also conflict.', evidence: ['No exact LI05.10-P-056117 document or equivalent E-Class failure record appears in the reviewed corpus.', 'The frozen E550 trim does not align with the stored M276/M274-only engine list.'], summary: 'Removed unsupported sensor mechanism, proactive replacement and Bosch fitment; proposed the owner total as zero.', sources: ['datasets'],
  },
  [IDS.balanceShaft]: {
    description: 'Mercedes extended coverage for confirmed worn sintered-steel M272 balance-shaft sprockets only on qualifying 2005-2007 vehicles within exact engine-serial limits. The rendered document lists E350 but does not support every 2005-2011 E350, a June-2008 cutoff, or an inevitable catastrophic tooth-stripping progression.',
    solution: 'Confirm the engine serial number, preserve cam/crank correlation faults, and diagnose under LI03.30-P-050027 before deciding whether the balance-shaft sprocket or another timing component is involved. Check VMI for applicable coverage. Do not buy a balance shaft, sprocket, timing chain or kit from this page; diagnosis and engine-serial eligibility are unresolved.',
    symptoms: ['engine serial number confirmed', 'cam/crank correlation data preserved', 'covered component diagnosed under the exact Mercedes procedure'], affectedSystems: ['engine timing drive', 'M272 balance-shaft system'],
    conflict: 'The frozen 2005-2011 scope exceeds the exact engine-serial-limited 2005-2007 M272 coverage.', evidence: ['Both rendered warranty pages limit coverage to qualifying 2005-2007 M272 serial ranges and list E350.', 'The warranty requires confirmation under LI03.30-P-050027.'], summary: 'Corrected the M272 year and engine-serial boundaries and proposed the unsupported owner total as zero.', sources: ['balanceShaftWarranty', 'datasets'],
  },
  [IDS.oilCooler]: {
    description: 'Mercedes communication 10166980 directly identifies traces of oil in the oil-cooler area within the inner V of OM642 engines. It supports an oil-leak condition but does not establish coolant-to-oil cross-contamination, milky oil, a universal 2007-2014 E320 CDI/E350 BlueTEC population, or the frozen instruction that every symptom requires the same oil-cooler-seal repair.',
    solution: 'Confirm the fluid and leak origin, clean and inspect the inner V, pressure-test or trace the system as specified for the VIN, and address any actual oil or coolant contamination separately. Do not buy oil-cooler seals, a cooler or an intake-seal kit from this page; the leak source and VIN-level fitment are not established.',
    symptoms: ['fluid type and source confirmed', 'inner-V leak area cleaned and reinspected', 'oil and coolant condition evaluated separately'], affectedSystems: ['OM642 lubrication system', 'oil-cooler area'],
    conflict: 'The exact communication supports inner-V oil traces, not the frozen cross-contamination mechanism and full year/trim scope.', evidence: ['Communication 10166980 states traces of oil in the oil-cooler area on engine 642.', 'No exact reviewed source establishes the frozen milky-oil or coolant-mixing sequence.'], summary: 'Separated supported inner-V oil leakage from unsupported fluid-mixing claims and proposed the owner total as zero.', sources: ['datasets'],
  },
});

function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = PDF_SOURCES[key] || OTHER_SOURCES[key]; return { url: source.url, type: source.type, title: source.title }; }); }
function commerceDecisionFor(id) { return {
  [IDS.hybrid48v]: 'multiple 48V causes and VIN fitment are unresolved; no universal retail part',
  [IDS.fuelPump]: 'dealer recall remedy depends on VIN eligibility; no universal retail part',
  [IDS.mbux]: 'display path, software scope and VIN fitment are unresolved; no universal retail part',
  [IDS.conductorPlate]: 'transmission diagnosis and VIN fitment are unresolved; no universal retail part',
  [IDS.airmatic]: 'leak source, failed component and fitment are unresolved; no universal retail part',
  [IDS.comand]: 'the exact bulletin requires software repair and prohibits unit replacement; no universal retail part',
  [IDS.crankSensor]: 'sensor failure, engine scope and Bosch fitment are unresolved; no universal retail part',
  [IDS.balanceShaft]: 'diagnosis and engine-serial eligibility are unresolved; no universal retail part',
  [IDS.oilCooler]: 'fluid source and VIN fitment are unresolved; no universal retail part',
}[id]; }
function proposalFor(before, id) { const content = CONTENT[id]; return { ...clone(before), description: content.description, solution: content.solution, confidence: RETAIN_IDS.includes(id) ? 'medium' : 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary }; }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'E-Class').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen E-Class coverage does not match the 9-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); const retained = RETAIN_IDS.includes(row.id); return { id: row.id, action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: !retained, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'E-Class',
    completionStatement: 'All 9 frozen E-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Eight identities materially exceed exact evidence or contain scope, mechanism or fitment conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 2,400-, 2,100-, 1,600-, 1,300-, 2,600- and 1,700-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'e-class-eight-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Eight frozen identities exceed exact evidence or contain a scope, mechanism, fitment or metadata conflict; all remain indexed pending review.' },
      { code: 'e-class-comand-identity-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'LI82.85-P-055695 directly supports the COMAND dark/unresponsive identity on model 212 while rejecting stored hardware-replacement claims.' },
      { code: 'e-class-recall-scope-boundary', severity: 'identity-conflict', recordIds: [IDS.fuelPump], detail: 'Recall 23V445 supports certain 2021-2023 platform 213/238 fuel-pump modules, not the frozen 2021-2024 delivery-module scope.' },
      { code: 'e-class-m272-scope-boundary', severity: 'identity-conflict', recordIds: [IDS.balanceShaft], detail: 'Official coverage is engine-serial-limited 2005-2007 M272 sprocket wear, not every 2005-2011 E350.' },
      { code: 'e-class-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Six positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-e-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No E-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8, fabricated_report_counts_proposed_zero: 6, total: 9 }, rows,
  };
}
if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
