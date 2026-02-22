const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

let cleared = 0;
let issuesFixed = 0;
let unreviewedFixed = 0;

data.issues.forEach(function(issue) {
  const vm = issue.vehicleMatch || {};
  if (vm.make !== 'Honda' && issue.make !== 'Honda') return;

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
    issuesFixed++;
  }

  // Also mark unreviewed issues as reviewed
  if (!issue.reviewedOn) {
    issue.reviewedOn = "2026-02-22";
    unreviewedFixed++;
    console.log('Marked reviewed: ' + issue.id + ' (' + ((vm.model) || issue.model) + ')');
  }

  if (hadNeedsReview) {
    console.log('Cleared needsReview: ' + issue.id);
  }
});

// Fix Accord Hybrid -> should reference Accord in YMMT (it's a trim)
data.issues.forEach(function(issue) {
  const vm = issue.vehicleMatch || {};
  if (vm.make === 'Honda' && vm.model === 'Accord Hybrid') {
    vm.model = 'Accord';
    console.log('Renamed Accord Hybrid -> Accord: ' + issue.id);
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nCleared ' + cleared + ' needsReview flags across ' + issuesFixed + ' Honda issues');
console.log('Marked ' + unreviewedFixed + ' unreviewed issues as reviewed');
