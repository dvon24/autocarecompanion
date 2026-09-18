import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkVehicleLimit } from '@/lib/pricing/limits';
import { validOwnerEquipmentSelection } from '@/lib/twin-owner-equipment';
import { ownerHubSetupChanges } from '@/lib/owner-hub-setup';
import { entitlementSelect, productEntitlements } from '@/lib/product-entitlements';

const CreateVehicleSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional(),
  reviewedEquipmentId: z.string().min(1).max(100).nullable().optional(),
  vin: z.string().max(17).optional(),
  color: z.string().max(50).optional(),
  currentMileage: z.number().min(0).optional(),
  annualMileage: z.number().min(0).max(200000).optional(),
  nickname: z.string().max(100).optional(),
  isPrimary: z.boolean().optional(),
  hubSetup:z.literal(true).optional(),
  transmission:z.enum(['automatic','manual']).optional(),
});

// GET /api/vehicles - List user's vehicles
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (new URL(request.url).searchParams.get('view') === 'switcher') {
      const vehicles = await prisma.vehicle.findMany({
        where: { userId: session.user.id },
        select: { id:true, year:true, make:true, model:true, trim:true, nickname:true },
        orderBy: [{ isPrimary:'desc' }, { createdAt:'desc' }],
      });
      return NextResponse.json({ vehicles });
    }
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: session.user.id },
      include: {
        maintenanceRecords: {
          orderBy: { date: 'desc' },
        },
        modifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Tier-aware vehicle quota. Free gets 1 vehicle, Plus 3, Pro 10.
    // (Was: blanket 403 unless subscriptionStatus === 'active'.) The
    // upgrade target in the response lets the client deep-link to the
    // right pricing tier instead of generic /subscribe.
    const limit = await checkVehicleLimit(session.user.id);
    if (!limit.allowed) {
      const upgradeTo = limit.tier === 'free' ? 'plus' : 'pro';
      return NextResponse.json(
        {
          error: 'vehicle_limit_reached',
          message: `You've reached the ${limit.limit}-vehicle limit on the ${limit.tier} plan. Upgrade to ${upgradeTo} to add more.`,
          tier: limit.tier,
          current: limit.current,
          limit: limit.limit,
          upgradeTo,
        },
        { status: 403 }
      );
    }
    const vehicleCount = limit.current;

    const body = await request.json();
    const parsed = CreateVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid vehicle data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { isPrimary, currentMileage, annualMileage, hubSetup, transmission, ...vehicleData } = parsed.data;
    let setupData:{}|{transmission?:'automatic'|'manual'}={};
    if(hubSetup){
      const user=await prisma.user.findUnique({where:{id:session.user.id},select:entitlementSelect});
      if(!productEntitlements(user).hub)return NextResponse.json({error:'hub_required',message:'An active Hub membership is required to add an owner Twin.'},{status:403});
      try{const changes=ownerHubSetupChanges({...vehicleData,currentMileage:null,transmission:null,reviewedEquipmentId:null},{currentMileage,transmission,reviewedEquipmentId:vehicleData.reviewedEquipmentId??undefined});setupData=changes.transmission?{transmission:changes.transmission}:{};}
      catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Check the required Hub vehicle details.'},{status:400});}
    }else if(transmission!==undefined)return NextResponse.json({error:'Transmission selection is only available through the reviewed Hub setup.'},{status:400});
    if (!validOwnerEquipmentSelection(vehicleData, vehicleData.reviewedEquipmentId)) {
      return NextResponse.json({ error:'Choose the reviewed equipment for this exact vehicle.' }, { status:400 });
    }

    // If this is the first vehicle or marked as primary, update other vehicles
    if (isPrimary || vehicleCount === 0) {
      await prisma.vehicle.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false },
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...vehicleData,
        ...setupData,
        userId: session.user.id,
        isPrimary: isPrimary || vehicleCount === 0,
        currentMileage: currentMileage ?? null,
        annualMileage: annualMileage || null,
        lastMileageUpdate: currentMileage != null ? new Date() : null,
      },
    });

    // If mileage was provided, create initial mileage log
    if (currentMileage != null) {
      await prisma.mileageLog.create({
        data: {
          vehicleId: vehicle.id,
          mileage: currentMileage,
          source: 'manual',
        },
      });
    }

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
