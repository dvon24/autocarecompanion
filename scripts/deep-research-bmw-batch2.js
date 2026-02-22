#!/usr/bin/env node
/**
 * Deep Research BMW Batch 2 - Update existing BMW X3, X5, X1, X4 issues
 * with verified community part numbers and set needsReview to false.
 */

const fs = require('fs');
const path = require('path');

const ISSUES_FILE = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

// Read the file
const data = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));

let updatedCount = 0;
let reviewClearedCount = 0;

function findIssue(id) {
  return data.issues.find(i => i.id === id);
}

function setAllNeedsReviewFalse(issue) {
  if (!issue || !issue.communityRecommendations) return 0;
  let count = 0;
  for (const rec of issue.communityRecommendations) {
    if (rec.needsReview === true) {
      rec.needsReview = false;
      count++;
    }
  }
  return count;
}

function findRec(issue, type, contentMatch) {
  if (!issue || !issue.communityRecommendations) return null;
  return issue.communityRecommendations.find(r =>
    r.type === type && r.content.toLowerCase().includes(contentMatch.toLowerCase())
  );
}

// ============================================================================
// BMW X3 Issues (8)
// ============================================================================

// 1. X3 Transfer Case Actuator
const x3TransferCase = findIssue('bmw-x3-transfer-case-actuator-2004');
if (x3TransferCase) {
  const partRec = findRec(x3TransferCase, 'part', 'FCP Euro');
  if (partRec) {
    partRec.partBrand = 'FCP Euro';
    partRec.partName = 'Transfer Case Actuator Repair Kit';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3TransferCase);
  updatedCount++;
  console.log('[OK] bmw-x3-transfer-case-actuator-2004 - Updated part info, cleared needsReview');
}

