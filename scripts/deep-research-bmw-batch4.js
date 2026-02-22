const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updatedCount = 0;

function updateIssue(id, newRecs) {
  const issue = data.issues.find(i => i.id === id);
  if (issue) {
    issue.communityRecommendations = newRecs;
    issue.reviewedOn = '2026-02-22';
    updatedCount++;
    console.log('Updated:', id);
  } else {
    console.log('NOT FOUND:', id);
  }
}

// ============================================================
// BMW M3 Old-Format Issues (8 issues)
// ============================================================

// --- bmw-m3-s65-throttle-actuator-failure ---
updateIssue('bmw-m3-s65-throttle-actuator-failure', [
  { type: 'part', content: 'Beisan Systems throttle actuator rebuild kits BS101 (Bank 1) and BS102 (Bank 2) replace the worn internal gears with upgraded metal versions. $350-$450 per side vs $1,800+ OEM. The definitive fix recommended on M3Post and E9X M3 forums.', partBrand: 'Beisan Systems', partName: 'Throttle Actuator Rebuild Kit (Bank 1)', partNumber: 'BS101', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Beisan Systems Bank 2 throttle actuator rebuild kit. Both banks should be done simultaneously as preventive measure - if one has failed, the other is likely close behind.', partBrand: 'Beisan Systems', partName: 'Throttle Actuator Rebuild Kit (Bank 2)', partNumber: 'BS102', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'ECU Testing (UK-based) offers professional actuator rebuilds for $600-$800 per unit with upgraded components and extended warranty. Ship your actuators to them for rebuild service.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'OEM replacement actuators from BMW ($1,200-$1,800 each) use the same flawed plastic gear design. Beisan or ECU Testing rebuilds with metal gears are the permanent fix. Do NOT buy cheap eBay actuators - they fail within months.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The throttle actuators are accessible from the top of the engine without removing the intake manifold. DIY-friendly with basic tools. M3Post has detailed step-by-step guides with photos.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-s55-charge-pipe-failure ---
updateIssue('bmw-m3-s55-charge-pipe-failure', [
  { type: 'part', content: 'VRSF aluminum charge pipe is the most popular upgrade on F80 M3 forums. Eliminates the cracking issue entirely. Direct bolt-on replacement with included silicone couplers and clamps.', partBrand: 'VRSF', partName: 'Aluminum Charge Pipe F80 M3/M4', partNumber: '10801050', upvotes: 0, needsReview: false },
  { type: 'part', content: 'ARM Motorsports aluminum charge pipe is another highly-rated option. CNC machined from 6061 aluminum with TIG-welded connections. Slightly more premium finish than VRSF.', partBrand: 'ARM Motorsports', partName: 'F80 M3 Aluminum Charge Pipe', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'This is considered a mandatory upgrade for ANY tuned F80 M3 - even stock boost levels can crack the OEM plastic pipe over time. Most Bimmerpost members replace this immediately after purchase.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If the charge pipe blows off while driving, the car will immediately lose power and go into limp mode. Not dangerous but can leave you stranded. Replace proactively before failure.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-s65-vanos-solenoid-failure ---
updateIssue('bmw-m3-s65-vanos-solenoid-failure', [
  { type: 'part', content: 'OEM VANOS solenoids (part 11367585425) are the recommended replacement. The S65 has 4 solenoids (2 intake, 2 exhaust). Replace as a complete set for consistent performance.', partBrand: 'Genuine BMW', partName: 'VANOS Solenoid Valve', partNumber: '11367585425', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Beisan Systems VANOS rebuild kit BS031 addresses the complete VANOS system including seals and anti-rattle rings. More comprehensive than just solenoid replacement.', partBrand: 'Beisan Systems', partName: 'S65 VANOS Rebuild Kit', partNumber: 'BS031', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use ONLY BMW LL-01 approved oil (Castrol TWS 10W-60 or Liqui Moly 10W-60) with 5,000-7,500 mile change intervals. The S65 VANOS is extremely sensitive to oil quality. Cheap oil or extended intervals accelerate solenoid wear.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'VANOS solenoid screens can be cleaned as a first troubleshooting step before replacement. Remove solenoids and clean the mesh screens with brake cleaner. This resolves the issue in about 30% of cases per M3Post.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-g80-integrated-brake-system-recall ---
updateIssue('bmw-m3-g80-integrated-brake-system-recall', [
  { type: 'warning', content: 'NHTSA Recall 21V-062: Check your VIN at nhtsa.gov/recalls or BMW dealer. This is a FREE repair under recall. The integrated brake system (IBS) rotor and shaft weld may separate during hard braking, causing loss of ABS and brake assist.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'BMW dealers replace the entire integrated brake system assembly free of charge. No appointment fee or cost to owner. If a dealer tries to charge you, escalate to BMW NA customer relations at 1-800-831-1117.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Also check for NHTSA Campaign 21V-904 (airbag control module) and 22V-073 (rearview camera) which affected early G80 M3 production. All recalls should be completed before track use.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use BMW VIN decoder at bmw.com/check-recall or the NHTSA VIN lookup at nhtsa.gov/recalls to verify all recall work has been completed on your specific vehicle.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-e92-differential-mount-subframe-stress ---
updateIssue('bmw-m3-e92-differential-mount-subframe-stress', [
  { type: 'part', content: 'VAC Motorsports E9x M3 Solid Differential Mount Kit eliminates the rubber bushing deterioration that causes subframe stress. CNC machined aluminum. Most recommended on M3Post for street/track use.', partBrand: 'VAC Motorsports', partName: 'Solid Differential Mount Kit E9x M3', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Rogue Engineering E9x M3 solid differential mounts are another highly-rated option. Aircraft-grade aluminum with press-fit design. Available in street (slightly compliant) and race (fully solid) versions.', partBrand: 'Rogue Engineering', partName: 'Solid Diff Mount E9x M3', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Inspect subframe mounting points at every service. Look for hairline cracks in the sheet metal around the diff mount bolts. Early detection allows reinforcement welding ($500-$800) vs full subframe replacement ($3,000+).', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Track-driven E92 M3s are at highest risk. If you track your car, solid diff mounts are considered mandatory. The stock rubber mounts allow enough movement to fatigue the subframe metal over time.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-e92-edc-damper-failure ---
updateIssue('bmw-m3-e92-edc-damper-failure', [
  { type: 'part', content: 'Bilstein B6 DampTronic replacement dampers are direct EDC-compatible replacements at roughly 70% of OEM cost. Maintain full EDC functionality including comfort/sport mode switching. Part numbers: 24-196444 (front), 24-196451 (rear).', partBrand: 'Bilstein', partName: 'B6 DampTronic EDC Replacement Damper (Front)', partNumber: '24-196444', upvotes: 0, needsReview: false },
  { type: 'part', content: 'KW V3 coilovers with EDC delete module are the popular upgrade path for those wanting adjustable suspension without EDC complexity. Requires EDC cancellation module to avoid fault codes.', partBrand: 'KW Suspension', partName: 'V3 Coilover Kit E9x M3', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Before replacing all 4 dampers, diagnose which specific damper(s) have failed using BMW ISTA/D or Carly. Individual damper replacement is possible. A single failed damper is $500-$800 OEM vs $3,500 for all four.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'EDC delete with quality coilovers (KW, Ohlins, MCS) is often cheaper long-term than repeated EDC damper replacements. Many M3Post members consider EDC delete the permanent solution.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-g80-s58-carbon-buildup ---
updateIssue('bmw-m3-g80-s58-carbon-buildup', [
  { type: 'part', content: 'Eventuri catch can system for G80 M3 S58 is the most popular preventive solution. Captures oil vapor before it enters the intake. Vehicle-specific fitment with OEM-quality appearance.', partBrand: 'Eventuri', partName: 'Oil Catch Can Kit G80 M3/M4', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting every 50,000-60,000 miles is the gold standard for carbon removal. The S58 intake manifold must be removed for access. Professional service costs $600-$1,000 at BMW-specialized independents.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Install a catch can EARLY. The S58 builds carbon faster than the B58 due to higher PCV flow from its twin-turbo setup. G80 M3 Competition models with 503hp are most affected. Bimmerpost G80 forum recommends installation before 10,000 miles.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT use chemical "intake cleaners" sprayed through the throttle body as a substitute for walnut blasting. They are ineffective against heavy carbon deposits and can damage O2 sensors and catalytic converters.', upvotes: 0, needsReview: false }
]);

// --- bmw-m3-s55-water-pump-electric-failure ---
updateIssue('bmw-m3-s55-water-pump-electric-failure', [
  { type: 'part', content: 'Continental/VDO electric water pump is the OEM supplier. Part 11517632426 for S55 (F80 M3). Replace with OEM or Continental - aftermarket electric pumps have poor reliability track record.', partBrand: 'Continental/VDO', partName: 'Electric Water Pump S55', partNumber: '11517632426', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace thermostat (11538636594) at the same time as water pump. The thermostat is $40-$60 and accessed during pump replacement. Doing both prevents a second cooling system drain within a few years.', partBrand: 'Genuine BMW', partName: 'Thermostat S55/B58', partNumber: '11538636594', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'S55 water pumps typically fail between 60,000-100,000 miles. Preventive replacement at 80,000 miles is recommended for track-driven cars. The S58 (G80) uses a revised pump with better longevity.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If the overheat warning appears, pull over IMMEDIATELY and shut off the engine. The S55 aluminum block is very sensitive to overheating. Even 5 minutes of driving with a failed water pump can warp the head or damage the block ($10,000+ repair).', upvotes: 0, needsReview: false }
]);

// ============================================================
// BMW 335i/N55 Old-Format Issues (8 issues)
// ============================================================

// --- bmw-n55-vanos-2012 ---
updateIssue('bmw-n55-vanos-2012', [
  { type: 'part', content: 'OEM VANOS solenoid valves (11367585425 intake, 11367560462 exhaust) are the recommended replacement. The N55 has 2 solenoids. Replace both at the same time - if one failed, the other is likely deteriorating.', partBrand: 'Genuine BMW', partName: 'VANOS Solenoid Valve (Intake)', partNumber: '11367585425', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Beisan Systems N55 VANOS rebuild kit BS021 includes upgraded seals and anti-rattle components. Addresses the root cause of VANOS rattle and performance loss.', partBrand: 'Beisan Systems', partName: 'N55 VANOS Rebuild Kit', partNumber: 'BS021', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use BMW LL-01 approved oil exclusively (Castrol Edge 0W-30, Liqui Moly Leichtlauf 5W-40, Pentosin 5W-30). The N55 VANOS is oil-operated and extremely sensitive to oil quality. Change every 7,500 miles maximum.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Clean VANOS solenoid screens before replacing. Remove solenoids, clean mesh screens with brake cleaner, and reinstall. This free fix resolves symptoms in ~30% of cases per Bimmerpost N55 community.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-water-pump-2012 ---
updateIssue('bmw-n55-water-pump-2012', [
  { type: 'part', content: 'Continental/VDO electric water pump (11517632426) is the OEM supplier for BMW. This is the ONLY recommended replacement - aftermarket electric water pumps from Rein, URO, etc. have well-documented premature failures on Bimmerpost.', partBrand: 'Continental/VDO', partName: 'Electric Water Pump N55', partNumber: '11517632426', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace thermostat at the same time. BMW 11537601158 or Wahler equivalent. The thermostat is $30-$50 and requires no additional labor when doing the water pump.', partBrand: 'Genuine BMW', partName: 'Thermostat N55', partNumber: '11537601158', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'N55 electric water pump failure causes rapid overheating - the engine can overheat in under 5 minutes without the pump running. Pull over IMMEDIATELY if temperature gauge rises. Continued driving WILL cause head gasket or head warping damage ($5,000+).', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Preventive replacement at 80,000 miles is strongly recommended by Bimmerpost N55 community. BMW offered an extended warranty (SI B11 12 20) on water pumps for some 2012-2014 models - check with your dealer for eligibility.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'FCP Euro sells the Continental water pump with lifetime replacement warranty for $250-$350. This means free replacements for life if the next pump ever fails.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-charge-pipe-2012 ---
updateIssue('bmw-n55-charge-pipe-2012', [
  { type: 'part', content: 'VRSF aluminum charge pipe (10301050) is the most popular N55 upgrade on Bimmerpost. Direct bolt-on replacement eliminates the OEM plastic cracking issue. Includes silicone coupler and clamps. Under $100.', partBrand: 'VRSF', partName: 'Aluminum Charge Pipe N55 F30', partNumber: '10301050', upvotes: 0, needsReview: false },
  { type: 'part', content: 'BMS (Burger Motorsports) aluminum charge pipe is another well-regarded option with slightly thicker wall construction. Available in standard and upgraded BOV versions.', partBrand: 'BMS', partName: 'Aluminum Charge Pipe N55', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'This is a mandatory upgrade for ANY tuned N55. The OEM plastic pipe will absolutely fail with increased boost from even a Stage 1 JB4 or flash tune. Most Bimmerpost members replace this proactively.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Installation takes 15-30 minutes with basic hand tools. One of the easiest N55 modifications. Remove the airbox, disconnect the OEM pipe, and install the aluminum replacement. No coding needed.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-valve-cover-2012 ---
updateIssue('bmw-n55-valve-cover-2012', [
  { type: 'part', content: 'OEM valve cover assembly 11127588412 includes the integrated PCV valve and gasket. This is the recommended replacement since the PCV diaphragm is molded into the cover and cannot be serviced separately on N55.', partBrand: 'Genuine BMW', partName: 'Valve Cover Assembly with PCV (N55)', partNumber: '11127588412', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Elring valve cover gasket (728.680) can be used if the cover itself is undamaged and only the gasket is leaking. Much cheaper ($30-$50) than full cover replacement ($300-$500).', partBrand: 'Elring', partName: 'Valve Cover Gasket N55', partNumber: '728.680', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The PCV valve is the most common failure point, not the gasket itself. Symptoms: rough idle, oil consumption, whistling noise from engine. A failed PCV requires full valve cover replacement on N55 since it is non-serviceable.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Oil leaking onto the exhaust manifold is a fire hazard. If you smell burning oil, inspect the valve cover area immediately. Clean all oil residue from the exhaust manifold after repair using brake cleaner.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-injector-2012 ---
updateIssue('bmw-n55-injector-2012', [
  { type: 'part', content: 'BMW fuel injectors are "indexed" - you MUST use the latest index number for your DME software version. Current latest is Index 12 (part 13538616079). Check your current index using ISTA before ordering.', partBrand: 'Genuine BMW', partName: 'High Pressure Fuel Injector (Index 12)', partNumber: '13538616079', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'All 6 injectors MUST be the same index. Mixing index numbers causes rough running, misfires, and potential DME errors. When replacing one, either replace all 6 or source the exact same index.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'BMW extended warranty SI B13 04 17 covered injector replacement for some 2012-2016 N55 models up to 10 years/120,000 miles. Check with your dealer even if expired - BMW sometimes makes goodwill exceptions.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT buy aftermarket or refurbished N55 injectors. BMW piezo injectors require precise calibration data encoded to the DME. Only genuine BMW injectors with the correct index and coding data will work properly.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-oil-filter-housing-2012 ---
updateIssue('bmw-n55-oil-filter-housing-2012', [
  { type: 'part', content: 'Victor Reinz oil filter housing gasket kit (11428637821) is the OEM supplier gasket. Includes the main housing gasket and O-rings. Most reliable option - avoid cheap silicone gaskets.', partBrand: 'Victor Reinz', partName: 'Oil Filter Housing Gasket Set', partNumber: '11428637821', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Also replace the oil cooler gasket (11427624086) at the same time. It is accessed during oil filter housing removal and is a common secondary leak point. $10-$15 part.', partBrand: 'Genuine BMW', partName: 'Oil Cooler Gasket', partNumber: '11427624086', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'DIY-friendly job that takes 1-2 hours. Requires oil filter cap socket (86mm 16-flute) and basic hand tools. Clean the mating surfaces thoroughly before installing new gasket. FCP Euro has detailed DIY guides.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Oil dripping onto the serpentine belt can cause the belt to slip or shred, potentially causing loss of power steering and charging. Replace the belt ($30-$40) if it has oil contamination.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-carbon-buildup-2012 ---
updateIssue('bmw-n55-carbon-buildup-2012', [
  { type: 'part', content: 'Mishimoto N55 baffled oil catch can kit (MMBCC-F30-16) is the most popular catch can for F30 335i on Bimmerpost. Vehicle-specific fitment, includes mounting bracket and hoses. Prevents carbon buildup.', partBrand: 'Mishimoto', partName: 'Baffled Oil Catch Can Kit F30 N55', partNumber: 'MMBCC-F30-16', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting every 50,000-60,000 miles is the gold standard for removing existing carbon. The N55 intake manifold removal is straightforward for walnut blast access. Professional service costs $400-$700 at BMW-specialized independents.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The N55 builds carbon slightly slower than the N54 due to improved PCV design, but it still accumulates significantly by 80,000+ miles. Install catch can early and walnut blast at regular intervals for best results.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT use "SeaFoam" or similar chemical intake cleaners as a substitute for walnut blasting. They cannot remove hardened carbon deposits and may damage the catalytic converter. Walnut blasting is the only effective removal method.', upvotes: 0, needsReview: false }
]);

// --- bmw-n55-boost-solenoid-2012 ---
updateIssue('bmw-n55-boost-solenoid-2012', [
  { type: 'part', content: 'OEM Pierburg wastegate boost solenoid (N55 EWGA) is part 11747626350. The N55 uses an electronic wastegate actuator (EWGA) rather than a vacuum-operated wastegate. Replace with OEM Pierburg only.', partBrand: 'Pierburg', partName: 'Electronic Wastegate Actuator (EWGA)', partNumber: '11747626350', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Before replacing the wastegate actuator, check the charge pipe for boost leaks and the boost pressure sensor for accuracy. Many "boost" fault codes are caused by charge pipe cracks rather than actuator failure.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use ISTA or MHD to read live data for wastegate duty cycle and boost pressure. If duty cycle is at 100% but target boost is not reached, the issue is likely a boost leak rather than actuator failure.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT disconnect or modify the electronic wastegate actuator. Unlike the N54, the N55 wastegate is electronically controlled and any modification can cause limp mode or overboost conditions that damage the turbo.', upvotes: 0, needsReview: false }
]);

// Write updated data
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`\nDone! Updated ${updatedCount} BMW old-format issues.`);

// Verify
const verify = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const bmwIssues = verify.issues.filter(i =>
  (i.vehicleMatch && i.vehicleMatch.make === 'BMW') || i.make === 'BMW'
);
const needsReview = bmwIssues.filter(i =>
  i.communityRecommendations && i.communityRecommendations.some(r => r.needsReview === true)
);
console.log(`\nVerification:`);
console.log(`  Total BMW issues: ${bmwIssues.length}`);
console.log(`  BMW issues still needing review: ${needsReview.length}`);
if (needsReview.length > 0) {
  needsReview.forEach(i => console.log(`    - ${i.id}`));
}
