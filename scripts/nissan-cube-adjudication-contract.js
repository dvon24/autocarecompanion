/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  cvt: 'nissan-cube-cvt-failure-2009',
  escl: 'nissan-cube-escl-failure-2009',
  exhaust: 'nissan-cube-exhaust-separation-2009',
  stalling: 'nissan-cube-stalling-2009',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([...allIds]);
const relevantDocumentIds = Object.freeze([
  '10032506', '10033307', '10033826', '10035684', '10043950', '10047059',
  '10138223', '10190124', '10192100', '10192158', '10192192', '10192216',
  '10192217', '10192234', '10192266', '10192293', '10192374', '10192520',
  '10192591', '10192605', '10192661', '10192727', '10200014', '10213684',
  '10227268',
]);
const campaigns = Object.freeze(['09V393000', '10V330000', '15V418000', '26V230000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.cvt]: held({
    description: `The exact Cube corpus contains a bounded 2009-2010 diagnostic communication for P0740, P0744, P0840 and P1777. It does not establish a 2009-2014 CVT failure population, belt stretch, valve-body failure, 80,000-120,000-mile recurrence or the frozen 10-year/120,000-mile warranty statement. The frozen DTC list instead names P0868, P0741 and P0746 without exact Cube evidence. The frozen 320-owner total is unsupported.`,
    solution: `Record the exact symptom, transmission temperature, DTCs and freeze-frame data, then follow the Cube service-manual flow for each stored code. Confirm fluid level and condition using the specified procedure and fluid before considering repair. Do not buy CVT fluid, a valve body, torque converter or remanufactured transmission from this page; diagnosis, transmission specification, campaign or warranty eligibility and VIN fitment must be established first.`,
    symptoms: ['transmission behavior reproduced under recorded conditions', 'DTCs, freeze-frame data and fluid condition preserved', 'control, hydraulic, mechanical and engine-performance paths separated'],
    systems: ['continuously variable transmission', 'TCM, solenoids and hydraulic control', 'fluid, torque converter and internal mechanical components'],
    evidence: ['The exact Cube communication is limited to 2009-2010 and four specified DTCs.', 'No exact source proves belt stretch, valve-body failure or an 80,000-120,000-mile recurrence.', 'No exact source supports 320 reports or the frozen warranty statement across all six years.'],
    conflict: 'The indexed page converts one two-year diagnostic bulletin into a six-year premature-transmission-failure identity with unsupported mechanism, mileage and warranty claims.',
    summary: 'Held the overbroad Cube CVT identity and removed the fabricated 320-owner total.',
  }),
  [ids.escl]: held({
    description: `Nissan NTB11-057A and campaign P1225 apply only to 2009 Cube vehicles equipped with Intelligent Key that may have a no-start due to the electronic steering column lock. The bulletin states that P1225 is no longer active and repair orders opened after July 28, 2021 are not eligible for campaign reimbursement. It does not support a 2010-2014 population, a continuing free campaign, universal module replacement or the frozen key-cycling workaround. The frozen 450-owner total is unsupported.`,
    solution: `For a no-start with a steering-lock warning, preserve warning indicators and Intelligent Key/BCM/ESCL codes, verify battery voltage and key recognition, and confirm whether the vehicle is a 2009 Intelligent Key car covered by the original condition. Do not repeatedly strike or force the lock and do not rely on key cycling as a repair. Do not buy an ESCL, BCM, key or bypass device from this page; the failed path, programming requirements and VIN fitment must be established first.`,
    symptoms: ['Intelligent Key equipment and model year confirmed', 'warning indicators and control-module codes preserved', 'battery, key, BCM, ESCL and starter paths separated'],
    systems: ['electronic steering column lock', 'Intelligent Key and body control module', '12-volt supply and starting authorization'],
    evidence: ['NTB11-057A is limited to 2009 Cube vehicles equipped with Intelligent Key.', 'P1225 is explicitly no longer active.', 'No exact source supports the frozen 2010-2014 scope or 450 owner reports.'],
    conflict: 'The indexed page expands a 2009 equipment-specific inactive campaign into a six-year ESCL defect and implies current campaign coverage.',
    summary: 'Held the overbroad ESCL identity and removed the fabricated 450-owner total.',
    citations: ['esclCampaign', 'datasets'],
  }),
  [ids.exhaust]: held({
    description: `The exact 133-row Cube manufacturer-communication corpus and four-campaign recall inventory do not establish exhaust-flange separation, bumper heat damage, inadequate shielding or proximity risk to the fuel tank across 2009-2014 vehicles. The frozen page provides no exact source, production window, flange location, inspection criteria or confirmed causal record. The frozen 85-owner total is unsupported.`,
    solution: `Treat increased exhaust noise, odor or visible heat damage as a prompt inspection. With the system cool, locate soot or leakage and inspect the manifold, catalysts, tubes, gaskets, flanges, fasteners, hangers and shields before repair; do not infer the leaking joint from the page. Do not buy a gasket, bolt set, flange, pipe, catalyst or heat shield from this page; leak location, emissions specification and VIN fitment must be proven first.`,
    symptoms: ['exhaust noise and odor localized', 'soot, leakage and heat effects inspected with the system cool', 'manifold, catalyst, pipe, gasket, flange, hanger and shield paths separated'],
    systems: ['exhaust manifold and catalysts', 'front and center exhaust tubes and flanges', 'gaskets, fasteners, hangers and heat shields'],
    evidence: ['No exact Cube manufacturer communication supports the frozen flange-separation identity.', 'The four exact safety recalls address unrelated TPMS, fuel-integrity, start/stop-switch and airbag conditions.', 'No exact source supports 85 reports, a 60,000-mile inspection rule or universal stainless-flange replacement.'],
    conflict: 'The indexed page presents an unsourced six-year exhaust and heat-damage identity with universal repair advice and no defined affected population.',
    summary: 'Held the unsupported exhaust-separation identity and removed the fabricated 85-owner total.',
  }),
  [ids.stalling]: held({
    description: `NHTSA recall 15V418 and Nissan NTB15-064A apply to certain 2013-2014 Cube vehicles. In hot conditions, a crush rib can make the engine stop/start switch stick; road vibration may then cause the engine to shut off while driving. The remedy removes the rib and applies a foam seal. This does not establish a 2009-2012 population, crankshaft-position-sensor failure, throttle-body failure, ECM software bugs, accelerator-pumping recovery or the frozen P0335/P0340/P0505 code set. The frozen 180-owner total is unsupported.`,
    solution: `Check the VIN for 15V418/R1511 when a 2013-2014 vehicle has a sticking engine stop/start switch, and preserve the switch position, ambient conditions, warnings and DTCs. For any other stall, diagnose power supply, fuel, air, ignition, crank/cam signals and control modules from captured evidence rather than replacing parts by symptom. Do not buy a crank sensor, cam sensor, throttle body, ECM or switch from this page; recall eligibility and the actual failed path must be established first.`,
    symptoms: ['VIN checked for 15V418/R1511', 'switch position, heat exposure, warnings and DTCs recorded', 'switch-recall, electrical, fuel, air, ignition, sensor and ECM paths separated'],
    systems: ['engine stop/start switch and immobilizer antenna', 'engine control and 12-volt power', 'fuel, air, ignition and crank/cam sensing'],
    evidence: ['15V418 is limited to certain 2013-2014 Cube vehicles and a sticking start/stop switch.', 'The exact recall remedy removes a crush rib and applies foam; it does not replace the frozen sensor or ECM list.', 'No exact source supports the 2009-2012 scope, frozen DTCs or 180 owner reports.'],
    conflict: 'The indexed page expands a bounded two-year switch recall into six years of multi-cause stalling and unsupported diagnostic shortcuts.',
    summary: 'Held the overbroad stalling identity and preserved exact 15V418 switch-recall scope.',
    citations: ['startStopSwitchRecall', 'recall15V418', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  esclCampaign: {
    title: 'Nissan NTB11-057A - 2009 Cube No Start Due to Electronic Steering Column Lock',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200014-0001.pdf',
    sha256: 'dd0fc82a537a9d0318908c80851df060f674f1e2f8833b989e6f423d5d4f1ba9',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
  startStopSwitchRecall: {
    title: 'Nissan NTB15-064A - 2013-2014 Cube Engine Stop/Start Switch Recall',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V418-7674.pdf',
    sha256: '17d70392d5da614b738f84dbfcebc474a123c65ca6f5243c246e3779be01ac89',
    pageCount: 20,
    visuallyReviewedPages: [1, 20],
  },
});

function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  recall09V393: recallApi('09V393000', 'NHTSA Recall 09V393000 - Cube TPMS Transmitter Nut'),
  recall10V330: recallApi('10V330000', 'NHTSA Recall 10V330000 - Cube Fuel-System Integrity'),
  recall15V418: recallApi('15V418000', 'NHTSA Recall 15V418000 - Cube Engine Start/Stop Switch'),
  recall26V230: recallApi('26V230000', 'NHTSA Recall 26V230000 - Cube Side-Curtain Airbag Inflator'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Cube', slug: 'cube', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-cube-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['CUBE'],
  searchTerms: ['CVT', 'transmission', 'shudder', 'judder', 'steering lock', 'ESCL', 'no start', 'no-start', 'exhaust', 'flange', 'heat', 'stall', 'stalled', 'crankshaft', 'camshaft', 'throttle', 'ECM'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 1, '2010-2014': 24, '2015-2019': 66, '2020-2024': 39, '2025-2026': 3 },
    totalRows: 133,
    relevantRowCount: 25,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 1, post: 6 },
    totalRows: 7,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The four exact Cube campaigns concern TPMS nuts, post-crash fuel integrity, certain 2013-2014 start/stop switches and side-curtain airbag inflators. Only the switch recall overlaps a frozen identity, and its model-year and mechanism scope is substantially narrower than the page.',
  },
  content,
  requiredProse: [
    { id: ids.cvt, field: 'description', patterns: ['2009-2010', 'P0740, P0744, P0840 and P1777', 'does not establish a 2009-2014'] },
    { id: ids.escl, field: 'description', patterns: ['2009 Cube vehicles equipped with Intelligent Key', 'no longer active'] },
    { id: ids.exhaust, field: 'description', patterns: ['do not establish exhaust-flange separation', '85-owner'] },
    { id: ids.stalling, field: 'description', patterns: ['certain 2013-2014 Cube vehicles', 'crush rib', 'does not establish a 2009-2012'] },
  ],
  observations: [
    { code: 'all-four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen Cube identity materially exceeds exact primary evidence and remains published pending identity policy.' },
    { code: 'escl-campaign-bounded-and-inactive', severity: 'technical-accuracy', recordIds: [ids.escl], detail: 'P1225 remains limited to 2009 Intelligent Key vehicles and is explicitly no longer active.' },
    { code: 'switch-recall-not-expanded', severity: 'technical-accuracy', recordIds: [ids.stalling], detail: '15V418 remains limited to certain 2013-2014 start/stop switches and is not expanded into six years of sensor, throttle or ECM failure.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Four unsupported owner totals totaling 1,035 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-cube-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Cube page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
