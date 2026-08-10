/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  wetBelt: 'opel-combo-1-2-puretech-petrol-wet-timing-belt-premature-failure',
  fuelRail: 'opel-combo-1-5-bluehdi-diesel-fuel-rail-leak-engine-bay-fire-risk',
  compressor: 'opel-combo-air-conditioning-compressor-stator-wiring-fault-causing-powe',
  adblue: 'opel-combo-diesel-adblue-scr-system-failure-preventing-engine-restart',
  egrDpf: 'opel-combo-diesel-egr-valve-dpf-clogging-short-journey-use',
  seats: 'opel-combo-front-seats-do-not-fully-recline',
  infotainment: 'opel-combo-infotainment-touchscreen-freezing-crashing-failing-to-respon',
  parkingBrake: 'opel-combo-parking-brake-lever-may-fail-to-lock-engaged-position',
  steering: 'opel-combo-steering-inner-tie-rods-steering-column-not-built-to-specifi',
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
  [ids.wetBelt]: held({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines, with conditional coverage up to 10 years or 112,000 miles. The announcement does not identify Opel Combo applicability, prove every frozen 2018-2023 Combo uses the affected generation, or support the frozen causal chain and engine-destruction scope for this model.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan, document any oil-pressure warning or visible belt concern, and ask an authorized repairer to assess Stellantis support eligibility before authorizing work. Stop driving if an oil-pressure warning appears. Do not buy a belt kit, oil strainer or engine from this page; generation, diagnosis and VIN fitment must be established first.',
    symptoms: ['engine generation and timing drive verified', 'oil-pressure warning treated as a stop condition', 'maintenance records retained for support eligibility'],
    systems: ['PureTech timing drive', 'engine lubrication and oil pickup', 'VIN-gated support eligibility'],
    evidence: ['Stellantis recognizes premature timing-belt degradation on previous PureTech generations.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The official announcement does not map affected engines to every frozen Combo year.'],
    conflict: 'The indexed identity maps a family-level PureTech condition and catastrophic outcome to every 2018-2023 Combo without exact model and engine-generation evidence.',
    summary: 'Held the overbroad Combo wet-belt identity while preserving the exact Stellantis support boundary.',
    citations: ['stellantisPuretech'],
  }),
  [ids.fuelRail]: held({
    description: 'The reviewed packet contains no manufacturer or regulator record that identifies the exact Opel Combo production population for the frozen 2025-2026 high-pressure fuel-rail claim. The frozen article relies on a secondary aggregation, expands a reported July-to-October 2025 build window into two indexed model years, and appends an unrelated NOx-sensor recall to the fuel-leak identity.',
    solution: 'Treat diesel odor, visible fuel or smoke as urgent: stop safely, switch off, keep ignition sources away and arrange recovery. Check the VIN with Opel/Vauxhall for open safety campaigns and have the high-pressure fuel system inspected by an authorized repairer. Do not loosen a pressurized rail connection. Do not buy a rail, sensor or injector from this page; the exact campaign, leak point and VIN fitment must be established first.',
    symptoms: ['diesel odor or visible fuel treated as urgent', 'NOx-sensor condition kept separate', 'VIN campaign eligibility verified'],
    systems: ['DV5R high-pressure fuel rail', 'fuel connections and engine-bay heat sources', 'separate NOx sensor and emissions system'],
    evidence: ['The reviewed NHTSA corpus contains zero Opel/Vauxhall Combo rows.', 'No exact primary campaign document in the packet proves the frozen 2025-2026 population.', 'The NOx-sensor statement is not evidence for the fuel-leak identity.'],
    conflict: 'The indexed identity extrapolates a secondary recall summary across two years and conflates a separate NOx-sensor action.',
    summary: 'Held the unverified fuel-rail population and separated the unrelated NOx-sensor claim.',
  }),
  [ids.compressor]: held({
    description: 'No exact Opel/Vauxhall Combo manufacturer or regulator document in the reviewed packet establishes a 2019-2022 air-conditioning-compressor stator-wiring recall or a complete powertrain-shutdown population. The frozen page cites a secondary Combo index and a Corsa-e recall, then transfers the Corsa-e mechanism to Combo without model, propulsion or VIN evidence.',
    solution: 'If propulsion is lost, use hazard warnings, steer and brake to a safe stop, switch the vehicle off and arrange recovery. Ask Opel/Vauxhall to check the VIN for applicable campaigns and diagnose the compressor circuit and propulsion system using model-specific service information. Do not buy a compressor, stator or wiring harness from this page; the exact propulsion variant, campaign and failed circuit must be established first.',
    symptoms: ['propulsion loss handled as a stop-and-recover event', 'compressor and propulsion faults diagnosed separately', 'VIN and propulsion variant confirmed'],
    systems: ['air-conditioning compressor circuit', 'high-voltage or engine propulsion controls', 'vehicle power distribution'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'The cited detailed recall is for Corsa-e rather than Combo.', 'No exact source supports every frozen year or propulsion variant.'],
    conflict: 'The indexed identity transfers a Corsa-e recall mechanism to Combo and omits the propulsion variant needed to define the risk.',
    summary: 'Held the cross-model compressor-shutdown identity and replaced recall inference with safe VIN-specific diagnosis.',
  }),
  [ids.adblue]: held({
    description: 'The frozen page describes a generic regulated SCR restart countdown, then groups low fluid, NOx sensors, tank sensors, fluid quality, crystallization and catalyst damage into one 2018-2024 Combo defect. No exact Opel/Vauxhall primary source in the reviewed packet establishes that population, a common failure mechanism or the claimed effect of unspecified non-ISO fluid.',
    solution: 'Follow the owner-manual warning and use only fluid meeting the exact specified standard. Record the countdown, warning text and DTCs; if a compliant top-up does not clear the warning through the documented procedure, obtain SCR diagnosis before the restart limit is reached. Do not buy a tank, NOx sensor, injector, catalyst or cleaning service from this page; the stored fault, fluid state and exact VIN fitment must be established first.',
    symptoms: ['warning text and remaining restart distance recorded', 'fluid quantity and specification verified', 'sensor, injector and catalyst paths separated'],
    systems: ['AdBlue tank and dosing system', 'NOx sensors and SCR catalyst', 'engine restart-inhibition logic'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'No exact source supports one model-wide SCR failure population.', 'Several distinct causes are presented as interchangeable without DTC or test boundaries.'],
    conflict: 'The indexed identity converts a generic emissions countdown and several possible causes into one Combo defect and shopping path.',
    summary: 'Held the conflated AdBlue/SCR identity and replaced generic reset advice with documented warning and DTC diagnosis.',
  }),
  [ids.egrDpf]: held({
    description: 'Short-trip operation can affect diesel aftertreatment, but the frozen page turns a usage condition into a 2018-2023 Combo defect and combines EGR deposits, DPF loading, injectors and turbo boost without exact manufacturer evidence. The secondary sources do not establish one affected population, the stated feedback loop, or a universal road-speed regeneration recipe.',
    solution: 'Follow the exact owner-manual regeneration guidance and warning instructions for the VIN. Record DTCs, calculated soot load, differential pressure, exhaust temperature, EGR command, injector correction and boost before forced regeneration or parts replacement. Do not attempt a forced regeneration where overheating or fire risk is present. Do not buy an EGR valve, DPF, injector or turbo part from this page; the failed path and exact fitment must be established first.',
    symptoms: ['DPF soot load and pressure measured', 'EGR, injector and boost faults diagnosed separately', 'regeneration performed only under documented safe conditions'],
    systems: ['EGR valve and intake path', 'DPF pressure and regeneration controls', 'fuel injection and turbo boost'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'No exact source establishes a 2018-2023 model-wide population.', 'The frozen 10-15 minute at 65 km/h recipe is not VIN-specific service guidance.'],
    conflict: 'The indexed identity conflates a use pattern with four distinct failure paths and gives an unsupported universal regeneration instruction.',
    summary: 'Held the generic short-trip EGR/DPF identity and replaced the road-speed recipe with measured, manual-bound diagnosis.',
  }),
  [ids.seats]: held({
    description: 'The frozen title itself labels the condition a design limitation rather than a defect. A single forum thread does not establish a production-wide recline angle, common seat-frame design across every 2018-2024 Combo Life, or platform-wide equivalence with Berlingo and Rifter variants. This page therefore does not currently meet a known-issue evidence threshold.',
    solution: 'Before purchase or trip planning, test the exact seat and consult the owner manual for adjustment limits and safe use. Do not modify the seat frame, recliner, mounts, belts or airbags to gain additional travel. Do not buy a recliner mechanism, extender or seat modification from this page; equipment variant, restraint safety and legal fitment must be established first.',
    symptoms: ['seat travel tested on the exact vehicle', 'equipment variant and restraint layout confirmed', 'design behavior separated from mechanical failure'],
    systems: ['front seat frame and recliner', 'seat mounting and restraints', 'seat-mounted airbags and occupant safety'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'The frozen source is one secondary owner discussion.', 'The title admits a design limitation, not a defect.'],
    conflict: 'The indexed known-issue identity is based on a design preference and an unverified platform-wide recline-angle claim.',
    summary: 'Held the non-defect seat-recline identity and prohibited restraint-affecting modifications.',
  }),
  [ids.infotainment]: held({
    description: 'No exact Opel/Vauxhall Combo communication in the reviewed primary corpus establishes a 2018-2022 touchscreen-freezing population, a shared head unit across all listed vehicles or a software-only cause. The frozen page relies on Combo and Grandland forum posts and gives several unverified button, battery-disconnect and replacement procedures as though they apply universally.',
    solution: 'Record the display state, audio, camera, phone connection, software version, battery voltage and DTCs, then follow the exact owner-manual restart procedure and current VIN-specific update guidance. Preserve camera and safety-function evidence before resetting. Do not disconnect the battery or use a button combination copied from another model without service guidance. Do not buy a head unit from this page; software, power, network and hardware causes must be separated first.',
    symptoms: ['display, camera, audio and phone functions tested separately', 'software version and battery state recorded', 'model-specific restart procedure verified'],
    systems: ['infotainment display and head unit', 'phone projection and software', 'camera, power and vehicle network'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'A Grandland forum procedure does not establish Combo applicability.', 'No exact source proves a software-only cause or universal head-unit replacement.'],
    conflict: 'The indexed identity turns forum symptoms and cross-model reset advice into a five-year Combo software defect.',
    summary: 'Held the unsupported infotainment identity and removed cross-model reset and battery-disconnect instructions.',
  }),
  [ids.parkingBrake]: held({
    description: 'The frozen page combines two secondary recall summaries: a 2017-2019 ratchet-alignment claim and a separate 2021 lever-engagement claim. No exact manufacturer or regulator campaign record in the packet establishes the combined indexed years, one mechanism or one remedy, and the omission of 2020 confirms this is not a continuous defect population.',
    solution: 'Check the VIN with Opel/Vauxhall for every open parking-brake campaign. Until eligibility and repair status are confirmed, park on level ground where possible, select the documented gear or Park, fully apply the brake and use wheel chocks where appropriate. If the lever will not latch, do not rely on it. Do not buy a lever or ratchet assembly from this page; the exact campaign, mechanism and VIN fitment must be established first.',
    symptoms: ['lever latching verified without assuming one mechanism', '2017-2019 and 2021 populations kept separate', 'VIN recall status confirmed'],
    systems: ['parking-brake lever and ratchet', 'cables and rear brake application', 'vehicle rollaway prevention'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'The frozen article relies on two secondary recall summaries.', 'The non-contiguous years and separate claims do not establish one identity.'],
    conflict: 'The indexed identity merges two recall populations and mechanisms into one page without exact campaign records.',
    summary: 'Held the merged parking-brake recall identity and preserved conservative rollaway precautions.',
  }),
  [ids.steering]: held({
    description: 'The frozen page explicitly combines two separate steering recalls: inner tie rods on some 2019-2020 vehicles and a steering column on some 2019 vehicles. A secondary recall index does not define either VIN population, defect mechanism or remedy, and it cannot support treating two different components as one indexed failure.',
    solution: 'Check the VIN with Opel/Vauxhall for all open steering campaigns. Treat sudden steering play, binding or loss of control as unsafe and arrange inspection or recovery rather than continuing to drive. The repairer must identify the applicable campaign and inspect the specified component. Do not buy tie rods or a steering column from this page; the campaign, failed component and exact VIN fitment must be established first.',
    symptoms: ['tie-rod and steering-column conditions kept separate', 'steering play or binding treated as urgent', 'VIN campaign eligibility confirmed'],
    systems: ['inner tie rods and steering linkage', 'steering column', 'steering control and campaign eligibility'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Combo rows.', 'The frozen source is a secondary recall index rather than exact campaign evidence.', 'Two components and populations are merged under one identity.'],
    conflict: 'The indexed identity combines separate tie-rod and steering-column recalls without exact campaign or VIN boundaries.',
    summary: 'Held the conflated steering-recall identity pending exact campaign evidence and identity policy.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  stellantisPuretech: {
    title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy',
    type: 'manufacturer',
    url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines',
    contains: 'premature degradation of the timing belt',
  },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Combo', slug: 'combo', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-opel-combo-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'],
  modelAliases: ['COMBO'],
  searchTerms: ['timing belt', 'PureTech', 'fuel rail', 'fuel leak', 'fire', 'compressor', 'powertrain shutdown', 'AdBlue', 'SCR', 'EGR', 'DPF', 'seat', 'infotainment', 'parking brake', 'handbrake', 'tie rod', 'steering column'],
  relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL COMBO rows; this is a disclosed U.S.-corpus limitation, not proof that a non-U.S. condition does not exist.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL COMBO rows; secondary European recall summaries are held until exact manufacturer or regulator campaign documents are available.',
  },
  content,
  requiredProse: [
    { id: ids.wetBelt, field: 'description', patterns: ['does not identify Opel Combo applicability', 'every frozen 2018-2023 Combo'] },
    { id: ids.fuelRail, field: 'description', patterns: ['no manufacturer or regulator record', 'unrelated NOx-sensor recall'] },
    { id: ids.compressor, field: 'description', patterns: ['cites.*Corsa-e recall', 'transfers the Corsa-e mechanism to Combo'] },
    { id: ids.adblue, field: 'description', patterns: ['groups low fluid, NOx sensors, tank sensors', 'one 2018-2024 Combo defect'] },
    { id: ids.egrDpf, field: 'description', patterns: ['turns a usage condition into a 2018-2023 Combo defect', 'universal road-speed regeneration recipe'] },
    { id: ids.seats, field: 'description', patterns: ['design limitation rather than a defect', 'does not currently meet a known-issue evidence threshold'] },
    { id: ids.infotainment, field: 'solution', patterns: ['Do not disconnect the battery', 'copied from another model'] },
    { id: ids.parkingBrake, field: 'description', patterns: ['combines two secondary recall summaries', 'omission of 2020'] },
    { id: ids.steering, field: 'description', patterns: ['two separate steering recalls', 'two different components'] },
  ],
  observations: [
    { code: 'all-nine-held', severity: 'identity-safety', recordIds: allIds, detail: 'All nine Combo pages remain published, but every identity exceeds exact primary evidence or merges distinct conditions.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL COMBO rows; the packet discloses that geographic limitation.' },
    { code: 'puretech-family-not-combo-population', severity: 'technical-accuracy', recordIds: [ids.wetBelt], detail: 'Stellantis confirms previous-generation PureTech belt degradation but does not map it to every 2018-2023 Combo.' },
    { code: 'fuel-rail-nox-conflation', severity: 'safety-accuracy', recordIds: [ids.fuelRail], detail: 'The frozen page appends an unrelated NOx-sensor recall and expands a reported 2025 build window into 2025-2026.' },
    { code: 'corsa-e-recall-transferred-to-combo', severity: 'safety-accuracy', recordIds: [ids.compressor], detail: 'A Corsa-e compressor recall is used as the detailed evidence for a Combo page with no propulsion variant.' },
    { code: 'scr-countdown-not-one-defect', severity: 'technical-accuracy', recordIds: [ids.adblue], detail: 'Low fluid, tank sensors, NOx sensors, dosing and catalyst conditions cannot be one defect or universal parts list.' },
    { code: 'dpf-driving-recipe-unverified', severity: 'safety-accuracy', recordIds: [ids.egrDpf], detail: 'The universal 10-15 minute/65 km-h regeneration instruction is not exact VIN service guidance.' },
    { code: 'seat-design-not-defect', severity: 'identity-safety', recordIds: [ids.seats], detail: 'The title itself identifies a design limitation; a forum preference does not establish a known defect.' },
    { code: 'cross-model-infotainment-reset', severity: 'safety-accuracy', recordIds: [ids.infotainment], detail: 'Grandland button procedures and generic battery-disconnect advice are not verified for Combo.' },
    { code: 'parking-brake-populations-merged', severity: 'safety-accuracy', recordIds: [ids.parkingBrake], detail: 'Separate 2017-2019 and 2021 secondary recall summaries are merged, with 2020 omitted.' },
    { code: 'steering-recalls-merged', severity: 'safety-accuracy', recordIds: [ids.steering], detail: 'Inner tie-rod and steering-column recalls are distinct components and populations.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: allIds, detail: 'Every solution carries an explicit do-not-buy boundary and no product link is introduced.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'Every frozen report count is unknown zero and the packet forbids 0+ owner messaging.' },
    { code: 'all-combo-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Combo page is removed, archived, redirected, renamed or allowed to lose its vehicle metadata.' },
  ],
});
