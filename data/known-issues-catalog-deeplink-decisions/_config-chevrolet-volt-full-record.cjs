const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: [],
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

const propulsionSoftware = {
  years: [2013],
  trims: ['Vehicles included in recall 18V-397 / GM 18215 after receiving the affected dealer service software; verify by VIN'],
  category: 'drivetrain',
  title: 'Faulty Service Software Can Cause Reduced Power or Propulsion Loss (Recall 18V-397)',
  description: 'Recall 18V-397 covers certain 2013 Chevrolet Volts that received dealer service software with battery-cell balancing disabled. A cell can fall into a low-voltage condition, first causing a Propulsion Power Is Reduced warning and reduced-power mode. Continuing to drive after that warning can lead to loss of propulsion. This is not a general 2011-2015 battery-degradation recall.',
  solution: 'Check the VIN for open recall 18V-397 / GM 18215. A Chevrolet dealer reprograms the Vehicle Interface Control Module with corrected software that restores cell balancing, at no charge. If the reduced-power warning appears, move to a safe location and arrange service rather than continuing to drive.',
  severity: 'high',
  symptoms: ['Propulsion Power Is Reduced warning', 'Vehicle enters reduced-power mode', 'Possible propulsion loss if driving continues after the warning'],
  affectedSystems: ['Vehicle Interface Control Module service software', 'high-voltage battery cell balancing', 'electric propulsion'],
  sources: [{ type: 'recall', title: 'NHTSA Recall 18V-397 / GM 18215 - VICM Service Software', url: 'https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V397-2406.pdf' }],
  summary: 'Narrowed the five-year battery-failure aggregation to recall 18V-397\'s exact 2013 service-software population, warning sequence and no-charge reprogramming remedy.',
};

const tieRod = {
  years: [2014],
  trims: ['Vehicles included in recall 15V-442 / GM 15386; verify by VIN'],
  category: 'steering',
  title: 'Inner Tie Rod Can Separate From the Steering Gear (Recall 15V-442)',
  description: 'Recall 15V-442 covers certain 2014 Chevrolet Volt vehicles whose inner tie-rod attachment may not have been tightened to specification. The tie rod can separate from the steering gear without warning, causing loss of steering and increasing crash risk. The frozen card incorrectly labeled this as a 2015 Volt issue.',
  solution: 'Check the VIN for open recall 15V-442 / GM 15386. Dealers replace the complete steering-gear assembly and perform the related alignment work at no charge. Because separation can occur without warning, arrange recall service promptly if the VIN is included.',
  severity: 'high',
  symptoms: ['VIN included in recall 15V-442', 'No warning is guaranteed before separation', 'Loss of steering if the inner tie rod separates'],
  affectedSystems: ['inner tie-rod attachment', 'steering gear assembly', 'directional control'],
  sources: [{ type: 'recall', title: 'GM Recall 15386 / NHTSA 15V-442 - Inner Tie Rod Not Torqued to Specification', url: 'https://static.nhtsa.gov/odi/rcl/2015/RCSB-15V442-4478.pdf' }],
  summary: 'Corrected the model year from 2015 to 2014 and replaced secondary citations with GM\'s recall bulletin, exact loss-of-steering mechanism and steering-gear remedy.',
};

const postCrashFire = {
  years: [2011, 2012],
  trims: ['Historical investigation population; customer-satisfaction action applied to 14,735 vehicles built before December 21, 2011'],
  category: 'safety',
  title: 'Historical Post-Crash Battery-Fire Investigation Closed Without a Defect Trend (PE11-037)',
  description: 'NHTSA investigation PE11-037 examined thermal events seen only in agency tests after side-impact intrusion damaged the high-voltage battery, leaked coolant, and a rollover sequence saturated electronics. At closure in January 2012, NHTSA reported no consumer crash fires or coolant-leak incidents and had not identified a defect trend. This was not a general in-use battery-fire recall.',
  solution: 'GM offered a free customer-satisfaction action for 14,735 early vehicles, adding structural reinforcement, a high-voltage coolant-loss sensor and control software, and a coolant-system tamper device. After any significant collision, have trained responders and a Chevrolet EV-qualified facility follow high-voltage isolation and post-crash inspection procedures.',
  severity: 'medium',
  symptoms: ['Historical population built before December 21, 2011', 'Severe side-impact intrusion into the high-voltage battery in testing', 'High-voltage coolant loss after a crash'],
  affectedSystems: ['high-voltage battery enclosure', 'battery coolant containment and sensing', 'underbody side-impact structure'],
  sources: [{ type: 'nhtsa', title: 'NHTSA PE11-037 Closing Resume - Post-Crash EV Fire Hazard', url: 'https://static.nhtsa.gov/odi/inv/2011/INCLA-PE11037-8445.PDF' }],
  summary: 'Reframed the card as a closed, test-only historical investigation, documented the absence of a real-world defect trend at closure and retained GM\'s exact customer-satisfaction modifications.',
};

