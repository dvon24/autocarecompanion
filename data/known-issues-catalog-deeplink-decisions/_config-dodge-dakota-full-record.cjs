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
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: card.source || 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const upperBallJointRecall = {
  years: [2000, 2001, 2002, 2003],
  trims: ['Four-wheel-drive vehicles built through December 31, 2002 and included in recall 04V-596; verify by VIN'],
  category: 'suspension',
  title: 'Upper Ball-Joint Corrosion Can Lead to Wheel Separation (Recall 04V-596)',
  description:
    'NHTSA recall 04V-596 covers certain 2000-2003 four-wheel-drive Dodge Dakota pickups. Water can enter a front upper ball joint, remove lubricant, and corrode the joint. Extended wear can allow the joint—and potentially the front wheel—to separate, causing loss of control.',
  solution:
    'Check the VIN for recall 04V-596. DaimlerChrysler\'s campaign remedy is replacement of both front upper ball joints. A clunk may occur as wear progresses, but the recall warns that occupants may not always hear it.',
  severity: 'high',
  symptoms: ['Front-suspension clunk may develop', 'Upper ball joint may wear excessively', 'Front wheel may separate if the joint fails'],
  affectedSystems: ['front upper ball joints', 'front suspension', 'front-wheel retention'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'DaimlerChrysler Recall 04V-596 - Dakota Upper Ball Joints',
      url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V596-3958.pdf',
    },
  ],
  summary:
    'Narrowed the 1997-2004 ball-joint card to the exact 2000-2003 4x4 recall population, moisture-corrosion mechanism, imperfect warning, separation risk, and both-joints remedy.',
};

const plenumPanGasket = {
  years: [1994, 1995, 1996, 1997, 1998, 1999],
  trims: ['Vehicles equipped with a 3.9L, 5.2L, or 5.9L gasoline engine'],
  engines: ['3.9L V6', '5.2L V8', '5.9L V8'],
  category: 'engine',
  title: 'Spark Knock or Oil Consumption From an Intake Plenum-Pan Gasket Leak',
  description:
    'DaimlerChrysler TSB 09-05-00 applies to 1994-1999 Dodge Dakota vehicles with 3.9L, 5.2L, or 5.9L gasoline engines. An internal intake-manifold plenum-pan gasket leak can cause engine oil consumption or spark knock without an external oil leak.',
  solution:
    'Follow the bulletin\'s diagnostic procedure to confirm an internal plenum vacuum leak and complete the prerequisite PCM calibration check in TSB 18-48-98. If the gasket leak is confirmed, replace the intake-manifold plenum-pan gasket using the specified cleaning, torque, and tightening sequence.',
  severity: 'medium',
  symptoms: ['Increased engine oil consumption without an external leak', 'Spark knock', 'Internal vacuum leak at the intake plenum pan'],
  affectedSystems: ['intake-manifold plenum-pan gasket', 'intake manifold vacuum', 'engine oil consumption'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'DaimlerChrysler TSB 09-05-00 - Spark Knock and Oil Consumption',
      url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bc0972.pdf',
    },
  ],
  source: 'manual',
  summary:
    'Narrowed the 1992-1999 plenum aggregation to DaimlerChrysler TSB 09-05-00\'s exact 1994-1999 3.9L/5.2L/5.9L scope, internal-leak symptoms, diagnostic boundary, and gasket remedy.',
};

const transmissionFluidRecall = {
  years: [2000],
  trims: ['Vehicles with the 4.7L engine and automatic transmission included in recall 00V-197; verify by VIN'],
  category: 'transmission',
  title: 'Transmission Can Expel Fluid Onto the Hot Exhaust (Recall 00V-197)',
  description:
    'NHTSA recall 00V-197/890 covers certain 2000 Dodge Dakota pickups with the 4.7L engine and automatic transmission. During normal-temperature operation, transmission fluid may be expelled from the fill tube and can ignite if it contacts the hot exhaust system.',
  solution:
    'Check the VIN for recall 00V-197/890. The recall remedy is to shorten the transmission vent hose and confirm adequate clearance. Do not substitute a transmission rebuild or generic leak repair for the recall procedure.',
  severity: 'high',
  symptoms: ['Automatic-transmission fluid expelled from the fill tube', 'Transmission fluid may contact the hot exhaust', 'Transmission-fluid ignition may occur'],
  affectedSystems: ['automatic-transmission fill tube', 'transmission vent hose', 'hot exhaust system'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 00V-197 - Dakota Transmission Fluid Expulsion',
      url: 'https://www.nhtsa.gov/recalls?nhtsaId=00V197000',
    },
  ],
  summary:
    'Retained the exact 2000 4.7L automatic-transmission fluid/fire campaign, replaced secondary recall aggregators with NHTSA, and removed costs, mileage, and unrelated transmission repairs.',
};

