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

const recalls = 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Mustang%20Mach%20E&modelYear=2021';

const published = {
  'ford-mach-e-12v-battery-door-lockout-2021': replacement(
    {
      years: [2021, 2022, 2023, 2024, 2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Low-Voltage Electronic Door-Latch Lockout Recall 25S65',
      description:
        'NHTSA campaign 25V404 covers certain 2021-2025 Mustang Mach-E vehicles. When the low-voltage battery charge is low, the electronic door latches may remain locked after the driver or front passenger exits and closes the door. Someone unable to use the inside release handles, such as a child in the rear seat, could then be trapped.',
      solution:
        'Check the VIN for Ford recall 25S65. A Ford dealer updates the Powertrain Control Module and Secondary On-Board Diagnostic Control Module C software free of charge. Treat any inability to enter or exit the vehicle as urgent; use the owner-manual emergency procedures and contact roadside or emergency assistance as appropriate.',
      severity: 'high',
      symptoms: ['Electronic doors may remain locked after a front occupant exits and closes a door while low-voltage charge is low'],
      affectedSystems: ['low-voltage electrical system', 'electronic door latches', 'PCM software', 'SOBDMC software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V404 / Ford Recall 25S65', url: recalls }],
      summary:
        'Corrected the door-lockout card to the exact 2021-2025 recall scenario and software remedy, removing unsupported voltage thresholds, universal battery-drain theory, manual-release descriptions, replacement intervals, and prices.',
    },
    'Retain the current safety recall, but do not turn its specific low-voltage lockout scenario into a universal battery-maintenance or battery-replacement claim.',
  ),

  'ford-mach-e-hv-battery-contactor-2021': replacement(
    {
      years: [2021, 2022],
      trims: ['Recall coverage varies by VIN and high-voltage battery configuration'],
      category: 'electrical',
      title: 'High-Voltage Battery Main-Contactor Overheating Recalls',
      description:
        'NHTSA campaign 22V412 covers certain 2021-2022 Mustang Mach-E vehicles whose high-voltage battery main contactors may overheat and cause a loss of drive power. Campaign 23V687 added high-voltage battery junction-box replacement for certain extended-range-battery vehicles, including vehicles previously repaired under the software recall. Campaign 25V130 corrects some earlier 22V412 repairs that were completed incorrectly.',
      solution:
        'Check the VIN for Ford recalls 22S41, 23S56, and corrective recall 25S14 even if a prior contactor recall was completed. Depending on eligibility, Ford updates the on-board software or replaces the high-voltage battery junction box free of charge. A power-loss warning or reduced propulsion requires prompt dealer diagnosis.',
      severity: 'high',
      symptoms: ['Possible loss of drive power', 'Powertrain warning related to the high-voltage battery contactors'],
      affectedSystems: ['high-voltage battery main contactors', 'high-voltage battery junction box', 'battery control software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 22V412, 23V687, and 25V130', url: recalls }],
      summary:
        'Corrected the initial Ford recall number, separated the software and extended-range hardware remedies, and added the 2025 corrective campaign without unsupported charging or acceleration restrictions.',
    },
    'Retain this documented loss-of-power risk, but use the exact NHTSA populations and remedies rather than secondary reporting or unreferenced owner restrictions.',
  ),

  'ford-mach-e-windshield-roof-detachment-2021': replacement(
    {
      years: [2021],
      trims: ['Certain vehicles identified by VIN; panoramic-roof recall applies only to equipped vehicles'],
      category: 'body',
      title: 'Windshield and Panoramic-Roof Bonding Recalls',
      description:
        'NHTSA campaign 21V711 covers certain 2021 Mustang Mach-E windshields that may not have been properly bonded and could detach. Campaign 21V712 covers certain panoramic roof glass panels with inadequate bonding that could detach and become a road hazard.',
      solution:
        'Check the VIN for Ford recalls 21C22 and 21S42. Ford dealers remove and reinstall the covered windshield and apply additional urethane adhesive to the covered panoramic roof glass free of charge. Visible movement, an opening at a bonded edge, or another suspected glass-separation condition warrants prompt inspection.',
      severity: 'high',
      symptoms: ['Possible windshield separation', 'Possible panoramic roof glass separation'],
      affectedSystems: ['windshield bonding', 'panoramic roof glass bonding'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 21V711 and 21V712 / Ford 21C22 and 21S42', url: recalls }],
      summary:
        'Retained the two real bonding recalls while removing secondary sources, approximate population counts, generic leak diagnosis, drive restrictions, repair-duration estimates, and adhesive cure claims.',
    },
    'Retain both exact 2021 glass-bonding recalls and their distinct remedies without extrapolating unverified symptoms or shop timing.',
  ),

  'ford-mache-12v-battery-drain-2021': replacement(
    {
      years: [2021],
      trims: ['Vehicles that exhibit the Ford bulletin condition while connected to high-voltage charging'],
      category: 'electrical',
      title: '12-Volt Battery Can Discharge During High-Voltage Charging',
      description:
        'Ford TSB 21-2091 applies to some 2021 Mustang Mach-E vehicles whose 12-volt battery becomes discharged while the vehicle is plugged in during high-voltage charging. Ford identifies Powertrain Control Module parameters as the cause covered by this bulletin.',
      solution:
        'Confirm that the discharge occurs under the bulletin conditions and test the low-voltage battery and charging system rather than assuming every no-start has this cause. For qualifying vehicles, Ford directs reprogramming the applicable modules beginning with the PCM using its service procedure.',
      severity: 'medium',
      symptoms: ['Discharged 12-volt battery while the vehicle is plugged in for high-voltage charging', 'Low-voltage no-start or inoperative electrical systems'],
      affectedSystems: ['12-volt battery', 'Powertrain Control Module parameters', 'high-voltage charging control'],
      sources: [{ type: 'tsb', title: 'Ford TSB 21-2091 - 12-Volt Battery Discharged During High-Voltage Charging', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10189793-0001.pdf' }],
      summary:
        'Narrowed a five-year forum-based general battery-drain card to Ford TSB 21-2091, its 2021 charging condition, identified software cause, and module-reprogramming procedure.',
    },
    'Retain the exact Ford-documented 2021 condition while removing fabricated forum URLs, universal EV battery theory, access instructions, tender advice, DC-DC replacement assumptions, and prices.',
  ),

  'ford-mache-infotainment-reboot-2021': replacement(
    {
      years: [2021, 2022, 2023, 2024, 2025],
      trims: ['Vehicles equipped with SYNC 4A that meet the applicable Ford communication criteria'],
      category: 'electrical',
      title: 'SYNC 4A Intermittent Freeze, Reboot, or Blank Center Display',
      description:
        'Ford communications document touchscreen freezing or locking up on some 2021 Mustang Mach-E vehicles and a blank or black center display after the welcome animation on some 2021-2025 vehicles. Ford states that the rearview camera continues to function when reverse is selected under the later blank-display condition.',
      solution:
        'For a temporary reboot on the 2021 system, Ford documents holding the seek-right and volume-down steering-wheel buttons for about 10 seconds. Confirm the vehicle has current SYNC software and have a dealer follow the current Ford communication for a persistent condition; do not replace the APIM solely from a generic freeze or blank-screen report.',
      severity: 'medium',
      symptoms: ['Touchscreen freezes or locks up', 'Center display reboots', 'Blank or black center display after the welcome animation'],
      affectedSystems: ['SYNC 4A', 'center display', 'Accessory Protocol Interface Module software'],
      sources: [
        { type: 'tsb', title: 'Ford SYNC 4 Reboot and 2021 Freeze/Lock-Up Communications', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199504-0001.pdf' },
        { type: 'tsb', title: 'Ford 2021-2025 Mustang Mach-E Blank Center Display Communication', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034134-0001.pdf' },
      ],
      summary:
        'Replaced a fabricated Reddit citation and broad module-replacement advice with Ford-documented SYNC symptoms, the exact 2021 reboot input, and the current 2021-2025 blank-display scope.',
    },
    'Retain only Ford-documented symptoms and procedures, without claiming all climate and camera functions disappear, prescribing battery disconnection, blaming memory pressure, or promising APIM replacement.',
  ),
};

const reasons = {
  'ford-mache-dcfc-cold-weather-2021':
    'The frozen card describes temperature-dependent battery protection and charging performance as a defect, relies on fabricated-looking forum and Reddit URLs, and makes universal preconditioning, drive-time, charging-time, and charge-rate claims without a Ford bulletin or defined repair population.',
  'ford-mache-windshield-stress-crack-2021':
    'No citation supports the frozen five-year stress-crack defect, structural-stress theory, repeat-replacement claim, price range, insurance advice, or goodwill promise. The verified 2021 bonding recalls are already retained in the separate glass-detachment card and do not establish spontaneous impact-free cracking.',
};

module.exports = buildConfig({
  label: 'Ford Mustang Mach-E',
  make: 'Ford',
  model: 'Mustang Mach-E',
  slug: 'ford-mustang-mach-e',
  batchId: 'ford-mustang-mach-e-full-record-cohort-129-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '6b7100dac4094f623a3dd61789ee028c6e2f52d131ed809a70f25cd1c44ed254',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-mustang-mach-e/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordmustangmache_blind:manual-primary-source-gate',
    edge: 'fordmustangmache_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
