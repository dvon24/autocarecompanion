/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records
  .filter((row) => ['RAM', 'Ram'].includes(row.make) && row.model === '1500')
  .sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const byId = new Map(rows.map((row) => [row.id, row]));

const ids = Object.freeze({
  cluster: 'ram-1500-digital-instrument-cluster-goes-blank-startup-while-driving',
  egr: 'ram-1500-ecodiesel-3-0l-egr-cooler-cracks-can-cause-intake-manifold-f',
  fuelPump: 'ram-1500-ecodiesel-fuel-pump-2014',
  hubEncoder: 'ram-1500-front-wheel-bearing-encoder-ring-damage-disables-electronic',
  tailgateRecall: 'ram-1500-power-tailgate-unlatches-opens-while-driving',
  trailerTow: 'ram-1500-trailer-tow-module-defect-trailer-brakes-lights-may-not-work',
  turnSignal: 'ram-1500-turn-signal-self-canceling-failure-from-steering-column-cont',
});
const retainedIds = Object.freeze(Object.values(ids).sort());
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));
const campaignEvidenceRequirements = Object.freeze({
  [ids.cluster]: [
    { campaign: '25V826000', patterns: ['software error', 'blank', 'instrument panel'] },
    { campaign: '26V225000', patterns: ['software error', 'critical safety information', 'update the instrument panel software'] },
  ],
  [ids.egr]: [{ campaign: '19V757000', patterns: ['cooler may crack', 'vaporized coolant', 'replace the EGR cooler'] }],
  [ids.fuelPump]: [
    { campaign: '22V406000', patterns: ['high pressure fuel pump', 'internal debris', 'replace the HPFP'] },
    { campaign: '22V767000', patterns: ['high pressure fuel pump', 'engine stall', 'replace the HPFP'] },
  ],
  [ids.hubEncoder]: [{ campaign: '24V794000', patterns: ['encoder rings', 'electronic stability control', 'wheel bearing hub assembly'] }],
  [ids.tailgateRecall]: [
    { campaign: '18V486000', patterns: ['tailgate actuator limiter tab', 'unlatch and open while driving', 'repair the vehicle'] },
    { campaign: '19V347000', patterns: ['tailgate actuator limiter tab', 'unlatch and open while driving', 'repair the tailgate latch'] },
    { campaign: '22V904000', patterns: ['misaligned tailgate strikers', 'tailgate opening while driving', 'inspect the tailgate striker alignment'] },
  ],
  [ids.trailerTow]: [{ campaign: '26V059000', patterns: ['trailer tow module', 'trailer brakes may fail', 'replace the trailer tow module'] }],
  [ids.turnSignal]: [{ campaign: '24V729000', patterns: ['self-canceling feature', 'turn signals', 'steering column control module'] }],
});

