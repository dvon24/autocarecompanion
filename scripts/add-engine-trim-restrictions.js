#!/usr/bin/env node
/**
 * Migration Script: Add Engine-Based Trim Restrictions to Known Issues
 *
 * Scans all known issues for engine-specific references (e.g., "2.0L Turbo",
 * "EcoBoost", "HEMI", "N54") and adds `trims` arrays so these issues only
 * show for trims that actually have that engine.
 *
 * Usage:
 *   node scripts/add-engine-trim-restrictions.js            # Apply changes
 *   node scripts/add-engine-trim-restrictions.js --dry-run   # Preview only
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// Load data files
const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const engineMapPath = path.join(__dirname, '..', 'src', 'data', 'engine-trim-map.json');

const issuesData = JSON.parse(fs.readFileSync(issuesPath, 'utf-8'));
const engineMap = JSON.parse(fs.readFileSync(engineMapPath, 'utf-8'));

// Counters
let updated = 0;
let skippedHasTrims = 0;
let skippedNoMatch = 0;
let skippedNoModel = 0;
let skippedAllTrims = 0;
const changes = [];
const unmatched = [];

/**
 * Get the make and model from an issue (handles both formats)
 */
function getIssueVehicle(issue) {
  if (issue.vehicleMatch) {
    return { make: issue.vehicleMatch.make, model: issue.vehicleMatch.model };
  }
  if (issue.make && issue.model) {
    return { make: issue.make, model: issue.model };
  }
  return null;
}

/**
 * Check if the issue already has trims
 */
function hasExistingTrims(issue) {
  if (issue.vehicleMatch && issue.vehicleMatch.trims && issue.vehicleMatch.trims.length > 0) {
    return true;
  }
  if (issue.trims && issue.trims.length > 0) {
    return true;
  }
  return false;
}

/**
 * Find the engine-trim-map entry for a given make/model.
 * Uses partial matching similar to the API.
 */
function findEngineMapEntry(make, model) {
  // Try exact make match first
  const makeEntry = engineMap[make];
  if (!makeEntry) {
    // Try case-insensitive
    for (const [mapMake, models] of Object.entries(engineMap)) {
      if (mapMake === '_comment') continue;
      if (mapMake.toLowerCase() === make.toLowerCase()) {
        return findModelInMake(models, model);
      }
    }
    return null;
  }
  return findModelInMake(makeEntry, model);
}

function findModelInMake(makeEntry, model) {
  // Exact match
  if (makeEntry[model]) return makeEntry[model];

  // Case-insensitive match
  const modelLower = model.toLowerCase();
  for (const [mapModel, entry] of Object.entries(makeEntry)) {
    const mapModelLower = mapModel.toLowerCase();
    if (mapModelLower === modelLower) return entry;
    // Partial match (bidirectional)
    if (modelLower.includes(mapModelLower) || mapModelLower.includes(modelLower)) {
      return entry;
    }
  }
  return null;
}

/**
 * Check if a text contains any of the given aliases (case-insensitive, word-boundary aware)
 */
