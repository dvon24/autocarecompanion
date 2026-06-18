#!/usr/bin/env node
/**
 * Extract the generated symptom pages from a symptom-pages-content workflow
 * output into src/data/symptoms.json (deduped by slug). No AI, no DB.
 *
 * Usage: node scripts/_persist-symptoms.js <workflow-output-path>
 */
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
if (!OUT || !fs.existsSync(OUT)) {
  console.error('Usage: node scripts/_persist-symptoms.js <workflow-output-path>');
  process.exit(1);
}

// Agents sometimes HTML-escape copy (&amp;, &#39;); decode so it renders clean.
function decode(v) {
  if (typeof v !== 'string') return v;
  return v
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const payload = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
const raw = payload?.result?.symptoms || [];

const seen = new Set();
const clean = [];
for (const s of raw) {
  if (!s?.slug || seen.has(s.slug)) continue;
  if (!s.title || !s.intro || !Array.isArray(s.commonCauses)) continue;
  seen.add(s.slug);
  clean.push({
    slug: String(s.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: decode(s.title),
    h1: decode(s.h1 || s.title),
    metaDescription: decode(s.metaDescription || ''),
    intro: decode(s.intro),
    severity: ['safe-to-drive', 'caution', 'stop-driving'].includes(s.severity) ? s.severity : 'caution',
    likelyDtcCodes: Array.isArray(s.likelyDtcCodes) ? s.likelyDtcCodes.map((c) => String(c).toUpperCase().trim()).filter(Boolean) : [],
    commonCauses: s.commonCauses.filter((c) => c && c.cause).map((c) => ({ cause: decode(String(c.cause)), detail: decode(String(c.detail || '')) })),
    whatToDo: decode(s.whatToDo || ''),
    searchTerms: Array.isArray(s.searchTerms) ? s.searchTerms.map((t) => decode(String(t))) : [],
  });
}

const dest = path.join(__dirname, '..', 'src', 'data', 'symptoms.json');
// Merge with any existing symptoms (append new slugs, keep existing).
let existing = [];
if (fs.existsSync(dest)) { try { existing = JSON.parse(fs.readFileSync(dest, 'utf-8')); } catch { existing = []; } }
const bySlug = new Map();
for (const s of existing) bySlug.set(s.slug, s);
let added = 0;
for (const s of clean) { if (!bySlug.has(s.slug)) { bySlug.set(s.slug, s); added++; } }
const merged = [...bySlug.values()];
fs.writeFileSync(dest, JSON.stringify(merged, null, 2));
const bySev = merged.reduce((a, s) => ((a[s.severity] = (a[s.severity] || 0) + 1), a), {});
console.log(`Merged: ${existing.length} existing + ${added} new = ${merged.length} symptoms -> ${dest}`);
console.log(`  Severity: ${JSON.stringify(bySev)}`);