const duplicateGroups = Object.freeze([
  {
    label: 'exhaust-manifold tick',
    recordIds: [
      'ram-1500-5-7l-hemi-broken-exhaust-manifold-bolts-causing-cold-start-t',
      'ram-1500-5-7l-hemi-broken-exhaust-manifold-bolts-manifold-leak',
      'ram-1500-exhaust-manifold-bolts-2009',
    ],
  },
  {
    label: 'air-suspension failure',
    recordIds: [
      'ram-1500-4-corner-air-suspension-compressor-failure-won-t-raise-lower',
      'ram-1500-air-suspension-failure-2019',
      'ram-1500-optional-air-suspension-compressor-failure-ride-height-error',
    ],
  },
  {
    label: 'HEMI lifter/camshaft failure',
    recordIds: [
      'ram-1500-5-7l-hemi-mds-lifter-collapse-camshaft-lobe-wear',
      'ram-1500-hemi-lifter-2009',
    ],
  },
  {
    label: 'eTorque failure',
    recordIds: [
      'ram-1500-etorque-48v-mild-hybrid-belt-starter-generator-battery-pack',
      'ram-1500-etorque-mild-hybrid-2019',
    ],
  },
  {
    label: 'panoramic-sunroof leak/noise',
    recordIds: [
      'ram-1500-panoramic-sunroof-water-leak-wind-rattle-noise',
      'ram-1500-panoramic-sunroof-wind-noise-rattle-water-leak',
    ],
  },
  {
    label: 'TIPM/fuel-pump relay failure',
    recordIds: [
      'ram-1500-tipm-failure-2009',
      'ram-1500-tipm-internal-fuel-pump-relay-failure',
    ],
  },
  {
    label: 'Uconnect blank/freeze/reboot',
    recordIds: [
      'ram-1500-12-inch-uconnect-5-touchscreen-blank-black-screen-vertical-l',
      'ram-1500-uconnect-8-4-infotainment-freezes-reboots-backup-camera-glit',
      'ram-1500-uconnect-center-touchscreen-freezing-random-rebooting-blank',
    ],
  },
  {
    label: 'ZF eight-speed shift/shudder',
    recordIds: [
      'ram-1500-8speed-trans-2013',
      'ram-1500-transmission-shift-issues-2019',
      'ram-1500-zf-8-speed-torque-converter-shudder-harsh-shifting',
      'ram-1500-zf-8hp70-8-speed-torque-converter-shudder-harsh-shift-limp-m',
    ],
  },
]);

const diagnosticByCategory = Object.freeze({
  body: 'record the exact leak, latch, panel or noise location and reproduce it before separating seals, drains, glass, fasteners, wiring and structure',
  brakes: 'preserve ABS, brake and body-module faults and test power, grounds, wiring, wheel-speed inputs, hydraulic operation and the exact failed module or component',
  cooling: 'pressure-test the cold system and separate the pump, seal, hose, thermostat, radiator, reservoir, combustion-gas and overheat paths',
  drivetrain: 'reproduce the condition under the same load and mode, then inspect lubricant, leaks, bearings, joints, actuators, wiring and control faults separately',
  electrical: 'measure battery state and key-off draw, scan every module and separate software, network, power, ground, connector, sensor and hardware paths',
  emissions: 'preserve freeze-frame data, smoke-test the system and prove the leaking, switching, catalyst, sensor, wiring or engine-control path before replacement',
  engine: 'preserve oil-pressure, compression, leak-down, misfire, timing and module data and localize the mechanical, lubrication, ignition, fuel, cooling or control path',
  exhaust: 'inspect cold and hot, localize the leak or noise and separate manifold, fastener, gasket, shield, catalyst and internal-engine paths',
  exterior: 'document the exact finish, panel, impact history and prior repair before distinguishing coating adhesion, environmental damage, corrosion and refinishing',
  fuel: 'check campaign eligibility, preserve rail-pressure and contamination evidence and separate tank, lift-pump, high-pressure-pump, injector, wiring and control paths',
  hvac: 'measure pressures and temperatures and separate refrigerant leaks, airflow doors, actuators, sensors, wiring, compressor and control-software paths',
  interior: 'document the exact material, location, noise or leak and separate trim attachment, adhesive, seal, drain, glass, wiring and control paths',
  safety: 'check VIN campaign status and inspect the exact safety system before separating latch, restraint, lighting, wiring, software and mechanical paths',
  steering: 'scan steering and chassis modules and inspect assist power, grounds, wiring, rack, column, joints, bearings, tires and suspension under load',
  suspension: 'record ride height and temperature, scan chassis modules and leak-test before separating compressor, valve block, lines, bags, sensors, software and mechanical joints',
  transmission: 'preserve transmission faults and adaptation data, verify fluid condition and temperature and separate software, valve-body, converter, clutch, cooler and internal mechanical paths',
});

function duplicateConflict(id) {
  const group = duplicateGroups.find((entry) => entry.recordIds.includes(id));
  return group ? `This page overlaps ${group.recordIds.length - 1} other frozen ${group.label} identities; no merge, redirect, archive or canonical selection is authorized during content adjudication.` : '';
}

