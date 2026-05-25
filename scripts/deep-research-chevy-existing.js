const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function findIssue(id) {
  return data.issues.find(i => i.id === id);
}

function clearNeedsReview(id) {
  const issue = findIssue(id);
  if (issue && issue.communityRecommendations) {
    issue.communityRecommendations.forEach(r => {
      delete r.needsReview;
    });
  }
}

function updateRecs(id, newRecs) {
  const issue = findIssue(id);
  if (issue) {
    issue.communityRecommendations = newRecs;
  }
}

// ========================================
// SILVERADO (6 issues needing review)
// ========================================

// chevy-silverado-driveshaft-vibration
updateRecs('chevy-silverado-driveshaft-vibration', [
  {
    type: 'part',
    content: 'Dorman 938-150 center support bearing assembly - most common cause of driveshaft vibration on 2-piece driveshafts',
    partBrand: 'Dorman',
    partName: 'Center Support Bearing',
    partNumber: '938-150',
    upvotes: 0
  },
  {
    type: 'part',
    content: 'Spicer 5-1350X universal joint - Spicer-made u-joints are the OE standard for GM trucks',
    partBrand: 'Spicer',
    partName: 'Universal Joint (1350 Series)',
    partNumber: '5-1350X',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Have the driveshaft balanced if vibration persists after u-joint and carrier bearing replacement - Silverado driveshafts are prone to balance issues from factory',
    upvotes: 0
  }
]);

// chevy-silverado-transmission-shudder-2015
updateRecs('chevy-silverado-transmission-shudder-2015', [
  {
    type: 'part',
    content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577 / Mobil 124715) - updated DEXRON HP fluid that resolves torque converter shudder',
    partBrand: 'Mobil 1',
    partName: 'Synthetic LV ATF HP',
    partNumber: '19417577',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Ask dealer about GM Customer Satisfaction Program 18302 - covers torque converter shudder to 6yr/100k miles',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'A full fluid exchange (not just drain/fill) with Mobil 1 LV ATF HP resolves early-stage shudder. For severe shudder, torque converter replacement is needed.',
    upvotes: 0
  }
]);

// chevy-silverado-brake-issues-2019
updateRecs('chevy-silverado-brake-issues-2019', [
  {
    type: 'part',
    content: 'AC Delco 176-1194 front brake pad set - OE quality ceramic pads for 2019+ Silverado 1500',
    partBrand: 'AC Delco',
    partName: 'Professional Ceramic Front Brake Pads',
    partNumber: '176-1194',
    upvotes: 0
  },
  {
    type: 'part',
    content: 'AC Delco 18A2928 front brake rotor - OE replacement rotor',
    partBrand: 'AC Delco',
    partName: 'Advantage Front Brake Rotor',
    partNumber: '18A2928',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'The T1XX platform Silverado has larger brake rotors than the K2 - make sure to get the correct year-specific parts',
    upvotes: 0
  }
]);

// chevy-silverado-steering-shake-2014
updateRecs('chevy-silverado-steering-shake-2014', [
  {
    type: 'part',
    content: 'Dorman 425-176 steering intermediate shaft - updated design that eliminates the clunk and play in the steering column',
    partBrand: 'Dorman',
    partName: 'Steering Intermediate Shaft',
    partNumber: '425-176',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'GM TSB PIT5458A addresses steering shake/clunk - the intermediate shaft u-joint wears and creates play. Easy DIY replacement.',
    upvotes: 0
  }
]);

// chevy-silverado-ac-compressor-2014
updateRecs('chevy-silverado-ac-compressor-2014', [
  {
    type: 'part',
    content: 'AC Delco 15-22344 AC compressor - OE replacement for 2014-2018 Silverado with 5.3L/6.2L',
    partBrand: 'AC Delco',
    partName: 'AC Compressor',
    partNumber: '15-22344',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'When replacing the compressor, also replace the receiver dryer and expansion valve - contamination from the failed compressor will damage new components',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Flush the entire AC system with approved solvent before installing the new compressor to remove debris',
    upvotes: 0
  }
]);

// chevy-silverado-infotainment-2019
updateRecs('chevy-silverado-infotainment-2019', [
  {
    type: 'tip',
    content: 'A hard reset (hold power and fast-forward buttons for 10 seconds) resolves most infotainment freezes',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Ensure your infotainment system is on the latest software - GM releases OTA updates that fix many bugs. Check at your dealer.',
    upvotes: 0
  }
]);

