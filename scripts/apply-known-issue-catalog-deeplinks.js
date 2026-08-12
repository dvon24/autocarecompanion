/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Drift-safe catalog KnownIssue repair-link applicator.
 *
 * Decisions are reviewed JSON manifests. The script never researches or
 * invents a part: it only validates, dry-runs, transactionally applies, and
 * verifies an exact approved after-state.
 *
 *   node scripts/apply-known-issue-catalog-deeplinks.js --dry-run --all
 *   node scripts/apply-known-issue-catalog-deeplinks.js --apply --manifest data/...json
 *   node scripts/apply-known-issue-catalog-deeplinks.js --verify --all
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_DECISIONS_DIR = path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-decisions');
const DEFAULT_RESULTS_DIR = path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-results');
const DISPOSITIONS = new Set(['keep', 'replace', 'remove', 'recall-dealer', 'diagnosis-hold', 'no-commerce']);
const HASH_RE = /^[a-f0-9]{64}$/;
const GIT_OID_RE = /^[a-f0-9]{40}$/;
const URL_FIELDS = ['affiliateUrl', 'affiliateLink', 'amazonLink'];
const SEARCH_QUERY_KEYS = new Set(['q', 'k', '_nkw', 'query', 'keyword', 'keywords', 'search', 'searchterm', 'text']);
const FULL_RECORD_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
]);
const FULL_ARRAY_FIELDS = new Set([
  'years', 'trims', 'engines', 'symptoms', 'affectedSystems', 'dtcCodes', 'citations',
  'communityRecommendations', 'fixParts', 'relatedIssueIds',
]);
const FULL_JSON_FIELDS = new Set(['citations', 'communityRecommendations', 'fixParts']);
const FULL_NULLABLE_INTEGER_FIELDS = new Set([
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
]);
const CATEGORY_VALUES = new Set([
  'engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling',
  'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other',
]);
const LEVEL_VALUES = new Set(['high', 'medium', 'low']);
const SOURCE_VALUES = new Set(['nhtsa-verified', 'recall-related', 'ai-researched', 'manual']);
const CITATION_TYPES = new Set(['tsb', 'recall', 'forum', 'manual', 'nhtsa', 'manufacturer', 'investigation']);

function hashValue(value) {
  const serialized = JSON.stringify(value);
  return crypto.createHash('sha256').update(serialized === undefined ? 'undefined' : serialized).digest('hex');
}

function applicabilityProseTrimError(value) {
  const trim = String(value || '').trim();
  if (!trim) return 'must not be blank';
  if (/^(?:only\s+)?vehicles?\b/i.test(trim)
    || /\b(?:vin(?:-specific)?|verify|confirm|applicability|campaign|recall|included in|production date|built (?:from|between|before|after|on)|sales code|equipped with|open action|software level)\b/i.test(trim)) {
    return 'contains applicability prose; trims[] may contain literal trim names only';
  }
  return null;
}

function identityContinuityError(issue) {
  if (!issue || !issue.before || !issue.after) return null;
  if (issue.before.titleHash === hashValue(issue.after.title)) return null;
  return 'cannot rename or substitute an existing issue in the catalog audit; create a new issue ID and reviewed redirect instead';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function recommendationsForContentAudit(value) {
  // Preserve invalid Prisma Json container shapes so full-record verification
  // fails closed. clickCount is ignorable only inside a real recommendation array.
  if (!Array.isArray(value)) return cloneValue(value);
  return value.map((recommendation) => {
    if (!recommendation || typeof recommendation !== 'object' || Array.isArray(recommendation)) {
      return cloneValue(recommendation);
    }
    // clickCount is mutable telemetry mirrored from AffiliateClick, not part of
    // the reviewed repair guidance. A legitimate click must not make an exact
    // schema-v2 content after-state look drifted.
    const content = { ...recommendation };
    delete content.clickCount;
    return cloneValue(content);
  });
}

function recommendationsContentEqual(left, right) {
  return jsonEqual(recommendationsForContentAudit(left), recommendationsForContentAudit(right));
}

function fullRecordSnapshot(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => {
    const vehicleValue = row && row.vehicle && ['make', 'model', 'years', 'trims', 'engines'].includes(field)
      ? row.vehicle[field] : undefined;
    const value = row && row[field] !== undefined ? row[field] : vehicleValue;
    if (field === 'communityRecommendations') return [field, recommendationsForContentAudit(value)];
    // Do not normalize malformed JSON or PostgreSQL-array containers to [].
    if (FULL_ARRAY_FIELDS.has(field)) return [field, cloneValue(value)];
    if (FULL_NULLABLE_INTEGER_FIELDS.has(field)) return [field, value !== undefined ? value : null];
    if (field === 'humanApproved') return [field, value === true];
    if (field === 'reportCount') return [field, Number.isInteger(value) ? value : 0];
    return [field, cloneValue(value !== undefined ? value : '')];
  }));
}

function fullRecordHashes(row) {
  const fields = fullRecordSnapshot(row);
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [`${field}Hash`, hashValue(stableValue(fields[field]))]));
}

