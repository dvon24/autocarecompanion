import { getKnownIssueCommerce, hasKnownIssueCommerce, isKnownIssueProductUrl } from '@/lib/known-issue-commerce';

type Dated = { createdAt: Date };
type InterestRow = Dated;
type ReservationRow = Dated & { vehicle:string|null; source:string|null; twinStatus:string; vehicleVerified:boolean };
type ClickRow = { clickedAt:Date; knownIssueId:string; partBrand:string|null; partName:string|null; link:string|null };
type IssueRow = { id:string; make:string; model:string; title:string; fixParts:unknown; communityRecommendations:unknown; reviewedOn:string; updatedAt:Date };
type FeedbackRow = Dated & { kind:string; message:string };
type AdminOverviewSource = 'interests'|'reservations'|'clicks'|'issues'|'feedback'|'users';

export type AdminOverviewData = ReturnType<typeof buildAdminOverviewSnapshot>;

const monthKey = (date:Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
const monthLabel = (key:string) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-US',{month:'short',year:'2-digit',timeZone:'UTC'});
const recentMonths = (now:Date,count=12) => Array.from({length:count},(_,index)=>{
  const date=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-(count-1-index),1));
  return monthKey(date);
});
const countByMonth = <T extends Dated>(rows:T[],months:string[]) => {
  const counts=new Map(months.map((month)=>[month,0]));
  for(const row of rows){const key=monthKey(row.createdAt);if(counts.has(key))counts.set(key,(counts.get(key)??0)+1);}
  return counts;
};
const clickCountByMonth = (rows:ClickRow[],months:string[]) => countByMonth(rows.map((row)=>({createdAt:row.clickedAt})),months);
const safeRecommendations=(value:unknown)=>Array.isArray(value)?value.filter((item):item is Record<string,unknown>=>!!item&&typeof item==='object'):[];
const commerceFor=(issue:IssueRow)=>getKnownIssueCommerce({fixParts:Array.isArray(issue.fixParts)?issue.fixParts:[],communityRecommendations:safeRecommendations(issue.communityRecommendations)} as Parameters<typeof getKnownIssueCommerce>[0]);
const reviewedDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)?value:null;
const issueHref=(issue:Pick<IssueRow,'id'|'make'|'model'>)=>`/known-issues/${`${issue.make} ${issue.model}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}#${issue.id}`;