function matchesAliases(text, aliases) {
  const textLower = text.toLowerCase();
  const matched = [];

  for (const alias of aliases) {
    const aliasLower = alias.toLowerCase();

    // For short aliases (<=3 chars), require word boundary or specific patterns
    if (aliasLower.length <= 3) {
      // Match as standalone word or as part of engine code (e.g., "V6", "V8", "I4", "I6")
      const regex = new RegExp(`\\b${escapeRegex(aliasLower)}\\b`, 'i');
      if (regex.test(text)) {
        matched.push(alias);
      }
    } else {
      // For longer aliases, simple substring match is fine
      if (textLower.includes(aliasLower)) {
        matched.push(alias);
      }
    }
  }

  return matched;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determine which engines an issue references, based on its title and description.
 * Returns array of engine entries with their trims.
 */
function findMatchingEngines(issue, mapEntry) {
  const title = issue.title || '';
  const description = issue.description || '';
  const searchText = `${title} ${description}`;

  const matchedEngines = [];

  for (const [engineName, engineData] of Object.entries(mapEntry.engines)) {
    const aliasMatches = matchesAliases(searchText, engineData.aliases);
    if (aliasMatches.length > 0) {
      matchedEngines.push({
        name: engineName,
        trims: engineData.trims,
        matchedAliases: aliasMatches,
      });
    }
  }

  return matchedEngines;
}

/**
 * Get ALL trims across ALL engines for a model (to check if restriction is meaningful)
 */
function getAllTrimsForModel(mapEntry) {
  const allTrims = new Set();
  for (const engineData of Object.values(mapEntry.engines)) {
    for (const trim of engineData.trims) {
      allTrims.add(trim);
    }
  }
  return allTrims;
}

/**
 * Check if the issue is likely engine-specific by scanning for engine keywords
 */
function isLikelyEngineSpecific(issue) {
  const text = `${issue.title || ''} ${issue.description || ''}`.toLowerCase();

  // Engine displacement patterns
  if (/\b\d\.\d[l]\b/.test(text)) return true;

  // Engine code patterns
  const engineCodes = [
    'ecoboost', 'coyote', 'voodoo', 'predator', 'godzilla',
    'hemi', 'pentastar', 'hellcat',
    'duramax', 'cummins', 'power stroke', 'powerstroke',
    'lt1', 'lt2', 'lt4', 'lt5', 'lt6', 'ls1', 'ls2', 'ls3', 'ls6', 'ls7', 'ls9',
    'ltg', 'lgx', 'l83', 'l84', 'l87', 'lm2', 'l3b',
    'n20', 'n52', 'n54', 'n55', 'n63', 'n74', 'b46', 'b48', 'b58',
    's54', 's55', 's58', 's63', 's65', 's85', 'm54', 'm62',
    'tfsi', 'tsi', 'tdi', 'ea888', 'ea211',
    'vq35', 'vq40', 'vk56', 'qr25',
    'k20c1', 'k24', 'j35',
    'skyactiv',
    'theta ii', 'theta-ii', 'lambda',
    'fa20', 'fa24', 'fb20', 'fb25', 'ej25', 'ez36',
    'b38', 'b48',
    'vcm', 'vtec', 'i-vtec',
  ];

  for (const code of engineCodes) {
    if (text.includes(code)) return true;
  }

  // Engine type patterns (only when combined with category=engine or specific context)
  if (issue.category === 'engine' || text.includes('engine')) {
    if (/\bv6\b/.test(text) || /\bv8\b/.test(text) || /\bi4\b/.test(text) || /\bi6\b/.test(text)) return true;
    if (text.includes('turbo') || text.includes('supercharged') || text.includes('diesel')) return true;
  }

  return false;
}

// ── Main Processing ──────────────────────────────────────────

console.log(`\n${'='.repeat(70)}`);
console.log(`Engine-Trim Restriction Migration ${DRY_RUN ? '(DRY RUN)' : ''}`);
console.log(`${'='.repeat(70)}\n`);
console.log(`Loaded ${issuesData.issues.length} issues`);
console.log(`Loaded engine-trim-map with ${Object.keys(engineMap).filter(k => k !== '_comment').length} makes\n`);

for (const issue of issuesData.issues) {
  // Skip if already has trims
  if (hasExistingTrims(issue)) {
    skippedHasTrims++;
    continue;
  }

  // Skip if not engine-specific
  if (!isLikelyEngineSpecific(issue)) {
    continue;
  }

  // Get make/model
  const vehicle = getIssueVehicle(issue);
  if (!vehicle) continue;

  // Find engine-trim-map entry
  const mapEntry = findEngineMapEntry(vehicle.make, vehicle.model);
  if (!mapEntry) {
    // Model not in map — either single-engine model or not mapped
    skippedNoModel++;
    unmatched.push({
      id: issue.id,
      title: issue.title,
      make: vehicle.make,
      model: vehicle.model,
      reason: 'Model not in engine-trim-map (likely single-engine)',
    });
    continue;
  }

  // Find which engines this issue references
  const matchedEngines = findMatchingEngines(issue, mapEntry);
  if (matchedEngines.length === 0) {
    skippedNoMatch++;
    unmatched.push({
      id: issue.id,
      title: issue.title,
      make: vehicle.make,
      model: vehicle.model,
      reason: 'Engine keywords found but no alias match in map',
    });
    continue;
  }

  // Union all matched engine trims
  const trimSet = new Set();
  for (const engine of matchedEngines) {
    for (const trim of engine.trims) {
      trimSet.add(trim);
    }
  }
  const trims = [...trimSet].sort();

  // If the resulting trims covers ALL trims in the model, skip (no filtering benefit)
  const allModelTrims = getAllTrimsForModel(mapEntry);
  if (trims.length >= allModelTrims.size) {
    skippedAllTrims++;
    continue;
  }

  // Apply trims
  const engineNames = matchedEngines.map((e) => e.name).join(' + ');
  const aliases = matchedEngines.flatMap((e) => e.matchedAliases);

  changes.push({
    id: issue.id,
    title: issue.title,
    make: vehicle.make,
    model: vehicle.model,
    format: issue.vehicleMatch ? 'LEGACY' : 'NEW',
    engines: engineNames,
    matchedAliases: aliases.join(', '),
    trims,
  });

  if (!DRY_RUN) {
    if (issue.vehicleMatch) {
      // Legacy format: set vehicleMatch.trims
      issue.vehicleMatch.trims = trims;
    } else {
      // New format: set top-level trims
      issue.trims = trims;
    }
  }

  updated++;
}

// ── Output Results ──────────────────────────────────────────

console.log(`\n${'─'.repeat(70)}`);
console.log('CHANGES:');
console.log(`${'─'.repeat(70)}\n`);

for (const change of changes) {
  console.log(`  ${change.format === 'LEGACY' ? '[L]' : '[N]'} ${change.id}`);
  console.log(`     ${change.make} ${change.model} — ${change.title}`);
  console.log(`     Engines: ${change.engines}`);
  console.log(`     Aliases: ${change.matchedAliases}`);
  console.log(`     Trims: [${change.trims.join(', ')}]`);
  console.log('');
}

console.log(`\n${'─'.repeat(70)}`);
console.log('SUMMARY:');
console.log(`${'─'.repeat(70)}`);
console.log(`  Updated:              ${updated}`);
console.log(`  Skipped (has trims):  ${skippedHasTrims}`);
console.log(`  Skipped (no model):   ${skippedNoModel} (single-engine models not in map)`);
console.log(`  Skipped (no match):   ${skippedNoMatch} (engine keywords found, no alias match)`);
console.log(`  Skipped (all trims):  ${skippedAllTrims} (covers all trims, no filtering benefit)`);
console.log('');

if (unmatched.length > 0) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`UNMATCHED ENGINE-SPECIFIC ISSUES (${unmatched.length}):`);
  console.log(`${'─'.repeat(70)}\n`);

  // Group by reason
  const byReason = {};
  for (const u of unmatched) {
    if (!byReason[u.reason]) byReason[u.reason] = [];
    byReason[u.reason].push(u);
  }

  for (const [reason, items] of Object.entries(byReason)) {
    console.log(`  ${reason} (${items.length}):`);
    for (const item of items.slice(0, 20)) {
      console.log(`    - ${item.make} ${item.model}: ${item.title}`);
    }
    if (items.length > 20) {
      console.log(`    ... and ${items.length - 20} more`);
    }
    console.log('');
  }
}

// Write changes
if (!DRY_RUN && updated > 0) {
  fs.writeFileSync(issuesPath, JSON.stringify(issuesData, null, 2) + '\n');
  console.log(`\nWrote ${updated} changes to ${issuesPath}`);
} else if (DRY_RUN) {
  console.log('\n(Dry run — no files modified)');
} else {
  console.log('\nNo changes to write.');
}