function isFullRecordManifest(manifest) {
  return Boolean(manifest && [2, 3].includes(manifest.schemaVersion) && manifest.auditScope === 'full-record');
}

function validateReviewedBatchContract(manifest, errors) {
  const requiredStrings = ['sourceRef', 'baselineRef', 'packetSlug', 'make'];
  for (const field of requiredStrings) {
    if (typeof manifest[field] !== 'string' || !manifest[field].trim()) errors.push(`schemaVersion 3 requires ${field}`);
  }
  for (const field of ['sourceCommit', 'baselineCommit']) {
    if (!GIT_OID_RE.test(manifest[field] || '')) errors.push(`schemaVersion 3 requires valid ${field}`);
  }
  if (!Array.isArray(manifest.packets) || manifest.packets.length === 0) {
    errors.push('schemaVersion 3 requires non-empty packets');
    return;
  }
  const packetFiles = new Set();
  let packetRows = 0;
  for (const [index, packet] of manifest.packets.entries()) {
    if (!packet || typeof packet !== 'object') {
      errors.push(`packets[${index}] must be an object`);
      continue;
    }
    if (typeof packet.file !== 'string' || !packet.file.trim() || packetFiles.has(packet.file)) {
      errors.push(`packets[${index}].file must be unique and non-empty`);
    } else packetFiles.add(packet.file);
    if (!HASH_RE.test(packet.sha256 || '')) errors.push(`packets[${index}].sha256`);
    const total = packet.summary && packet.summary.total;
    if (!Number.isInteger(total) || total < 0) errors.push(`packets[${index}].summary.total`);
    else packetRows += total;
  }
  if (!Number.isInteger(manifest.packetCount) || manifest.packetCount !== manifest.packets.length) {
    errors.push('packetCount must equal packets.length');
  }
  if (!Number.isInteger(manifest.packetRowCount) || manifest.packetRowCount !== packetRows) {
    errors.push('packetRowCount must equal packet summary totals');
  }
  if (!Number.isInteger(manifest.writeRowCount) || manifest.writeRowCount !== asArray(manifest.issues).length) {
    errors.push('writeRowCount must equal issues.length');
  }
  if (!Number.isInteger(manifest.heldRowCount) || manifest.heldRowCount < 0
    || manifest.heldRowCount + manifest.writeRowCount !== manifest.packetRowCount) {
    errors.push('heldRowCount plus writeRowCount must equal packetRowCount');
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function jsonEqual(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function productUrlError(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return 'invalid URL';
  }
  if (parsed.protocol !== 'https:') return 'URL must use https';
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = parsed.pathname.toLowerCase();
  for (const key of parsed.searchParams.keys()) {
    if (SEARCH_QUERY_KEYS.has(key.toLowerCase())) return `search query parameter ${key}`;
  }
  if (/(^|\/)(s|search|search-results?|sch|partsearch|category|catalog)(\/|$)/i.test(pathname)) {
    return 'search/category URL';
  }
  const amazonHost = host === 'amazon.com' || host.endsWith('.amazon.com') || /^amazon\.[a-z.]+$/.test(host) || /\.amazon\.[a-z.]+$/.test(host);
  const ebayHost = host === 'ebay.com' || host.endsWith('.ebay.com') || /^ebay\.[a-z.]+$/.test(host) || /\.ebay\.[a-z.]+$/.test(host);
  if (amazonHost) {
    if (!/(^|\/)(dp|gp\/product)\/[a-z0-9]{10}(\/|$)/i.test(pathname)) return 'Amazon URL is not a product detail page';
  }
  if (ebayHost) {
    if (!/(^|\/)itm(\/|$)/i.test(pathname)) return 'eBay URL is not an item page';
  }
  if (pathname === '/' || pathname.length < 4) return 'URL has no product path';
  return null;
}

function vendorMatchesUrl(vendor, value) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
    const normalized = String(vendor || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized === 'amazon') return host === 'amazon.com' || host.endsWith('.amazon.com') || /^amazon\.[a-z.]+$/.test(host) || /\.amazon\.[a-z.]+$/.test(host);
    if (normalized === 'ebay') return host === 'ebay.com' || host.endsWith('.ebay.com') || /^ebay\.[a-z.]+$/.test(host) || /\.ebay\.[a-z.]+$/.test(host);
    const hostBrand = host.split('.').slice(-2, -1)[0].replace(/[^a-z0-9]/g, '');
    return normalized.length >= 3 && (hostBrand.includes(normalized) || normalized.includes(hostBrand));
  } catch {
    return false;
  }
}

function recommendationHasCommerce(rec) {
  return rec && (rec.type === 'part' || URL_FIELDS.some((field) => typeof rec[field] === 'string' && rec[field].trim()));
}

function claimIdsForData(fixParts, recommendations) {
  const ids = [];
  asArray(fixParts).forEach((_, index) => ids.push(`fixParts:${index}`));
  asArray(recommendations).forEach((rec, index) => {
    if (recommendationHasCommerce(rec)) ids.push(`communityRecommendations:${index}`);
  });
  return ids;
}

