import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TTDetail } from '../src/components/twin/stage/TechTree.jsx';
import { TwinDataCtx } from '../src/components/twin/twin-context.jsx';

function detail(node: Record<string, unknown>, sheet: boolean) {
  return renderToStaticMarkup(React.createElement(TwinDataCtx.Provider, { value: {
    mode: 'owner' as const, vehicle: { year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Sport', engine: '3.6L V6' },
  } }, React.createElement(TTDetail, { node: { label: 'Service action', kids: [], ...node }, nodeId: 'action', onEquip: undefined,
    risk: null, miles: 65000, onClose: () => {}, onAsk: undefined, sheet, narrow: false, readOnly: true })));
}

test('pilot dealer actions expose permission and manual area choices in mobile and desktop detail', () => {
  for (const sheet of [true, false]) {
    const html = detail({ dealerMake: 'Cadillac', actionUrl: 'https://old.example/finder' }, sheet);
    assert.match(html, /Use my location/);
    assert.match(html, /City or postcode/);
    assert.match(html, /Search this area/);
    assert.match(html, /Open Cadillac dealer map in Google Maps/);
    assert.match(html, /check your VIN, recall eligibility/);
    assert.doesNotMatch(html, /old\.example/);
    assert.doesNotMatch(html, /<iframe/); // No location requested or entered on initial render.
  }
});

test('Hub recall details use the owning vehicle make and preserve generic professional actions', () => {
  for (const sheet of [true, false]) {
    const recall = detail({ knownIssue: { id: 'recall', solution: 'Visit your dealer for an open recall repair.', fixParts: [] } }, sheet);
    assert.match(recall, /Find a Cadillac dealer/);
    assert.doesNotMatch(recall, /Find a Dodge dealer/);
    const generic = detail({ knownIssue: { id: 'gasket', solution: 'Ask a qualified repair shop to diagnose the oil leak.', fixParts: [] } }, sheet);
    assert.match(generic, /Service action:/);
    assert.doesNotMatch(generic, /Use my location/);
    const repair = detail({ actionUrl: 'https://example.com/repair', actionLabel: 'Find a nearby repair shop' }, sheet);
    assert.match(repair, /href="https:\/\/example.com\/repair"/);
  }
});
