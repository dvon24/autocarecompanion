#!/usr/bin/env node
/**
 * Backfill partBrand, partNumber, and affiliateUrl on communityRecommendations
 * by extracting "Brand PartNumber" patterns from content/text strings.
 *
 * Usage: node scripts/backfill-affiliate-links.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const AFFILIATE_TAG = 'au7o-20';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

const dryRun = process.argv.includes('--dry-run');

// Known automotive part brands (case-sensitive for matching, but we'll do case-insensitive search)
const BRANDS = [
  // Major aftermarket
  'Dorman', 'Mishimoto', 'Spicer', 'Mopar', 'Denso', 'Gates', 'ACDelco', 'AC Delco',
  'NGK', 'Bosch', 'Moog', 'Monroe', 'KYB', 'Bilstein', 'Brembo', 'EBC', 'Hawk',
  'StopTech', 'Raybestos', 'Wagner', 'Cardone', 'Motorcraft', 'Delphi', 'Continental',
  'Dayco', 'Aisin', 'SKF', 'Timken', 'National',
  // Gaskets / seals
  'Fel-Pro', 'Victor Reinz', 'Mahle', 'Mann',
  // Filters / fluids
  'K&N', 'Fram', 'Wix', 'Purolator', 'Royal Purple', 'Mobil', 'Castrol', 'Valvoline',
  'Pennzoil', 'Amsoil', 'Red Line', 'Lucas', 'STP', 'CRC', 'WD-40',
  // Chemicals / adhesives
  'Permatex', 'Loctite', '3M',
  // Suspension / European
  'Arnott', 'Strutmasters', 'Sachs', 'Meyle', 'Lemforder', 'TRW', 'Febi', 'Rein', 'URO',
  // Drivetrain
  'Fluidyne', 'CSF', 'ZF', 'LuK', 'Valeo', 'Exedy', 'South Bend', 'ACT', 'Fidanza',
  // OEM brands
  'DiabloSport', 'BMR Suspension', 'BMR',
  // Other commonly seen
  'Spectra', 'TYC', 'VDO', 'Hella', 'Osram', 'Philips', 'WeatherTech', 'Husky',
  'Magnaflow', 'Flowmaster', 'Borla', 'Kooks', 'ARH', 'Corsa',
  'Eibach', 'H&R', 'Tein', 'BC Racing', 'Koni', 'Tokico',
  'ARP', 'Cometic', 'GM',
  'Remy', 'Hitachi', 'Mitsubishi Electric',
  'Walker', 'Magnaflow', 'Eastern Catalytic',
  'Beck Arnley', 'Four Seasons', 'UAC', 'Spectra Premium',
  'A1 Cardone', 'BBB Industries',
];

// Sort brands longest-first so "AC Delco" matches before "AC" etc.
BRANDS.sort((a, b) => b.length - a.length);

// Remove duplicates
const uniqueBrands = [...new Set(BRANDS)];

// Known vehicle model names and common false-positive "part numbers" to reject
const BLOCKLIST = new Set([
  // Vehicle models that look like part numbers
  '4Runner', 'RAV4', 'CR-V', 'CRV', 'HR-V', 'HRV', 'RX350', 'RX450h',
  'IS350', 'IS300', 'ES350', 'GS350', 'LS460', 'NX300', 'RC350',
  'CX-5', 'CX-9', 'CX-30', 'CX-50', 'MX-5', 'BRZ',
  'G35', 'G37', 'Q50', 'Q60', 'Q70', 'FX35', 'FX45',
  'WRX', 'STI', 'RS3', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8',
  'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8',
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8',
  'C300', 'C43', 'E350', 'E63', 'S550', 'S63',
  'GT350', 'GT500', 'SRT8', 'SRT4',
  'SS396', 'Z06', 'ZR1', 'ZL1', 'Z28',
  'F150', 'F250', 'F350', 'F450',
  'Sierra', '1500', '2500', '3500',
  // Common words/patterns that aren't part numbers
  'TSB', 'NHTSA', 'OBD', 'OBD-II', 'ECU', 'PCM', 'TCM', 'BCM', 'ABS',
  'DIY', 'OEM', 'PDF',
  // Transmission model names (not purchasable parts)
  '8HP', '8HP45', '8HP70', '8HP75', '8HP90', '8-speed', '6-speed', '5-speed', '4-speed',
  'AS69RC', 'AWF21', 'CVT',
  // Fluid viscosity patterns
  '0W-20', '0W-40', '5W-20', '5W-30', '5W-40', '5W-50', '10W-30', '10W-40',
  '75W-90', '75W-140', 'ATF4',
  // Not part numbers
  '2-stroke', '3-stroke',
  // Oil specs / paint codes / misc
  'dexos1', 'dexos2', 'NH-578', 'NH-731P', '12V', '24V',
  // Pump model names
  'CP3', 'CP4',
]);

// Build a regex for each brand that captures brand + part number
// Part number patterns:
//   - Alphanumeric with dashes: 926-959, MMRAD-SRT-15, 5-1310X
//   - Pure alphanumeric: 68105583AF, K060923
//   - May start with #
// We require at least one digit in the part number to avoid matching random words
const PART_NUMBER_RE = /[#]?[A-Z0-9][-A-Z0-9]{2,}[A-Z0-9]/i;

// Build combined regex patterns for each brand
function buildBrandPatterns() {
  const patterns = [];
  for (const brand of uniqueBrands) {
    // Escape special regex chars in brand name
    const escaped = brand.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&');
    // Match: Brand + space(s) + PartNumber
    // Also match: Brand + space + # + PartNumber
    const re = new RegExp(
      '(?:^|[\\s(,])' + escaped + '\\s+([#]?[A-Z0-9][A-Z0-9-]{1,}[A-Z0-9])',
      'gi'
    );
    patterns.push({ brand, re });
  }
  return patterns;
}

// Also match (PN XXXXX) pattern
const PN_PATTERN = /\(PN\s+([A-Z0-9][A-Z0-9-]{2,}[A-Z0-9])\)/gi;
// Match "PN: XXXXX" or "PN XXXXX" or "P/N XXXXX" or "P/N: XXXXX" without parens too
const PN_PATTERN2 = /(?:PN|P\/N)[:\s]+([A-Z0-9][A-Z0-9-]{2,}[A-Z0-9])/gi;

function hasDigit(s) {
  return /\d/.test(s);
}

// Validate that a part number looks real (not just a word)
function isValidPartNumber(pn) {
  // Must contain at least one digit
  if (!hasDigit(pn)) return false;
  // Must be at least 3 chars
  if (pn.length < 3) return false;
  // Check blocklist (case-insensitive)
  if (BLOCKLIST.has(pn)) return false;
  for (const blocked of BLOCKLIST) {
    if (blocked.toLowerCase() === pn.toLowerCase()) return false;
  }
  // Must not be just a number like "2024" (year) or common non-part patterns
  if (/^\d{4}$/.test(pn) && parseInt(pn) >= 1990 && parseInt(pn) <= 2030) return false;
  // Reject pure small numbers
  if (/^\d{1,2}$/.test(pn)) return false;
  // Reject things that look like dollar amounts or small ranges like "25-35", "2-3x"
  if (/^\d+-\d+$/.test(pn)) {
    const parts = pn.split('-');
    if (parts.every(p => p.length <= 2)) return false;
  }
  // Reject recall/TSB-like patterns: "14V-461", "19-056"
  if (/^\d{2}V?-\d{2,3}$/.test(pn)) return false;
  // Reject patterns that are clearly "forums" boilerplate: "Search Brand Model forums"
  return true;
}

// Find the brand that precedes a PN-pattern match in the text
function findBrandNearPN(text, pnMatch) {
  // Look for a brand name within ~60 chars before the PN
  const idx = text.indexOf(pnMatch);
  if (idx < 0) return null;
  const before = text.substring(Math.max(0, idx - 80), idx);
  // Check brands (longest first)
  for (const brand of uniqueBrands) {
    if (before.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function buildAffiliateUrl(brand, partNumber) {
  const searchTerms = `${brand} ${partNumber.replace(/^#/, '')}`;
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}&tag=${AFFILIATE_TAG}`;
}

function extractPartInfo(text) {
  if (!text) return null;

  // Skip boilerplate recommendation text that mentions brand names in non-part contexts
  if (/^Search\s+\w+\s+\w+\s+forums/i.test(text)) return null;
  if (/^Get\s+multiple\s+quotes/i.test(text)) return null;
  if (/^Get\s+a\s+proper\s+diagnosis/i.test(text)) return null;
  // Skip text primarily about recalls/TSBs that happen to mention GM part numbers
  if (/^NHTSA\s+Recall/i.test(text)) return null;

  const brandPatterns = buildBrandPatterns();

  // Try brand + part number patterns first
  for (const { brand, re } of brandPatterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      const partNumber = match[1].replace(/^#/, '');
      if (isValidPartNumber(partNumber)) {
        return { brand, partNumber };
      }
    }
  }

  // Try (PN XXXXX) pattern
  PN_PATTERN.lastIndex = 0;
  let pnMatch;
  while ((pnMatch = PN_PATTERN.exec(text)) !== null) {
    const partNumber = pnMatch[1];
    if (isValidPartNumber(partNumber)) {
      const brand = findBrandNearPN(text, pnMatch[0]);
      if (brand) {
        return { brand, partNumber };
      }
    }
  }

  // Try PN: XXXXX without parens
  PN_PATTERN2.lastIndex = 0;
  while ((pnMatch = PN_PATTERN2.exec(text)) !== null) {
    const partNumber = pnMatch[1];
    if (isValidPartNumber(partNumber)) {
      const brand = findBrandNearPN(text, pnMatch[0]);
      if (brand) {
        return { brand, partNumber };
      }
    }
  }

  return null;
}

// Main
function main() {
  console.log(`Reading ${DATA_FILE}...`);
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);

  let updated = 0;
  let skippedAlreadyHas = 0;
  let noMatch = 0;
  let totalScanned = 0;
  const examples = [];

  for (const issue of data.issues) {
    const recs = issue.communityRecommendations || [];
    // Also check solution text for the issue itself (but we only update recs)
    for (const rec of recs) {
      const contentText = rec.content || rec.text || '';
      if (!contentText) continue;

      // Skip if already has affiliateUrl
      if (rec.affiliateUrl) {
        skippedAlreadyHas++;
        continue;
      }

      totalScanned++;

      const result = extractPartInfo(contentText);
      if (!result) {
        noMatch++;
        continue;
      }

      const { brand, partNumber } = result;

      // Don't overwrite existing values
      if (!rec.partBrand) rec.partBrand = brand;
      if (!rec.partNumber) rec.partNumber = partNumber;
      rec.affiliateUrl = buildAffiliateUrl(rec.partBrand, rec.partNumber);

      // If type is 'tip', upgrade to 'part' since it mentions a specific part
      if (rec.type === 'tip') rec.type = 'part';

      updated++;

      if (examples.length < 20) {
        examples.push({
          issue: issue.id,
          brand: rec.partBrand,
          partNumber: rec.partNumber,
          url: rec.affiliateUrl,
          snippet: contentText.substring(0, 80),
        });
      }
    }
  }

  console.log('\n--- Results ---');
  console.log(`Total recs scanned (no existing affiliateUrl): ${totalScanned}`);
  console.log(`Skipped (already has affiliateUrl): ${skippedAlreadyHas}`);
  console.log(`Matched & updated: ${updated}`);
  console.log(`No match found: ${noMatch}`);

  if (examples.length > 0) {
    console.log('\n--- Sample updates ---');
    for (const ex of examples) {
      console.log(`  [${ex.issue}] ${ex.brand} ${ex.partNumber}`);
      console.log(`    "${ex.snippet}..."`);
      console.log(`    -> ${ex.url}`);
    }
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes written.');
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`\nWrote updated data to ${DATA_FILE}`);
  }
}

main();
