#!/usr/bin/env node
/**
 * Merge the jplux research batch (Lexus/Infiniti/Acura thin models):
 *   data/_wf-jplux-parts/discover-N.json  (candidates)
 *   data/_wf-jplux-parts/verify-N.json    (verdicts, same order)
 * → data/_wf-jplux-out.json in the {result:{confirmed,stats}} shape that
 *   scripts/_persist-known-issues-run.js consumes.
 * ZERO AI calls. Gate: isReal && hasLiveCitation && !isDuplicate && confidence>=0.7,
 * citations pruned to the verifier's liveUrls, verifier `fixes` applied.
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'data', '_wf-jplux-parts');
const OUT = path.join(__dirname, '..', 'data', '_wf-jplux-out.json');
const UI_CATEGORIES = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other'];
const DTC_RE = /^[PUBC][0-9A-F]{4}$/i;

const confirmed = [], rejected = [], perModel = {};
let totalCands = 0;
for (const f of fs.readdirSync(DIR).filter((x) => /^discover-\d+\.json$/.test(x)).sort()) {
  const n = f.match(/\d+/)[0];
  const cands = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')).candidates || [];
  const vf = path.join(DIR, `verify-${n}.json`);
  const verdicts = fs.existsSync(vf) ? (JSON.parse(fs.readFileSync(vf, 'utf8')).verdicts || []) : [];
  const byIdx = new Map(verdicts.map((v) => [v.index, v]));
  totalCands += cands.length;
  cands.forEach((c, i) => {
    const key = `${c.make} ${c.model}`;
    perModel[key] ||= { candidates: 0, confirmed: 0 };
    perModel[key].candidates++;
    const v = byIdx.get(i);
    const fail = (why) => rejected.push({ key, title: c.title, why });
    if (!v) return fail('no verdict');
    if (!v.isReal) return fail(`not real: ${v.reason}`);
    if (!v.hasLiveCitation) return fail(`no live citation: ${v.reason}`);
    if (v.isDuplicate) return fail(`duplicate: ${v.reason}`);
    if ((v.confidence ?? 0) < 0.7) return fail(`low confidence ${v.confidence}: ${v.reason}`);
    const live = new Set((v.liveUrls || []).map((u) => String(u).trim()));
    let cites = (c.citations || []).filter((x) => x && x.url && live.has(String(x.url).trim()));
    if (!cites.length) return fail('verifier liveUrls did not match any citation url');
    const issue = { ...c, ...(v.fixes && typeof v.fixes === 'object' ? v.fixes : {}) };
    for (const k of ['estimatedCostLow', 'estimatedCostHigh']) if (issue[k] === null || typeof issue[k] !== 'number') delete issue[k];
    issue.citations = cites;
    issue.years = [...new Set((issue.years || []).map(Number).filter((y) => Number.isInteger(y) && y > 1980 && y < 2028))].sort();
    if (!issue.years.length) return fail('no valid years');
    issue.trims = (issue.trims || []).filter((t) => typeof t === 'string' && t.length <= 30 && !/\s(built|verify|vehicles|between)\s/i.test(t));
    issue.engines = Array.isArray(issue.engines) ? issue.engines : [];
    issue.symptoms = Array.isArray(issue.symptoms) ? issue.symptoms : [];
    issue.dtcCodes = (issue.dtcCodes || []).map((d) => String(d).toUpperCase().trim()).filter((d) => DTC_RE.test(d));
    if (!UI_CATEGORIES.includes(String(issue.category).toLowerCase())) issue.category = 'other';
    if (!['high','medium','low'].includes(issue.severity)) issue.severity = 'medium';
    delete issue.sourceNotes;
    issue._verdictConfidence = v.confidence;
    perModel[key].confirmed++;
    confirmed.push(issue);
  });
}
// Token-overlap dupe scan vs existing titles (warn-only; verifier already gates isDuplicate)
const STOP = new Set(['the','a','an','and','or','of','in','on','at','for','with','from','to','failure','failures','issue','issues','problem','problems','may','can','causing','premature','system']);
const toks = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const excl = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'research-jplux-exclusions.json'), 'utf8'));
const suspects = [];
for (const c of confirmed) {
  const e = excl.find((x) => x.make === c.make && x.model === c.model);
  const a = toks(c.title);
  for (const t of (e ? e.existingTitles : [])) {
    const b = toks(t); const inter = [...a].filter((x) => b.has(x)).length;
    if (inter / Math.max(1, Math.min(a.size, b.size)) >= 0.6) suspects.push(`[${c.make} ${c.model}] NEW "${c.title}" ~ EXISTING "${t}"`);
  }
}
// intra-batch near-dupes
for (let i = 0; i < confirmed.length; i++) for (let j = i + 1; j < confirmed.length; j++) {
  const a = confirmed[i], b = confirmed[j];
  if (a.make !== b.make || a.model !== b.model) continue;
  const ta = toks(a.title), tb = toks(b.title); const inter = [...ta].filter((x) => tb.has(x)).length;
  if (inter / Math.max(1, Math.min(ta.size, tb.size)) >= 0.6) suspects.push(`[${a.make} ${a.model}] INTRA "${a.title}" ~ "${b.title}"`);
}
if (suspects.length) { console.log(`\nDUPE SUSPECTS (${suspects.length}) — hand-triage:`); suspects.forEach((s) => console.log('  ' + s)); }
const stats = { batch: 'jplux-2026-08-17', models: Object.keys(perModel).length, candidates: totalCands, confirmed: confirmed.length, rejected: rejected.length, perModel };
fs.writeFileSync(OUT, JSON.stringify({ result: { confirmed, stats, rejected } }, null, 2));
console.log(JSON.stringify(stats, null, 2));
console.log(`\nRejected (${rejected.length}):`);
rejected.forEach((r) => console.log(`  - [${r.key}] ${r.title} — ${r.why}`));
console.log(`\n→ ${OUT}`);
