/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  fuelPump: 'nissan-hardbody-fuel-pump-failure-1990',
  rust: 'nissan-hardbody-rust-1990',
  speedometer: 'nissan-hardbody-speedometer-gear-1990',
  timingChain: 'nissan-hardbody-timing-chain-guide-1990',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze(['10188377', '10206391', '39921', '609964']);
const campaigns = Object.freeze([
  '02V125000', '06E049000', '09E012000', '90V072000', '94V243000',
  '94V251000', '95V103002', '96V170001', '98V234000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets'],
    commerceDecision: 'failure path, component, drivetrain configuration and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.fuelPump]: held({
    description: `The exact 93-row Hardbody/D21 manufacturer-communication corpus and nine-campaign recall inventory contain no Nissan record establishing in-tank fuel-pump failure across every 1990-1997 truck. The frozen page also asserts motor wear, a clogged sock, connector corrosion, low-fuel cooling damage and the absence of an access panel without defining an engine, fuel system, production window or diagnostic source. Stalling, hard starting and a no-start can arise from multiple fuel, ignition and electrical paths.`,
    solution: `Preserve the exact symptom and operating conditions, verify battery and ignition operation, then measure fuel pressure and voltage at the pump circuit using the service procedure for the truck's engine and fuel system. Inspect wiring, grounds, relay/control operation, filter restriction, tank contamination and pressure retention before condemning the pump. Do not buy a pump, strainer, filter, connector, tank seal or relay from this page; the failed path, engine, tank configuration and VIN fitment must be established first.`,
    symptoms: ['hard-start, stall or no-start conditions recorded separately', 'fuel pressure, voltage and ground measured under the exact failure condition', 'pump, wiring, control, restriction, contamination, ignition and engine paths separated'],
    systems: ['fuel tank, pickup and in-tank pump', 'fuel-pump wiring, grounds and control', 'filter, rail pressure and engine-management inputs'],
    evidence: ['No exact Hardbody communication supports the frozen eight-year fuel-pump identity.', 'No exact source proves low tank level as the failure cause or a universal access method.', 'No primary evidence supports universal pump-module, strainer, filter and connector replacement.'],
    conflict: 'The indexed page turns broad no-start symptoms into an eight-year in-tank-pump defect with unsourced mechanism, access and parts claims.',
    summary: 'Held the unsupported Hardbody fuel-pump identity and required measured fuel and electrical diagnosis.',
  }),
  [ids.rust]: held({
    description: `One exact D21 communication addresses corrosion at the high-mounted stop-lamp area on certain 1994-1997 trucks. It does not establish frame, bed-floor, cab-corner, rocker-panel and wheel-well corrosion across every 1990-1997 Hardbody, salt-belt prevalence, structural failure frequency or the claim that rust is the primary reason these trucks are scrapped. The nine exact safety campaigns do not define the frozen frame/body-rust population.`,
    solution: `Have structural corrosion inspected on a lift by a qualified body or frame professional. Record perforation, section loss, cracks and deformation at the frame rails, suspension and steering mounts, crossmembers, cab and bed mounts before deciding whether surface treatment, engineered repair or retirement is appropriate. Do not buy patch panels, frame sections, rust converter, coatings or welding materials from this page; location, remaining metal, load-path integrity and local inspection requirements must be established first.`,
    symptoms: ['corrosion locations and perforation documented', 'frame and suspension attachment integrity assessed', 'cosmetic surface corrosion separated from structural section loss'],
    systems: ['frame rails, crossmembers and suspension mounts', 'cab, bed and body mounting structure', 'rocker panels, corners, floors and wheel housings'],
    evidence: ['The exact corrosion communication concerns the high-mounted stop-lamp area, not a frame/body defect population.', 'No exact recall establishes the frozen eight-year rust identity.', 'No primary source supports prevalence, scrappage or universal price claims.'],
    conflict: 'The indexed page expands one bounded lamp-area corrosion communication and general regional risk into an eight-year whole-vehicle structural-rust identity.',
    summary: 'Held the unsupported whole-vehicle rust identity and required structural inspection before repair advice.',
  }),
  [ids.speedometer]: held({
    description: `The complete Hardbody/D21 manufacturer-communication inventory contains no Nissan bulletin matching the frozen citation "TSB 95-07-01" or its claimed 1995-1997 transmission speedometer-gear replacement subject. The frozen page nevertheless expands the claim across 1990-1997 and asserts a mechanical cable, stripped nylon gear, odometer consequence and legal impact without establishing transmission, cluster or speed-signal configuration.`,
    solution: `Determine whether the truck uses the claimed cable-and-driven-gear arrangement before testing. Record whether the speedometer and odometer fail together, inspect the cluster input and applicable cable or electrical signal path, and follow the service manual for the exact transmission and drivetrain. Do not buy a speedometer cable, driven gear, sensor, cluster or lubricant from this page; the failed component, transmission, tooth count or signal specification and VIN fitment must be established first.`,
    symptoms: ['speedometer and odometer operation recorded separately', 'cluster input and cable or electrical signal path identified', 'cluster, cable, gear, sensor, wiring and transmission paths separated'],
    systems: ['instrument cluster and odometer', 'speedometer cable or vehicle-speed signal path', 'transmission drive/driven gear or speed sensor'],
    evidence: ['No matching TSB 95-07-01 appears in the exact NHTSA manufacturer-communication inventory.', 'No exact source supports the frozen 1990-1997 cable-and-nylon-gear identity.', 'No primary evidence supports the prices, fifteen-minute repair time or universal external access claim.'],
    conflict: 'The indexed page relies on an unverified direct citation and treats one unproven mechanical configuration as an eight-year universal failure identity.',
    summary: 'Held the false/unverified-citation speedometer identity and removed universal cable and gear replacement advice.',
  }),
  [ids.timingChain]: held({
    description: `One exact D21 manufacturer communication, record 39921, reports a broken tension-side timing-chain guide for 1990-1994 trucks. It does not establish the frozen 1990-1997 population, age-and-heat mechanism, plastic-backed guide construction, interference-engine damage, a 100,000-mile preventive interval or an upper-guide deletion procedure. The limited summary also spells the engine "K24E," so it cannot independently validate every KA24E technical assertion on the page.`,
    solution: `Record the noise by temperature and engine speed, verify oil level and pressure, and localize the source before opening the engine. If timing-system damage is suspected, inspect chain slack, guide and tensioner condition and cam-to-crank timing using the service manual for the exact engine and production date; evaluate compression or cylinder leakage if timing has moved. Do not buy a chain kit, guides, tensioner, sprockets, seals or front-cover parts from this page; engine identity, failed component, measured condition and superseded part information must be established first.`,
    symptoms: ['noise mapped by coolant temperature and engine speed', 'oil level, pressure and timing correlation documented', 'timing-chain, accessory, valve-train and lower-engine noise paths separated'],
    systems: ['timing chain, guides and hydraulic tensioner', 'camshaft and crankshaft sprockets and timing', 'lubrication, front cover and valve train'],
    evidence: ['Record 39921 supports only a broken tension-side guide on 1990-1994 D21 trucks.', 'No exact source extends that record through 1997 or proves the frozen failure mechanism and interference claim.', 'No exact source supports a universal 100,000-mile interval, upper-guide deletion or complete-kit replacement.'],
    conflict: 'The indexed page expands one terse 1990-1994 communication into an eight-year engine-failure identity with unsupported damage, interval and repair instructions.',
    summary: 'Held the overbroad timing-chain-guide identity while preserving the exact 1990-1994 communication finding.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Hardbody', slug: 'hardbody', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-hardbody-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['D21', 'NISSAN TRUCK', 'TRUCK', 'CREW CAB'],
  searchTerms: ['fuel pump', 'fuel pressure', 'fuel filter', 'rust', 'corrosion', 'speedometer', 'odometer', 'speed sensor', 'timing chain', 'guide', 'tensioner', 'KA24E'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 38, '2000-2004': 20, '2005-2009': 8, '2010-2014': 13, '2015-2019': 1, '2020-2024': 13, '2025-2026': 0 },
    totalRows: 93,
    relevantRowCount: 4,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 29, post: 0 },
    totalRows: 29,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The nine exact D21/Nissan Truck campaigns concern equipment, lamp, seat-belt, wheel, brake, steering and aftermarket replacement-component conditions. None establishes the frozen fuel-pump, whole-vehicle rust, speedometer or eight-year timing-guide identities.',
  },
  content,
  requiredProse: [
    { id: ids.fuelPump, field: 'description', patterns: ['contain no Nissan record establishing in-tank fuel-pump failure', 'absence of an access panel'] },
    { id: ids.rust, field: 'description', patterns: ['high-mounted stop-lamp area', 'does not establish frame, bed-floor'] },
    { id: ids.speedometer, field: 'description', patterns: ['contains no Nissan bulletin matching', 'TSB 95-07-01'] },
    { id: ids.timingChain, field: 'description', patterns: ['record 39921', '1990-1994 trucks', 'does not establish the frozen 1990-1997'] },
  ],
  observations: [
    { code: 'all-four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen Hardbody identity materially exceeds exact primary evidence and remains published pending identity policy.' },
    { code: 'speedometer-citation-unverified', severity: 'source-integrity', recordIds: [ids.speedometer], detail: 'No TSB 95-07-01 or matching speedometer-gear subject appears in the complete exact manufacturer-communication inventory.' },
    { code: 'timing-guide-scope-bounded', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'The sole matching communication is a terse 1990-1994 broken tension-side guide record and is not expanded through 1997 or into unsupported engine-damage and service claims.' },
    { code: 'unknown-owner-totals-preserved-zero', severity: 'social-proof-safety', recordIds: allIds, detail: 'All four frozen owner totals are already unknown zero and remain zero; the interface must never render them as 0+ owners.' },
    { code: 'all-hardbody-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Hardbody page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
