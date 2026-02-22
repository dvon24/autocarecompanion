const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function updateIssue(id, newRecs) {
  const issue = data.issues.find(i => i.id === id);
  if (issue) {
    issue.communityRecommendations = newRecs;
    console.log('Updated:', id);
  } else {
    console.log('NOT FOUND:', id);
  }
}

function clearNeedsReview(id) {
  const issue = data.issues.find(i => i.id === id);
  if (issue && issue.communityRecommendations) {
    issue.communityRecommendations.forEach(r => { r.needsReview = false; });
    console.log('Cleared needsReview:', id);
  } else {
    console.log('NOT FOUND or no recommendations:', id);
  }
}

// ============================================================
// EA888 2.0T-related Audi issues - full recommendation updates
// ============================================================

// --- audi-q5-timing-chain-tensioner-2011 ---
updateIssue('audi-q5-timing-chain-tensioner-2011', [
  { type: 'part', content: 'Use ONLY the latest OEM revised tensioner 06K109467K - it supersedes all previous revisions (N, AB, etc.). Aftermarket tensioners fail within 30k miles per Audizine reports.', partBrand: 'Genuine VW/Audi', partName: 'Timing Chain Tensioner (Latest Revision)', partNumber: '06K109467K', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace as a complete kit: chain + tensioner + upper/lower guides + cam bridge tensioner. ECS Tuning and FCP Euro sell complete OEM kits for $800-$1,200.', partBrand: 'Genuine VW/Audi', partName: 'Complete Timing Chain Kit', partNumber: '06K109158AD', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'PREVENTIVE: Replace at 80,000-100,000 miles BEFORE rattling starts. Once you hear cold-start rattle, you have weeks to months before catastrophic failure. Change oil every 5,000 miles to reduce tensioner wear.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If chain has jumped timing, DO NOT attempt to start the engine again. Tow to shop immediately. Bent valves and piston damage can turn a $2,500 repair into a $10,000 engine replacement.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'FCP Euro offers lifetime replacement warranty on all parts including timing chain components - buy from them for free replacements if needed in the future.', partBrand: 'FCP Euro', partName: 'Lifetime Warranty Parts', upvotes: 0, needsReview: false }
]);

// --- audi-q5-oil-consumption-2010 ---
updateIssue('audi-q5-oil-consumption-2010', [
  { type: 'part', content: 'For severe oil consumption (1qt/500-1200mi), Audi Stage 2 fix requires revised pistons with updated "Big Wave" oil control ring design. This is the definitive fix.', partBrand: 'Kolbenschmidt', partName: 'Revised Piston Set with Updated Oil Rings', partNumber: '06H107065DD', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For moderate consumption, try Stage 1 fix first: replace PCV/crankcase pressure regulating valve. Budget option is Dorman 917-064 PCV diaphragm repair kit ($25-35).', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Class action settlement covered 2012-2014 A4/A5/A6/Q5 and some TT/A3 models. Check with your Audi dealer for eligibility - may cover piston replacement at no cost.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Gen2 EA888 (2009-2013) is most affected. Gen3 (2014+) uses revised rings and is significantly better. Do not confuse the two when researching fixes.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use Liqui Moly Molygen 5W-40 or Castrol Edge 5W-40 with frequent 5,000 mile oil changes to help manage consumption while awaiting repair.', upvotes: 0, needsReview: false }
]);

