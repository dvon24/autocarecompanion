import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { getTwinDefinition, resolveTwinTransmissionBranch, transmissionSelectionFitsReviewedOptions, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { savedVehicleHubHref } from '@/lib/hub-vehicle-selection';
import { isUSReservationCountry, selectedReservation, sameReservationFitment, hasUnresolvedReservationGarage } from './reservation-identity';
import { lockReservationEmail, reservationEmailWhere } from './reservation-email-lock';
import { evaluateTwinAccess, evaluateTwinReservationProvenance, normalizeTwinSessionIdentity } from '@/lib/twin-access';
import { getTwinByFulfillmentId } from '@/lib/vehicle-twin-catalog';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { claimTransmissionMatchesVehicle } from '@/lib/twin-route-contracts';
import { hasValidReviewedTransmissionState, isTransmissionChoice } from '@/lib/transmission-options';
import { isMaintenanceMutationError, nextMonotonicRevision } from '@/lib/maintenance-mutation';
import { z } from 'zod';
import { ownerEquipmentReady, validOwnerEquipmentSelection } from './twin-owner-equipment';

type Session = { user?: { id?: string | null; email?: string | null } } | null;
type ClaimResult = { ok:true;href:string } | { ok:false;error:string;status:number };
const rejected=(error:string,status=409):ClaimResult=>({ok:false,error,status});

export function createTwinClaimPostHandler(deps:{auth:()=>Promise<Session>;prisma:typeof prismaClient;resolveTwinDefinition?:typeof getTwinDefinition}){
  return async function POST(request?: Request){
    const parsed = z.object({ reservationId:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional(), mileage: z.number().int().positive().max(2000000).optional(), reviewedEquipmentId:z.string().min(1).max(100).optional(), expectedVehicleUpdatedAt:z.string().datetime({offset:true}).optional(), expectedTrialDays: z.union([z.literal(7),z.literal(30)]).optional(), expectedUpdatedAt: z.string().datetime({offset:true}).optional() }).strict().safeParse(request ? await request.json().catch(() => ({})) : {});
    if(!parsed.success)return NextResponse.json({error:'Enter a whole current mileage in miles.'},{status:400});
    const identity=normalizeTwinSessionIdentity(await deps.auth());
    if(!identity)return NextResponse.json({error:'Sign in to accept this offer'},{status:401});
    const {userId,email}=identity;
    try{
      const result=await deps.prisma.$transaction(async(tx):Promise<ClaimResult>=>{
        await lockReservationEmail(tx,email);
        const currentTimeRows=await tx.$queryRaw<Array<{now:Date}>>`SELECT CURRENT_TIMESTAMP AS "now"`;const now=currentTimeRows[0]?.now??new Date(Number.NaN);
        const reservations=await tx.reservation.findMany({where:await reservationEmailWhere(tx,email)});
        const requestedOffer = selectedReservation(reservations, parsed.data.reservationId);
        if (requestedOffer?.twinStatus === 'canceled') return rejected('This vehicle request was canceled. Contact support@au7o.io if you want to request it again.');
        if(!parsed.data.reservationId&&reservations.length>1)return rejected('Choose which vehicle offer to activate.');
        const reservation=selectedReservation(reservations,parsed.data.reservationId);if(!reservation)return rejected('No ready twin offer was found for this account',404);const provenance=evaluateTwinReservationProvenance(reservation);if(provenance?.reason==='country-unavailable')return rejected('This offer is available for US reservations only.',403);if(provenance)return rejected(provenance.reason==='trim-unverified'?'This exact trim still needs to be verified before activation.':'This vehicle selection still needs to be verified before activation.');
        if(reservation.transmission!=null&&!isTransmissionChoice(reservation.transmission))return rejected('The saved transmission selection is invalid.');const twin=(deps.resolveTwinDefinition??getTwinDefinition)(reservation.assignedTwin);const ownerCatalog=getTwinByFulfillmentId(twin?.id);if(!twin||!ownerCatalog?.ownerReady)return rejected('The assigned twin is not available for owner use.');
        const reservedVehicle=reservation.year&&reservation.make&&reservation.model?{year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim}:null;if(!reservedVehicle||!twinMatchesVehicle(twin,reservedVehicle))return rejected('This twin no longer matches the reserved vehicle. Contact Au7o before activating it.');if(!hasValidReviewedTransmissionState({...reservedVehicle,transmission:reservation.transmission}))return rejected('The saved transmission selection is incompatible with this reviewed fitment.');
        const branch=resolveTwinTransmissionBranch(twin,reservation.transmission,reservedVehicle);if(!branch.options.length)return rejected('This twin has no registered transmission branch.');if(!transmissionSelectionFitsReviewedOptions(branch.options,reservation.transmission))return rejected('The saved transmission selection is incompatible with this reviewed fitment.');if(branch.requiresChoice&&!branch.branch)return rejected('The automatic/manual fitment still needs to be confirmed before this twin can be activated.');
        if(!isUSReservationCountry(reservation.country))return rejected('This offer is available for US reservations only.',403);
        if(parsed.data.expectedUpdatedAt&&new Date(parsed.data.expectedUpdatedAt).getTime()!==reservation.updatedAt.getTime())return rejected('This vehicle offer changed. Refresh and review it before accepting.');
        if(parsed.data.expectedTrialDays!=null&&parsed.data.expectedTrialDays!==reservation.trialDays)return rejected('This offer changed. Refresh and review the current duration before accepting.');
        const garage=await tx.vehicle.findMany({where:{userId,year:reservedVehicle.year},select:{id:true,year:true,make:true,model:true,trim:true,transmission:true,reviewedEquipmentId:true,currentMileage:true,updatedAt:true}});const matches=garage.filter((candidate)=>(twinMatchesVehicle(twin,candidate)&&sameReservationFitment(reservation,candidate)));
        // Resolve before any setup write. A POST cannot use another model's
        // profile, silently infer equipment, or overwrite a stale garage row.
        const reviewedEquipmentId=parsed.data.reviewedEquipmentId ?? matches[0]?.reviewedEquipmentId ?? null;
        if (!validOwnerEquipmentSelection(reservedVehicle, reviewedEquipmentId) || !ownerEquipmentReady({...reservedVehicle,reviewedEquipmentId})) return rejected('Confirm the supported engine, drivetrain and wheel/brake configuration before activation. Your trial has not started.',400);
        if (parsed.data.reviewedEquipmentId && matches[0] && (!parsed.data.expectedVehicleUpdatedAt || Date.parse(parsed.data.expectedVehicleUpdatedAt)!==matches[0].updatedAt.getTime())) return rejected('Your saved vehicle changed. Refresh before confirming equipment.');
        if(hasUnresolvedReservationGarage(reservation,garage,branch.requiresChoice))return rejected('Your existing saved vehicle needs its Automatic or Manual transmission confirmed. Contact Au7o from your account before activating this offer; your mileage and service history are unchanged.');
        if(parsed.data.mileage!=null&&matches.length<=1&&(!matches[0]?.currentMileage||matches[0].currentMileage<=0)){
          if(!isUSReservationCountry(reservation.country)||reservation.claimedAt!=null||reservation.twinStatus!=='ready'||![7,30].includes(reservation.trialDays??0))return rejected('This invitation is not ready to activate.');
          if(!Number.isFinite(now.getTime())||(matches[0]&&(!hasValidReviewedTransmissionState(matches[0])||!claimTransmissionMatchesVehicle(branch,matches[0].transmission))))return rejected('Confirm the saved vehicle transmission before activating this offer.');
          const data={currentMileage:parsed.data.mileage,lastMileageUpdate:now,mileageHistory:{create:{mileage:parsed.data.mileage,source:'manual',date:now}}};
          const saved=matches[0]?await tx.vehicle.update({where:{id:matches[0].id},data}):await tx.vehicle.create({data:{...reservedVehicle,userId,transmission:branch.requiresChoice?branch.branch:null,reviewedEquipmentId,isPrimary:false,...data}});
          matches.splice(0,matches.length,saved);
        }
        if(matches.length===0)return rejected(`Add the exact ${reservation.vehicle||twin.label} to your garage before claiming it.`);if(matches.length>1)return rejected(`More than one exact ${reservation.vehicle||twin.label} is in this garage. Remove the duplicate or contact Au7o so the correct service history can be attached.`);
        const vehicle=matches[0];if(!vehicle.currentMileage||vehicle.currentMileage<=0)return rejected('Add the current mileage to this garage vehicle before activating the trial. Your trial clock will not start yet.');if(!hasValidReviewedTransmissionState(vehicle)||!transmissionSelectionFitsReviewedOptions(branch.options,isTransmissionChoice(vehicle.transmission)?vehicle.transmission:null)||vehicle.transmission!=null&&!isTransmissionChoice(vehicle.transmission))return rejected('The saved garage transmission conflicts with this twin offer.');if(branch.requiresChoice&&branch.branch&&vehicle.transmission!==branch.branch)return rejected('The saved garage transmission conflicts with this twin offer.');
        const access=evaluateTwinAccess({founder:false,supported:true,garageMatches:true,positiveMileage:true,assignmentMatches:true,requiresTransmissionChoice:branch.requiresChoice,customerTransmissionMatches:claimTransmissionMatchesVehicle(branch,vehicle.transmission),reservation,now});
        if(access.kind==='denied'){const ended=access.reason==='claim-expired';return rejected(ended?'This beta access period has ended.':'This offer is not fully configured or eligible yet.',ended?410:409);}
        if(access.kind==='allowed'){
          if(!claimTransmissionMatchesVehicle(branch,vehicle.transmission))return rejected('The saved garage transmission does not match this claimed offer.');
          if (reviewedEquipmentId !== (vehicle.reviewedEquipmentId ?? null)) {
            const confirmed=await tx.vehicle.updateMany({where:{id:vehicle.id,userId,updatedAt:vehicle.updatedAt,year:vehicle.year,make:vehicle.make,model:vehicle.model,trim:vehicle.trim},data:{reviewedEquipmentId,updatedAt:nextMonotonicRevision(vehicle.updatedAt,now)}});
            if(confirmed.count!==1)throw new Error('CLAIM_CONFLICT');
          }
          return{ok:true,href:savedVehicleHubHref(vehicle)};
        }
        const reservationRevision=nextMonotonicRevision(reservation.updatedAt,now);const vehicleRevision=nextMonotonicRevision(vehicle.updatedAt,now);
        const transitioned=await tx.reservation.updateMany({where:{id:reservation.id,updatedAt:reservation.updatedAt,twinStatus:'ready',assignedTwin:reservation.assignedTwin,vehicleVerified:true,trimVerified:true,year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim,trialDays:reservation.trialDays,transmission:reservation.transmission},data:{twinStatus:'claimed',claimedAt:now,updatedAt:reservationRevision}});if(transitioned.count!==1)throw new Error('CLAIM_CONFLICT');
        const copied=await tx.vehicle.updateMany({where:{id:vehicle.id,userId,updatedAt:vehicle.updatedAt,year:vehicle.year,make:vehicle.make,model:vehicle.model,trim:vehicle.trim,currentMileage:vehicle.currentMileage,transmission:vehicle.transmission},data:{transmission:branch.requiresChoice?branch.branch:null,reviewedEquipmentId,updatedAt:vehicleRevision}});if(copied.count!==1)throw new Error('CLAIM_CONFLICT');return{ok:true,href:savedVehicleHubHref(vehicle)};
      },{isolationLevel:'Serializable'});
      return result.ok?NextResponse.json({success:true,href:result.href}):NextResponse.json({error:result.error},{status:result.status});
    }catch(error){if(isMaintenanceMutationError(error))return NextResponse.json({error:error.message},{status:error.status});if((error instanceof Error&&error.message==='CLAIM_CONFLICT')||isPrismaWriteConflict(error))return NextResponse.json({error:'This garage vehicle changed while the trial was being activated. Refresh and try again.'},{status:409});console.error('Twin claim failed:',error);return NextResponse.json({error:'The twin could not be activated right now.'},{status:500});}
  };
}
