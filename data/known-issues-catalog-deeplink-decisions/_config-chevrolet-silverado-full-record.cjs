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
      typicalMileageLow: card.typicalMileageLow || null,
      typicalMileageHigh: card.typicalMileageHigh || null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  afmOil: source(
    'tsb',
    'GM Bulletin 10-06-01-008H - AFM Engine Oil Consumption',
    'https://static.nhtsa.gov/odi/tsbs/2013/MC-10133148-9999.pdf',
  ),
  afmCalibration: source(
    'tsb',
    'GM Service Update 13330 - Active Fuel Management System Calibration',
    'https://static.nhtsa.gov/odi/tsbs/2013/MC-10114218-9999.pdf',
  ),
  l87Recall: source(
    'recall',
    'NHTSA Recall 25V-274 - L87 Connecting-Rod and Crankshaft Manufacturing Defects',
    'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V274-1598.PDF',
  ),
  transmissionShudder: source(
    'tsb',
    'GM Bulletin 18-NA-355 - 8-Speed Torque-Converter-Clutch Shudder',
    'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174266-9999.pdf',
  ),
  brakeCorrosion: source(
    'nhtsa',
    'NHTSA Engineering Analysis EA11-001 - Brake Line Corrosion Failure',
    'https://static.nhtsa.gov/odi/inv/2011/INCLA-EA11001-4484.PDF',
  ),
  brakeVacuum: source(
    'recall',
    'NHTSA Recall 19V-645 - Reduced Vacuum Brake Assist',
    'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V645-1287.PDF',
  ),
  acLine: source(
    'tsb',
    'GM Preliminary Information PIT5331 - Compressor-to-Condenser Line Leak',
    'https://static.nhtsa.gov/odi/tsbs/2014/MC-10135312-9999.pdf',
  ),
  instrumentCluster: source(
    'nhtsa',
    'NHTSA TSB Dataset Entry 10023585 - GM Special Coverage 07187B',
    'https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS_RECEIVED_2005-2009.zip',
  ),
  eps2014: source(
    'recall',
    'NHTSA Recall 17V-414 - Temporary Loss of Electric Power Steering Assist',
    'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V414-4300.PDF',
  ),
  eps2015: source(
    'recall',
    'NHTSA Recall 18V-586 - Temporary Loss of Electric Power Steering Assist',
    'https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V586-2418.PDF',
  ),
};

