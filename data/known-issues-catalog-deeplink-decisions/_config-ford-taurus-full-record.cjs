const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
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
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Taurus&modelYear=${year}`;

const published = {
  'ford-taurus-cam-phaser-duratec-2008': replacement(
    {
      years: [2016],
      trims: ['Certain vehicles identified by VIN'],
      engines: ['3.5L GTDI EcoBoost'],
      category: 'engine',
      title: 'Turbocharger Oil-Supply Tube Leak Recall',
      description:
        'NHTSA campaign 16V925 covers certain 2016 Taurus vehicles with 3.5L GTDI engines. Improperly brazed turbocharger oil-supply tubes may leak oil onto engine components and create a fire risk.',
      solution:
        'Check the VIN for Ford recall 16S46. Ford dealers inspect and replace the covered turbocharger oil-supply tubes as necessary free of charge. Oil odor, smoke, or visible leakage near hot components requires immediate shutdown and professional inspection.',
      severity: 'high',
      symptoms: ['Possible engine-oil leak near turbocharger supply tubes', 'Oil odor or smoke near hot engine components'],
      affectedSystems: ['turbocharger oil-supply tubes', 'engine oil system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 16V925 / Ford Recall 16S46', url: recalls(2016) }],
      summary:
        'Replaced an uncited twelve-year cam-phaser diagnosis and $1,500-$3,000 timing repair with the exact 2016 Taurus turbo oil-tube safety recall.',
    },
    'No Ford primary source in the frozen record established one cam-phaser defect, code set, full timing-set replacement, or price range across every 2008-2019 Taurus. Retain the exact engine fire-risk campaign instead.',
  ),

  'ford-taurus-3-0l-vulcan-lower-intake-manifold-gasket-coolant-tube-leak': replacement(
    {
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      trims: ['2013-2018 Taurus SHO Performance Package or Police Interceptor vehicles identified by VIN'],
      category: 'suspension',
      title: 'Rear Toe-Link Fracture Recall',
      description:
        'NHTSA campaign 20V072 covers certain 2013-2018 Taurus vehicles with the SHO Performance Package or Police Interceptor configuration. Stress on the rear suspension can fracture a toe link, causing a sudden change in handling and increasing crash risk.',
      solution:
        'Check the VIN for Ford recall 20S04. Ford dealers replace the rear suspension toe links free of charge. A sudden rear-steer sensation, unstable handling, or visible toe-link damage requires immediate inspection.',
      severity: 'high',
      symptoms: ['Sudden change in vehicle handling if a rear toe link fractures'],
      affectedSystems: ['rear suspension toe links'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V072 / Ford Recall 20S04', url: recalls(2017) }],
      summary:
        'Replaced a forum-based ten-year coolant-gasket and threaded-fitting modification with the exact Taurus performance and police rear-suspension recall.',
    },
    'The frozen card generalized an intake gasket and crossover-tube mechanism to every 1990-1999 Vulcan, then prescribed drilling, tapping, a brass fitting, and overlapping timing-cover work without Ford evidence.',
  ),

  'ford-taurus-3-8l-essex-v6-head-gasket-failure': replacement(
    {
      years: [1995],
      trims: ['Certain vehicles identified by campaign eligibility'],
      engines: ['3.0L V6', '3.8L V6'],
      category: 'engine',
      title: 'Engine Cooling-Fan Motor Fire Recall',
      description:
        'NHTSA campaign 01V390 and related safety-improvement action 01I011 cover certain 1995 Taurus vehicles. A cooling-fan bearing can seize, create excessive heat, melt the fan motor connector, and potentially ignite components inside the motor.',
      solution:
        'Check the VIN and campaign-completion history with Ford. The recall directs inspection of the cooling-fan assembly, installation of a circuit breaker, and replacement of an inoperative fan and motor assembly. An inoperative fan, overheated connector, smoke, or burning odor warrants immediate service.',
      severity: 'high',
      symptoms: ['Inoperative engine cooling fan', 'Overheated fan connector, smoke, or underhood burning odor'],
      affectedSystems: ['engine cooling-fan bearing', 'fan motor electrical connector', 'fan circuit protection'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 01V390 and Safety Improvement 01I011', url: recalls(1995) }],
      summary:
        'Removed advocacy and forum head-gasket claims and retained the exact 1995 Ford cooling-system fire safety action.',
    },
    'The historical head-gasket service programs may have existed, but the frozen card adds engineering cause, failure mileage, catastrophic outcomes, labor, machining, parts, and current coverage implications without a direct Ford bulletin. Retain a primary-source engine-cooling campaign instead.',
  ),

  'ford-taurus-alternator-failure-2000': replacement(
    {
      years: [2015, 2016, 2018, 2019],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Rearview-Camera Image Recall 25SA9',
      description:
        'NHTSA campaign 25V695 covers certain 2015-2016 and 2018-2019 Taurus vehicles whose rearview camera may display a distorted, intermittent, or blank image while reversing, reducing the driver\'s view behind the car.',
      solution:
        'Check the VIN for Ford recall 25SA9 and the phased remedy status. Ford dealers inspect and replace the rearview camera as necessary free of charge. Continue direct visual checks while reversing.',
      severity: 'high',
      symptoms: ['Distorted, intermittent, or blank rearview-camera image'],
      affectedSystems: ['rearview camera'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V695 / Ford Recall 25SA9', url: recalls(2019) }],
      summary:
        'Replaced a fabricated video citation, forum statistics, price claims, and parts-brand advice with the current Taurus rearview-camera safety campaign.',
    },
    'The frozen alternator card combines forum density, third-party costs, mileage averages, regulator and bearing mechanisms, brand recommendations, belt work, and battery sulfation without Ford evidence.',
  ),

  'ford-taurus-axod-e-ax4s-4-speed-automatic-transaxle-failure': replacement(
    {
      years: [1996],
      trims: ['Certain vehicles equipped with affected AX4S automatic transaxles'],
      category: 'transmission',
      title: 'AX4S Park-Pawl Engagement Recalls',
      description:
        'NHTSA campaigns 96V086, 96V166, and 96V176 cover distinct 1996 Taurus automatic-transaxle conditions that can prevent the park pawl from engaging the park gear. Causes include a damaged park-pawl-shaft roll pin, a sharp abutment-bracket edge, or restricted park-pawl-shaft rotation.',
      solution:
        'Check the VIN for every applicable Ford campaign. Depending on the campaign, dealers inspect and replace the roll pin and shaft, the park-pawl abutment bracket, or a restricted shaft. Always apply the parking brake; movement after Park is selected requires immediate service.',
      severity: 'high',
      symptoms: ['Vehicle may roll as if in Neutral while the selector indicates Park'],
      affectedSystems: ['AX4S park pawl', 'park-pawl shaft and roll pin', 'park-pawl abutment bracket'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 96V086, 96V166, and 96V176', url: recalls(1996) }],
      summary:
        'Replaced a decade-wide transaxle reliability essay with the exact 1996 AX4S park-pawl conditions, failure modes, and campaign repairs.',
    },
    'The frozen card extrapolated advocacy, Wikipedia, and aftermarket sources into a universal lubrication defect, survey rate, warranty claim, redesign history, cooler advice, and rebuild prescription. Retain the defined safety recalls instead.',
  ),

  'ford-taurus-ignition-switch-internal-short-fire-risk': replacement(
    {
      years: [2017, 2018],
      trims: ['Vehicles with mechanical-key ignition systems identified by VIN'],
      category: 'transmission',
      title: 'Ignition Key Can Be Removed Outside Park',
      description:
        'NHTSA campaign 18V141 covers certain 2017-2018 Taurus vehicles with mechanical-key ignition. An incorrect shifter assembly can allow the ignition key to be removed while the transmission is not in Park, creating a rollaway risk if the parking brake is not applied.',
      solution:
        'Check the VIN for Ford recall 18C02. Ford dealers replace the shifter assembly free of charge. Until repaired, verify Park engagement and apply the parking brake before removing the key or exiting the car.',
      severity: 'high',
      symptoms: ['Ignition key may be removable while the transmission is not in Park'],
      affectedSystems: ['shifter assembly', 'mechanical-key ignition interlock'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 18V141 / Ford Recall 18C02', url: recalls(2017) }],
      summary:
        'Replaced an advocacy-sourced 1990-1993 ignition-switch fire narrative with the exact 2017-2018 mechanical-key ignition interlock recall.',
    },
    'The frozen card depended on secondary advocacy and incident counts and could not be reconciled to the current NHTSA Taurus result set. Retain the direct ignition-related compliance campaign instead.',
  ),

  'ford-taurus-power-steering-pump-1996': replacement(
    {
      years: [2011, 2012, 2013],
      trims: ['2011-2012 vehicles with 3.5L GTDI engines and certain 2013 vehicles identified by VIN'],
      engines: ['3.5L GTDI (2011-2012 population)', 'Any available engine in covered 2013 population'],
      category: 'steering',
      title: 'Electric Power-Steering Assist Loss Recall',
      description:
        'NHTSA campaign 15V340 covers specified 2011-2013 Taurus vehicles whose electric power-steering assist can shut down because of a steering-motor sensor fault. Steering remains mechanically possible but requires greater effort, especially at low speed.',
      solution:
        'Check the VIN for Ford recall 15S18. Ford dealers inspect the Power Steering Control Module for loss-of-assist codes; covered vehicles receive a steering-gear replacement when codes are present or a PSCM software update when they are not. Sudden loss of assist requires prompt service.',
      severity: 'high',
      symptoms: ['Sudden loss of power-steering assist', 'Increased steering effort at low speed'],
      affectedSystems: ['electric steering gear', 'steering-motor sensor', 'Power Steering Control Module'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V340 / Ford Recall 15S18', url: recalls(2013) }],
      summary:
        'Replaced a fabricated video citation and twelve-year hydraulic-pump maintenance card with the exact Taurus electric-steering safety recall.',
    },
    'The frozen card mixed pumps, bearings, internal and hose leaks, taxi use, prices, Mercon V, replacement, and a 50,000-mile flush interval without Ford evidence.',
  ),

  'ford-taurus-rear-subframe-engine-cradle-corrosion': replacement(
    {
      years: [1999, 2000, 2001],
      trims: ['Vehicles in specified road-salt jurisdictions identified by VIN'],
      category: 'suspension',
      title: 'Front Coil-Spring Corrosion and Tire-Contact Recall',
      description:
        'NHTSA campaign 04V332 covers certain 1999-2001 Taurus vehicles in specified road-salt jurisdictions. A front coil spring can fracture from corrosion, move past its seat, contact a front tire, and cause rapid air loss.',
      solution:
        'Check the VIN and registration history for Ford recall 04S17. Ford dealers install protective spring shields under the recall procedure. Historical extended spring coverage has expired, so do not promise current warranty replacement beyond an open recall obligation.',
      severity: 'high',
      symptoms: ['Possible fractured front coil spring', 'Possible spring contact with a front tire and rapid pressure loss'],
      affectedSystems: ['front coil springs', 'spring seats', 'front tires'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 04V332 / Ford Recall 04S17', url: recalls(2000) }],
      summary:
        'Replaced complaint and forum subframe-corrosion claims with the exact salt-region front spring fracture recall, tire risk, and protective-shield remedy.',
    },
    'The frozen card mislabels an engine cradle as a rear subframe, then asserts rot-through mileage, steering separation, warranty denial, used-cradle replacement, welding, washing, and undercoating without Ford evidence.',
  ),

  'ford-taurus-sho-v8-camshaft-sprocket-failure': replacement(
    {
      years: [1993, 1994, 1995],
      trims: ['SHO with automatic transmission included in the affected speed-control population'],
      category: 'electrical',
      title: 'SHO Speed-Control Deactivation Switch Fire Recall',
      description:
        'NHTSA\'s recall advisory for campaign 07V336 includes 1993-1995 Taurus SHO vehicles with automatic transmission. The speed-control deactivation switch can leak internally and overheat, creating a fire risk even when the car is parked and the ignition is off.',
      solution:
        'Check the VIN and recall-completion history with Ford. The campaign used switch disconnection as an interim action and a fused wiring harness as the final repair. Heat, smoke, or burning odor near the switch requires immediate isolation from structures and professional service.',
      severity: 'high',
      symptoms: ['Possible switch overheating, smoke, or fire while parked or driving'],
      affectedSystems: ['speed-control deactivation switch', 'fused switch wiring harness'],
      sources: [{ type: 'recall', title: 'NHTSA Consumer Advisory for Campaign 07V336', url: 'https://static.nhtsa.gov/odi/rcl/2007/RCORRD-07V336-1234.pdf' }],
      summary:
        'Replaced a secondary-source 1996-1999 V8 SHO camshaft failure and enthusiast welding recommendation with the exact Taurus SHO fire recall.',
    },
    'The frozen card relied on community, Wikipedia, and media sources for a manufacturing mechanism, failure rate, mileage, interference damage, Ford TSB interpretation, welding or pinning, and total-loss claim. Retain a direct NHTSA SHO safety action instead.',
  ),

  'ford-taurus-transmission-failure-1996': replacement(
    {
      years: [1999],
      trims: ['Vehicles with the California emissions package identified by VIN'],
      category: 'transmission',
      title: 'Transmission Oil-Cooler Line Fire Recall',
      description:
        'NHTSA campaign 98V288 covers certain 1999 Taurus vehicles with the California emissions package. An incorrect transmission oil-cooler line can contact the ABS module support bracket, wear through, and leak fluid onto the exhaust manifold or catalytic converter, creating a fire risk.',
      solution:
        'Check recall completion by VIN with Ford. Dealers install the correct transmission oil-cooler line. Transmission-fluid odor, leakage, or smoke near hot exhaust components requires immediate shutdown and professional inspection.',
      severity: 'high',
      symptoms: ['Possible transmission-fluid leak near the ABS support bracket or exhaust', 'Burning-fluid odor or smoke'],
      affectedSystems: ['transmission oil-cooler line', 'ABS module support bracket'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 98V288 - Taurus Transmission Cooler Line', url: recalls(1999) }],
      summary:
        'Replaced an uncited twelve-year AX4S/AX4N rebuild and price card with the exact 1999 cooler-line fire recall.',
    },
    'The frozen card combined torque converters, valve bodies, solenoids, clutches, bands, coolers, road tests, pressure tests, multiple repair tiers, and prices without a Ford-defined condition.',
  ),

  'ford-taurus-vulcan-head-gasket-1996': replacement(
    {
      years: [2013, 2014, 2015],
      trims: ['Campaign coverage varies by VIN and engine'],
      engines: ['3.5L GTDI EcoBoost in the fuel-pump module campaign', 'Other 2013 campaign populations identified by VIN'],
      category: 'fuel',
      title: 'Fuel Delivery Module Leak and Fuel-Pump Power Recalls',
      description:
        'NHTSA campaigns 13V227 and 15V812 cover certain 2013 Taurus vehicles whose fuel delivery module can crack and leak fuel. Campaign 16V621 covers certain 2013-2015 3.5L GTDI Taurus and Police Interceptor vehicles whose fuel-pump electronic module can overheat and cut electrical power to the fuel pump, causing a stall or no-start.',
      solution:
        'Check the VIN for Ford recalls 13S04, 13S04-S1, and 16S31. Ford replaces the covered fuel delivery module or inspects and replaces the fuel-pump electronic module free of charge. Fuel odor or leakage requires shutdown away from ignition sources; a stall or no-start requires proper fuel-system diagnosis.',
      severity: 'high',
      symptoms: ['Possible fuel leak', 'Possible engine stall or no-start from loss of fuel-pump power'],
      affectedSystems: ['fuel delivery module', 'fuel-pump electronic module', 'electric fuel pump power supply'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 13V227, 15V812, and 16V621', url: recalls(2013) }],
      summary:
        'Replaced an uncited twelve-year head-gasket and engine-replacement card with the exact Taurus fuel-leak and fuel-pump-power safety campaigns.',
    },
    'The frozen card generalized head-gasket deterioration, overheating, tests, machining, bolts, water pumps, contamination, engine replacement, and prices across every 1996-2007 Vulcan without a Ford primary source.',
  ),
};

module.exports = buildConfig({
  label: 'Ford Taurus',
  make: 'Ford',
  model: 'Taurus',
  slug: 'ford-taurus',
  batchId: 'ford-taurus-full-record-cohort-132-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '1e63e5fd88c8c4b042b74e03c6b75627bb1f59921f71bd73e68b2ad5a969a0ac',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-taurus/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordtaurus_blind:manual-primary-source-gate',
    edge: 'fordtaurus_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
