/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { IDS } = require('./build-kia-cadenza-adjudication'); const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-cadenza-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
test('Cadenza packet passes the proposal-only safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot), []); assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 }); });
test('all three Cadenza rows remain byte-for-byte frozen', () => { for (const row of packet.rows) { assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); } });
test('engine, roof and transmission scope conflicts are explicit', () => { const byId = new Map(packet.rows.map((row) => [row.id, row])); assert.match(byId.get(IDS.engine).reason, /15 years\/150,000.*15 years\/180,000/i); assert.match(byId.get(IDS.transmission).reason, /2014-2015.*2020/i); assert.match(byId.get(IDS.sunroof).reason, /rattling.*glass shattering/i); assert.ok(packet.observations.some((item) => item.code === 'all-cadenza-pages-preserved')); });