const rearBrakes = {
  years: [2018, 2019],
  trims: ['Vehicles included in recall 18V-576 / GM N182167900; verify by VIN'],
  category: 'brakes',
  title: 'Trapped Gas Can Reduce Rear-Brake Performance (Recall 18V-576)',
  description: 'Recall 18V-576 covers certain 2018-2019 Chevrolet Volt vehicles whose rear-caliper pistons may release a small amount of trapped hydrogen gas into the hydraulic brake system. Gas in the system can reduce rear-brake performance and increase crash risk.',
  solution: 'Check the VIN for open recall 18V-576 / GM N182167900. Dealers bleed the complete hydraulic brake system to remove trapped gas, at no charge. A soft or unusually long brake pedal warrants prompt professional inspection even if recall status is not yet known.',
  severity: 'high',
  symptoms: ['Soft or unusually long brake-pedal travel', 'Reduced rear-brake contribution', 'VIN included in recall 18V-576'],
  affectedSystems: ['rear brake-caliper pistons', 'hydraulic brake fluid', 'rear braking performance'],
  sources: [{ type: 'recall', title: 'GM Recall N182167900 / NHTSA 18V-576 - Rear Brake Piston Degassing', url: 'https://static.nhtsa.gov/odi/rcl/2018/RCSB-18V576-9113.pdf' }],
  summary: 'Kept the exact 2018-2019 recall population and replaced secondary coverage with GM\'s official defect mechanism and complete brake-system bleeding remedy.',
};