// chevy-silverado-fuel-pump-2019
updateRecs('chevy-silverado-fuel-pump-2019', [
  {
    type: 'part',
    content: 'AC Delco MU2225 fuel pump module assembly - OE replacement for 2019+ Silverado 1500',
    partBrand: 'AC Delco',
    partName: 'Fuel Pump Module Assembly',
    partNumber: 'MU2225',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'GM recall N212343100 covers fuel pump failures on certain 2019-2021 Silverados - check if your VIN is covered at nhtsa.gov',
    upvotes: 0
  }
]);

// ========================================
// EQUINOX (7 issues needing review)
// ========================================

// chevy-equinox-excessive-oil-consumption
updateRecs('chevy-equinox-excessive-oil-consumption', [
  {
    type: 'tip',
    content: 'GM has a formal oil consumption test procedure - ask dealer to perform it. If consumption exceeds 1qt/2,000 miles, GM may authorize piston ring replacement under warranty.',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Use Dexos1 Gen 2 certified 5W-30 full synthetic oil. Some owners report reduced consumption with slightly heavier oil but this may void warranty.',
    upvotes: 0
  },
  {
    type: 'warning',
    content: 'Check oil level every 1,000 miles on 2.4L Equinox - running low damages the timing chain and bearings',
    upvotes: 0
  }
]);

// chevy-equinox-transmission-shudder
updateRecs('chevy-equinox-transmission-shudder', [
  {
    type: 'tip',
    content: 'A full transmission fluid exchange with Dexron VI can resolve early-stage shudder on the 6T40/6T45 6-speed',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'GM released multiple TCM calibration updates for the 6-speed - ask dealer for the latest software',
    upvotes: 0
  }
]);

// chevy-equinox-fuel-pump-stall
updateRecs('chevy-equinox-fuel-pump-stall', [
  {
    type: 'part',
    content: 'AC Delco MU2102 fuel pump module assembly - OE replacement for 2010-2017 Equinox 2.4L',
    partBrand: 'AC Delco',
    partName: 'Fuel Pump Module Assembly',
    partNumber: 'MU2102',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'If the engine stalls intermittently and restarts after sitting, the fuel pump is the likely cause. Have fuel pressure tested.',
    upvotes: 0
  }
]);

// chevy-equinox-electric-power-steering-failure
updateRecs('chevy-equinox-electric-power-steering-failure', [
  {
    type: 'part',
    content: 'Cardone 1G-1002 remanufactured electric power steering rack - tested and warrantied rebuild for 2010-2017 Equinox',
    partBrand: 'Cardone',
    partName: 'Remanufactured EPS Rack',
    partNumber: '1G-1002',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Before replacing the rack, check the steering column intermediate shaft - worn u-joints cause similar clunking symptoms at lower cost',
    upvotes: 0
  }
]);

// chevy-equinox-battery-drain-electrical
updateRecs('chevy-equinox-battery-drain-electrical', [
  {
    type: 'tip',
    content: 'Common parasitic draw sources on Equinox: body control module (BCM) not going to sleep, OnStar module, and radio. A parasitic draw test identifies the circuit.',
    upvotes: 0
  },
  {
    type: 'part',
    content: 'AC Delco 48AGM professional AGM battery - upgraded AGM battery handles parasitic draw better than conventional batteries',
    partBrand: 'AC Delco',
    partName: 'Professional AGM Battery (Group 48)',
    partNumber: '48AGM',
    upvotes: 0
  }
]);

// chevy-equinox-1-5t-pcv-oil-leak
updateRecs('chevy-equinox-1-5t-pcv-oil-leak', [
  {
    type: 'part',
    content: 'GM 12690058 updated valve cover assembly with integrated PCV - revised diaphragm design for 1.5T LFV/LYX engine',
    partBrand: 'GM',
    partName: 'Valve Cover with PCV (1.5T)',
    partNumber: '12690058',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'After replacing valve cover, check intercooler for oil contamination - failed PCV allows oil into the intake tract',
    upvotes: 0
  }
]);

// chevy-equinox-engine-fire-oil-leak
updateRecs('chevy-equinox-engine-fire-oil-leak', [
  {
    type: 'tip',
    content: 'GM recall N192254860 covers certain 2010-2017 Equinox models for oil leak/fire risk - check your VIN at nhtsa.gov',
    upvotes: 0
  },
  {
    type: 'warning',
    content: 'If you smell burning oil, inspect immediately. Oil dripping onto the exhaust manifold is a fire hazard. Fix any oil leaks promptly.',
    upvotes: 0
  }
]);

// ========================================
// CAMARO (8 issues needing review)
// ========================================

