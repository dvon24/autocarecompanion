import prisma from '@/lib/db';
import { requireFounder } from '@/lib/admin-guard';
import { buildAdminOverviewSnapshot, type AdminOverviewData } from './admin-overview';
import { getAdminOverviewResponse } from './admin-overview-response';

export const dynamic='force-dynamic';

const ISSUE_SCAN_LIMIT=250;

async function loadAdminOverview():Promise<AdminOverviewData>{
  const now=new Date();
  const seriesStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-11,1));
  const sourceErrors:Partial<Record<'interests'|'reservations'|'clicks'|'issues'|'feedback'|'users',string>>={};
  const capture=async<T>(source:keyof typeof sourceErrors,promise:Promise<T>,fallback:T):Promise<T>=>{
    try{return await promise;}catch(error){
      console.error(`Admin overview ${source} query failed`,error);
      sourceErrors[source]='Unavailable';
      return fallback;
    }
  };
  const [interests,reservations,clicks,issues,feedback,userCount,activeSubscriberCount,interestTotal,publishedIssueCount,vehicleCorrectionCount]=await Promise.all([
    capture('interests',prisma.interestEmail.findMany({where:{createdAt:{gte:seriesStart}},select:{createdAt:true},orderBy:{createdAt:'desc'}}),[]),
    capture('reservations',prisma.reservation.findMany({select:{createdAt:true,vehicle:true,source:true,twinStatus:true,vehicleVerified:true},orderBy:{createdAt:'desc'}}),[]),
    capture('clicks',prisma.affiliateClick.findMany({where:{clickedAt:{gte:seriesStart}},select:{clickedAt:true,knownIssueId:true,partBrand:true,partName:true,link:true},orderBy:{clickedAt:'desc'}}),[]),
    capture('issues',prisma.knownIssue.findMany({where:{vehicleType:'car',status:'published'},select:{id:true,make:true,model:true,title:true,fixParts:true,communityRecommendations:true,reviewedOn:true,updatedAt:true},orderBy:{updatedAt:'desc'},take:ISSUE_SCAN_LIMIT}),[]),
    capture('feedback',prisma.feedback.findMany({where:{kind:'vehicle-correction'},select:{kind:true,message:true,createdAt:true},orderBy:{createdAt:'desc'},take:100}),[]),
    capture('users',prisma.user.count(),0),
    capture('users',prisma.user.count({where:{subscriptionStatus:'active'}}),0),
    capture('interests',prisma.interestEmail.count(),0),
    capture('issues',prisma.knownIssue.count({where:{vehicleType:'car',status:'published'}}),0),
    capture('feedback',prisma.feedback.count({where:{kind:'vehicle-correction'}}),0),
  ]);
  const data=buildAdminOverviewSnapshot({now,interests,reservations,clicks,issues,feedback,userCount,activeSubscriberCount,publishedIssueCount,vehicleCorrectionCount,sourceErrors});
  return {...data,kpis:{...data.kpis,interestTotal}};
}

export function GET(){return getAdminOverviewResponse(loadAdminOverview,{authorize:requireFounder});}
