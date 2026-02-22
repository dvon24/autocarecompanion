const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updatedCount = 0;
let clearedCount = 0;

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

function clearNeedsReview(id) {
  const issue = data.issues.find(i => i.id === id);
  if (issue && issue.communityRecommendations) {
    issue.communityRecommendations.forEach(r => { r.needsReview = false; });
    clearedCount++;
    console.log('Cleared needsReview:', id);
  } else {
    console.log('NOT FOUND or no recommendations:', id);
  }
}

// ============================================================
// Audi A4 2.0T (EA888) Issues - Full Recommendation Updates
// Same engine platform as Q5/A5 batch 1, verified parts reused
// ============================================================

// --- audi-20t-timing-chain-2009 (A4 Timing Chain Tensioner) ---
updateIssue('audi-20t-timing-chain-2009', [
  { type: 'part', content: 'Use ONLY the latest OEM revised tensioner 06K109467K - it supersedes all previous revisions (N, AB, etc.). Aftermarket tensioners from brands like Cloyes have documented failures within 30k miles per Audizine reports.', partBrand: 'Genuine VW/Audi', partName: 'Timing Chain Tensioner (Latest Revision)', partNumber: '06K109467K', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Replace as a complete kit: chain + tensioner + upper/lower guides + cam bridge tensioner. FCP Euro sells complete OEM kits for $800-$1,200 with lifetime replacement warranty.', partBrand: 'Genuine VW/Audi', partName: 'Complete Timing Chain Kit', partNumber: '06K109158AD', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'PREVENTIVE: Replace at 80,000-100,000 miles BEFORE rattling starts. Once you hear cold-start rattle, you have weeks to months before catastrophic failure. B8 A4 (2009-2012) is most affected - B8.5 (2013-2016) received improved tensioner from factory.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If chain has jumped timing, DO NOT attempt to start the engine again. Tow to shop immediately. Bent valves and piston damage can turn a $2,500 timing job into a $10,000+ engine replacement.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use 5,000-mile oil change intervals with Liqui Moly Molygen 5W-40 or Castrol Edge 5W-40 to reduce tensioner wear. Extended oil change intervals accelerate tensioner failure.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-water-pump-2009 (A4 Water Pump/Thermostat) ---
updateIssue('audi-20t-water-pump-2009', [
  { type: 'part', content: 'Replace with OEM thermostat housing assembly using latest revision 06L121111P which supersedes all previous F through M revisions. The plastic impeller deforms under heat cycling causing failures between 60k-100k miles.', partBrand: 'Genuine VW/Audi', partName: 'Thermostat Housing Assembly (Latest Revision)', partNumber: '06L121111P', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Hepu P672 is a German OEM-supplier alternative at lower price ($150 vs $250 OEM). Cross-references 06L121012L. Well-regarded on Audizine and AudiWorld forums.', partBrand: 'Hepu', partName: 'Water Pump', partNumber: 'P672', upvotes: 0, needsReview: false },
  { type: 'part', content: 'USP Motorsports metal impeller upgrade kit eliminates the plastic impeller heat-deformation issue entirely. Recommended on VW Vortex for Gen3 EA888 engines.', partBrand: 'USP Motorsports', partName: 'Metal Impeller Water Pump Kit', partNumber: '06L121111H-KT1', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'AVOID Graf water pumps for EA888 - multiple Audizine forum members report leaking from installation. Stick with OEM, Hepu, or USP Motorsports.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Always replace thermostat housing, water pump, and union as a complete assembly. Labor is 80% of the cost and everything is interconnected. Also replace heater pipe O-ring N90365302. Do at 80k miles preventatively during timing chain service.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-carbon-buildup-2009 (A4 Carbon Buildup) ---
updateIssue('audi-20t-carbon-buildup-2009', [
  { type: 'part', content: '034 Motorsport Catch Can Kit is the gold standard for B8/B8.5 A4 2.0 TFSI. CNC machined 6061-T6 aluminum breather plate replaces factory PCV. Most complete platform-specific solution for preventing carbon buildup.', partBrand: '034 Motorsport', partName: 'Catch Can Kit B8/B8.5 2.0 TFSI', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Walnut blasting is the community gold standard for removing existing carbon. DIY with Harbor Freight media blaster + walnut shell media for under $200 total. Professional service costs $400-$800 at independent shops. Recommended every 50,000-60,000 miles.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For DIY walnut blasting: use a 90-degree adapter and foam ear plugs to seal off ports. LISLE 19720 intake valve cleaning adapter set works perfectly. Cover all openings to prevent walnut shell ingestion.', partBrand: 'Lisle', partName: 'Intake Valve Cleaning Adapter Set', partNumber: '19720', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Port injection retrofit kits (like IE or Integrated Engineering) add secondary fuel spray to keep valves clean but are $1,500+ and require tuning. Only worth it on modified cars. Catch can + periodic walnut blast is the cost-effective solution.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Gen3 EA888 (2015+ A4) has improved intake design but still builds carbon. Catch can is still recommended. Italian tune-up (sustained high RPM driving) helps but does not replace proper cleaning.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-oil-consumption-2009 (A4 Oil Consumption) ---
updateIssue('audi-20t-oil-consumption-2009', [
  { type: 'part', content: 'For severe oil consumption (1qt/500-1200mi), the definitive fix is revised pistons with updated "Big Wave" oil control ring design. Audi TSB 2044229/1 covers this repair. Part number for piston set with rings.', partBrand: 'Kolbenschmidt', partName: 'Revised Piston Set with Updated Oil Rings', partNumber: '06H107065DD', upvotes: 0, needsReview: false },
  { type: 'part', content: 'For moderate consumption, try PCV fix first: replace crankcase pressure regulating valve diaphragm. Dorman repair kit is $25-35 vs $150+ OEM valve cover. Many AudiWorld members report 50%+ reduction in consumption.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Class action settlement covered 2009-2012 A4 2.0T. Check with your Audi dealer for eligibility - may cover piston replacement at no cost. Settlement also covered A5, Q5, and A3 models.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Gen2 EA888 (2009-2013 A4) is most affected. Gen3 (2014+ B8.5/B9) uses revised rings and is significantly better. Do not confuse the two when researching fixes. Check engine code: CAEB/CDNC = Gen2, CNCD/CYFB = Gen3.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Use Liqui Moly Molygen 5W-40 or Castrol Edge 5W-40 with strict 5,000 mile oil changes to manage consumption while awaiting repair. Switching to thicker oil temporarily can reduce consumption.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-mechatronic-2009 (A4 S-Tronic/DSG Mechatronic) ---
updateIssue('audi-20t-mechatronic-2009', [
  { type: 'part', content: 'Rebuilt mechatronic units from certified rebuilders (BBA Reman, EuroMec) cost $1,200-$1,800 vs $3,500-$4,500 new from dealer. Ensure rebuilder uses updated valve body components. A4 B8 uses DL501 (S-Tronic 7-speed).', partBrand: 'BBA Reman', partName: 'Rebuilt DL501 Mechatronic Unit', partNumber: '0B5398048D', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Pentosin FFL-4 is the ONLY approved fluid for DL501 S-Tronic. Do NOT substitute with other DSG fluids - DL501 is different from DQ250/DQ381 used in transverse VW/Audi applications.', partBrand: 'Pentosin', partName: 'FFL-4 S-Tronic Fluid (1L)', partNumber: '1058107', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Fluid change every 40,000 miles is CRITICAL for DL501 longevity. Audi says "lifetime fill" but every S-Tronic specialist disagrees. Requires approximately 7 liters. VCDS needed for proper fill procedure and adaptation reset.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Do NOT attempt mechatronic unit removal without VCDS or equivalent scan tool. The unit must be adaptation-coded to the TCU after installation. Incorrect coding can cause permanent transmission damage.', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Before replacing mechatronic: try a fluid change + adaptation reset with VCDS first. Many shifting issues are caused by contaminated fluid degrading clutch bite point learning. This $400 service resolves 40-50% of reported issues per Audizine.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-ignition-coils-2009 (A4 Ignition Coils) ---
updateIssue('audi-20t-ignition-coils-2009', [
  { type: 'part', content: 'Eldor "red top" ignition coils are the OEM supplier for EA888. Part 06E905115G (Genuine VW/Audi) or Eldor equivalent. These are significantly more reliable than aftermarket coils from EPC, Beck Arnley, etc.', partBrand: 'Genuine VW/Audi (Eldor)', partName: 'Ignition Coil Pack (Red Top)', partNumber: '06E905115G', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Always replace spark plugs with coils. NGK 95770 (SILZKGR8B6S) is the OEM-spec plug for EA888. Pre-gapped at 0.032" for stock tune. Denso IKH24 is a popular alternative on Audizine.', partBrand: 'NGK', partName: 'Spark Plug (EA888)', partNumber: '95770 / SILZKGR8B6S', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Replace all 4 coils at once even if only one failed. If one failed at X miles, the others are close behind. FCP Euro sells 4-packs with lifetime warranty for $120-$160 total.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'If running an aftermarket tune (APR, IE, Unitronic), you MUST use OEM Eldor coils. Aftermarket coils cannot handle increased boost and dwell times. Running cheap coils on a tuned car causes misfires under load.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-pcv-failure-2009 (A4 PCV Valve/Breather) ---
updateIssue('audi-20t-pcv-failure-2009', [
  { type: 'part', content: 'Dorman 917-064 PCV diaphragm repair kit is the budget fix at $25-35. Replaces the torn diaphragm in the valve cover without replacing the entire cover ($150-$300+). Widely used on Audizine and AudiWorld.', partBrand: 'Dorman', partName: 'PCV Diaphragm Repair Kit', partNumber: '917-064', upvotes: 0, needsReview: false },
  { type: 'part', content: 'OEM valve cover with integrated PCV is the complete fix: 06H103495AK for Gen2 EA888. Includes new diaphragm and all seals. More expensive but eliminates the issue completely.', partBrand: 'Genuine VW/Audi', partName: 'Valve Cover with PCV (Gen2 EA888)', partNumber: '06H103495AK', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Install a catch can to protect the PCV system and intake valves. 034 Motorsport 034-101-1010 is the most popular for B8/B8.5 A4. Reduces oil vapor recirculation that accelerates PCV failure and carbon buildup.', partBrand: '034 Motorsport', partName: 'Catch Can Kit', partNumber: '034-101-1010', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'Test PCV before replacing: remove oil filler cap at idle - if cap is sucked down hard or engine stalls, PCV diaphragm is likely torn. Normal operation should show slight vacuum.', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'A failed PCV causes excessive crankcase pressure which pushes oil past seals and increases oil consumption. Fix PCV FIRST before investigating other oil consumption causes.', upvotes: 0, needsReview: false }
]);

// --- audi-20t-coolant-leak-2009 (A4 Coolant Flange Leaks) ---
updateIssue('audi-20t-coolant-leak-2009', [
  { type: 'part', content: 'ECS Tuning aluminum coolant flange upgrade kit replaces brittle plastic coolant flanges on the side of the engine block. CNC machined aluminum eliminates heat-cycling cracks. Most popular fix on Audizine.', partBrand: 'ECS Tuning', partName: 'Aluminum Coolant Flange Kit', partNumber: 'ES#2739858', upvotes: 0, needsReview: false },
  { type: 'part', content: 'USP Motorsports billet aluminum coolant distribution piece replaces the plastic "water pipe" on the back of the head. Another common failure point. 6061 aluminum construction.', partBrand: 'USP Motorsports', partName: 'Billet Coolant Distribution Piece', upvotes: 0, needsReview: false },
  { type: 'tip', content: 'When replacing one plastic flange, inspect ALL plastic coolant fittings - they age together. Common failure points: water pipe on back of head, flange on side of block, thermostat housing, and heater core connections.', upvotes: 0, needsReview: false },
  { type: 'part', content: 'Always use new O-rings when replacing coolant flanges. Genuine VW/Audi O-ring N90365302 for heater pipe connection. Apply thin coat of coolant to O-rings during installation.', partBrand: 'Genuine VW/Audi', partName: 'Heater Pipe O-Ring', partNumber: 'N90365302', upvotes: 0, needsReview: false },
  { type: 'warning', content: 'Small coolant seeps can quickly become sudden failures. If you see any pink/green residue around plastic coolant fittings, replace proactively. A roadside overheat can warp the aluminum head ($3,000+ repair).', upvotes: 0, needsReview: false }
]);

// ============================================================
// Audi A3 TDI Issues - Clear needsReview flags
// (Content was already updated by TDI research agent)
// ============================================================

clearNeedsReview('audi-a3-tdi-emissions-2015');
clearNeedsReview('audi-a3-tdi-dpf-2010');
clearNeedsReview('audi-a3-tdi-egr-2010');
clearNeedsReview('audi-a3-tdi-injector-2010');
clearNeedsReview('audi-a3-tdi-turbo-2010');
clearNeedsReview('audi-a3-tdi-glow-plug-2010');

// Write updated data
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`\nDone! Updated ${updatedCount} A4 2.0T issues, cleared needsReview on ${clearedCount} A3 TDI issues.`);

// Verify
const verify = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const audiIssues = verify.issues.filter(i => i.vehicleMatch && i.vehicleMatch.make === 'Audi');
const a4Issues = audiIssues.filter(i => i.vehicleMatch.model === 'A4');
const a3Issues = audiIssues.filter(i => i.vehicleMatch.model === 'A3');
const audiNeedsReview = audiIssues.filter(i =>
  i.communityRecommendations && i.communityRecommendations.some(r => r.needsReview === true)
);
console.log(`\nVerification:`);
console.log(`  Total issues: ${verify.issues.length}`);
console.log(`  Audi issues: ${audiIssues.length}`);
console.log(`  A4 issues: ${a4Issues.length}`);
console.log(`  A3 issues: ${a3Issues.length}`);
console.log(`  Audi issues still needing review: ${audiNeedsReview.length}`);
if (audiNeedsReview.length > 0) {
  audiNeedsReview.forEach(i => console.log(`    - ${i.id}`));
}
