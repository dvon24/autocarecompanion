/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
const { CAMPAIGNS, EXPECTED_4XE_RECALLS, EXPECTED_CAMPAIGN_MODEL_YEARS, EXPECTED_RECALLS, PDF_SOURCES, RECALL_4XE_QUERIES, RECALL_QUERIES, REWRITE_CARDS, REWRITE_IDS, SPECIAL_IDS, evidenceFor, holdReasonFor, rewriteProposal } = require('./build-jeep-wrangler-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-wrangler-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
function equal(a,b){return JSON.stringify(stableValue(a))===JSON.stringify(stableValue(b));}

function validatePacket(packet,snapshot,expectedSnapshotSha256=normalizedFileHash(SNAPSHOT)){
  const errors=[];
  const modelRows=snapshot.records.filter((row)=>row.make==='Jeep'&&row.model==='Wrangler');
  const frozenById=new Map(modelRows.map((row)=>[row.id,row]));
  const ids=packet.rows?.map((row)=>row.id)||[];
  if(packet.status!=='proposal-only'||packet.requiresIndependentApproval!==true)errors.push('packet safety status mismatch');
  if(packet.make!=='Jeep'||packet.model!=='Wrangler')errors.push('packet scope mismatch');
  if(packet.source?.snapshotSha256!==expectedSnapshotSha256||packet.source?.snapshotHash!==snapshot.snapshotHash)errors.push('snapshot binding mismatch');
  if(packet.source?.modelRecordCount!==66||modelRows.length!==66||ids.length!==66||new Set(ids).size!==66)errors.push('Wrangler row count mismatch');
  if(!equal(ids.slice().sort(),[...frozenById.keys()].sort()))errors.push('frozen ID coverage mismatch');
  for(const row of packet.rows||[]){
    const frozen=frozenById.get(row.id);if(!frozen){errors.push(`${row.id}: unknown ID`);continue;}
    const before=fullRecord(frozen);const card=REWRITE_CARDS[row.id];const expectedProposal=card?rewriteProposal(frozen,card):before;const expectedAction=card?'rewrite_same_identity':'keep_published_pending_source';
    if(row.action!==expectedAction)errors.push(`${row.id}: action mismatch`);
    if(!card&&row.reason!==holdReasonFor(frozen))errors.push(`${row.id}: hold reason mismatch`);
    if(!equal(row.before,before)||row.beforeSha256!==hashValue(before))errors.push(`${row.id}: before drift`);
    if(!equal(row.proposal,expectedProposal)||row.proposalSha256!==hashValue(expectedProposal))errors.push(`${row.id}: proposal drift`);
    if(!equal(row.changedFields,diffFields(before,expectedProposal)))errors.push(`${row.id}: changed-field drift`);
    if(!equal(row.evidence,evidenceFor(frozen))||!row.evidence?.length)errors.push(`${row.id}: evidence drift`);
    if(row.proposal.make!=='Jeep'||row.proposal.model!=='Wrangler'||row.proposal.status!=='published'||row.proposal.title!==before.title||row.proposal.category!==before.category||!equal(row.proposal.years,before.years)||!equal(row.proposal.relatedIssueIds,before.relatedIssueIds)||/^Archived\s*-/i.test(row.proposal.title))errors.push(`${row.id}: identity/status drift`);
    for(const field of FULL_RECORD_FIELDS)if(!Object.prototype.hasOwnProperty.call(row.before,field)||!Object.prototype.hasOwnProperty.call(row.proposal,field))errors.push(`${row.id}: missing ${field}`);
    if(!card&&(!equal(row.proposal,row.before)||row.proposalSha256!==row.beforeSha256||!equal(row.changedFields,[])))errors.push(`${row.id}: hold drift`);
    if(card){
      if(row.proposal.humanApproved!==false||row.proposal.reportCount!==0||row.proposal.source!=='manual'||row.proposal.estimatedCostLow!==null||row.proposal.estimatedCostHigh!==null||!equal(row.proposal.trims,[])||!equal(row.proposal.engines,[])||!equal(row.proposal.dtcCodes,[])||!equal(row.proposal.communityRecommendations,[])||!equal(row.proposal.fixParts,[]))errors.push(`${row.id}: rewrite safety fields mismatch`);
      if(!row.proposal.citations.length||row.proposal.citations.some((item)=>!/nhtsa\.gov/.test(item.url)||/amazon|ebay|rockauto|[?&](?:q|k|_nkw)=/i.test(item.url)))errors.push(`${row.id}: rewrite source/commerce URL mismatch`);
    }
  }
  if(!equal(packet.summary,{rewrite_same_identity:5,keep_published_pending_source:61,total:66}))errors.push('summary mismatch');
  if(!equal(packet.pdfSources,PDF_SOURCES)||!equal(packet.campaigns,{urls:CAMPAIGNS,expectedModelYears:EXPECTED_CAMPAIGN_MODEL_YEARS})||!equal(packet.recallInventory,{wrangler:{queries:RECALL_QUERIES,expected:EXPECTED_RECALLS},wrangler4xe:{queries:RECALL_4XE_QUERIES,expected:EXPECTED_4XE_RECALLS}}))errors.push('official source map mismatch');
  if(!equal(packet.rows.filter((row)=>row.action==='rewrite_same_identity').map((row)=>row.id).sort(),Object.values(REWRITE_IDS).sort()))errors.push('rewrite ID set mismatch');
  for(const id of Object.values(SPECIAL_IDS))if(!packet.rows.some((row)=>row.id===id&&row.action==='keep_published_pending_source'))errors.push(`special hold missing ${id}`);
  for(const code of['wrangler-65-of-66-pages-have-search-commerce','wrangler-11-pages-have-no-citations','wrangler-clockspring-official-scope-is-narrower','wrangler-steering-gear-cites-steering-damper-document','wrangler-battery-recall-superseded-twice','wrangler-overlap-clusters-preserved','all-wrangler-pages-preserved'])if(!packet.observations?.some((item)=>item.code===code))errors.push(`missing observation ${code}`);
  return errors;
}

if(require.main===module){const packet=JSON.parse(fs.readFileSync(PACKET,'utf8'));const snapshot=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));const errors=validatePacket(packet,snapshot);console.log(JSON.stringify({passed:errors.length===0,packetSha256:normalizedFileHash(PACKET),decisionCount:packet.rows?.length||0,errors},null,2));if(errors.length)process.exitCode=1;}
module.exports={PACKET,SNAPSHOT,validatePacket};