function heldIssue(row) {
  const diagnostic = diagnosticByCategory[row.category] || 'record and reproduce the exact condition, preserve fault data and isolate the failed system before replacement';
  const duplicate = duplicateConflict(row.id);
  return {
    description: `The complete frozen RAM/Dodge 1500 source pass (4,626 exact manufacturer-communication rows, 587 downloaded recall rows, and 98 current live-API campaigns for modern RAM 1500 model years) did not establish the full indexed identity “${row.title}” across every frozen year. Available records describe bounded campaigns, software levels, build populations and symptom-specific procedures rather than one universal mechanism or owner-frequency claim. This page therefore remains published as an identity hold; its title, routing and vehicle metadata are not changed in this proposal.`,
    solution: `Start with the exact symptom, build configuration and VIN rather than the title assumption: ${diagnostic}. Check open recalls and manufacturer procedures for the VIN, retain pre-repair measurements and stop driving when the condition compromises steering, braking, propulsion, visibility, restraint operation, creates a fuel/coolant leak, overheating or smoke. Do not buy a repair part from this page; the failed path, current part number, supersession, programming requirements and VIN fitment must be established first.`,
    symptoms: ['exact symptom, operating condition and build configuration recorded', 'complete module and pre-repair diagnostic data preserved', 'campaign, software, wiring and mechanical paths separated', 'failed component and VIN applicability established before parts'],
    affectedSystems: [`${row.category} system`, 'vehicle power, network and control paths where applicable', 'model-, year-, option- and VIN-specific hardware'],
    evidence: [
      'Every exact local NHTSA communication alias and downloaded recall row was included in the source inventory.',
      'The live NHTSA vehicle-year API was reconciled through the current date for 2011-2026 RAM 1500 campaigns.',
      'No manufacturer communication or campaign is converted into an owner-report count, recurrence rate or all-year mechanism.',
    ],
    conflict: [
      'The indexed identity exceeds one exact manufacturer or regulator source at full title and frozen-year scope.',
      duplicate,
    ].filter(Boolean).join(' '),
    summary: 'Held the overbroad or unresolved RAM 1500 identity, removed unsupported social proof and commerce, and restored symptom-led diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'failure path, current component and part number, supersession, programming requirements and VIN fitment remain unresolved; no universal retail part',
  };
}

