#!/usr/bin/env node
/**
 * Merge a translate-known-issues workflow output (translated TEXT) with the
 * English source (structural fields: severity, category, cost, dtcCodes) into
 * the final per-locale data file the [locale] route reads:
 *   src/data/i18n/<locale>.json
 *
 * ZERO AI calls. Locale-generic — works for any locale the workflow produced.
 *
 * Usage: node scripts/_persist-translation.js <workflow-output-path>
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = process.argv[2];
if (!OUTPUT_PATH || !fs.existsSync(OUTPUT_PATH)) {
  console.error('Usage: node scripts/_persist-translation.js <workflow-output-path> [source.json]');
  process.exit(1);
}

// Per-locale source file (defaults to the original pt-BR set). de/fr/ko use
// market-specific sets exported by _export-locale-source.js.
const SOURCE_FILE = process.argv[3] || 'pt-br-source.json';
const SOURCE_PATH = path.join(__dirname, '..', 'data', SOURCE_FILE);

function decode(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"').replace(/&mdash;/g, '—').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
const result = payload?.result || {};
const locale = result.locale || 'unknown';
const localeKey = String(locale).toLowerCase(); // url prefix, e.g. 'pt-br', 'es'

// Source structural fields, indexed by issue id.
const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
const srcIssue = new Map();
const srcModelMeta = new Map(); // slug -> {make, model}
for (const m of source) {
  srcModelMeta.set(m.slug, { make: m.make, model: m.model });
  for (const i of m.issues) {
    srcIssue.set(i.id, {
      severity: i.severity, category: i.category,
      costLow: typeof i.costLow === 'number' ? i.costLow : null,
      costHigh: typeof i.costHigh === 'number' ? i.costHigh : null,
      dtcCodes: Array.isArray(i.dtcCodes) ? i.dtcCodes : [],
      reportCount: i.reportCount || 0,
    });
  }
}

const chrome = {};
for (const [k, v] of Object.entries(result.chrome || {})) chrome[k] = decode(v);

let issueCount = 0, dropped = 0;
const models = (result.models || []).map((m) => {
  const meta = srcModelMeta.get(m.slug) || { make: '', model: '' };
  const issues = (m.issues || []).map((it) => {
    const s = srcIssue.get(it.id);
    if (!s) { dropped++; return null; } // translation for an id we don't have structural data for
    issueCount++;
    return {
      id: it.id,
      title: decode(it.title), description: decode(it.description), solution: decode(it.solution),
      symptoms: (Array.isArray(it.symptoms) ? it.symptoms : []).map(decode),
      severity: s.severity, category: s.category,
      costLow: s.costLow, costHigh: s.costHigh, dtcCodes: s.dtcCodes, reportCount: s.reportCount,
    };
  }).filter(Boolean);
  return { slug: m.slug, make: meta.make, model: meta.model, h1: decode(m.h1), intro: decode(m.intro), issues };
}).filter((m) => m.issues.length > 0);

// MERGE with the existing locale file (don't wipe models translated in
// earlier runs): same-slug models from THIS run win; others are kept.
// Chrome: existing keys are kept, new keys overlay (so a models-only
// translate run doesn't erase the UI strings).
const destDir = path.join(__dirname, '..', 'src', 'data', 'i18n');
fs.mkdirSync(destDir, { recursive: true });
const destPath = path.join(destDir, `${localeKey}.json`);
let existing = null;
try { existing = JSON.parse(fs.readFileSync(destPath, 'utf-8')); } catch {}
const mergedChrome = { ...(existing?.chrome || {}), ...chrome };
const newSlugs = new Set(models.map((m) => m.slug));
const keptModels = (existing?.models || []).filter((m) => !newSlugs.has(m.slug));
const mergedModels = [...keptModels, ...models];

const out = {
  locale,
  languageName: result.languageName || existing?.languageName || locale,
  chrome: mergedChrome,
  models: mergedModels,
};
fs.writeFileSync(destPath, JSON.stringify(out, null, 2));

console.log(`Locale ${locale}: +${models.length} models this run (${issueCount} issues, ${dropped} dropped: no source match) · kept ${keptModels.length} existing · total ${mergedModels.length}`);
console.log(`Chrome keys: ${Object.keys(chrome).length}`);
console.log(`Wrote -> ${destPath}`);
console.log(models.length ? `Models: ${models.map((m) => `${m.slug}(${m.issues.length})`).join(', ')}` : 'NO MODELS — check workflow output');
