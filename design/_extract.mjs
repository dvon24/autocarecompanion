// One-off extractor — pulls the embedded template HTML out of the
// au7o-handoff-bundle.html packaged design file so it can be audited
// as plain HTML/CSS instead of an escaped JSON string crammed inside
// a <script type="__bundler/template"> tag.
//
// Run: node design/_extract.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('design/au7o-handoff-bundle.html', 'utf8');
// The template block is one giant JSON-encoded string starting with `"<!DOCTYPE`.
// Find it, run JSON.parse to unescape, then write out.
const start = src.indexOf('<script type="__bundler/template">');
if (start < 0) throw new Error('template script tag not found');
const open = src.indexOf('>', start) + 1;
const close = src.indexOf('</script>', open);
const raw = src.slice(open, close).trim();
const html = JSON.parse(raw);

writeFileSync('design/au7o-handoff-extracted.html', html, 'utf8');
console.log(`Extracted ${html.length.toLocaleString()} chars of template HTML.`);
console.log('Wrote: design/au7o-handoff-extracted.html');