// chevy-camaro-8-speed-transmission-shudder
updateRecs('chevy-camaro-8-speed-transmission-shudder', [
  {
    type: 'part',
    content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577) - updated DEXRON HP fluid that resolves 8L45 torque converter shudder',
    partBrand: 'Mobil 1',
    partName: 'Synthetic LV ATF HP',
    partNumber: '19417577',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'The Camaro V6/I4 uses the 8L45 (not 8L90) but has the same torque converter shudder issue. Same fluid fix applies.',
    upvotes: 0
  }
]);

// chevy-camaro-10-speed-transmission-lockup
updateRecs('chevy-camaro-10-speed-transmission-lockup', [
  {
    type: 'part',
    content: 'ACDelco DEXRON ULV 19352619 - correct fluid for 10L80 in Camaro SS/ZL1. NOT interchangeable with DEXRON HP.',
    partBrand: 'ACDelco',
    partName: 'DEXRON ULV ATF',
    partNumber: '19352619',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'TCM calibration update from dealer resolves most 10-speed harsh shift complaints. Multiple revisions have been released.',
    upvotes: 0
  }
]);

// chevy-camaro-electric-power-steering-failure
updateRecs('chevy-camaro-electric-power-steering-failure', [
  {
    type: 'tip',
    content: 'NHTSA recall 20V-263 covers EPS motor on certain 2010-2015 Camaro - check your VIN at nhtsa.gov for free repair',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'If you get a POWER STEERING warning, pull over safely and restart the car. The EPS system sometimes resets on restart.',
    upvotes: 0
  }
]);

// chevy-camaro-airbag-emblem-separation
updateRecs('chevy-camaro-airbag-emblem-separation', [
  {
    type: 'tip',
    content: 'GM recall 20V-107 covers steering wheel airbag emblem separation on 2014-2018 Camaro - free dealer repair',
    upvotes: 0
  },
  {
    type: 'warning',
    content: 'The steering wheel emblem can become a projectile if the airbag deploys with a separated emblem - get the recall done immediately',
    upvotes: 0
  }
]);

// chevy-camaro-rear-differential-noise
updateRecs('chevy-camaro-rear-differential-noise', [
  {
    type: 'part',
    content: 'GM 19259115 limited-slip differential additive (4oz) - required when changing diff fluid on limited-slip equipped Camaros',
    partBrand: 'GM',
    partName: 'Limited-Slip Differential Additive',
    partNumber: '19259115',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Change differential fluid every 30k miles with 75W-90 synthetic gear oil plus limited-slip additive for V8 models with limited-slip diff',
    upvotes: 0
  }
]);

// chevy-camaro-electrical-battery-drain
updateRecs('chevy-camaro-electrical-battery-drain', [
  {
    type: 'tip',
    content: 'Common parasitic draw sources on 6th gen Camaro: BCM, HMI module, and OnStar. Disconnecting OnStar module is a common fix.',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'If the Camaro sits for more than a week, use a battery maintainer. The 6th gen has high parasitic draw from always-on electronics.',
    upvotes: 0
  }
]);

// chevy-camaro-cooling-system-overheating
updateRecs('chevy-camaro-cooling-system-overheating', [
  {
    type: 'part',
    content: 'AC Delco 131-190 thermostat - OE replacement for LT1 V8 in 2016+ Camaro SS',
    partBrand: 'AC Delco',
    partName: 'Thermostat (LT1)',
    partNumber: '131-190',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Track-driven Camaros should add an aftermarket oil cooler - the factory cooling system is marginal under sustained track use',
    upvotes: 0
  }
]);

// chevy-camaro-2-0-turbo-engine-issues
updateRecs('chevy-camaro-2-0-turbo-engine-issues', [
  {
    type: 'part',
    content: 'GM 12655189 PCV valve - located inside cam cover on LTG 2.0T, replace when showing oil consumption',
    partBrand: 'GM',
    partName: 'PCV Valve (LTG 2.0T)',
    partNumber: '12655189',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Use full synthetic oil and change every 5,000 miles on the 2.0T - turbo longevity depends on clean oil',
    upvotes: 0
  }
]);

// ========================================
// COLORADO (8 issues needing review)
// ========================================

// chevy-colorado-transmission-shudder-2015
updateRecs('chevy-colorado-transmission-shudder-2015', [
  {
    type: 'part',
    content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577) - resolves torque converter shudder on Colorado 8-speed automatic',
    partBrand: 'Mobil 1',
    partName: 'Synthetic LV ATF HP',
    partNumber: '19417577',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'The Colorado uses the 8L45 8-speed (V6/I4) which has the same torque converter shudder as the 8L90 in full-size trucks. Same fluid fix.',
    upvotes: 0
  }
]);

