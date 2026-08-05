const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: [],
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
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SAVANA&modelYear=${year}`;

const published = {
  'gmc-savana-afm-lifter-vortec-2010': replacement(
    {
      years: [2010],
      trims: ['2500', '3500', '4500'],
      category: 'electrical',
      title: 'Generator Voltage-Regulator Short Recall',
      description: 'NHTSA campaign 10V138 covers certain 2010 GMC Savana 2500, 3500 and 4500 vans. The generator can develop a low-resistance short inside its voltage regulator, generating enough heat to cause an engine-compartment fire.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the generator and replace a suspect unit free of charge under the recall.',
      symptoms: ['No reliable warning before a voltage-regulator short overheats'],
      affectedSystems: ['generator', 'voltage regulator', 'engine-compartment electrical system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 10V138 - Savana Generator', url: recall(2010) }],
      summary: 'Replaced an overbroad AFM-lifter narrative with the exact 2010 generator short and fire-risk recall.',
    },
    'The frozen card grouped engines and fifteen model years into one AFM failure population, asserted mileage and fleet-use risk, and leaned on truck forums plus a bulletin without proving its applicability to every Savana claim.',
  ),

  'gmc-savana-brake-line-corrosion-2003': replacement(
    {
      years: [2003, 2004],
      trims: ['Vehicles with a left-side cargo door in the campaign\'s listed corrosion jurisdictions'],
      category: 'fuel',
      title: 'Corroded Fuel-Filler Pipe Recall',
      description: 'NHTSA campaign 12V388 covers certain 2003-2004 GMC Savana vans with a left-side cargo door that were sold or registered in the campaign\'s listed corrosion states or the District of Columbia. Water and road contaminants can collect in the filler-pipe conduit, corrode the pipe and allow fuel to leak during refueling.',
      solution: 'Check the VIN and campaign eligibility with GMC or NHTSA. Dealers install a new fuel-filler neck free of charge. Stop refueling and arrange professional service if fuel leaks.',
      symptoms: ['Fuel may leak during refueling', 'Fuel-filler pipe may corrode beneath its protective conduit'],
      affectedSystems: ['fuel-filler pipe', 'protective conduit', 'fuel-filler neck'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 12V388 - Savana Fuel-Filler Pipe', url: recall(2003) }],
      summary: 'Replaced a complaint-site brake-line generalization with the exact corrosion-jurisdiction fuel-filler-pipe recall.',
    },
    'The frozen card asserted catastrophic brake-line rupture, hundreds of complaints, a twelve-year population and full-line replacement from two complaint aggregators, without a GM recall or bulletin defining the claim.',
  ),

  'gmc-savana-door-hinge-1996': replacement(
    {
      years: [2025],
      category: 'safety',
      title: 'Driver-Door Impact-Beam Weld Recall',
      description: 'NHTSA campaign 25V087 covers certain 2025 GMC Savana vans. The impact beam inside the driver-side door may have improper welds and may not provide the intended occupant protection in a crash.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the driver-side door free of charge under GM recall N242490780.',
      symptoms: ['No reliable visible warning of improper internal impact-beam welds'],
      affectedSystems: ['driver-side door', 'side-impact beam', 'door welds'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V087 - Savana Driver Door', url: recall(2025) }],
      summary: 'Replaced an uncited thirty-year cargo-door wear narrative with the exact 2025 driver-door impact-beam recall.',
    },
    'The frozen card had no citations and generalized hinge, latch, door-sag and weather-seal failures across 1996-2025 based on commercial use rather than a manufacturer-defined defect population.',
  ),

  'gmc-savana-fuel-pump-failure-2003': replacement(
    {
      years: [1996],
      trims: ['Passenger vans covered by the campaign'],
      category: 'fuel',
      title: 'Evaporative-Emission Pipe Fuel-Leak Recall',
      description: 'NHTSA campaign 00V110 covers certain 1996 GMC Savana passenger vans that can develop fuel odor or leakage from the evaporative-emission pipe assembly.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers install a revised evaporative-emission pipe assembly under the recall. Stop driving and arrange professional service if fuel is leaking.',
      symptoms: ['Fuel odor', 'Fuel leakage'],
      affectedSystems: ['evaporative-emission pipe assembly', 'fuel vapor and liquid containment'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 00V110 - Savana EVAP Pipe', url: recall(1996) }],
      summary: 'Replaced an eighteen-year fuel-pump failure narrative with the exact passenger-van fuel-odor and leakage recall.',
    },
    'The frozen card asserted a known 80,000-140,000-mile pump failure, low-fuel heat mechanism and fleet vulnerability from repair, complaint and forum pages without a primary Savana campaign.',
  ),

  'gmc-savana-ignition-switch-1996': replacement(
    {
      years: [2014],
      category: 'electrical',
      title: 'Chassis Electronic Module Short Recall',
      description: 'NHTSA campaign 14V614 covers certain 2014 GMC Savana vehicles. Internal contamination can short the chassis electronic module and stall the vehicle.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the chassis electronic module free of charge under GM recall 14515.',
      symptoms: ['Vehicle may stall if the chassis electronic module shorts'],
      affectedSystems: ['chassis electronic module', 'vehicle electrical system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V614 - Savana Chassis Module', url: recall(2014) }],
      summary: 'Replaced a nineteen-year ignition-switch claim supported only by a video with the exact chassis-module short and stall recall.',
    },
    'The frozen card used a video to generalize worn ignition-switch contacts, no-start, accessory loss and stalling across 1996-2014 without a GM-defined affected population.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Savana',
  make: 'GMC',
  model: 'Savana',
  slug: 'gmc-savana',
  batchId: 'gmc-savana-full-record-cohort-155-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '72008b67ebfb53c540994ff0ab73780a3980db4842a5ea71eb130dc0d800816d',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-savana/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsavana_blind:manual-primary-source-gate',
    edge: 'gmcsavana_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
