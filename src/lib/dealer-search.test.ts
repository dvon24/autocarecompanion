import assert from 'node:assert/strict';
import test from 'node:test';
import { dealerEmbedUrl, dealerLocationFailure, dealerMapsUrl, dealerPlacesRequest, parseDealerSearchInput, twinIssueNeedsDealer } from './dealer-search';

test('accepts coordinates including zero, or a typed area without geolocation', () => {
  assert.deepEqual(parseDealerSearchInput({ make: ' Cadillac ', lat: 0, lng: 0 }), { make: 'Cadillac', location: { lat: 0, lng: 0 } });
  assert.deepEqual(parseDealerSearchInput({ make: 'Cadillac', place: ' 10115 Berlin, Germany ' }), { make: 'Cadillac', location: { place: '10115 Berlin, Germany' } });
});

test('rejects malformed, ambiguous, out-of-range and oversized dealer searches', () => {
  for (const invalid of [null, [], 'Cadillac', {}, { make: {} }, { make: ' ', lat: 0, lng: 0 },
    { make: 'Cadillac', lat: 91, lng: 0 }, { make: 'Cadillac', lat: 0, lng: -181 },
    { make: 'Cadillac', lat: Infinity, lng: 0 }, { make: 'Cadillac', lat: '0', lng: 0 },
    { make: 'Cadillac', lat: 0 }, { make: 'Cadillac', place: ' ' }, { make: 'Cadillac', place: 'a'.repeat(121) },
    { make: 'Cadillac', place: 'Berlin', lat: 0, lng: 0 }, { make: 'a'.repeat(41), place: 'Berlin' }]) {
    assert.equal(parseDealerSearchInput(invalid), null, JSON.stringify(invalid));
  }
});

test('Places requests preserve the supplied area and only use distance ranking with coordinates', () => {
  const byArea = dealerPlacesRequest({ make: 'Cadillac', location: { place: 'Berlin, Germany' } });
  assert.equal(byArea.textQuery, 'Cadillac dealership near Berlin, Germany');
  assert.equal('locationBias' in byArea, false);
  assert.equal('rankPreference' in byArea, false);
  const nearby = dealerPlacesRequest({ make: 'Cadillac', location: { lat: 52.52, lng: 13.4 } });
  assert.equal(nearby.textQuery, 'Cadillac dealership');
  assert.equal(nearby.rankPreference, 'DISTANCE');
  assert.deepEqual(nearby.locationBias?.circle.center, { latitude: 52.52, longitude: 13.4 });
});

test('external Maps search retains explicit location and correctly encodes input', () => {
  assert.equal(new URL(dealerMapsUrl('Cadillac', { place: 'St. Louis & nearby, MO' })).searchParams.get('query'), 'Cadillac dealership near St. Louis & nearby, MO');
  assert.equal(new URL(dealerMapsUrl('Ford', { lat: 0, lng: -80 })).searchParams.get('query'), 'Ford dealership near 0,-80');
  assert.equal(new URL(dealerMapsUrl('Cadillac')).searchParams.get('query'), 'Cadillac dealership near me');
});

test('only a configured public Embed key and selected area produce an official map URL', () => {
  const location = { place: 'Berlin' };
  assert.equal(dealerEmbedUrl('Cadillac', location), null);
  assert.equal(dealerEmbedUrl('Cadillac', location, 'YOUR_API_KEY'), null);
  const publicKey = 'AIza' + 'a'.repeat(35);
  assert.equal(dealerEmbedUrl('Cadillac', null, publicKey), null);
  const embed = new URL(dealerEmbedUrl('Cadillac', { lat: 52.52, lng: 13.4 }, publicKey)!);
  assert.equal(embed.origin + embed.pathname, 'https://www.google.com/maps/embed/v1/search');
  assert.equal(embed.searchParams.get('key'), publicKey);
  assert.equal(embed.searchParams.get('center'), '52.52,13.4');
  assert.equal(embed.searchParams.get('q'), 'Cadillac dealership near 52.52,13.4');
});

test('denied and unavailable location offer a manual place search', () => {
  assert.match(dealerLocationFailure(1), /not shared.*city or postcode/);
  assert.match(dealerLocationFailure(2), /unavailable.*city or postcode/);
  assert.match(dealerLocationFailure(3), /unavailable.*Google Maps/);
});

test('dealer referrals require explicit recall or dealer work, not a missing retail link', () => {
  assert.equal(twinIssueNeedsDealer({ recallFirst: true }), true);
  assert.equal(twinIssueNeedsDealer({ fixParts: [{ recallFirst: true }] }), true);
  assert.equal(twinIssueNeedsDealer({ solution: 'Visit your dealer for the recall repair.' }), true);
  assert.equal(twinIssueNeedsDealer({ solution: 'Dealer-only programming is required.' }), true);
  assert.equal(twinIssueNeedsDealer({ solution: 'This repair requires a dealer.' }), true);
  assert.equal(twinIssueNeedsDealer({ title: 'NHTSA complaint', solution: 'Replace worn wiper blades.', fixParts: [] }), false);
  assert.equal(twinIssueNeedsDealer({ solution: 'Ask a qualified mechanic to diagnose before replacing the gasket.', fixParts: [] }), false);
});

test('APIM passive dealer repair opens search without treating dealer mentions as instructions',()=>{
  for(const solution of ['If freezes recur, the APIM module is reprogrammed or replaced by the dealer; updating to the current software level resolves most memory-related lockups.','The module must be programmed by an authorized dealer.']) assert.equal(twinIssueNeedsDealer({solution}),true,solution);
  for(const solution of ['The module was replaced by the dealer last year. Diagnose before buying anything.','The module is not replaced by the dealer.','Replace the wiper blades; a dealer sells these parts.','Check whether dealer warranty coverage applies.','A dealer reported this complaint; the cause remains unknown.']) assert.equal(twinIssueNeedsDealer({solution}),false,solution);
});