const cards = {
  afmOil: {
    years: [2007, 2008, 2009, 2010, 2011],
    engines: [
      'AFM V8 (RPO L94, LZ1, LC9, LH6, L76, L92, LFA, LMG or LY5)',
    ],
    category: 'engine',
    title: 'AFM Engine Oil Consumption from PCV Pull-Over or Piston-Ring Deposits (Bulletin 10-06-01-008H)',
    description: 'GM bulletin 10-06-01-008H applies to certain 2007-2011 Chevrolet Silverado 1500 trucks with listed Active Fuel Management V8 engines and specific build-date breakpoints. GM describes oil pulled through the PCV system or oil spray from the AFM pressure-relief valve forming deposits in the piston-ring grooves. Customers may report excessive consumption, rough running, a service-engine-soon light, or cracked or fouled spark plugs, commonly after about 30,000-40,000 miles. The bulletin defines excessive consumption for this procedure as more than one quart in 2,000-3,000 miles; it does not establish that every listed truck is affected.',
    solution: 'Have a qualified technician verify the VIN, engine RPO, build date, PCV operation, intake-manifold oil and actual consumption against bulletin 10-06-01-008H. Depending on the documented condition and build breakpoint, GM directs technicians to install the correct updated left valve cover, clean the pistons, install the AFM oil deflector where specified and re-evaluate consumption. If consumption remains greater than one quart per 2,000 miles after the bulletin procedure, GM states that piston-and-ring replacement may be required. Do not buy a generic AFM delete kit from this card.',
    severity: 'high',
    symptoms: [
      'Oil consumption greater than one quart in roughly 2,000-3,000 miles',
      'Oil puddling in the intake manifold from PCV pull-over',
      'Rough running or service-engine-soon light',
      'Cracked or carbon-fouled number 1 or number 7 spark plug',
    ],
    affectedSystems: [
      'Active Fuel Management pressure-relief system',
      'PCV system and left rocker-arm cover',
      'piston-ring grooves and spark plugs',
    ],
    typicalMileageLow: 30000,
    typicalMileageHigh: 40000,
    sources: [sources.afmOil],
    summary: 'Bounded the oil-consumption card to GM bulletin 10-06-01-008H, its 2007-2011 Silverado 1500 population, engine RPOs, build breakpoints and staged service procedure; removed all commerce.',
  },
  afmCalibration: {
    years: [2014],
    trims: ['1500 Series'],
    engines: ['5.3L V8 (RPO L83)'],
    category: 'engine',
    title: 'Incorrect AFM Calibration Can Damage a Hydraulic Lifter (Service Update 13330)',
    description: 'GM service update 13330 covers certain VIN-identified 2014 Chevrolet Silverado 1500 trucks equipped with the 5.3L L83 V8. Incorrect Active Fuel Management calibration values can command the hydraulic lifters at the wrong time while cylinder pressure is high. A lifter can be damaged and the affected cylinder can stop operating. GM reported approximately 52,000 U.S. Chevrolet and GMC vehicles in the service-update population; not every similar 2014 truck was included.',
    solution: 'Check the VIN and historical completion status for GM service update 13330. For an involved vehicle, GM instructed dealers to reprogram the ECM and TCM sequentially with the revised calibration and clear DTCs; the bulletin states that no parts are required. If a cylinder is already inoperative, diagnose the existing mechanical damage separately rather than assuming that a generic lifter kit or camshaft is the update remedy.',
    severity: 'high',
    symptoms: [
      'Affected cylinder stops operating',
      'Engine misfire or rough running after hydraulic-lifter damage',
      'Service-engine-soon light may accompany the inoperative cylinder',
    ],
    affectedSystems: [
      'Active Fuel Management calibration',
      'engine and transmission control modules',
      'AFM hydraulic lifters and affected cylinder',
    ],
    sources: [sources.afmCalibration],
    summary: 'Replaced the unsupported 2007-2019 lifter aggregation with exact VIN-bounded 2014 Silverado 1500 L83 service update 13330 and its calibration-only remedy.',
  },
  l87Recall: {
    years: [2021, 2022, 2023, 2024],
    trims: ['1500 Series'],
    engines: ['6.2L V8 gasoline engine (RPO L87)'],
    category: 'engine',
    title: 'L87 Connecting-Rod or Crankshaft Defect Can Cause Engine Failure (Recall 25V-274)',
    description: 'NHTSA recall 25V-274 includes 107,244 model-year 2021-2024 Chevrolet Silverado 1500 trucks equipped with the 6.2L L87 V8 and built within the suspect manufacturing window. GM identified rod-bearing damage associated with sediment in connecting rods or crankshaft oil galleries and out-of-specification crankshaft dimensions or surface finish. The resulting engine damage can cause loss of propulsion and increase crash risk.',
    solution: 'Check the VIN for open recall 25V-274 (GM N252494000/N252494001/N252494002) and follow the dealer campaign. Dealers inspect the engine and repair or replace it as necessary. Vehicles that pass inspection receive the specified higher-viscosity oil, a new oil-fill cap, a replacement oil filter and an owner-manual insert. Do not substitute an oil additive, bearing kit or owner-selected engine part for the recall procedure.',
    severity: 'high',
    symptoms: [
      'Knocking, banging or other unusual engine noise',
      'Check-engine light',
      'Hesitation, abnormal shifting or high engine speed',
      'Reduced propulsion, engine failure or no-start condition',
    ],
    affectedSystems: [
      'L87 connecting rods and rod bearings',
      'crankshaft dimensions, surface finish and oil galleries',
      'engine propulsion',
    ],
    sources: [sources.l87Recall],
    summary: 'Aligned the L87 card to recall 25V-274, the exact Silverado 1500 population, documented manufacturing causes, warning signs and recall remedy; removed commerce.',
  },
  transmissionShudder: {
    years: [2015, 2016, 2017, 2018],
    engines: ['5.3L L83, 6.2L L86 or 6.0L L8B'],
    category: 'transmission',
    title: '8-Speed Torque-Converter-Clutch Shudder at Light Throttle (Bulletin 18-NA-355)',
    description: 'GM bulletin 18-NA-355 covers 2015-2018 Chevrolet Silverado models equipped with an L83, L86 or L8B engine and M5U or M5X 8-speed automatic transmission. Customers may describe a shake or rumble-strip-like shudder during steady light-throttle acceleration between 25 and 80 mph when the transmission is not actively shifting. GM states that the condition may be torque-converter-clutch shudder but warns that similar sensations can have other causes.',
    solution: 'Confirm the model year, engine, transmission RPO, production breakpoint and driving condition before applying bulletin 18-NA-355. For an eligible pre-breakpoint vehicle presented with TCC shudder, GM specifies the published one-time fluid-exchange procedure using the correct blue-label Mobil 1 Synthetic LV ATF HP and service tools. If the vehicle returns or does not match the described condition, use normal GM diagnostics; do not assume that a torque converter, valve body or additive is required.',
    severity: 'medium',
    symptoms: [
      'Shake or shudder at steady light throttle between 25 and 80 mph',
      'Rumble-strip or rough-expansion-joint sensation',
      'Shudder occurs while the transmission is not actively shifting',
    ],
    affectedSystems: [
      '8L45 or 8L90 torque-converter clutch',
      'M5U or M5X 8-speed automatic transmission fluid',
    ],
    sources: [sources.transmissionShudder],
    summary: 'Bounded the transmission card to bulletin 18-NA-355 and its exact 2015-2018 engine/transmission population, driving condition and one-time HP-fluid exchange; removed all parts claims.',
  },
  brakeCorrosion: {
    years: [1999, 2000, 2001, 2002, 2003],
    category: 'brakes',
    title: 'Brake-Pipe Corrosion Can Reduce Braking in Salt-Belt Service (NHTSA EA11-001)',
    description: 'NHTSA engineering analysis EA11-001 examined model-year 1999-2003 GM C/K pickups and SUVs sold or registered in specified salt-belt states, including Chevrolet Silverado trucks. A corroded brake pipe can rupture during a brake application and reduce braking effectiveness. NHTSA found a strong relationship to vehicle age and severe-corrosion regions, with most reported failures after more than ten years in service. The agency did not identify a specific safety defect and closed the investigation without a recall.',
    solution: 'Treat a low brake-fluid level, visible pipe corrosion, a soft or dropping pedal or reduced braking as an immediate inspection need. Have the complete brake-pipe assembly inspected, especially on an older salt-belt truck, and repair confirmed corrosion using current GM service information. EA11-001 was an investigation, not a recall or a universal parts directive; do not infer that every 1999-2003 Silverado requires the same prepackaged line kit.',
    severity: 'high',
    symptoms: [
      'Visible heavy corrosion across brake-pipe sections',
      'Brake-fluid leak after a pipe rupture',
      'Soft or dropping brake pedal',
      'Reduced braking effectiveness or increased stopping distance',
    ],
    affectedSystems: [
      'steel hydraulic brake pipes and corrosion coating',
      'hydraulic brake-fluid pressure and stopping performance',
    ],
    sources: [sources.brakeCorrosion],
    summary: 'Narrowed the corrosion card to NHTSA EA11-001, 1999-2003 salt-belt service and the investigation conclusion that no specific safety defect or recall was established; removed the fuel-line and commerce claims.',
  },
  brakeVacuum: {
    years: [2014, 2015, 2016, 2017, 2018],
    trims: ['1500 Series'],
    category: 'brakes',
    title: 'Reduced Vacuum Assist Can Increase Brake-Pedal Effort (Recall 19V-645)',
    description: 'NHTSA recall 19V-645 covers certain 2014-2018 Chevrolet Silverado 1500 trucks with the affected engine-mounted mechanical vacuum-pump design. Pump output can decrease over time as debris such as oil sludge restricts oil flow through the pump filter screen, reducing vacuum brake assist. Drivers can experience a hard pedal and increased stopping distance, particularly during low-speed soft braking, even though the foundation brakes remain functional.',
    solution: 'Check the VIN and campaign-completion status for recall 19V-645 (GM N192268490). The recall remedy is dealer reprogramming of the Electronic Brake Control Module so the secondary hydraulic brake boost is used more effectively when vacuum assist is depleted. A vacuum-pump replacement may be separately diagnosed or covered under other programs, but it is not the stated 19V-645 recall remedy.',
    severity: 'high',
    symptoms: [
      'Increased brake-pedal effort or hard pedal',
      'Pedal vibration or ticking from the engine compartment',
      'Service Brake Assist message after vacuum drops',
      'Longer stopping distance, especially during low-speed braking',
    ],
    affectedSystems: [
      'engine-mounted mechanical vacuum pump and oil screen',
      'vacuum brake assist',
      'Electronic Brake Control Module hydraulic-assist calibration',
    ],
    sources: [sources.brakeVacuum],
    summary: 'Aligned the brake-assist card to recall 19V-645 and corrected the remedy from owner-selected pump replacement to the campaign EBCM calibration.',
  },
  acLine: {
    years: [2014, 2015],
    trims: ['1500 Series; early-build 2015 requires a muffler in the line'],
    category: 'hvac',
    title: 'Compressor-to-Condenser A/C Line Can Crack and Leak (PIT5331)',
    description: 'GM preliminary information PIT5331 applies to all listed 2014 Chevrolet Silverado 1500 trucks and only early-build 2015 trucks that have a muffler in the compressor-to-condenser line. A small crack or pinhole can form at the inside radius of the first bend near the compressor, allowing oil and refrigerant to spray onto the compressor. The A/C can blow warm and the system may be very low or empty. This bulletin does not identify the condenser itself as the repair.',
    solution: 'Use normal leak diagnostics and verify the line configuration before applying PIT5331. If the leak is confirmed at the described compressor-to-condenser line location, GM directs technicians to replace the line with part 23438932, install support bracket 23264893, recharge to the specified pickup-truck charge and leak-test the system. Do not order a condenser from the former card without locating the actual leak.',
    severity: 'medium',
    symptoms: [
      'A/C blows warm',
      'Refrigerant charge is very low or empty',
      'Oil or refrigerant residue appears near the rear of the compressor',
      'Small crack at the first bend of the compressor-to-condenser line',
    ],
    affectedSystems: [
      'compressor-to-condenser refrigerant line',
      'line support bracket and refrigerant charge',
    ],
    sources: [sources.acLine],
    summary: 'Replaced the unsupported 2014-2020 condenser aggregation with exact PIT5331 line-leak scope, early-2015 configuration check and GM line-plus-bracket repair; removed all commerce.',
  },
  instrumentCluster: {
    years: [2003, 2004],
    category: 'electrical',
    title: 'Instrument-Panel Gauges Can Stick, Flutter or Become Inoperative (Special Coverage 07187B)',
    description: 'GM special coverage 07187B, indexed by NHTSA as document 10023585, covers certain 2003-2004 Chevrolet Silverado vehicles whose instrument-panel-cluster gauges may stick, flutter or become inoperative. The coverage population and terms were VIN- and time/mileage-bounded; the record does not support extending the condition to every 2003-2007 truck or diagnosing a specific stepper motor from symptoms alone.',
    solution: 'Verify the VIN, model year, cluster symptoms and historical special-coverage status using current GM service information. Follow the applicable instrument-cluster diagnostic and repair process for a confirmed condition. Because special coverage 07187B was not a safety recall and its eligibility terms may have expired, do not promise a free repair or purchase a generic cluster or stepper-motor kit from this card.',
    severity: 'medium',
    symptoms: [
      'One or more instrument-panel gauges stick',
      'Gauge pointer flutters',
      'Gauge becomes intermittently or continuously inoperative',
      'Displayed speed or another gauge value may be unreliable',
    ],
    affectedSystems: [
      'instrument panel cluster and gauge displays',
    ],
    sources: [sources.instrumentCluster],
    summary: 'Narrowed the instrument-cluster card to GM special coverage 07187B and its 2003-2004 population, avoided a universal stepper-motor diagnosis and removed the commerce claim.',
  },
  eps: {
    years: [2014, 2015],
    trims: ['Light Duty / 1500 Series'],
    category: 'steering',
    title: 'Electric Steering Assist Can Drop Out and Return Suddenly (Recalls 17V-414 and 18V-586)',
    description: 'NHTSA recalls 17V-414 and 18V-586 cover certain 2014 and 2015 Chevrolet Silverado light-duty/1500 trucks. An electrical or software issue can cause electric power-steering assist to disappear momentarily and then return suddenly, particularly during low-speed turning. The change in steering effort can make the truck harder to control and increase crash risk.',
    solution: 'Check the VIN against both recall 17V-414 (GM 17276) and recall 18V-586 (GM 18289), because the campaigns cover different model-year populations. The dealer remedy updates the electric power-steering module software at no charge. Do not replace the steering rack, battery, alternator or ground cable from this card without diagnosis outside the recall remedy.',
    severity: 'high',
    symptoms: [
      'Momentary loss of electric power-steering assist',
      'Sudden return of steering assist',
      'Abrupt change in steering effort during low-speed turns',
      'Increased difficulty controlling the truck while assist changes',
    ],
    affectedSystems: [
      'electric power-steering control module and software',
      'low-speed steering assist',
    ],
    sources: [sources.eps2014, sources.eps2015],
    summary: 'Aligned the steering card to recalls 17V-414 and 18V-586, their 2014/2015 light-duty populations and software-update remedy; removed unrelated parts recommendations.',
  },
};

