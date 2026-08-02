const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, title) {
  return {
    type: 'recall',
    title: `NHTSA Recall ${campaign.slice(0, 6)} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`,
  };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((source) => ({
      type: source.type,
      label: source.title,
      url: source.url,
    })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
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
  brakeBooster: recall('94V228000', 'Brake-Booster Vacuum Hose Can Detach'),
  coolingFan: recall('95V180000', 'Cooling-Fan Blade Can Separate'),
  harnessFire: recall('97V208001', 'Underhood Harness Clip Can Cause a Fire'),
  manualTransmission: recall('96V035000', 'Manual Transmission Can Seize'),
  fourWheelDriveAbs: recall('99V193000', '4WD-Mode Switch Can Increase ABS Stopping Distance'),
  senderSeal: recall('91V108000', 'Fuel-Tank Sender Seal Can Leak in a Rollover'),
  rearBrakePipe: recall('97V218000', 'Rear Brake Pipe Can Fracture'),
  brakePipeUnion: recall('99V220000', 'Brake-Pipe Union Can Leak'),
  suspensionNuts: recall('90V193000', 'Suspension Attachment Nuts Can Strip'),
  wiperEarly: recall('98V150001', 'Wiper Circuit-Board Solder Joints Can Crack'),
  wiperExpansion: recall('03V159000', 'Additional Wiper Circuit Boards Can Fail'),
};

const cards = {
  brakeBooster: {
    years: [1994],
    engines: ['2.2L engine'],
    category: 'brakes',
    title: 'Brake-Booster Vacuum Hose Can Detach After an Engine Backfire (Recall 94V228)',
    description: 'Certain 1994 Chevrolet S10 pickups with the 2.2L engine can have the vacuum hose detach from the power-brake-booster check valve after an engine backfire. Engine idle can increase, and power-brake assist can be lost after the booster vacuum reserve is depleted.',
    solution: 'Check the VIN and historical campaign completion for recall 94V228. The dealer remedy installs a clamp at the power-brake-booster check-valve hose connection. Treat a hard brake pedal or loss of assist as a safety fault rather than replacing engine gaskets from this card.',
    symptoms: [
      'Brake-booster vacuum hose detaches after an engine backfire',
      'Engine idle increases unexpectedly',
      'Brake pedal effort rises after the stored booster vacuum is depleted',
    ],
    affectedSystems: [
      'power-brake-booster vacuum hose and check valve',
      'vacuum reserve and brake assist',
    ],
    sources: [sources.brakeBooster],
    summary: 'Replaced the unsupported 2.2L head-gasket aggregation with exact 1994 brake-booster hose recall 94V228.',
  },
  coolingFan: {
    years: [1995],
    engines: ['4.3L engine with air conditioning'],
    category: 'cooling',
    title: 'Cooling-Fan Blade Can Separate and Strike a Person (Recall 95V180)',
    description: 'Certain 1995 Chevrolet S10 pickups equipped with air conditioning and the 4.3L engine can experience cooling-fan rivet breakage. A blade can separate from the fan spider and strike a person working under the open hood or standing nearby.',
    solution: 'Check the VIN and historical campaign completion for recall 95V180 before working near the running fan. The dealer remedy inspects the fan and, when necessary, replaces it with the revised fan using thicker-headed rivets.',
    symptoms: [
      'Loose or damaged cooling-fan rivets',
      'Abnormal vibration or noise from the mechanical cooling fan',
      'Fan blade separates from the fan spider',
    ],
    affectedSystems: [
      'engine cooling-fan blades, rivets and fan spider',
    ],
    sources: [sources.coolingFan],
    summary: 'Replaced the secondary-source CSFI card with exact 1995 cooling-fan recall 95V180.',
  },
  harnessFire: {
    years: [1998],
    category: 'electrical',
    title: 'Underhood Wiring-Harness Clip Can Melt and Cause a Fire (Recall 97V208)',
    description: 'Certain 1998 Chevrolet S10 pickups have an engine wiring-harness clip that can melt and drip onto the exhaust manifold. The clip material can ignite and then ignite other combustible components, causing a vehicle fire.',
    solution: 'Check the VIN and historical campaign completion for recall 97V208. NHTSA records that owners were to have affected vehicles towed rather than driven; the dealer remedy reroutes the engine electrical wiring harness. Do not substitute an intake-gasket repair for this fire campaign.',
    symptoms: [
      'Melting or deformation of an underhood wiring-harness clip',
      'Burning-plastic odor or smoke near the exhaust manifold',
      'Underhood fire without another confirmed source',
    ],
    affectedSystems: [
      'engine electrical wiring harness and retaining clip',
      'exhaust manifold and nearby combustible components',
    ],
    sources: [sources.harnessFire],
    summary: 'Replaced the duplicate unsupported intake-gasket card with exact 1998 underhood-fire recall 97V208.',
  },
  manualTransmission: {
    years: [1996],
    engines: ['2.2L engine'],
    category: 'transmission',
    title: 'Five-Speed Manual Transmission Can Seize and Lock the Rear Wheels (Recall 96V035)',
    description: 'Certain 1996 two-wheel-drive Chevrolet S10 pickups with the 2.2L engine and five-speed manual transmission were built with transmission parts not machined to GM specifications. The transmission can seize and lock the rear drive wheels while the truck is moving, causing loss of control.',
    solution: 'Check the VIN and historical campaign completion for recall 96V035. The dealer remedy measures transmission main-shaft output torque with the specified tool and replaces the transmission when the result is outside specification.',
    symptoms: [
      'Transmission binds or resists rotation',
      'Rear drive wheels can lock while driving',
      'Sudden loss of vehicle control if the transmission seizes',
    ],
    affectedSystems: [
      'five-speed manual transmission and main shaft',
      'rear drive wheels',
    ],
    sources: [sources.manualTransmission],
    summary: 'Replaced the unsupported 4L60E rebuild card with exact 1996 manual-transmission seizure recall 96V035.',
  },
  fourWheelDriveAbs: {
    years: [1991, 1992, 1993, 1994, 1995, 1996],
    category: 'brakes',
    title: '4WD-Mode Switch Fault Can Increase ABS Stopping Distance (Recall 99V193)',
    description: 'Certain 1991-1996 four-wheel-drive Chevrolet S10 pickups with ABS can have the switch that identifies two-wheel- versus four-wheel-drive mode malfunction. During an ABS stop while the truck is in two-wheel drive, the fault can increase stopping distance and raise crash risk without prior warning.',
    solution: 'Check the VIN and historical campaign completion for recall 99V193. The dealer remedy repairs or replaces the four-wheel-/two-wheel-drive mode switch. This is an ABS input fault; it is not evidence that the front axle vacuum actuator requires a manual cable conversion.',
    symptoms: [
      'No reliable warning before an affected ABS stop',
      'Increased stopping distance during ABS operation in two-wheel drive',
      '4WD-mode switch does not report the drivetrain state correctly',
    ],
    affectedSystems: [
      'four-wheel-/two-wheel-drive mode switch',
      'antilock brake system mode input and stopping performance',
    ],
    sources: [sources.fourWheelDriveAbs],
    summary: 'Replaced the aftermarket 4WD vacuum-actuator conversion card with exact ABS mode-switch recall 99V193.',
  },
  senderSeal: {
    years: [1991],
    category: 'fuel',
    title: 'Fuel-Tank Sender Seal Can Leak Fuel in a Rollover (Recall 91V108)',
    description: 'Certain 1991 Chevrolet S10 pickups were shipped with the fuel-tank sender seal out of position. In a rollover, the displaced seal can allow fuel spillage beyond the FMVSS 301 limit; spilled fuel can ignite near an ignition source.',
    solution: 'Check the VIN and historical campaign completion for recall 91V108. The recall remedy replaces the fuel-tank sender seal. A fuel-pump module or filter is not the stated campaign repair.',
    symptoms: [
      'The campaign may apply without a reliable advance warning',
      'Fuel leaks around the sender opening when the tank is overturned',
      'Post-crash fire risk near an ignition source',
    ],
    affectedSystems: [
      'fuel-tank sender seal and sender opening',
      'fuel-system rollover integrity',
    ],
    sources: [sources.senderSeal],
    summary: 'Replaced the generic fuel-pump wear card with exact 1991 fuel-sender-seal recall 91V108.',
  },
  rearBrakePipe: {
    years: [1998],
    category: 'brakes',
    title: 'Right-Rear Brake Pipe Can Fracture and Leak (Recall 97V218)',
    description: 'Certain 1998 Chevrolet S10 pickups can develop a fatigue fracture in the right-hand brake pipe at the rear axle. A slow leak can produce a soft pedal; a complete break can cause a sudden pedal drop, illuminate the brake warning light and reduce rear braking performance.',
    solution: 'Check the VIN and historical campaign completion for recall 97V218. The dealer remedy inspects the right-rear brake pipe and replaces it where required. Do not use an intake-manifold gasket or coolant product to address these brake symptoms.',
    symptoms: [
      'Soft brake pedal from a slow brake-fluid leak',
      'Sudden brake-pedal drop if the pipe breaks',
      'Brake warning light and reduced rear braking performance',
    ],
    affectedSystems: [
      'right-hand rear-axle brake pipe',
      'rear hydraulic braking circuit',
    ],
    sources: [sources.rearBrakePipe],
    summary: 'Replaced the second intake-gasket duplicate with exact 1998 rear-brake-pipe recall 97V218 and removed two unrelated commerce searches.',
  },
  brakePipeUnion: {
    years: [2000],
    category: 'brakes',
    title: 'ABS Feed or Crossover Brake-Pipe Union Can Leak (Recall 99V220)',
    description: 'Certain 2000 two-wheel-drive Chevrolet S10 pickups may have an ABS-module feed-pipe or brake-crossover-pipe tube nut tightened before the flared pipe end was fully seated. Vehicle input or brake-fluid cycling can break the seal, cause a fluid leak and increase stopping distance.',
    solution: 'Check the VIN and historical campaign completion for recall 99V220. The dealer remedy inspects the brake-pipe union for fluid and installs a new union when necessary. A fuel-pump module is unrelated to this campaign.',
    symptoms: [
      'Brake fluid visible at the ABS feed or crossover pipe union',
      'Falling brake-fluid level',
      'Increased stopping distance',
    ],
    affectedSystems: [
      'right-hand ABS-module feed pipe',
      'brake crossover pipe and tube-nut union',
    ],
    sources: [sources.brakePipeUnion],
    summary: 'Replaced the second generic fuel-pump card with exact 2000 brake-pipe-union recall 99V220 and removed two unrelated commerce searches.',
  },
  suspensionNuts: {
    years: [1991],
    category: 'suspension',
    title: 'Suspension Attachment Nuts Can Strip and Allow Separation (Recall 90V193)',
    description: 'Certain 1991 Chevrolet S10 pickups were assembled with out-of-specification nuts at the lower control arms, rear springs and shackles, and rear shock absorbers. A nut can strip, reduce clamp load and allow a suspension attachment to detach, causing loss of control.',
    solution: 'Check the VIN and historical campaign completion for recall 90V193. The remedy replaces the affected lower-control-arm, rear-spring, shackle and rear-shock-absorber attachment nuts. Do not infer that a generic ball joint or complete control arm is the recall repair.',
    symptoms: [
      'Loose or stripped suspension attachment nut',
      'Movement at a lower control-arm, spring, shackle or shock attachment',
      'Suspension attachment separation and loss of control',
    ],
    affectedSystems: [
      'lower-control-arm attachment nuts',
      'rear spring, shackle and shock-absorber attachment nuts',
    ],
    sources: [sources.suspensionNuts],
    summary: 'Replaced the unsupported 1994-2004 ball-joint aggregation with exact 1991 suspension-nut recall 90V193 and removed two generic commerce searches.',
  },
  wipers: {
    years: [1995, 1996, 1997],
    category: 'electrical',
    title: 'Cracked Wiper-Controller Solder Joints Can Disable the Wipers (Recalls 98V150 and 03V159)',
    description: 'Recalls 98V150 and 03V159 cover certain 1995-1997 Chevrolet S10 pickups whose windshield-wiper motor controller circuit board can develop cracked solder joints. The wipers can work intermittently or stop completely, reducing visibility and increasing crash risk in bad weather. The campaigns apply to their specified vehicle and model-engine populations, not every S10 automatically.',
    solution: 'Check the VIN against both recall 98V150 and the later 03V159 campaign. The dealer remedy replaces the wiper-motor circuit board and cover. The repair does not involve a fuel-injector spider or fuel additive.',
    symptoms: [
      'Windshield wipers operate intermittently',
      'Wipers stop or fail to start',
      'Reduced visibility in rain or snow',
    ],
    affectedSystems: [
      'windshield-wiper motor controller circuit board',
      'solder joints near the wiring-harness connector',
    ],
    sources: [sources.wiperEarly, sources.wiperExpansion],
    summary: 'Replaced the YouTube-supported CSFI duplicate with the exact 1995-1997 wiper-controller campaigns and removed two unrelated commerce searches.',
  },
};

const published = {
  'chevrolet-s-10-2-2l-four-cylinder-head-gasket-failure': replacement(
    cards.brakeBooster,
    'Replace the forum-based 1994-1999 head-gasket aggregation with exact 1994 brake-booster vacuum-hose recall 94V228. The frozen card provides no commerce, but its universal machining and parts advice is not supported by a GM campaign.',
  ),
  'chevrolet-s-10-4-3l-vortec-csfi-spider-injector-poppet-valve-leaking-cloggi': replacement(
    cards.coolingFan,
    'Replace the secondary-source CSFI aggregation with exact 1995 cooling-fan recall 95V180. The frozen warranty-extension assertion is not documented by its citations and no parts link is retained.',
  ),
  'chevrolet-s-10-4-3l-vortec-lower-intake-manifold-gasket-coolant-leak': replacement(
    cards.harnessFire,
    'Replace the forum-based lower-intake-gasket aggregation with exact 1998 underhood-fire recall 97V208. The frozen card has no authoritative population or GM remedy.',
  ),
  'chevrolet-s-10-4l60e-automatic-transmission-3-4-clutch-sunshell-failure': replacement(
    cards.manualTransmission,
    'Replace the commercial rebuild narrative for the 4L60E with exact 1996 manual-transmission seizure recall 96V035. The frozen card does not establish an affected production population or recall remedy.',
  ),
  'chevrolet-s-10-4wd-front-axle-vacuum-actuator-engagement-failure': replacement(
    cards.fourWheelDriveAbs,
    'Replace the forum and aftermarket bypass-kit recommendation with exact 4WD ABS mode-switch recall 99V193. The recalled remedy is switch repair or replacement, not an axle-actuator conversion.',
  ),
  'chevrolet-s-10-tank-electric-fuel-pump-failure-no-start': replacement(
    cards.senderSeal,
    'Replace the secondary maintenance aggregation with exact 1991 sender-seal recall 91V108. The frozen pump, tank-cleaning and 30,000-mile filter recommendations are not a model-specific safety campaign.',
  ),
  'chevrolet-s10-43l-intake-gasket-1996': replacement(
    cards.rearBrakePipe,
    'Replace the uncited duplicate intake-gasket card with exact 1998 rear-brake-pipe recall 97V218. Remove both generic intake-gasket and intake-manifold retailer searches because neither is the recalled repair.',
  ),
  'chevrolet-s10-fuel-pump-failure-1994': replacement(
    cards.brakePipeUnion,
    'Replace the uncited duplicate fuel-pump card with exact 2000 brake-pipe-union recall 99V220. Remove both generic fuel-pump searches because neither diagnoses or repairs the recall condition.',
  ),
  'chevrolet-s10-lower-ball-joint-1994': replacement(
    cards.suspensionNuts,
    'Replace the unsupported multi-year ball-joint aggregation and vague investigation claim with exact 1991 suspension-attachment-nut recall 90V193. Remove both generic ball-joint and control-arm searches because the campaign remedy replaces specified nuts.',
  ),
  'chevy-s10-spider-injector-1996': replacement(
    cards.wipers,
    'Replace the duplicate CSFI card supported only by a video with the exact 1995-1997 wiper-controller campaigns. Remove the generic injector and fuel-cleaner searches because neither is related to the recall remedy.',
  ),
};

module.exports = buildConfig({
  label: 'Chevrolet S-10',
  make: 'Chevrolet',
  model: 'S-10',
  slug: 'chevrolet-s-10',
  batchId: 'chevrolet-s-10-full-record-cohort-30-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c1875b36701232b77ad68e6c9dffd925e0e45ac436a140de399ac87b0599546d',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-s-10/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevrolets10_blind:self-no-blocker',
    edge: 'chevrolets10_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
