/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];
function stableValue(value) { if (Array.isArray(value)) return value.map(stableValue); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])])); return value; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function hashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex'); }
function fullRecord(row) { return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])])); }
function diffFields(before, after) { return FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(after[field])); }
function normalizedFileHash(file, fs = require('node:fs')) { return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); }
module.exports = { FULL_RECORD_FIELDS, clone, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue };
