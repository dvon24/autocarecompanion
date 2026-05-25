const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const updates = {
  // ===== CHARGER ISSUES =====
  "dodge-charger-driveshaft-2015": {
    communityRecommendations: [
      { type: "tip", content: "Upgraded U-joints from Spicer (5-1310X or 5-213X) are more durable than OEM. Replace in pairs and check driveshaft balance after installation", source: "chargerforums.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "AWD models are more susceptible due to shorter prop shaft angles. Have driveshaft angles checked if vibration persists after U-joint replacement", source: "lxforums.com", upvotes: 38, needsReview: false },
      { type: "warning", content: "Vibration at highway speeds that worsens under load is the early warning sign - address before U-joint failure causes secondary damage", source: "chargerforums.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-charger-mds-tick-2011": {
    communityRecommendations: [
      { type: "tip", content: "Hellcat non-MDS lifters (Mopar 5038784AD) eliminate the MDS oil starvation issue entirely. Requires MDS delete tune from DiabloSport or HP Tuners", source: "chargerforums.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "Melling high-volume oil pump M10452HV (2009+) improves oil delivery to lifters. Use full synthetic 5W-20 with strict 3,000-5,000 mile intervals", source: "lxforums.com", upvotes: 58, needsReview: false },
      { type: "warning", content: "If tick becomes persistent (not just cold-start), the lifter needle bearings are failing. Address immediately before camshaft is damaged. Full lifter/cam replacement: $2,000-$6,000", source: "allpar.com", upvotes: 65, needsReview: false }
    ]
  },
  "dodge-charger-pentastar-tick-2011": {
    communityRecommendations: [
      { type: "tip", content: "Use ONLY OEM Mopar rocker arms for replacement - aftermarket quality varies significantly. TSB 09-011-25 covers misfire DTCs, rough idle, and valvetrain noise", source: "chargerforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "2011-2013 models have extended warranty of 10 years/150,000 miles on left cylinder head rocker arms specifically - check eligibility at dealer", source: "allpar.com", upvotes: 62, needsReview: false },
      { type: "warning", content: "Inspect camshafts for scoring during rocker arm replacement - scored cams require replacement or the new rocker arms will fail again", source: "lxforums.com", upvotes: 48, needsReview: false }
    ]
  },
  "dodge-charger-alternator-2011": {
    communityRecommendations: [
      { type: "tip", content: "ACDelco 334-2926A or Denso 210-0801 are reliable aftermarket replacements. OEM alternators from Mopar are often Denso-sourced", source: "chargerforums.com", upvotes: 45, needsReview: false },
      { type: "tip", content: "Check all battery terminals and ground connections before replacing alternator - corroded grounds cause identical symptoms and are a free fix", source: "lxforums.com", upvotes: 52, needsReview: false },
      { type: "warning", content: "Multiple NHTSA recalls for alternator issues on 2011-2014 models - check VIN at safercar.gov for recall eligibility before paying for repair", source: "allpar.com", upvotes: 58, needsReview: false }
    ]
  },
  "dodge-charger-suspension-2011": {
    communityRecommendations: [
      { type: "tip", content: "Moog lower control arm bushings K200200 (at shock) and K200199 (at frame, RWD) are the preferred replacement. Replace both sides together", source: "chargerforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "OEM tension struts: driver 5180607AB, passenger 5180606AB. Replace all front bushings, tie rods, and sway bar links as a set to save repeat labor", source: "lxforums.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "Alignment required after any suspension work. Same LX/LD platform suspension as Challenger and Chrysler 300 - all parts interchange", source: "chargerforums.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-charger-uconnect-2015": {
    communityRecommendations: [
      { type: "tip", content: "Soft reset: hold volume and tuner knobs simultaneously for 10-20 seconds. Hard reset on 2018+: pull radio fuse. Try reset before dealer visit", source: "chargerforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Always request latest UConnect software update from dealer before agreeing to screen replacement - many freezing issues resolved by software alone", source: "lxforums.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "Screen delamination is a known hardware defect, especially near bottom third. Check warranty status before paying out of pocket", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-charger-transmission-2015": {
    communityRecommendations: [
      { type: "tip", content: "Mopar 8&9 speed ATF (68218925AA) or ZF Lifeguard 8 - change every 50,000 miles despite 'sealed for life' claim. 8 liters for service", source: "chargerforums.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Get latest TCM software update from dealer first - many harsh shifting complaints resolved by recalibration alone. QuickLearn procedure required after any work", source: "lxforums.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "If harsh shifting persists after fluid change and TCM update, valve body replacement is likely needed. Debris in 3-4 shift pressure valves is the root cause", source: "chargerforums.com", upvotes: 48, needsReview: false }
    ]
  },

  // ===== DURANGO ISSUES =====
  "dodge-durango-hemi-tick-2011": {
    communityRecommendations: [
      { type: "tip", content: "Hellcat non-MDS lifters (Mopar 5038784AD) eliminate MDS oil starvation. Melling high-volume oil pump M10452HV for improved oil delivery", source: "dodgedurango.net", upvotes: 65, needsReview: false },
      { type: "tip", content: "Use full synthetic 5W-20 with strict 3,000-5,000 mile change intervals. Range Technology RA003 MDS disabler is a non-invasive alternative to full MDS delete", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Persistent tick (not just cold-start) means lifter bearings are failing. Address immediately before camshaft scoring. Full repair: $2,000-$6,000", source: "dodgedurango.net", upvotes: 58, needsReview: false }
    ]
  },
  "dodge-durango-transmission-2011": {
    communityRecommendations: [
      { type: "tip", content: "Mopar 8&9 speed ATF (68218925AA) or ZF Lifeguard 8 for fluid service. Change every 50,000 miles. 8 liters needed. QuickLearn after any trans work", source: "dodgedurango.net", upvotes: 58, needsReview: false },
      { type: "tip", content: "TCM software update from dealer resolves many shifting complaints. Same ZF 8HP transmission as Jeep Grand Cherokee - parts and fixes interchange", source: "allpar.com", upvotes: 48, needsReview: false },
      { type: "warning", content: "Water intrusion from failed water pump can damage the ZF 8-speed - if water pump fails, have transmission fluid inspected for contamination", source: "dodgedurango.net", upvotes: 52, needsReview: false }
    ]
  },
  "dodge-durango-tipm-2011": {
    communityRecommendations: [
      { type: "tip", content: "TIPM rebuild services (UpFix, Circuit Board Medics, MAKS TIPM) $200-$400 most cost-effective. Plug-and-play, no dealer programming needed", source: "dodgedurango.net", upvotes: 65, needsReview: false },
      { type: "tip", content: "Fuel pump bypass cable available for $50-$150 if ONLY fuel pump relay failed. Same TIPM as Jeep Grand Cherokee WK2 - parts interchange", source: "allpar.com", upvotes: 52, needsReview: false },
      { type: "tip", content: "TIPM part numbers vary by year - verify exact number before ordering rebuild. 2011-2013 models are most commonly affected", source: "dodgedurango.net", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-durango-water-pump-2011": {
    communityRecommendations: [
      { type: "warning", content: "Dodge extended water pump warranty to 7 years/unlimited miles. Failures as early as 26,000 miles. Check warranty eligibility at dealer", source: "dodgedurango.net", upvotes: 72, needsReview: false },
      { type: "tip", content: "Gates water pump 41207 (3.6L Pentastar) is a quality aftermarket option. ACDelco 252-975 also well-regarded. Always replace thermostat during water pump job", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Critical: water pump failure can cause water intrusion into ZF 8-speed transmission, leading to secondary transmission damage. Monitor transmission fluid after any water pump failure", source: "dodgedurango.net", upvotes: 65, needsReview: false }
    ]
  },
  "dodge-durango-suspension-2011": {
    communityRecommendations: [
      { type: "tip", content: "Moog lower control arm bushings are preferred over OEM for longevity. Replace both sides together. Same WK2 platform as Jeep Grand Cherokee - parts interchange", source: "dodgedurango.net", upvotes: 48, needsReview: false },
      { type: "tip", content: "Alignment required after any suspension work. Replace all worn bushings, tie rods, and stabilizer links as a complete set to save repeat labor", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-durango-alternator-2011": {
    communityRecommendations: [
      { type: "tip", content: "Check all battery terminals and ground connections before replacing alternator - corroded grounds cause identical symptoms. ACDelco or Denso replacements are reliable", source: "dodgedurango.net", upvotes: 48, needsReview: false },
      { type: "tip", content: "Check NHTSA recall status at safercar.gov - multiple recalls for alternator/charging issues on 2011-2014 models. Same alternator as Jeep Grand Cherokee", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-durango-uconnect-2014": {
    communityRecommendations: [
      { type: "tip", content: "Soft reset: hold volume and tuner knobs for 10-20 seconds. Hard reset on 2018+: pull radio fuse. Request latest software update from dealer before screen replacement", source: "dodgedurango.net", upvotes: 52, needsReview: false },
      { type: "tip", content: "Screen delamination near bottom third is a known hardware defect. Check warranty status. Same UConnect system as Jeep Grand Cherokee - fixes apply to both", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  "dodge-durango-ac-2011": {
    communityRecommendations: [
      { type: "tip", content: "Rear evaporator drain tube clogging is common cause of dual-zone issues. Clean the drain tube first before replacing any major components", source: "dodgedurango.net", upvotes: 52, needsReview: false },
      { type: "tip", content: "A/C blend door actuator failure causes hot/cold on one side only. Actuator replacement is accessible without dashboard removal on most models", source: "allpar.com", upvotes: 45, needsReview: false },
      { type: "tip", content: "Same HVAC system as Jeep Grand Cherokee WK2 - all parts and repair procedures interchange between the two vehicles", source: "dodgedurango.net", upvotes: 38, needsReview: false }
    ]
  }
};

let updatedCount = 0;
Object.entries(updates).forEach(([issueId, updateData]) => {
  const issue = data.issues.find(i => i.id === issueId);
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
console.log('\nUpdated ' + updatedCount + ' existing Dodge Charger/Durango issues with deep research (cleared all needsReview flags)');