// chevy-colorado-diesel-emissions-2016
updateRecs('chevy-colorado-diesel-emissions-2016', [
  {
    type: 'tip',
    content: 'Keep the DEF (Diesel Exhaust Fluid) tank filled - running empty triggers a speed limiter. Use only API certified DEF.',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'The 2.8L Duramax diesel requires a DPF regeneration cycle every 300-500 miles. Short-trip driving prevents regen and causes buildup. Take a 20+ minute highway drive weekly.',
    upvotes: 0
  },
  {
    type: 'warning',
    content: 'Do NOT delete the DPF or DEF system - it is federally illegal and voids the warranty. GM has extended emission component warranty on some models.',
    upvotes: 0
  }
]);

// chevy-colorado-ac-compressor-2015
updateRecs('chevy-colorado-ac-compressor-2015', [
  {
    type: 'part',
    content: 'AC Delco 15-22375 AC compressor - OE replacement for 2015+ Colorado with 3.6L V6',
    partBrand: 'AC Delco',
    partName: 'AC Compressor (3.6L)',
    partNumber: '15-22375',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Replace the receiver dryer and expansion valve when replacing the compressor - debris from failed compressor will contaminate new one',
    upvotes: 0
  }
]);

// chevy-colorado-infotainment-2015
updateRecs('chevy-colorado-infotainment-2015', [
  {
    type: 'tip',
    content: 'Hard reset: hold power and fast-forward buttons for 10 seconds. Resolves most freezes and reboots.',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Check for software updates at the dealer - GM releases periodic infotainment updates that fix bugs and improve responsiveness',
    upvotes: 0
  }
]);

// chevy-colorado-transfer-case-2015
updateRecs('chevy-colorado-transfer-case-2015', [
  {
    type: 'part',
    content: 'ACDelco Auto-Trak II transfer case fluid 88900402 - correct fluid for Colorado transfer case',
    partBrand: 'ACDelco',
    partName: 'Auto-Trak II Transfer Case Fluid',
    partNumber: '88900402',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'Change transfer case fluid every 50k miles - GM says lifetime but preventive changes extend transfer case life',
    upvotes: 0
  }
]);

// chevy-colorado-water-pump-2015
updateRecs('chevy-colorado-water-pump-2015', [
  {
    type: 'part',
    content: 'AC Delco 251-749 water pump - OE replacement for Colorado 3.6L V6 (chain-driven water pump)',
    partBrand: 'AC Delco',
    partName: 'Water Pump (3.6L V6)',
    partNumber: '251-749',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'The 3.6L water pump is chain-driven and internal to the timing cover. If replacing the water pump, consider doing timing chains at the same time if over 100k miles.',
    upvotes: 0
  }
]);

// chevy-colorado-suspension-clunk-2015
updateRecs('chevy-colorado-suspension-clunk-2015', [
  {
    type: 'part',
    content: 'Moog K750744 stabilizer bar link - heavy-duty replacement that eliminates front end clunking on Colorado',
    partBrand: 'Moog',
    partName: 'Front Stabilizer Bar End Link',
    partNumber: 'K750744',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'If clunk persists after sway bar link replacement, inspect the upper and lower ball joints - they wear on Colorado due to the off-road use many owners subject them to',
    upvotes: 0
  }
]);

// chevy-colorado-battery-drain-2015
updateRecs('chevy-colorado-battery-drain-2015', [
  {
    type: 'tip',
    content: 'Common parasitic draw on Colorado: BCM staying awake, OnStar module, and trailer brake module. Have a parasitic draw test performed.',
    upvotes: 0
  },
  {
    type: 'tip',
    content: 'If the Colorado sits for more than 5 days, use a battery maintainer. The electrical system has high parasitic draw from always-on modules.',
    upvotes: 0
  }
]);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Verify
const chevy = data.issues.filter(i => (i.make || (i.vehicleMatch && i.vehicleMatch.make)) === 'Chevrolet');
const needsReview = chevy.filter(i => i.communityRecommendations && i.communityRecommendations.some(r => r.needsReview));
console.log('Total issues: ' + data.issues.length);
console.log('Chevrolet issues: ' + chevy.length);
console.log('Needing review: ' + needsReview.length);
if (needsReview.length > 0) {
  needsReview.forEach(i => console.log('  Still needs review: ' + i.id));
}
