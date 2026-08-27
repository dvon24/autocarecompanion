import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { getTwinDefinition, resolveTwinTransmissionBranch, sameTwinVehicleIdentity, transmissionSelectionFitsReviewedOptions, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { evaluateTwinAccess, evaluateTwinReservationProvenance, normalizeTwinSessionIdentity } from '@/lib/twin-access';
import { getTwinByFulfillmentId } from '@/lib/vehicle-twin-catalog';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { claimTransmissionMatchesVehicle } from '@/lib/twin-route-contracts';
import { hasValidReviewedTransmissionState, isTransmissionChoice } from '@/lib/transmission-options';
import { isMaintenanceMutationError, nextMonotonicRevision } from '@/lib/maintenance-mutation';

type Session = { user?: { id?: string | null; email?: string | null } } | null;
type ClaimResult = { ok:true;href:string } | { ok:false;error:string;status:number };
const rejected=(error:string,status=409):ClaimResult=>({ok:false,error,status});

export function createTwinClaimPostHandler(deps:{auth:()=>Promise<Session>;prisma:typeof prismaClient;resolveTwinDefinition?:typeof getTwinDefinition}){
  return async function POST(){
    const identity=normalizeTwinSessionIdentity(await deps.auth());
    if(!identity)return NextResponse.json({error:'Sign in to accept this offer'},{status:401});
    const {userId,email}=identity;
    try{
      const result=await deps.prisma.$transaction(async(tx):Promise<ClaimResult>=>{
        const currentTimeRows=await tx.$queryRaw<Array<{now:Date}>>`SELECT CURRENT_TIMESTAMP AS "now"`;const now=currentTimeRows[0]?.now??new Date(Number.NaN);
        const reservation=await tx.reservation.findUnique({where:{email}});if(!reservation)return rejected('No ready twin offer was found for this account',404);const provenance=evaluateTwinReservationProvenance(reservation);if(provenance)return rejected(provenance.reason==='trim-unverified'?'This exact trim still needs to be verified before activation.':'This vehicle selection still needs to be verified before activation.');
        if(reservation.transmission!=null&&!isTransmissionChoice(reservation.transmission))return rejected('The saved transmission selection is invalid.');const twin=(deps.resolveTwinDefinition??getTwinDefinition)(reservation.assignedTwin);const ownerCatalog=getTwinByFulfillmentId(twin?.id);if(!twin||!ownerCatalog?.ownerReady)return rejected('The assigned twin is not available for owner use.');
        const reservedVehicle=reservation.year&&reservation.make&&reservation.model?{year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim}:null;if(!reservedVehicle||!twinMatchesVehicle(twin,reservedVehicle))return rejected('This twin no longer matches the reserved vehicle. Contact Au7o before activating it.');if(!hasValidReviewedTransmissionState({...reservedVehicle,transmission:reservation.transmission}))return rejected('The saved transmission selection is incompatible with this reviewed fitment.');
        const branch=resolveTwinTransmissionBranch(twin,reservation.transmission,reservedVehicle);if(!branch.options.length)return rejected('This twin has no registered transmission branch.');if(!transmissionSelectionFitsReviewedOptions(branch.options,reservation.transmission))return rejected('The saved transmission selection is incompatible with this reviewed fitment.');if(branch.requiresChoice&&!branch.branch)return rejected('The automatic/manual fitment still needs to be confirmed before this twin can be activated.');
        const garage=await tx.vehicle.findMany({where:{userId,year:reservedVehicle.year},select:{id:true,year:true,make:true,model:true,trim:true,transmission:true,currentMileage:true,updatedAt:true}});const matches=garage.filter((candidate)=>(twinMatchesVehicle(twin,candidate)&&sameTwinVehicleIdentity(reservedVehicle,candidate)));
        if(matches.length===0)return rejected(`Add the exact ${reservation.vehicle||twin.label} to your garage before claiming it.`);if(matches.length>1)return rejected(`More than one exact ${reservation.vehicle||twin.label} is in this garage. Remove the duplicate or contact Au7o so the correct service history can be attached.`);
        const vehicle=matches[0];if(!vehicle.currentMileage||vehicle.currentMileage<=0)return rejected('Add the current mileage to this garage vehicle before activating the trial. Your trial clock will not start yet.');if(!hasValidReviewedTransmissionState(vehicle)||!transmissionSelectionFitsReviewedOptions(branch.options,isTransmissionChoice(vehicle.transmission)?vehicle.transmission:null)||vehicle.transmission!=null&&!isTransmissionChoice(vehicle.transmission))return rejected('The saved garage transmission conflicts with this twin offer.');if(branch.requiresChoice&&branch.branch&&vehicle.transmission!==branch.branch)return rejected('The saved garage transmission conflicts with this twin offer.');
        const access=evaluateTwinAccess({founder:false,supported:true,garageMatches:true,positiveMileage:true,assignmentMatches:true,requiresTransmissionChoice:branch.requiresChoice,customerTransmissionMatches:claimTransmissionMatchesVehicle(branch,vehicle.transmission),reservation,now});
        if(access.kind==='denied'){const ended=access.reason==='claim-expired';return rejected(ended?'This beta access period has ended.':'This offer is not fully configured or eligible yet.',ended?410:409);}
        if(access.kind==='allowed'){if(!claimTransmissionMatchesVehicle(branch,vehicle.transmission))return rejected('The saved garage transmission does not match this claimed offer.');return{ok:true,href:`/vehicle/${vehicleSlug(vehicle.year,vehicle.make,vehicle.model,vehicle.trim)}`};}
        const reservationRevision=nextMonotonicRevision(reservation.updatedAt,now);const vehicleRevision=nextMonotonicRevision(vehicle.updatedAt,now);
        const transitioned=await tx.reservation.updateMany({where:{id:reservation.id,updatedAt:reservation.updatedAt,twinStatus:'ready',assignedTwin:reservation.assignedTwin,vehicleVerified:true,trimVerified:true,year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim,trialDays:reservation.trialDays,transmission:reservation.transmission},data:{twinStatus:'claimed',claimedAt:now,updatedAt:reservationRevision}});if(transitioned.count!==1)return rejected('This offer changed while it was being activated. Refresh to review the current offer.');
        const copied=await tx.vehicle.updateMany({where:{id:vehicle.id,userId,updatedAt:vehicle.updatedAt,year:vehicle.year,make:vehicle.make,model:vehicle.model,trim:vehicle.trim,currentMileage:vehicle.currentMileage,transmission:vehicle.transmission},data:{transmission:branch.requiresChoice?branch.branch:null,updatedAt:vehicleRevision}});if(copied.count!==1)throw new Error('CLAIM_CONFLICT');return{ok:true,href:`/vehicle/${vehicleSlug(vehicle.year,vehicle.make,vehicle.model,vehicle.trim)}`};
      },{isolationLevel:'Serializable'});
      return result.ok?NextResponse.json({success:true,href:result.href}):NextResponse.json({error:result.error},{status:result.status});
    }catch(error){if(isMaintenanceMutationError(error))return NextResponse.json({error:error.message},{status:error.status});if((error instanceof Error&&error.message==='CLAIM_CONFLICT')||isPrismaWriteConflict(error))return NextResponse.json({error:'This garage vehicle changed while the trial was being activated. Refresh and try again.'},{status:409});console.error('Twin claim failed:',error);return NextResponse.json({error:'The twin could not be activated right now.'},{status:500});}
  };
}
