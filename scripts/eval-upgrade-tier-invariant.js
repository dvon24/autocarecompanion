#!/usr/bin/env node
/**
 * Trust-boundary invariant for the aftermarket "Performance upgrade" row.
 *
 * THE RULE (the whole point of the two-tier design): a search-tier / aftermarket
 * element may NEVER render a VERIFIED badge or a bare "Buy" label. Those belong
 * only to the OEM row, which earned them (real part number + resolved listing).
 * A descriptive Summit/AM search has verified nothing — if a future styling
 * refactor copies the OEM row's verified tick or Buy button into the upgrade
 * row, a bad match silently inherits trust it didn't earn.
 *
 * This is a SOURCE guard (no test framework in the repo): it isolates the
 * upgrade-row JSX in TapToIdentifyPhoto.tsx and asserts the boundary. Cheap,
 * deterministic, and it turns "Devon notices in the wild" into "the check
 * notices in CI" — same philosophy as eval-vision-resolver.js.
 *
 * Usage:  node scripts/eval-upgrade-tier-invariant.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'components', 'diagnose', 'TapToIdentifyPhoto.tsx');
const src = fs.readFileSync(FILE, 'utf-8');

const fails = [];

// Isolate the upgrade-row region: from the upgradeOptions render guard to the
// end of its mapped <a className="t2i-upgrow">…</a> anchor template.
const startIdx = src.indexOf('sel.part.upgradeOptions && sel.part.upgradeOptions.length > 0');
if (startIdx === -1) {
  fails.push('could not find the upgrade-row render block — was it renamed? (invariant can no longer self-check)');
}
// The anchor is the only place buttons/labels for the upgrade row live.
const anchorMatch = src.match(/<a\s+[^>]*className="t2i-upgrow"[\s\S]*?<\/a>/);
if (!anchorMatch) {
  fails.push('could not find the <a className="t2i-upgrow"> anchor — upgrade-row markup changed shape');
} else {
  const anchor = anchorMatch[0];
  if (/VERIFIED/.test(anchor)) fails.push('upgrade row renders a VERIFIED badge — search-tier must never claim verification');
  if (/t2i-buy/.test(anchor)) fails.push('upgrade row uses the OEM "Buy" button class (t2i-buy) — must be a "Shop options" search link');
  if (/>\s*Buy\s*</.test(anchor)) fails.push('upgrade row renders a bare "Buy" label — search-tier must say "Shop options →"');
  // Positive assertions: the honesty markers must be present.
  if (!/Shop options/.test(anchor)) fails.push('upgrade row lost its "Shop options →" CTA (the honest, search-not-buy label)');
}
// The "confirm fit" honesty tag + fitment disclaimer must exist somewhere in the
// upgrade block (region after startIdx).
const region = startIdx === -1 ? src : src.slice(startIdx, startIdx + 2500);
if (!/CONFIRM FIT/.test(region)) fails.push('upgrade row lost its "AFTERMARKET · CONFIRM FIT" tag');
if (!/fitment not verified/i.test(region)) fails.push('upgrade row lost its "fitment not verified" disclaimer');

if (fails.length) {
  console.log('✗ aftermarket-tier trust-boundary invariant FAILED');
  fails.forEach((f) => console.log('    - ' + f));
  console.log('\nFAIL');
  process.exit(1);
}
console.log('✓ aftermarket upgrade row holds the trust boundary (no VERIFIED badge, no bare Buy; honesty markers present)');
console.log('\nPASS');
process.exit(0);
