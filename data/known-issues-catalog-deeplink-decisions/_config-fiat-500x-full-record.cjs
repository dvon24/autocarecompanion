const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
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
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const carPlayCase = {
  years: [2018, 2019, 2020],
  trims: [],
  engines: [],
  category: 'electrical',
  title: 'Apple CarPlay May Lock Up, Freeze, or Fail to Pair (STAR Case S2008000010)',
  description:
    'FCA STAR case S2008000010, submitted for 2018-2020 Fiat 500X vehicles, covers Apple CarPlay being inoperative, an iPhone failing to pair, CarPlay locking up or freezing, and audio concerns. The guidance identifies the phone, cable, or debris in the phone or vehicle USB connections as possible causes.',
  solution:
    'Follow the STAR-case checks before replacing the radio: forget the vehicle in iPhone CarPlay settings, delete and re-pair the phone in the radio and Bluetooth settings, restart the phone, inspect and clean the phone and vehicle USB ports, inspect the cable connections, and test with an official Apple MFi-certified Lightning cable.',
  severity: 'low',
  symptoms: ['Apple CarPlay is inoperative', 'Phone will not pair', 'CarPlay locks up or freezes', 'Audio pops, distorts, rattles, buzzes, or has static'],
  affectedSystems: ['Apple CarPlay', 'Bluetooth phone pairing', 'USB and Lightning connections'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'FCA STAR Case S2008000010 - Apple CarPlay Inoperative, Pairing, Lockup, Freeze, or Audio Concerns', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10229285-9999.pdf' }],
  summary:
    'Replaced the unsupported eight-year Uconnect/head-unit narrative with FCA STAR case S2008000010\'s exact 2018-2020 CarPlay, pairing, cable, port, and phone-diagnostic guidance.',
};

const oilConsumptionBulletin = {
  years: [2016, 2017, 2018],
  trims: [],
  engines: ['2.4L I4 MultiAir (sales code ED6 or ED8)'],
  category: 'engine',
  title: '2.4L Excessive Oil Consumption Test and XS1 Warranty Extension (TSB 09-010-25)',
  description:
    'Stellantis TSB 09-010-25 covers 2016-2018 Fiat 500X vehicles with a 2.4L ED6 or ED8 engine built from January 15, 2015 through July 27, 2018. It documents low-oil-pressure warnings between oil changes or excessive oil consumption and identifies interactive deceleration fuel-shutoff calibration as the cause for this bulletin.',
  solution:
    'For vehicles in the bulletin scope, first eliminate external oil leaks, then have a dealer perform the specified 1,500-1,700 mile oil-consumption test. If the level is below ADD at the end of a valid test, TSB 09-010-25 directs long-block replacement. The published XS1 warranty extension is specifically described for Canada and Mexico, so eligibility must be confirmed by VIN and market.',
  severity: 'high',
  symptoms: ['Oil-pressure-low warning between oil changes', 'Engine oil level drops without visible external leakage', 'Excessive oil consumption'],
  affectedSystems: ['2.4L MultiAir engine', 'engine lubrication', 'long block'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Stellantis TSB 09-010-25 - 2.4L Excessive Oil Consumption XS1 Warranty Extension', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017977-0001.pdf' }],
  summary:
    'Narrowed the five-year piston-ring and consumption-rate narrative to TSB 09-010-25\'s exact 2016-2018 2.4L/build-date population, verified test, long-block remedy, and market-limited warranty terms.',
};

const transmissionFlashBulletin = {
  years: [2016],
  trims: [],
  engines: ['1.4L MultiAir Turbo (sales code EAM)'],
  category: 'transmission',
  title: 'Harsh 1-2 or Garage Shifts on Early 2016 500X (TSB 21-047-15)',
  description:
    'FCA TSB 21-047-15 covers 2016 Fiat 500X vehicles built on or before July 17, 2015 with the 1.4L EAM engine and 9-speed 948TE automatic transmission. Customers may report a harsh 1-2 upshift or a harsh Park/Neutral-to-Reverse/Drive garage shift.',
  solution:
    'After verifying that no other DTC or symptom requires separate diagnosis, an equipped dealer should reprogram the transmission control module with the latest software and clear any DTCs set during the flash, following TSB 21-047-15.',
  severity: 'medium',
  symptoms: ['Harsh 1-2 upshift', 'Harsh shift from Park or Neutral into Reverse or Drive'],
  affectedSystems: ['948TE nine-speed automatic transmission', 'transmission control module'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'FCA TSB 21-047-15 - Transmission Shift and Drivability Enhancements', url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10058729-4664.pdf' }],
  summary:
    'Narrowed the eight-year, two-engine transmission narrative to TSB 21-047-15\'s exact early-build 2016 1.4L/948TE population, symptoms, diagnostic boundary, and TCM flash.',
};

const published = {
  'fiat-500x-infotainment-freeze': replacement(
    carPlayCase,
    'Keep only the Apple CarPlay and pairing condition directly documented by FCA STAR case S2008000010; remove unsupported backup-camera, generic reboot, head-unit, and firmware claims.',
  ),
  'fiat-500x-oil-consumption-24': replacement(
    oilConsumptionBulletin,
    'Use current Stellantis TSB 09-010-25 for the exact vehicle, engine, build-date, diagnostic-test, remedy, and market-specific warranty scope instead of the secondary-source piston-ring narrative.',
  ),
  'fiat-500x-transmission-shifting': replacement(
    transmissionFlashBulletin,
    'Keep only FCA TSB 21-047-15\'s early-build 2016 1.4L/948TE harsh-shift condition; remove the unsupported 2016-2023 scope, cold-weather claim, DTCs, fluid flush, and valve-body advice.',
  ),
};

const reasons = {
  'fiat-500x-water-pump':
    'The frozen card combines two engines and eight model years with weep-hole leakage, plastic-impeller fracture, P0217, metal-impeller replacement, thermostat replacement, and pressure testing without any citation or matching Fiat service bulletin.',
};

module.exports = buildConfig({
  label: 'Fiat 500X',
  make: 'Fiat',
  model: '500X',
  slug: 'fiat-500x',
  batchId: 'fiat-500x-full-record-cohort-93-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'fc9b461f1786c345c3593c4cf94f21a99dd5291ea2cbc814a9f9b6cc79da7fe9',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-500x/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiat500x_blind:manual-primary-source-gate',
    edge: 'fiat500x_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '16V529000', '17V146000', '18V524000', '19V287000', '19V909000', '24V510000',
  ],
});
