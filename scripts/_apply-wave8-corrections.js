#!/usr/bin/env node
/**
 * Apply the factual corrections wave 8's audits turned up, before anything is published.
 *
 * ONE substantive correction, found by scripts/_audit-wave-recalls.js:
 *
 *   Toyota Sequoia - "Front Lower Ball Joint Premature Wear and Separation"
 *
 *   The DEFECT is real and well documented. The CAMPAIGN NUMBER attached to it was not: the article
 *   cited 08V181, which the NHTSA API shows is a 2008 Toyota HIGHLANDER REAR SEAT BELT recall -
 *   a different vehicle, a different year, a different system entirely.
 *
 *   The two campaigns that actually cover this failure (both confirmed against
 *   api.nhtsa.gov, component SUSPENSION:FRONT:CONTROL ARM:LOWER BALL JOINT) are:
 *     05V225 - 2001-2004 Sequoia (also Tacoma, Tundra, 4Runner)
 *     07V013 - 2004-2007 Sequoia and Tundra
 *
 *   Note what that means for the prose: the article claimed 2001-2003 trucks sit OUTSIDE the recall
 *   population. They do not - 05V225 covers them. So the miscitation made the article understate
 *   real, free recall coverage, which is the kind of error that costs an owner money. Corrected in
 *   both directions here.
 *
 *   The wrong citation is REMOVED rather than replaced with a constructed NHTSA URL. Guessing a
 *   static.nhtsa.gov PDF path was tested and 404s, and fabricated URLs are exactly what has polluted
 *   this database before. The campaign numbers are stated as verified facts in the prose instead,
 *   and the issue retains its two owner-forum citations.
 *
 *   node scripts/_apply-wave8-corrections.js <in.json> <out.json>
 */
const fs = require('fs');

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error('usage: node scripts/_apply-wave8-corrections.js <in.json> <out.json>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const confirmed = payload?.result?.confirmed || payload?.confirmed || [];
let changes = 0;

const WRONG = 'Toyota recalled 2004-2006 Tundra and 2004-2007 Sequoia to replace both lower ball joints; earlier 2001-2003 trucks share the same joint design and owners report the same wear pattern outside the recall population.';
const RIGHT = 'Toyota recalled the front lower ball joints under two separate campaigns, so the whole first-generation run falls inside one population or the other: 05V225 covers 2001-2004 Sequoia (alongside Tacoma, Tundra and 4Runner) and 07V013 covers 2004-2007 Sequoia and Tundra. Check your VIN against both.';

for (const c of confirmed) {
  if (c.make !== 'Toyota' || c.model !== 'Sequoia' || !/ball joint/i.test(c.title)) continue;

  if (c.description.includes(WRONG)) {
    c.description = c.description.replace(WRONG, RIGHT);
    console.log('  Sequoia ball joint: corrected recall-population sentence (2001-2004 ARE covered, by 05V225)');
    changes++;
  } else {
    console.log('  ! Sequoia ball joint: expected description sentence not found — NOT modified, review by hand');
  }

  const before = c.citations.length;
  c.citations = c.citations.filter((x) => !/08V181/i.test(x.url) && !/08V-181/i.test(x.title));
  if (c.citations.length !== before) {
    console.log(`  Sequoia ball joint: removed ${before - c.citations.length} citation(s) pointing at 08V181 (a 2008 Highlander SEAT BELT recall)`);
    changes++;
  }
  if (!c.citations.length) {
    console.log('  ! Sequoia ball joint: no citations remain — this issue would fail the citation gate');
  }
}

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`\n${changes} correction(s) applied across ${confirmed.length} issues -> ${outPath}`);
