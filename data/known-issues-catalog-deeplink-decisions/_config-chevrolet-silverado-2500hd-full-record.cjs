const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  shudder: source(
    'tsb',
    'GM Preliminary Information PIP5541 - Shudder or Vibration from the Transmission',
    'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129052-9999.pdf',
  ),
  exhaustFasteners: source(
    'tsb',
    'GM Bulletin 24-NA-253 - Loose or Incorrect Exhaust Fasteners',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011834-0001.pdf',
  ),
  lb7Injectors: source(
    'tsb',
    'GM Special Policy 04039 - LB7 Injector Replacement (attached to NHTSA ODI complaint 10130187)',
    'https://static.nhtsa.gov/odi/cmpl/2005/CL-10130187-3199.pdf',
  ),
  harness: source(
    'tsb',
    'GM Customer Satisfaction Program 15766 - Engine Harness Chafing on EGR Stud',
    'https://static.nhtsa.gov/odi/tsbs/2015/SB-10074771-7690.pdf',
  ),
  steering: source(
    'tsb',
    'GM Service Update 14713 - Steering Gear Assembly Replacement',
    'https://static.nhtsa.gov/odi/tsbs/2015/SB-10081086-0335.pdf',
  ),
  transferCase: source(
    'tsb',
    'GM Service Update N222367650 - Transfer Case Fasteners Incorrect Torque',
    'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225613-0001.pdf',
  ),
};

