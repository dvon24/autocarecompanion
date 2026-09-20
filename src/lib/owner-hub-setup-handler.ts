import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { prisma as PrismaClient } from './db';
import { entitlementSelect, productEntitlements } from './product-entitlements';
import { lockServiceOwner, lockServiceVehicle } from './maintenance-service-mutation';
import { nextMonotonicRevision } from './maintenance-mutation';
import { isPrismaWriteConflict } from './prisma-conflict';
import { ownerHubSetupChanges, MAX_HUB_MILEAGE } from './owner-hub-setup';
import { savedVehicleHubHref } from './hub-vehicle-selection';

const schema=z.object({expectedUpdatedAt:z.string().datetime({precision:3}),currentMileage:z.number().int().positive().max(MAX_HUB_MILEAGE).optional(),transmission:z.enum(['automatic','manual']).optional(),reviewedEquipmentId:z.string().min(1).max(100).optional()}).strict();
class SetupError extends Error{constructor(message:string,public status:number){super(message);}}
export function createOwnerHubSetupHandler(deps:{auth:()=>Promise<{user?:{id?:string|null}}|null>;prisma:typeof PrismaClient;now?:()=>Date}) {
  return async(request:Request,{params}:{params:Promise<{id:string}>})=>{
    // Use server-configured public origin behind the preview gateway, never caller-controlled forwarding headers.
    let expectedOrigin:string;try{expectedOrigin=new URL(process.env.APP_URL||process.env.NEXTAUTH_URL||request.url).origin;}catch{return NextResponse.json({error:'Setup is temporarily unavailable.'},{status:503});}
    if(request.headers.get('origin')!==expectedOrigin)return NextResponse.json({error:'Reload this page before saving vehicle setup.'},{status:403});
    const session=await deps.auth();if(!session?.user?.id)return NextResponse.json({error:'Sign in to finish your vehicle setup.'},{status:401});
    let input:unknown;try{input=await request.json();}catch{return NextResponse.json({error:'Invalid setup request.'},{status:400});}
    const parsed=schema.safeParse(input);if(!parsed.success)return NextResponse.json({error:'Enter the required mileage and vehicle details, then try again.'},{status:400});
    const userId=session.user.id,{id}=await params;
    try{
      const result=await deps.prisma.$transaction(async tx=>{
        await lockServiceOwner(tx,userId);await lockServiceVehicle(tx,id);
        const user=await tx.user.findUnique({where:{id:userId},select:entitlementSelect});
        if(!productEntitlements(user).hub)throw new SetupError('An active Hub membership is required for this setup.',403);
        const vehicle=await tx.vehicle.findFirst({where:{id,userId}});
        if(!vehicle)throw new SetupError('Vehicle not found.',404);
        if(vehicle.updatedAt.toISOString()!==parsed.data.expectedUpdatedAt)throw new SetupError('This vehicle changed. Reload setup to check the saved details before continuing.',409);
        let data;try{data=ownerHubSetupChanges(vehicle,parsed.data);}catch(error){throw new SetupError(error instanceof Error?error.message:'Check the vehicle details.',400);}
        if(!Object.keys(data).length)return {vehicle,href:savedVehicleHubHref(vehicle)};
        const now=deps.now?.()??new Date(),revision=nextMonotonicRevision(vehicle.updatedAt,now);
        const changed=await tx.vehicle.updateMany({where:{id,userId,updatedAt:vehicle.updatedAt,year:vehicle.year,make:vehicle.make,model:vehicle.model,trim:vehicle.trim,currentMileage:vehicle.currentMileage,transmission:vehicle.transmission,reviewedEquipmentId:vehicle.reviewedEquipmentId},data:{...data,updatedAt:revision,...(data.currentMileage!==undefined?{lastMileageUpdate:now}:{})}});
        if(changed.count!==1)throw new SetupError('This vehicle changed while saving. Reload setup to check its saved details.',409);
        if(data.currentMileage!==undefined)await tx.mileageLog.create({data:{vehicleId:id,mileage:data.currentMileage,source:'manual'}});
        const saved=await tx.vehicle.findFirst({where:{id,userId}});if(!saved)throw new Error('Saved vehicle missing');
        return {vehicle:saved,href:savedVehicleHubHref(saved)};
      },{isolationLevel:'Serializable',timeout:20000});
      // Return only the fields needed to verify this exact setup, not owner history or private identifiers.
      const v=result.vehicle;
      return NextResponse.json({vehicle:{id:v.id,year:v.year,make:v.make,model:v.model,trim:v.trim,currentMileage:v.currentMileage,transmission:v.transmission,reviewedEquipmentId:v.reviewedEquipmentId,updatedAt:v.updatedAt},href:result.href},{headers:{'Cache-Control':'private, no-store'}});
    }catch(error){
      if(error instanceof SetupError)return NextResponse.json({error:error.message},{status:error.status});
      if(isPrismaWriteConflict(error))return NextResponse.json({error:'This vehicle changed while saving. Reload setup to check its saved details.'},{status:409});
      return NextResponse.json({error:'The setup save could not be confirmed. Reload to check your vehicle before trying again.'},{status:500});
    }
  };
}
