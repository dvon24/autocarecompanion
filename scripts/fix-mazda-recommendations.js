// Script to convert Mazda CX-5 communityRecommendations to structured format
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Remove old duplicate
data.issues = data.issues.filter(i => i.id !== 'mazda-cx5-carbon-buildup');

// Convert Mazda CX-5 recommendations from strings to structured format
data.issues = data.issues.map(issue => {
  if (!issue.id.startsWith('mazda-cx5-')) return issue;
  if (!issue.communityRecommendations) return issue;
  if (typeof issue.communityRecommendations[0] === 'object') return issue; // Already structured

  // Convert string array to structured format
  issue.communityRecommendations = issue.communityRecommendations.map(rec => {
    // Detect if it's a part recommendation (mentions brand/product)
    const isPart = /^Use |^Add |^Install |^Replace with |^Consider /.test(rec) ||
                   rec.includes('OEM') || rec.includes('SKF') || rec.includes('Denso');
    const isWarning = /^Do not |^Don't |^Avoid |^Never |IMPORTANT/.test(rec);

    return {
      type: isPart ? 'part' : isWarning ? 'warning' : 'tip',
      content: rec,
      upvotes: 0
    };
  });

  return issue;
});

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('✓ Fixed Mazda CX-5 community recommendations');
console.log('✓ Removed duplicate carbon buildup issue');
console.log(`  Total issues: ${data.issues.length}`);
