#!/usr/bin/env node
/**
 * Verification Script: Validate Engine-Trim Restrictions
 *
 * 1. Counts engine-specific issues with/without trims
 * 2. Simulates API queries for test vehicles
 * 3. Verifies correct filtering (no wrong-engine issues shown)
 *
 * Usage:
 *   node scripts/verify-engine-trims.js
 */

const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const issuesData = JSON.parse(fs.readFileSync(issuesPath, 'utf-8'));

// ── Simulated API matching (mirrors src/app/api/known-issues/route.ts) ──

function vehicleMatchesIssue(issue, year, make, model, trim) {
  // New format
  if (!issue.vehicleMatch && issue.make && issue.model && issue.years) {
    const years = issue.years;
    if (year < years.start || year > years.end) return false;
    if (issue.make.toLowerCase() !== make.toLowerCase()) return false;
    const modelLower = model.toLowerCase();
    const issueModelLower = issue.model.toLowerCase();
    if (!modelLower.includes(issueModelLower) && !issueModelLower.includes(modelLower)) return false;

    // NEW: Check trims for new-format issues
    if (issue.trims && issue.trims.length > 0 && trim) {
      const trimLower = trim.toLowerCase();
      const hasMatchingTrim = issue.trims.some(t =>
        trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
      );
      if (!hasMatchingTrim) return false;
    }
    return true;
  }

  // Legacy format
  const match = issue.vehicleMatch;
  if (!match) return false;
  if (!match.years.includes(year)) return false;
  if (match.make.toLowerCase() !== make.toLowerCase()) return false;
  const modelLower = model.toLowerCase();
  const matchModelLower = match.model.toLowerCase();
  if (!modelLower.includes(matchModelLower) && !matchModelLower.includes(modelLower)) return false;

  if (match.trims && match.trims.length > 0 && trim) {
    const trimLower = trim.toLowerCase();
    const hasMatchingTrim = match.trims.some(t =>
      trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
    );
    if (!hasMatchingTrim) return false;
  }
  return true;
}

function queryIssues(year, make, model, trim) {
  return issuesData.issues.filter(issue =>
    vehicleMatchesIssue(issue, year, make, model, trim)
  );
}

// ── Test Cases ──