const cards = {
  shudder: {
    years: [2017, 2018],
    engines: ['6.6L Duramax diesel (RPO L5P)'],
    trims: ['Allison transmission (RPO MW7)'],
    category: 'transmission',
    title: 'Light-Throttle Shudder Requires Engine-vs-Transmission Diagnosis (PIP5541)',
    description: 'GM preliminary information PIP5541 applies to 2017-2018 Silverado HD trucks with the L5P Duramax and MW7 Allison transmission. It describes a shake, vibration or rumble-strip-like shudder during steady light-throttle acceleration from about 25 to 70 mph, including after the 2-3 shift. GM warns that an engine-performance disturbance can feel like torque-converter-clutch shudder.',
    solution: 'Have a qualified technician reproduce and record the vibration with the GM Pico-scope procedure. A high E0.5 disturbance points to an engine-performance concern rather than torque-converter-clutch shudder. Diagnose the identified source before replacing a converter or exchanging fluid; PIP5541 does not prescribe either repair for every truck.',
    severity: 'medium',
    symptoms: ['Light-throttle shake or vibration between about 25 and 70 mph', 'Rumble-strip-like shudder', 'Shudder after the 2-3 shift'],
    affectedSystems: ['engine performance', 'Allison transmission vibration diagnosis'],
    sources: [sources.shudder],
    summary: 'Narrowed the 20-year Allison aggregation to PIP5541\'s exact 2017-2018 L5P/MW7 diagnostic population and removed unverified fluid, converter and DTC claims.',
  },
  exhaustFasteners: {
    years: [2023],
    engines: ['6.6L Duramax diesel (RPO L5P)'],
    category: 'exhaust',
    title: 'Mismatched L5P Exhaust Fasteners Can Loosen or Damage Threads After Repair (24-NA-253)',
    description: 'GM bulletin 24-NA-253 covers 2023 Silverado 2500HD/3500HD trucks with the L5P diesel. A prior repair can leave loose or damaged exhaust-manifold, turbo-adapter or EGR-valve fasteners when a standard bolt is paired with a standard-threaded component, or a Powerlok bolt is paired with a 30-degree ramp-angle-thread component. This is not a model-wide spontaneous bolt-breakage finding.',
    solution: 'A technician should identify the installed component design by its part number and thread form, not bolt color alone, then use the matching fastener specified in bulletin 24-NA-253 and the published torque procedure. Do not drill the cylinder head or replace a manifold solely from a cold-start tick without first locating and confirming the leak or loose fastener.',
    severity: 'medium',
    symptoms: ['Loose exhaust-system fastener after a prior repair', 'Damaged exhaust fastener or threaded component'],
    affectedSystems: ['exhaust manifold fasteners', 'turbocharger-adapter fasteners', 'EGR-valve fasteners'],
    sources: [sources.exhaustFasteners],
    summary: 'Replaced the unsupported 1999-2025 broken-bolt claim with bulletin 24-NA-253\'s exact 2023 L5P prior-repair fastener-matching condition.',
  },
  lb7Injectors: {
    years: [2001, 2002, 2003, 2004],
    engines: ['6.6L Duramax diesel (RPO LB7, VIN code 1)'],
    category: 'fuel',
    title: 'LB7 Injector High Return Flow or Fuel Leakage (GM Special Policy 04039)',
    description: 'GM special policy 04039 covered specified 2001-2004 Silverado trucks with the LB7 Duramax. The documented injector failure modes were high return flow caused by injector-body cracks, ball-seat erosion or high-pressure-seal extrusion. Symptoms can include a service-engine-soon light, reduced power, hard starting or fuel entering the crankcase. The policy did not cover later LLY, LBZ or LML engines.',
    solution: 'Have a diesel-qualified technician confirm the engine RPO and perform the GM return-flow and fuel-in-crankcase diagnostics before replacing injectors. Replace only under the current service procedure for the confirmed failure. Special policy 04039 was historical coverage with a time-and-mileage limit, so owners should not assume a free repair remains available.',
    severity: 'high',
    symptoms: ['Service-engine-soon light', 'Low engine power', 'Hard start', 'Fuel in the crankcase', 'Excessive injector return flow'],
    affectedSystems: ['LB7 common-rail fuel injectors', 'engine oil contaminated by diesel fuel'],
    sources: [sources.lb7Injectors],
    summary: 'Bounded the injector card to GM special policy 04039\'s 2001-2004 LB7 population and confirmed failure modes; removed later engines, guessed DTCs and parts links.',
  },
  harness: {
    years: [2015],
    engines: ['6.6L Duramax diesel (RPO LML)'],
    category: 'electrical',
    title: 'Engine Harness Can Chafe on the EGR Stud (Program 15766)',
    description: 'GM customer satisfaction program 15766 identifies certain VIN-listed 2015 Silverado HD trucks with the LML Duramax whose main engine harness may chafe on the EGR stud. The program does not describe a harness routed under the valve covers or establish injector-circuit failures across 2001-2016.',
    solution: 'Check the VIN and service history with a GM dealer. The program procedure is to inspect the main engine harness, repair damaged wiring using the service-information wiring procedure, reroute connector X107 under the main harness and install the specified standoff clip on the EGR stud. The program\'s no-charge period ended November 30, 2017, so confirm current coverage.',
    severity: 'medium',
    symptoms: ['Visible main-engine-harness contact or chafing at the EGR stud', 'Damaged wiring near connector X107'],
    affectedSystems: ['main engine wiring harness', 'EGR-stud harness routing', 'connector X107'],
    sources: [sources.harness],
    summary: 'Replaced the broad injector-harness narrative with VIN-bounded 2015 LML program 15766, its exact EGR-stud chafe point and no-parts rerouting repair.',
  },
  steering: {
    years: [2015],
    trims: ['VIN-identified Silverado HD Regular Cab, Double Cab or Crew Cab'],
    category: 'steering',
    title: 'Incorrect Steering-Gear Thrust Bearing Can Cause Free Play (Service Update 14713)',
    description: 'GM service update 14713 applies to approximately 91 VIN-identified 2015 Silverado HD trucks. Some steering gears were assembled with an incorrect thrust bearing, which can make the driver feel lash, looseness or free play at the steering wheel. It is a narrow production condition, not evidence that all 2001-2015 trucks need front-end parts.',
    solution: 'Ask a GM dealer to check the VIN and completion history for service update 14713. The update directed replacement of the hydraulic recirculating-ball steering gear and bleeding the power-steering system on involved vehicles. Its published eligibility expired with the base warranty, so current coverage must be confirmed.',
    severity: 'high',
    symptoms: ['Steering-wheel lash', 'Loose or free-play sensation at the steering wheel'],
    affectedSystems: ['hydraulic recirculating-ball steering gear', 'steering-gear thrust bearing'],
    sources: [sources.steering],
    summary: 'Replaced forum-based steering wander and blanket linkage replacement with service update 14713\'s exact VIN-bounded 2015 steering-gear condition.',
  },
  transferCase: {
    years: [2022],
    category: 'drivetrain',
    title: 'Transfer-Case Fasteners May Have Incorrect Assembly Torque (N222367650)',
    description: 'GM service update N222367650 covers approximately five VIN-identified 2022 Silverado 2500HD/3500HD and Sierra 2500HD/3500HD vehicles. GM states that transfer-case fasteners may have been incorrectly torqued at the assembly plant. This is separate from an encoder-motor, switch, wiring or four-wheel-drive-control diagnosis.',
    solution: 'Have a GM dealer verify the VIN and completion history. The update directs technicians to inspect for missing fasteners or surrounding damage and torque or replace the specified transfer-case nuts or bolts using the L5P- or L8T-specific procedure. The update expired with the new-vehicle limited warranty, so confirm current coverage.',
    severity: 'high',
    symptoms: ['VIN listed in service update N222367650', 'Missing or incorrectly torqued transfer-case fastener found during inspection'],
    affectedSystems: ['transfer-case mounting fasteners', 'transmission-to-transfer-case attachment'],
    sources: [sources.transferCase],
    summary: 'Replaced the 1999-2025 encoder-motor aggregation with service update N222367650\'s exact 2022 VIN population and torque-inspection procedure.',
  },
};

