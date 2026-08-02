const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  shiftLinkage: {
    type: 'recall',
    title: 'NHTSA Recall 95V221 - Transmission Shift-Control Linkage',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=95V221000',
  },
  absModulator: {
    type: 'recall',
    title: 'NHTSA Recall 97V217 - ABS Modulator Front-Brake-Circuit Leak',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=97V217000',
  },
  beltGuide: {
    type: 'recall',
    title: 'NHTSA Recall 92V094 - Shoulder-Belt Guide Loops',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=92V094000',
  },
  fuelTank: {
    type: 'recall',
    title: 'NHTSA Recall 94V210 - Fuel-Tank Strap Fasteners',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V210000',
  },
  wheelPaint: {
    type: 'recall',
    title: 'NHTSA Recall 94V076 - Painted Wheel-Mounting Surfaces',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V076000',
  },
  accelerator: {
    type: 'recall',
    title: 'NHTSA Recall 95V082 - Accelerator-Pedal Friction',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=95V082000',
  },
  lugNuts: {
    type: 'recall',
    title: 'NHTSA Recall 96V245 - Wheel Lug-Nut Torque',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=96V245000',
  },
};

function evidence(...items) {
  return items.map((item) => ({ type: item.type, label: item.title, url: item.url }));
}

function citations(...items) {
  return items.map((item) => ({ type: item.type, title: item.title, url: item.url }));
}

