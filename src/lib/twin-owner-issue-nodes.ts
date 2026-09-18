import reviewed from '../data/xt6-visual-explanations.json';
import type { TwinIssueSummary } from './twin-known-issues';

/** Exact reviewed diagnostic leaves only; no service completion or purchase. */
export const XT6_OWNER_ISSUE_NODES = [
  {key:'accumulatorRecall',branch:'trans',parent:'trx',label:'Start-stop accumulator recall',id:'cadillac-xt6-2020-xt6-start-stop-accumulator-may-be-missing-endcap-bolts'},
  {key:'oilContamination',branch:'engine',parent:'rad',label:'LGX oil contamination in coolant',id:'cadillac-xt6-3-6l-lgx-engine-oil-migrating-into-cooling-system-through-bl'},
  {key:'steeringAssist',branch:'wheel',parent:'wheelRoot',label:'Electric steering assist',id:'cadillac-xt6-electric-power-steering-rack-failure-steering-assist-is-redu'},
  {key:'surroundVision',branch:'wipers',parent:'wiperRoot',label:'Optional UV2 Surround Vision recall',id:'cadillac-xt6-rearview-camera-cuts-out-due-to-bad-coaxial-cable-crimp-surr'},
  {key:'roofSeams',branch:'wipers',parent:'wiperRoot',label:'Roof-to-body seam water leak',id:'cadillac-xt6-water-leaks-into-interior-through-pinholes-roof-panel-laser'},
].map(node=>({...node,review:reviewed.find(row=>row.id===node.id)!}));

export function attachXt6OwnerIssueNodes(trees:Record<string,any>, issues:readonly TwinIssueSummary[] = []) {
  for(const item of XT6_OWNER_ISSUE_NODES){
    const branch=trees[item.branch],parent=branch?.nodes[item.parent];
    if(!parent)throw new Error('Missing reviewed XT6 owner issue parent: '+item.parent);
    // Withdrawing evidence also withdraws every diagnostic render path. These
    // keys belong only to this adapter; ordinary maintenance nodes stay intact.
    for(const tree of Object.values(trees)){
      delete tree.nodes[item.key];
      for(const node of Object.values(tree.nodes) as any[])if(node.kids?.includes(item.key)){
        node.kids=node.kids.filter((key:string)=>key!==item.key);
        if(!node.kids.length)delete node.kids;
      }
    }
    const issue=issues.find(row=>row.id===item.id);
    // Only the source-bound server projection may carry this reviewed detail.
    // A changed-source hold summary remains in the issue list, not a stale leaf.
    if(!issue || issue.description!==item.review.reviewedMechanism
      || issue.solution!==item.review.reviewedAction+' Sources: '+item.review.sourceCitations?.join(' '))continue;
    if(item.branch==='wipers'){
      trees.wipers.label='Interior';trees.wipers.short='Interior';
      trees.wipers.nodes.wiperRoot.label='Interior';
    }
    const node={label:item.label,sub:item.review.scope,img:'/twin-stage/parts/'+item.review.image,
      where:item.label,spec:issue.description,life:issue.solution,
      sourceLabel:'Reviewed GM bulletin / NHTSA recall · confirm VIN and equipment',sourceUrl:item.review.sourceCitations?.[0],
      availability:'owner',knownIssue:{...issue,label:item.label}};
    parent.kids=[...(parent.kids||[]),item.key];
    branch.nodes[item.key]=node;trees.car.nodes[item.key]=node;
  }
  return trees;
}