const published = {
  'chevrolet-silverado-2500hd-allison-trans': replacement(
    cards.shudder,
    'Replace the 2001-2020 torque-converter diagnosis and shopping link with PIP5541, which requires separating engine E0.5 disturbance from transmission shudder on exact 2017-2018 L5P/MW7 trucks.',
  ),
  'chevrolet-silverado-2500hd-exhaust-manifold-bolts-1999': replacement(
    cards.exhaustFasteners,
    'Replace the 27-year model-wide broken-bolt claim with GM bulletin 24-NA-253 for mismatched fasteners after a prior repair on 2023 L5P trucks.',
  ),
  'chevrolet-silverado-2500hd-injector-failure': replacement(
    cards.lb7Injectors,
    'Replace the 2001-2015 multi-engine aggregation and CP4 citations with GM special policy 04039 for the exact 2001-2004 LB7 injector failure modes and diagnosis.',
  ),
  'chevrolet-silverado-2500hd-injector-harness-chafe-2001': replacement(
    cards.harness,
    'Replace the under-valve-cover and 2001-2016 aggregation with customer satisfaction program 15766 for the VIN-bounded 2015 LML EGR-stud chafe point and rerouting procedure.',
  ),
  'chevrolet-silverado-2500hd-steering-wander': replacement(
    cards.steering,
    'Replace forum-based blanket linkage replacement with service update 14713, its approximately 91 VIN-identified 2015 trucks and steering-gear replacement remedy.',
  ),
  'chevrolet-silverado-2500hd-transfer-case-encoder-1999': replacement(
    cards.transferCase,
    'Replace the uncited 1999-2025 encoder-motor diagnosis with service update N222367650 for the exact 2022 transfer-case fastener torque condition.',
  ),
};

const reasons = {
  'chevrolet-silverado-2500hd-cp4-fuel-pump-2011': 'The frozen card makes model-wide defect, fuel-lubricity, $8,000-$12,000 cost and preventive-kit claims from a forum, then recommends additives and unrelated parts. Current manufacturer/regulator primary material did not establish that complete population or endorse the proposed aftermarket prevention and CP3 conversion remedies.',
  'chevrolet-silverado-2500hd-steering-stabilizer-2001': 'The frozen card treats a worn steering damper as the cause of a dangerous oscillation across 25 model years, including modified trucks, based on one video. A damper can mask tire, wheel, alignment, joint, bearing or steering-gear faults; no GM document supports the model-wide diagnosis or parts recommendations.',
};

module.exports = buildConfig({
  label: 'Chevrolet Silverado 2500HD',
  make: 'Chevrolet',
  model: 'Silverado 2500HD',
  slug: 'chevrolet-silverado-2500hd',
  batchId: 'chevrolet-silverado-2500hd-full-record-cohort-33-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'e25f96454c6267ecc0fa3656a562b3bf2a7ab863c46440a80fefdf526755adf5',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-silverado-2500hd/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsilverado2500hd_blind:manual-primary-source-gate',
    edge: 'chevroletsilverado2500hd_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