const published = {
  'chevrolet-silverado-5-3l-afm-excessive-oil-consumption': replacement(
    cards.afmOil,
    'Replace the lawsuit, forum and dealer-blog aggregation with exact GM bulletin 10-06-01-008H. The bulletin supports a bounded 2007-2011 Silverado 1500 population, specified AFM engine RPOs, build breakpoints, PCV/AFM oil-spray mechanisms and staged professional service procedure; it does not support the frozen 2010-2014 universal scope or generic AFM-disabler commerce.',
  ),
  'chevrolet-silverado-5-3l-v8-active-fuel-management-lifter-collapse-camshaft-dama': replacement(
    cards.afmCalibration,
    'Replace the 2007-2019 model-wide lifter and camshaft aggregation with exact GM service update 13330 for VIN-identified 2014 Silverado 1500 L83 vehicles. The update documents an incorrect AFM calibration that can damage a lifter and specifies ECM/TCM reprogramming with no parts required.',
  ),
  'chevrolet-silverado-6-2l-v8-connecting-rod-crankshaft-failure-loss-propulsion-re': replacement(
    cards.l87Recall,
    'Retain the core safety issue but replace secondary articles, speculative DTCs and parts suggestions with the official Part 573 report for recall 25V-274, its exact 2021-2024 Silverado 1500 L87 population, documented manufacturing causes and dealer inspection/remedy path.',
  ),
  'chevrolet-silverado-8-speed-transmission-shudder-hard-shift-torque-converter-jud': replacement(
    cards.transmissionShudder,
    'Replace the class-action and forum aggregation with GM bulletin 18-NA-355. The bulletin supports TCC shudder only for the listed 2015-2018 Silverado engine/transmission combinations and directs one fluid exchange before further diagnosis; it does not establish hard shifting, a universal converter failure or parts replacement.',
  ),
  'chevrolet-silverado-brake-fuel-line-corrosion-failure': replacement(
    cards.brakeCorrosion,
    'Replace the combined brake/fuel-line and 1999-2007 model-wide card with NHTSA engineering analysis EA11-001. The investigation supports age- and region-related brake-pipe corrosion in 1999-2003 salt-belt GM C/K vehicles, but it found no specific safety defect and produced no recall or universal parts remedy.',
  ),
  'chevrolet-silverado-brake-vacuum-pump-failure-hard-brake-pedal': replacement(
    cards.brakeVacuum,
    'Retain the recall-backed brake-assist issue but correct the scope and remedy to NHTSA recall 19V-645. The official remedy is an Electronic Brake Control Module calibration that improves secondary hydraulic assist, not automatic vacuum-pump replacement or a generic owner repair.',
  ),
  'chevrolet-silverado-c-condenser-leak-c-blows-warm-air': replacement(
    cards.acLine,
    'Replace the 2014-2020 condenser aggregation with exact GM PIT5331. The primary document identifies a compressor-to-condenser line crack on 2014 and qualifying early-build 2015 Silverado 1500 trucks and specifies line 23438932 plus bracket 23264893, not condenser replacement.',
  ),
  'chevrolet-silverado-instrument-cluster-gauge-failure-speedometer-reads-wrong': replacement(
    cards.instrumentCluster,
    'Replace the 2003-2007 aftermarket-repair narrative with GM special coverage 07187B as indexed in the official NHTSA manufacturer-communications dataset under document 10023585. Bound the card to 2003-2004 and avoid asserting a universal stepper-motor cause, free repair or parts purchase.',
  ),
  'chevrolet-silverado-temporary-loss-electric-power-steering-assist': replacement(
    cards.eps,
    'Retain the safety issue but replace secondary citations, speculative DTCs and parts with the official 2014 and 2015 campaign records for recalls 17V-414 and 18V-586. Both campaigns specify EPS module software updates for their VIN-bounded light-duty populations.',
  ),
};