function claimIdsForRow(row) {
  return claimIdsForData(row.fixParts, row.communityRecommendations);
}

function commerceUrls(after) {
  const urls = [];
  asArray(after.fixParts).forEach((part, partIndex) => {
    asArray(part.buyLinks).forEach((link, linkIndex) => {
      urls.push({ path: `fixParts[${partIndex}].buyLinks[${linkIndex}]`, vendor: link.vendor, url: link.url, link });
    });
  });
  asArray(after.communityRecommendations).forEach((rec, recIndex) => {
    URL_FIELDS.forEach((field) => {
      if (typeof rec[field] === 'string' && rec[field].trim()) {
        urls.push({ path: `communityRecommendations[${recIndex}].${field}`, vendor: field === 'amazonLink' ? 'Amazon' : '', url: rec[field], link: rec });
      }
    });
  });
  return urls;
}

function snapshotFields(row) {
  return {
    years: asArray(row.years !== undefined ? row.years : row.vehicle && row.vehicle.years),
    trims: asArray(row.trims !== undefined ? row.trims : row.vehicle && row.vehicle.trims),
    engines: asArray(row.engines !== undefined ? row.engines : row.vehicle && row.vehicle.engines),
    description: row.description,
    solution: row.solution,
    dtcCodes: asArray(row.dtcCodes),
    citations: asArray(row.citations),
    communityRecommendations: asArray(row.communityRecommendations),
    fixParts: asArray(row.fixParts),
    contentUpdatedOn: row.contentUpdatedOn || '',
    contentUpdateSummary: row.contentUpdateSummary || '',
  };
}

function beforeHashes(row) {
  const fields = snapshotFields(row);
  return {
    titleHash: hashValue(row.title),
    yearsHash: hashValue(fields.years),
    trimsHash: hashValue(fields.trims),
    enginesHash: hashValue(fields.engines),
    descriptionHash: hashValue(fields.description),
    solutionHash: hashValue(fields.solution),
    dtcCodesHash: hashValue(fields.dtcCodes),
    citationsHash: hashValue(fields.citations),
    communityHash: hashValue(fields.communityRecommendations),
    fixPartsHash: hashValue(fields.fixParts),
    contentUpdatedOnHash: hashValue(fields.contentUpdatedOn),
    contentUpdateSummaryHash: hashValue(fields.contentUpdateSummary),
  };
}

function afterHashes(after) {
  const hashes = {
    yearsHash: hashValue(asArray(after.years)),
    trimsHash: hashValue(asArray(after.trims)),
    enginesHash: hashValue(asArray(after.engines)),
    descriptionHash: hashValue(after.description),
    solutionHash: hashValue(after.solution),
    dtcCodesHash: hashValue(asArray(after.dtcCodes)),
    citationsHash: hashValue(asArray(after.citations)),
    communityHash: hashValue(asArray(after.communityRecommendations)),
    fixPartsHash: hashValue(asArray(after.fixParts)),
    contentUpdatedOnHash: hashValue(after.contentUpdatedOn || ''),
    contentUpdateSummaryHash: hashValue(after.contentUpdateSummary || ''),
  };
  if (Object.prototype.hasOwnProperty.call(after, 'title')) hashes.titleHash = hashValue(after.title);
  return hashes;
}

function validateCitation(citation, pathName, errors) {
  if (!citation || typeof citation !== 'object') {
    errors.push(`${pathName} must be an object`);
    return;
  }
  if (!CITATION_TYPES.has(citation.type)) errors.push(`${pathName}.type`);
  if (typeof citation.title !== 'string' || !citation.title.trim()) errors.push(`${pathName}.title`);
  if (citation.url !== undefined) {
    try {
      const parsed = new URL(citation.url);
      if (parsed.protocol !== 'https:') errors.push(`${pathName}.url must use https`);
    } catch {
      errors.push(`${pathName}.url`);
    }
  }
}

