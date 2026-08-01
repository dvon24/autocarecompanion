const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const arg = (name) => {
  const prefix = `${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : '';
};
const hash = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const label = arg('--label');
const model = arg('--model');
const slug = arg('--slug');
const batchId = arg('--batch-id');
const auditDate = arg('--audit-date');
const packetRelativePath = arg('--packet').replaceAll('\\', '/');
const blind = arg('--blind');
const edge = arg('--edge');
const proposals = arg('--proposals').split(',').filter(Boolean);
if ([label, model, slug, batchId, auditDate, packetRelativePath, blind, edge].some((value) => !value)) {
  throw new Error('Missing required BMW config-generator argument.');
}

const snapshotPath = path.join(root, 'data', 'known-issues-catalog-deeplink-snapshot.json');
const packetPath = path.join(root, packetRelativePath);
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
if (snapshot.snapshotHash !== packet.snapshotHash || packet.records.length === 0 || packet.records.some((record) => record.make !== 'BMW' || record.model !== model)) {
  throw new Error('Snapshot/packet/model identity mismatch.');
}

const q = JSON.stringify;
const text = `const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');\n\nmodule.exports = buildConfig({\n  label: ${q(label)},\n  model: ${q(model)},\n  slug: ${q(slug)},\n  batchId: ${q(batchId)},\n  auditDate: ${q(auditDate)},\n  snapshotHash: ${q(snapshot.snapshotHash)},\n  sourceSnapshotFileHash: ${q(hash(snapshotPath))},\n  packetFileHash: ${q(hash(packetPath))},\n  packetRelativePath: ${q(packetRelativePath)},\n  reviewTokens: { blind: ${q(blind)}, edge: ${q(edge)} },\n  proposalCampaigns: ${JSON.stringify(proposals, null, 2)},\n});\n`;
const output = path.join(root, 'data', 'known-issues-catalog-deeplink-decisions', `_config-${slug}-full-record.cjs`);
fs.writeFileSync(output, text, { encoding: 'utf8', flag: 'wx' });
process.stdout.write(`${path.relative(root, output)}\n`);
