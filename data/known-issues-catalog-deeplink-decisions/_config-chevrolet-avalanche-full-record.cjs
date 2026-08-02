const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, title) {
  return {
    type: 'recall',
    title: `NHTSA Recall ${campaign} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign.replace('V', 'V')}000`,
  };
}

const sources = {
  tailgate: recall('04V129', 'Tailgate Support Cables'),
  tankShield: recall('03V019', 'Fuel-Tank Impact Shield'),
  washerHeater: recall('10V240', 'Heated Washer-Fluid Module Fire Risk'),
  centerBelt: recall('05V163', 'Second-Row Center Seat-Belt Routing'),
  ignitionLock: recall('14V827', 'Ignition-Lock Actuator'),
  hydroBoostRelief: recall('04V045', 'Hydro-Boost Relief Valve'),
  shiftIndicator: recall('05V055', 'Transmission Shift-Position Indicator'),
  lowSpeedAbs: recall('05V379', 'Unwanted Low-Speed ABS Activation'),
  fuelRailDamper: recall('06V289', 'Fuel-Rail Pulse-Damper Retainer'),
  capacityLabel: recall('05V552', 'Tire and Loading Information Label'),
  passengerInflator: recall('21V054', 'Passenger Frontal Air-Bag Inflator'),
  fuelModule: recall('09V154', 'Fuel-System Control Module Water Intrusion'),
};

function evidence(source) {
  return [{ type: source.type, label: source.title, url: source.url }];
}

function citations(source) {
  return [{ type: source.type, title: source.title, url: source.url }];
}