export function buildAdminOverviewSnapshot(input:{
  now:Date;
  interests:InterestRow[];
  reservations:ReservationRow[];
  clicks:ClickRow[];
  issues:IssueRow[];
  feedback:FeedbackRow[];
  userCount:number;
  activeSubscriberCount:number;
  publishedIssueCount?:number;
  vehicleCorrectionCount?:number;
  sourceErrors?:Partial<Record<AdminOverviewSource,string>>;
}) {
  const {now,interests,reservations,clicks,issues,feedback,userCount,activeSubscriberCount}=input;
  const publishedIssueCount=input.publishedIssueCount??issues.length;
  const months=recentMonths(now);
  const interestCounts=countByMonth(interests,months);
  const reservationCounts=countByMonth(reservations,months);
  const clickCounts=clickCountByMonth(clicks,months);
  const sevenDaysAgo=new Date(now.getTime()-7*86400000);
  const thirtyDaysAgo=new Date(now.getTime()-30*86400000);
  const clicks30=clicks.filter((row)=>row.clickedAt>=thirtyDaysAgo);
  const deepClicks=clicks30.filter((row)=>isKnownIssueProductUrl(row.link??'')).length;

  const issueCoverage=issues.map((issue)=>{
    const commerce=commerceFor(issue);
    return {...issue,hasBuyLink:hasKnownIssueCommerce(commerce.fixParts)};
  });
  const covered=issueCoverage.filter((issue)=>issue.hasBuyLink).length;
  const makeMap=new Map<string,{make:string;published:number;withBuyLinks:number;lastReviewedOn:string|null}>();
  for(const issue of issueCoverage){
    const row=makeMap.get(issue.make)??{make:issue.make,published:0,withBuyLinks:0,lastReviewedOn:null};
    row.published+=1;if(issue.hasBuyLink)row.withBuyLinks+=1;
    const reviewed=reviewedDate(issue.reviewedOn);if(reviewed&&(!row.lastReviewedOn||reviewed>row.lastReviewedOn))row.lastReviewedOn=reviewed;
    makeMap.set(issue.make,row);
  }
  const byMake=[...makeMap.values()].map((row)=>({...row,withoutBuyLinks:row.published-row.withBuyLinks,coveragePct:row.published?Math.round(row.withBuyLinks/row.published*100):0})).sort((a,b)=>b.withoutBuyLinks-a.withoutBuyLinks||a.make.localeCompare(b.make));

  const topPartMap=new Map<string,{label:string;brand:string;clicks:number}>();
  const issueById=new Map(issues.map((issue)=>[issue.id,issue]));
  const searchGapMap=new Map<string,{issueId:string;clicks:number;part:string;href:string|null}>();
  for(const click of clicks30){
    const label=click.partName?.trim()||'Unlabeled part';const brand=click.partBrand?.trim()||'Unbranded';const key=`${brand}\u0000${label}`;
    const part=topPartMap.get(key)??{label,brand,clicks:0};part.clicks+=1;topPartMap.set(key,part);
    if(!isKnownIssueProductUrl(click.link??'')){
      const gapKey=`${click.knownIssueId}\u0000${label}`;
      const issue=issueById.get(click.knownIssueId);
      const gap=searchGapMap.get(gapKey)??{issueId:click.knownIssueId,clicks:0,part:label,href:issue?issueHref(issue):null};gap.clicks+=1;searchGapMap.set(gapKey,gap);
    }
  }
  const reservationStatuses=reservations.reduce<Record<string,number>>((all,row)=>{all[row.twinStatus]=(all[row.twinStatus]??0)+1;return all;},{});
  const needsReview=issues.reduce((sum,issue)=>sum+safeRecommendations(issue.communityRecommendations).filter((item)=>item.needsReview===true).length,0);
  const corrections=feedback.filter((row)=>row.kind==='vehicle-correction');

  return {
    generatedAt:now.toISOString(),
    sources:Object.fromEntries((['interests','reservations','clicks','issues','feedback','users'] as const).map((source)=>[source,{error:input.sourceErrors?.[source]??null}])),
    kpis:{
      interestTotal:interests.length,
      interestAdded7d:interests.filter((row)=>row.createdAt>=sevenDaysAgo).length,
      reservationTotal:reservations.length,
      reservationOpen:reservations.filter((row)=>row.twinStatus!=='claimed').length,
      userCount,
      activeSubscriberCount,
      affiliateClicks30d:clicks30.length,
      deepLinkRate:clicks30.length?Math.round(deepClicks/clicks30.length*100):null,
      publishedIssues:publishedIssueCount,
      issuesWithBuyLinks:covered,
      issuesWithoutBuyLinks:issues.length-covered,
    },
    series:months.map((month)=>({month,label:monthLabel(month),interests:interestCounts.get(month)??0,reservations:reservationCounts.get(month)??0,affiliateClicks:clickCounts.get(month)??0})),
    affiliate:{
      deepLinkedClicks:deepClicks,
      searchLinkedClicks:clicks30.length-deepClicks,
      topParts:[...topPartMap.values()].sort((a,b)=>b.clicks-a.clicks).slice(0,8),
      searchLinkQueue:[...searchGapMap.values()].sort((a,b)=>b.clicks-a.clicks).slice(0,8),
    },
    coverage:{
      scanned:issues.length,
      totalPublished:publishedIssueCount,
      complete:issues.length===publishedIssueCount,
      byMake,
      gaps:issueCoverage.filter((issue)=>!issue.hasBuyLink).sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,8).map((issue)=>({id:issue.id,make:issue.make,model:issue.model,title:issue.title,href:issueHref(issue)})),
    },
    queues:{
      reservations:{total:reservations.filter((row)=>row.twinStatus!=='claimed').length,byStatus:reservationStatuses,items:reservations.filter((row)=>row.twinStatus!=='claimed').slice(0,6).map((row)=>({vehicle:row.vehicle||'Vehicle not supplied',status:row.twinStatus,source:row.source||'unknown',verified:row.vehicleVerified,createdAt:row.createdAt.toISOString()}))},
      recommendationReviews:needsReview,
      vehicleCorrections:{total:input.vehicleCorrectionCount??corrections.length,items:corrections.slice(0,5).map((row)=>({message:row.message,createdAt:row.createdAt.toISOString()}))},
    },
    analytics:{
      sessions:{status:'not-connected' as const,label:'Site visitors',detail:'No first-party session analytics backend is connected.'},
      visitTiming:{status:'not-connected' as const,label:'When they visit',detail:'Local-hour session events are not collected.'},
      referrers:{status:'not-connected' as const,label:'Where they come from',detail:'Referrer and region analytics are not collected.'},
    },
  };
}
