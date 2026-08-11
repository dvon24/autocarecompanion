/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel } = require('./build-renault-model-adjudication');
const { supportedModels } = require('./renault-model-adjudication-contracts');
const { validatePacket } = require('./validate-renault-model-adjudication');

for (const model of supportedModels) {
  test(`${model} packet passes all frozen-identity gates`, () => {
    const { contract, snapshot, packet } = buildForModel(model);
    assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  });
}

test('validator rejects a held page becoming unpublished', () => {
  const { contract, snapshot, packet } = buildForModel('Captur');
  packet.rows[0].proposal.status = 'archived';
  assert.ok(validatePacket(contract, packet, snapshot).some((error) => error.includes('held row unpublished')));
});

test('validator rejects frozen title drift', () => {
  const { contract, snapshot, packet } = buildForModel('Captur');
  packet.rows[0].proposal.title = 'Changed title';
  assert.ok(validatePacket(contract, packet, snapshot).some((error) => error.includes('immutable title changed')));
});

test('validator rejects owner social proof', () => {
  const { contract, snapshot, packet } = buildForModel('Captur');
  packet.rows[0].proposal.description += ' 0+ owners have reported this issue.';
  assert.ok(validatePacket(contract, packet, snapshot).some((error) => error.includes('owner social proof')));
});

test('validator rejects commerce on a held proposal', () => {
  const { contract, snapshot, packet } = buildForModel('Captur');
  packet.rows[0].proposal.fixParts = [{ name: 'kit', url: 'https://example.com' }];
  assert.ok(validatePacket(contract, packet, snapshot).some((error) => error.includes('commerce-free')));
});
