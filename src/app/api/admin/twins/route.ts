import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { getAdminTwinDefinitions } from '@/lib/vehicle-twin-catalog';
import prisma from '@/lib/db';
import { buildTwinIssueSummary } from '@/lib/twin-known-issues';
import { resolveTwinTrees } from '@/components/twin/demo-trees';
import { getReviewedTransmissionChoices } from '@/lib/transmission-options';

export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) return NextResponse.json({error:'Not authorized'}, {status:403});
  const twins=getAdminTwinDefinitions();
  const expectedByTwin=new Map(twins.map((twin)=>{
    try{
      const choices=getReviewedTransmissionChoices(twin.identity);
      const configurations=choices.length?choices:[undefined];
      const ids=[...new Set(configurations.flatMap((transmission)=>{
        const trees=resolveTwinTrees(twin,{transmission}) as Record<string,{nodes:Record<string,{knownIssue?:{id?:string}}>}>;
        return Object.values(trees).flatMap((tree)=>Object.values(tree.nodes).flatMap((node)=>node.knownIssue?.id?[node.knownIssue.id]:[]));
      }))];
      return [twin.id,ids] as const;
    }catch{return [twin.id,null] as const;}
  }));
  const issueIds=[...new Set([...expectedByTwin.values()].flatMap((ids)=>ids??[]))];
  const issueRows=issueIds.length?await prisma.knownIssue.findMany({
    where:{id:{in:issueIds},status:'published'},
    select:{id:true,title:true,severity:true,make:true,model:true,description:true,solution:true,fixParts:true,communityRecommendations:true},
  }).catch(()=>null):[];
  const summaries=issueRows?.map(buildTwinIssueSummary)??[];
  const byId=new Map(summaries.map((issue)=>[issue.id,issue]));
  return NextResponse.json({twins:twins.map((twin)=>{
    const expected=expectedByTwin.get(twin.id);
    return {...twin,issues:(expected??[]).flatMap((id)=>byId.get(id)?[byId.get(id)!]:[]),issuesComplete:issueRows!==null&&expected!==null&&expected!==undefined&&expected.every((id)=>byId.has(id))};
  })});
}