const published = {
  'dodge-dakota-ball-joint-1997': replacement(
    upperBallJointRecall,
    'Replace the broad 1997-2004 ball-joint safety card with recall 04V-596\'s exact 2000-2003 4x4 population, moisture/corrosion mechanism, separation risk, and both-upper-joints remedy.',
  ),
  'dodge-dakota-intake-plenum-pan-gasket-failure-causing-oil-consumption-mis': replacement(
    plenumPanGasket,
    'Replace the 1992-1999 forum aggregation with official DaimlerChrysler TSB 09-05-00\'s exact 1994-1999 engine scope, oil-consumption/spark-knock symptoms, confirmation procedure, and plenum-gasket replacement.',
  ),
  'dodge-dakota-trans-fluid-fire-2000': replacement(
    transmissionFluidRecall,
    'Retain the exact 2000 4.7L automatic-transmission fill-tube fire recall with a direct NHTSA campaign link and only the official vent-hose/clearance remedy.',
  ),
};

const reasons = {
  'dodge-dakota-46re-42re-governor-pressure-solenoid-sensor-failure':
    'The frozen card asserts a 1996-1999 46RE/42RE governor-solenoid and sensor failure pattern, multiple DTCs, shift symptoms, mileage, costs, and part replacements from forums and a secondary diagnostic site without one Dodge primary source.',
  'dodge-dakota-body-rust-cab-corners-rocker-panels-rear-wheel-arches':
    'The frozen card combines cab corners, rocker panels, wheel arches, drainage, ten model years, repair panels, and cost guidance from forums and body-panel sellers without a manufacturer-defined defect population or remedy.',
  'dodge-dakota-cooling-system-wear-water-pump-weep-hole-leak-dried-bypass-h':
    'The frozen card combines water-pump leakage, bypass-hose deterioration, distributor moisture, coolant loss, overheating, and ten model years from secondary sources without one Chrysler bulletin defining a common mechanism and repair.',
  'dodge-dakota-hvac-airflow-heat-loss-vacuum-actuated-doors-blend-door-clog':
    'The frozen card combines vacuum controls, mode doors, blend doors, heater-core restriction, ten model years, and several remedies from forums and secondary articles without one Dodge primary source establishing a single condition.',
  'dodge-dakota-overdrive-solenoid-1997':
    'The frozen card merges 42RE and 45RFE overdrive-solenoid behavior, fifteen model years, DTCs, mileage, costs, and replacement guidance from one video without a manufacturer-defined diagnostic boundary.',
  'dodge-dakota-plenum-gasket-1997':
    'This card duplicates the plenum-pan condition now preserved from official TSB 09-05-00, while extending it through 2003 and narrowing engines differently without primary-source support; retaining both would duplicate one mechanism.',
  'dodge-dakota-premature-front-ball-joint-wear':
    'This 1990-1999 non-greaseable-ball-joint card cites recall 04V-596, but that recall covers 2000-2003 four-wheel-drive Dakotas. The verified recall is preserved separately, and the older population has no matching primary source.',
  'dodge-dakota-rear-window-defroster-2000':
    'The frozen card asserts grid cracking and failure across 2000-2011 with repair methods and costs from one video but no Dodge bulletin, campaign, or investigation establishing the affected population and cause.',
  'dodge-dakota-timing-chain-2000':
    'The frozen card asserts 2000-2007 4.7L timing-chain-tensioner failure, warning symptoms, DTCs, mileage, costs, and kit replacement from forums and a parts maker without one Dodge primary source proving that scope.',
  'dodge-dakota-transfer-case-leak-2000':
    'The frozen card treats NP231 and NP242 output-seal leaks across twelve model years as one known failure and prescribes a seal replacement from one video without a Dodge bulletin defining the population, seal position, diagnosis, or remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Dakota',
  make: 'Dodge',
  model: 'Dakota',
  slug: 'dodge-dakota',
  batchId: 'dodge-dakota-full-record-cohort-69-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'b0ea8bf6b2184f37e33878ccfa507e023362c0acd4810afae3a55b1744fcaa77',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-dakota/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgedakota_blind:manual-primary-source-gate',
    edge: 'dodgedakota_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V193000',
    '00V198000',
    '00V199000',
    '00V366000',
    '01V077000',
    '01V119000',
    '01V153000',
    '01V233000',
    '02V322000',
    '03V389000',
    '03V505000',
    '04V216000',
    '05V002000',
    '05V460000',
    '06E011000',
    '06E022000',
    '06E024000',
    '06E026000',
    '06E049000',
    '06E065000',
    '06V038000',
    '06V039000',
    '06V341000',
    '07V555000',
    '08E064000',
    '09E012000',
    '09E025000',
    '12V420000',
    '12V474000',
    '13V038000',
    '14V770000',
    '14V795000',
    '15V313000',
    '16V352000',
    '17V820000',
    '18V021000',
    '19V018000',
    '95V199000',
    '97V080000',
    '97V170000',
    '98V208000',
  ],
});