function exactIssue(values) {
  return {
    ...values,
    commerceDecision: values.commerceDecision || 'campaign eligibility, completed remedy, current component and part number, programming requirements and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, heldIssue(row)]));

content[ids.cluster] = exactIssue({
  description: 'NHTSA campaigns 25V826 and 26V225 establish this identity for VIN-selected 2025-2026 RAM 1500 trucks. A software error can leave the instrument-panel display blank or unable to show safety information such as gear selection and warning lamps. The campaigns use different compliance scopes and remedies, so VIN status determines which action applies; neither campaign establishes an owner-frequency count.',
  solution: 'Check the VIN for 25V826 (FCA B4C/B8C) and 26V225 (FCA 35D). Have the dealer inspect and update instrument-cluster software or replace the cluster when the applicable campaign requires it, free of charge. If the display fails while driving, avoid relying on missing gear or warning information, move to a safe location and arrange service. Outside an open campaign, preserve cluster, body and network faults before diagnosis. Do not buy a cluster, display or control module from this page; campaign eligibility, software level, coding, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 25V826 and 26V225', 'blank or failed display condition recorded', 'cluster, power and vehicle-network faults preserved', 'software remedy separated from hardware replacement'],
  affectedSystems: ['instrument-panel cluster display', 'cluster software and vehicle network', 'gear-selection and safety-warning information'],
  evidence: ['25V826 identifies a blank cluster display caused by a software error.', '26V225 identifies failure to display critical safety information and specifies a software update.', 'Both campaigns cover VIN-selected 2025-2026 RAM 1500 vehicles.'],
  conflict: '', summary: 'Retained the exact 25V826/26V225 cluster-display identity and bounded it to VIN eligibility, safety response and campaign remedy.', citations: ['live2026', 'datasets'],
});

content[ids.egr] = exactIssue({
  description: 'NHTSA 19V757 / FCA VB1 establishes this identity for affected 2014-2019 RAM 1500 and 1500 Classic trucks with the 3.0L EcoDiesel. The EGR cooler may crack, allowing pre-heated vaporized coolant into the EGR system; the mixture can combust in the intake manifold and increase fire risk. The campaign is VIN-specific and does not establish an owner-frequency total.',
  solution: 'Check the VIN for 19V757 / VB1 and have the dealer replace the EGR cooler and inspect or replace the intake manifold as necessary, free of charge. If coolant loss, smoke, a burning odor or fire occurs, stop safely, shut down, exit and call emergency services when needed. Do not buy an EGR cooler or intake manifold from this page; campaign eligibility, completed remedy, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 19V757 / VB1', 'coolant loss and smoke or odor documented', 'EGR cooler and intake manifold inspected under campaign procedure', 'open recall and completed remedy confirmed'],
  affectedSystems: ['3.0L EcoDiesel EGR cooler', 'intake manifold', 'engine cooling and exhaust-gas recirculation'],
  evidence: ['19V757 identifies an EGR-cooler crack and vaporized-coolant path.', 'The consequence is possible intake-manifold combustion and fire.', 'The remedy replaces the cooler and inspects or replaces the intake manifold.'],
  conflict: '', summary: 'Retained the exact VB1 EcoDiesel EGR-cooler fire-risk identity and replaced secondary claims with the VIN-bounded recall condition and remedy.', citations: ['egrRecall', 'live2019', 'datasets'],
});

content[ids.fuelPump] = exactIssue({
  description: 'NHTSA 22V406 / FCA Z46 covers affected 2014-2019 RAM 1500 trucks with the 3.0L diesel, while 22V767 / FCA Z96 covers affected 2020-2022 RAM 1500 trucks with that engine. High-pressure fuel-pump failure can introduce debris or cause fuel starvation and an unexpected loss of drive power. Together the campaigns support the indexed model-year span, but only VIN-selected vehicles are included and no owner-frequency count is established.',
  solution: 'Check the VIN for Z46 / 22V406 and Z96 / 22V767. Have the dealer replace the high-pressure fuel pump and inspect or replace additional fuel-system components as necessary, free of charge. If the engine stalls or loses power, use hazards, steer and brake to a safe location and arrange service. Do not buy a high-pressure pump, injector, rail or fuel-system kit from this page; campaign eligibility, contamination extent, completed remedy, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for Z46 and Z96', 'stall or loss-of-power sequence recorded', 'rail pressure and contamination evidence preserved', 'pump and downstream fuel-system scope established'],
  affectedSystems: ['3.0L diesel high-pressure fuel pump', 'fuel rails, injectors and delivery system', 'engine fuel-pressure control'],
  evidence: ['22V406 covers affected 2014-2019 RAM 1500 diesels and identifies debris and fuel starvation.', '22V767 covers affected 2020-2022 RAM 1500 diesels and identifies HPFP failure and engine stall.', 'Both remedies replace the HPFP and inspect or replace additional fuel-system components as necessary.'],
  conflict: '', summary: 'Retained the exact EcoDiesel HPFP stall identity and separated the Z46 and Z96 VIN populations and contamination scope.', citations: ['live2019', 'live2022', 'datasets'],
});