function validateFullRecordIssue(issue, prefix, errors) {
  for (const field of FULL_RECORD_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(issue.before, `${field}Hash`) || !HASH_RE.test(issue.before[`${field}Hash`] || '')) {
      errors.push(`${prefix}: invalid before.${field}Hash`);
    }
    if (!Object.prototype.hasOwnProperty.call(issue.after, field)) errors.push(`${prefix}: missing after.${field}`);
  }
  const after = issue.after;
  for (const field of ['make', 'model', 'category', 'title', 'description', 'solution', 'severity', 'confidence', 'source', 'status', 'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']) {
    if (typeof after[field] !== 'string') errors.push(`${prefix}: after.${field} must be a string`);
  }
  if (!String(after.make || '').trim() || !String(after.model || '').trim() || !String(after.title || '').trim()
    || !String(after.description || '').trim() || !String(after.solution || '').trim()) {
    errors.push(`${prefix}: make, model, title, description, and solution are required`);
  }
  if (!CATEGORY_VALUES.has(after.category)) errors.push(`${prefix}: invalid after.category`);
  if (!LEVEL_VALUES.has(after.severity)) errors.push(`${prefix}: invalid after.severity`);
  if (!LEVEL_VALUES.has(after.confidence)) errors.push(`${prefix}: invalid after.confidence`);
  if (!SOURCE_VALUES.has(after.source)) errors.push(`${prefix}: invalid after.source`);
  const validStatus = after.status === 'published';
  if (!validStatus) {
    errors.push(`${prefix}: after.status must remain published; use a separately reviewed archival workflow for removals`);
  }
  if (after.humanApproved !== true) errors.push(`${prefix}: after.humanApproved must be true`);
  if (!Number.isInteger(after.reportCount) || after.reportCount < 0) errors.push(`${prefix}: after.reportCount must be a non-negative integer`);
  for (const field of FULL_NULLABLE_INTEGER_FIELDS) {
    if (after[field] !== null && (!Number.isInteger(after[field]) || after[field] < 0)) {
      errors.push(`${prefix}: after.${field} must be null or a non-negative integer`);
    }
  }
  if (after.estimatedCostLow !== null && after.estimatedCostHigh !== null && after.estimatedCostLow > after.estimatedCostHigh) {
    errors.push(`${prefix}: estimated cost range is reversed`);
  }
  if (after.typicalMileageLow !== null && after.typicalMileageHigh !== null && after.typicalMileageLow > after.typicalMileageHigh) {
    errors.push(`${prefix}: typical mileage range is reversed`);
  }
  const stringArrays = ['trims', 'engines', 'symptoms', 'affectedSystems', 'dtcCodes', 'relatedIssueIds'];
  if (!Array.isArray(after.years) || !after.years.every(Number.isInteger) || after.years.length === 0) {
    errors.push(`${prefix}: after.years must be a non-empty integer array`);
  }
  for (const field of stringArrays) {
    if (!Array.isArray(after[field]) || !after[field].every((value) => typeof value === 'string')) {
      errors.push(`${prefix}: after.${field} must be a string array`);
    }
  }
  for (const [index, trim] of asArray(after.trims).entries()) {
    const trimError = applicabilityProseTrimError(trim);
    if (trimError) errors.push(`${prefix}: after.trims[${index}] ${trimError}`);
  }
  if (hashValue(after.make) !== issue.before.makeHash || hashValue(after.model) !== issue.before.modelHash
    || hashValue(after.category) !== issue.before.categoryHash) {
    errors.push(`${prefix}: full-record audits cannot move an existing issue to a different make/model/category`);
  }
  const continuityError = identityContinuityError(issue);
  if (continuityError) errors.push(`${prefix}: ${continuityError}`);
  if (!Array.isArray(after.citations) || after.citations.length === 0) errors.push(`${prefix}: after.citations must be non-empty`);
  else after.citations.forEach((citation, index) => validateCitation(citation, `${prefix}: after.citations[${index}]`, errors));
  if (!Array.isArray(after.communityRecommendations)) errors.push(`${prefix}: after.communityRecommendations must be an array`);
  if (!Array.isArray(after.fixParts)) errors.push(`${prefix}: after.fixParts must be an array`);
  for (const [index, rec] of asArray(after.communityRecommendations).entries()) {
    if (!rec || typeof rec !== 'object' || !['part', 'tip', 'warning'].includes(rec.type)
      || typeof rec.content !== 'string' || !rec.content.trim()) {
      errors.push(`${prefix}: invalid after.communityRecommendations[${index}]`);
    }
    if (URL_FIELDS.some((field) => typeof rec[field] === 'string' && rec[field].trim())) {
      errors.push(`${prefix}: communityRecommendations[${index}] cannot contain commerce links in a full-record audit`);
    }
  }
  for (const [index, part] of asArray(after.fixParts).entries()) {
    if (!part || typeof part !== 'object' || typeof part.component !== 'string' || !part.component.trim()) {
      errors.push(`${prefix}: invalid after.fixParts[${index}].component`);
    }
    if (!Array.isArray(part && part.buyLinks)) errors.push(`${prefix}: after.fixParts[${index}].buyLinks must be an array`);
    if (part && part.recallFirst === true && (!String(part.note || '').trim() || asArray(part.buyLinks).length > 0)) {
      errors.push(`${prefix}: recall-first fixParts[${index}] requires a note and no buy links`);
    }
  }
}

