import type { prisma as prismaClient } from '@/lib/db';
import { evaluateTwinAccess, evaluateTwinReservationProvenance, normalizeTwinSessionIdentity } from '@/lib/twin-access';
import { getTwinDefinition, resolveTwinTransmissionBranch, sameTwinVehicleIdentity, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { getTwinByFulfillmentId } from '@/lib/vehicle-twin-catalog';
import { vehicleSlug } from '@/lib/vehicle-slug';

type Session={user?:{id?:string|null;email?:string|null}}|null;
export type TwinClaimPageOutcome=
  |{kind:'sign-in'}
  |{kind:'redirect-owner';href:string}
  |{kind:'display';ready:boolean;expired:boolean;vehicle:string;trialDays:number|null;reason:string};

export async function loadTwinClaimPageOutcome(session:Session,deps:{
  prisma:typeof prismaClient;
  resolveOwnerCatalog?:(id:string|null|undefined)=>ReturnType<typeof getTwinByFulfillmentId>;
}):Promise<TwinClaimPageOutcome>{
  const identity=normalizeTwinSessionIdentity(session);if(!identity)return{kind:'sign-in'};
  const {userId,email}=identity;
  const [reservation,currentTimeRows]=await Promise.all([
    deps.prisma.reservation.findUnique({where:{email},select:{vehicle:true,twinStatus:true,assignedTwin:true,transmission:true,trialDays:true,claimedAt:true,year:true,make:true,model:true,trim:true,vehicleVerified:true,trimVerified:true}}),
    deps.prisma.$queryRaw<Array<{now:Date}>>`SELECT CURRENT_TIMESTAMP AS "now"`,
  ]);
  const provenanceRejection=evaluateTwinReservationProvenance(reservation);
  if(provenanceRejection)return{kind:'display',ready:false,expired:false,vehicle:reservation?.vehicle||'Your vehicle',trialDays:reservation?.trialDays??null,reason:provenanceRejection.reason};
  if(!reservation)return{kind:'display',ready:false,expired:false,vehicle:'Your vehicle',trialDays:null,reason:'missing-reservation'};
  const assignedTwin=getTwinDefinition(reservation.assignedTwin);
  const ownerCatalog=(deps.resolveOwnerCatalog??getTwinByFulfillmentId)(assignedTwin?.id);
  const reservedVehicle=reservation.year&&reservation.make&&reservation.model?{year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim}:null;
  if(!assignedTwin||!ownerCatalog?.ownerReady||!reservedVehicle)return{kind:'display',ready:false,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'unsupported-vehicle'};
  const garageVehicles=await deps.prisma.vehicle.findMany({where:{userId},select:{id:true,year:true,make:true,model:true,trim:true,transmission:true,currentMileage:true}});
  const matchingVehicles=garageVehicles.filter((vehicle)=>(twinMatchesVehicle(assignedTwin,vehicle)&&sameTwinVehicleIdentity(reservedVehicle,vehicle)));
  const matchedVehicle=matchingVehicles.length===1?matchingVehicles[0]:null;
  const branch=resolveTwinTransmissionBranch(assignedTwin,reservation.transmission,reservedVehicle);const needsTransmission=branch.requiresChoice;
  const access=evaluateTwinAccess({founder:false,supported:!!branch.options.length,garageMatches:!!matchedVehicle,positiveMileage:typeof matchedVehicle?.currentMileage==='number'&&matchedVehicle.currentMileage>0,assignmentMatches:twinMatchesVehicle(assignedTwin,reservedVehicle),requiresTransmissionChoice:needsTransmission,customerTransmissionMatches:!needsTransmission||matchedVehicle?.transmission===branch.branch,reservation,now:currentTimeRows[0]?.now??new Date(Number.NaN)});
  if(access.kind==='allowed'&&matchedVehicle)return{kind:'redirect-owner',href:`/vehicle/${vehicleSlug(matchedVehicle.year,matchedVehicle.make,matchedVehicle.model,matchedVehicle.trim)}`};
  return{kind:'display',ready:access.kind==='claimable',expired:access.reason==='claim-expired',vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:access.reason};
}