content[ids.hubEncoder] = exactIssue({
  description: 'NHTSA 24V794 / FCA 97B establishes this identity for affected 2025 RAM 1500 vehicles. Damaged front-wheel-hub encoder rings can disable electronic stability control and cause an FMVSS 126 noncompliance. The remedy is VIN-specific inspection and front wheel bearing/hub replacement as necessary, not proof that every frozen vehicle needs a hub.',
  solution: 'Check the VIN for 24V794 / 97B and have the dealer inspect and replace the affected front wheel bearing/hub assembly as necessary, free of charge. Treat an ESC warning as a loss of an important stability aid and adjust driving until repaired. Outside the campaign, preserve wheel-speed and chassis faults and inspect wiring, sensor air gap, encoder ring and hub separately. Do not buy a hub, bearing or wheel-speed sensor from this page; campaign eligibility, failed side, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 24V794 / 97B', 'ESC and wheel-speed faults preserved', 'encoder ring and hub inspected', 'failed side separated from sensor and wiring paths'],
  affectedSystems: ['front wheel hub encoder rings', 'wheel-speed sensing', 'electronic stability control'],
  evidence: ['24V794 identifies damaged front wheel hub encoder rings.', 'The defect can disable electronic stability control.', 'The remedy is inspection and hub assembly replacement as necessary.'],
  conflict: '', summary: 'Retained the exact 97B encoder-ring identity and bounded it to affected 2025 VINs and inspection-led hub replacement.', citations: ['live2025', 'datasets'],
});

content[ids.tailgateRecall] = exactIssue({
  description: 'Three NHTSA campaigns establish two VIN-bounded mechanisms under this frozen identity. NHTSA 18V486 / FCA U74 and 19V347 / FCA V44 cover specified 2013-2018 RAM 1500 bed, build-date and power-locking-tailgate configurations in which a tailgate-actuator limiter tab may fracture and allow the tailgate to unlatch while driving. NHTSA 22V904 / FCA ZB8 separately covers affected 2019-2022 RAM 1500 trucks whose misaligned tailgate strikers may prevent proper latching and allow the tailgate to open while driving. Either condition can release unsecured cargo and create a road hazard; VIN, model year and equipment determine the applicable campaign.',
  solution: 'Check the VIN for U74 / 18V486, V44 / 19V347 and ZB8 / 22V904. Have the dealer complete the applicable free remedy: repair the tailgate latch for the limiter-tab campaigns, or inspect tailgate-striker alignment to the box latch and adjust it if necessary for ZB8. Until campaign status and remedy completion are confirmed, verify the tailgate is latched before every trip and secure cargo independently. Outside those campaigns, inspect the latch, striker, actuator, limiter, wiring and alignment before replacement. Do not buy a latch, actuator or striker from this page; campaign eligibility, bed configuration, failed component, current part number and VIN fitment must be established first.',
  symptoms: ['VIN, model year and bed configuration checked for U74, V44 and ZB8', 'unlatch event and cargo condition documented', 'latch, actuator limiter tab and striker alignment inspected', '2013-2018 limiter-tab campaigns separated from the 2019-2022 striker-alignment campaign'],
  affectedSystems: ['power-locking tailgate latch', 'tailgate actuator limiter tab', 'tailgate strikers and box latch alignment', 'cargo retention'],
  evidence: ['18V486 covers specified 2015-2017 bed configurations and identifies limiter-tab fracture.', '19V347 covers specified 2013-2018 bed and build populations and identifies the same limiter-tab failure path.', '22V904 covers affected 2019-2022 RAM 1500 trucks with misaligned tailgate strikers and specifies free striker-alignment inspection and adjustment.'],
  conflict: '', summary: 'Retained the exact power-tailgate recall identity while separating the U74/V44 limiter-tab populations from the ZB8 striker-alignment population and remedies.', citations: ['live2018', 'tailgate2022', 'datasets'],
});

