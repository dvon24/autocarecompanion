#!/usr/bin/env node
/**
 * Wave-7 pre-persist corrections.
 *
 * `_qa-verdict-caveats.js` surfaces cases where the adversarial verifier CONFIRMED an issue but
 * named a specific factual error inside its own reason text. Those corrections are worth applying
 * before publish, because the verifier is the only reader who checked the claim against sources -
 * once the row is in the database nobody re-reads that sentence.
 *
 * Three fixes, each traceable to a verifier statement:
 *
 *  1. Ford Flex hub bearings - the verifier confirmed the recurring bearing/corrosion pattern but
 *     said the "covered under powertrain warranty" detail is unsupported. A wrong warranty claim is
 *     the kind of error that sends an owner to a dealer expecting a free repair, so it comes out.
 *
 *  2. Toyota Avalon Entune - the verifier confirmed the head-unit reboot/freeze/black-screen
 *     pattern, but found that one cited thread is actually a Highlander discussion, and that the
 *     trunk-mounted JBL amplifier sub-claim is weakly supported and likely wrong about location
 *     (the XX40 amp generally sits under the front passenger seat). The bad citation is dropped and
 *     the amplifier sub-claim is removed rather than relocated - "probably somewhere else" is not
 *     something to publish. The head-unit claim, which is what the article is actually about,
 *     stands on its three remaining citations.
 *
 *  3. Chevrolet Cruze water pump - the verifier confirmed GM Special Coverage 14371/14371B but
 *     noted the claimed year range overshoots: 2016 is the Gen 2 J400 car with the LE2 engine, not
 *     the LUJ/LUV this issue describes. Years trimmed to 2011-2015.
 *
 * Dry run by default. --apply writes <input>-corrected.json.
 *
 *   node scripts/_apply-wave7-corrections.js data/research-wave7-2026-08-25-citychecked.json
 *   node scripts/_apply-wave7-corrections.js data/research-wave7-2026-08-25-citychecked.json --apply
 */
const fs = require('fs');

const APPLY = process.argv.includes('--apply');
const FILE = process.argv.find((a) => a.endsWith('.json'));
if (!FILE) {
  console.error('usage: node scripts/_apply-wave7-corrections.js <wave.json> [--apply]');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const confirmed = data.confirmed || [];

/** Remove a sentence by a distinctive fragment. Reports if the fragment is not found. */
function dropSentence(text, fragment, label) {
  if (!text || !text.includes(fragment)) {
    console.log(`  !! MISS  ${label}: fragment not found -> ${fragment.slice(0, 60)}`);
    return { text, changed: false };
  }
  // Sentence boundaries: split keeping the terminator, then drop any sentence containing it.
  const parts = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text];
  const kept = parts.filter((p) => !p.includes(fragment));
  const out = kept.join('').trim();
  console.log(`  -- ${label}: dropped ${parts.length - kept.length} sentence(s)`);
  return { text: out, changed: true };
}

let changes = 0;
const find = (make, model, frag) => confirmed.find((c) => c.make === make && c.model === model && c.title.includes(frag));

// 1. Ford Flex - unsupported warranty claim.
const flex = find('Ford', 'Flex', 'Wheel Hub Bearing');
if (!flex) console.log('!! Ford Flex hub bearing issue not found');
else {
  console.log('Ford Flex - Wheel Hub Bearing:');
  const r = dropSentence(flex.description, 'covered under the powertrain warranty', 'description');
  if (r.changed) { flex.description = r.text; changes++; }
}

// 2. Toyota Avalon - Highlander citation + unsupported JBL amplifier location.
const av = find('Toyota', 'Avalon', 'Entune');
if (!av) console.log('!! Toyota Avalon Entune issue not found');
else {
  console.log('Toyota Avalon - Entune:');
  const before = (av.citations || []).length;
  av.citations = (av.citations || []).filter((c) => !String(c.url).includes('stereo-goes-silent-touchscreen-freezes-up'));
  if (av.citations.length !== before) { console.log(`  -- citations: dropped 1 Highlander thread (${before} -> ${av.citations.length})`); changes++; }
  else console.log('  !! MISS citations: Highlander thread not found');

  const d = dropSentence(av.description, 'trunk-mounted JBL amplifier', 'description');
  if (d.changed) { av.description = d.text; changes++; }
  const s = dropSentence(av.solution, 'suspect the JBL amplifier', 'solution');
  if (s.changed) { av.solution = s.text; changes++; }

  if (!av.citations.length) console.log('  !! WARNING: no citations left — this issue must be dropped, not published.');
}

// 3. Chevrolet Cruze - year range overshoots into Gen 2.
const cruze = find('Chevrolet', 'Cruze', 'Water Pump Shaft Seal');
if (!cruze) console.log('!! Chevrolet Cruze water pump issue not found');
else {
  console.log('Chevrolet Cruze - Water Pump:');
  const before = (cruze.years || []).slice();
  cruze.years = (cruze.years || []).filter((y) => y <= 2015);
  if (cruze.years.length !== before.length) {
    console.log(`  -- years: ${before.join(',')} -> ${cruze.years.join(',')} (2016 is Gen 2 J400 / LE2, not LUJ/LUV)`);
    changes++;
  } else console.log('  !! MISS years: nothing above 2015 to trim');
}

console.log(`\n${changes} corrections applied to ${confirmed.length} confirmed issues.`);

if (!APPLY) {
  console.log('DRY RUN — nothing written. Re-run with --apply.');
} else {
  const out = FILE.replace(/\.json$/, '-corrected.json');
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log('wrote', out);
}
