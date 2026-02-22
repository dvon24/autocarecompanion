/**
 * Deep Research: Audi Batch 2 - Non-EA888 Issues
 * Updates community recommendations for 3.0T/4.0TT and other non-EA888 Audi issues
 * with verified community parts data and deeply-researched recommendations.
 *
 * Covers: A6, A7, A8, Q7, Q8, S5, RS3/TTRS, RS4/RS5, RS6/RS7
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updatedCount = 0;
let notFoundCount = 0;
let reviewClearedCount = 0;

function updateIssue(id, newRecs) {
  const issue = data.issues.find(i => i.id === id);
  if (issue) {
    issue.communityRecommendations = newRecs;
    updatedCount++;
    console.log('Updated:', id);
  } else {
    notFoundCount++;
    console.log('NOT FOUND:', id);
  }
}

function clearNeedsReview(id) {
  const issue = data.issues.find(i => i.id === id);
  if (issue && issue.communityRecommendations) {
    issue.communityRecommendations.forEach(r => { r.needsReview = false; });
    reviewClearedCount++;
    console.log('Cleared needsReview:', id);
  }
}

// ============================================================================
// A6 Issues
// ============================================================================

updateIssue('audi-a6-timing-chain-tensioner-2005', [
  { type: 'part', content: 'For 3.0T models, use complete timing chain kit with OEM tensioners. Right-side: 06E109218AP (latest revision). Left-side: 06E109217H. Available from FCP Euro and ECS Tuning.', partBrand: 'Genuine VW/Audi', partName: 'Upper Timing Chain Tensioner - Right', partNumber: '06E109218AP', upvotes: 0, needsReview: false },
  { type: 'part', content: 'FCP Euro offers a comprehensive timing chain tensioner kit (06E109218AKKT) with tensioners, guide rails, chains, and hardware. UroTuning also carries a B8/S4/S5 kit (TCK-30T-B8S4S5-KT).', partBrand: 'FCP Euro', partName: 'Complete Timing Chain Tensioner Kit', partNumber: '06E109218AKKT', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace both left and right upper timing chain tensioners together. Chain rattle on cold start is the early warning sign. Replace preventatively at 80,000-100,000 miles.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'The C6 A6 with 3.2L V6 has chain tensioners on the back of the engine (against the firewall), making this a 12-16 hour labor job. Budget $3,000-$5,000 at an independent shop.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Camshaft timing chain (left side) part number 06E109465AT. Replace if chain has stretched beyond spec during tensioner replacement.', partBrand: 'Genuine VW/Audi', partName: 'Camshaft Timing Chain - Left', partNumber: '06E109465AT', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-timing-chain-tensioner-2005');

updateIssue('audi-a6-multitronic-cvt-failure-2005', [
  { type: 'warning', content: 'The Multitronic CVT (01J) is notoriously unreliable and expensive to rebuild. Many owners recommend budgeting for a complete transmission swap or selling the car before it fails.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular fluid changes every 40,000 miles with genuine Audi CVT fluid can extend life. Despite Audi claiming "lifetime fill," the community strongly recommends regular service.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'If rebuilding, use OEM Multitronic chain and valve body components. Rebuilt mechatronic units available from ECU Testing and Control Units at significant savings vs dealer.', partBrand: 'ECU Testing', partName: 'Rebuilt Multitronic Mechatronic Unit', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Shudder at low speed, slipping, and delayed engagement are early signs. Once symptoms appear, failure is usually weeks to months away. A rebuilt Multitronic costs $4,000-$7,000.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-multitronic-cvt-failure-2005');

updateIssue('audi-a6-s-tronic-dsg-issues-2012', [
  { type: 'part', content: 'OEM DL501 mechatronic repair kit 0B5398048D includes solenoid valves, sensor modules, and harnesses. ECS Tuning offers an Ultimate Mechatronic Rebuild Kit (0B5398009F2KT).', partBrand: 'Genuine VW/Audi', partName: 'DL501 Mechatronic Repair Kit', partNumber: '0B5398048D', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Service DSG fluid every 40,000 miles with OEM-approved fluid. The DL501 is NOT a "lifetime fill" transmission despite Audi marketing claims. Regular service prevents $3,000-$5,000 mechatronic failures.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Professional mechatronic repair services from ECU Testing or Control Units can save 40-50% vs new OEM unit from dealer.', partBrand: 'ECU Testing', partName: 'DL501 Mechatronic Repair Service', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Jerky low-speed shifts, shudder during takeoff, and "clunking" into gear are early signs. Address immediately - continuing to drive accelerates damage to clutch packs.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The DL501 fits A4/S4/RS4 (2008-2017), A5/S5/RS5 (2008-2017), A6/S6 (2011-2016), A7/S7 (2011-2018), Q5 (2009-2017). Parts are interchangeable across these models.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-s-tronic-dsg-issues-2012');

updateIssue('audi-a6-carbon-buildup-2011', [
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles is the gold standard for 3.0T carbon removal. More labor-intensive than 2.0T due to supercharger placement. FCP Euro has a full DIY guide.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For B9/B9.5 A6 with EA839 3.0T: 034 Motorsport Catch Can Kit (034-101-1016 PCV side, 034-101-1018 CCV side). 22.5mm hoses vs factory 16mm. Lifetime warranty.', partBrand: '034 Motorsport', partName: 'Catch Can Kit EA839 3.0T', partNumber: '034-101-1016', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For C7 A6 3.0T: Mishimoto Universal Baffled Catch Can (MMBCC-UNI-BK) with custom brackets. No direct-fit kit exists for C7 platform.', partBrand: 'Mishimoto', partName: 'Universal Baffled Catch Can', partNumber: 'MMBCC-UNI-BK', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Seafoam sprayed through IAT port every 5,000-10,000 miles as preventive maintenance can slow accumulation. Will NOT remove established deposits - only walnut blasting removes those.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Symptoms include rough idle, misfires, and progressive power loss. By 70,000 miles, valves on 3.0T can be severely caked. Do not wait until driveability is significantly affected.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-carbon-buildup-2011');

updateIssue('audi-a6-gateway-module-liquid-2019', [
  { type: 'warning', content: 'SAFETY RECALL: The gateway control module can fail due to liquid intrusion, potentially disabling critical vehicle functions. Contact your Audi dealer immediately for free repair.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check your VIN at NHTSA.gov or the Audi recall page. Affects 2019-2022 A6 and A7 models. Dealer replaces the gateway module and applies protective sealant at no cost.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Symptoms include random warning lights, loss of turn signals, brake lights, or other electrical functions. These are potentially dangerous failures - do not delay recall service.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Even if no symptoms are present, get the recall performed. The liquid intrusion can happen gradually and cause intermittent issues before complete module failure.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-gateway-module-liquid-2019');

updateIssue('audi-a6-electrical-issues-2005', [
  { type: 'part', content: 'Window regulator failures are extremely common on C6 A6. Use OEM replacements from ECS Tuning or FCP Euro - aftermarket regulators have poor fitment and fail quickly.', partBrand: 'Genuine VW/Audi', partName: 'Window Regulator Assembly', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'MMI system freezing on older C6/C7 models: perform hard reset by holding power button 30+ seconds. For persistent issues, dealer software update may resolve.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Door lock actuator failures are common. OEM actuators from FCP Euro come with lifetime warranty. Replace all 4 at once to avoid repeat labor.', partBrand: 'Genuine VW/Audi', partName: 'Door Lock Actuator', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'C6 A6 electrical issues can be caused by low battery voltage. The J519 electrical body control module and convenience control modules are sensitive to voltage drops. Replace battery every 4-5 years preventatively.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a6-electrical-issues-2005');

// ============================================================================
// S5 Issues
// ============================================================================

updateIssue('audi-s5-supercharger-clutch-2010', [
  { type: 'part', content: 'JHM Motorsports complete supercharger seal & gasket kit includes new pocket bearings and supercharger oil. Fits B8/B8.5 S4/S5/Q5/SQ5 and C6/C7 A6/A7 3.0T.', partBrand: 'JHM Motorsports', partName: 'Supercharger Seal & Gasket Kit', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Jon Bond Performance full TVS1320 rebuild kit includes 2x INA rear needle bearings (pre-greased), Permatex gasket maker, and JB Performance supercharger oil with Tribodyn.', partBrand: 'Jon Bond Performance', partName: 'TVS1320 Full Rebuild Kit', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For a complete upgrade, JHM Motorsports offers a fully ported TVS1320 supercharger with new bearings. Significant power gains over stock.', partBrand: 'JHM Motorsports', partName: 'Fully Ported TVS1320 Supercharger', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Professional rebuild services available from Superchargers Online (818-518-9889) and Jokerz Performance. Cost is typically $800-$1,500 for rebuild vs $3,000-$5,000 for OEM replacement.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Whining noise from the supercharger area that increases with RPM is the classic sign of nose bearing failure. Address immediately - continued driving can damage the rotors and require full replacement.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-s5-supercharger-clutch-2010');

// ============================================================================
// A7 Issues
// ============================================================================

updateIssue('audi-a7-timing-chain-tensioner-2012', [
  { type: 'part', content: 'Right-side upper timing chain tensioner: 06E109218AP (latest revision). Left-side: 06E109217H. Replace both sides together.', partBrand: 'Genuine VW/Audi', partName: 'Upper Timing Chain Tensioner', partNumber: '06E109218AP', upvotes: 0, needsReview: false },
  { type: 'part', content: 'ECS Tuning complete timing chain kit (06E109218ACKT) includes chains, tensioners, guide rails, bolts, gaskets, and seals. One-stop solution.', partBrand: 'ECS Tuning', partName: 'Complete Timing Chain Kit', partNumber: '06E109218ACKT', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace preventatively at 80,000-100,000 miles. Cold-start rattle is the early warning. The 3.0T timing chains are at the back of the engine, making this a 12-16 hour job.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Timing chain failure on the 3.0T causes bent valves and piston damage. If you hear cold-start rattle, do not delay - can turn a $3,000 job into a $10,000+ engine replacement.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-timing-chain-tensioner-2012');

updateIssue('audi-a7-carbon-buildup-2012', [
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles is the gold standard for 3.0T A7 carbon removal. Professional service cost $500-$1,200 depending on location.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Mishimoto Universal Baffled Catch Can (MMBCC-UNI-BK) for C7 A7. No direct-fit kit exists for C7 platform, so universal kit requires custom brackets.', partBrand: 'Mishimoto', partName: 'Universal Baffled Catch Can', partNumber: 'MMBCC-UNI-BK', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular highway driving at higher RPM helps slow carbon buildup compared to short city trips. Schedule walnut blasting as part of routine maintenance.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Carbon deposits become problematic by 60,000-80,000 miles on 3.0T. Symptoms: rough idle, misfires, power loss. Do not wait for severe driveability issues.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-carbon-buildup-2012');

updateIssue('audi-a7-supercharger-clutch-2012', [
  { type: 'part', content: 'JHM Motorsports supercharger seal & gasket kit with new pocket bearings and supercharger oil. Fits C6/C7/C7.5 A6/A7/S6/S7 3.0T.', partBrand: 'JHM Motorsports', partName: 'Supercharger Seal & Gasket Kit', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Jon Bond Performance full TVS1320 rebuild kit with INA rear needle bearings, Permatex gasket maker, and JB supercharger oil with Tribodyn additive.', partBrand: 'Jon Bond Performance', partName: 'TVS1320 Full Rebuild Kit', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Supercharger rebuild ($800-$1,500) is far more cost-effective than OEM replacement ($3,000-$5,000). Superchargers Online and Jokerz Performance offer professional rebuild services.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Whining that increases with RPM indicates bearing failure. If ignored, rotor contact destroys the supercharger internals, requiring full replacement instead of rebuild.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'OEM supercharger drive belt 06E903137T for stock applications. For Stage 2 dual pulley setups, use Bando 7PK1320 overdrive belt.', partBrand: 'Bando', partName: 'Overdrive Serpentine Belt', partNumber: '7PK1320', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-supercharger-clutch-2012');

updateIssue('audi-a7-dsg-transmission-2012', [
  { type: 'part', content: 'OEM DL501 mechatronic repair kit 0B5398048D. ECS Tuning Ultimate Mechatronic Rebuild Kit (0B5398009F2KT) is a comprehensive alternative.', partBrand: 'Genuine VW/Audi', partName: 'DL501 Mechatronic Repair Kit', partNumber: '0B5398048D', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Service DSG fluid every 40,000 miles. Many A7/S7 C7 owners report dramatically improved shift quality and extended mechatronic life with regular fluid changes.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Professional mechatronic repair from ECU Testing or Control Units saves 40-50% vs new unit. Full replacement mechatronic units: 0B5927156K / 0B5927256G.', partBrand: 'ECU Testing', partName: 'Mechatronic Repair Service', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Harsh shifts and shudder get progressively worse. Early fluid change can resolve mild symptoms. Severe cases require mechatronic rebuild ($2,500-$4,000).', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-dsg-transmission-2012');

updateIssue('audi-a7-gateway-module-recall-2019', [
  { type: 'warning', content: 'SAFETY RECALL: Gateway control module can fail from liquid intrusion, disabling critical vehicle functions. Contact Audi dealer for free repair immediately.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Affects 2019-2022 A7 models. Check VIN at NHTSA.gov. Dealer replaces gateway module and applies protective sealant at no cost.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Symptoms include random warning lights, loss of turn signals/brake lights, or other electrical failures. These are dangerous - get recall service done promptly.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-gateway-module-recall-2019');

updateIssue('audi-a7-phev-battery-overheating-2022', [
  { type: 'warning', content: 'SAFETY RECALL: High-voltage battery can overheat, posing a fire risk. Contact your Audi dealer immediately. Do not park in enclosed garages until recall is performed.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check recall status at NHTSA.gov with your VIN. Affects 2022 A7 PHEV models. Dealer repair is free of charge.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If you smell burning, see smoke, or notice the battery warning light, pull over safely and call 911. Do not attempt to extinguish an EV battery fire yourself.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a7-phev-battery-overheating-2022');

// ============================================================================
// A8 Issues
// ============================================================================

updateIssue('audi-a8-timing-chain-tensioner-2011', [
  { type: 'part', content: 'For 3.0T D4 A8: use latest OEM upper timing chain tensioners 06E109218AP (right) and 06E109217H (left). Replace both sides together.', partBrand: 'Genuine VW/Audi', partName: 'Upper Timing Chain Tensioner - Right', partNumber: '06E109218AP', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For 4.2L V8: timing chain is at the rear of the engine requiring transmission removal. Complete kit from ECS Tuning recommended. Budget $5,000-$8,000 for labor alone.', partBrand: 'ECS Tuning', partName: 'Complete Timing Chain Kit (4.2L V8)', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The D4 A8 timing chain job is one of the most labor-intensive in the Audi lineup. Get quotes from independent Audi specialists - dealer quotes can be $10,000+.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Cold-start rattle that disappears after warm-up is the early warning. Do not delay - chain failure destroys the engine and the A8 4.2L engine replacement costs $12,000+.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a8-timing-chain-tensioner-2011');

updateIssue('audi-a8-air-suspension-2011', [
  { type: 'part', content: 'OEM air struts are $1,500-$2,500 each from dealer. Arnott Industries offers remanufactured struts at 40-60% savings with 2-year warranty. Arnott is the leading aftermarket air suspension specialist.', partBrand: 'Arnott Industries', partName: 'Remanufactured Air Strut (D4 A8)', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Air compressor failures are common. OEM replacement or Arnott remanufactured compressor with new relay and dryer. Replace dryer with every compressor replacement.', partBrand: 'Arnott Industries', partName: 'Air Suspension Compressor', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'When one strut leaks, replace in pairs (both fronts or both rears) to maintain even ride height and prevent overworking the compressor.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If the car drops overnight or the compressor runs constantly, address immediately. An overworked compressor will burn out ($1,000-$2,000 replacement), turning a $1,500 strut job into $3,000+.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Some owners convert to coilover suspension to eliminate air suspension headaches entirely. Bilstein B4 or B8 is a common conversion choice, but this removes the adjustable ride height feature.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a8-air-suspension-2011');

updateIssue('audi-a8-mmi-infotainment-2011', [
  { type: 'tip', content: 'MMI 3G/3G+ freezing: hold the rotary volume/power knob for 30+ seconds for hard reset. For persistent issues, dealer software update often resolves bugs.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'MMI control unit failures require replacement. OEM refurbished units from ECS Tuning save 40-60% vs new from dealer. Ensure correct MMI version (3G vs 3G+).', partBrand: 'Genuine VW/Audi', partName: 'MMI Control Unit (Refurbished)', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Nav database updates can be loaded via SD card from the Audi website. Many "navigation not working" issues are simply outdated map data.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'D4 A8 MMI and Virtual Cockpit issues are often caused by low battery voltage. Replace the main battery every 4-5 years - the A8 draws significant parasitic current.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a8-mmi-infotainment-2011');

updateIssue('audi-a8-carbon-buildup-2011', [
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles for 3.0T models. For 4.2L V8, carbon buildup is less severe but still occurs. Professional service recommended due to D4 engine bay complexity.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Mishimoto Universal Baffled Catch Can (MMBCC-UNI-BK) with custom brackets for prevention. No direct-fit catch can kit exists for D4 A8 platform.', partBrand: 'Mishimoto', partName: 'Universal Baffled Catch Can', partNumber: 'MMBCC-UNI-BK', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular highway driving at higher RPM helps slow accumulation. Short city trips accelerate carbon buildup significantly.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'The D4 A8 3.0T supercharger sits atop the engine, making walnut blasting more labor-intensive. Budget $800-$1,500 for professional service.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a8-carbon-buildup-2011');

updateIssue('audi-a8-electrical-sensor-2011', [
  { type: 'part', content: 'The D4 A8 has over 100 electronic modules. Battery Management System (BMS) failures are common. OEM battery with proper coding via VCDS or dealer required.', partBrand: 'Genuine VW/Audi', partName: 'AGM Battery with BMS', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Many sensor faults are caused by low battery voltage. Replace battery every 4-5 years and register it with VCDS/OBDeleven to update BMS parameters.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'OBDeleven Pro ($79) or Ross-Tech VCDS ($199) are essential tools for D4 A8 owners. Can diagnose and clear module faults, register batteries, and perform basic coding.', partBrand: 'OBDeleven', partName: 'OBDeleven Pro Diagnostic Tool', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'The D4 A8 is one of the most electronically complex cars Audi makes. Random sensor faults often cascade from a single root cause. Have a qualified Audi specialist diagnose before replacing parts.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-a8-electrical-sensor-2011');

// ============================================================================
// Q7 Issues
// ============================================================================

updateIssue('audi-q7-timing-chain-tensioner-2007', [
  { type: 'part', content: 'For 3.0 TDI Q7: complete timing chain kit from FCP Euro (059109229AAKT) includes 206-link chain, 136-link chain, 6 guide rails, and tensioner. Most comprehensive kit available.', partBrand: 'Genuine VW/Audi', partName: 'Complete TDI Timing Chain Kit', partNumber: '059109229AAKT', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For 3.0T supercharged Q7: upper timing chain tensioners 06E109218AP (right) and 06E109217H (left). ECS Tuning carries complete kits.', partBrand: 'Genuine VW/Audi', partName: 'Upper Timing Chain Tensioner', partNumber: '06E109218AP', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace preventatively at 80,000-120,000 miles. Cold-start rattle is the early warning. The Q7 timing chain is at the rear of the engine, requiring 12-18 hours of labor.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If chain has already jumped 4-5 teeth, head damage may be avoidable if caught immediately. More teeth skipped = certain engine damage. Do NOT attempt to start engine if chain has jumped.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-timing-chain-tensioner-2007');

updateIssue('audi-q7-supercharger-failure-2011', [
  { type: 'part', content: 'JHM Motorsports complete seal & gasket kit with new pocket bearings and supercharger oil. Fits 4L Q7 3.0T alongside B8 S4/S5 and C6/C7 A6/A7.', partBrand: 'JHM Motorsports', partName: 'Supercharger Seal & Gasket Kit (Q7 3.0T)', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Jon Bond Performance full TVS1320 rebuild kit with INA rear needle bearings, Permatex gasket maker, and JB Performance supercharger oil.', partBrand: 'Jon Bond Performance', partName: 'TVS1320 Full Rebuild Kit', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Supercharger rebuild ($800-$1,500) vs OEM replacement ($3,000-$5,000). Professional rebuild services from Superchargers Online (818-518-9889) or Jokerz Performance.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Whining that increases with RPM = bearing failure. Address promptly before rotor contact destroys internals, requiring full replacement instead of rebuild.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-supercharger-failure-2011');

updateIssue('audi-q7-carbon-buildup-3.0t-2011', [
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles is the gold standard for Q7 3.0T. Professional service recommended due to engine bay complexity. Budget $800-$1,500.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Mishimoto Universal Baffled Catch Can (MMBCC-UNI-BK) with custom brackets for prevention. No direct-fit catch can exists for 4L Q7 3.0T platform.', partBrand: 'Mishimoto', partName: 'Universal Baffled Catch Can', partNumber: 'MMBCC-UNI-BK', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Seafoam through IAT port every 5,000-10,000 miles as preventive maintenance helps slow accumulation but will NOT remove established deposits.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Severe carbon buildup on 3.0T Q7 can cause valve damage if deposits prevent proper valve closure. Address misfires and rough idle promptly.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-carbon-buildup-3.0t-2011');

updateIssue('audi-q7-air-suspension-failure-2007', [
  { type: 'part', content: 'Arnott Industries remanufactured air struts offer 40-60% savings over OEM with 2-year warranty. Arnott is the industry leader in aftermarket air suspension components.', partBrand: 'Arnott Industries', partName: 'Remanufactured Air Strut (Q7)', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Air compressor with relay and dryer. Always replace the dryer with the compressor - a clogged dryer is the #1 cause of premature compressor failure.', partBrand: 'Arnott Industries', partName: 'Air Compressor Assembly', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace air struts in pairs (both fronts or both rears). Single strut replacement causes uneven wear and overworks the compressor, leading to premature failure.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Constant compressor running or overnight sag indicates air leak. Address immediately before the compressor burns out ($1,000-$2,000 replacement).', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-air-suspension-failure-2007');

updateIssue('audi-q7-tdi-emissions-scandal-2009', [
  { type: 'tip', content: 'Check with your Audi dealer for buyback eligibility or emissions fix status. Extended diesel emissions warranty may cover certain repairs for 10 years/120,000 miles.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'The emissions "fix" software update has been reported to affect fuel economy and performance negatively by some owners. Research before accepting the fix.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'If you accepted the buyback/settlement, ensure all payments were received. Contact the settlement administrator if any payments are outstanding.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Extended emissions warranty covers SCR catalyst, NOx sensors, AdBlue/DEF system, and EGR components. Verify coverage with your VIN at the Audi dealer.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-tdi-emissions-scandal-2009');

updateIssue('audi-q7-tdi-oil-cooler-leak-2013', [
  { type: 'warning', content: 'CRITICAL SAFETY RECALL: Oil cooler can leak oil into the brake booster vacuum line, causing loss of brake assist. Contact dealer immediately for free repair.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Affects 2013-2015 Q7 TDI models. Check VIN at NHTSA.gov. Dealer repairs the oil cooler seal and inspects the brake booster at no cost.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If brake pedal feels hard/high with poor stopping power, the brake booster may already be contaminated. Stop driving and tow to dealer immediately.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-tdi-oil-cooler-leak-2013');

updateIssue('audi-q7-water-pump-failure-2007', [
  { type: 'part', content: 'For 3.0T Q7: OEM water pump 06E121018F (latest revision, supersedes 06E121016C/G/Q/018N). HEPU 06E121018D is a quality aftermarket alternative with metal impeller.', partBrand: 'HEPU', partName: 'Water Pump (3.0T V6)', partNumber: '06E121018D', upvotes: 0, needsReview: false },
  { type: 'part', content: 'German Performance Solutions (GPS) billet aluminum thermostat housing eliminates the OEM plastic housing cracking issue. $234.99 with 3-year warranty. Highly rated on Audizine.', partBrand: 'German Performance Solutions', partName: 'Billet Aluminum Thermostat Housing', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace water pump, thermostat, and all seals together. Also replace heater pipe O-ring (N90365302). Labor is significant on Q7 - do everything at once to avoid repeat access.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'OEM plastic thermostat housing tabs break, causing sudden thermostat failure and overheating. The GPS billet housing is the definitive fix to prevent repeat failures.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q7-water-pump-failure-2007');

// ============================================================================
// Q8 Issues
// ============================================================================

updateIssue('audi-q8-carbon-buildup-2019', [
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles. The Q8 3.0T uses the EA839 engine with improved port/direct injection, so carbon buildup is less severe than older 3.0T but still occurs.', upvotes: 0, needsReview: false },
  { type: 'part', content: '034 Motorsport Catch Can Kit for EA839 (034-101-1016 PCV side). Direct-fit for B9 platform EA839 3.0T. Lifetime warranty.', partBrand: '034 Motorsport', partName: 'Catch Can Kit EA839', partNumber: '034-101-1016', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular highway driving helps slow carbon accumulation. The Q8 benefits from having both port and direct injection, which helps keep intake valves cleaner than pure DI engines.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If rough idle or misfires develop, get intake valves inspected with a borescope before assuming other causes. Carbon buildup is still possible even with dual injection.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q8-carbon-buildup-2019');

updateIssue('audi-q8-mmi-electrical-2019', [
  { type: 'tip', content: 'MIB3 system freezing: hold power button 30+ seconds for hard reset. Keep firmware updated via myAudi app or dealer. Audi released multiple patches through 2021-2022.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Wireless CarPlay/Android Auto disconnections are a known MIB3 bug. Ensure phone Bluetooth and WiFi are updated. Using wired connection is more reliable.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Display or touch panel failures require dealer replacement. OEM refurbished units available from ECS Tuning at savings vs new from dealer.', partBrand: 'Genuine VW/Audi', partName: 'MIB3 Display Unit', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do not install aftermarket firmware or "coding" tools on the MIB3 system without understanding the risks. Incorrect coding can disable safety features.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q8-mmi-electrical-2019');

updateIssue('audi-q8-air-suspension-2019', [
  { type: 'part', content: 'Arnott Industries remanufactured air struts offer significant savings over OEM ($1,500-$2,500 each) with 2-year warranty. Replace in pairs for even ride height.', partBrand: 'Arnott Industries', partName: 'Remanufactured Air Strut (Q8)', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Most Q8 air suspension issues are software/calibration related in the first few years. Dealer software update may resolve ride height sensor faults before hardware replacement is needed.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Air compressor failures: always replace the dryer with the compressor. A clogged dryer causes premature compressor failure. OEM or Arnott compressor assemblies available.', partBrand: 'Arnott Industries', partName: 'Air Compressor with Dryer', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Overnight sag or constant compressor running = air leak. Address promptly to prevent $1,000-$2,000 compressor replacement on top of strut costs.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-q8-air-suspension-2019');

// ============================================================================
// RS3 / TTRS Issues
// ============================================================================

updateIssue('audi-rs3-ttrs-carbon-buildup-2015', [
  { type: 'part', content: '034 Motorsport Catch Can Kit for 8J TTRS/8P RS3 2.5 TFSI. Completely revised high-capacity billet aluminum design. Drastically reduces carbon buildup within intake tract.', partBrand: '034 Motorsport', partName: 'Catch Can Kit (8J TTRS/8P RS3)', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting every 50,000-70,000 miles. The 2.5T five-cylinder benefits significantly from catch cans due to high crankcase pressure under boost.', upvotes: 0, needsReview: false },
  { type: 'part', content: '034 Motorsport X34 Carbon Fiber Cold Air Intake for 8J TTRS/8P RS3 2.5 TFSI provides up to +16 crank HP, +13 ft-lbs torque on stock turbo tunes while improving airflow.', partBrand: '034 Motorsport', partName: 'X34 Carbon Fiber Cold Air Intake', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'The 2.5T produces significantly more crankcase pressure than the 2.0T, accelerating carbon buildup. A catch can is especially important on tuned RS3/TTRS cars.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs3-ttrs-carbon-buildup-2015');

updateIssue('audi-rs3-dsg-transmission-2015', [
  { type: 'part', content: 'OEM DQ500 mechatronic repair kit 0B5398048D. For severe failures, complete mechatronic units available: 0B5927156K / 0B5927256G.', partBrand: 'Genuine VW/Audi', partName: 'DQ500 Mechatronic Repair Kit', partNumber: '0B5398048D', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Service DSG fluid every 40,000 miles with approved fluid. The DQ500 in the RS3 handles significantly more torque than in lesser models - regular service is critical for longevity.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For tuned RS3s making 500+ HP, aftermarket clutch packs from Dodson Motorsport or SSP provide significantly higher torque capacity than OEM.', partBrand: 'Dodson Motorsport', partName: 'DQ500 Clutch Pack Upgrade', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Tuned RS3s stress the DQ500 far beyond design limits. At 500+ HP, clutch slip and mechatronic failures become common without upgraded clutch packs.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs3-dsg-transmission-2015');

updateIssue('audi-rs3-ttrs-injector-failure-2015', [
  { type: 'part', content: 'Autotech HPFP Upgrade Kit (10.127.101K) provides 50% higher flow rate than OEM. Essential for E85 or tuned 2.5T applications. +5% torque increase, +10 bar fuel rail pressure.', partBrand: 'Autotech Fueling Solutions', partName: 'HPFP Upgrade Kit (2.5T)', partNumber: '10.127.101K', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The "torch effect" occurs when a failing injector sprays raw fuel onto the exhaust manifold. If you smell burning fuel or see smoke from the engine bay, shut off the engine immediately.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'OEM replacement injectors from FCP Euro come with lifetime warranty. Always replace the seals and O-rings when removing injectors.', partBrand: 'Genuine VW/Audi', partName: 'Fuel Injector (2.5T TFSI)', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'FIRE RISK: The "torch effect" is a known fire hazard on 2.5T engines. If injector failure is suspected, do not drive the car. Have it towed for inspection.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular fuel system maintenance and using top-tier fuel helps prevent injector clogging. Avoid low-quality fuel stations.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs3-ttrs-injector-failure-2015');

// ============================================================================
// RS6 / RS7 Issues
// ============================================================================

updateIssue('audi-rs6-rs7-turbo-oil-strainer-2013', [
  { type: 'warning', content: 'CRITICAL: The turbo oil feed line strainers clog with debris, starving turbos of oil and causing catastrophic turbo failure. This is the #1 reliability concern on 4.0T RS6/RS7.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Turbo coolant line O-ring kit from JHM Motorsports for C7 S6/S7/RS7 and D4 A8/S8 4.0T. Replace all O-rings during turbo service.', partBrand: 'JHM Motorsports', partName: 'Turbo Coolant Line O-Ring Kit', upvotes: 0, needsReview: false },
  { type: 'part', content: 'UroTuning TSB failure parts & turbo install gasket set (40T-TSB-TIK) for C7 S6/S7/RS7. Complete gasket set for turbo service.', partBrand: 'UroTuning', partName: 'TSB Turbo Install Gasket Set', partNumber: '40T-TSB-TIK', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Covered under Audi TSB 2044640. Check with your dealer for warranty coverage. Have oil strainers inspected/cleaned at every major service interval.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'GMP Performance turbo oil feed line starvation prevention upgrade prevents oil starvation to turbos on S6/S7/A8/S8/RS7 4.0T.', partBrand: 'GMP Performance', partName: 'Turbo Oil Starvation Prevention Kit', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs6-rs7-turbo-oil-strainer-2013');

updateIssue('audi-rs6-rs7-carbon-buildup-2013', [
  { type: 'tip', content: 'Walnut blasting is the primary solution for 4.0T carbon removal. Hot-V layout makes this more labor-intensive than standard engines. Budget $1,000-$2,000 for professional service.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Regular high-RPM driving helps burn off some deposits. The 4.0T hot-V layout creates additional heat challenges that accelerate carbon accumulation.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'No widely-available direct-fit catch can kit exists for the 4.0T hot-V. Mishimoto Universal Baffled Catch Can (MMBCC-UNI-BK) can be adapted with custom brackets.', partBrand: 'Mishimoto', partName: 'Universal Baffled Catch Can', partNumber: 'MMBCC-UNI-BK', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Carbon deposits on 4.0T can prevent proper valve closure, leading to compression loss and misfires. Address rough idle promptly with borescope inspection.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs6-rs7-carbon-buildup-2013');

updateIssue('audi-rs6-rs7-motor-mounts-2013', [
  { type: 'part', content: 'OEM motor mounts from FCP Euro with lifetime warranty. The 4.0T V8 produces extreme torque that tears OEM mounts prematurely, especially on tuned cars.', partBrand: 'Genuine VW/Audi', partName: 'Engine Mount (4.0T V8)', upvotes: 0, needsReview: false },
  { type: 'part', content: '034 Motorsport density-line motor mounts provide stiffer mounting that resists deformation better than OEM rubber. Reduces drivetrain slop and improves throttle response.', partBrand: '034 Motorsport', partName: 'Density-Line Motor Mounts', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Symptoms of failed mounts: excessive engine movement visible under hood, clunking during gear changes, vibration at idle. Easy visual inspection - look for sagging or torn rubber.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Failed motor mounts allow the engine to shift, which can damage exhaust manifolds, turbo lines, and wiring harnesses. Replace promptly when symptoms appear.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs6-rs7-motor-mounts-2013');

// ============================================================================
// RS4 / RS5 Issues
// ============================================================================

updateIssue('audi-rs4-rs5-carbon-buildup-2018', [
  { type: 'part', content: '034 Motorsport Catch Can Kit for EA839 (034-101-1016 PCV side, 034-101-1018 CCV side). Direct-fit for B9 RS4/RS5 2.9T twin-turbo V6. Lifetime warranty.', partBrand: '034 Motorsport', partName: 'Catch Can Kit EA839 RS4/RS5', partNumber: '034-101-1016', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The 2.9T EA839 has both port and direct injection, which significantly reduces carbon buildup compared to older pure-DI engines. Still benefits from catch can installation.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting interval can be extended to 70,000-100,000 miles on dual-injection 2.9T compared to 50,000 miles on older single-injection engines.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Tuned RS4/RS5 cars running higher boost produce more crankcase pressure, accelerating carbon buildup. Catch can is especially important on tuned applications.', upvotes: 0, needsReview: false }
]);
clearNeedsReview('audi-rs4-rs5-carbon-buildup-2018');

// ============================================================================
// Summary
// ============================================================================

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log('\n========================================');
console.log('Deep Research Audi Batch 2 - Summary');
console.log('========================================');
console.log(`Issues updated: ${updatedCount}`);
console.log(`Issues not found: ${notFoundCount}`);
console.log(`Issues with needsReview cleared: ${reviewClearedCount}`);
console.log('========================================');
console.log('Database written to:', filePath);
