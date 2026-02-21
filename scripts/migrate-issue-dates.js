// Migration script to update known issues with new date fields
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

// Read the existing data
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Transform each issue
data.issues = data.issues.map(issue => {
  const { lastReviewedAt, ...rest } = issue;

  return {
    ...rest,
    lastReportedByOwners: lastReviewedAt, // Keep the original date as when owners reported it
    reviewedOn: '2026-02-21', // We reviewed it in Feb 2026
  };
});

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✓ Successfully updated ${data.issues.length} issues with new date fields`);
