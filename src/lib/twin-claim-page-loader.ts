import { reservationOfferEligible } from './reservation-offer-summary';
import type { prisma as prismaClient } from '@/lib/db';
import { evaluateTwinAccess, evaluateTwinReservationProvenance, normalizeTwinSessionIdentity } from '@/lib/twin-access';
import { getTwinDefinition, resolveTwinTransmissionBranch, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { getTwinByFulfillmentId } from '@/lib/vehicle-twin-catalog';
import { savedVehicleHubHref } from '@/lib/hub-vehicle-selection';
import { reservationOfferId, selectedReservation, sameReservationFitment, hasUnresolvedReservationGarage } from './reservation-identity';
import { reservationEmailWhere } from './reservation-email-lock';
import { ownerEquipmentOption, ownerEquipmentReady, type ReviewedOwnerEquipment } from './twin-owner-equipment';

type Session={user?:{id?:string|null;email?:string|null}}|null;
export type TwinClaimPageOutcome=
  |{kind:'sign-in'}
  |{kind:'choose';reservations:Array<{id:string;vehicle:string|null;transmission:string|null;twinStatus:string;trialDays:number|null;eligible:boolean}>}
  |{kind:'redirect-owner';href:string}
  |{kind:'display';ready:boolean;expired:boolean;vehicle:string;trialDays:number|null;reason:string;transmission?:'manual'|'automatic'|null;needsMileage?:boolean;updatedAt?:string;reservationId?:string;equipment?:ReviewedOwnerEquipment|null;vehicleRevision?:string;resumeClaimed?:boolean};

export async function loadTwinClaimPageOutcome(session:Session,deps:{
  prisma:typeof prismaClient;
  reservationId?:unknown;
  resolveOwnerCatalog?:(id:string|null|undefined)=>ReturnType<typeof getTwinByFulfillmentId>;
}):Promise<TwinClaimPageOutcome>{
  const identity=normalizeTwinSessionIdentity(session);if(!identity)return{kind:'sign-in'};
  const {userId,email}=identity;
  const [reservations,currentTimeRows]=await Promise.all([
    deps.prisma.reservation.findMany({where:await reservationEmailWhere(deps.prisma,email),orderBy:[{createdAt:'asc'},{id:'asc'}],select:{id:true,country:true,updatedAt:true,vehicle:true,twinStatus:true,assignedTwin:true,transmission:true,trialDays:true,claimedAt:true,year:true,make:true,model:true,trim:true,vehicleVerified:true,trimVerified:true}}),
    deps.prisma.$queryRaw<Array<{now:Date}>>`SELECT CURRENT_TIMESTAMP AS "now"`,
  ]);
  const selectedId=reservationOfferId(deps.reservationId);
  if(deps.reservationId != null && !selectedId)return{kind:'display',ready:false,expired:false,vehicle:'Your vehicle',trialDays:null,reason:'missing-reservation'};
  if(!selectedId&&reservations.length>1)return{kind:'choose',reservations:reservations.map(row=>({...row,eligible:reservationOfferEligible(row)}))};
  const reservation=selectedReservation(reservations,selectedId);
  if (reservation?.twinStatus === 'canceled') return {kind:'display',ready:false,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:null,reason:'reservation-canceled'};
  const provenanceRejection=evaluateTwinReservationProvenance(reservation);
  if(provenanceRejection)return{kind:'display',ready:false,expired:false,vehicle:reservation?.vehicle||'Your vehicle',trialDays:reservation?.trialDays??null,reason:provenanceRejection.reason};
  if(!reservation)return{kind:'display',ready:false,expired:false,vehicle:'Your vehicle',trialDays:null,reason:'missing-reservation'};
  if(!reservationOfferEligible(reservation))return{kind:'display',ready:false,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'unsupported-vehicle'};
  const assignedTwin=getTwinDefinition(reservation.assignedTwin);
  const ownerCatalog=(deps.resolveOwnerCatalog??getTwinByFulfillmentId)(assignedTwin?.id);
  const reservedVehicle=reservation.year&&reservation.make&&reservation.model?{year:reservation.year,make:reservation.make,model:reservation.model,trim:reservation.trim}:null;
  if(!assignedTwin||!ownerCatalog?.ownerReady||!reservedVehicle)return{kind:'display',ready:false,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'unsupported-vehicle'};
  const garageVehicles=await deps.prisma.vehicle.findMany({where:{userId},select:{id:true,year:true,make:true,model:true,trim:true,transmission:true,reviewedEquipmentId:true,currentMileage:true,updatedAt:true}});
  const matchingVehicles=garageVehicles.filter((vehicle)=>(twinMatchesVehicle(assignedTwin,vehicle)&&sameReservationFitment(reservation,vehicle)));
  const matchedVehicle=matchingVehicles.length===1?matchingVehicles[0]:null;
  const equipment = matchedVehicle && ownerEquipmentReady(matchedVehicle) ? null : ownerEquipmentOption(reservedVehicle);
  const setup={equipment,vehicleRevision:matchedVehicle?.updatedAt?.toISOString()};
  const branch=resolveTwinTransmissionBranch(assignedTwin,reservation.transmission,reservedVehicle);const needsTransmission=branch.requiresChoice;
  if(hasUnresolvedReservationGarage(reservation,garageVehicles,needsTransmission))return{kind:'display',ready:false,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'existing-transmission-unconfirmed'};
  const access=evaluateTwinAccess({founder:false,supported:!!branch.options.length,garageMatches:!!matchedVehicle,positiveMileage:typeof matchedVehicle?.currentMileage==='number'&&matchedVehicle.currentMileage>0,assignmentMatches:twinMatchesVehicle(assignedTwin,reservedVehicle),requiresTransmissionChoice:needsTransmission,customerTransmissionMatches:!needsTransmission||matchedVehicle?.transmission===branch.branch,reservation,now:currentTimeRows[0]?.now??new Date(Number.NaN)});
  if(access.kind==='allowed'&&matchedVehicle){
    if(equipment)return{kind:'display',ready:true,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'equipment-unconfirmed',transmission:branch.branch,updatedAt:reservation.updatedAt.toISOString(),reservationId:reservation.id,...setup,resumeClaimed:true};
    return{kind:'redirect-owner',href:savedVehicleHubHref(matchedVehicle)};
  }
  if(reservation.twinStatus==='ready'&&matchingVehicles.length<=1&&['garage-mismatch','missing-mileage'].includes(access.reason)){
    const configured=evaluateTwinAccess({founder:false,supported:!!branch.options.length,garageMatches:true,positiveMileage:true,assignmentMatches:twinMatchesVehicle(assignedTwin,reservedVehicle),requiresTransmissionChoice:needsTransmission,customerTransmissionMatches:!needsTransmission||!!branch.branch,reservation,now:currentTimeRows[0]?.now??new Date(Number.NaN)});
    if(configured.kind==='claimable')return{kind:'display',ready:true,expired:false,vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:'claimable-ready',transmission:branch.branch,needsMileage:true,updatedAt:reservation.updatedAt.toISOString(),reservationId:reservation.id,...setup};
  }
  return{kind:'display',ready:access.kind==='claimable',expired:access.reason==='claim-expired',vehicle:reservation.vehicle||'Your vehicle',trialDays:reservation.trialDays,reason:access.reason,transmission:branch.branch,updatedAt:reservation.updatedAt.toISOString(),reservationId:reservation.id,...setup};
}