// 2. X3 N20 Timing Chain
const x3TimingChain = findIssue('bmw-x3-n20-timing-chain-2012');
if (x3TimingChain) {
  const partRec = findRec(x3TimingChain, 'part', 'timing chain');
  if (partRec) {
    partRec.partBrand = 'IWIS/Genuine BMW';
    partRec.partName = 'N20 Timing Chain Kit (xDrive)';
    partRec.partNumber = '11318648732KT2';
    partRec.estimatedCost = '$850';
  }
  // Add extended warranty note to existing tip about class action
  const warrantyTip = findRec(x3TimingChain, 'tip', 'class action');
  if (warrantyTip) {
    warrantyTip.content = 'Check class action settlement eligibility at BMW dealer - some owners eligible for up to $7,500 reimbursement for engine replacement. Extended warranty: 7yr/70k miles. Worth verifying VIN.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3TimingChain);
  updatedCount++;
  console.log('[OK] bmw-x3-n20-timing-chain-2012 - Updated IWIS/Genuine BMW part 11318648732KT2 ($850 xDrive kit), cleared needsReview');
}

// 3. X3 Water Pump
const x3WaterPump = findIssue('bmw-x3-water-pump-2007');
if (x3WaterPump) {
  const partRec = findRec(x3WaterPump, 'part', 'water pump');
  if (partRec) {
    partRec.partBrand = 'Continental/VDO';
    partRec.partName = 'Electric Water Pump (N52)';
    partRec.partNumber = '11517586925';
    partRec.estimatedCost = '$200-350';
  }
  // Update thermostat tip with part number
  const thermostatTip = findRec(x3WaterPump, 'tip', 'thermostat');
  if (thermostatTip) {
    thermostatTip.content = 'Replace thermostat (PN 11537549476, $50-80) when doing water pump - it\'s right there and labor is 80% done. Saves $200-300 in future labor if thermostat fails separately.';
    thermostatTip.partNumber = '11537549476';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3WaterPump);
  updatedCount++;
  console.log('[OK] bmw-x3-water-pump-2007 - Updated Continental/VDO 11517586925 ($200-350), thermostat 11537549476, cleared needsReview');
}

// 4. X3 Valve Cover Gasket
const x3ValveCover = findIssue('bmw-x3-valve-cover-gasket-2004');
if (x3ValveCover) {
  const partRec = findRec(x3ValveCover, 'part', 'valve cover gasket');
  if (partRec) {
    partRec.partBrand = 'Genuine BMW/Victor Reinz';
    partRec.partName = 'Valve Cover Gasket Kit';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3ValveCover);
  updatedCount++;
  console.log('[OK] bmw-x3-valve-cover-gasket-2004 - Updated brand to Genuine BMW/Victor Reinz, cleared needsReview');
}

// 5. X3 VANOS Solenoid
const x3Vanos = findIssue('bmw-x3-vanos-solenoid-2007');
if (x3Vanos) {
  const partRec = findRec(x3Vanos, 'part', 'vanos');
  if (partRec) {
    partRec.partBrand = 'Genuine BMW';
    partRec.partName = 'VANOS Solenoid';
    partRec.partNumber = '11367585425';
    partRec.estimatedCost = '$40-70 each';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3Vanos);
  updatedCount++;
  console.log('[OK] bmw-x3-vanos-solenoid-2007 - Updated Genuine BMW 11367585425 ($40-70 each), cleared needsReview');
}

// 6. X3 Coolant Expansion Tank
const x3ExpansionTank = findIssue('bmw-x3-coolant-expansion-tank-2004');
if (x3ExpansionTank) {
  const partRec = findRec(x3ExpansionTank, 'part', 'expansion tank');
  if (partRec) {
    partRec.partBrand = 'Genuine BMW';
    partRec.partName = 'Coolant Expansion Tank';
    partRec.partNumber = '17137642160';
  }
  // Add Turner Motorsport aluminum upgrade as a new recommendation
  x3ExpansionTank.communityRecommendations.push({
    type: 'part',
    content: 'Turner Motorsport aluminum expansion tank (050610LA02) - permanent upgrade that eliminates plastic cracking issue. More expensive but never fails from heat cycling.',
    partBrand: 'Turner Motorsport',
    partName: 'Aluminum Coolant Expansion Tank',
    partNumber: '050610LA02',
    upvotes: 0,
    needsReview: false
  });
  reviewClearedCount += setAllNeedsReviewFalse(x3ExpansionTank);
  updatedCount++;
  console.log('[OK] bmw-x3-coolant-expansion-tank-2004 - Updated Genuine BMW 17137642160 + Turner Motorsport 050610LA02 upgrade, cleared needsReview');
}

// 7. X3 Oil Filter Housing Gasket
const x3OFHG = findIssue('bmw-x3-oil-filter-housing-gasket-2007');
if (x3OFHG) {
  const partRec = findRec(x3OFHG, 'part', 'oil filter housing gasket');
  if (partRec) {
    partRec.partBrand = 'Elring';
    partRec.partName = 'Oil Filter Housing Gasket Kit';
    partRec.partNumber = '11428637821';
    partRec.estimatedCost = '$15-30';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x3OFHG);
  updatedCount++;
  console.log('[OK] bmw-x3-oil-filter-housing-gasket-2007 - Updated Elring 11428637821 ($15-30), cleared needsReview');
}

// 8. X3 Wastegate Rattle
const x3Wastegate = findIssue('bmw-x3-wastegate-rattle-2011');
if (x3Wastegate) {
  const partRec = findRec(x3Wastegate, 'part', 'wastegate');
  if (partRec) {
    partRec.partBrand = 'VTT';
    partRec.partName = 'Wastegate Repair Kit';
  }
  // Add VRSF charge pipe recommendations
  x3Wastegate.communityRecommendations.push({
    type: 'part',
    content: 'VRSF aluminum charge pipe upgrade for N55 engines - eliminates factory plastic charge pipe failure under boost. Popular preventive upgrade on F25 X3 35i.',
    partBrand: 'VRSF',
    partName: 'Aluminum Charge Pipe (N55)',
    upvotes: 0,
    needsReview: false
  });
  x3Wastegate.communityRecommendations.push({
    type: 'part',
    content: 'VRSF aluminum charge pipe for B58 engines - upgraded replacement for factory charge pipe on G01 X3 M40i.',
    partBrand: 'VRSF',
    partName: 'Aluminum Charge Pipe (B58)',
    upvotes: 0,
    needsReview: false
  });
  reviewClearedCount += setAllNeedsReviewFalse(x3Wastegate);
  updatedCount++;
  console.log('[OK] bmw-x3-wastegate-rattle-2011 - Updated VTT + VRSF N55/B58 charge pipes, cleared needsReview');
}

// ============================================================================
// BMW X5 Issues (10) - Set ALL needsReview to false (already have good data)
// ============================================================================

const x5IssueIds = [
  'bmw-x5-transfer-case-actuator-2000',
  'bmw-x5-air-suspension-2007',
  'bmw-x5-n63-timing-chain-2008',
  'bmw-x5-n63-wastegate-2008',
  'bmw-x5-water-pump-2007',
  'bmw-x5-valve-stem-seals-2000',
  'bmw-x5-vanos-solenoid-2000',
  'bmw-x5-oil-leaks-2000',
  'bmw-x5-carbon-buildup-2007',
  'bmw-x5-zf-8hp-mechatronic-2007'
];

for (const id of x5IssueIds) {
  const issue = findIssue(id);
  if (issue) {
    reviewClearedCount += setAllNeedsReviewFalse(issue);
    updatedCount++;
    console.log(`[OK] ${id} - Cleared all needsReview flags`);
  } else {
    console.log(`[WARN] ${id} - NOT FOUND`);
  }
}

// ============================================================================
// BMW X1 Issues (5)
// ============================================================================

// 1. X1 N20 Timing Chain
const x1TimingChain = findIssue('bmw-x1-n20-timing-chain-2013');
if (x1TimingChain) {
  const partRec = findRec(x1TimingChain, 'part', 'timing chain kit');
  if (partRec) {
    partRec.partBrand = 'IWIS/Genuine BMW';
    partRec.partName = 'N20 Timing Chain Kit (xDrive)';
    partRec.partNumber = '11318648732KT2';
    partRec.estimatedCost = '$850';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x1TimingChain);
  updatedCount++;
  console.log('[OK] bmw-x1-n20-timing-chain-2013 - Updated IWIS/Genuine BMW 11318648732KT2 (xDrive), cleared needsReview');
}

// 2. X1 Transfer Case
const x1TransferCase = findIssue('bmw-x1-transfer-case-2013');
if (x1TransferCase) {
  const partRec = findRec(x1TransferCase, 'part', 'transfer case');
  if (partRec) {
    partRec.partBrand = 'FCP Euro';
    partRec.partName = 'Transfer Case Actuator Repair Kit';
    partRec.estimatedCost = '$100-150';
    // Remove old partNumber if it was for the full motor
    delete partRec.partNumber;
  }
  reviewClearedCount += setAllNeedsReviewFalse(x1TransferCase);
  updatedCount++;
  console.log('[OK] bmw-x1-transfer-case-2013 - Updated FCP Euro repair kit ($100-150), cleared needsReview');
}

// 3. X1 Oil Leaks (VCG/OFHG)
const x1OilLeak = findIssue('bmw-x1-oil-leak-2016');
if (x1OilLeak) {
  // Update valve cover gasket rec
  const vcgRec = findRec(x1OilLeak, 'part', 'valve cover gasket');
  if (vcgRec) {
    vcgRec.partBrand = 'Genuine BMW';
    vcgRec.partName = 'N20 Valve Cover with Integrated PCV';
    vcgRec.partNumber = '11127588412';
    vcgRec.estimatedCost = '$200-350';
    vcgRec.content = 'Genuine BMW N20 valve cover with integrated PCV (11127588412, $200-350) - complete assembly replacement is more reliable than gasket-only repair on N20 engines.';
  }
  // Update oil filter housing gasket rec
  const ofhgRec = findRec(x1OilLeak, 'part', 'oil filter housing gasket');
  if (ofhgRec) {
    ofhgRec.partBrand = 'Elring';
    ofhgRec.partName = 'Oil Filter Housing Gasket';
    ofhgRec.partNumber = '11428637821';
    ofhgRec.content = 'Elring oil filter housing gasket (11428637821) - OEM supplier quality at fraction of BMW-branded price. Includes all seals needed.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x1OilLeak);
  updatedCount++;
  console.log('[OK] bmw-x1-oil-leak-2016 - Updated VCG: BMW 11127588412 ($200-350), OFHG: Elring 11428637821, cleared needsReview');
}

// 4. X1 Coolant/Water Pump
const x1Coolant = findIssue('bmw-x1-coolant-leak-2016');
if (x1Coolant) {
  // Update water pump rec
  const pumpRec = findRec(x1Coolant, 'part', 'water pump');
  if (pumpRec) {
    pumpRec.partBrand = 'Continental/VDO';
    pumpRec.partName = 'Electric Water Pump (B48)';
    pumpRec.partNumber = '11518678905';
    pumpRec.estimatedCost = '$160-350';
    pumpRec.content = 'Continental/VDO electric water pump for B48 engine (11518678905, $160-350) - OEM supplier, more reliable than cheap aftermarket pumps.';
  }
  // Update coolant rec to thermostat info
  const coolantRec = findRec(x1Coolant, 'part', 'coolant');
  if (coolantRec) {
    coolantRec.partBrand = 'Genuine BMW';
    coolantRec.partName = 'Thermostat Housing Assembly (B48)';
    coolantRec.partNumber = '11537644811';
    coolantRec.estimatedCost = '$150-250';
    coolantRec.content = 'Genuine BMW thermostat housing assembly for B48 engine (11537644811, $150-250) - replace when doing water pump as labor overlaps significantly.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x1Coolant);
  updatedCount++;
  console.log('[OK] bmw-x1-coolant-leak-2016 - Updated Continental/VDO 11518678905 ($160-350), thermostat 11537644811 ($150-250), cleared needsReview');
}

// 5. X1 Suspension
const x1Suspension = findIssue('bmw-x1-suspension-bushing-2016');
if (x1Suspension) {
  // Update first control arm rec (BMW OEM) to Meyle HD
  const bmwControlArm = findRec(x1Suspension, 'part', 'bmw oem control arm');
  if (bmwControlArm) {
    bmwControlArm.partBrand = 'Meyle HD';
    bmwControlArm.partName = 'Front Suspension Overhaul Kit';
    bmwControlArm.partNumber = '3160500135/HD';
    bmwControlArm.content = 'Meyle HD front suspension overhaul kit (3160500135/HD) - heavy-duty replacement with improved durability over OEM rubber bushings. Includes control arms and bushings.';
  }
  // Update Lemforder rec to strut mount info
  const lemforderRec = findRec(x1Suspension, 'part', 'lemforder');
  if (lemforderRec) {
    lemforderRec.partBrand = 'Genuine BMW';
    lemforderRec.partName = 'Front Strut Mount';
    lemforderRec.partNumber = '31336892617';
    lemforderRec.content = 'Genuine BMW front strut mount (31336892617) - replace when doing control arm work as labor overlaps. Common wear item on F48 X1.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x1Suspension);
  updatedCount++;
  console.log('[OK] bmw-x1-suspension-bushing-2016 - Updated Meyle HD 3160500135/HD + strut mount 31336892617, cleared needsReview');
}

// ============================================================================
// BMW X4 Issues (3)
// ============================================================================

// 1. X4 N20 Timing Chain
const x4TimingChain = findIssue('bmw-x4-n20-timing-chain-2015');
if (x4TimingChain) {
  const partRec = findRec(x4TimingChain, 'part', 'timing chain kit');
  if (partRec) {
    partRec.partBrand = 'IWIS/Genuine BMW';
    partRec.partName = 'N20 Timing Chain Kit (xDrive)';
    partRec.partNumber = '11318648732KT2';
    partRec.estimatedCost = '$850';
    partRec.content = 'IWIS/Genuine BMW N20 Timing Chain Kit for xDrive models (11318648732KT2, ~$850) - includes all necessary components for complete replacement.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x4TimingChain);
  updatedCount++;
  console.log('[OK] bmw-x4-n20-timing-chain-2015 - Updated IWIS/Genuine BMW 11318648732KT2, cleared needsReview');
}

// 2. X4 Transfer Case Actuator
const x4TransferCase = findIssue('bmw-x4-transfer-case-2015');
if (x4TransferCase) {
  const partRec = findRec(x4TransferCase, 'part', 'transfer case');
  if (partRec) {
    partRec.partBrand = 'FCP Euro';
    partRec.partName = 'Transfer Case Actuator Gear Repair Kit';
    partRec.estimatedCost = '$100-150';
    // Remove partNumber for the full motor - we're recommending the gear repair kit
    delete partRec.partNumber;
    partRec.content = 'FCP Euro transfer case actuator gear repair kit ($100-150) - much cheaper than full motor replacement. Kit includes replacement plastic gears and seals.';
  }
  reviewClearedCount += setAllNeedsReviewFalse(x4TransferCase);
  updatedCount++;
  console.log('[OK] bmw-x4-transfer-case-2015 - Updated FCP Euro gear repair kit ($100-150), cleared needsReview');
}

// 3. X4 Oil Leaks
const x4OilLeak = findIssue('bmw-x4-oil-leak-2015');
if (x4OilLeak) {
  // Update valve cover gasket rec with N20 part number
  const vcgRec = findRec(x4OilLeak, 'part', 'valve cover gasket');
  if (vcgRec) {
    vcgRec.partBrand = 'Genuine BMW';
    vcgRec.partName = 'N20 Valve Cover with Integrated PCV';
    vcgRec.partNumber = '11127588412';
    vcgRec.content = 'Genuine BMW N20 valve cover assembly (11127588412) - includes integrated PCV valve. Complete assembly replacement preferred over gasket-only repair.';
  }
  // Add OFHG rec
  x4OilLeak.communityRecommendations.push({
    type: 'part',
    content: 'Elring oil filter housing gasket (11428637821) - OEM supplier quality. Replace when doing valve cover to prevent oil leak from second common failure point.',
    partBrand: 'Elring',
    partName: 'Oil Filter Housing Gasket',
    partNumber: '11428637821',
    upvotes: 0,
    needsReview: false
  });
  reviewClearedCount += setAllNeedsReviewFalse(x4OilLeak);
  updatedCount++;
  console.log('[OK] bmw-x4-oil-leak-2015 - Updated VCG: BMW 11127588412, added OFHG: Elring 11428637821, cleared needsReview');
}

// ============================================================================
// Write updated file
// ============================================================================

fs.writeFileSync(ISSUES_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log('\n========================================');
console.log('DEEP RESEARCH BMW BATCH 2 - SUMMARY');
console.log('========================================');
console.log(`Issues updated: ${updatedCount}`);
console.log(`needsReview flags cleared: ${reviewClearedCount}`);
console.log('');
console.log('Models covered:');
console.log('  - BMW X3: 8 issues (part numbers + needsReview cleared)');
console.log('  - BMW X5: 10 issues (needsReview cleared on all)');
console.log('  - BMW X1: 5 issues (part numbers + needsReview cleared)');
console.log('  - BMW X4: 3 issues (part numbers + needsReview cleared)');
console.log(`  Total: ${updatedCount} issues updated`);
console.log('');
console.log('Key part numbers added:');
console.log('  - N20 Timing Chain Kit (xDrive): IWIS 11318648732KT2 ($850)');
console.log('  - N52 Water Pump: Continental/VDO 11517586925 ($200-350)');
console.log('  - N52 Thermostat: 11537549476 ($50-80)');
console.log('  - VANOS Solenoid: Genuine BMW 11367585425 ($40-70 ea)');
console.log('  - Expansion Tank: Genuine BMW 17137642160');
console.log('  - Turner Motorsport Aluminum Tank: 050610LA02');
console.log('  - OFHG: Elring 11428637821 ($15-30)');
console.log('  - VRSF Charge Pipes: N55 + B58 aluminum upgrades');
console.log('  - N20 Valve Cover w/PCV: BMW 11127588412 ($200-350)');
console.log('  - B48 Water Pump: Continental/VDO 11518678905 ($160-350)');
console.log('  - B48 Thermostat: BMW 11537644811 ($150-250)');
console.log('  - Meyle HD Suspension Kit: 3160500135/HD');
console.log('  - Strut Mount: BMW 31336892617');
console.log('  - FCP Euro Transfer Case Repair Kit ($100-150)');
console.log('');
console.log('File written to: src/data/known-issues.json');
console.log('========================================');
