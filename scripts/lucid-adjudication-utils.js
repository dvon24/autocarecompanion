/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];

const SOURCE_FILES = Object.freeze([
  { period: '2020-2024', path: 'C:/tmp/MFR_COMMS_RECEIVED_2020-2024/MFR_COMMS_RECEIVED_2020-2024.csv', length: 125521629, sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf' },
  { period: '2025-2026', path: 'C:/tmp/MFR_COMMS_RECEIVED_2025-2026/MFR_COMMS_RECEIVED_2025-2026.csv', length: 77786229, sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c' },
]);

const RECALL_FILES = Object.freeze([
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);

function stableValue(value) { if (Array.isArray(value)) return value.map(stableValue); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])])); return value; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function hashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex'); }
function fullRecord(row) { return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])])); }
function diffFields(before, after) { return FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(after[field])); }
function normalizedFileHash(file, fileSystem = require('node:fs')) { return crypto.createHash('sha256').update(fileSystem.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); }

module.exports = { FULL_RECORD_FIELDS, RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue };
