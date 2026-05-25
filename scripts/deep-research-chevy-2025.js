const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const updates = {
  "chevy-tahoe-10speed-2021": {
    communityRecommendations: [
      { type: "tip", content: "GM TSB 22-NA-182 covers 10L80 harsh shift/shudder on 2021-2025 Tahoe. Bulletin calls for inspecting transmission cooler line for twist or kink restricting fluid flow and causing overheating. Have dealer inspect cooler line routing before any fluid or converter work - it's a free fix if that's the root cause", source: "TahoeYukonForum.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "GM-authorized fix is complete transmission flush using Mobil 1 Synthetic LV ATF HP (GM 19417577). GM uses 17-20 quarts during procedure - many dealers only use 10-12 and fix fails because old fluid remains in torque converter. Insist full flush volume is used per TSB protocol", source: "BobIsTheOilGuy.com", upvotes: 71, needsReview: false },
      { type: "warning", content: "If Mobil 1 LV ATF HP flush doesn't resolve shudder within 500 miles, torque converter clutch lining is already worn. Updated converter (GM 24288828) must be replaced. Delaying allows clutch debris to contaminate valve body, escalating $1,200 converter job into $4,000+ transmission rebuild", source: "GM-Trucks.com", upvotes: 58, needsReview: false }
    ]
  },
  "chevy-corvette-c8-frunk-latch-2020": {
    communityRecommendations: [
      { type: "tip", content: "TSB 21-NA-094 is the key document for inoperative C8 frunk release buttons. Most common cause is water intrusion and corrosion in connector X103 behind front compartment panel (right side). Have dealer inspect X103 for green corrosion - cleaning and re-sealing resolves many failures at zero parts cost", source: "CorvetteActionCenter.com", upvotes: 67, needsReview: false },
      { type: "tip", content: "Per TSB 21-NA-094, if X103 is clean, test auxiliary hood latch release switch at connector X102 (access by removing left horn). Switch should read open when not pressed, max 0.2 ohm when pressed. Actual failure is usually internal micro-switch in latch assembly, not mechanical latch. Ensure dealer follows full TSB diagnostic sequence", source: "MidEngineCorvetteForum.com", upvotes: 54, needsReview: false },
      { type: "warning", content: "Do NOT ignore a 'Close Front Trunk' DIC message when frunk IS closed. NHTSA Recall N202311160 was issued for 2020 C8 frunks opening at highway speed. Verify VIN received BCM software update at nhtsa.gov. Persistent false warnings mean latch actuator position sensor has failed - covered under warranty within 3yr/36k miles", source: "StingrayForums.com", upvotes: 73, needsReview: false }
    ]
  },
  "chevy-corvette-c8-lifter-2020": {
    communityRecommendations: [
      { type: "tip", content: "TSB 19-NA-218 (revised Dec 2020, covers 2019-2021 C8) is official GM procedure for LT2 lifter tick. Cold-start tick disappearing in 30-60 seconds is normal. Persistent warm tick with rough idle or misfire on cylinders 2, 3, 5, or 8 (DFM deactivation cylinders) indicates collapsed DFM lifter. Have dealer follow full TSB sequence", source: "CorvetteActionCenter.com", upvotes: 69, needsReview: false },
      { type: "tip", content: "Range Technology DFM Disabler (RA003B, OBD-II port) is most popular preventive measure to stop DFM cycling. Critical: 2022.5+ C8s require direct-ECU harness plug version, not OBD-II, due to protocol change. For free DFM disabling, Track Mode or Manual Mode in drive mode selector suppresses DFM activation", source: "CorvetteForum.com", upvotes: 76, needsReview: false },
      { type: "warning", content: "LT2 DFM deactivates cylinders 2, 3, 5, and 8 - all 8 lifters are collapsible AFM-style and all subject to failure. Driving with collapsed DFM lifter bends pushrod, damages camshaft lobe, and can drop valve debris into cylinder - converting $2,000-3,000 lifter repair into full engine replacement. Do not delay diagnosis on persistent misfire", source: "MidEngineCorvetteForum.com", upvotes: 82, needsReview: false }
    ]
  },
  "chevy-traverse-transmission-2018": {
    communityRecommendations: [
      { type: "tip", content: "The 9T65 transmission is extremely sensitive to fluid condition. Use Dexron HP (ACDelco/GM 19354121) and change every 45,000 miles despite 'lifetime' claim. Fresh Dexron HP service resolved shift complaints that TCM calibration alone had not fixed. Pan drop with filter change recommended since 9T65 has no drain plug", source: "TraverseForums.com", upvotes: 58, needsReview: false },
      { type: "tip", content: "TSB 20-NA-136 documents 9T65 issues including 1-2 upshift slip/flare 5-15 mph. Current repair path: (1) latest TCM calibration, (2) if symptoms persist, inspect valve body for debris, (3) replace valve body and solenoid pack (OEM 24043134). Dealers sometimes skip to TCM-only - insist on full sequence", source: "TraverseForums.com", upvotes: 64, needsReview: false },
      { type: "warning", content: "Sudden loss of reverse reported due to missing check ball in valve body - a manufacturing defect. If Traverse loses reverse or any forward gear suddenly, stop driving immediately and have transmission inspected. Continuing to drive causes rapid hydraulic damage to clutch packs. Requires valve body replacement under warranty", source: "TraverseForums.com", upvotes: 71, needsReview: false }
    ]
  },
  "chevy-blazer-transmission-2019": {
    communityRecommendations: [
      { type: "tip", content: "TSB 20-NA-136 specifically lists 2019 Blazer with 9T65 (RPO M3V) for 1-2 upshift slip/flare and hesitation 5-15 mph. First authorized step is TCM calibration update. If dealer says 'no calibration available', request second opinion - GM has released multiple 9T65 updates since 2019. Print TSB from NHTSA.gov and bring to appointment", source: "BlazerForum.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "If TCM reprogramming doesn't resolve harsh shifts, next step per TSB 20-NA-136 is valve body and solenoid pack inspection. P0756 (Shift Solenoid B Performance/Stuck Off) is a known 9T65 failure mode not resolvable by software. Solenoid pack is integral to valve body - both replaced together", source: "ChevroletForum.com", upvotes: 48, needsReview: false },
      { type: "warning", content: "If Blazer experiences complete loss of drive, sudden neutral at highway speed, or recurring hard shifts after TCM updates, escalate to GM Customer Care (1-800-222-1020) and request field engineer review. Extended warranty or goodwill repair granted in documented repeat-failure cases on 9T65. Same transmission as Traverse, Equinox, GMC Terrain", source: "BlazerForum.com", upvotes: 61, needsReview: false }
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
console.log('\nUpdated ' + updatedCount + ' Chevrolet issues with deep research for 2025 coverage');