function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  if (![1, 2, 3].includes(manifest.schemaVersion)) errors.push('schemaVersion must be 1, 2, or 3');
  if ([2, 3].includes(manifest.schemaVersion) && manifest.auditScope !== 'full-record') {
    errors.push(`schemaVersion ${manifest.schemaVersion} requires auditScope full-record`);
  }
  if (manifest.manifestKind !== 'known-issues-catalog-deeplinks') errors.push('manifestKind');
  if (!/^[a-z0-9][a-z0-9._-]{2,100}$/i.test(manifest.batchId || '')) errors.push('batchId');
  if (!Array.isArray(manifest.issues) || manifest.issues.length === 0) errors.push('issues must be a non-empty array');
  if (manifest.schemaVersion === 3) validateReviewedBatchContract(manifest, errors);
  const seenIds = new Set();
  for (const issue of asArray(manifest.issues)) {
    const prefix = issue && issue.id ? issue.id : '<missing-id>';
    if (!issue || typeof issue !== 'object') { errors.push('issue entry must be an object'); continue; }
    if (!issue.id || seenIds.has(issue.id)) errors.push(`${prefix}: missing or duplicate id`);
    seenIds.add(issue.id);
    if (!DISPOSITIONS.has(issue.disposition)) errors.push(`${prefix}: invalid disposition`);
    if (!Array.isArray(issue.evidence) || issue.evidence.length === 0) errors.push(`${prefix}: evidence is required`);
    if (!issue.before || !issue.after) { errors.push(`${prefix}: before and after are required`); continue; }
    if (isFullRecordManifest(manifest)) validateFullRecordIssue(issue, prefix, errors);
    else for (const key of ['yearsHash', 'trimsHash', 'enginesHash', 'descriptionHash', 'solutionHash', 'dtcCodesHash', 'citationsHash', 'communityHash', 'fixPartsHash', 'contentUpdatedOnHash', 'contentUpdateSummaryHash']) {
      if (!HASH_RE.test(issue.before[key] || '')) errors.push(`${prefix}: invalid before.${key}`);
    }
    const guardsTitle = Object.prototype.hasOwnProperty.call(issue.before, 'titleHash')
      || Object.prototype.hasOwnProperty.call(issue.after, 'title');
    if (guardsTitle && (!HASH_RE.test(issue.before.titleHash || '') || typeof issue.after.title !== 'string' || !issue.after.title.trim())) {
      errors.push(`${prefix}: guarded title requires before.titleHash and non-empty after.title`);
    }
    if (!Array.isArray(issue.before.claimIds) || new Set(issue.before.claimIds).size !== issue.before.claimIds.length) {
      errors.push(`${prefix}: before.claimIds must be a unique array`);
    }
    for (const key of ['description', 'solution', 'contentUpdatedOn', 'contentUpdateSummary']) {
      if (typeof issue.after[key] !== 'string') errors.push(`${prefix}: after.${key} must be a string`);
    }
    if (!Array.isArray(issue.after.years) || !issue.after.years.every(Number.isInteger)
      || !Array.isArray(issue.after.trims) || !issue.after.trims.every((value) => typeof value === 'string')
      || !Array.isArray(issue.after.engines) || !issue.after.engines.every((value) => typeof value === 'string')
      || !Array.isArray(issue.after.dtcCodes) || !issue.after.dtcCodes.every((value) => typeof value === 'string')
      || !Array.isArray(issue.after.citations)
      || !Array.isArray(issue.after.communityRecommendations) || !Array.isArray(issue.after.fixParts)) {
      errors.push(`${prefix}: after arrays are required`);
      continue;
    }
    const expectedAfterHashes = isFullRecordManifest(manifest) ? fullRecordHashes(issue.after) : afterHashes(issue.after);
    const changed = Object.entries(expectedAfterHashes).some(([key, value]) => value !== issue.before[key]);
    if (issue.disposition === 'keep' && changed) errors.push(`${prefix}: keep disposition changes content`);
    if (changed && (!isIsoDate(issue.after.contentUpdatedOn) || !issue.after.contentUpdateSummary.trim())) {
      errors.push(`${prefix}: meaningful changes require correction date and summary`);
    }
    const urls = commerceUrls(issue.after);
    for (const entry of urls) {
      const urlError = productUrlError(entry.url);
      if (urlError) errors.push(`${prefix}: ${entry.path} ${urlError}`);
      if (entry.vendor && !vendorMatchesUrl(entry.vendor, entry.url)) errors.push(`${prefix}: ${entry.path} vendor/URL mismatch`);
      if (entry.path.includes('.buyLinks[') && (entry.link.linkType !== 'product' || entry.link.verified !== true)) {
        errors.push(`${prefix}: ${entry.path} must be marked product and verified`);
      }
    }
    for (const [index, part] of issue.after.fixParts.entries()) {
      if (part && part.recallFirst && asArray(part.buyLinks).length > 0) errors.push(`${prefix}: recall-first fixParts[${index}] cannot have buy links`);
    }
    if (['remove', 'recall-dealer', 'diagnosis-hold', 'no-commerce'].includes(issue.disposition) && urls.length > 0) {
      errors.push(`${prefix}: ${issue.disposition} disposition cannot retain commerce URLs`);
    }
  }
  return errors;
}

function issueUsesFullRecord(issue) {
  return Boolean(issue && issue.before && HASH_RE.test(issue.before.makeHash || '')
    && issue.after && Object.prototype.hasOwnProperty.call(issue.after, 'status'));
}

function beforeErrors(row, issue) {
  const actual = issueUsesFullRecord(issue) ? fullRecordHashes(row) : beforeHashes(row);
  const errors = [];
  for (const [key, expected] of Object.entries(issue.before)) {
    if (key !== 'claimIds' && actual[key] !== expected) errors.push(key);
  }
  if (!jsonEqual(claimIdsForRow(row), issue.before.claimIds)) errors.push('claimIds');
  return errors;
}

