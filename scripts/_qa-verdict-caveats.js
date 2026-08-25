#!/usr/bin/env node
/**
 * VERDICT-CAVEAT GATE. ZERO AI. Run on every wave output BEFORE persist.
 *
 * The adversarial verifier often CONFIRMS an issue while stating a factual problem with it in
 * `_verdictReason` — "the claim overstates the remedy", "that citation is actually a Sonata
 * thread", "should be corrected before publishing". Nothing downstream reads that field, so
 * those errors ship. Wave 5 had 4 real ones in 82 confirmed issues, including a remedy claim
 * that would have sent owners to a dealer demanding warranty coverage they are not entitled to.
 *
 * Usage: node scripts/_qa-verdict-caveats.js <wave-output.json>
 * Exit 1 if any confirmed issue carries a caveat, so it can gate a pipeline.
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/_qa-verdict-caveats.js <wave-output.json>'); process.exit(1); }

// Split into severity bands: CORRECTION = a stated factual error. WEAK = softer hedging.
// NOTE: verifiers routinely write the BENIGN phrase "not covered by any existing database issue"
// (i.e. it is not a duplicate), which is the opposite of a defect. Exclude that shape explicitly,
// or the gate reports a false positive on almost every genuinely-novel issue.
const BENIGN = /not (?:covered|matched) by any existing (?:database )?(?:issue|entry|record)|does not duplicate|not a duplicate/i;
const CORRECTION = /should be corrected|before publishing|overstates|understates|is NOT (?:listed|applicable|included)|does not (?:apply|include)|is actually a |not actually|factually (?:wrong|incorrect)|should be (?:split|removed|dropped)/i;
const WEAK = /weakening citation|citation quality|at the extreme end|could not (?:verify|confirm)|unverified|paywall proxy/i;

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const list = data?.result?.confirmed || data?.confirmed || [];
const corrections = [], weak = [];
// `_verdictReason` is the ORIGINAL verdict text and is never rewritten, so once an issue has
// actually been corrected the reason still describes the old error. Without this check the gate
// cries wolf forever and someone re-does work that is already done. `_correctionApplied` is
// stamped by scripts/_apply-wave-corrections-*.js.
const alreadyFixed = [];
for (const x of list) {
  const r = x._verdictReason || '';
  if (x._correctionApplied) { if (CORRECTION.test(r) || WEAK.test(r)) alreadyFixed.push(x); continue; }
  const scrub = r.replace(BENIGN, '');
  if (CORRECTION.test(scrub)) corrections.push(x);
  else if (WEAK.test(scrub)) weak.push(x);
}
const sentence = (r, re) => ((r.match(new RegExp('[^.]*(?:' + re.source + ')[^.]*\.', 'i')) || [''])[0] || '').trim();

console.log(`confirmed issues: ${list.length}`);
if (alreadyFixed.length) console.log(`  already corrected (flag set, verdict text stale)       : ${alreadyFixed.length}`);
console.log(`  MUST FIX before publish (verifier stated a factual error): ${corrections.length}`);
console.log(`  softer caveats (citation quality / hedging)              : ${weak.length}\n`);
for (const x of corrections) {
  console.log(`MUST FIX  [${x._verdictConfidence}] ${x.make} ${x.model}`);
  console.log(`   ${x.title}`);
  console.log(`   -> ${sentence(x._verdictReason, CORRECTION)}\n`);
}
if (weak.length) {
  console.log('--- softer caveats ---');
  for (const x of weak) console.log(`  [${x._verdictConfidence}] ${x.make} ${x.model} — ${x.title.slice(0, 60)}\n     -> ${sentence(x._verdictReason, WEAK).slice(0, 180)}`);
}
process.exit(corrections.length ? 1 : 0);
