// Remove duplicate issue IDs (keep first occurrence)
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const seenIds = new Set();
const uniqueIssues = [];
let removedCount = 0;

data.issues.forEach(issue => {
  if (seenIds.has(issue.id)) {
    console.log(`Removing duplicate: ${issue.id}`);
    removedCount++;
  } else {
    seenIds.add(issue.id);
    uniqueIssues.push(issue);
  }
});

data.issues = uniqueIssues;

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✓ Removed ${removedCount} duplicate issue(s)`);
console.log(`  Total issues remaining: ${data.issues.length}`);
