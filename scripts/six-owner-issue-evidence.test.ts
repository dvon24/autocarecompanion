import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildOwnerTwinValue } from '../src/components/twin/LiveTwinHub';
import { TwinDataCtx } from '../src/components/twin/twin-context';
import { TTDetail, ttRisk } from '../src/components/twin/stage/TechTree';
import { buildOwnerTwinIssueSummary } from '../src/lib/twin-owner-issues';
import { REVIEWED_OWNER_EQUIPMENT } from '../src/lib/twin-owner-equipment';
import { XT6_OWNER_ISSUE_NODES } from '../src/lib/twin-owner-issue-nodes';

const profile=REVIEWED_OWNER_EQUIPMENT.find(row=>row.catalogId==='xt6')!;
const vehicle={...profile,reviewedEquipmentId:profile.id,color:null};
const data={vehicleId:'offline-review',vehicle,fulfillmentId:profile.fulfillmentId,miles:64000,transmission:'automatic',records:[],installedParts:[],evaluatedAt:'2026-09-13T12:00:00Z'};

for(const state of ['unchanged','missing','changed-description','changed-solution','changed-years','changed-trims','changed-engines','changed-citations','missing-metadata'] as const)test(`actual owner and TTDetail: ${state} XT6 evidence`,()=>{
  const issues=state==='missing'?[]:XT6_OWNER_ISSUE_NODES.map(item=>buildOwnerTwinIssueSummary({id:item.id,title:item.label,make:'Cadillac',model:'XT6',severity:'high',
    description:state==='changed-description'?'Changed after review':item.review.sourceDescription,
    solution:state==='changed-solution'?'Withdrawn pending new review':item.review.sourceSolution,fixParts:[],communityRecommendations:[],
    years:state==='missing-metadata'?undefined:state==='changed-years'?[2020,2030]:item.review.sourceYears,
    trims:state==='changed-trims'?['Unreviewed trim']:item.review.sourceTrims,
    engines:state==='changed-engines'?['Unreviewed engine']:item.review.sourceEngines,
    citations:state==='changed-citations'?[{url:'https://example.invalid/revised-source'}]:item.review.sourceCitations?.map(url=>({url}))},vehicle));
  const value:any=buildOwnerTwinValue({...data,issues});assert(value);
  for(const item of XT6_OWNER_ISSUE_NODES){
    const node=value.trees.car.nodes[item.key];
    if(state==='unchanged'){assert(node);assert.equal(value.trees[item.branch].nodes[item.key],node);assert(value.trees[item.branch].nodes[item.parent].kids.includes(item.key));}
    else for(const tree of Object.values(value.trees) as any[]){assert.equal(tree.nodes[item.key],undefined);assert(Object.values(tree.nodes).every((n:any)=>!n.kids?.includes(item.key)));}
  }
  const details=Object.entries(value.trees.car.nodes).map(([nodeId,node])=>React.createElement(TTDetail,{key:nodeId,node,nodeId,miles:data.miles,risk:ttRisk(node,data.miles),readOnly:true} as any));
  const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},...details));
  if(state==='unchanged'){assert.match(html,/replace the engine and rubber coolant hoses/);assert.match(html,/MC-10198879-9999\.pdf/);}
  else{
    assert.doesNotMatch(html,/replace the engine and rubber coolant hoses|MC-10198879-9999\.pdf/);
    for(const item of XT6_OWNER_ISSUE_NODES){assert(!JSON.stringify(value.trees).includes(item.review.reviewedMechanism!));assert(!JSON.stringify(value.trees).includes(item.review.reviewedAction!));}
    if(state!=='missing')assert(value.issues.every((issue:any)=>issue.solution.includes('current equipment-specific diagnostic review is required')));
  }
  assert(value.trees.car.nodes.coolant.maintenanceType);assert(value.trees.car.nodes.transFluid.maintenanceType);
});
