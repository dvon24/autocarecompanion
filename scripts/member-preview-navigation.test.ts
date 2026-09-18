import test from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceDocumentError } from '../src/lib/maintenance-document';
import { hubReservationReturnHref } from '../src/lib/hub-reservation-navigation';
import { currentKnownIssueAnchor, openKnownIssueArticle, KNOWN_ISSUE_OPEN_EVENT } from '../src/lib/known-issue-navigation';

test('owner receipt returns to the precise saved vehicle through an internal route', () => {
  assert.equal(hubReservationReturnHref({ id: 'second-car', year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1 1LE' }), '/vehicle/2019-chevrolet-camaro-zl1-1le?vehicleId=second-car&reservation=received');
  assert.equal(hubReservationReturnHref(null), '/account?reservation=received');
  assert.match(hubReservationReturnHref({ id: '//evil.invalid/?x=1', year: 1900, make: 'Unknown', model: 'Unknown' }), /^\/garage\/%2F%2Fevil\.invalid%2F%3Fx%3D1\/records\?reservation=received$/);
});
test('document picker accepts supported files within the limit and rejects invalid files', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) {
    assert.equal(maintenanceDocumentError({ type, size: 4 * 1024 * 1024 }), null);
    assert(maintenanceDocumentError({ type, size: 0 }));
    assert(maintenanceDocumentError({ type, size: 4 * 1024 * 1024 + 1 }));
  }
  for (const type of ['', 'text/plain', 'image/svg+xml']) assert(maintenanceDocumentError({ type, size: 1 }));
});
test('opening the same issue explicitly notifies mounted categories and cards every time', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const events: string[] = []; const hashes: string[] = [];
  const location = { hash: '' };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location, history: { pushState: (_state: unknown, _unused: string, hash: string) => { hashes.push(hash); location.hash = hash; } }, dispatchEvent: (event: Event) => { events.push(event.type); } } });
  try {
    openKnownIssueArticle('issue with space'); openKnownIssueArticle('issue with space');
    assert.deepEqual(hashes, ['#issue%20with%20space']);
    assert.deepEqual(events, [KNOWN_ISSUE_OPEN_EVENT, KNOWN_ISSUE_OPEN_EVENT]);
    assert.equal(currentKnownIssueAnchor(), 'issue with space');
    location.hash = '#%invalid'; assert.equal(currentKnownIssueAnchor(), '');
  } finally { if (original) Object.defineProperty(globalThis, 'window', original); else Reflect.deleteProperty(globalThis, 'window'); }
});
