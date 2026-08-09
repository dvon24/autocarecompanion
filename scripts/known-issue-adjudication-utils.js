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
  { period: '1995-1999', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/1995-1999/MFR_COMMS_RECEIVED_1995-1999.csv', length: 3443097, sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db' },
  { period: '2000-2004', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/2000-2004/MFR_COMMS_RECEIVED_2000-2004.csv', length: 8952754, sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264' },
  { period: '2005-2009', path: 'C:/tmp/nhtsa-mfr-2005-2009/MFR_COMMS_RECEIVED_2005-2009.csv', length: 5457880, sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b' },
  { period: '2010-2014', path: 'C:/tmp/MFR_COMMS_RECEIVED_2010-2014/MFR_COMMS_RECEIVED_2010-2014.csv', length: 17332775, sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387' },
  { period: '2015-2019', path: 'C:/tmp/MFR_COMMS_RECEIVED_2015-2019/MFR_COMMS_RECEIVED_2015-2019.csv', length: 144450847, sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e' },
  { period: '2020-2024', path: 'C:/tmp/MFR_COMMS_RECEIVED_2020-2024/MFR_COMMS_RECEIVED_2020-2024.csv', length: 125521629, sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf' },
  { period: '2025-2026', path: 'C:/tmp/MFR_COMMS_RECEIVED_2025-2026/MFR_COMMS_RECEIVED_2025-2026.csv', length: 77786229, sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c' },
]);

const RECALL_FILES = Object.freeze([
  { period: 'pre', path: 'C:/tmp/nhtsa-flat-rcl-pre-2010/FLAT_RCL_PRE_2010.txt', length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function hashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex'); }
function fullRecord(row) { return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])])); }
function diffFields(before, after) { return FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(after[field])); }
function normalizedFileHash(file, fileSystem = require('node:fs')) {
  return crypto.createHash('sha256').update(fileSystem.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

module.exports = { FULL_RECORD_FIELDS, RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue };
