/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  subframe: 'opel-corsa-corsa-d-front-subframe-corrosion',
  blowerResistor: 'opel-corsa-corsa-d-heater-blower-resistor-failure-fan-only-works-speed',
  onboardCharger: 'opel-corsa-corsa-e-board-charger-fault-electric-traction-system-fault-b',
  wetBelt: 'opel-corsa-corsa-f-1-2-puretech-wet-timing-belt-premature-degradation',
  indicatorRecall: 'opel-corsa-corsa-f-ecoled-headlight-models-no-warning-when-turn-signal',
  airbagRecall: 'opel-corsa-corsa-f-side-airbag-unintended-deployment-faulty-ground-conn',
  handbrake: 'opel-corsa-d-handbrake-cable-corrosion',
  timingChain: 'opel-corsa-d-stretched-timing-chain-1.2-1.4',
  powerSteering: 'opel-corsa-e-electric-power-steering',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: commerceDecision || 'failure path, production population, component and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.subframe]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2006-2014 Corsa D front-subframe corrosion population, a seven-to-thirteen-year threshold or an Opel goodwill programme. The frozen page relies on forum anecdotes, then adds rear-axle-beam perforation as a second structural condition under the front-subframe title.',
    solution: 'Have the front subframe, suspension and steering attachment points inspected on a lift, with corrosion cleaned enough to establish remaining material and structural extent. Inspect the rear axle separately. A qualified repairer must determine whether treatment, structural repair or component replacement is permitted and complete required fastener and alignment procedures. Do not buy a subframe, axle beam, bolt kit or coating from this page; damage extent and exact VIN fitment must be established first.',
    symptoms: ['front subframe inspected separately from rear axle', 'structural attachment points exposed and measured', 'alignment and fastener requirements verified after repair'],
    systems: ['front subframe and axle carrier', 'suspension and steering mounting points', 'separate rear axle structure'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'Forum reports do not establish a production-wide corrosion rate or goodwill programme.', 'The frozen page merges front-subframe and rear-axle conditions.'],
    conflict: 'The indexed identity converts forum corrosion reports into a nine-year common defect and appends a separate rear-axle failure.',
    summary: 'Held the unsupported subframe-corrosion identity and separated front and rear structural inspection.',
  }),
  [ids.blowerResistor]: held({
    description: 'The frozen fan-only-on-speed-four symptom is consistent with a lower-speed circuit fault, but no exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2006-2014 Corsa D resistor-pack population, the claimed thermal-fuse and connector sequence, or both frozen part numbers for every listed vehicle. Forum, repair-site and video reports cannot prove a universal root cause.',
    solution: 'Verify blower operation on every speed, inspect the fuse, resistor/control module, connector voltage drop and heat damage, and measure blower-motor current before replacing parts. Repair overheated wiring only with the exact approved connector and procedure. Do not lubricate an electrical blower as a universal cure. Do not buy a resistor, pigtail or blower motor from this page; HVAC variant, diagnosis and VIN fitment must be established first.',
    symptoms: ['all blower speeds tested', 'connector heat damage and voltage drop inspected', 'blower-motor current measured before repeat replacement'],
    systems: ['blower resistor or speed controller', 'blower motor and current draw', 'HVAC connector, fuse and wiring'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'The cited material is secondary owner and repair guidance.', 'No exact source validates both frozen part numbers across every Corsa D HVAC variant.'],
    conflict: 'The indexed identity assigns one resistor/fuse cause and two part numbers to a nine-year population without exact equipment or VIN boundaries.',
    summary: 'Held the broad blower-resistor identity and replaced parts-first advice with circuit and current testing.',
  }),
  [ids.onboardCharger]: held({
    description: 'No exact Opel/Vauxhall manufacturer or regulator document in the reviewed packet establishes a 2020-2022 Corsa-e on-board-charger failure population or the claimed free campaign workflow. The frozen page combines similar warnings from the on-board charger, battery charge monitoring module and 12-volt supply, then recommends temporary battery disconnection without exact high-voltage service guidance.',
    solution: 'If a stop warning, propulsion loss or charging failure occurs, follow the owner manual, stop safely and arrange recovery when continued operation is not authorized. Record warning text, charging state, 12-volt voltage and DTCs, and have an EV-qualified Opel/Vauxhall repairer check VIN campaigns and isolate the charger, high-voltage battery controls and low-voltage supply. Do not disconnect the 12-volt or high-voltage system from this page. Do not buy a charger, BECB or battery here; the exact fault and VIN fitment must be established first.',
    symptoms: ['warning text and charging state recorded', 'charger, BECB and 12-volt paths separated', 'high-voltage work limited to qualified repairers'],
    systems: ['on-board charger', 'high-voltage battery monitoring and controls', '12-volt supply and vehicle networks'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'No exact campaign document in the packet defines the frozen population or remedy.', 'Several components can produce similar warnings and cannot be treated as interchangeable.'],
    conflict: 'The indexed identity turns shared warning messages and forum outcomes into a three-year charger defect and unverified campaign remedy.',
    summary: 'Held the unsupported Corsa-e charger identity and removed battery-disconnect and parts-first advice.',
    citations: ['datasets', 'vauxhallRecallCheck'],
  }),
  [ids.wetBelt]: held({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines, with conditional coverage up to 10 years or 112,000 miles. That announcement does not identify every 2019-2023 Corsa F, prove the frozen 100,000-mile interval or oil-dilution mechanism for this population, or substantiate the claimed 2024 timing-chain change by the engine code given.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan, document any oil-pressure warning or visible belt concern, and ask an authorized repairer to assess support eligibility before work. Stop driving if an oil-pressure warning appears. Do not buy a belt kit, strainer, chain kit or engine from this page; generation, diagnosis and exact fitment must be established first.',
    symptoms: ['engine generation and timing drive verified', 'oil-pressure warning treated as a stop condition', 'maintenance history retained for support eligibility'],
    systems: ['PureTech timing drive', 'engine lubrication and oil pickup', 'VIN-gated support eligibility'],
    evidence: ['Stellantis recognizes previous-generation PureTech timing-belt degradation.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The announcement does not map affected generations or the claimed chain change to every frozen Corsa year.'],
    conflict: 'The indexed identity maps family-level evidence and unsupported production-change detail to every 2019-2023 Corsa F.',
    summary: 'Held the overbroad Corsa F wet-belt identity while preserving the official Stellantis support boundary.',
    citations: ['stellantisPuretech'],
  }),
  [ids.indicatorRecall]: held({
    description: 'The frozen page cites secondary reports of Opel campaign E212102140/22-C-049 and KBA reference 012114 for Corsa F EcoLED turn-signal failure indication. No exact manufacturer or regulator campaign document is included to verify the indexed 2019-2022 year scope, 204,297-worldwide total, German count, no-incident statement or the BSI software remedy for every listed vehicle.',
    solution: 'Check all exterior indicators before driving and use the official Vauxhall VIN recall checker or an authorized Opel/Vauxhall repairer to determine whether a campaign is open. If a lamp or failure warning is abnormal, arrange inspection and the campaign-specific remedy. Do not buy a lamp, headlight, BSI or control module from this page; EcoLED equipment, campaign eligibility and exact VIN fitment must be established first.',
    symptoms: ['indicator operation physically checked', 'EcoLED equipment confirmed', 'campaign eligibility verified by VIN'],
    systems: ['EcoLED headlamp and turn signal', 'body control and failure monitoring', 'instrument warning logic'],
    evidence: ['The reviewed NHTSA corpus contains zero Opel/Vauxhall Corsa records.', 'The exact KBA/Opel campaign record is absent from the packet.', 'Secondary reports do not independently prove the frozen counts and year scope.'],
    conflict: 'The indexed identity may describe a real campaign but its exact population, counts and remedy are not supported by a primary record in the packet.',
    summary: 'Held the turn-signal-warning recall identity pending exact campaign evidence while preserving VIN-check guidance.',
    citations: ['datasets', 'vauxhallRecallCheck'],
    commerceDecision: 'recall status, lighting equipment and VIN eligibility govern the remedy; no universal retail part',
  }),
  [ids.airbagRecall]: held({
    description: 'The frozen page cites secondary reports of Opel campaign E202008520/20-C-192 and KBA reference 010606 for unintended side-airbag deployment from a body ground connection. No exact manufacturer or regulator campaign document is included to verify the indexed 2019-2021 year scope, German/worldwide counts, no-incident statement or the stated sanding-and-resealing repair for every vehicle.',
    solution: 'Use the official Vauxhall VIN recall checker or an authorized Opel/Vauxhall repairer to confirm campaign eligibility and completion. Do not probe airbag or restraint wiring and do not perform ground-point work from secondary instructions; restraint work belongs to a qualified repairer following the exact campaign procedure. Do not buy an airbag, wiring harness or control unit from this page; the campaign, ground location and VIN fitment must be established first.',
    symptoms: ['campaign status verified by VIN', 'airbag and restraint wiring left to qualified repairers', 'ground location and procedure confirmed from exact campaign'],
    systems: ['side airbags and restraint controls', 'body ground connections', 'airbag wiring and campaign eligibility'],
    evidence: ['The reviewed NHTSA corpus contains zero Opel/Vauxhall Corsa records.', 'The exact KBA/Opel campaign record is absent from the packet.', 'Secondary reports do not prove the frozen counts, incident history or repair steps.'],
    conflict: 'The indexed identity may describe a real campaign but exact population and repair claims remain unsupported by primary evidence in the packet.',
    summary: 'Held the airbag-ground recall identity and prohibited owner airbag/ground work pending exact campaign evidence.',
    citations: ['datasets', 'vauxhallRecallCheck'],
    commerceDecision: 'recall status and VIN eligibility govern restraint-system work; no universal retail part',
  }),
  [ids.handbrake]: held({
    description: 'The frozen page combines a claimed customer-satisfaction modification to the lever-release mechanism with age-related cable corrosion and binding across 2006-2014. No exact Opel/Vauxhall primary source in the packet verifies an open free programme for all vehicles, a six-to-ten-year cable threshold or one common failure population. Lever geometry and cable condition require separate identities and tests.',
    solution: 'Verify parking-brake hold in a safe inspection setting and have the lever mechanism, cables and rear brake hardware diagnosed separately. Check the VIN and service history with Opel/Vauxhall for applicable campaigns or customer programmes; do not promise a free repair without confirmation. If the brake will not hold or release, do not rely on it. Do not buy a lever, cable or rear brake part from this page; the failed path and exact VIN fitment must be established first.',
    symptoms: ['lever latching and cable travel tested separately', 'parking-brake hold verified safely', 'programme eligibility confirmed rather than promised'],
    systems: ['parking-brake lever and release mechanism', 'parking-brake cables', 'rear brake application hardware'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'No exact source verifies the frozen customer programme or free-repair promise.', 'Lever design and cable wear are distinct conditions.'],
    conflict: 'The indexed identity merges a programme claim with age-related cable wear and promises a free modification without exact eligibility evidence.',
    summary: 'Held the conflated handbrake identity and removed the unsupported free-repair promise and price claims.',
    citations: ['datasets', 'vauxhallRecallCheck'],
  }),
  [ids.timingChain]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2006-2014 Corsa D timing-chain-stretch population spanning four engine codes, the frozen mileage thresholds or tensioner bleed-off as one proven root cause. The page also transfers the condition to Adam while the indexed identity is Corsa D.',
    solution: 'Record cold-start noise duration, oil level and specification, service history, DTCs and measured cam/crank correlation, then use current service information for the exact engine code. Localize accessory, valvetrain and timing-drive noise before opening the engine. Do not buy a chain kit, sprockets or tensioner from this page; the failure path, engine variant and exact VIN fitment must be established first.',
    symptoms: ['cold-start noise timed and localized', 'oil and service history recorded', 'cam/crank correlation measured before timing work'],
    systems: ['1.2 and 1.4 timing drives', 'chain tensioner and lubrication', 'cam/crank timing control'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'No exact source supports the frozen engine-wide mileage thresholds.', 'Adam applicability cannot prove a Corsa D population.'],
    conflict: 'The indexed identity applies one mechanism, mileage range and repair to four engines over nine years without exact primary evidence.',
    summary: 'Held the broad timing-chain identity and replaced interval and parts advice with engine-specific measurement.',
  }),
  [ids.powerSteering]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2014-2019 Corsa E electric-power-steering-column failure population. The frozen page explicitly imports a pattern from Corsa C and D, then claims it continues on E without Corsa E evidence, while goodwill and refurbishment prices are unsupported.',
    solution: 'If steering assistance changes suddenly, maintain control, reduce speed and stop safely; arrange recovery if steering effort or control is unsafe. Record warning lights and DTCs and have battery voltage, power, grounds, torque/angle signals, motor/controller operation and the mechanical column diagnosed under exact VIN service information. Do not buy or send out a steering column for refurbishment from this page; the failed component, coding and VIN fitment must be established first.',
    symptoms: ['assistance loss treated as safety-critical', 'battery and electrical supply tested', 'column motor, control and mechanical faults separated'],
    systems: ['electric power-steering column', 'motor, controller and sensors', 'power, ground and steering mechanics'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Corsa records.', 'Corsa C/D patterns do not establish Corsa E applicability.', 'No exact source supports goodwill outcomes or refurbishment pricing.'],
    conflict: 'The indexed identity is a cross-generation inference from Corsa C/D rather than exact Corsa E evidence.',
    summary: 'Held the unsupported Corsa E steering-column identity and removed goodwill and refurbishment shopping claims.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  vauxhallRecallCheck: {
    title: 'Vauxhall Official Vehicle Recall Check',
    type: 'manufacturer',
    url: 'https://www.vauxhall.co.uk/owners/maintenance-and-repair/vehicle-recall-check.html',
    contains: 'Check safety recall campaigns for MY vehicle',
  },
  stellantisPuretech: {
    title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy',
    type: 'manufacturer',
    url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines',
    contains: 'premature degradation of the timing belt',
  },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Corsa', slug: 'corsa', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-opel-corsa-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['CORSA'],
  searchTerms: ['subframe', 'corrosion', 'blower', 'resistor', 'charger', 'electric traction', 'PureTech', 'timing belt', 'indicator', 'EcoLED', 'airbag', 'ground', 'handbrake', 'parking brake', 'timing chain', 'power steering'],
  relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL CORSA rows; this is a disclosed U.S.-corpus limitation, not proof that a non-U.S. condition does not exist.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL CORSA rows; secondary KBA and EU recall summaries remain held until exact campaign records are available.',
  },
  content,
  requiredProse: [
    { id: ids.subframe, field: 'description', patterns: ['rear-axle-beam perforation as a second structural condition', 'goodwill programme'] },
    { id: ids.blowerResistor, field: 'description', patterns: ['part numbers for every listed vehicle', 'cannot prove a universal root cause'] },
    { id: ids.onboardCharger, field: 'solution', patterns: ['Do not disconnect the 12-volt or high-voltage system', 'EV-qualified'] },
    { id: ids.wetBelt, field: 'description', patterns: ['does not identify every 2019-2023 Corsa F', 'claimed 2024 timing-chain change'] },
    { id: ids.indicatorRecall, field: 'description', patterns: ['No exact manufacturer or regulator campaign document', '204,297-worldwide total'] },
    { id: ids.airbagRecall, field: 'solution', patterns: ['Do not probe airbag or restraint wiring', 'qualified repairer'] },
    { id: ids.handbrake, field: 'description', patterns: ['combines a claimed customer-satisfaction modification', 'Lever geometry and cable condition require separate'] },
    { id: ids.timingChain, field: 'description', patterns: ['spanning four engine codes', 'transfers the condition to Adam'] },
    { id: ids.powerSteering, field: 'description', patterns: ['imports a pattern from Corsa C and D', 'without Corsa E evidence'] },
  ],
  observations: [
    { code: 'all-nine-held', severity: 'identity-safety', recordIds: allIds, detail: 'All nine Corsa pages remain published, but every frozen identity exceeds exact primary evidence or merges distinct paths.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL CORSA rows; the packet does not convert that into proof of absence.' },
    { code: 'subframe-rear-axle-conflation', severity: 'technical-accuracy', recordIds: [ids.subframe], detail: 'Front subframe corrosion and rear axle perforation are separate structural identities.' },
    { code: 'blower-part-numbers-unverified', severity: 'commerce-safety', recordIds: [ids.blowerResistor], detail: 'Two frozen part numbers are not proven across all HVAC variants; current-draw diagnosis is required before replacement.' },
    { code: 'ev-warning-paths-conflated', severity: 'safety-accuracy', recordIds: [ids.onboardCharger], detail: 'On-board charger, BECB and 12-volt faults can share warnings; battery-disconnect advice is removed.' },
    { code: 'puretech-family-not-corsa-population', severity: 'technical-accuracy', recordIds: [ids.wetBelt], detail: 'Stellantis family evidence does not map every 2019-2023 Corsa F or the claimed 2024 chain change.' },
    { code: 'indicator-recall-primary-missing', severity: 'source-integrity', recordIds: [ids.indicatorRecall], detail: 'Secondary reports name 22-C-049, but exact campaign population, counts and remedy lack a primary record in the packet.' },
    { code: 'airbag-recall-primary-missing', severity: 'source-integrity', recordIds: [ids.airbagRecall], detail: 'Secondary reports name 20-C-192, but exact population, incident history and ground repair remain unverified.' },
    { code: 'airbag-diy-work-prohibited', severity: 'safety-accuracy', recordIds: [ids.airbagRecall], detail: 'The proposal prohibits owner probing of airbag wiring or ground work from secondary instructions.' },
    { code: 'handbrake-programme-and-wear-conflated', severity: 'technical-accuracy', recordIds: [ids.handbrake], detail: 'A claimed lever programme and cable wear are distinct, and a free repair cannot be promised without VIN eligibility.' },
    { code: 'timing-chain-four-engine-overreach', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'One root cause, mileage threshold and repair are assigned to four engine codes and transferred from Adam.' },
    { code: 'eps-cross-generation-inference', severity: 'technical-accuracy', recordIds: [ids.powerSteering], detail: 'The Corsa E page admits it imports the Corsa C/D pattern without Corsa E evidence.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: allIds, detail: 'Every solution has an explicit do-not-buy boundary and the proposal contains zero retail commerce.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'Every frozen report count is unknown zero and no 0+ owner language is introduced.' },
    { code: 'all-corsa-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Corsa URL, title, vehicle scope, category, severity or published status changes.' },
  ],
});