const testCases = [
  {
    name: '2019 Camaro ZL1',
    vehicle: { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1' },
    shouldNotContain: ['2.0L', 'LTG', 'turbo four', 'V6', '3.6L', 'LGX'],
    shouldContain: [],
  },
  {
    name: '2019 Camaro 1LT',
    vehicle: { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: '1LT' },
    shouldNotContain: ['LT1', 'LT4', 'supercharged', 'Z/28', 'LS7'],
    shouldContain: [],
  },
  {
    name: '2019 Camaro 1SS',
    vehicle: { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: '1SS' },
    shouldNotContain: ['2.0L', 'LTG', 'turbo four', 'LT4', 'supercharged'],
    shouldContain: [],
  },
  {
    name: '2020 Mustang GT',
    vehicle: { year: 2020, make: 'Ford', model: 'Mustang', trim: 'GT' },
    shouldNotContain: ['EcoBoost', '2.3L'],
    shouldContain: ['Coyote', '5.0L'],
  },
  {
    name: '2018 Mustang EcoBoost',
    vehicle: { year: 2018, make: 'Ford', model: 'Mustang', trim: 'EcoBoost' },
    shouldNotContain: ['Coyote', '5.0L', 'Voodoo', 'GT350', 'GT500', 'Predator'],
    shouldContain: ['EcoBoost'],
  },
  {
    name: '2020 F-150 XLT (ambiguous - should see all engine issues)',
    vehicle: { year: 2020, make: 'Ford', model: 'F-150', trim: 'XLT' },
    shouldNotContain: [],
    shouldContain: [],
  },
  {
    name: '2020 F-150 Raptor (3.5L EcoBoost only)',
    vehicle: { year: 2020, make: 'Ford', model: 'F-150', trim: 'Raptor' },
    shouldNotContain: ['5.0L Coyote Cam Phaser'],
    shouldContain: [],
  },
  {
    name: '2020 Challenger SXT (V6)',
    vehicle: { year: 2020, make: 'Dodge', model: 'Challenger', trim: 'SXT' },
    shouldNotContain: ['HEMI Exhaust', 'HEMI Lifter', 'HEMI MDS', 'Hellcat'],
    shouldContain: ['Pentastar'],
  },
  {
    name: '2020 Challenger R/T (5.7L HEMI)',
    vehicle: { year: 2020, make: 'Dodge', model: 'Challenger', trim: 'R/T' },
    shouldNotContain: ['Pentastar', '3.6L'],
    shouldContain: ['HEMI'],
  },
  {
    name: '2018 BMW 3 Series 320i (N20)',
    vehicle: { year: 2018, make: 'BMW', model: '3 Series', trim: '320i' },
    shouldNotContain: ['N54', 'N55 Water Pump', 'B58'],
    shouldContain: [],
  },
  {
    name: '2010 BMW 3 Series 335i (N54)',
    vehicle: { year: 2010, make: 'BMW', model: '3 Series', trim: '335i' },
    shouldNotContain: ['N20 Timing Chain'],
    shouldContain: ['HPFP'],
  },
  {
    name: '2022 RAM 1500 TRX (Hellcat)',
    vehicle: { year: 2022, make: 'RAM', model: '1500', trim: 'TRX' },
    shouldNotContain: ['Pentastar', '3.6L', 'EcoDiesel', 'diesel'],
    shouldContain: [],
  },
];

// ── Run Tests ──

console.log(`\n${'='.repeat(70)}`);
console.log('Engine-Trim Restriction Verification');
console.log(`${'='.repeat(70)}\n`);

let passed = 0;
let failed = 0;
const failures = [];

for (const tc of testCases) {
  const { year, make, model, trim } = tc.vehicle;
  const issues = queryIssues(year, make, model, trim);
  const issueTitles = issues.map(i => i.title);

  let testPassed = true;

  // Check shouldNotContain
  for (const keyword of tc.shouldNotContain) {
    const matching = issueTitles.filter(t => t.toLowerCase().includes(keyword.toLowerCase()));
    if (matching.length > 0) {
      testPassed = false;
      failures.push({
        test: tc.name,
        type: 'SHOULD_NOT_CONTAIN',
        keyword,
        matchingTitles: matching,
      });
    }
  }

  // Check shouldContain (at least one issue contains the keyword)
  for (const keyword of tc.shouldContain) {
    const matching = issueTitles.filter(t => t.toLowerCase().includes(keyword.toLowerCase()));
    if (matching.length === 0) {
      testPassed = false;
      failures.push({
        test: tc.name,
        type: 'SHOULD_CONTAIN',
        keyword,
        matchingTitles: [],
      });
    }
  }

  const status = testPassed ? 'PASS' : 'FAIL';
  if (testPassed) passed++;
  else failed++;

  console.log(`  [${status}] ${tc.name} — ${issues.length} issues`);

  // Show engine-related issues for debugging
  const engineIssues = issues.filter(i => {
    const title = (i.title || '').toLowerCase();
    return title.includes('engine') || title.includes('turbo') || title.includes('hemi') ||
           title.includes('ecoboost') || title.includes('coyote') || title.includes('pentastar') ||
           title.includes('duramax') || title.includes('diesel') || title.includes('n54') ||
           title.includes('n55') || title.includes('n20') || title.includes('b58') ||
           title.includes('lt1') || title.includes('lt4') || title.includes('ltg') ||
           title.includes('v6') || title.includes('v8') || title.includes('2.0l') ||
           title.includes('5.0l') || title.includes('3.5l') || title.includes('5.7l') ||
           title.includes('6.4l') || title.includes('supercharged') || title.includes('voodoo') ||
           title.includes('s55') || title.includes('s58') || title.includes('tfsi');
  });

  if (engineIssues.length > 0) {
    for (const ei of engineIssues) {
      const trimInfo = ei.vehicleMatch?.trims || ei.trims;
      console.log(`        → ${ei.title}${trimInfo ? ` [trims: ${trimInfo.join(', ')}]` : ' [no trims]'}`);
    }
  }
  console.log('');
}

// ── Summary ──

console.log(`${'─'.repeat(70)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log(`${'─'.repeat(70)}\n`);

if (failures.length > 0) {
  console.log('FAILURES:\n');
  for (const f of failures) {
    console.log(`  ${f.test} — ${f.type}: "${f.keyword}"`);
    if (f.matchingTitles.length > 0) {
      for (const t of f.matchingTitles) {
        console.log(`    Found: ${t}`);
      }
    }
    console.log('');
  }
}

// ── Stats ──

console.log(`\n${'─'.repeat(70)}`);
console.log('ISSUE STATS:');
console.log(`${'─'.repeat(70)}`);

let withTrims = 0;
let withoutTrims = 0;

for (const issue of issuesData.issues) {
  const hasTrims = (issue.vehicleMatch?.trims?.length > 0) || (issue.trims?.length > 0);
  if (hasTrims) withTrims++;
  else withoutTrims++;
}

console.log(`  Total issues:       ${issuesData.issues.length}`);
console.log(`  With trims:         ${withTrims}`);
console.log(`  Without trims:      ${withoutTrims}`);

process.exit(failed > 0 ? 1 : 0);
