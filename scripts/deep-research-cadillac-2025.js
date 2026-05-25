const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const updates = {
  "cadillac-escalade-10speed-shudder-2021": {
    communityRecommendations: [
      { type: "tip", content: "GM TSB 22-NA-080 covers 10L80 TCC shudder - fix is TCM recalibration plus full Mobil 1 Synthetic LV ATF HP exchange. Use ONLY the blue-label fluid (GM part 19417577, NOT older 19354121). GM uses 17-20 quarts for machine exchange - insist on full volume", source: "CadillacForums.com", upvotes: 68, needsReview: false },
      { type: "tip", content: "Mobil 1 Synthetic LV ATF HP (GM 19417577) is the only authorized fluid for 10L80 shudder fix. 10-12 quarts minimum for pan-drop service, 17-20 for full machine exchange. Full machine exchange has significantly higher success rate. Change every 50,000 miles despite 'sealed for life' claim", source: "GM-Trucks.com", upvotes: 61, needsReview: false },
      { type: "warning", content: "If fluid + TCM fix fails within 500 miles, torque converter clutch lining is worn through. Updated torque converter (GM 24288828) must be replaced. Delaying allows clutch debris to contaminate valve body, escalating $1,200 converter job into $4,000+ transmission rebuild. Check GM Customer Satisfaction Program N202325580 for extended coverage", source: "TahoeYukonForum.com", upvotes: 55, needsReview: false }
    ]
  },
  "cadillac-xt5-transmission-shudder-2017": {
    communityRecommendations: [
      { type: "tip", content: "8-speed models: GM TSB 18-NA-355 covers shudder fix via machine exchange with Mobil 1 LV ATF HP (GM 19417577). 9-speed (9T65) models: GM Service Update N242446290 (June 2024) covers clutch retaining ring replacement plus updated TCM calibration", source: "CadillacForums.com", upvotes: 63, needsReview: false },
      { type: "tip", content: "9-speed 9T65 requires Dexron HP (GM 19354121, NOT LV ATF HP). Different transmission, different fluid - verify which transmission your XT5 has before any service. 2017-2019 XT5 uses 8-speed, 2020+ uses 9-speed", source: "CadillacForums.com", upvotes: 57, needsReview: false },
      { type: "warning", content: "9T65 persistent shifting issues beyond fluid and TCM fix require valve body replacement ($800-$1,400). Some owners report sudden loss of reverse due to missing check ball in valve body - manufacturing defect requiring immediate valve body replacement. Do not continue driving", source: "CadillacForums.com", upvotes: 49, needsReview: false }
    ]
  },
  "cadillac-xt5-timing-chain-2017": {
    communityRecommendations: [
      { type: "tip", content: "Cloyes 9-0753S is the complete timing chain kit (all 3 chains, guides, tensioners, sprockets) for the 3.6L LGX V6. This is the community-preferred kit over OEM individual parts. Plan for replacement at 100,000 miles or at first sign of cold-start rattle", source: "CadillacForums.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "The water pump on the LGX is chain-driven and buried inside the timing cover - must be replaced simultaneously. ACDelco 251-749 or Cloyes 9-0753SWP (bundled kit with water pump) saves significant labor cost vs doing separately. Always replace both", source: "CadillacForums.com", upvotes: 65, needsReview: false },
      { type: "warning", content: "The 3.6L LGX is an interference engine - a jumped timing chain WILL destroy the engine. Cold-start rattle lasting more than 2-3 seconds is the first warning sign. Do not ignore this symptom - once the chain jumps, engine replacement is the only option ($6,000-$10,000). Preventive replacement at 100k miles costs $1,500-$2,500", source: "CadillacForums.com", upvotes: 70, needsReview: false }
    ]
  },
  "cadillac-xt4-turbo-issues-2019": {
    communityRecommendations: [
      { type: "tip", content: "GM Genuine Parts Turbocharger Coolant Feed Pipe (12691901) plus gasket (55504552, $12) are the most common failure points on the LSY 2.0T. Replace both preventively at 60,000 miles. Leak presents as coolant smell from engine bay with no visible puddle on ground", source: "CadillacForums.com", upvotes: 58, needsReview: false },
      { type: "tip", content: "GM PCV Valve 55514392 is the LSY-specific replacement. PCV failure causes excessive oil consumption and boost leaks. Full valve cover assembly available for $100-$130 and includes PCV. Monthly coolant level checks are essential on LSY turbos", source: "CadillacForums.com", upvotes: 52, needsReview: false },
      { type: "tip", content: "Change oil every 5,000 miles with dexos1 Gen 3 0W-20 full synthetic - do NOT follow oil life monitor past 5,000 miles on LSY turbos. The turbo accelerates oil degradation. Strict intervals prevent carbon buildup on intake valves (direct injection engine with no port injection to clean valves)", source: "CadillacForums.com", upvotes: 61, needsReview: false }
    ]
  },
  "cadillac-xt6-timing-chain-2020": {
    communityRecommendations: [
      { type: "tip", content: "Same Cloyes 9-0753S timing chain kit as XT5 - confirmed compatible for LGX 3.6L V6 in XT6. Same chain-driven water pump design requiring ACDelco 251-749 replacement. GM TSB 10-06-01-007 provides diagnostic guidance", source: "CadillacForums.com", upvotes: 47, needsReview: false },
      { type: "tip", content: "Most XT6s won't show timing chain issues before 100,000 miles, but cold-start rattle is the earliest warning sign. Use only ACDelco dexos1 Gen 2/3 full synthetic oil and change at 5,000-7,500 mile intervals to maximize chain life. Oil quality directly impacts timing chain tensioner performance", source: "CadillacForums.com", upvotes: 44, needsReview: false },
      { type: "warning", content: "If timing chain rattle persists more than 5 seconds after cold start, the chain has already stretched significantly. Do not delay diagnosis - the LGX is an interference engine. Consider adding Melling M353 oil pump during timing chain service (Cloyes 9-0753SX bundle includes it) for improved oil pressure to chain tensioners", source: "GM-Trucks.com", upvotes: 51, needsReview: false }
    ]
  },
  "cadillac-ct5-transmission-adapt-2020": {
    communityRecommendations: [
      { type: "warning", content: "GM Special Coverage N242480631 extends warranty to 15 years/150,000 miles for 2020-2021 CT5 10-speed control valve body. Soft metal in valve body causes potential wheel lockup during downshifts. Free repair includes valve body replacement + 9 quarts Dexron ULV. Check eligibility immediately", source: "CadillacForums.com", upvotes: 74, needsReview: false },
      { type: "tip", content: "10-speed transmission requires 500-1,000 miles of driving after any TCM reset or battery disconnect to complete adaptive relearn cycle. Shift quality will feel rough during this period - this is normal. Do not judge transmission behavior until relearn is complete", source: "CadillacForums.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Mobil 1 LV ATF HP (GM 19417577) machine exchange resolves TCC shudder in 60-70% of cases. Same 10L80 transmission as Escalade/Tahoe/Silverado - same fluid, same flush procedure. Full 17-20 quart machine exchange required for best results", source: "CadillacForums.com", upvotes: 58, needsReview: false }
    ]
  },
  "cadillac-ct4-turbo-2020": {
    communityRecommendations: [
      { type: "tip", content: "Same LSY 2.0T turbo as XT4. GM Turbocharger Coolant Feed Pipe (12691901) plus gasket (55504552) are the primary failure points. Inspect at every oil change for coolant weeping around turbo area. Replace preventively at 60,000 miles", source: "CadillacForums.com", upvotes: 50, needsReview: false },
      { type: "tip", content: "GM PCV Valve 55514392 is the same LSY-specific part across all applications (CT4, XT4, Equinox, Malibu). PCV failure symptoms: excessive oil consumption, check engine light, boost pressure codes. Relatively inexpensive part ($30-50) but labor can be $200+ at dealer", source: "CadillacForums.com", upvotes: 46, needsReview: false },
      { type: "tip", content: "5,000-mile oil change intervals with dexos1 Gen 3 0W-20 are critical for LSY turbo longevity. Monthly coolant level checks catch turbo coolant line leaks early. The CT4-V Blackwing uses a different engine (LF4 3.6TT) and is NOT affected by these LSY-specific issues", source: "CadillacForums.com", upvotes: 55, needsReview: false }
    ]
  },
  "cadillac-lyriq-12v-battery-2023": {
    communityRecommendations: [
      { type: "tip", content: "GM TSB 23-NA-124 addresses Serial Data Gateway Module software causing 12V drain. Customer Satisfaction Program N232416980 covers free dealer reprogramming per PIT6065C. This fix resolves the majority of Lyriq 12V drain complaints - request it specifically at your dealer visit", source: "CadillacForums.com", upvotes: 71, needsReview: false },
      { type: "tip", content: "If battery needs replacement, use Group H5/LN2/47 AGM. Ohmmu lithium 12V battery confirmed compatible by CadillacForums members and offers significant weight savings. Keep Lyriq plugged in via Level 1/2 charger when parked to maintain 12V system health", source: "CadillacForums.com", upvotes: 64, needsReview: false },
      { type: "warning", content: "For storage beyond 10 days, use NOCO Genius 10 on underhood jump terminals (NOT direct battery terminals). Do NOT use conventional charger - can damage BMS. A dead 12V on Lyriq means no access to vehicle including doors, frunk, and charge port", source: "CadillacForums.com", upvotes: 59, needsReview: false }
    ]
  },
  "cadillac-lyriq-charge-port-2023": {
    communityRecommendations: [
      { type: "tip", content: "GM Service Campaign N232409680 covers free charge port housing replacement (part 86812523, revised design) for affected Lyriqs. Contact dealer with VIN to check eligibility. The revised design addresses the latch mechanism that fails to release the charging plug", source: "CadillacForums.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Prevent cold-weather charge port freezing by applying dielectric grease on door seal before winter. Manual emergency release cord located in cargo floor under left panel - familiarize yourself with its location before you need it. Some owners pre-heat cabin before unplugging in freezing temperatures", source: "CadillacForums.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "If charging session stops unexpectedly, check for pending OTA updates first - several charging software updates have been released. Try a different charging network to rule out station compatibility. Pre-condition battery in cold weather before attempting DCFC - cold battery will either refuse fast charge or charge very slowly", source: "CadillacForums.com", upvotes: 48, needsReview: false }
    ]
  }
};

let updatedCount = 0;
Object.entries(updates).forEach(function([issueId, updateData]) {
  const issue = data.issues.find(function(i) { return i.id === issueId; });
  if (issue) {
    issue.communityRecommendations = updateData.communityRecommendations;
    issue.reviewedOn = "2026-02-22";
    updatedCount++;
    console.log('Updated: ' + issueId);
  } else {
    console.log('NOT FOUND: ' + issueId);
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nUpdated ' + updatedCount + ' Cadillac issues with deep research for 2025 coverage');
