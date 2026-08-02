const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  transmissionVent: {
    type: 'recall',
    title: 'NHTSA Recall 93V016 - Transmission Fluid Vent Fire Risk',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=93V016000',
  },
  fuelRail: {
    type: 'recall',
    title: 'NHTSA Recall 95V243 - Fuel-Rail End Retainer',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=95V243000',
  },
  brakeRotors: {
    type: 'recall',
    title: 'NHTSA Recall 98V033 - Front Brake Rotor/Hub Castings',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=98V033000',
  },
  throttleCable: {
    type: 'recall',
    title: 'NHTSA Recall 96V057 - Binding Throttle Cable',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=96V057000',
  },
  wiperBoard: {
    type: 'recall',
    title: 'NHTSA Recall 03V159 - Windshield-Wiper Circuit Board',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V159000',
  },
};

function replace(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      ...after,
      citations: [{ type: source.type, title: source.title, url: source.url }],
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet C/K 1500',
  make: 'Chevrolet',
  model: 'C/K 1500',
  slug: 'chevrolet-c-k-1500',
  batchId: 'chevrolet-c-k-1500-full-record-cohort-8-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'bdd1b7e50289c51715a80c6875d34d5ba8f101c40b051db8806bf27e10ca6b78',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-c-k-1500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletck1500_blind:self-no-blocker',
    edge: 'chevroletck1500_edge:self-no-blocker',
  },
  published: {
    'chevrolet-ck-1500-4l60e-trans-1993': replace(
      sources.transmissionVent,
      'Replace a broad transmission-failure aggregation and unrelated clutch search link with the exact transmission-vent fire recall for 1988-1993 C/K light trucks.',
      {
        years: [1988, 1989, 1990, 1991, 1992, 1993],
        trims: [],
        engines: ['5.0L', '5.7L', '7.4L'],
        category: 'transmission',
        title: 'Transmission Fluid Can Vent onto an Ignition Source (Recall 93V016)',
        description:
          'NHTSA Recall 93V016 covers certain 1988-1993 Chevrolet C/K light trucks with 5.0L, 5.7L or 7.4L engines and 4L60, 4L60-E or 3L80 automatic transmissions. Heat can force transmission fluid out of the vent tube, where it can ignite.',
        solution:
          'Check the VIN for recall completion. The campaign installs a longer transmission vent hose routed to the left side of the engine compartment.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Transmission fluid discharged from the vent tube',
          'Fluid odor or smoke near the engine compartment',
          'Fire risk if vented fluid reaches an ignition source',
        ],
        affectedSystems: ['automatic transmission vent hose and fluid routing'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported 4L60E failure card with the exact 1988-1993 transmission-vent fire recall and removed one unrelated search link.',
      },
    ),
    'chevrolet-ck-1500-fuel-pump-failure-1990': replace(
      sources.fuelRail,
      'Replace a nine-year fuel-pump aggregation and two search links with the exact 1996 fuel-rail leak recall for 7.4L trucks.',
      {
        years: [1996],
        trims: [],
        engines: ['7.4L'],
        category: 'fuel',
        title: 'Fuel-Rail End Retainer Can Leak Fuel (Recall 95V243)',
        description:
          'NHTSA Recall 95V243 covers certain 1996 Chevrolet light-duty pickup trucks with 7.4L engines. An improperly crimped fuel-rail end retainer can leak fuel and create an engine-compartment fire risk when an ignition source is present.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects the fuel-rail assembly and replaces assemblies carrying Julian date codes 95318 through 95338.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Fuel leak at the rail assembly', 'Fuel odor in the engine compartment', 'Fire risk near an ignition source'],
        affectedSystems: ['fuel-rail assembly and end retainer clip'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported fuel-pump card with the exact 1996 7.4L fuel-rail recall and removed two search links.',
      },
    ),
    'chevrolet-ck-1500-oil-pressure-sensor-1988': replace(
      sources.brakeRotors,
      'Replace an uncited eleven-year oil-pressure-sender aggregation and two unrelated search links with the exact 1998 front rotor/hub recall.',
      {
        years: [1998],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Front Brake Rotor/Hub Can Crack and Separate a Wheel (Recall 98V033)',
        description:
          'NHTSA Recall 98V033 covers certain 1998 Chevrolet light-duty pickup trucks with one or both front rotor/hub assemblies cast from out-of-specification gray iron. Cracks can propagate around the wheel-bolt circle and ultimately allow wheel separation.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects the front rotors for core date 287 and replaces affected rotor/hub assemblies.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Cracked front brake rotor/hub', 'Abnormal wheel or brake vibration', 'Risk of wheel separation if a cracked rotor remains in service'],
        affectedSystems: ['front brake rotor/hub assemblies and wheel mounting'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported oil-pressure-sender card with the exact 1998 rotor/hub recall and removed two search links.',
      },
    ),
    'chevrolet-ck-1500-speedometer-gear-1988': replace(
      sources.throttleCable,
      'Replace a mechanically inconsistent speedometer aggregation and three unrelated search links with the exact 1995-1996 binding-throttle recall.',
      {
        years: [1995, 1996],
        trims: [],
        engines: ['gasoline engines'],
        category: 'fuel',
        title: 'Throttle Cable Can Bind Against the Dash Mat (Recall 96V057)',
        description:
          'NHTSA Recall 96V057 covers certain 1995-1996 Chevrolet C/K pickups with gasoline engines. The throttle cable can contact the dash mat and bind, preventing engine speed from returning to idle and increasing crash risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects throttle-cable clearance and cuts away the interfering portion of the dash mat when necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Engine speed does not return to idle', 'Binding or delayed accelerator return', 'Throttle cable contacts the dash mat'],
        affectedSystems: ['accelerator cable, throttle linkage and dash mat'],
        dtcCodes: [],
        summary:
          'Replaced an inaccurate speedometer card with the exact 1995-1996 throttle-cable recall and removed three search links.',
      },
    ),
    'chevrolet-ck-1500-spider-injector-1996': replace(
      sources.wiperBoard,
      'Replace an unsupported CPI injector aggregation and two search links with the exact 1994-1997 windshield-wiper circuit-board recall.',
      {
        years: [1994, 1995, 1996, 1997],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Windshield Wipers Can Fail from Cracked Solder Joints (Recall 03V159)',
        description:
          'NHTSA Recall 03V159 covers certain 1994-1997 Chevrolet C/K pickups with specified model-engine combinations. Cracked solder joints near the wiper-controller harness connector can make the windshield wipers operate intermittently or stop, reducing visibility in bad weather.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the windshield-wiper motor circuit board and cover.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Intermittent windshield-wiper operation', 'Windshield wipers stop working', 'Reduced visibility in rain or snow'],
        affectedSystems: ['windshield-wiper motor circuit board, solder joints and controller cover'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported CPI injector card with the exact 1994-1997 wiper-controller recall and removed two search links.',
      },
    ),
  },
  proposalCampaigns: [],
});