// --- audi-q5-water-pump-failure-2009 ---
updateIssue('audi-q5-water-pump-failure-2009', [
  { type: 'part', content: 'Replace with OEM thermostat housing assembly using latest revision 06L121111P which supersedes all previous F through M revisions. Plastic impeller deforms under heat causing failures.', partBrand: 'Genuine VW/Audi', partName: 'Thermostat Housing Assembly (Latest Revision)', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Hepu P672 is a German OEM-supplier alternative at a lower price. Cross-references 06L121012L. Generally well-regarded on Audizine.', partBrand: 'Hepu', partName: 'Water Pump', partNumber: 'P672', upvotes: 0, needsReview: false },
  { type: 'part', content: 'USP Motorsports metal impeller upgrade kit eliminates the plastic impeller heat-deformation issue entirely. Recommended by VW Vortex community for Gen3 engines.', partBrand: 'USP Motorsports', partName: 'Metal Impeller Water Pump Kit', partNumber: '06L121111H-KT1', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'AVOID Graf water pumps for EA888 - multiple Audizine forum members report leaking from day one. One user had immediate small leak, another reported leak from installation.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Always replace thermostat housing, water pump, and union as a complete assembly. Labor is 80% of the cost and everything is interconnected. Also replace heater pipe O-ring N90365302.', upvotes: 0, needsReview: false }
]);

// --- audi-q5-carbon-buildup-2009 ---
updateIssue('audi-q5-carbon-buildup-2009', [
  { type: 'part', content: '034 Motorsport Catch Can Kit is the gold standard for B8/B8.5 A4/A5/Q5 2.0 TFSI. CNC machined 6061-T6 aluminum breather plate replaces factory PCV. Most complete platform-specific solution.', partBrand: '034 Motorsport', partName: 'Catch Can Kit B8/B8.5 2.0 TFSI', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting is the community gold standard for removing existing carbon. DIY with Harbor Freight media blaster + walnut shell media for under $200 total. Professional service costs $400-$1,200.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'RKX or 034 Motorsport carbon cleaning adapter allows walnut blasting without fully removing the intake manifold. Model-specific adapters available on Amazon.', partBrand: '034 Motorsport', partName: 'Carbon Cleaning Walnut Blast Adapter', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Catch cans should be removed or bypassed in below-freezing temperatures to avoid freeze-up issues. Drain catch can every oil change.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Carbon buildup typically becomes an issue by 40,000-60,000 miles. Plan for walnut blasting every 40k miles as preventive maintenance, or install catch can to dramatically slow accumulation.', upvotes: 0, needsReview: false }
]);

// --- audi-q5-coolant-leaks-2009 ---
updateIssue('audi-q5-coolant-leaks-2009', [
  { type: 'part', content: 'Latest thermostat housing revision 06L121111P fixes the cracking issue. Supersedes all prior versions (F through M). Always use this latest revision.', partBrand: 'Genuine VW/Audi', partName: 'Thermostat Housing (Latest Revision)', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Mahle/Behr is the OEM thermostat supplier for VW/Audi. Wahler and Rein Automotive are also OEM-tier alternatives available from AutohausAZ.', partBrand: 'Mahle/Behr', partName: 'OEM Thermostat', partNumber: 'TI3387', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Always replace the heater pipe O-ring (N90365302) when doing thermostat work. Forum consensus is this O-ring is the most common source of minor coolant weeps after repair.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do not ignore small coolant leaks. The EA888 thermostat housing crack typically starts small and rapidly worsens, leading to sudden overheating and potential head gasket damage.', upvotes: 0, needsReview: false }
]);

// --- audi-q5-transmission-mechatronic-2009 ---
updateIssue('audi-q5-transmission-mechatronic-2009', [
  { type: 'part', content: 'For 8-speed ZF transmission (Tiptronic), ZF Lifeguard 8 transmission fluid is the ONLY approved fluid. Do NOT use generic ATF. Available from FCP Euro and ECS Tuning.', partBrand: 'ZF', partName: 'Lifeguard 8 Transmission Fluid', partNumber: 'S671090312', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'ZF recommends fluid and filter change every 60,000 miles despite Audi claiming "lifetime fill." Forum consensus on Audizine strongly supports regular fluid changes to prevent valve body issues.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'ZF mechatronic/valve body replacement is the fix for harsh shifting and delayed engagement. Dealer cost $3,000-$5,000, independent shop $2,000-$3,500.', partBrand: 'ZF', partName: 'Mechatronic Valve Body Assembly', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Ignoring shudder and harsh shifts leads to accelerated wear on clutch packs. Address early with fluid change - many owners report improvements from fresh ZF fluid alone.', upvotes: 0, needsReview: false }
]);

// --- audi-q5-sunroof-drain-clogs-2009 ---
updateIssue('audi-q5-sunroof-drain-clogs-2009', [
  { type: 'tip', content: 'Clean sunroof drains every 12 months with compressed air or flexible weed trimmer line. Insert into drain holes at each corner of the sunroof tray and blow out debris. Takes 10 minutes DIY.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace cracked or deteriorated drain tubes with OEM replacements. Front drains route through A-pillars, rear drains route through C-pillars. OEM tubes available from ECS Tuning.', partBrand: 'Genuine VW/Audi', partName: 'Sunroof Drain Tube Set', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Clogged drains cause water to overflow into headliner, A-pillars, and footwells. Can damage BCM (body control module) and create mold. If you smell musty odor, check drains immediately.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'After cleaning, pour a small cup of water into each drain corner of the sunroof tray to verify water exits properly at the rocker panel area. Water should flow freely within seconds.', upvotes: 0, needsReview: false }
]);

// --- audi-a5-timing-chain-tensioner-2008 ---
updateIssue('audi-a5-timing-chain-tensioner-2008', [
  { type: 'part', content: 'Use ONLY the latest OEM revised tensioner 06K109467K which supersedes all previous revisions. Aftermarket tensioners have high failure rates per Audizine B8 A5 threads.', partBrand: 'Genuine VW/Audi', partName: 'Timing Chain Tensioner (Latest Revision)', partNumber: '06K109467K', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Always do complete timing chain kit: chain + tensioner + upper/lower guides. INA is the OEM manufacturer (part 711024410). FCP Euro and ECS Tuning carry complete kits for $800-$1,200.', partBrand: 'INA', partName: 'Complete Timing Chain Kit', partNumber: '711024410', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace preventively at 80,000-100,000 miles. The 2008-2012 B8 A5 2.0T is especially prone. Cold-start rattle is the warning sign - do not delay once heard.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Catastrophic timing chain failure destroys the engine. If you hear ANY cold-start rattle, stop driving hard and schedule replacement within weeks, not months.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Buy from FCP Euro for lifetime replacement warranty on all parts - if chain components ever need replacing again, you get free parts.', partBrand: 'FCP Euro', partName: 'Lifetime Warranty Parts', upvotes: 0, needsReview: false }
]);

// --- audi-a5-oil-consumption-2008 ---
updateIssue('audi-a5-oil-consumption-2008', [
  { type: 'part', content: 'Revised pistons with "Big Wave" oil control ring design are the definitive fix for severe consumption (1qt/500-1200mi).', partBrand: 'Kolbenschmidt', partName: 'Revised Piston Set', partNumber: '06H107065DD', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Stage 1 fix: replace PCV diaphragm with Dorman 917-064 repair kit ($25-35) before committing to piston replacement.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Gen2 EA888 (2008-2013 B8 A5) is most affected. Check eligibility for class action settlement covering piston replacement.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Running low on oil can destroy the turbocharger and rod bearings. Check oil level weekly and carry a quart in the trunk until the issue is fixed.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use Liqui Moly Molygen 5W-40 or Castrol Edge 5W-40 with 5,000-mile oil change intervals to help manage consumption.', upvotes: 0, needsReview: false }
]);

// --- audi-a5-carbon-buildup-2008 ---
updateIssue('audi-a5-carbon-buildup-2008', [
  { type: 'part', content: '034 Motorsport Catch Can Kit (034-101-1010) is the most complete prevention solution for B8/B8.5 A5 2.0T. Replaces factory PCV with billet aluminum breather plate.', partBrand: '034 Motorsport', partName: 'Catch Can Kit B8/B8.5', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting every 40,000 miles is the community-recommended cleaning interval. DIY cost under $200 with Harbor Freight media blaster and walnut shell media.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Mishimoto Baffled Oil Catch Can is a universal alternative if 034 kit is unavailable for your specific year. Requires custom bracket fabrication.', partBrand: 'Mishimoto', partName: 'Baffled Oil Catch Can (Universal)', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Symptoms include rough idle, misfires, and progressive power loss. By 60,000 miles, valves can be severely caked. Do not wait until symptoms are severe.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'After walnut blasting, install a catch can immediately to prevent rapid re-accumulation. Without a catch can, carbon will return to the same level within 30,000-40,000 miles.', upvotes: 0, needsReview: false }
]);

// --- audi-a5-water-pump-2008 ---
updateIssue('audi-a5-water-pump-2008', [
  { type: 'part', content: 'Use latest OEM thermostat housing revision 06L121111P for Gen3, or Hepu P672 as a cost-effective German OEM-supplier alternative.', partBrand: 'Genuine VW/Audi', partName: 'Thermostat Housing Assembly', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'USP Motorsports metal impeller upgrade kit eliminates the factory plastic impeller heat-deformation failure mode.', partBrand: 'USP Motorsports', partName: 'Metal Impeller Water Pump Kit', partNumber: '06L121111H-KT1', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'AVOID Graf water pumps - multiple Audizine members report leaking from installation. Stick with OEM or Hepu.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace water pump, thermostat housing, and union as a complete assembly. Also replace heater pipe O-ring N90365302 to prevent post-repair leaks.', upvotes: 0, needsReview: false }
]);

// --- audi-a5-airbag-ods-recall-2018 ---
updateIssue('audi-a5-airbag-ods-recall-2018', [
  { type: 'warning', content: 'This is a SAFETY RECALL - contact your Audi dealer immediately for free repair. The front passenger airbag may not deploy in a crash due to ODS sensor malfunction.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check recall status at NHTSA.gov with your VIN or call your Audi dealer directly. Recall repairs are always free of charge regardless of mileage or warranty status.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do not attempt to repair airbag systems yourself. Improper handling of SRS components can cause accidental deployment or system malfunction.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'If your airbag warning light is illuminated, have the system scanned at the dealer. Multiple B9 A5 owners on Audizine reported the light coming on before being notified of the recall.', upvotes: 0, needsReview: false }
]);

// --- audi-a5-electrical-infotainment-2017 ---
updateIssue('audi-a5-electrical-infotainment-2017', [
  { type: 'tip', content: 'For MMI freezing and black screen issues, try a hard reset: hold the rotary power/volume knob for 30+ seconds until the system reboots. This resolves most temporary glitches.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Keep MMI firmware updated through your Audi dealer or via the myAudi app. Many B9 infotainment bugs were addressed through software updates in 2019-2020.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Virtual Cockpit display failures require instrument cluster replacement. OEM refurbished units available from ECS Tuning at significant savings vs new from dealer ($800-$1,200 vs $2,000+).', partBrand: 'Genuine VW/Audi', partName: 'Virtual Cockpit Instrument Cluster (Refurbished)', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Aftermarket stereo replacements void the warranty on the entire MMI system. If still under warranty, pursue dealer repair first.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-timing-chain-tensioner-2015 ---
updateIssue('audi-q3-timing-chain-tensioner-2015', [
  { type: 'part', content: 'Latest OEM revised tensioner 06K109467K supersedes all previous versions. Only use genuine VW/Audi - aftermarket tensioners have unacceptable failure rates.', partBrand: 'Genuine VW/Audi', partName: 'Timing Chain Tensioner (Latest Revision)', partNumber: '06K109467K', upvotes: 0, needsReview: false },
  { type: 'part', content: 'INA 711024410 is the OEM manufacturer part. Complete timing chain kits (chain + tensioner + guides) available from FCP Euro and ECS Tuning for $800-$1,200.', partBrand: 'INA', partName: 'Timing Chain Tensioner (OEM Manufacturer)', partNumber: '711024410', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace at 80,000-100,000 miles preventively. 2015-2018 Q3 with EA888 Gen2 engine is especially prone. 2021+ models have updated tensioners.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Cold-start rattle is the only warning before catastrophic failure. Once rattling starts, you have weeks to months before chain jumps timing and destroys the engine.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'FCP Euro lifetime warranty means free replacement parts forever. Buy timing chain kit from them for peace of mind.', partBrand: 'FCP Euro', partName: 'Lifetime Warranty Coverage', upvotes: 0, needsReview: false }
]);

// --- audi-q3-oil-consumption-2015 ---
updateIssue('audi-q3-oil-consumption-2015', [
  { type: 'part', content: 'Revised pistons with updated oil control rings for EA888 Gen2 engine. Definitive fix for severe oil consumption.', partBrand: 'Kolbenschmidt', partName: 'Revised Piston Set', partNumber: '06H107065DD', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Try PCV diaphragm replacement first as Stage 1 fix. Dorman 917-064 is the budget-friendly repair kit at $25-35.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check oil level weekly and keep a quart in the trunk. Use VW 502.00 spec oil (Liqui Moly Molygen 5W-40 recommended) with 5,000-mile change intervals.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Running low on oil damages turbocharger bearings and can lead to catastrophic engine failure. Never let oil level drop below minimum mark.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-water-pump-coolant-2015 ---
updateIssue('audi-q3-water-pump-coolant-2015', [
  { type: 'part', content: 'Latest OEM thermostat housing revision 06L121111P fixes the cracking/leaking issue. Supersedes all previous revisions.', partBrand: 'Genuine VW/Audi', partName: 'Thermostat Housing Assembly', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Hepu P672 is a quality German OEM-supplier alternative at lower cost than genuine Audi parts.', partBrand: 'Hepu', partName: 'Water Pump', partNumber: 'P672', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace thermostat housing, water pump, and union together. Also replace heater pipe O-ring N90365302 to prevent post-repair coolant weep.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT use Graf water pumps - Audizine community reports leaking from installation. Stick with OEM, Hepu, or USP Motorsports metal impeller kit.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-carbon-buildup-2015 ---
updateIssue('audi-q3-carbon-buildup-2015', [
  { type: 'tip', content: 'Walnut blasting is the gold standard for carbon removal. DIY cost under $200 with Harbor Freight media blaster. Professional service $400-$1,200 at most shops.', upvotes: 0, needsReview: false },
  { type: 'part', content: '034 Motorsport offers MQB-platform catch can kits for 2019+ Q3. For 2015-2018 Q3, use their B8 platform kit (034-101-1010) which fits the EA888 Gen2.', partBrand: '034 Motorsport', partName: 'Catch Can Kit', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Plan walnut blasting every 40,000 miles as preventive maintenance. Install catch can immediately after cleaning to slow re-accumulation dramatically.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Catch cans must be drained regularly and should be bypassed in freezing temperatures to avoid condensation freeze-up.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-brake-pedal-recall-2019 ---
updateIssue('audi-q3-brake-pedal-recall-2019', [
  { type: 'warning', content: 'SAFETY RECALL: The brake pedal plate can separate from the pedal arm, resulting in loss of braking. Contact your Audi dealer immediately for free repair.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check your VIN at NHTSA.gov or call your Audi dealer to verify recall status. Repair is free regardless of mileage or warranty status.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If you feel any play or looseness in the brake pedal, stop driving immediately and have the vehicle towed to the dealer. Do not attempt DIY repair on braking safety components.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'The recall applies to 2019-2020 Q3 models. Dealer replaces the brake pedal assembly at no cost. Typical repair time is 1-2 hours.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-steering-lock-recall-2019 ---
updateIssue('audi-q3-steering-lock-recall-2019', [
  { type: 'warning', content: 'SAFETY RECALL: A loose circlip on the steering belt pulley can cause sudden steering lock while driving. Contact your Audi dealer immediately for free inspection and repair.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Check recall status at NHTSA.gov with your VIN. Affects 2019-2020 Q3 models. Repair involves replacing the steering system belt pulley assembly.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Sudden steering lock at highway speeds is extremely dangerous. If your steering feels stiff or intermittently heavy, have the vehicle inspected immediately.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Dealer will inspect and replace the circlip and pulley assembly at no cost. Do not delay - this is a critical safety issue.', upvotes: 0, needsReview: false }
]);

// --- audi-q3-electrical-infotainment-2019 ---
updateIssue('audi-q3-electrical-infotainment-2019', [
  { type: 'tip', content: 'For MIB3 infotainment freezing, perform hard reset by holding power button for 30+ seconds. Keep firmware updated via myAudi app or dealer visit.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Wireless CarPlay/Android Auto disconnections are a known MIB3 bug. Check for software updates - Audi released multiple patches through 2021-2022 that improved stability.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Virtual Cockpit display failures require instrument cluster replacement. OEM refurbished clusters available from ECS Tuning at significant savings vs dealer new.', partBrand: 'Genuine VW/Audi', partName: 'MIB3 Infotainment Unit (Refurbished)', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do not attempt to install aftermarket firmware or "hacks" on the MIB3 system - this voids warranty and can brick the unit permanently.', upvotes: 0, needsReview: false }
]);

// --- audi-tt-water-pump-2008 ---
updateIssue('audi-tt-water-pump-2008', [
  { type: 'part', content: 'Use OEM thermostat housing latest revision 06L121111P for Gen3 TT (2015+), or 06H121026 series for Gen2 (Mk2 TT 2008-2014). Hepu P672 is a quality alternative.', partBrand: 'Genuine VW/Audi', partName: 'Water Pump Assembly', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'USP Motorsports metal impeller kit prevents the plastic impeller deformation that causes Gen3 failures. Highly recommended upgrade by TT Forum community.', partBrand: 'USP Motorsports', partName: 'Metal Impeller Kit', partNumber: '06L121111H-KT1', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace at first sign of coolant weeping, typically around 60,000 miles. Replace water pump, thermostat housing, and union together to avoid repeat labor costs.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Avoid Graf water pumps - Audizine and TT Forum report leaking from installation. Stick with OEM, Hepu, or USP metal impeller.', upvotes: 0, needsReview: false }
]);

// --- audi-tt-dsg-transmission-2008 ---
updateIssue('audi-tt-dsg-transmission-2008', [
  { type: 'part', content: 'Use only OEM VW/Audi DSG fluid (G 052 182 A2) or approved Pentosin FFL-2 for S-Tronic service. Non-approved fluids cause clutch shudder and accelerated wear.', partBrand: 'Pentosin', partName: 'FFL-2 DSG Transmission Fluid', partNumber: 'G052182A2', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'DSG fluid and filter change every 40,000 miles despite Audi "lifetime fill" claim. Audizine and TT Forum consensus is that regular service dramatically extends mechatronic life.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'DSG mechatronic unit replacement is $2,500-$4,000 at dealer. Rebuilt units from BBA-Reman or certified independent shops can save 40-50% vs new OEM.', partBrand: 'BBA-Reman', partName: 'Rebuilt Mechatronic Unit', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Jerky low-speed shifts and shudder during takeoff are early signs of mechatronic failure. Address with fluid change immediately - continuing to drive accelerates damage exponentially.', upvotes: 0, needsReview: false }
]);

// --- audi-tt-cam-follower-2008 ---
updateIssue('audi-tt-cam-follower-2008', [
  { type: 'part', content: 'INA cam follower 06H109311B is the OEM part for EA888 Gen2 TT. Inspect every 20,000 miles - if the DLC coating is worn through, replace immediately to prevent camshaft damage.', partBrand: 'INA', partName: 'HPFP Cam Follower', partNumber: '06H109311B', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Updated roller-style cam follower 06L109311 for Gen3 engines does not need preemptive replacement but should still be inspected during HPFP service.', partBrand: 'Genuine VW/Audi', partName: 'Roller Cam Follower (Gen3)', partNumber: '06L109311', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Cam follower inspection is a 20-minute DIY job. Remove the HPFP (3 bolts) and visually inspect the follower surface. No special tools needed. Check at every oil change.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'A worn-through cam follower destroys the HPFP cam lobe ($1,500+ camshaft replacement) and can send metal debris into the fuel system. Cheap insurance to inspect regularly.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace fuel pressure sensor 06J906051D (Bosch) during any HPFP or cam follower service for $25-40 from ECS Tuning or FCP Euro.', partBrand: 'Bosch', partName: 'Fuel Pressure Sensor', partNumber: '06J906051D', upvotes: 0, needsReview: false }
]);

// --- audi-tt-tail-light-corrosion-2008 ---
updateIssue('audi-tt-tail-light-corrosion-2008', [
  { type: 'tip', content: 'Clean corroded connector pins with electrical contact cleaner (CRC QD or DeoxIT D5) and fine sandpaper. Apply dielectric grease to prevent re-corrosion.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'CRC QD Electronic Cleaner is the preferred contact cleaner on Audizine and TT Forum. DeoxIT D5 is the premium choice for severe corrosion.', partBrand: 'CRC', partName: 'QD Electronic Cleaner', upvotes: 0, needsReview: false },
  { type: 'part', content: 'If connector is too corroded, OEM replacement pigtails are available from ECS Tuning. Replacement tail light assemblies are $200-$400 each for OEM.', partBrand: 'Genuine VW/Audi', partName: 'Tail Light Assembly (Mk2 TT)', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Apply dielectric grease (Permatex 22058) to all tail light connectors as preventive maintenance. Re-apply annually, especially in salt-belt states.', upvotes: 0, needsReview: false }
]);

// --- audi-a6-oil-consumption-2005 ---
updateIssue('audi-a6-oil-consumption-2005', [
  { type: 'part', content: 'For 2.0T TFSI A6 models with severe oil consumption, revised pistons with "Big Wave" oil control rings are the definitive fix.', partBrand: 'Kolbenschmidt', partName: 'Revised Piston Set', partNumber: '06H107065DD', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Stage 1 PCV fix: Dorman 917-064 diaphragm repair kit ($25-35). Try this before committing to $4,000-$7,000 piston replacement.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Class action settlement may cover your 2012-2014 A6 2.0T for piston replacement. Contact Audi dealer with your VIN to check eligibility.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Monitor oil level weekly. Running 2+ quarts low can damage turbo bearings and catalytic converter. Keep a quart of VW 502.00 spec oil in the trunk.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use Liqui Moly Molygen 5W-40 (VW 502.00 approved) with 5,000-mile change intervals. Some owners report reduced consumption with heavier oil but this is not a cure.', upvotes: 0, needsReview: false }
]);

// --- audi-a6-water-pump-failure-2005 ---
updateIssue('audi-a6-water-pump-failure-2005', [
  { type: 'part', content: 'For 2.0T A6 models, use latest OEM thermostat housing revision 06L121111P. For 3.0T/3.2 models, use OEM water pump - Wahler is the OEM manufacturer.', partBrand: 'Genuine VW/Audi', partName: 'Water Pump/Thermostat Assembly', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Hepu is a reliable German OEM-supplier alternative for 2.0T models. Graf pumps should be avoided - community reports of leaking from installation.', partBrand: 'Hepu', partName: 'Water Pump', partNumber: 'P672', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace water pump, thermostat, and all associated seals/O-rings together. The heater pipe O-ring (N90365302) is a common source of post-repair leaks.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Coolant loss from a failing water pump can cause rapid overheating and head gasket failure. If temperature gauge rises above normal, stop immediately.', upvotes: 0, needsReview: false }
]);

// --- audi-a6-pcv-valve-failure-2012 ---
updateIssue('audi-a6-pcv-valve-failure-2012', [
  { type: 'part', content: 'Budget fix: Dorman 917-064 PCV diaphragm repair kit replaces just the failed diaphragm for $25-35. Some Audizine members report it becoming brittle within 6 months, others report years of service.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Permanent fix: OEM complete valve cover assembly with integrated PCV (06H103495AH). More expensive ($300-$500) but eliminates the failure point entirely.', partBrand: 'Genuine VW/Audi', partName: 'Valve Cover with PCV Assembly', partNumber: '06H103495AH', upvotes: 0, needsReview: false },
  { type: 'part', content: '034 Motorsport Catch Can Kit bypasses the PCV system entirely, eliminating it as a failure point and reducing carbon buildup simultaneously.', partBrand: '034 Motorsport', partName: 'Catch Can Kit', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Symptoms of PCV failure: rough idle, whistling noise from engine bay, oil leaks around valve cover, check engine light. Easy DIY diagnosis by checking for vacuum at the oil cap.', upvotes: 0, needsReview: false }
]);

// ============================================================
// Non-EA888 issues - just clear needsReview on existing recs
// ============================================================

clearNeedsReview('audi-s5-supercharger-clutch-2010');
clearNeedsReview('audi-a6-timing-chain-tensioner-2005');
clearNeedsReview('audi-a6-multitronic-cvt-failure-2005');
clearNeedsReview('audi-a6-s-tronic-dsg-issues-2012');
clearNeedsReview('audi-a6-carbon-buildup-2011');
clearNeedsReview('audi-a6-gateway-module-liquid-2019');
clearNeedsReview('audi-a6-electrical-issues-2005');

// ============================================================
// Write updated data back to file
// ============================================================
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('\nDone! Updated known-issues.json with deep-researched Audi batch 1 recommendations.');
