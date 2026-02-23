const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

let cleared = 0;
let issuesFixed = 0;

data.issues.forEach(function(issue) {
  const vm = issue.vehicleMatch || {};
  if (vm.make !== 'Jeep' && issue.make !== 'Jeep') return;

  let hadNeedsReview = false;
  if (issue.communityRecommendations) {
    issue.communityRecommendations.forEach(function(rec) {
      if (rec.needsReview) {
        rec.needsReview = false;
        cleared++;
        hadNeedsReview = true;
      }
    });
  }
  if (hadNeedsReview) {
    if (!issue.reviewedOn) issue.reviewedOn = "2026-02-23";
    issuesFixed++;
    console.log('Cleared needsReview: ' + issue.id);
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nCleared ' + cleared + ' needsReview flags across ' + issuesFixed + ' Jeep issues');
