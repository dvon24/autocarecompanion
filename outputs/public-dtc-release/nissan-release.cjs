/* Bounded content release: one 350Z issue, two Nissan triage rows. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const env = require('dotenv').parse(fs.readFileSync('../../.env.local'));
const out = __dirname;
const source = path.resolve('../known-issue-twin-pilot/output/hub-review/dtc-recovery/release-wave-01-integrated-review-bundle-2026-09-10-reader-v5.json');
const bytes = fs.readFileSync(source);
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
assert.equal(hash(bytes.toString()), 'aa8142d590fb2443bf716ce76c45557d9d2a659c7bd28f971d47043fa0ca4887');
const bundle = JSON.parse(bytes);
const id = 'nissan-350z-steering-lock-nats-2003';
const codes = ['P1610', 'P1614'];
const candidate = bundle.issues.find(row => row.issueId === id);
const triageCandidates = bundle.triage.filter(row => codes.includes(row.code) && row.make === 'Nissan');
const projection = (row, before) => Object.fromEntries(Object.keys(before).map(key => [key, row[key]]));
function prepare() {
  const before = JSON.parse(fs.readFileSync(path.join(out, 'nissan-before.json')));
  const issue = structuredClone(candidate.proposedFields);
  issue.diagnosticStepsStatus = 'published';
  issue.solution = issue.solution.replace('a Nissan-capable technician', 'an authorized dealer or qualified Nissan specialist');
  issue.citations = [
    {type:'manual', title:'Nissan 350Z 2008 owner manual: immobilizer and security indicator (2-19/2-20)', url:issue.diagnosticSteps[1].sourceUrl},
    {type:'manual', title:'Nissan 350Z 2008 factory manual: NATS code definitions and diagnosis, BL-134–146 (mirror)', url:issue.diagnosticSteps[0].sourceUrl},
    {type:'tsb', title:'Nissan NTB10-107: 2005–2008 no-start with P1610 as the only NATS code (reprint)', url:issue.diagnosticSteps[4].sourceUrl},
  ];
  issue.affectedSystems = ['Immobilizer', 'Key authentication'];
  issue.communityRecommendations = [];
  issue.estimatedCostLow = null; issue.estimatedCostHigh = null;
  issue.reviewedOn = '2026-09-12';
  issue.contentUpdatedOn = '2026-09-12';
  issue.contentUpdateSummary = 'Separated immobilizer lock mode from key-read faults; added diagnosis before replacement, corrected source links, and scoped a battery option to the tested 2005–2008 P1610-only branch.';
  issue.fixParts[0].note += '. Manufacturer suggested retail price $224.95 USD when reviewed September 12, 2026; local price and stock require store selection. Not a universal no-start repair.';
  issue.fixParts[0].provenance = 'Nissan NTB10-107 battery-service branch; Interstate MTP-35 live product specifications and 2005–2008 350Z application list checked 2026-09-12.';
  issue.fixParts[0].oemPartNumber = null;
  issue.fixParts[0].aftermarketXref = ['Interstate MTP-35'];
  // Explicitly carry the bulletin exit condition so a stored code cannot
  // turn every present no-start into an immobilizer component diagnosis.
  issue.diagnosticSteps[4].action += ' The bulletin says that if the security indicator is off during or after cranking, follow non-NATS no-start diagnosis instead of replacing NATS components.';
  const triage = triageCandidates.map(row => ({...structuredClone(row.proposed), status:'published'}));
  const library = [
    {code:'P1610', name:'NATS Lock Mode (Nissan)', description:'In the Nissan 350Z service information reviewed here, P1610 identifies immobilizer lock mode after unsuccessful start authorization. It does not identify a failed steering lock, key reader or control unit. Confirm the exact vehicle and companion faults with Nissan-capable diagnostics. For 2005–2008 vehicles with P1610 as the only NATS fault, bulletin NTB10-107 calls for battery testing and service before further immobilizer diagnosis. A mechanical key-turning problem is a separate check; other manufacturers may use this code differently.', commonCauses:['Lock mode after unsuccessful start authorization','Low cranking voltage in the 2005–2008 P1610-only bulletin branch','An unregistered key or unresolved key-authentication fault','An unresolved control-unit or communication fault requiring the exact-year diagnostic procedure']},
    {code:'P1614', name:'NATS Key-ID Reception Fault (Nissan)', description:'In the Nissan 350Z service information reviewed here, P1614 means the immobilizer is not receiving the ignition key identification signal. Check for interference, then use the exact-year key and antenna-circuit diagnostic procedure before replacing anything. This is not a verdict that the remote-control battery, starter or steering lock has failed. The paired P1610 code describes lock mode and has a separate diagnostic branch. Confirm the manufacturer definition before applying this Nissan guidance to another make.', commonCauses:['Interference from another transponder key or toll/payment tag','A key transponder fault requiring confirmation','Incorrect antenna installation or an antenna-related fault','A supply, signal, ground or connector fault in the key-read circuit']},
  ];
  const manifest = {release:'nissan-nats-2026-09-12', approvedScope:'User approved publishing the reviewed first DTC content slice; no Hub, billing, account or other research-wave changes.', beforeSha256:hash(before), issueId:id, issue, triage, library};
  fs.writeFileSync(path.join(out,'nissan-manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});
  console.log(JSON.stringify({prepared:true, manifestSha256:hash(manifest), issueCount:1, triageCount:2, diagnosticSteps:8, libraryCorrections:2}));
}
async function snapshot(c, lock = false) {
  const issue = (await c.query('SELECT * FROM "KnownIssue" WHERE id = $1' + (lock ? ' FOR UPDATE' : ''), [id])).rows;
  const triage = (await c.query('SELECT * FROM "DtcTriage" WHERE code = ANY($1::text[]) AND make = $2 ORDER BY code' + (lock ? ' FOR UPDATE' : ''), [codes, 'Nissan'])).rows;
  const library = (await c.query('SELECT * FROM "DTCCode" WHERE code = ANY($1::text[]) ORDER BY code' + (lock ? ' FOR UPDATE' : ''), [codes])).rows;
  const memberships = (await c.query('SELECT id,make,model,"dtcCodes",status FROM "KnownIssue" WHERE "vehicleType" = $1 AND status = $2 AND "dtcCodes" && $3::text[] ORDER BY id', ['car', 'published', codes])).rows;
  assert.equal(issue.length, 1); assert.equal(triage.length, 2); assert.equal(library.length, 2);
  assert.equal(hash(projection(issue[0], candidate.before)), candidate.beforeSha256, 'KnownIssue changed since reviewed snapshot');
  for (const t of triageCandidates) assert.equal(hash(projection(triage.find(row => row.code === t.code), t.before)), t.beforeSha256, `Triage drift ${t.code}`);
  assert.deepEqual(memberships.filter(row => row.make === 'Nissan').map(row => row.id), [id]);
  return { capturedAt: new Date().toISOString(), issue: issue[0], triage, library, memberships };
}
async function main() {
  const mode=process.argv[2];
  if(mode==='prepare') return prepare();
  if(mode==='publish') return publish();
  assert.equal(mode, 'snapshot', 'Only snapshot and prepare modes are currently enabled');
  const c = new Client({ connectionString: env.DATABASE_URL });
  try {
    await c.connect(); await c.query('BEGIN READ ONLY');
    const before = await snapshot(c);
    await c.query('ROLLBACK');
    fs.writeFileSync(path.join(out, 'nissan-before.json'), JSON.stringify(before, null, 2), {flag:'wx'});
    console.log(JSON.stringify({ result:'PASS', retainedFieldsMatch:true, library:before.library, memberships:before.memberships,
      otherIssueFields:Object.fromEntries(Object.entries(before.issue).filter(([key]) => !Object.hasOwn(candidate.before,key))),
      snapshotSha256:hash(before) }, null, 2));
  } finally { await c.end(); }
}

async function publish() {
  const manifest=JSON.parse(fs.readFileSync(path.join(out,'nissan-manifest.json')));
  const before=JSON.parse(fs.readFileSync(path.join(out,'nissan-before.json')));
  const tested=JSON.parse(fs.readFileSync(path.join(out,'nissan-test-report.json')));
  assert.equal(hash(manifest),'b25ad947a4899fb913b3208f6168e74c4516107ff1fdef70cc021d075848b368');
  assert.equal(hash(manifest),tested.manifestSha256); assert.equal(tested.result,'PASS');
  assert.equal(hash(before),manifest.beforeSha256);
  assert.equal(manifest.issueId,id);
  assert.deepEqual(manifest.triage.map(t=>t.code),codes);
  assert.deepEqual(manifest.library.map(t=>t.code),codes);
  assert.equal(manifest.issue.diagnosticSteps.length,8);
  const issueFields=['title','description','solution','symptoms','diagnosticSteps','diagnosticStepsStatus','fixParts','citations','affectedSystems','communityRecommendations','estimatedCostLow','estimatedCostHigh','reviewedOn','contentUpdatedOn','contentUpdateSummary'];
  assert.deepEqual(Object.keys(manifest.issue).sort(),[...issueFields].sort());
  const jsonFields=new Set(['diagnosticSteps','fixParts','citations','communityRecommendations','branches']);
  const update=async(c,table,fields,values,where,keys,now)=>{
    const params=fields.map(key=>jsonFields.has(key)?JSON.stringify(values[key]):values[key]);
    params.push(now,...keys);
    const assignments=fields.map((key,index)=>`"${key}"=$${index+1}${jsonFields.has(key)?'::jsonb':''}`);
    assignments.push(`"updatedAt"=$${fields.length+1}`);
    const result=await c.query(`UPDATE "${table}" SET ${assignments.join(',')} WHERE ${where(fields.length+2)}`,params);
    assert.equal(result.rowCount,1,`Unexpected affected count in ${table}`);
  };
  const c=new Client({connectionString:env.DATABASE_URL});
  let committed=false;
  try {
    await c.connect(); await c.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await c.query("SET LOCAL lock_timeout = '8s'");
    await c.query("SET LOCAL statement_timeout = '30s'");
    const fresh=await snapshot(c,true);
    for(const key of ['issue','triage','library','memberships']) assert.equal(hash(fresh[key]),hash(before[key]),`Full snapshot drift: ${key}`);
    const now=(await c.query('SELECT clock_timestamp() AS time')).rows[0].time;
    await update(c,'KnownIssue',issueFields,manifest.issue,n=>`id=$${n} AND status='published' AND "diagnosticStepsStatus"='pending_review'`,[id],now);
    for(const t of manifest.triage) await update(c,'DtcTriage',['intro','firstCheck','branches','sourceIssueIds','scanToolNotes','status'],t,n=>`code=$${n} AND make=$${n+1} AND status='pending_review'`,[t.code,'Nissan'],now);
    for(const d of manifest.library) await update(c,'DTCCode',['name','description','commonCauses'],d,n=>`code=$${n}`,[d.code],now);
    const issue=(await c.query('SELECT * FROM "KnownIssue" WHERE id=$1',[id])).rows[0];
    const triage=(await c.query('SELECT * FROM "DtcTriage" WHERE code=ANY($1::text[]) AND make=$2 ORDER BY code',[codes,'Nissan'])).rows;
    const library=(await c.query('SELECT * FROM "DTCCode" WHERE code=ANY($1::text[]) ORDER BY code',[codes])).rows;
    for(const [key,value] of Object.entries(manifest.issue)) assert.deepEqual(issue[key],value,`Writeback mismatch ${key}`);
    for(const t of manifest.triage) for(const [key,value] of Object.entries(t)) assert.deepEqual(triage.find(row=>row.code===t.code)[key],value);
    for(const d of manifest.library) for(const [key,value] of Object.entries(d)) assert.deepEqual(library.find(row=>row.code===d.code)[key],value);
    const intent={release:manifest.release,manifestSha256:hash(manifest),beforeSha256:hash(before),publishedAt:now,writeCounts:{KnownIssue:1,DtcTriage:2,DTCCode:2},after:{issue,triage,library}};
    fs.writeFileSync(path.join(out,'nissan-publication-intent.json'),JSON.stringify(intent,null,2),{flag:'wx'});
    await c.query('COMMIT'); committed=true;
    fs.writeFileSync(path.join(out,'nissan-published.json'),JSON.stringify({...intent,committed:true},null,2),{flag:'wx'});
    console.log(JSON.stringify({committed:true,writeCounts:intent.writeCounts,publishedAt:now,manifestSha256:hash(manifest)}));
  } catch(error) {
    if(!committed) await c.query('ROLLBACK').catch(()=>{});
    throw error;
  } finally {await c.end();}
}
main().catch(error => { console.error(error.message); process.exitCode=1; });
