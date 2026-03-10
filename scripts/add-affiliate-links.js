#!/usr/bin/env node
/**
 * Add Amazon affiliate links to all "part" type communityRecommendations.
 *
 * Uses partNumber (most specific) or partBrand + partName to build
 * Amazon search URLs with the au7o-20 affiliate tag.
 */

const fs = require('fs');
const path = require('path');

const AFFILIATE_TAG = 'au7o-20';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

function buildAmazonUrl(rec, issue) {
  // Build the most specific search query possible
  let searchTerms = [];

  if (rec.partNumber) {
    // Part number is the most specific — use it as primary search
    searchTerms.push(rec.partNumber);
    // Add brand for disambiguation if available
    if (rec.partBrand && !rec.partNumber.toLowerCase().includes(rec.partBrand.toLowerCase())) {
      searchTerms.unshift(rec.partBrand);
    }
  } else if (rec.partBrand && rec.partName) {
    searchTerms.push(rec.partBrand, rec.partName);
  } else if (rec.partName) {
    // No brand or number — add vehicle context for better results
    const make = issue.vehicleMatch?.make || issue.make || '';
    const model = issue.vehicleMatch?.model || issue.model || '';
    searchTerms.push(make, model, rec.partName);
  } else {
    // No part metadata — skip
    return null;
  }

  const query = searchTerms.filter(Boolean).join(' ').trim();
  if (!query) return null;

  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

// Load data
const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const data = JSON.parse(raw);
const issues = data.issues || data;

let updated = 0;
let skipped = 0;
let alreadyHasLink = 0;

for (const issue of issues) {
  if (!issue.communityRecommendations) continue;

  for (const rec of issue.communityRecommendations) {
    // Add to any recommendation that has part data (part, tip, or warning)
    if (!rec.partNumber && !rec.partName && !rec.partBrand) continue;
    // Skip if partBrand is just a verb (common data issue)
    const skipBrands = ['install', 'replace', 'use', 'check', 'upgrade', 'avoid', 'search'];
    if (rec.partBrand && skipBrands.includes(rec.partBrand.toLowerCase()) && !rec.partNumber && !rec.partName) continue;

    // Skip if already has a link
    if (rec.affiliateUrl) {
      alreadyHasLink++;
      continue;
    }

    const url = buildAmazonUrl(rec, issue);
    if (url) {
      rec.affiliateUrl = url;
      updated++;
    } else {
      skipped++;
    }
  }
}

// Write back (preserve wrapper object if present)
const output = data.issues ? data : issues;
fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2) + '\n', 'utf-8');

console.log(`Done!`);
console.log(`  Updated: ${updated} part recommendations with Amazon affiliate links`);
console.log(`  Skipped: ${skipped} (insufficient part data)`);
console.log(`  Already had links: ${alreadyHasLink}`);
