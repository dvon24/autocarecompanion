// Generate community recommendations for issues that don't have them
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function generateRecommendations(issue) {
  const recommendations = [];
  const solution = issue.solution || '';
  const description = issue.description || '';
  const combinedText = solution + ' ' + description;

  // Extract part recommendations from solution
  const partMatches = solution.match(/(?:use|replace with|install|upgrade to|switch to|add)\s+([A-Z][^.,]+(?:oil|filter|part|kit|fluid|sensor|pump|gasket|seal|bearing|module|tuner|cleaner|additive))/gi);
  if (partMatches) {
    partMatches.slice(0, 3).forEach(match => {
      const content = match.trim();
      // Try to extract brand and part name
      const brandMatch = content.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
      recommendations.push({
        type: 'part',
        content: content.charAt(0).toUpperCase() + content.slice(1),
        partBrand: brandMatch ? brandMatch[1] : undefined,
        upvotes: 0,
        needsReview: true
      });
    });
  }

  // Generate tips from solution steps
  if (solution.includes('$') && solution.match(/\$[\d,]+-\$?[\d,]+/)) {
    // Cost-related tip
    const costMatch = solution.match(/\$[\d,]+-\$?[\d,]+/);
    if (costMatch && !recommendations.find(r => r.content.includes('DIY'))) {
      recommendations.push({
        type: 'tip',
        content: `DIY repairs can save significantly - dealer charges ${costMatch[0]} but DIY costs are typically 50-70% less`,
        upvotes: 0,
        needsReview: true
      });
    }
  }

  // Preventive maintenance tip
  if (combinedText.match(/prevent|maintenance|regular|periodic/i)) {
    const preventMatch = combinedText.match(/([^.]*(?:prevent|regular|maintenance)[^.]*\.)/i);
    if (preventMatch && recommendations.length < 5) {
      recommendations.push({
        type: 'tip',
        content: preventMatch[1].trim(),
        upvotes: 0,
        needsReview: true
      });
    }
  }

  // Warning about ignoring the problem
  if (issue.severity === 'high' && !recommendations.find(r => r.type === 'warning')) {
    recommendations.push({
      type: 'warning',
      content: 'This is a high-severity issue - ignoring it can lead to costly repairs or safety concerns. Address it promptly.',
      upvotes: 0,
      needsReview: true
    });
  }

  // Warranty tip
  if (combinedText.match(/warranty|recall|TSB/i) && !recommendations.find(r => r.content.includes('warranty'))) {
    if (issue.tsb || issue.recall) {
      recommendations.push({
        type: 'tip',
        content: issue.recall
          ? `This issue has an active recall - repairs should be free at the dealer`
          : `Check if this is covered under warranty or TSB - some dealers cover this repair even out of warranty`,
        upvotes: 0,
        needsReview: true
      });
    }
  }

  // OEM vs aftermarket tip
  if (combinedText.match(/OEM|aftermarket|genuine/i) && recommendations.length < 5) {
    recommendations.push({
      type: 'tip',
      content: 'Consider OEM parts for critical components like sensors and electrical parts - aftermarket can be unreliable',
      upvotes: 0,
      needsReview: true
    });
  }

  // Generic diagnostic tip
  if (issue.symptoms && issue.symptoms.length > 0 && recommendations.length < 4) {
    recommendations.push({
      type: 'tip',
      content: 'Get a proper diagnosis before replacing parts - similar symptoms can have different causes',
      upvotes: 0,
      needsReview: true
    });
  }

  // Ensure we have at least 3 recommendations
  if (recommendations.length < 3) {
    // Add generic but useful recommendations
    if (!recommendations.find(r => r.content.includes('forum'))) {
      const vehicleName = `${issue.vehicleMatch.make} ${issue.vehicleMatch.model}`;
      recommendations.push({
        type: 'tip',
        content: `Search ${vehicleName} forums and owner groups for real-world experiences and DIY guides`,
        upvotes: 0,
        needsReview: true
      });
    }

    if (!recommendations.find(r => r.content.includes('quote')) && recommendations.length < 4) {
      recommendations.push({
        type: 'tip',
        content: 'Get multiple quotes from independent mechanics - dealer prices can be 2-3x higher for the same repair',
        upvotes: 0,
        needsReview: true
      });
    }
  }

  // Cap at 6 recommendations
  return recommendations.slice(0, 6);
}

let updatedCount = 0;
data.issues = data.issues.map(issue => {
  // Skip if already has recommendations
  if (issue.communityRecommendations && issue.communityRecommendations.length > 0) {
    return issue;
  }

  // Generate recommendations
  issue.communityRecommendations = generateRecommendations(issue);
  updatedCount++;

  return issue;
});

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✓ Generated recommendations for ${updatedCount} issues`);
console.log(`  All generated recommendations are flagged with needsReview: true`);
console.log(`  Total issues: ${data.issues.length}`);
console.log(`\nNext steps:`);
console.log(`  1. Test the app to see "What Owners Are Using" on all issues`);
console.log(`  2. Manually review/enhance recommendations for top vehicles`);
console.log(`  3. Remove needsReview flag after manual review`);