const reasons = {
  'chevrolet-silverado-6-6l-duramax-lml-bosch-cp4-2-fuel-pump-failure-whole-fuel-sy': 'The frozen 2011-2016 LML card is supported by litigation coverage, a forum and a plaintiff-law-firm page rather than a GM bulletin, NHTSA campaign or investigation that establishes the asserted model-wide CP4.2 defect population, failure rate, preventive conversion remedy or replacement of the entire fuel system. The listed bypass, conversion and disaster-prevention products are owner-selected aftermarket strategies, not an authoritative GM remedy.',
  'chevrolet-silverado-cracking-dashboard': 'The frozen 2007-2014 dashboard card relies on an aftermarket article and forums, provides no GM bulletin, recall, investigation, production breakpoint or authoritative single failure mechanism, and extends the claim through 2014 without primary support. A dash cover or replacement pad is cosmetic commerce, not an evidence-backed universal repair.',
  'chevrolet-silverado-fuel-pump-control-module-corrosion-crank-no-start': 'The frozen 2007-2013 card cites a commercial module-programming guide, a forum and a fuel-pump seller. Current GM/NHTSA primary-source research does not establish that all listed Silverado trucks share a corrosion-prone fuel-system control module population, the asserted DTC set or the same module and programming remedy. Generic module, pump and connector searches cannot diagnose a no-start or prove fitment.',
};

module.exports = buildConfig({
  label: 'Chevrolet Silverado',
  make: 'Chevrolet',
  model: 'Silverado',
  slug: 'chevrolet-silverado',
  batchId: 'chevrolet-silverado-full-record-cohort-31-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd3499197e1f0ee880a5de96029f2a8d86a4f5c922dc0578fe9346b0a42f47bfd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-silverado/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsilverado_blind:manual-primary-source-gate',
    edge: 'chevroletsilverado_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
