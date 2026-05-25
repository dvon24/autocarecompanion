const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function findIssue(id) {
  return data.issues.find(i => i.id === id);
}

// 1. Update CTS timing chain - add OEM kit number
const ctsTiming = findIssue('cadillac-cts-timing-chain-2004');
if (ctsTiming) {
  ctsTiming.communityRecommendations.splice(1, 0, {
    type: 'part',
    content: 'GM OEM 12680750 timing chain kit - complete OEM kit with chains, tensioners, guides, bolts, seal. For 2012+ LFX/LGX engines.',
    partBrand: 'GM',
    partName: 'Complete Timing Chain Kit (3.6L OEM)',
    partNumber: '12680750',
    upvotes: 0
  });
}

// 2. Update CTS CUE screen with gel-free option
const ctsCue = findIssue('cadillac-cts-cue-screen-2013');
if (ctsCue) {
  ctsCue.communityRecommendations.splice(1, 0, {
    type: 'part',
    content: 'Cuescreens.com gel-free digitizer replacement - eliminates the root cause (gel layer). No programming needed, screen-only swap.',
    partBrand: 'Cuescreens',
    partName: 'Gel-Free CUE Touch Screen Digitizer',
    upvotes: 0
  });
}

// 3. Update LTG wastegate with ZZPerformance billet
const ctsWastegate = findIssue('cadillac-cts-2.0t-turbo-2013');
if (ctsWastegate) {
  ctsWastegate.communityRecommendations[0].partNumber = '12655189';
  ctsWastegate.communityRecommendations[0].content = 'GM 12655189 PCV valve (inside cam cover) - replace when showing oil consumption symptoms on LTG 2.0T';
  ctsWastegate.communityRecommendations[1] = {
    type: 'part',
    content: 'ZZPerformance billet wastegate actuator - CadillacForums.com top pick for LTG 2.0T wastegate rattle fix',
    partBrand: 'ZZPerformance',
    partName: 'LTG Billet Wastegate Actuator',
    partNumber: 'ZZP-LTG-WG',
    upvotes: 0
  };
}

// 4. Update ATS 2.0T similarly
const atsWastegate = findIssue('cadillac-ats-2.0t-turbo-2013');
if (atsWastegate) {
  atsWastegate.communityRecommendations[0].partNumber = '12655189';
  atsWastegate.communityRecommendations[0].content = 'GM 12655189 PCV valve (inside cam cover) for LTG 2.0T';
  atsWastegate.communityRecommendations[1] = {
    type: 'part',
    content: 'ZZPerformance billet wastegate actuator - eliminates LTG wastegate rattle permanently',
    partBrand: 'ZZPerformance',
    partName: 'LTG Billet Wastegate Actuator',
    partNumber: 'ZZP-LTG-WG',
    upvotes: 0
  };
}

// 5. Update CTS rear diff fluid with correct GM number
const ctsDiff = findIssue('cadillac-cts-rear-diff-2008');
if (ctsDiff) {
  ctsDiff.communityRecommendations[0] = {
    type: 'part',
    content: 'ACDelco Dexron LS Gear Oil 75W-90 (88862624) - synthetic, friction modifier included, no additional additive needed',
    partBrand: 'ACDelco',
    partName: 'Dexron LS Gear Oil 75W-90',
    partNumber: '88862624',
    upvotes: 0
  };
}

// 6. Update DeVille Northstar head gasket - Northstar Performance SureGrip SG102
const devilleHead = findIssue('cadillac-deville-northstar-head-gasket-1994');
if (devilleHead) {
  devilleHead.communityRecommendations[0] = {
    type: 'part',
    content: 'Northstar Performance SureGrip SG102 head stud kit - community top pick. 20 stainless studs, nuts, washers, drill/tap fixtures. Permanent fix.',
    partBrand: 'Northstar Performance',
    partName: 'SureGrip Head Stud Kit',
    partNumber: 'SG102',
    upvotes: 0
  };
  devilleHead.communityRecommendations[1] = {
    type: 'part',
    content: 'TIME-SERT J-42385-500 head bolt thread repair kit (M11x1.5) - GM-authorized repair for 1995-1999 Northstar. 10 inserts per kit, need 2 kits.',
    partBrand: 'TIME-SERT',
    partName: 'Head Bolt Thread Repair Kit (Northstar)',
    partNumber: 'J-42385-500',
    upvotes: 0
  };
  devilleHead.communityRecommendations[2] = {
    type: 'part',
    content: 'Fel-Pro HS 26150 PT-1 head gasket set - for 1995-1999 Northstar 4.6L DOHC. Steel core, no-retorque design.',
    partBrand: 'Fel-Pro',
    partName: 'Head Gasket Set (Northstar 4.6L)',
    partNumber: 'HS 26150 PT-1',
    upvotes: 0
  };
}