function afterErrors(row, issue) {
  const actual = issueUsesFullRecord(issue) ? fullRecordSnapshot(row) : snapshotFields(row);
  const errors = [];
  for (const key of Object.keys(actual)) {
    const equal = key === 'communityRecommendations'
      ? recommendationsContentEqual(actual[key], issue.after[key])
      : jsonEqual(actual[key], issue.after[key]);
    if (!equal) errors.push(key);
  }
  if (!issueUsesFullRecord(issue) && Object.prototype.hasOwnProperty.call(issue.after, 'title') && !jsonEqual(row.title, issue.after.title)) errors.push('title');
  return errors;
}

function evaluateRows(rows, manifest) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const states = [];
  const drift = [];
  for (const issue of manifest.issues) {
    const row = byId.get(issue.id);
    if (!row) { drift.push(`${issue.id}: missing row`); continue; }
    const before = beforeErrors(row, issue);
    const after = afterErrors(row, issue);
    if (before.length === 0 && after.length === 0) states.push('both');
    else if (before.length === 0) states.push('before');
    else if (after.length === 0) states.push('after');
    else drift.push(`${issue.id}: before drift [${before.join(', ')}], after drift [${after.join(', ')}]`);
  }
  if (rows.length !== manifest.issues.length) drift.push(`query returned ${rows.length} rows; expected ${manifest.issues.length}`);
  const materialStates = new Set(states.filter((state) => state !== 'both'));
  if (materialStates.size > 1) drift.push('mixed before/after state');
  return { state: drift.length ? 'drift' : (materialStates.values().next().value || 'after'), drift };
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function manifestFilesFromArgs(args) {
  const explicit = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--manifest' && args[index + 1]) explicit.push(path.resolve(PROJECT_ROOT, args[++index]));
  }
  if (args.includes('--all')) {
    const dirIndex = args.indexOf('--decisions-dir');
    const dir = dirIndex >= 0 && args[dirIndex + 1] ? path.resolve(PROJECT_ROOT, args[dirIndex + 1]) : DEFAULT_DECISIONS_DIR;
    if (!fs.existsSync(dir)) throw new Error(`Decision directory not found: ${dir}`);
    explicit.push(...fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => path.join(dir, name)));
  }
  return [...new Set(explicit)];
}

function loadManifests(args) {
  const files = manifestFilesFromArgs(args);
  if (files.length === 0) throw new Error('Provide --manifest <file> or --all.');
  const batchIds = new Set();
  const issueOwners = new Map();
  return files.map((file) => {
    const manifest = loadJson(file);
    const errors = validateManifest(manifest);
    if (errors.length) throw new Error(`${path.relative(PROJECT_ROOT, file)}: ${errors.join('; ')}`);
    if (batchIds.has(manifest.batchId)) throw new Error(`Duplicate batchId: ${manifest.batchId}`);
    batchIds.add(manifest.batchId);
    for (const issue of manifest.issues) {
      const scopeFamily = isFullRecordManifest(manifest) ? 'full-record' : 'legacy-partial';
      const ownerKey = `${scopeFamily}:${issue.id}`;
      if (issueOwners.has(ownerKey)) {
        throw new Error(`Issue ${issue.id} appears in both ${issueOwners.get(ownerKey)} and ${manifest.batchId} for ${scopeFamily}`);
      }
      issueOwners.set(ownerKey, manifest.batchId);
    }
    return { file, manifest };
  });
}

function filterSupersededLegacyManifests(manifests) {
  const fullRecordIssueIds = new Set(
    manifests
      .filter(({ manifest }) => isFullRecordManifest(manifest))
      .flatMap(({ manifest }) => manifest.issues.map((issue) => issue.id)),
  );
  const active = [];
  const superseded = [];
  for (const entry of manifests) {
    if (isFullRecordManifest(entry.manifest)) {
      active.push(entry);
      continue;
    }
    const overlapCount = entry.manifest.issues.filter((issue) => fullRecordIssueIds.has(issue.id)).length;
    if (overlapCount === 0) {
      active.push(entry);
      continue;
    }
    if (overlapCount !== entry.manifest.issues.length) {
      throw new Error(`${entry.manifest.batchId}: legacy manifest is only partially superseded by schema-v2 decisions`);
    }
    superseded.push(entry.manifest.batchId);
  }
  return { active, superseded };
}

async function selectRows(client, ids, lock = false, fullRecord = false) {
  const columns = fullRecord
    ? ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', ')
    : `id, title, years, trims, engines, description, solution, "dtcCodes", citations,
            "communityRecommendations", "fixParts", "contentUpdatedOn", "contentUpdateSummary"`;
  const result = await client.query(
    `SELECT ${columns}
       FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id${lock ? ' FOR UPDATE' : ''}`,
    [ids],
  );
  return result.rows;
}

