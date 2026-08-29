// Render the lead-demand gap audit as a self-contained HTML page.
//   node scripts/_lead-gap-artifact.js <outfile.html>
const fs = require('fs');

const recalls = JSON.parse(fs.readFileSync('data/_lead-recall-gaps.json', 'utf8'));
const dtc = JSON.parse(fs.readFileSync('data/_lead-dtc-gaps.json', 'utf8'));
const coverage = JSON.parse(fs.readFileSync('data/_lead-coverage.json', 'utf8'));
const out = process.argv[2] || 'lead-gap-audit.html';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const dtcBy = new Map(dtc.rows.map((r) => [r.vehicle, r]));
const covBy = new Map(coverage.map((r) => [r.vehicle, r]));
// 'increasing the risk of a crash' is NHTSA boilerplate on 81% of campaigns, and
// 'injury' on 37% — neither discriminates. Fire, death, and loss of control do.
const urgent = (r) => r.parkIt ||
  /fires?|death|fatal|loss of (vehicle )?control/i.test(r.consequence || '');

const rows = recalls.map((r) => {
  const d = dtcBy.get(r.vehicle) || {};
  const c = covBy.get(r.vehicle) || {};
  const urgentCount = (r.uncoveredList || []).filter(urgent).length;
  // A cached harvest row keeps the lead count it was first fetched with, so it
  // goes stale as new interest emails arrive. Coverage is regenerated every run
  // — prefer it, since leads are the multiplier in the priority score below.
  const leads = c.leads == null ? r.leads : c.leads;
  return {
    vehicle: r.vehicle, leads, status: r.status,
    published: r.published, pending: c.pend || 0,
    recalls: r.recalls, uncovered: r.uncovered, urgent: urgentCount,
    dtcPct: d.taggedPct == null ? null : d.taggedPct,
    score: r.leads * (urgentCount * 3 + (r.uncovered - urgentCount)),
  };
}).sort((a, b) => b.score - a.score);

const ok = rows.filter((r) => r.status === 'ok');
const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
const totalUncovered = ok.reduce((s, r) => s + r.uncovered, 0);
const totalUrgent = ok.reduce((s, r) => s + r.urgent, 0);
const totalPub = rows.reduce((s, r) => s + r.published, 0);
const dtcTagged = dtc.rows.reduce((s, r) => s + r.tagged, 0);
const dtcPub = dtc.rows.reduce((s, r) => s + r.published, 0);
const dtcPct = Math.round((dtcTagged / dtcPub) * 100);

const urgentList = [];
for (const r of recalls) {
  if (r.status !== 'ok') continue;
  for (const u of r.uncoveredList || []) if (urgent(u)) urgentList.push({ vehicle: r.vehicle, leads: r.leads, ...u });
}
urgentList.sort((a, b) => b.leads - a.leads || (b.parkIt ? 1 : 0) - (a.parkIt ? 1 : 0));

const blocked = rows.filter((r) => r.status !== 'ok');
const eu = blocked.filter((r) => r.status === 'not-in-nhtsa');
const noModel = blocked.filter((r) => r.status === 'no-nhtsa-model');
const unknown = blocked.filter((r) => r.status === 'unknown');

