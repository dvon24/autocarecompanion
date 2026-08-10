/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  attesa: 'nissan-skyline-attesa-e-ts-hydraulic-pump-nitrogen-accumulator-failure',
  ceramicTurbo: 'nissan-skyline-ceramic-turbocharger-exhaust-wheel-failure',
  cas: 'nissan-skyline-crank-angle-sensor-failure-hot-stalling-no-start',
  ignition: 'nissan-skyline-ignition-coil-pack-engine-valley-harness-degradation',
  v160: 'nissan-skyline-r34-gt-r-getrag-v160-6-speed-synchro-wear-gear-grind',
  oilPump: 'nissan-skyline-rb26dett-oil-pump-drive-collar-failure',
  rust: 'nissan-skyline-structural-rust-strut-towers-rear-arches-sills-boot-floor',
  hicas: 'nissan-skyline-super-hicas-rear-steer-system-aging-leaks-solenoid-faults-wo',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary,
    citations: ['datasets'],
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.attesa]: held({
    description: 'NHTSA contains no Skyline manufacturer communications or recall records. The frozen page combines ATTESA E-TS pump wear, nitrogen-accumulator pressure loss, pressure-switch faults, an asserted rear-drive fallback, ABS interaction, code 18 and one part number across R32-R34 and GT-R/GTS-4 variants without an exact Nissan primary document in the sanctioned corpus.',
    solution: 'Identify the chassis, ATTESA generation and exact warning code; measure fluid level, pump command, pressure build/decay, accumulator performance, pressure-switch input and ABS faults through the correct Japanese-market service procedure. Do not buy an accumulator, pump, pressure switch or fluid from this page; chassis, diagnostic result and exact-market fitment must be established first.',
    symptoms: ['4WD warning and stored code documented', 'pump, accumulator, switch and ABS branches tested separately', 'R32, R33 and R34 ATTESA configurations kept distinct'],
    systems: ['ATTESA E-TS hydraulic pump', 'nitrogen accumulator and pressure switch', 'transfer clutch, ABS inputs and 4WD control'],
    evidence: ['The official NHTSA corpus contains zero Skyline communications.', 'The official NHTSA corpus contains zero Skyline recall rows.', 'Blogs and forums do not prove one 1989-2002 Nissan defect population or part fitment.'],
    conflict: 'The indexed page assigns one hydraulic failure package and one accumulator part across multiple imported chassis without primary-source support.',
    summary: 'Held the unsupported ATTESA pump/accumulator identity and removed universal part and fallback-mode advice.',
  }),
  [ids.ceramicTurbo]: held({
    description: 'The sanctioned manufacturer corpus contains no Skyline record establishing ceramic turbine-wheel separation as one 1989-2002 population. The frozen page combines single- and twin-turbo RB20DET, RB25DET and RB26DETT applications, boost limits, heat, detonation, rev-limiter use, bearing/seal damage, engine damage and special-edition wheel materials without an exact Nissan primary source.',
    solution: 'Confirm the engine and turbocharger part numbers, document boost and control hardware, inspect shaft play, oil leakage, compressor/turbine condition and exhaust restriction, and diagnose lost boost before replacement. Do not buy a turbocharger, steel-wheel core, boost controller or installation kit from this page; engine, turbo specification and exact fitment must be established first.',
    symptoms: ['lost boost separated from control and charge-air leaks', 'single- and twin-turbo applications identified', 'turbine material and damage confirmed by inspection'],
    systems: ['turbocharger turbine and shaft assembly', 'boost control and charge-air path', 'engine oil supply and exhaust'],
    evidence: ['NHTSA contains zero Skyline manufacturer or recall rows.', 'No primary source proves one safe boost threshold across the listed engines.', 'Forum failure reports do not establish N1/Nuer material exceptions or model-wide recurrence.'],
    conflict: 'The indexed page merges several engines, turbo layouts, use conditions and alleged consequences into one fourteen-year identity.',
    summary: 'Held the unsupported ceramic-turbo identity and removed universal boost-limit and replacement-brand advice.',
  }),
  [ids.cas]: held({
    description: 'The official corpus contains no Skyline communication proving heat-degraded optical crank-angle-sensor failure across RB20, RB25 and RB26 applications from 1989-2002. Hot stall, backfire and crank/no-start can arise from sensor signal, alignment drive, ignition, wiring, fuel, power or mechanical timing faults; the frozen page also asserts a universal supersession part number without primary fitment evidence.',
    solution: 'Identify the engine and CAS type, preserve codes and waveforms, verify sensor power, ground, optical signal, alignment drive, base timing and harness continuity, and separate ignition, fuel and mechanical timing before replacement. Do not buy a CAS, alignment drive, ignition harness or timing service from this page; engine, failed circuit and exact-market fitment must be established first.',
    symptoms: ['hot and cold behavior reproduced', 'signal dropout separated from alignment damage', 'ignition, fuel and mechanical timing paths tested'],
    systems: ['cam-driven crank angle sensor', 'sensor drive and base timing', 'engine-management wiring and ignition'],
    evidence: ['No Nissan Skyline manufacturer communication appears in NHTSA.', 'No exact primary source supports the 1989-2002 heat-failure population.', 'No primary fitment record verifies one supersession across RB20/RB25/RB26.'],
    conflict: 'The indexed page turns multi-cause no-start symptoms and a forum-sourced part number into a fourteen-year CAS defect identity.',
    summary: 'Held the unsupported Skyline CAS identity and replaced universal sensor replacement with engine-specific signal diagnosis.',
  }),
  [ids.ignition]: held({
    description: 'NHTSA contains no Skyline primary record establishing coil-pack and engine-valley-harness degradation as one 1989-2002 boosted-engine defect. The frozen page also combines RB20, RB25 and RB26 coil, boot, harness and external-igniter arrangements and states a universal resistance range and replacement set without an exact Nissan specification.',
    solution: 'Confirm the engine and ignition architecture, preserve misfire evidence, inspect plugs, boots, coils, harness terminals, grounds and any external igniter, and test spark output under the relevant load with the correct service specifications. Do not buy coil packs, an R35 conversion, plugs, boots, harness or igniter from this page; failed circuit and exact fitment must be established first.',
    symptoms: ['cylinder-specific and random misfire separated', 'coil, boot, harness and igniter paths tested', 'boost/load condition documented'],
    systems: ['ignition coils and boots', 'engine-valley sub-harness', 'igniter, plugs and engine management'],
    evidence: ['The sanctioned corpus contains zero Skyline communications.', 'No exact source supports one resistance specification across three engine families.', 'No primary evidence proves simultaneous coil and harness replacement.'],
    conflict: 'The indexed page combines multiple ignition architectures and failure modes into one fourteen-year identity.',
    summary: 'Held the unsupported coil/harness identity and removed universal coil-set, conversion and harness replacement advice.',
  }),
  [ids.v160]: held({
    description: 'The official U.S. corpus contains no Skyline communication establishing Getrag V160 synchronizer wear as a 1999-2002 R34 GT-R defect population. The frozen page asserts weak synchros, a third-then-second failure order, AWD shock loading, Nissan non-serviceability and specialist scarcity from secondary/community sources rather than an exact Nissan service document.',
    solution: 'Confirm the transmission identification, reproduce the grind by gear and temperature, verify clutch release, hydraulics, mounts and lubricant specification, and measure internal wear through a qualified transmission specialist before authorizing teardown. Do not buy synchros, engagement rings, gear oil or a replacement gearbox from this page; failure source, transmission variant and exact fitment must be established first.',
    symptoms: ['gear and temperature of grind documented', 'clutch-release and internal-synchro causes separated', 'V160 identity confirmed'],
    systems: ['Getrag V160 synchronizers and gears', 'clutch release and hydraulics', 'transmission mounts and lubricant'],
    evidence: ['NHTSA contains zero Skyline manufacturer records.', 'No exact Nissan document in the corpus proves the claimed wear order or rate.', 'Community rebuild availability does not establish a defect identity.'],
    conflict: 'The indexed page presents secondary-source ownership and rebuild claims as a four-year factory synchronizer defect.',
    summary: 'Held the unsupported R34 V160 synchro identity and replaced automatic specialist rebuild advice with transmission-specific diagnosis.',
  }),
  [ids.oilPump]: held({
    description: 'The sanctioned corpus contains no Skyline or RB26DETT manufacturer communication proving narrow crank-snout oil-pump-drive failure across 1989-1992. The frozen page asserts a production-change date, clearance mechanism, high-RPM fracture pathway, seizure consequence and a preventive machining/pump package from enthusiast and parts-vendor sources without exact Nissan primary evidence.',
    solution: 'Confirm the engine and crankshaft identity, monitor oil pressure with appropriate equipment, inspect pump drive engagement and damage during an authorized engine teardown, and use an engine builder familiar with the exact crank and pump combination. Do not buy a crank collar, oil pump, machining service or engine kit from this page; crank specification, measured condition and build requirements must be established first.',
    symptoms: ['oil-pressure behavior documented', 'pump and crank-drive condition inspected', 'engine and crank production identity confirmed'],
    systems: ['RB26DETT crankshaft oil-pump drive', 'oil pump inner gear', 'engine lubrication and rotating assembly'],
    evidence: ['NHTSA contains zero Skyline communications or recalls.', 'No exact Nissan source verifies the frozen production-change boundary.', 'Parts vendors do not prove model-wide failure or a universal collar/pump remedy.'],
    conflict: 'The indexed page turns aftermarket engineering guidance into a four-year factory defect and universal preventive build prescription.',
    summary: 'Held the unsupported RB26 oil-pump-drive identity and removed universal collar, machining and N1-pump advice.',
  }),
  [ids.rust]: held({
    description: 'The frozen page combines front strut-tower seams, rear arches, sills, jacking points, boot floor and chassis rails across R32, R33 and R34, and adds broad claims about minimal rustproofing, import age, hidden black underseal and repair prices. NHTSA contains no Skyline manufacturer or recall record establishing that combined 1989-2002 structural-corrosion identity.',
    solution: 'Inspect each body from above and below, remove trim where lawful, measure corrosion around suspension and restraint loads, trace water entry, and have perforation or deformation assessed by a qualified structural repairer before driving or purchase. Do not buy patch panels, strut parts, cavity wax or underseal from this page; chassis, corrosion extent and repair feasibility must be established first.',
    symptoms: ['cosmetic corrosion separated from structural metal loss', 'water entry and prior repair traced', 'R32, R33 and R34 structures inspected independently'],
    systems: ['strut towers and suspension load paths', 'sills, arches and jacking points', 'boot floor, rails and body sealing'],
    evidence: ['The official corpus contains zero Skyline corrosion communications.', 'Buyers guides do not establish one Nissan defect population.', 'Repair prices and hidden-repair heuristics are not primary defect evidence.'],
    conflict: 'The indexed page merges multiple structures across three chassis generations and presents buyer-guide observations as one factory defect.',
    summary: 'Held the conflated Skyline structural-rust identity and removed universal pricing and underseal claims.',
  }),
  [ids.hicas]: held({
    description: 'The frozen page combines hydraulic R32 HICAS and electric R33/R34 Super HICAS, rear-rack leakage, solenoid faults, worn ball joints, steering-angle-sensor errors and community delete-kit practice into one 1989-2002 identity. NHTSA contains no Skyline primary record supporting that population, and the page itself acknowledges different system architectures.',
    solution: 'Identify the chassis and HICAS architecture, run the correct self-diagnosis, inspect steering-angle input, electrical power, hydraulic leakage where applicable, rear toe links and ball joints, and verify alignment before repair. Do not buy a lock bar, hydraulic loop, rack, solenoid, ball joint or steering-wheel boss from this page; system generation, failed component, legality and exact fitment must be established first.',
    symptoms: ['hydraulic and electric HICAS separated', 'warning code and steering-angle input documented', 'rack, solenoid, toe-link and ball-joint paths tested'],
    systems: ['HICAS/Super HICAS rear steering', 'hydraulic or electric actuator controls', 'rear toe links, ball joints and steering-angle input'],
    evidence: ['No Skyline HICAS communication appears in the official corpus.', 'R32 and R33/R34 systems are not one architecture.', 'Community deletion frequency does not prove a defect or safe universal remedy.'],
    conflict: 'The indexed page merges two rear-steer architectures and recommends deletion as the accepted fix without primary or legal evidence.',
    summary: 'Held the conflated HICAS identity and removed universal delete-kit and warning-light advice.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Skyline', slug: 'skyline', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-skyline-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['SKYLINE'],
  searchTerms: ['ATTESA', 'hydraulic', 'accumulator', 'turbo', 'ceramic', 'crank angle', 'CAS', 'ignition coil', 'harness', 'V160', 'synchro', 'oil pump', 'crank snout', 'rust', 'strut tower', 'HICAS', 'rear steer', 'ball joint'],
  relevantDocumentIds: [],
  campaigns: [],
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0,
    relevantRowCount: 0,
    uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Skyline was not a U.S.-market Nissan model in the audited 1989-2002 range; the NHTSA communication and recall corpus contains zero Skyline rows, so forum and vendor claims cannot satisfy the primary-source contract.',
  },
  content,
  requiredProse: [
    { id: ids.attesa, field: 'description', patterns: ['no Skyline manufacturer communications', 'R32-R34', 'without an exact Nissan primary'] },
    { id: ids.ceramicTurbo, field: 'description', patterns: ['RB20DET, RB25DET and RB26DETT', 'without an exact Nissan primary source'] },
    { id: ids.v160, field: 'description', patterns: ['no Skyline communication', 'secondary/community sources'] },
    { id: ids.oilPump, field: 'description', patterns: ['no Skyline or RB26DETT manufacturer communication', 'without exact Nissan primary evidence'] },
    { id: ids.hicas, field: 'description', patterns: ['hydraulic R32 HICAS and electric R33/R34', 'different system architectures'] },
  ],
  observations: [
    { code: 'eight-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All eight Skyline pages remain published but held because the sanctioned primary-source corpus contains zero Skyline manufacturer or recall rows.' },
    { code: 'import-market-primary-source-gap', severity: 'source-safety', recordIds: allIds, detail: 'Forum, blog, buyer-guide and parts-vendor repetition is not substituted for Nissan Japan service evidence.' },
    { code: 'cross-generation-system-conflation', severity: 'technical-accuracy', recordIds: [ids.attesa, ids.ceramicTurbo, ids.cas, ids.ignition, ids.rust, ids.hicas], detail: 'R32, R33 and R34 chassis, engines and system architectures are kept separate rather than treated as one 1989-2002 failure population.' },
    { code: 'aftermarket-parts-not-defect-proof', severity: 'commerce-safety', recordIds: [ids.attesa, ids.ceramicTurbo, ids.cas, ids.ignition, ids.oilPump, ids.hicas], detail: 'Vendor part availability and community modification practice do not prove OEM failure identity or universal fitment.' },
    { code: 'no-fabricated-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'No owner counts or recurrence rates are inferred from community threads.' },
    { code: 'all-skyline-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Skyline page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