function resultPath(batchId) {
  return path.join(DEFAULT_RESULTS_DIR, `${batchId}.json`);
}

function buildResult(manifest, rows, state) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const fullRecord = isFullRecordManifest(manifest);
  return {
    schemaVersion: manifest.schemaVersion,
    ...(fullRecord ? { auditScope: 'full-record' } : {}),
    batchId: manifest.batchId,
    manifestHash: hashValue(manifest),
    status: 'applied-and-verified',
    state,
    completedAt: new Date().toISOString(),
    issues: manifest.issues.map((issue) => ({
      id: issue.id,
      disposition: issue.disposition,
      afterHashes: fullRecord
        ? fullRecordHashes(byId.get(issue.id))
        : afterHashes({
          ...snapshotFields(byId.get(issue.id)),
          ...(Object.prototype.hasOwnProperty.call(issue.after, 'title') ? { title: byId.get(issue.id).title } : {}),
        }),
    })),
  };
}

function validateResult(result, manifest, rows) {
  const errors = [];
  if (!result || result.batchId !== manifest.batchId) errors.push('batchId');
  if (result && result.manifestHash !== hashValue(manifest)) errors.push('manifestHash');
  if (!result || result.status !== 'applied-and-verified') errors.push('status');
  if (!result || result.schemaVersion !== manifest.schemaVersion) errors.push('schemaVersion');
  if (isFullRecordManifest(manifest) && result.auditScope !== 'full-record') errors.push('auditScope');
  const byResult = new Map(asArray(result && result.issues).map((issue) => [issue.id, issue]));
  const byRow = new Map(rows.map((row) => [row.id, row]));
  for (const issue of manifest.issues) {
    const recorded = byResult.get(issue.id);
    const row = byRow.get(issue.id);
    const actualHashes = row && (isFullRecordManifest(manifest)
      ? fullRecordHashes(row)
      : afterHashes({
        ...snapshotFields(row),
        ...(Object.prototype.hasOwnProperty.call(issue.after, 'title') ? { title: row.title } : {}),
      }));
    if (!recorded || !row) {
      errors.push(`${issue.id}: after hashes`);
      continue;
    }
    const hashMismatches = Object.keys(actualHashes).filter((key) => recorded.afterHashes[key] !== actualHashes[key]);
    const communityHashKey = isFullRecordManifest(manifest) ? 'communityRecommendationsHash' : 'communityHash';
    const substantiveMismatches = hashMismatches.filter((key) => key !== communityHashKey);
    if (substantiveMismatches.length
      || (hashMismatches.includes(communityHashKey)
        && !recommendationsContentEqual(row.communityRecommendations, issue.after.communityRecommendations))) {
      errors.push(`${issue.id}: after hashes`);
    }
  }
  return errors;
}

function fullRecordUpdateStatement(issue) {
  const values = [issue.id];
  const assignments = FULL_RECORD_FIELDS.map((field, index) => {
    const value = issue.after[field];
    values.push(FULL_JSON_FIELDS.has(field) ? JSON.stringify(value) : value);
    const cast = FULL_JSON_FIELDS.has(field) ? '::jsonb'
      : field === 'years' ? '::int[]'
        : FULL_ARRAY_FIELDS.has(field) ? '::text[]' : '';
    return `"${field}"=$${index + 2}${cast}`;
  });
  return {
    text: `UPDATE "KnownIssue" SET ${assignments.join(', ')}, "updatedAt"=NOW() WHERE id=$1`,
    values,
  };
}

async function updateFullRecord(client, issue) {
  const statement = fullRecordUpdateStatement(issue);
  await client.query(statement.text, statement.values);
}

function writeResult(result) {
  fs.mkdirSync(DEFAULT_RESULTS_DIR, { recursive: true });
  const target = resultPath(result.batchId);
  const temp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, target);
}

function firstConnectionString(values) {
  return values.POSTGRES_PRISMA_URL || values.DATABASE_URL || values.DIRECT_URL || null;
}

