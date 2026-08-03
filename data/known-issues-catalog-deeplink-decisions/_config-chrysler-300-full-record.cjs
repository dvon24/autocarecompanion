const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

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
      trims: card.trims,
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

const absEscFuse = {
  years: [2011, 2012],
  trims: ['Vehicles built through December 20, 2011 and included in recall M10 / 12V-197; verify by VIN'],
  category: 'brakes',
  title: 'Power-Distribution Fuse Can Overheat and Disable ABS/ESC (Recall 12V-197)',
  description: 'Recall M10 / 12V-197 covers certain 2011-2012 Chrysler 300 vehicles built through December 20, 2011. The Power Distribution Center bus bar may overheat, causing loss of the Antilock Brake System and/or Electronic Stability Control. This is an electrical fuse-location condition, not a general internal ABS-module failure.',
  solution: 'Check the VIN for open recall M10. A Chrysler dealer inspects the ABS/ESC fuse type; vehicles that fail inspection receive an upgraded fuse relocated within the Power Distribution Center, at no charge. ABS or ESC warnings outside this recall still require diagnosis rather than automatic module replacement.',
  severity: 'high',
  symptoms: ['ABS warning or loss of ABS function', 'ESC warning or loss of stability-control function', 'Overheating at the Power Distribution Center bus bar'],
  affectedSystems: ['Power Distribution Center bus bar', 'ABS/ESC fuse and circuit', 'antilock braking and electronic stability control'],
  sources: [{ type: 'recall', title: 'Chrysler Safety Recall M10 / NHTSA 12V-197 - ABS/ESC Wiring', url: 'https://static.nhtsa.gov/odi/rcl/2012/RCRIT-12V197-2480.pdf' }],
  summary: 'Replaced the broad 2011-2021 ABS-module claim with recall M10\'s exact 2011-2012 fuse/bus-bar condition and fuse-relocation remedy.',
};