content[ids.trailerTow] = exactIssue({
  description: 'NHTSA 26V059 / FCA 03D establishes this identity for affected 2025-2026 RAM 1500 trucks. An improperly designed trailer-tow module can prevent trailer lights from illuminating and trailer brakes from operating, increasing crash risk. The campaign is VIN-specific and does not establish an owner-frequency count.',
  solution: 'Check the VIN for 26V059 / 03D and have the dealer replace the trailer-tow module free of charge. Do not tow until campaign status is known and trailer brake, brake-light and turn-signal operation has been verified with the connected trailer. Do not buy a tow module, brake controller or harness from this page; campaign eligibility, module state, connector condition, programming, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 26V059 / 03D', 'trailer brake and lamp operation tested', 'module, connector and harness condition documented', 'completed campaign remedy confirmed'],
  affectedSystems: ['integrated trailer-tow module', 'trailer brakes', 'trailer brake lights and turn signals'],
  evidence: ['26V059 identifies an improperly designed trailer-tow module.', 'The defect can disable trailer lamps and trailer brakes.', 'The remedy replaces the module free of charge.'],
  conflict: '', summary: 'Retained the exact 03D trailer-tow-module identity and added a no-tow verification boundary before parts.', citations: ['live2026', 'datasets'],
});

content[ids.turnSignal] = exactIssue({
  description: 'NHTSA 24V729 / FCA A1B establishes this identity for affected 2023-2024 RAM 1500 vehicles. The turn-signal self-canceling feature may not work correctly, creating an FMVSS 108 noncompliance and increasing crash risk when the displayed signal does not match driver intent. The remedy is VIN-specific inspection and steering-column-control-module replacement as necessary.',
  solution: 'Check the VIN for 24V729 / A1B and have the dealer inspect and replace the steering-column control module as necessary, free of charge. Until repaired, cancel the signal manually after every turn and verify the indicator state. Outside the campaign, inspect the switch, column module, clockspring, wiring and configuration before replacement. Do not buy a steering-column module or switch from this page; campaign eligibility, failed component, programming, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 24V729 / A1B', 'self-canceling behavior reproduced', 'switch, column module and wiring inspected', 'indicator state verified after every turn'],
  affectedSystems: ['steering-column control module', 'turn-signal switch and cancellation logic', 'exterior turn-signal indication'],
  evidence: ['24V729 identifies improper turn-signal self-canceling operation.', 'The condition is an FMVSS 108 noncompliance.', 'The remedy inspects and replaces the steering-column control module as necessary.'],
  conflict: '', summary: 'Retained the exact A1B turn-signal self-canceling identity and bounded it to affected 2023-2024 VINs.', citations: ['live2024', 'datasets'],
});

const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  live2018: { title: 'NHTSA Live RAM 1500 2018 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2018' },
  live2019: { title: 'NHTSA Live RAM 1500 2019 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2019' },
  live2022: { title: 'NHTSA Live RAM 1500 2022 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2022' },
  tailgate2022: { title: 'NHTSA 22V904 / FCA ZB8 - RAM Tailgate Striker Alignment', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2022/RCAK-22V904-6414.pdf' },
  live2024: { title: 'NHTSA Live RAM 1500 2024 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2024' },
  live2025: { title: 'NHTSA Live RAM 1500 2025 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2025' },
  live2026: { title: 'NHTSA Live RAM 1500 2026 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=1500&modelYear=2026' },
  egrRecall: { title: 'NHTSA 19V757 - RAM 1500 EcoDiesel EGR Cooler', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V757-2821.PDF' },
});

