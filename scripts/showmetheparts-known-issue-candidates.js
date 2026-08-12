/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only ShowMeTheParts candidate/fitment lookup for Known Issue research.
 *
 * Catalog matches are candidate evidence only. They do not prove that a part
 * repairs the published issue, and they are never emitted as retailer links.
 *
 * Example:
 *   SHOWMETHEPARTS_ID=... node scripts/showmetheparts-known-issue-candidates.js \
 *     --year 2008 --make Audi --model A6 --model "A6 Quattro" \
 *     --product-match "belts hoses tensioners" \
 *     --engine-match "3.2L" --part-type-match "timing chain"
 *
 * List exact catalog product-category names without requesting engines or parts:
 *   SHOWMETHEPARTS_ID=... node scripts/showmetheparts-known-issue-candidates.js \
 *     --year 2011 --make BMW --model 335i --list-products
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://www.showmethepartsdb2.com/bin/ShowMeConnect.exe';

function decodeXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function tagValue(block, tag) {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block);
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, ' ')) : '';
}

function parseItems(xml, itemTag) {
  const items = [];
  const pattern = new RegExp(`<${itemTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
  let match;
  while ((match = pattern.exec(String(xml || '')))) {
    const block = match[1];
    const fields = {};
    const fieldPattern = /<([a-zA-Z0-9_:-]+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let field;
    while ((field = fieldPattern.exec(block))) {
      if (!/<[a-zA-Z]/.test(field[2])) fields[field[1]] = decodeXml(field[2]);
    }
    items.push(fields);
  }
  return items;
}

function normalizedTokens(value) {
  return String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function matchesAllTokens(value, query) {
  const haystack = normalizedTokens(value);
  return normalizedTokens(query).every((token) => haystack.includes(token));
}

function exactNamed(items, value, kind) {
  const wanted = String(value || '').trim().toLowerCase();
  const matches = items.filter((item) => String(item.data || '').trim().toLowerCase() === wanted);
  if (matches.length === 0) throw new Error(`${kind} not found: ${value}`);
  if (matches.length > 1) throw new Error(`${kind} is ambiguous: ${value}`);
  return matches[0];
}

function filterPartCandidates(items, query) {
  if (!String(query || '').trim()) return items;
  return items.filter((item) => matchesAllTokens([
    item.part_type,
    item.alt_part_type,
    item.brand,
    item.application,
    item.comment,
  ].filter(Boolean).join(' '), query));
}

function candidateFromPart(part, context) {
  return {
    supplier: part.supplier || '',
    partNumber: part.part_no || '',
    partKey: part.part_key || '',
    partType: part.part_type || part.alt_part_type || '',
    brand: part.brand || '',
    application: part.application || '',
    comment: part.comment || '',
    location: part.location || '',
    quantityPerApplication: part.qty || '',
    aaiaBrandId: part.aaiabrandid || '',
    image: part.image || '',
    fitment: context,
    candidateOnly: true,
  };
}

function argValues(args, flag) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag && args[index + 1]) values.push(args[++index]);
  }
  return values;
}

function argValue(args, flag, fallback = '') {
  return argValues(args, flag)[0] || fallback;
}

function argFlag(args, flag) {
  return args.includes(flag);
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

async function requestXml(params, options = {}) {
  const accountId = options.accountId || process.env.SHOWMETHEPARTS_ID;
  if (!accountId) throw new Error('SHOWMETHEPARTS_ID is required. It is never logged or written to artifacts.');
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries({ ...params, id: accountId })) {
    if (value !== undefined && value !== null && String(value) !== '') url.searchParams.set(key, String(value));
  }
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(url, { signal: options.signal || AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`ShowMeTheParts request failed with HTTP ${response.status}`);
  const xml = await response.text();
  const errorNumber = /\berr_num="([^"]+)"/i.exec(xml)?.[1];
  if (errorNumber && errorNumber !== '0') throw new Error(`ShowMeTheParts returned error ${errorNumber}`);
  return xml;
}

async function findCandidates(input, options = {}) {
  const year = Number.parseInt(String(input.year || ''), 10);
  if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 2) throw new Error('A valid --year is required.');
  if (!input.make || !Array.isArray(input.models) || input.models.length === 0) throw new Error('--make and at least one --model are required.');

  const makes = parseItems(await requestXml({ lookup: 'make3', year }, options), 'make');
  const make = exactNamed(makes, input.make, 'Make');
  const models = parseItems(await requestXml({ lookup: 'model', year, make: make.id }, options), 'model');
  const selectedModels = input.models.map((name) => exactNamed(models, name, 'Model'));
  const productRows = [];
  const engineRows = [];
  const candidates = [];

  for (const model of selectedModels) {
    const products = parseItems(await requestXml({ lookup: 'product', year, make: make.id, model: model.id }, options), 'product');
    const selectedProducts = input.productMatch
      ? products.filter((product) => matchesAllTokens(product.data, input.productMatch))
      : products;
    productRows.push(...selectedProducts.map((product) => ({ model: model.data, id: product.id, name: product.data })));
    if (input.listProducts) continue;

    for (const product of selectedProducts) {
      const engines = parseItems(await requestXml({ lookup: 'engine', year, make: make.id, model: model.id, product: product.id }, options), 'engine');
      const selectedEngines = input.engineMatch
        ? engines.filter((engine) => matchesAllTokens(engine.data, input.engineMatch))
        : engines;
      engineRows.push(...selectedEngines.map((engine) => ({ model: model.data, product: product.data, id: engine.id, name: engine.data })));

      for (const engine of selectedEngines) {
        const parts = parseItems(await requestXml({
          lookup: 'parts', engine: engine.id, year, make: make.id, model: model.id, product: product.id,
        }, options), 'partsdata');
        const filtered = filterPartCandidates(parts, input.partTypeMatch);
        candidates.push(...filtered.map((part) => candidateFromPart(part, {
          year,
          make: make.data,
          model: model.data,
          engine: engine.data,
          product: product.data,
        })));
      }
    }
  }

  const unique = new Map();
  for (const candidate of candidates) {
    const key = [candidate.supplier, candidate.partKey, candidate.fitment.model, candidate.fitment.engine].join('|');
    if (!unique.has(key)) unique.set(key, candidate);
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'ShowMeTheParts subscription API',
    candidateOnly: true,
    guardrail: 'Catalog output establishes candidate identity and YMME fitment only; repair role and retailer product pages require independent verification.',
    request: {
      year,
      make: input.make,
      models: input.models,
      productMatch: input.productMatch || '',
      engineMatch: input.engineMatch || '',
      partTypeMatch: input.partTypeMatch || '',
      listProducts: Boolean(input.listProducts),
    },
    resolved: {
      make: { id: make.id, name: make.data },
      models: selectedModels.map((model) => ({ id: model.id, name: model.data })),
      products: productRows,
      engines: engineRows,
    },
    candidates: [...unique.values()],
  };
}

async function main() {
  require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env.local') });
  const args = process.argv.slice(2);
  const input = {
    year: argValue(args, '--year'),
    make: argValue(args, '--make'),
    models: argValues(args, '--model'),
    productMatch: argValue(args, '--product-match'),
    engineMatch: argValue(args, '--engine-match'),
    partTypeMatch: argValue(args, '--part-type-match'),
    listProducts: argFlag(args, '--list-products'),
  };
  const result = await findCandidates(input);
  const output = argValue(args, '--output');
  if (output) {
    const file = path.resolve(PROJECT_ROOT, output);
    writeJsonAtomic(file, result);
    console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, file), candidateCount: result.candidates.length }, null, 2));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  candidateFromPart,
  exactNamed,
  filterPartCandidates,
  findCandidates,
  matchesAllTokens,
  parseItems,
  requestXml,
  tagValue,
};