const alternator = {
  years: [2011, 2012, 2013, 2014],
  trims: ['Vehicles included in alternator recalls P60 / 14V-634, T36 / 17V-435, or T75 / 17V-741; exact engine, alternator amperage, build date, and campaign vary, so verify by VIN'],
  category: 'electrical',
  title: 'Alternator Diode Failure Can Cause Shutdown or Fire (Recalls 14V-634, 17V-435, and 17V-741)',
  description: 'Three FCA recalls cover overlapping groups of 2011-2014 Chrysler 300 vehicles with specified engines, electro-hydraulic power steering, alternator ratings, and build dates. Alternator diode thermal fatigue can cause no output, reduced output, or a short to ground. Depending on the failure mode, the vehicle may lose electrical systems, shut down while driving, or experience an underhood electrical fire, sometimes with little warning.',
  solution: 'Check the VIN against all three campaigns because model year alone cannot identify coverage. An FCA dealer replaces the affected alternator assembly with the campaign remedy at no charge. A battery-saver warning, smoke, burning odor, charging failure, or engine shutdown warrants stopping safely and arranging service rather than continuing to drive.',
  severity: 'high',
  symptoms: ['Battery-saver or charging-system warning', 'Electrical systems shut down as voltage falls', 'Engine stalls or vehicle shuts down while driving', 'Smoke, burning odor, or heat near the alternator'],
  affectedSystems: ['alternator rectifier diodes', 'vehicle charging system', 'electrical-system voltage and dependent control modules'],
  sources: [
    { type: 'recall', title: 'FCA Safety Recall P60 / NHTSA 14V-634 - Alternator', url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V634-1558.pdf' },
    { type: 'recall', title: 'FCA Safety Recall T36 / NHTSA 17V-435 - Alternator Diode Thermal Fatigue', url: 'https://static.nhtsa.gov/odi/rcl/2017/RCONL-17V435-3613.pdf' },
    { type: 'recall', title: 'FCA Safety Recall T75 / NHTSA 17V-741 - Alternator', url: 'https://static.nhtsa.gov/odi/rcl/2017/RCRIT-17V741-2657.pdf' },
  ],
  summary: 'Rebuilt the multiple-recall card around FCA\'s three exact campaigns, their overlapping but VIN-specific scopes, diode failure modes and no-charge alternator replacement.',
};

const cylinderHead = {
  years: [2011, 2012, 2013],
  trims: ['Select vehicles covered by X56; DealerCONNECT must display the X56 coverage message'],
  engines: ['3.6L Pentastar V6 (ERB)'],
  category: 'engine',
  title: '3.6L Left Cylinder Head Can Cause Misfire Codes (X56 Warranty Extension)',
  description: 'FCA bulletin 09-002-14 Rev. B applies to select 2011-2013 Chrysler 300 vehicles with the 3.6L engine and X56 coverage. The condition may illuminate the malfunction indicator with P0300, P0302, P0304, or P0306. FCA\'s procedure requires a cylinder-leakage test and applies only when an affected cylinder shows 25 percent or greater leakage. The related warranty bulletin extended qualifying vehicles to 10 years or 150,000 miles from the in-service date, whichever came first.',
  solution: 'Have a Chrysler dealer check the VIN for the X56 message before assuming coverage. For the listed misfire condition, the bulletin calls for a cylinder-leakage test. If leakage is at least 25 percent, the dealer replaces the left cylinder head; if not, the bulletin says to continue normal diagnosis. Because the original time/mileage window may have expired, confirm current coverage before authorizing work.',
  severity: 'medium',
  symptoms: ['Malfunction indicator lamp', 'P0300 multiple-cylinder misfire', 'P0302, P0304, or P0306 left-bank cylinder misfire', 'At least 25 percent leakage on an affected cylinder under FCA\'s test'],
  affectedSystems: ['3.6L left cylinder head', 'left-bank cylinders and valves', 'engine compression and combustion'],
  sources: [
    { type: 'tsb', title: 'FCA Bulletin 09-002-14 Rev. B - Left Cylinder Head Misfire Diagnosis and Replacement', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10139897-9999.pdf' },
    { type: 'tsb', title: 'FCA Warranty Bulletin D-14-12 / X56 - 3.6L Left Cylinder Head', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10069161-0335.pdf' },
  ],
  summary: 'Narrowed the decade-wide cylinder-head claim to X56\'s select 2011-2013 3.6L population, documented misfire codes, leakage-test threshold and original warranty terms.',
};

const monostableShifter = {
  years: [2012, 2013, 2014],
  trims: ['Vehicles with the 3.6L engine and monostable electronic shifter included in recall S27 / 16V-240; verify by VIN'],
  engines: ['3.6L V6'],
  category: 'transmission',
  title: 'Monostable Shifter Can Leave the Vehicle Out of Park (Recall 16V-240)',
  description: 'Recall S27 / 16V-240 covers certain 2012-2014 Chrysler 300 vehicles with the 3.6L engine and an 8-speed transmission using a spring-loaded monostable selector. Drivers may mistakenly believe Park was selected because the lever returns to its center position. If the engine remains running, the parking brake is not set, and the transmission is not in Park when the driver exits, the vehicle can roll away.',
  solution: 'Always verify the Park indication and fully apply the parking brake before exiting. Check the VIN for open recall S27. The no-charge remedy reprograms the PCM, TCM, Radio Frequency Hub, and instrument cluster to add Auto Park, and adds an owner-manual card explaining the feature.',
  severity: 'high',
  symptoms: ['Selector returns to its center position after a gear choice', 'Driver believes Park is selected when it is not', 'Vehicle can move after the driver exits with the engine running'],
  affectedSystems: ['monostable electronic shift selector', 'Park-selection strategy', 'PCM, TCM, Radio Frequency Hub, and instrument-cluster software'],
  sources: [{ type: 'recall', title: 'FCA Safety Recall S27 / NHTSA 16V-240 - Transmission Electronic Shift Lever', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V240-0726.pdf' }],
  summary: 'Kept the rollaway card but narrowed it to the exact 2012-2014 3.6L population and documented the monostable-selector risk, parking-brake precaution and Auto Park software remedy.',
};

const published = {
  'chrysler-300-abs-module-2011': replacement(absEscFuse, 'Replace the broad ABS-module-failure card with recall M10 / 12V-197\'s exact PDC bus-bar and ABS/ESC fuse condition.'),
  'chrysler-300-alternator-2011': replacement(alternator, 'Retain the multiple-recall card but define the three FCA campaigns, overlapping scopes, diode failure modes and official remedy.'),
  'chrysler-300-cylinder-head-2011': replacement(cylinderHead, 'Replace the 2011-2021 aggregation with X56\'s select 2011-2013 3.6L population and FCA\'s measured leakage-test gate.'),
  'chrysler-300-shifter-rollaway-2012': replacement(monostableShifter, 'Narrow the rollaway warning to recall S27 / 16V-240\'s 2012-2014 3.6L monostable-shifter population and Auto Park remedy.'),
};

const reasons = {
  'chrysler-300-control-arm-2011': 'The frozen card asserts a 2011-2021 control-arm bushing pattern and replacement strategy from secondary/commerce material without one FCA/NHTSA record establishing that population and mechanism.',
  'chrysler-300-dash-warp-2005': 'The frozen sixteen-year dashboard-warping aggregation lacks a primary FCA/NHTSA source defining an affected population, cause, or manufacturer remedy.',
  'chrysler-300-differential-2011': 'The frozen rear-differential card combines whine, bearing wear and complete failure across many drivetrains and years without a single primary-source scope or diagnostic procedure.',
  'chrysler-300-evap-leak-2011': 'The frozen card treats P0456 as one parts failure across 2011-2021 even though that code can have multiple leak sources; no primary record supports its universal ESIM replacement guidance.',
  'chrysler-300-evap-leak-detection-failure-triggers-p0455-p0456-often-misdi': 'This is a second, overlapping EVAP aggregation spanning 2005-2021. Its broad NVLD/ESIM diagnosis and parts guidance are not established by one FCA/NHTSA source.',
  'chrysler-300-exhaust-manifold-bolts-2005': 'The frozen 5.7L exhaust-manifold-bolt claim spans seventeen model years using secondary and aftermarket material without a Chrysler bulletin establishing that full population and universal repair.',
  'chrysler-300-front-suspension-2005': 'The frozen LX suspension card combines several wear components over seventeen model years and cannot support one failure mechanism, affected population, or parts list from primary evidence.',
  'chrysler-300-fuel-pump-relay-2011': 'The frozen card applies a TIPM fuel-pump-relay narrative to the Chrysler 300 without a model-specific FCA/NHTSA recall or bulletin establishing the listed 2011-2021 population and bypass/replacement remedy.',
  'chrysler-300-hemi-lifter-2011': 'The frozen HEMI lifter/cam card generalizes a mechanical theory, mileage band and replacement package across eleven model years without a qualifying FCA/NHTSA source for that population.',
  'chrysler-300-oil-filter-housing-2011': 'The frozen 3.6L oil-filter-housing claim relies on secondary/aftermarket sources and does not establish one FCA-defined 2011-2021 population or universal housing replacement.',
  'chrysler-300-shifter-clip-2005': 'The frozen stuck-in-Park card is based on owner and aftermarket material. Research did not establish a Chrysler 300 recall covering the asserted 2005-2010 plastic interlock-latch population.',
  'chrysler-300-starter-2011': 'The frozen starter-failure card is a broad symptom and parts aggregation with no FCA/NHTSA record defining a 2011-2021 Chrysler 300 defect population.',
  'chrysler-300-tipm-2011': 'The frozen TIPM card combines unrelated electrical symptoms and possible circuits across eleven years without a single primary source supporting a universal TIPM diagnosis or replacement.',
  'chrysler-300-water-pump-2011': 'The frozen cooling card combines leaks, bearing noise and overheating across multiple engines and eleven model years without one FCA/NHTSA source defining the claimed population and remedy.',
  'chrysler-300-window-regulator-2011': 'The frozen eleven-year window-regulator aggregation lacks a primary FCA/NHTSA source for its population, cable mechanism and universal regulator/motor replacement guidance.',
  'chrysler-300-zf8-trans-2012': 'The frozen 2012-2021 harsh-shifting card combines software adaptation, fluid and mechanical theories across many calibrations. Distinct transmission recalls remain proposal-only rather than being misrepresented as this broad condition.',
};

module.exports = buildConfig({
  label: 'Chrysler 300',
  make: 'Chrysler',
  model: '300',
  slug: 'chrysler-300',
  batchId: 'chrysler-300-full-record-cohort-49-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '218d2f986f19a578aebd7a1eb848658a0f28a081a426b7ad64e6b3e47601399d',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-300/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chrysler300_blind:manual-primary-source-gate',
    edge: 'chrysler300_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '19V018000',
    '18V021000',
    '16V352000',
    '15V313000',
    '10V200000',
    '10V475000',
    '09V420000',
    '13V118000',
    '12V004000',
    '13V610000',
    '18E053000',
    '18V332000',
    '17V097000',
    '15V461000',
    '18V280000',
    '18V524000',
    '24V198000',
    '19V203000',
    '21V516000',
    '22V504000',
    '22V808000',
    '24V112000',
  ],
});