function replacement(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: evidence(source),
    after: { ...after, citations: citations(source) },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet Avalanche',
  make: 'Chevrolet',
  model: 'Avalanche',
  slug: 'chevrolet-avalanche',
  batchId: 'chevrolet-avalanche-full-record-cohort-2-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'e400117532bafc8188ec99db15e747acdebe7e43fe570a01e00f524ec79ac204',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-avalanche/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletavalanche_blind:self-no-blocker',
    edge: 'chevroletavalanche_edge:self-no-blocker',
  },
  published: {
    'chevrolet-avalanche-4l60e-transmission-3-4-clutch-failure-slipping': replacement(
      sources.tailgate,
      'Replace the transmission-shop/forum aggregation and broad twelve-year scope with the exact 2002-2004 tailgate support-cable recall.',
      {
        years: [2002, 2003, 2004],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Tailgate Support Cables Can Corrode and Fracture (Recall 04V129)',
        description:
          'NHTSA Recall 04V129 covers certain 2002-2004 Chevrolet Avalanche vehicles. The galvanized-steel cables that hold the tailgate horizontal can corrode, weaken and fracture. If both break, the tailgate and any supported person or cargo can fall.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces both tailgate support cables under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Corroded or frayed tailgate support cable', 'Tailgate support cable fractures', 'Tailgate drops onto the bumper'],
        affectedSystems: ['tailgate support cables and attachments'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported transmission-failure aggregation with the exact 2002-2004 tailgate-cable recall and removed repair-cost claims.',
      },
    ),
    'chevrolet-avalanche-brake-line-corrosion': replacement(
      sources.tankShield,
      'Replace the secondary-source brake-line investigation summary with the exact 2003 fuel-tank impact-shield recall.',
      {
        years: [2003],
        trims: [],
        engines: [],
        category: 'fuel',
        title: 'Frontal Impact Can Puncture the Fuel Tank (Recall 03V019)',
        description:
          'NHTSA Recall 03V019 covers certain 2003 Chevrolet Avalanche vehicles. In a sufficiently severe 30-degree left-angle frontal impact, the mid-frame crossmember can tear and form a sharp edge that may puncture the fuel tank, allowing fuel leakage and a possible fire.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer installs a fuel-tank shield under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before the crash-related condition', 'Fuel leakage after a severe angled frontal impact'],
        affectedSystems: ['mid-frame crossmember, fuel tank and protective shield'],
        dtcCodes: [],
        summary:
          'Replaced a secondary brake-line investigation card with the exact 2003 fuel-tank impact-shield recall.',
      },
    ),
    'chevrolet-avalanche-cracked-dashboard': replacement(
      sources.washerHeater,
      'Replace the lawsuit/article-derived cracked-dashboard aggregation with the exact 2007-2009 heated washer-fluid module fire-risk recall.',
      {
        years: [2007, 2008, 2009],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Heated Washer-Fluid Module Can Ignite (Recall 10V240)',
        description:
          'NHTSA Recall 10V240 covers certain 2007-2009 Chevrolet Avalanche vehicles equipped with the heated washer-fluid system. Thermal incidents continued after an earlier fuse remedy; the module can melt or ignite and cause a vehicle fire.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer permanently disables and removes the heated washer-fluid module and updates the owner manual under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Melted heated-washer module housing', 'Electrical odor or smoke', 'Fire at the heated washer-fluid module'],
        affectedSystems: ['heated washer-fluid module and electrical circuit'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported cracked-dashboard card with the exact 2007-2009 heated-washer module fire recall.',
      },
    ),
    'chevrolet-avalanche-erratic-fuel-gauge-fuel-level-sensor-failure': replacement(
      sources.centerBelt,
      'Replace the RepairPal/blog-derived fuel-level-sensor aggregation with the exact 2003-2005 second-row center seat-belt routing recall.',
      {
        years: [2003, 2004, 2005],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Second-Row Center Lap Belt May Route Too High (Recall 05V163)',
        description:
          'NHTSA Recall 05V163 covers certain 2003-2005 Chevrolet Avalanche vehicles. The second-row center seat-belt guide can make it difficult to position the lap belt low and snug on an occupant\'s hips, increasing abdominal and internal-organ injury risk in a crash.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer modifies the guide loop and secures the remaining sides with a retainer under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Second-row center lap belt rides on the abdomen', 'Lap belt cannot be positioned low and snug on the hips'],
        affectedSystems: ['second-row center seat-belt guide and lap-belt routing'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported fuel-gauge card with the exact 2003-2005 center seat-belt routing recall.',
      },
    ),
    'chevrolet-avalanche-excessive-oil-consumption-afm-lifter-failure': replacement(
      sources.ignitionLock,
      'Replace the litigation/forum-derived oil-consumption and AFM aggregation with the exact 2011-2012 ignition-lock actuator recall.',
      {
        years: [2011, 2012],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Ignition Lock Can Bind or Snap to Accessory (Recall 14V827)',
        description:
          'NHTSA Recall 14V827 covers certain 2011-2012 Chevrolet Avalanche vehicles. The ignition-lock actuator can bind or hold the key in Start, then snap back to Accessory. That can remove engine, steering and braking power and can prevent air-bag deployment in a crash.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects and replaces the ignition-lock housing as necessary under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Key is difficult to turn', 'Ignition remains in Start', 'Ignition suddenly snaps to Accessory', 'Loss of engine, steering or brake power'],
        affectedSystems: ['ignition-lock actuator and housing'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported AFM/oil-consumption aggregation with the exact 2011-2012 ignition-lock recall.',
      },
    ),
    'chevrolet-avalanche-hvac-blend-door-mode-actuator-failure': replacement(
      sources.hydroBoostRelief,
      'Replace the RepairPal/forum/parts-site HVAC aggregation with the exact 2003-2004 hydro-boost relief-valve noncompliance recall.',
      {
        years: [2003, 2004],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Hydro-Boost Relief-Valve Seal Can Fracture (Recall 04V045)',
        description:
          'NHTSA Recall 04V045 covers certain 2003-2004 Chevrolet Avalanche vehicles built with an out-of-specification hydro-boost housing relief-valve bore. The valve O-ring can fracture, slightly increasing steering effort while braking or parking and, under some conditions, increasing brake-pedal effort.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the hydro-boost relief valve under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Increased steering effort while braking or parking', 'Increased brake-pedal effort'],
        affectedSystems: ['hydro-boost housing relief valve and O-ring seal'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported HVAC actuator card with the exact 2003-2004 hydro-boost relief-valve recall.',
      },
    ),
    'chevrolet-avalanche-instrument-cluster-gauge-speedometer-failure': replacement(
      sources.shiftIndicator,
      'Replace the Wikipedia/settlement/repair-service instrument-cluster aggregation with the exact 2005 shift-position indicator noncompliance recall.',
      {
        years: [2005],
        trims: [],
        engines: [],
        category: 'transmission',
        title: 'Transmission Shift-Position Indicator May Not Illuminate (Recall 05V055)',
        description:
          'NHTSA Recall 05V055 covers certain 2005 Chevrolet Avalanche vehicles. Under some starting conditions, the instrument-cluster shift-position indicator may not illuminate, so the driver may not know which gear is selected and the vehicle can move in an unintended direction.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer reprograms the instrument panel cluster under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Shift-position indicator does not illuminate after starting', 'Selected transmission gear is not visible'],
        affectedSystems: ['instrument panel cluster and shift-position indicator'],
        dtcCodes: [],
        summary:
          'Replaced a settlement/repair-service gauge card with the exact 2005 shift-indicator recall.',
      },
    ),
    'chevrolet-avalanche-unwanted-low-speed-abs-activation-recall-05v379': replacement(
      sources.lowSpeedAbs,
      'Retain the genuine low-speed ABS recall, correct its Avalanche scope to model year 2002 in the specified salt-belt jurisdictions, use the direct NHTSA record and remove unrelated secondary citations.',
      {
        years: [2002],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Corrosion Can Trigger Unwanted Low-Speed ABS Activation (Recall 05V379)',
        description:
          'NHTSA Recall 05V379 includes certain 2002 Chevrolet Avalanche vehicles in specified salt-belt jurisdictions. Corrosion at a front wheel-speed sensor mounting surface can weaken the signal and trigger unwanted ABS activation during low-speed braking, increasing stopping distance.',
        solution:
          'Check the VIN for recall eligibility and completion because the campaign is geographically limited. The dealer removes the sensor, cleans and protects the mounting surface, reinstalls the sensor and verifies signal voltage.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['ABS activates during low-speed braking', 'Brake pedal pulsates near a stop', 'Stopping distance increases at low speed'],
        affectedSystems: ['front wheel-speed sensors, hub mounting surfaces and ABS'],
        dtcCodes: [],
        summary:
          'Corrected the genuine ABS recall to the exact 2002 Avalanche salt-belt scope and primary NHTSA remedy.',
      },
    ),
    'chevy-avalanche-afm-oil-consumption-2007': replacement(
      sources.fuelRailDamper,
      'Replace the duplicate forum-derived AFM/oil-consumption card and two search links with the VIN-specific 2004 8.1L fuel-rail pulse-damper retainer recall.',
      {
        years: [2004],
        trims: [],
        engines: ['8.1L V8 (RPO L8, VIN G)'],
        category: 'fuel',
        title: 'Fuel-Rail Pulse-Damper Retainer Can Fracture (Recall 06V289)',
        description:
          'NHTSA Recall 06V289 covers certain 2004 Chevrolet Avalanche vehicles equipped with the 8.1L V8 identified by RPO L8 and VIN code G. The fuel-rail pulse-damper retainer clip can fracture, allowing the damper to loosen and fuel to leak, creating a fire risk near an ignition source.',
        solution:
          'Check the VIN and engine identification for recall completion. A Chevrolet dealer replaces the fuel-rail pulse-damper retainer clip under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Fuel odor or leak at the fuel rail', 'Loose fuel-rail pulse damper', 'Engine-compartment fire risk'],
        affectedSystems: ['fuel rail, pulse damper and retainer clip'],
        dtcCodes: [],
        summary:
          'Replaced a duplicate unsupported AFM card with the exact 2004 8.1L fuel-rail retainer recall and removed two search links.',
      },
    ),
    'chevy-avalanche-body-cladding-2002': replacement(
      sources.capacityLabel,
      'Replace the single-forum body-cladding card and four unrelated search links with the exact 2006 tire/loading label noncompliance recall.',
      {
        years: [2006],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Tire and Loading Label May List the Wrong Capacity (Recall 05V552)',
        description:
          'NHTSA Recall 05V552 covers certain 2006 Chevrolet Avalanche vehicles shipped with a tire-and-loading label that lists an inaccurate vehicle capacity weight. Relying on the incorrect label can contribute to improper loading or tire inflation and increase tire-failure and crash risk.',
        solution:
          'Check the VIN for recall completion. GM provides a corrected label and installation instructions, or a dealer installs the corrected label at the owner\'s option.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Original tire-and-loading label lists an inaccurate capacity weight'],
        affectedSystems: ['tire and loading information label'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported body-cladding card with the exact 2006 loading-label recall and removed four unrelated search links.',
      },
    ),
    'chevy-avalanche-dashboard-cracking-2007': replacement(
      sources.passengerInflator,
      'Replace the duplicate complaint-aggregator dashboard card and two generic tool/material search links with the VIN- and zone-specific 2010-2013 passenger-air-bag inflator recall.',
      {
        years: [2010, 2011, 2012, 2013],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Passenger Air-Bag Inflator Can Explode (Recall 21V054)',
        description:
          'NHTSA Recall 21V054 includes certain 2010-2013 Chevrolet Avalanche vehicles originally sold or registered in specified Zone B or Zone C jurisdictions. Long-term heat and humidity exposure can degrade the non-desiccated passenger frontal inflator propellant, causing the inflator to explode and propel sharp metal fragments into occupants.',
        solution:
          'Check the VIN because affected model years depend on the vehicle\'s geographic history. A Chevrolet dealer replaces the front passenger air-bag inflator with an alternate inflator under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before inflator rupture', 'Open passenger-air-bag inflator recall for the VIN'],
        affectedSystems: ['front passenger air-bag inflator module'],
        dtcCodes: [],
        summary:
          'Replaced a duplicate dashboard card with the exact zonal 2010-2013 passenger-inflator recall and removed two generic search links.',
      },
    ),
    'chevy-avalanche-engine-power-reduced-2007': replacement(
      sources.fuelModule,
      'Replace the owner-article throttle-body/pedal aggregation and two search links with the exact 2009 fuel-system control-module water-intrusion recall.',
      {
        years: [2009],
        trims: [],
        engines: [],
        category: 'fuel',
        title: 'Water Can Short the Fuel-System Control Module (Recall 09V154)',
        description:
          'NHTSA Recall 09V154 covers certain 2009 Chevrolet Avalanche vehicles. Separation of the module housing seal can let water enter the fuel-system control module, causing a short or open circuit, warning light and DTCs, hard starting, a no-start condition or an engine stall.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer installs a new fuel-system control module under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Service Engine Soon light', 'Fuel-system control DTCs', 'Hard start or no start', 'Engine stalls'],
        affectedSystems: ['fuel-system control module and housing seal'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported reduced-power aggregation with the exact 2009 fuel-module water-intrusion recall and removed two search links.',
      },
    ),
  },
  reasons: {
    'chevy-avalanche-abs-unwanted-activation-2002':
      'This is a duplicate of the retained 05V379 recall card and incorrectly expands the condition through 2006. The primary campaign includes certain 2002 Avalanche vehicles in specified salt-belt jurisdictions. Archive the duplicate and its two search-link parts rather than display the same safety condition twice.',
  },
  proposalCampaigns: [],
});
