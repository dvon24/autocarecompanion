const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// CTS-V (2004-2019):
// 1st Gen (2004-2007): 5.7L/6.0L LS6/LS2 V8
// 2nd Gen (2009-2015): 6.2L LSA Supercharged V8
// 3rd Gen (2016-2019): 6.2L LT4 Supercharged V8
//
// CT4 (2020-2025): 2.0T LSY, CT4-V 2.7T L3B, CT4-V Blackwing 3.6L TT LF4
// CT5 (2020-2025): 2.0T LSY, 3.0T LGY, CT5-V 3.0TT, CT5-V Blackwing 6.2L LT4
// Lyriq (2023-2025): Ultium EV

const cadillacPerformanceModernIssues = [
  {
    id: 'cadillac-ctsv-supercharger-coupler-2009',
    make: 'Cadillac',
    model: 'CTS-V',
    years: { start: 2009, end: 2015 },
    title: 'LSA Supercharger Isolator Coupler Failure',
    severity: 'high',
    category: 'engine',
    description: 'The 2nd generation CTS-V uses a 6.2L LSA supercharged V8 with an Eaton TVS2300 supercharger. The supercharger isolator coupler (a rubber dampener between the supercharger snout and the drive assembly) commonly fails at 60,000-100,000 miles. When the coupler fails, the supercharger cannot build boost, resulting in dramatic power loss. The vehicle becomes essentially naturally aspirated (about 400hp instead of 556hp). The coupler can also fail suddenly during hard acceleration. This is the most common CTS-V specific failure.',
    symptoms: [
      'Significant power loss (feels like half the power is gone)',
      'Rattling or knocking noise from supercharger area',
      'No boost reading on aftermarket gauge',
      'Reduced acceleration / car feels sluggish',
      'Supercharger whine changes pitch or disappears',
      'Check engine light with lean codes (not always)'
    ],
    solution: 'Replace the supercharger isolator coupler. This requires removing the supercharger lid/top plate to access the coupler. The coupler itself is a $30-50 part but labor is 3-5 hours if done at a shop. Many CTS-V owners upgrade to a solid coupler (aluminum replacement) which eliminates the rubber dampener but transmits more vibration. A supercharger snout rebuild kit includes the coupler, bearings, and seals for a complete refresh.',
    estimatedCost: { min: 200, max: 800 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ZPE GripTec solid coupler - billet aluminum replacement that eliminates the rubber isolator. Popular CTS-V upgrade.',
        partBrand: 'ZPE',
        partName: 'GripTec Solid Supercharger Coupler',
        partNumber: 'ZPE-GT-SC',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'GM OEM isolator coupler 12623189 - factory rubber coupler replacement, will eventually fail again',
        partBrand: 'GM',
        partName: 'Supercharger Isolator Coupler (LSA)',
        partNumber: '12623189',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When replacing the coupler, also inspect the supercharger snout bearings - they wear at similar mileage and share the same access point',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The solid coupler upgrade is the preferred fix in the CTS-V community - slightly more NVH but eliminates repeat failure permanently',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ctsv-diff-2009',
    make: 'Cadillac',
    model: 'CTS-V',
    years: { start: 2009, end: 2015 },
    title: 'Rear Differential Failure Under Hard Use',
    severity: 'moderate',
    category: 'drivetrain',
    description: 'The 2009-2015 CTS-V uses a limited-slip rear differential that can fail under spirited driving, track use, or with added power from modifications. The stock differential is rated for the factory 556hp but struggles with launches and high-torque situations. Internal clutch pack wear, bearing failure, and ring gear damage are common. Track-driven CTS-Vs almost universally upgrade the differential. Street-driven cars can see differential whine and clunking develop at 80,000-120,000 miles.',
    symptoms: [
      'Whining noise from rear that increases with speed',
      'Clunking on hard acceleration or deceleration',
      'Grinding on turns (limited-slip clutch worn)',
      'Differential fluid leak at pinion seal',
      'Vibration from rear end under load'
    ],
    solution: 'For street-driven cars, a differential rebuild with upgraded bearings and clutch pack extends life. Track/modified cars should consider a full differential upgrade. Wavetrac or OS Giken limited-slip differentials are popular upgrades. Regular differential fluid changes every 15,000-20,000 miles with 75W-90 synthetic and limited-slip additive significantly extend differential life.',
    estimatedCost: { min: 500, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Wavetrac WTD220208 limited-slip differential - significantly stronger than stock, popular CTS-V upgrade',
        partBrand: 'Wavetrac',
        partName: 'LSD for CTS-V',
        partNumber: 'WTD220208',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Change differential fluid every 15-20k miles with Royal Purple 75W-90 and GM limited-slip additive 19259115 - prevention is far cheaper than replacement',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If you track your CTS-V or have added more than 50hp over stock, an upgraded differential is not optional - it is a matter of when, not if, the stock unit fails',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ctsv-mag-ride-2009',
    make: 'Cadillac',
    model: 'CTS-V',
    years: { start: 2009, end: 2019 },
    title: 'Magnetic Ride Control Shock Failure',
    severity: 'moderate',
    category: 'suspension',
    description: 'The CTS-V (2nd and 3rd gen) comes standard with Magnetic Ride Control (MRC) shocks that use magnetorheological fluid to adjust damping. These expensive shocks have a limited lifespan, typically 60,000-100,000 miles, after which the MR fluid degrades and the shocks either become too stiff, too soft, or leak. Replacement with OEM MRC shocks is very expensive ($500-800 per shock). Many owners switch to traditional high-performance shocks to avoid the recurring cost.',
    symptoms: [
      'SERVICE RIDE CONTROL warning message',
      'Harsh ride quality / excessive road noise',
      'Bouncy or floaty ride (fluid degraded)',
      'Shock leaking visible fluid',
      'Uneven ride quality corner-to-corner'
    ],
    solution: 'Replace MRC shocks with OEM or aftermarket MRC-compatible units. Bilstein B8 DampTronic shocks are the premier aftermarket MRC-compatible option. Alternatively, convert to non-MRC shocks (Koni, Bilstein B8 non-MRC) with an MRC bypass module. The bypass option is cheaper long-term but loses the adaptive damping feature.',
    estimatedCost: { min: 1200, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Bilstein B8 DampTronic shocks - MRC-compatible replacement that maintains magnetic ride functionality. Premium quality.',
        partBrand: 'Bilstein',
        partName: 'B8 DampTronic Shock Set (CTS-V)',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If converting to non-MRC shocks, you need an MRC bypass module (D2 Racing or similar) to prevent constant warning messages',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ct5-transmission-adapt-2020',
    make: 'Cadillac',
    model: 'CT5',
    years: { start: 2020, end: 2025 },
    title: '10-Speed Transmission Adaptive Learning and Shift Quality',
    severity: 'low',
    category: 'transmission',
    description: 'The CT5 uses GM\'s 10-speed automatic (10L80) that can exhibit harsh shifts, delayed engagement, and shift hunting, particularly when the adaptive learning resets. The 10-speed has very complex shift logic and can take 500+ miles to fully adapt to a driver\'s pattern after a battery disconnect, TCM update, or reset. Some CT5 owners report persistent shift quality issues even after adaptation. The CT5-V and CT5-V Blackwing have refined calibrations but can still exhibit occasional harsh shifts.',
    symptoms: [
      'Harsh 1-2 or 3-4 shifts',
      'Delayed shift from Park to Drive/Reverse',
      'Transmission hunting between gears on hills',
      'Shift quality changes after battery disconnect or service',
      'Clunky low-speed maneuvers'
    ],
    solution: 'Have dealer perform latest TCM software calibration - GM releases regular updates. Allow 500+ miles after any reset for the transmission to relearn. For persistent issues, a full transmission fluid exchange with Mobil 1 LV ATF HP can improve shift quality. Very few CT5s require hardware repair.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: 'Multiple GM TSBs for 10L80 shift calibration updates',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'After any battery disconnect or dealer service, drive normally for 500+ miles before judging shift quality - the 10-speed needs significant adaptation time',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask the dealer to check for the latest TCM calibration - GM frequently releases shift quality improvements',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ct4-turbo-2020',
    make: 'Cadillac',
    model: 'CT4',
    years: { start: 2020, end: 2025 },
    title: '2.0T LSY Engine - Valve Cover/PCV and Coolant Issues',
    severity: 'moderate',
    category: 'engine',
    description: 'The CT4 base model uses the 2.0T LSY engine which shares the valve cover/PCV failure and turbo coolant line concerns found in the XT4. The PCV system integrated into the valve cover can fail between 40,000-80,000 miles, causing oil consumption, vacuum leaks, and rough idle. Turbo coolant line connections can develop slow leaks. The CT4-V uses a 2.7T engine (L3B) with different issues. The CT4-V Blackwing uses the 3.6L Twin-Turbo (LF4) which is bespoke and generally reliable.',
    symptoms: [
      'Check engine light with misfire or lean codes',
      'Excessive oil consumption',
      'Rough idle',
      'Coolant level dropping slowly',
      'Turbo-related noises or performance changes'
    ],
    solution: 'Replace valve cover assembly for PCV failure (GM updated design available). Inspect and replace turbo coolant lines if leaking. 5,000-mile oil change intervals with full synthetic are important for turbo longevity.',
    estimatedCost: { min: 200, max: 1200 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'The 2.0T LSY is solid with proper maintenance - stick to 5,000-mile oil changes with full synthetic, not the oil life monitor',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Monitor coolant level monthly to catch turbo coolant line leaks early before they damage the turbo',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-lyriq-12v-battery-2023',
    make: 'Cadillac',
    model: 'Lyriq',
    years: { start: 2023, end: 2025 },
    title: '12V Battery Drain and Electrical Gremlins',
    severity: 'moderate',
    category: 'electrical',
    description: 'The Cadillac Lyriq, like many modern EVs, can experience 12V auxiliary battery drain issues. The 12V battery powers the vehicle\'s computers, locks, and startup systems (the main Ultium battery pack provides drive power). Parasitic drain from always-on systems (connected features, OTA update monitoring, security) can kill the 12V battery if the vehicle sits for extended periods. Some early Lyriq owners have reported dead 12V batteries after just 1-2 weeks of sitting. Software updates have addressed some drain issues but the fundamental concern remains for vehicles parked for extended periods.',
    symptoms: [
      'Vehicle will not unlock or respond to key fob',
      'Touchscreen and infotainment won\'t turn on',
      'Vehicle won\'t enter Ready mode',
      '"Service Battery Charging System" warning',
      'Random electrical resets or glitches',
      'Vehicle dead after sitting 1-2 weeks'
    ],
    solution: 'GM has released multiple software updates (OTA) that reduce parasitic drain. Ensure the vehicle is on the latest software version. For vehicles parked for extended periods, plug in the Level 1 or Level 2 charger which keeps the 12V battery maintained. A 12V battery maintainer/trickle charger connected to the underhood jump-start terminals can help for long-term storage. If the 12V battery is already degraded from deep discharges, it should be replaced.',
    estimatedCost: { min: 0, max: 400 },
    recallTSB: 'GM OTA updates for 12V battery management optimization',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Keep the Lyriq plugged into a charger even when fully charged - this maintains the 12V battery and prevents parasitic drain issues',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Always install the latest OTA software updates - GM has significantly improved 12V battery management in recent updates',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If you plan to leave the Lyriq sitting for more than 10 days, either plug it in or use a 12V trickle charger on the underhood terminals',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-lyriq-charge-port-2023',
    make: 'Cadillac',
    model: 'Lyriq',
    years: { start: 2023, end: 2025 },
    title: 'Charge Port Door and Charging Session Issues',
    severity: 'low',
    category: 'electrical',
    description: 'Some Lyriq owners report intermittent charging issues including the charge port door not opening or closing properly, charging sessions stopping unexpectedly, and difficulty with certain DC fast chargers. The motorized charge port door can stick or fail to actuate in cold weather. Some Level 2 and DC fast charging stations have compatibility issues with the Lyriq\'s charging module. GM has addressed many of these with software updates.',
    symptoms: [
      'Charge port door won\'t open when pressed',
      'Charging session stops unexpectedly before completion',
      'Error message when attempting to charge at certain stations',
      'Charge port door stuck open or closed',
      'Slow charging speed on DC fast charger'
    ],
    solution: 'Install latest OTA software updates which address many charging compatibility issues. For stuck charge port doors, the manual release inside the cargo area allows manual opening. GM dealers can recalibrate the charge port motor. For DC fast charging issues, try different charging networks - the Lyriq works best with EVgo and ChargePoint stations. Cold weather can cause the door to stick - a silicone spray on the door seal helps.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Apply silicone spray to the charge port door seal before winter to prevent cold-weather sticking',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If a charging session fails at one station, try a different brand - Lyriq compatibility varies by charging network firmware',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + cadillacPerformanceModernIssues.length + ' Cadillac CTS-V/CT4/CT5/Lyriq issues...');
knownIssues.issues.push(...cadillacPerformanceModernIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + cadillacPerformanceModernIssues.length + ' Cadillac performance/modern issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
