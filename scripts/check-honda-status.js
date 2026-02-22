const fs = require('fs');
const path = require('path');

// Check issues
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));
const honda = data.issues.filter(i => (i.vehicleMatch && i.vehicleMatch.make === 'Honda') || i.make === 'Honda');

console.log('=== HONDA ISSUES BY MODEL ===');
const models = {};
honda.forEach(i => {
  const m = (i.vehicleMatch && i.vehicleMatch.model) || i.model || 'unknown';
  if (!models[m]) models[m] = { count: 0, needsReview: 0, reviewed: 0, unreviewed: 0 };
  models[m].count++;
  if (i.communityRecommendations) {
    i.communityRecommendations.forEach(r => {
      if (r.needsReview) models[m].needsReview++;
    });
  }
  if (i.reviewedOn) models[m].reviewed++;
  else models[m].unreviewed++;
});

Object.entries(models).sort((a, b) => b[1].count - a[1].count).forEach(([m, s]) => {
  console.log(`  ${m}: ${s.count} issues, ${s.needsReview} needsReview, ${s.reviewed} reviewed, ${s.unreviewed} unreviewed`);
});

console.log(`\nTotal: ${honda.length} issues`);
let totalNR = 0;
honda.forEach(i => {
  if (i.communityRecommendations) {
    i.communityRecommendations.forEach(r => { if (r.needsReview) totalNR++; });
  }
});
console.log(`Total needsReview flags: ${totalNR}`);

// Check YMMT
console.log('\n=== HONDA YMMT COVERAGE ===');
const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));
const ymmtModels = {};
Object.keys(ymmt).sort().forEach(yr => {
  if (ymmt[yr].Honda) {
    Object.keys(ymmt[yr].Honda).forEach(m => {
      if (!ymmtModels[m]) ymmtModels[m] = [];
      ymmtModels[m].push(parseInt(yr));
    });
  }
});

Object.entries(ymmtModels).sort().forEach(([m, yrs]) => {
  yrs.sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < yrs.length; i++) {
    if (yrs[i] - yrs[i-1] > 1) {
      gaps.push(`gap ${yrs[i-1]+1}-${yrs[i]-1}`);
    }
  }
  const has2025 = yrs.includes(2025);
  const has2026 = yrs.includes(2026);
  console.log(`  ${m}: ${yrs[0]}-${yrs[yrs.length-1]} (${yrs.length} years)${gaps.length ? ' GAPS: ' + gaps.join(', ') : ''}${has2025 ? '' : ' NO-2025'}${has2026 ? '' : ' NO-2026'}`);
});

// Check which issue models have no YMMT
console.log('\n=== ISSUES MODELS WITHOUT YMMT ===');
Object.keys(models).forEach(m => {
  if (!ymmtModels[m]) console.log(`  ${m} (${models[m].count} issues) - NO YMMT ENTRIES`);
});