const becm = {
  years: [2016, 2017, 2018, 2019],
  trims: ['2016-2019 vehicles covered by bulletin 18-NA-261; Special Coverage N232432680 applies to 2016-2018 vehicles for 15 years or 150,000 miles'],
  category: 'electrical',
  title: 'Battery Energy Control Module Communication Failure Can Cause Reduced Power, No Start, or No Charge',
  description: 'GM bulletin 18-NA-261 covers 2016-2019 Volts with an internal Battery Energy Control Module communication failure that can illuminate the malfunction indicator and cause a no-start condition. NHTSA investigated reports of reduced power, no start, no charge, and alleged loss of motive power, then closed PE23-022 in March 2025 after GM issued special coverage. NHTSA said nearly all reviewed failures matched reduced-power, no-start, or no-charge outcomes; it knew of one minor crash and no injuries or deaths. Closure was not a finding that no safety defect exists.',
  solution: 'Have an EV-qualified Chevrolet dealer scan for the BECM lost-communication code family and follow bulletin 18-NA-261. The prescribed repair is BECM replacement and reprogramming. Special Coverage N232432680 covers qualifying 2016-2018 Volts for 15 years or 150,000 miles from first service, regardless of ownership; confirm eligibility by VIN. The bulletin includes 2019, but the special coverage does not.',
  severity: 'medium',
  symptoms: ['Malfunction indicator lamp', 'Reduced propulsion message or reduced-power mode', 'No-start condition', 'No-charge condition'],
  affectedSystems: ['Battery Energy Control Module', 'hybrid/EV battery interface communication', 'high-voltage battery monitoring'],
  sources: [
    { type: 'tsb', title: 'GM Bulletin 18-NA-261 - BECM Lost Communication, No Start and Related DTCs', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10209256-0001.pdf' },
    { type: 'tsb', title: 'GM Special Coverage N232432680 - Battery Energy Control Module Malfunction', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251431-0001.pdf' },
    { type: 'nhtsa', title: 'NHTSA PE23-022 Closing Resume - Loss of Motive Power Due to BECM', url: 'https://static.nhtsa.gov/odi/inv/2023/INCLA-PE23022-11305.pdf' },
  ],
  summary: 'Replaced forum and press coverage with GM\'s diagnostic bulletin, 2016-2018 special-coverage terms and NHTSA\'s 2025 investigation closure, while preserving the 2019 coverage limitation.',
};

const shiftToPark = {
  years: [2016, 2017, 2018, 2019],
  trims: ['Second-generation Volt; confirm bulletin and warranty applicability by VIN and service date'],
  category: 'electrical',
  title: 'Intermittent Shift-to-Park Message While the Vehicle Is Already in Park',
  description: 'GM bulletin 19-NA-206 addresses an intermittent Shift to Park message after the Volt has been shifted into Park and the ignition turned off. The park switch in the shifter assembly may fail to pull the Body Control Module signal low, so the vehicle does not electronically recognize Park. This is a service bulletin, not a safety recall.',
  solution: 'Have a Chevrolet technician verify the condition and apply bulletin 19-NA-206. The current service procedure removes the shifter control, installs the specified replacement shifter harness and an in-line jumper harness, then verifies operation. Ask the dealer to check the VIN\'s applicable warranties rather than relying on an assumed universal no-charge repair.',
  severity: 'medium',
  symptoms: ['Shift to Park message with the selector physically in Park', 'Message appears after attempting to turn the vehicle off', 'Condition may be intermittent'],
  affectedSystems: ['park-position switch', 'shifter wiring harness', 'Body Control Module park signal'],
  sources: [{ type: 'tsb', title: 'GM Bulletin 19-NA-206 - Intermittent Shift to Park Message', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186071-9999.pdf' }],
  summary: 'Removed DIY, cost and universal-warranty claims and replaced them with GM\'s exact park-switch mechanism, current harness/jumper procedure and VIN-specific coverage advice.',
};

const published = {
  'chevrolet-volt-gen-1-reduced-propulsion-power-hv-battery-low-voltage-cell-b': replacement(propulsionSoftware, 'Replace the broad 2011-2015 battery-degradation aggregation with recall 18V-397\'s exact 2013 faulty-service-software population and remedy.'),
  'chevrolet-volt-inner-tie-rod-separation-from-steering-gear': replacement(tieRod, 'Correct the frozen 2015 model year to the 2014 Volt population identified by recall 15V-442 and use the official GM remedy.'),
  'chevrolet-volt-post-crash-high-voltage-battery-coolant-leak-delayed-fire-ri': replacement(postCrashFire, 'Retain only the closed PE11-037 historical investigation, its test-only conditions, no-defect-trend finding and customer-satisfaction modifications.'),
  'chevrolet-volt-rear-brake-caliper-piston-gas-pocket-reduced-rear-braking': replacement(rearBrakes, 'Keep the exact 2018-2019 recall 18V-576 population and official hydraulic-system remedy.'),
  'chevy-volt-becm-power-loss-2016': replacement(becm, 'Replace secondary reporting with GM bulletin 18-NA-261, Special Coverage N232432680 and NHTSA PE23-022\'s closing record, including the 2019 coverage limitation.'),
  'chevy-volt-shift-to-park-2016': replacement(shiftToPark, 'Replace legal-blog, forum, DIY-cost and universal-coverage claims with GM bulletin 19-NA-206\'s exact condition, cause and prescribed repair.'),
};

const reasons = {
  'chevrolet-volt-120v-charging-cord-overheating-melting-plug': 'The frozen card relies on two press articles and a forum thread for campaign 11888, wiring gauge, burn and replacement claims. Current GM/NHTSA primary research did not establish that complete population and remedy.',
  'chevrolet-volt-12v-auxiliary-battery-parasitic-drain-apm-failure-leaving-ca': 'The frozen card combines many possible causes across both Volt generations using press, forum and parts-commerce sources. No single GM/NHTSA primary source supports the nine-year population, mechanism or replacement guidance.',
  'chevy-volt-battery-coolant-heater-2011': 'The frozen five-year coolant-heater claim is supported only by one owner-forum thread. Current primary-source research did not establish a defined population, failure mechanism or GM remedy.',
  'chevy-volt-passenger-sensing-2012': 'The frozen card falsely calls PE19-013 a recall and promises a free dealer repair without any citation. NHTSA opened an investigation, but the current primary-source packet does not establish a recall or the claimed no-charge remedy, so the card cannot remain published as written.',
};

module.exports = buildConfig({
  label: 'Chevrolet Volt',
  make: 'Chevrolet',
  model: 'Volt',
  slug: 'chevrolet-volt',
  batchId: 'chevrolet-volt-full-record-cohort-47-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '2d6b7ec447799f1093108682f648255998aa458df5ae1676f7ef905147e382ce',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-volt/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletvolt_blind:manual-primary-source-gate',
    edge: 'chevroletvolt_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
