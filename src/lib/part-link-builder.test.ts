import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPartLinks, acceptCandidate, type LinkResolver } from './part-link-builder';

const ebayUrl = 'https://www.ebay.com/itm/227028512551';
const retailerUrl = 'https://www.bmwpartsdeal.com/parts/bmw-repair_kit_valve_seal_ring-11340054492.html';

const resolverReturning = (candidates: Array<{ vendor: string; url: string }>): LinkResolver =>
  async (input) => candidates.map((c) => ({ ...c, via: 'test', matchedPartNumber: input.partNumber }));

test('accepts a real product URL and tags it', () => {
  const link = acceptCandidate({ vendor: 'eBay', url: ebayUrl, via: 'ebay-browse' });
  assert.ok(link);
  assert.equal(link!.linkType, 'product');
  assert.equal(link!.verified, true);
});

// This is where 1,270 of the catalog's existing links point.
test('rejects RockAuto part-number searches', async () => {
  const links = await buildPartLinks(
    { partNumber: '68029736AA' },
    [resolverReturning([{ vendor: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?partnum=68029736AA' }])],
  );
  assert.deepEqual(links, []);
});

test('rejects any search-shaped URL regardless of vendor', async () => {
  const links = await buildPartLinks(
    { partNumber: 'K700902' },
    [resolverReturning([
      { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=moog+K700902' },
      { vendor: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=K700902' },
    ])],
  );
  assert.deepEqual(links, []);
});

test('rejects a link whose vendor label does not match its destination', () => {
  assert.equal(acceptCandidate({ vendor: 'FCP Euro', url: retailerUrl, via: 'test' }), null);
  assert.equal(acceptCandidate({ vendor: 'Not Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', via: 'test' }), null);
  assert.ok(acceptCandidate({ vendor: 'BMW Parts Deal', url: retailerUrl, via: 'test' }));
});

// The Ford audit found four live examples of exactly this.
test('emits nothing for a recall-first part, however good the candidate', async () => {
  const links = await buildPartLinks(
    { partNumber: '5U2Z-9F836-A', recallFirst: true },
    [resolverReturning([{ vendor: 'eBay', url: ebayUrl }])],
  );
  assert.deepEqual(links, [], 'never sell a repair the owner is entitled to free');
});

test('emits nothing when there is no part number to build from', async () => {
  const links = await buildPartLinks({ partNumber: '  ' }, [resolverReturning([{ vendor: 'eBay', url: ebayUrl }])]);
  assert.deepEqual(links, []);
});

test('returns one link per vendor, not several from the same one', async () => {
  const links = await buildPartLinks(
    { partNumber: '11340054492' },
    [resolverReturning([
      { vendor: 'eBay', url: ebayUrl },
      { vendor: 'eBay', url: 'https://www.ebay.com/itm/277072199375' },
      { vendor: 'BMW Parts Deal', url: retailerUrl },
    ])],
  );
  assert.equal(links.length, 2);
  assert.deepEqual(links.map((l) => l.vendor), ['eBay', 'BMW Parts Deal']);
});

test('a throwing resolver is skipped, not fatal, and later ones still run', async () => {
  const throwing: LinkResolver = async () => { throw new Error('eBay down'); };
  const links = await buildPartLinks({ partNumber: 'X' }, [throwing, resolverReturning([{ vendor: 'eBay', url: ebayUrl }])]);
  assert.equal(links.length, 1);
});

test('rejects a product URL whose resolver identity does not match the requested part', async () => {
  const resolver: LinkResolver = async () => [{
    vendor: 'eBay', url: ebayUrl, via: 'test', matchedPartNumber: 'WRONG-123',
  }];
  assert.deepEqual(await buildPartLinks({ partNumber: 'RIGHT-456' }, [resolver]), []);
});

test('respects maxLinks', async () => {
  const links = await buildPartLinks(
    { partNumber: 'X' },
    [resolverReturning([{ vendor: 'eBay', url: ebayUrl }, { vendor: 'BMW Parts Deal', url: retailerUrl }])],
    { maxLinks: 1 },
  );
  assert.equal(links.length, 1);
});

test('returning no links is a normal outcome, not an error', async () => {
  const links = await buildPartLinks({ partNumber: 'X' }, [resolverReturning([])]);
  assert.deepEqual(links, []);
});
