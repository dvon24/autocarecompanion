import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import {
  DEFAULT_TWIN_ID,
  VEHICLE_TWIN_CATALOG,
  getAdminTwinDefinitions,
  resolveDemoVehicleTwin,
  resolveTwinDeepLink,
  validateVehicleTwinCatalog,
} from '../src/lib/vehicle-twin-catalog';
import { evaluateTwinAccess } from '../src/lib/twin-access';
import { TWIN_TREE_RESOLVERS, buildDemoTwinPresentation, resolveTwinTrees } from '../src/components/twin/demo-trees.js';

const projectRoot = process.cwd();
const projectPath = (publicPath: string) => path.join(projectRoot, 'public', publicPath.replace(/^\//, ''));

test('catalog is complete and every entry selects a registered tree resolver', () => {
  assert.deepEqual(validateVehicleTwinCatalog(), []);
  assert.equal(new Set(VEHICLE_TWIN_CATALOG.map((twin) => twin.id)).size, VEHICLE_TWIN_CATALOG.length);
  for (const twin of VEHICLE_TWIN_CATALOG) {
    assert.ok(twin.treeResolver, `${twin.id} tree resolver is explicit`);
    assert.equal(typeof TWIN_TREE_RESOLVERS[twin.treeResolver], 'function', `${twin.id} resolver is registered`);
  }
});

test('all registered art exists, matches the base dimensions, and follows its channel strategy', async () => {
  for (const twin of VEHICLE_TWIN_CATALOG) {
    assert.ok(twin.art.available, `${twin.id} art is explicitly available`);
    const basePath = projectPath(twin.art.base);
    assert.ok(existsSync(basePath), `${twin.id} base exists`);
    const base = await sharp(basePath).metadata();
    assert.ok(base.width && base.height, `${twin.id} base has dimensions`);
    for (const hotspot of twin.hotspots) {
      const effectPath = projectPath(twin.art.effects[hotspot.id]);
      assert.ok(existsSync(effectPath), `${twin.id}/${hotspot.id} effect exists`);
      const effect = await sharp(effectPath).metadata();
      assert.equal(effect.width, base.width, `${twin.id}/${hotspot.id} width matches`);
      assert.equal(effect.height, base.height, `${twin.id}/${hotspot.id} height matches`);
      if (twin.art.strategy === 'alpha-overlay') {
        assert.equal(effect.channels, 4, `${twin.id}/${hotspot.id} is RGBA`);
        const pixels = await sharp(effectPath).ensureAlpha().raw().toBuffer();
        let visible = 0;
        for (let offset = 3; offset < pixels.length; offset += 4) if (pixels[offset] > 0) visible += 1;
        const coverage = visible / (effect.width! * effect.height!);
        assert.ok(coverage > 0.002, `${twin.id}/${hotspot.id} contains a visible effect`);
        assert.ok(coverage < 0.4, `${twin.id}/${hotspot.id} stays localized instead of softening the full vehicle`);
      } else {
        assert.ok(twin.art.masks?.[hotspot.id], `${twin.id}/${hotspot.id} opaque art is masked`);
      }
    }
  }
});

test('every hotspot resolves inside its vehicle-specific tree', () => {
  for (const twin of VEHICLE_TWIN_CATALOG) {
    const trees = resolveTwinTrees(twin);
    for (const hotspot of twin.hotspots) {
      const target = resolveTwinDeepLink(twin, hotspot.id);
      assert.equal(target.hotspot, hotspot.id);
      const tree = trees[target.branch];
      assert.ok(tree, `${twin.id}/${hotspot.id} branch exists`);
      assert.ok(tree.nodes[tree.root], `${twin.id}/${hotspot.id} root exists`);
      if (target.node) assert.ok(tree.nodes[target.node], `${twin.id}/${hotspot.id} node exists`);
    }
  }
});

test('structure-only twins remain unavailable across catalog, tree, guidance, and admin data', () => {
  const forbidden = ['partNo', 'price', 'riskAt', 'buyUrl', 'servicedAt', 'stock', 'brand', 'spec'];
  for (const twin of VEHICLE_TWIN_CATALOG.filter((entry) => entry.treeStatus === 'structure-only')) {
    assert.ok(twin.hotspots.every((hotspot) => hotspot.status === 'unavailable'));
    const presentation = buildDemoTwinPresentation(twin);
    for (const tree of Object.values(presentation.trees) as Array<{ nodes: Record<string, Record<string, unknown>> }>) {
      for (const node of Object.values(tree.nodes)) {
        assert.equal(node.availability, 'unavailable');
        for (const field of forbidden) assert.equal(node[field], undefined, `${twin.id}/${node.label} omits ${field}`);
      }
    }
    assert.match(presentation.guidance.intro, /unavailable/i);
    const admin = getAdminTwinDefinitions().find((entry) => entry.id === twin.id);
    assert.equal(admin?.treeStatus, 'structure-only');
  }
});

test('known issue semantics do not require or imply a purchasable upgrade', () => {
  const murano = resolveDemoVehicleTwin('murano');
  const trees = resolveTwinTrees(murano);
  assert.equal(murano.hotspots.find((hotspot) => hotspot.id === 'hood')?.status, 'known-issue');
  assert.equal(trees.engine.nodes.cvt.knownIssue, true);
  assert.equal(trees.engine.nodes.cvt.upgrade, undefined);
  assert.doesNotMatch(murano.hotspots.find((hotspot) => hotspot.id === 'hood')!.statusDetail, /fix available/i);
});

test('non-Challenger guidance is model-scoped, field-aware, and never serializes undefined', () => {
  for (const twin of VEHICLE_TWIN_CATALOG.filter((entry) => entry.id !== 'challenger')) {
    const guidance = JSON.stringify(buildDemoTwinPresentation(twin).guidance);
    assert.doesNotMatch(guidance, /Challenger|Mopar|392|HEMI|0W-40/i, twin.id);
    assert.doesNotMatch(guidance, /undefined/i, twin.id);
    assert.match(guidance, new RegExp(twin.identity.model, 'i'));
  }
});

test('unknown demo ids default explicitly while known ids never cross-fallback', () => {
  assert.equal(resolveDemoVehicleTwin('not-a-twin').id, DEFAULT_TWIN_ID);
  for (const twin of VEHICLE_TWIN_CATALOG) assert.equal(resolveDemoVehicleTwin(twin.id), twin);
});

test('founder bypass and customer claim gates remain intentionally different', () => {
  const base = { supported: true, positiveMileage: true, assignmentMatches: true, now: new Date('2026-08-25T00:00:00Z') };
  assert.deepEqual(evaluateTwinAccess({ ...base, founder: true, reservation: null }), { allowed: true, reason: 'allowed-founder' });
  assert.equal(evaluateTwinAccess({ ...base, founder: false, reservation: null }).allowed, false);
  const claimed = { twinStatus: 'claimed', assignedTwin: 'dodge-challenger', transmission: 'automatic', trialDays: 30, claimedAt: '2026-08-20T00:00:00Z' };
  assert.deepEqual(evaluateTwinAccess({ ...base, founder: false, reservation: claimed }), { allowed: true, reason: 'allowed-customer' });
  assert.equal(evaluateTwinAccess({ ...base, founder: false, reservation: { ...claimed, transmission: null } }).reason, 'transmission-unconfirmed');
  assert.equal(evaluateTwinAccess({ ...base, founder: false, reservation: { ...claimed, claimedAt: '2026-07-01T00:00:00Z' } }).reason, 'expired');
  assert.equal(evaluateTwinAccess({ ...base, founder: false, assignmentMatches: false, reservation: claimed }).reason, 'assignment-mismatch');
  assert.equal(evaluateTwinAccess({ ...base, founder: true, positiveMileage: false, reservation: null }).reason, 'missing-mileage');
});