const stat = (n, label, sub, tone) =>
  '<div class="stat' + (tone ? ' t-' + tone : '') + '">' +
  '<div class="n">' + n + '</div><div class="l">' + label + '</div>' +
  (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';

const html = `<title>Lead Vehicle Gap Audit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* Light palette: cool slate neutrals biased toward the diagnostic blue accent.
   Severity (amber/red/green) is deliberately separate from the accent hue. */
:root{
  --ground:#f4f6f8; --panel:#ffffff; --panel-2:#eef2f6;
  --ink:#14181d; --muted:#5b6672; --line:#dde3e9;
  --accent:#0f6ea8; --accent-soft:#e2eef6;
  --crit:#b32218; --warn:#b8600a; --ok:#1f7a4d;
  --stripe:#c9d3dc;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#10141a; --panel:#171d25; --panel-2:#1d242e;
    --ink:#e4e9ef; --muted:#8b97a5; --line:#262f3a;
    --accent:#4ba9dd; --accent-soft:#16303f;
    --crit:#e06a5c; --warn:#e0a34a; --ok:#5fbd8c;
    --stripe:#33404e;
  }
}
:root[data-theme="dark"]{
  --ground:#10141a; --panel:#171d25; --panel-2:#1d242e;
  --ink:#e4e9ef; --muted:#8b97a5; --line:#262f3a;
  --accent:#4ba9dd; --accent-soft:#16303f;
  --crit:#e06a5c; --warn:#e0a34a; --ok:#5fbd8c;
  --stripe:#33404e;
}
*{box-sizing:border-box}
body{
  background:var(--ground); color:var(--ink); margin:0;
  padding:3rem 1.25rem 6rem;
  font:400 16px/1.62 "IBM Plex Sans",ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1060px;margin:0 auto;display:flex;flex-direction:column;gap:0}
.eyebrow{
  font:600 .74rem/1 "IBM Plex Mono",ui-monospace,Menlo,monospace;
  letter-spacing:.14em; text-transform:uppercase; color:var(--accent); margin:0 0 .8rem;
}
h1{
  font:600 clamp(2rem,5vw,2.9rem)/1.05 "Barlow Semi Condensed",ui-sans-serif,sans-serif;
  letter-spacing:.005em; margin:0 0 .55rem; text-wrap:balance;
}
.sub{color:var(--muted);margin:0;font-size:1.05rem;max-width:62ch}
h2{
  font:600 1.35rem/1.2 "Barlow Semi Condensed",ui-sans-serif,sans-serif;
  letter-spacing:.01em; margin:3.25rem 0 .4rem; text-wrap:balance;
  display:flex; align-items:baseline; gap:.6rem; flex-wrap:wrap;
}
h2 .tag{
  font:600 .66rem/1.6 "IBM Plex Mono",ui-monospace,monospace; letter-spacing:.1em;
  text-transform:uppercase; color:var(--accent);
  background:var(--accent-soft); border-radius:3px; padding:.05rem .45rem;
}
p.note{color:var(--muted);margin:.3rem 0 1.15rem;font-size:.94rem;max-width:72ch}
.stats{
  display:grid; grid-template-columns:repeat(auto-fit,minmax(158px,1fr));
  gap:1px; background:var(--line); border:1px solid var(--line);
  border-radius:4px; overflow:hidden; margin:2rem 0 0;
}
.stat{background:var(--panel); padding:1rem 1.05rem}
.stat .n{
  font:600 1.85rem/1.05 "Barlow Semi Condensed",ui-sans-serif,sans-serif;
  font-variant-numeric:tabular-nums; letter-spacing:.01em;
}
.stat.t-crit .n{color:var(--crit)} .stat.t-warn .n{color:var(--warn)} .stat.t-ok .n{color:var(--ok)}
.stat .l{
  font:500 .72rem/1.35 "IBM Plex Mono",ui-monospace,monospace;
  letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-top:.4rem;
}
.stat .s{font-size:.78rem;color:var(--muted);opacity:.72;margin-top:.3rem}
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:4px;background:var(--panel)}
table{border-collapse:collapse;width:100%;font-size:.88rem;min-width:660px}
th,td{
  padding:.52rem .75rem; text-align:right; border-bottom:1px solid var(--line);
  white-space:nowrap; font-variant-numeric:tabular-nums;
}
th{
  font:600 .68rem/1.5 "IBM Plex Mono",ui-monospace,monospace; letter-spacing:.08em;
  text-transform:uppercase; color:var(--muted);
  position:sticky; top:0; background:var(--panel-2); border-bottom-color:var(--line);
}
td.v,th.v{text-align:left;white-space:normal;min-width:170px}
td.v{font-weight:500}
tbody tr:last-child td{border-bottom:none}
tbody tr.sev td:first-child{box-shadow:inset 3px 0 0 var(--crit)}
.big{color:var(--crit);font-weight:600}
.dim{color:var(--muted)}
.mono{font:400 .82rem/1.5 "IBM Plex Mono",ui-monospace,monospace}
.chip{
  display:inline-block; background:var(--panel-2); border:1px solid var(--line);
  border-radius:3px; padding:.08rem .42rem; margin:.12rem .22rem .12rem 0;
  font:600 .74rem/1.5 "IBM Plex Mono",ui-monospace,monospace;
}
.chip.park{background:var(--crit);border-color:var(--crit);color:#fff}
.codes{margin:.6rem 0 0}
.callout{
  background:var(--panel); border:1px solid var(--line);
  border-left:3px solid var(--ok); border-radius:0 4px 4px 0;
  padding:.95rem 1.15rem; margin:1.5rem 0 0; font-size:.95rem;
}
.callout.warn{border-left-color:var(--warn)}
ul{padding-left:1.15rem;margin:.5rem 0 0} li{margin:.45rem 0}
code{
  font:.85em "IBM Plex Mono",ui-monospace,monospace;
  background:var(--panel-2); border:1px solid var(--line);
  padding:.05rem .3rem; border-radius:3px;
}
footer{
  margin-top:4rem; padding-top:1.3rem; border-top:1px solid var(--line);
  color:var(--muted); font-size:.83rem;
}
a{color:var(--accent)}
a:focus-visible,tr:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
<p class="eyebrow">Interest list &middot; ${rows.length} vehicles &middot; ${totalLeads} leads</p>
<h1>Lead Vehicle Gap Audit</h1>
<p class="sub">What the people on the interest list are waiting to hear about, and what we don't yet have to send them.</p>

<div class="stats">
  ${stat(totalPub.toLocaleString(), 'published issues', 'across lead vehicles')}
  ${stat(totalUncovered, 'uncovered recalls', 'campaigns with no issue', 'warn')}
  ${stat(totalUrgent, 'injury / fire / park-it', 'subset of uncovered', 'crit')}
  ${stat(dtcPct + '%', 'issues DTC-tagged', dtcTagged + ' of ' + dtcPub)}
  ${stat(rows.length - blocked.length, 'resolved vs NHTSA', blocked.length + ' out of scope', 'ok')}
</div>

<div class="callout">
  <strong>No lead is looking at an empty page.</strong> All ${rows.length} requested vehicles have at
  least one published issue, so the weekly digest has something to send for every one of them. The
  gap is depth and freshness, not existence.
</div>

<h2>The recall gap <span class="tag">highest confidence</span></h2>
<p class="note">
  NHTSA campaigns that no published issue cites. Unlike complaints, a recall carries a documented
  <em>remedy</em> &mdash; so each of these is a known-issue draft whose defect, consequence, and fix
  all arrive pre-cited from the government feed, with no research wave required. Score weights
  urgent campaigns 3&times;, multiplied by the number of leads waiting.
</p>
<div class="tw"><table>
<thead><tr>
<th class="v">Vehicle</th><th>Leads</th><th>Published</th><th>Recalls</th>
<th>Uncovered</th><th>Urgent</th><th>DTC</th><th>Score</th>
</tr></thead><tbody>
${ok.filter((r) => r.score > 0).slice(0, 40).map((r) => '<tr' + (r.urgent > 2 ? ' class="sev"' : '') + '>' +
  '<td class="v">' + esc(r.vehicle) + '</td>' +
  '<td>' + r.leads + '</td><td class="dim">' + r.published + '</td><td class="dim">' + r.recalls + '</td>' +
  '<td class="big">' + r.uncovered + '</td>' +
  '<td>' + (r.urgent ? r.urgent : '<span class="dim">0</span>') + '</td>' +
  '<td class="dim">' + (r.dtcPct == null ? '&mdash;' : r.dtcPct + '%') + '</td>' +
  '<td>' + r.score + '</td></tr>').join('\n')}
</tbody></table></div>

<h2>Urgent uncovered campaigns</h2>
<p class="note">Park-it orders, or a consequence naming fire, crash, injury, or loss of control. These are what a lead opens an email for.</p>
<div class="tw"><table>
<thead><tr><th class="v">Vehicle</th><th>Leads</th><th class="v">Campaign</th><th class="v">Component</th></tr></thead>
<tbody>
${urgentList.slice(0, 30).map((t) => '<tr' + (t.parkIt ? ' class="sev"' : '') + '>' +
  '<td class="v">' + esc(t.vehicle) + '</td><td>' + t.leads + '</td>' +
  '<td class="v"><span class="chip">' + esc(t.campaign) + '</span>' +
  (t.parkIt ? '<span class="chip park">PARK IT</span>' : '') + '</td>' +
  '<td class="v mono">' + esc(String(t.component).slice(0, 68)) + '</td></tr>').join('\n')}
</tbody></table></div>

<h2>The DTC gap</h2>
<div class="stats">
  ${stat(dtcPct + '%', 'carry a DTC tag', 'of lead-vehicle issues')}
  ${stat(dtc.missingFromLibrary.length, 'codes absent from library', 'pages that cannot mint', 'warn')}
  ${stat(dtc.proseOnly.length, 'codes stranded in prose', 'never promoted to dtcCodes')}
</div>
<p class="note">
  A code an issue cites but the library lacks is proven demand with no page to serve it &mdash;
  <code>/dtc/[code]/[make]</code> cannot mint without the library entry. Codes found only in an
  issue's prose are free tags: the research already surfaced them, the tagging step missed them.
</p>
<p class="codes">${dtc.missingFromLibrary.slice(0, 30).map((c) => '<span class="chip">' + esc(c.code) + '</span>').join('')}</p>

<div class="callout warn">
  <strong>Data bug: 8 issues carry malformed DTC codes.</strong> An ISO&nbsp;14229 failure-type byte
  is glued to the base code with no separator &mdash; <code>P05202A</code> is really P0520 type 2A,
  <code>C162604</code> is C1626 type 04. Stored that way the code matches nothing: not the library,
  not a DTC page, not a scanner readout a user is holding. A conservative repair is staged and
  unapplied in <code>scripts/_fix-concatenated-dtc-codes.js</code>.
</div>

<h2>Where NHTSA cannot help</h2>
<p class="note">${blocked.length} of ${rows.length} lead vehicles will never return a US recall &mdash; worth knowing before a zero gets read as &ldquo;clean.&rdquo;</p>
<ul>
  <li><strong>EU-market only (${eu.length}).</strong>
    ${eu.map((r) => esc(r.vehicle)).join(', ') || '&mdash;'}.
    NHTSA has no jurisdiction; these need the EU Safety Gate or KBA feed instead.</li>
  <li><strong>No matching NHTSA model (${noModel.length}).</strong>
    ${noModel.map((r) => esc(r.vehicle)).join(', ') || '&mdash;'}.
    Mostly pre-1995 nameplates, or a naming mismatch worth a second look.</li>
  ${unknown.length ? '<li><strong>Unresolved after retries (' + unknown.length + ').</strong> ' +
    unknown.map((r) => esc(r.vehicle)).join(', ') +
    '. Throttled, not clean &mdash; re-run the harvest to settle them.</li>' : ''}
</ul>

<footer>
  Generated from the live interest-email list and the published catalog. Recall data from the NHTSA
  recallsByVehicle API. Sources: <code>data/_lead-recall-gaps.json</code>,
  <code>data/_lead-dtc-gaps.json</code>, <code>data/_lead-coverage.json</code>.
  This audit created and modified no issues.
</footer>
</div>`;

fs.writeFileSync(out, html);
console.log('wrote ' + out + ' (' + Math.round(html.length / 1024) + 'KB)');