module.exports = Object.freeze({
  make: 'RAM',
  frozenMakeValues: ['RAM', 'Ram'],
  model: '1500',
  slug: '1500',
  reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json',
  snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623',
  snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-1500-live-recalls-2026-08-11.json',
  outputFile: 'data/known-issue-ram-1500-adjudication-2026-08-11.json',
  ids,
  allIds,
  retainedIds,
  reportCountCleanupIds,
  campaignEvidenceRequirements,
  duplicateGroups,
  sourceMakes: ['RAM', 'DODGE'],
  modelAliases: ['1500', 'RAM 1500', 'RAM', 'RAM PICKUP', 'BR1500', 'REDUNDANT RAM 1500'],
  searchTerms: ['uconnect', 'screen', 'battery', 'misfire', 'camshaft', 'bearing', 'coolant', 'air suspension', 'transmission', '4wd', 'exhaust manifold', 'water pump', 'abs', 'camera', 'water leak', 'rear window', 'tailgate', 'instrument cluster', 'egr', 'fuel pump', 'steering', 'etorque', 'wheel bearing', 'sunroof', 'tipm', 'trailer tow', 'turn signal'],
  relevantDocumentIds: [],
  campaigns: ['18V486000', '19V347000', '19V757000', '22V406000', '22V767000', '22V904000', '24V729000', '24V794000', '25V826000', '26V059000', '26V225000'],
  pdfSources: {},
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 165, '2000-2004': 291, '2005-2009': 118, '2010-2014': 33, '2015-2019': 1269, '2020-2024': 2111, '2025-2026': 639 },
    totalRows: 4626,
    broadTermMatchedRows: 1759,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'All 4,626 exact RAM/Dodge 1500 communication rows across six aliases were included. Exact campaigns retain seven identities; the remaining pages exceed a single source at full frozen-title and year scope or collide with frozen duplicate identities.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 200, post: 387 },
    totalRows: 587,
    downloadedCampaignCount: 198,
    liveModernCampaignCount: 98,
    newlyObservedCampaigns: ['26V495000'],
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'All 587 downloaded exact-alias recall rows were reconciled with 98 campaigns returned by the live RAM 1500 API for 2011-2026. Campaign 26V495 is newer than the downloaded flat file and concerns rear-seat-buckle anchorage; it does not match any frozen 1500 identity.',
  },
  content,
  requiredProse: [
    ...retainedIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN'] })),
    { id: ids.cluster, field: 'description', patterns: ['25V826', '26V225', 'software error'] },
    { id: ids.egr, field: 'description', patterns: ['19V757', 'EGR cooler', 'intake manifold'] },
    { id: ids.fuelPump, field: 'description', patterns: ['22V406', '22V767', 'high-pressure fuel-pump'] },
    { id: ids.hubEncoder, field: 'description', patterns: ['24V794', 'encoder rings', 'stability control'] },
    { id: ids.tailgateRecall, field: 'description', patterns: ['18V486', '19V347', '22V904', 'limiter tab', 'misaligned tailgate strikers', '2019-2022'] },
    { id: ids.tailgateRecall, field: 'solution', patterns: ['ZB8', 'inspect tailgate-striker alignment', 'adjust it if necessary', 'Do not buy'] },
    { id: ids.trailerTow, field: 'description', patterns: ['26V059', 'trailer-tow module', 'trailer brakes'] },
    { id: ids.turnSignal, field: 'description', patterns: ['24V729', 'self-canceling', 'FMVSS 108'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 61 frozen RAM/Ram 1500 rows are represented exactly once.' },
    { code: 'make-case-split-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'The 25 RAM and 36 Ram rows remain byte-identical on make; no casing normalization, route merge or canonical move is authorized.' },
    { code: 'seven-identities-retained', severity: 'technical-accuracy', recordIds: retainedIds, detail: 'Seven frozen identities match exact VIN-bounded campaigns after unsupported frequency and universal-scope claims are removed.' },
    { code: 'remaining-identities-held', severity: 'identity-safety', recordIds: allIds.filter((id) => !retainedIds.includes(id)), detail: 'Every other frozen identity remains published pending independent identity review; none is archived, redirected or relabeled.' },
    { code: 'duplicate-clusters-held', severity: 'identity-safety', recordIds: duplicateGroups.flatMap((group) => group.recordIds), detail: 'Eight duplicate/overlap clusters remain frozen because content adjudication cannot select canonicals or change indexed identities.' },
    { code: 'live-recall-reconciled', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA live recalls were checked for every frozen 2011-2026 year; new campaign 26V495 does not match a frozen identity and no new page is introduced.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Ten unsupported owner totals are proposed as unknown zero and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record, search-style commerce URL or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make casing, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
  rowById(id) { return byId.get(id); },
});