function parseEnvFile(envPath) {
  let source;
  try {
    source = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read known-issue env file ${envPath}: ${error.message}`);
  }
  return require('dotenv').parse(source);
}

function resolveKnownIssueConnectionString(environment = process.env) {
  const explicitEnvPath = environment.KNOWN_ISSUE_ENV_FILE;
  if (explicitEnvPath) {
    const explicitValues = parseEnvFile(path.resolve(explicitEnvPath));
    const explicitConnectionString = firstConnectionString(explicitValues);
    if (!explicitConnectionString) {
      throw new Error(
        `KNOWN_ISSUE_ENV_FILE ${explicitEnvPath} has no POSTGRES_PRISMA_URL, DATABASE_URL, or DIRECT_URL.`,
      );
    }
    return explicitConnectionString;
  }

  const defaultEnvPath = path.join(PROJECT_ROOT, '.env.local');
  const defaultValues = fs.existsSync(defaultEnvPath) ? parseEnvFile(defaultEnvPath) : {};
  const connectionString = firstConnectionString({ ...defaultValues, ...environment });
  if (!connectionString) {
    throw new Error('No POSTGRES_PRISMA_URL, DATABASE_URL, or DIRECT_URL set.');
  }
  return connectionString;
}

async function applyBatch(pool, manifest, mode) {
  const ids = manifest.issues.map((issue) => issue.id);
  const fullRecord = isFullRecordManifest(manifest);
  if (mode !== 'apply') {
    const rows = await selectRows(pool, ids, false, fullRecord);
    const evaluation = evaluateRows(rows, manifest);
    if (evaluation.state === 'drift') throw new Error(`${manifest.batchId}: ${evaluation.drift.join('; ')}`);
    if (mode === 'verify') {
      if (evaluation.state !== 'after') throw new Error(`${manifest.batchId}: database is still at before-state`);
      const file = resultPath(manifest.batchId);
      if (!fs.existsSync(file)) throw new Error(`${manifest.batchId}: result artifact missing`);
      const resultErrors = validateResult(loadJson(file), manifest, rows);
      if (resultErrors.length) throw new Error(`${manifest.batchId}: result drift [${resultErrors.join(', ')}]`);
    }
    return { batchId: manifest.batchId, state: evaluation.state, issueCount: ids.length };
  }

  const client = await pool.connect();
  let afterRows;
  let initialState;
  try {
    await client.query('BEGIN');
    const rows = await selectRows(client, ids, true, fullRecord);
    const evaluation = evaluateRows(rows, manifest);
    if (evaluation.state === 'drift') throw new Error(`${manifest.batchId}: ${evaluation.drift.join('; ')}`);
    initialState = evaluation.state;
    if (evaluation.state === 'before') {
      for (const issue of manifest.issues) {
        const row = rows.find((candidate) => candidate.id === issue.id);
        if (afterErrors(row, issue).length === 0) continue;
        if (fullRecord) await updateFullRecord(client, issue);
        else await client.query(
          `UPDATE "KnownIssue" SET years=$2::int[], trims=$3::text[], engines=$4::text[],
             description=$5, solution=$6, "dtcCodes"=$7::text[], citations=$8::jsonb,
             "communityRecommendations"=$9::jsonb, "fixParts"=$10::jsonb,
             "contentUpdatedOn"=$11, "contentUpdateSummary"=$12, title=$13, "updatedAt"=NOW()
           WHERE id=$1`,
          [issue.id, issue.after.years, issue.after.trims, issue.after.engines,
            issue.after.description, issue.after.solution, issue.after.dtcCodes, JSON.stringify(issue.after.citations),
            JSON.stringify(issue.after.communityRecommendations), JSON.stringify(issue.after.fixParts),
            issue.after.contentUpdatedOn, issue.after.contentUpdateSummary,
            Object.prototype.hasOwnProperty.call(issue.after, 'title') ? issue.after.title : row.title],
        );
      }
    }
    afterRows = await selectRows(client, ids, false, fullRecord);
    const verified = evaluateRows(afterRows, manifest);
    if (verified.state !== 'after') throw new Error(`${manifest.batchId}: post-write verification failed: ${verified.drift.join('; ')}`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
  const result = buildResult(manifest, afterRows, initialState === 'before' ? 'applied' : 'already-applied');
  writeResult(result);
  return { batchId: manifest.batchId, state: result.state, issueCount: ids.length };
}

async function run(mode, args) {
  const connectionString = resolveKnownIssueConnectionString();
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 30000 });
  try {
    const loaded = loadManifests(args);
    const selection = args.includes('--all')
      ? filterSupersededLegacyManifests(loaded)
      : { active: loaded, superseded: [] };
    const results = [];
    for (const { manifest } of selection.active) results.push(await applyBatch(pool, manifest, mode));
    return {
      mode,
      manifestCount: loaded.length,
      batchCount: results.length,
      supersededLegacyBatchCount: selection.superseded.length,
      supersededLegacyBatches: selection.superseded,
      issueCount: results.reduce((sum, item) => sum + item.issueCount, 0),
      batches: results,
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const selected = [['--dry-run', 'dry-run'], ['--apply', 'apply'], ['--verify', 'verify']].filter(([flag]) => args.includes(flag));
  if (selected.length !== 1) throw new Error('Choose exactly one mode: --dry-run, --apply, or --verify.');
  console.log(JSON.stringify(await run(selected[0][1], args), null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  FULL_RECORD_FIELDS,
  applicabilityProseTrimError,
  afterErrors,
  afterHashes,
  beforeErrors,
  beforeHashes,
  claimIdsForData,
  claimIdsForRow,
  commerceUrls,
  evaluateRows,
  filterSupersededLegacyManifests,
  fullRecordHashes,
  fullRecordSnapshot,
  fullRecordUpdateStatement,
  hashValue,
  identityContinuityError,
  isFullRecordManifest,
  issueUsesFullRecord,
  isIsoDate,
  loadManifests,
  productUrlError,
  resolveKnownIssueConnectionString,
  recommendationHasCommerce,
  snapshotFields,
  validateManifest,
  validateResult,
  vendorMatchesUrl,
};