module.exports = buildConfig({
  label: 'Buick Roadmaster',
  model: 'Roadmaster',
  slug: 'buick-roadmaster',
  batchId: 'buick-roadmaster-full-record-cohort-11-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '42cd5ac06565d05fa8e8426cc1219a4f271a4e599345963ec6c2f90f70c84772',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-roadmaster/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickroadmaster_blind:self-no-blocker',
    edge: 'buickroadmaster_edge:self-no-blocker',
  },
  published: {
    'buick-roadmaster-4l60e-automatic-transmission-wear': {
      disposition: 'replace',
      decision:
        'Replace the forum, aftermarket and generic 1994-1996 4L60E wear aggregation with the exact 1995 transmission shift-control-linkage noncompliance recall.',
      evidence: evidence(sources.shiftLinkage),
      after: {
        years: [1995],
        trims: [],
        engines: [],
        category: 'transmission',
        title: 'Transmission Can Shift Out of Park With Key Removed (Recall 95V221)',
        description:
          'NHTSA Recall 95V221 covers certain 1995 Buick Roadmaster vehicles produced with an improperly adjusted transmission shift-control linkage. The vehicle may be shiftable out of Park after the ignition key is removed, allowing unintended movement of a parked vehicle.',
        solution:
          'Check the VIN for recall completion. A Buick dealer adjusts the transmission shift-control linkage system under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Transmission can be shifted out of Park with the ignition key removed'],
        affectedSystems: ['automatic-transmission column shift-control linkage'],
        dtcCodes: [],
        citations: citations(sources.shiftLinkage),
        summary:
          'Replaced a broad 4L60E wear card with the exact 1995 shift-control-linkage recall and removed forum-derived failure and repair claims.',
      },
    },
    'buick-roadmaster-abs-hydraulic-modulator-corrosion-front-brake-fluid-leak': {
      disposition: 'replace',
      decision:
        'Keep the genuine ABS-modulator recall but correct the Roadmaster population from the unsupported 1994-1996 range to model year 1992 and replace all secondary citations with the direct NHTSA campaign record.',
      evidence: evidence(sources.absModulator),
      after: {
        years: [1992],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'ABS Modulator Can Corrode and Leak Front-Brake Fluid (Recall 97V217)',
        description:
          'NHTSA Recall 97V217 covers certain 1992 Buick Roadmaster vehicles. The antilock-brake-system modulator can corrode and leak fluid from the front brake circuit, reducing braking effectiveness and increasing stopping distance.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects the vehicle and replaces the ABS modulator under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Brake-fluid leak from the ABS modulator front circuit', 'Reduced braking effectiveness', 'Increased stopping distance'],
        affectedSystems: ['ABS modulator and front hydraulic brake circuit'],
        dtcCodes: [],
        citations: citations(sources.absModulator),
        summary:
          'Corrected the ABS-modulator recall from the wrong 1994-1996 scope to the exact 1992 Roadmaster population and primary NHTSA remedy.',
      },
    },
    'buick-roadmaster-estate-wagon-rear-self-leveling-air-shock-compressor-failure': {
      disposition: 'replace',
      decision:
        'Replace the forum and conversion-kit-derived six-year rear air-leveling aggregation with the exact 1991-1992 shoulder-belt guide-loop recall.',
      evidence: evidence(sources.beltGuide),
      after: {
        years: [1991, 1992],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Shoulder-Belt Guide Cover Can Crack and Cut Webbing (Recall 92V094)',
        description:
          'NHTSA Recall 92V094 covers certain 1991-1992 Buick Roadmaster vehicles. The plastic covering on a shoulder-belt guide loop can crack and expose its steel sub-plate. In a crash, the exposed metal can cut the safety-belt webbing and increase the possibility or severity of occupant injury.',
        solution:
          'Check the VIN for recall completion. The recall remedy installs new shoulder-belt guide loops.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Cracked plastic covering on a shoulder-belt guide loop', 'Exposed steel sub-plate at the belt guide'],
        affectedSystems: ['shoulder-belt guide loops and belt webbing'],
        dtcCodes: [],
        citations: citations(sources.beltGuide),
        summary:
          'Replaced an unsupported air-suspension card and conversion-kit recommendation with the exact 1991-1992 shoulder-belt guide recall.',
      },
    },
    'buick-roadmaster-fuel-pump-tank-check-valve-failure-causing-hard-starting-low': {
      disposition: 'replace',
      decision:
        'Replace the forum-derived fuel-pump/check-valve diagnosis with the exact 1994 fuel-tank attachment-strap recall.',
      evidence: evidence(sources.fuelTank),
      after: {
        years: [1994],
        trims: [],
        engines: [],
        category: 'fuel',
        title: 'Fuel-Tank Strap Fasteners Can Detach (Recall 94V210)',
        description:
          'NHTSA Recall 94V210 covers certain 1994 Buick Roadmaster vehicles whose fuel-tank attachment-strap fasteners were not properly tightened. The fasteners can detach, letting the tank sag and strike the roadway. The tank can then leak fuel and create a fire risk if an ignition source is present.',
        solution:
          'Check the VIN for recall completion. A Buick dealer retightens the fuel-tank strap fasteners under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Loose or detached fuel-tank strap fasteners', 'Fuel tank sags toward or contacts the roadway', 'Fuel leak with possible fire'],
        affectedSystems: ['fuel tank attachment straps and fasteners'],
        dtcCodes: [],
        citations: citations(sources.fuelTank),
        summary:
          'Replaced a forum-derived fuel-pump/check-valve card with the exact 1994 fuel-tank strap-fastener recall.',
      },
    },
    'buick-roadmaster-lt1-intake-manifold-gasket-coolant-oil-leak': {
      disposition: 'replace',
      decision:
        'Replace the RepairPal/forum-derived LT1 intake-gasket leak aggregation with the VIN-specific 1994 painted wheel-mounting-surface recall.',
      evidence: evidence(sources.wheelPaint),
      after: {
        years: [1994],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Paint on Wheel-Mounting Surfaces Can Loosen Lug Nuts (Recall 94V076)',
        description:
          'NHTSA Recall 94V076 covers a small population of 1994 Buick Roadmaster vehicles. Paint on the wheel-mounting surfaces can act as a shim between the wheel and rotor or drum. As the wheel embeds into the paint, lug-nut clamp load can be lost, wheel studs can fracture and a wheel can separate without warning.',
        solution:
          'Because this campaign affects a small VIN-specific population, check the VIN for recall completion. A Buick dealer cleans all four wheel-mounting surfaces, inspects the wheel studs and replaces damaged studs as necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before clamp load or wheel studs fail', 'Loose lug nuts or damaged wheel studs', 'Wheel separation'],
        affectedSystems: ['wheel mounting surfaces, lug nuts and wheel studs'],
        dtcCodes: [],
        citations: citations(sources.wheelPaint),
        summary:
          'Replaced an unsupported LT1 intake-gasket card with the small-population 1994 wheel-mounting-surface recall and removed generic leak/repair claims.',
      },
    },
    'buick-roadmaster-optispark-distributor-failure-lt1': {
      disposition: 'replace',
      decision:
        'Replace the retailer and forum-derived Opti-Spark failure aggregation with the exact 1994-1995 accelerator-pedal friction noncompliance recall.',
      evidence: evidence(sources.accelerator),
      after: {
        years: [1994, 1995],
        trims: [],
        engines: [],
        category: 'engine',
        title: 'Accelerator Pedal Can Bind at Low Temperature (Recall 95V082)',
        description:
          'NHTSA Recall 95V082 covers certain 1994-1995 Buick Roadmaster vehicles. At low temperatures, excessive friction can occur in the accelerator-pedal assembly. If the throttle return spring also fails, engine speed may not return to idle, increasing crash risk.',
        solution:
          'Check the VIN for recall completion. A Buick dealer replaces the accelerator-pedal assembly under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Accelerator pedal has excessive friction in low temperatures', 'Engine speed may not return to idle if the throttle return spring fails'],
        affectedSystems: ['accelerator-pedal assembly and throttle-return function'],
        dtcCodes: [],
        citations: citations(sources.accelerator),
        summary:
          'Replaced an unsupported Opti-Spark aggregation with the exact 1994-1995 accelerator-pedal friction recall and removed retailer/forum sourcing.',
      },
    },
    'buick-roadmaster-reverse-flow-cooling-water-pump-shaft-seal-leak-air-lock-ove': {
      disposition: 'replace',
      decision:
        'Replace the trade-article, forum and estimator-derived reverse-flow-cooling/water-pump aggregation with the exact 1995-1996 wheel lug-nut torque recall.',
      evidence: evidence(sources.lugNuts),
      after: {
        years: [1995, 1996],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Wheel Lug Nuts May Be Under-Torqued (Recall 96V245)',
        description:
          'NHTSA Recall 96V245 covers certain 1995-1996 Buick Roadmaster vehicles whose wheel lug nuts were not tightened to the proper specification during assembly. The condition can fracture wheel studs and allow a wheel to separate from the vehicle.',
        solution:
          'Check the VIN for recall completion. A Buick dealer tightens the wheel lug nuts to the specified torque under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Under-torqued wheel lug nuts', 'Wheel-stud fracture', 'Wheel separation'],
        affectedSystems: ['wheel lug nuts and wheel studs'],
        dtcCodes: [],
        citations: citations(sources.lugNuts),
        summary:
          'Replaced an unsupported water-pump/cooling aggregation with the exact 1995-1996 wheel lug-nut torque recall and removed cost/repair assumptions.',
      },
    },
  },
  proposalCampaigns: [],
});