// 7. Update DTS head gasket
const dtsHead = findIssue('cadillac-dts-northstar-head-gasket-2006');
if (dtsHead) {
  dtsHead.communityRecommendations[0] = {
    type: 'part',
    content: 'Northstar Performance SureGrip SG102 head stud kit - permanent fix for all Northstar engines including DTS',
    partBrand: 'Northstar Performance',
    partName: 'SureGrip Head Stud Kit',
    partNumber: 'SG102',
    upvotes: 0
  };
  dtsHead.communityRecommendations[1] = {
    type: 'part',
    content: 'TIME-SERT J-42385-2030 thread repair kit (M11x2.0) - for 2004+ Northstar engines with updated thread pitch',
    partBrand: 'TIME-SERT',
    partName: 'Head Bolt Thread Repair Kit (2004+ Northstar)',
    partNumber: 'J-42385-2030',
    upvotes: 0
  };
}

// 8. Update Seville head gasket
const sevilleHead = findIssue('cadillac-seville-northstar-head-gasket-1998');
if (sevilleHead) {
  sevilleHead.communityRecommendations[0] = {
    type: 'part',
    content: 'Northstar Performance SureGrip SG102 head stud kit - permanent fix, covers Seville SLS/STS 1998-2004',
    partBrand: 'Northstar Performance',
    partName: 'SureGrip Head Stud Kit',
    partNumber: 'SG102',
    upvotes: 0
  };
}

// 9. Update Eldorado head gasket
const eldoHead = findIssue('cadillac-eldorado-northstar-head-gasket-1993');
if (eldoHead) {
  eldoHead.communityRecommendations[0] = {
    type: 'part',
    content: 'Northstar Performance SureGrip SG102 head stud kit - permanent fix, covers Eldorado 1993-2002',
    partBrand: 'Northstar Performance',
    partName: 'SureGrip Head Stud Kit',
    partNumber: 'SG102',
    upvotes: 0
  };
}

// 10. Update Northstar oil consumption with valve cover gasket part
const northstarOil = findIssue('cadillac-northstar-oil-consumption-1994');
if (northstarOil) {
  northstarOil.communityRecommendations.splice(1, 0, {
    type: 'part',
    content: 'Fel-Pro VS50607R valve cover gasket set - OE-quality replacement with grommets for Northstar external oil leaks',
    partBrand: 'Fel-Pro',
    partName: 'Valve Cover Gasket Set (Northstar)',
    partNumber: 'VS50607R',
    upvotes: 0
  });
}

// 11. Update XTS water pump with correct number
const xtsChain = findIssue('cadillac-xts-timing-chain-2013');
if (xtsChain) {
  xtsChain.communityRecommendations[1] = {
    type: 'part',
    content: 'GM 12657499 water pump (OEM) or ACDelco 252-962 - chain-driven, replace during timing chain job',
    partBrand: 'GM/ACDelco',
    partName: 'Water Pump (3.6L V6)',
    partNumber: '12657499',
    upvotes: 0
  };
}

// 12. Update CTS-V supercharger coupler with Metco LSA0001
const ctsvCoupler = findIssue('cadillac-ctsv-supercharger-coupler-2009');
if (ctsvCoupler) {
  ctsvCoupler.communityRecommendations[0] = {
    type: 'part',
    content: 'Metco Motorsports LSA0001 solid supercharger isolator - CTS-VNet top pick. Precision-machined thermoplastic, eliminates spring failure.',
    partBrand: 'Metco Motorsports',
    partName: 'Solid Supercharger Isolator (LSA)',
    partNumber: 'LSA0001',
    upvotes: 0
  };
  ctsvCoupler.communityRecommendations[1].partNumber = 'L960202012';
  ctsvCoupler.communityRecommendations[1].content = 'GM/Eaton OEM isolator coupler L960202012 - factory rubber coupler, correct OEM replacement';
}

// 13. Update CTS-V diff with Creative Steel 8.8 swap
const ctsvDiff = findIssue('cadillac-ctsv-diff-2009');
if (ctsvDiff) {
  ctsvDiff.communityRecommendations[0] = {
    type: 'part',
    content: 'Creative Steel 8.8 rear differential swap kit - 100% bolt-in Ford 8.8 diff upgrade for 2009-2015 CTS-V',
    partBrand: 'Creative Steel',
    partName: '8.8 Rear Differential Swap Kit (CTS-V)',
    upvotes: 0
  };
  ctsvDiff.communityRecommendations.splice(1, 0, {
    type: 'part',
    content: 'Wavetrac 56-309-186wk LSD carrier - gear-based ATB design, strongest option for Creative Steel 8.8 swap',
    partBrand: 'Wavetrac',
    partName: 'ATB LSD Carrier',
    partNumber: '56-309-186wk',
    upvotes: 0
  });
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Updated CTS/ATS/Northstar/CTS-V issues with research-verified part numbers');
console.log('Total issues: ' + data.issues.length);

// Verify no needsReview
const cadillac = data.issues.filter(i => (i.make || (i.vehicleMatch && i.vehicleMatch.make)) === 'Cadillac');
const needsReview = cadillac.filter(i => i.communityRecommendations && i.communityRecommendations.some(r => r.needsReview));
console.log('Cadillac issues: ' + cadillac.length);
console.log('Needing review: ' + needsReview.length);
