// @ts-nocheck -- assertions exercise the intentionally untyped legacy JSX tree.
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTwinTrees } from '../src/components/twin/twin-trees';

test('automatic owners receive only the ZF fluid branch and an order link', () => {
  const trees = buildTwinTrees({}, 65_000, 'automatic');
  assert.equal(trees.trans.nodes.trx.sub, 'ZF 8HP70 · 8-speed automatic');
  assert.equal(trees.trans.nodes.transFluid.partNo, '68218925AA');
  assert.match(trees.trans.nodes.transFluid.buyUrl, /ebay\.com\/itm\/152808690128/);
  assert.ok(trees.trans.nodes.transPan);
});

test('manual owners receive only the TR-6060 ATF+4 branch and an order link', () => {
  const trees = buildTwinTrees({}, 65_000, 'manual');
  assert.equal(trees.trans.nodes.trx.sub, 'Tremec TR-6060 · 6-speed manual');
  assert.equal(trees.trans.nodes.transFluid.partNo, '68218057AC');
  assert.match(trees.trans.nodes.transFluid.buyUrl, /ebay\.com\/itm\/389013189748/);
  assert.equal(trees.trans.nodes.transPan, undefined);
  assert.equal(trees.car.nodes.transPan, undefined);
});

test('unknown transmission renders no transmission parts', () => {
  const trees = buildTwinTrees({}, 65_000, null);
  assert.equal(trees.trans, undefined);
  assert.equal(trees.car.nodes.trx, undefined);
  assert.equal(trees.car.nodes.transFluid, undefined);
});
