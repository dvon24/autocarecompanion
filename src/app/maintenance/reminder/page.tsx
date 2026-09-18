import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTwinHubData } from '@/lib/twin-hub-data';
import { resolveMaintenanceReminderEntry } from '@/lib/maintenance-reminder-entry';

export const dynamic = 'force-dynamic';
export default async function MaintenanceReminderPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const query = await searchParams;
  const session = await auth();
  const destination = await resolveMaintenanceReminderEntry({
    user:session?.user?.id ? {id:session.user.id,email:session.user.email} : null,
    vehicleId:typeof query.vehicleId === 'string' ? query.vehicleId : '',
    view:query.view === 'tree' ? 'tree' : query.view === 'records' ? 'records' : 'schedule',
    findOwnedVehicle:(userId,id)=>prisma.vehicle.findFirst({where:{userId,id},select:{id:true,year:true,make:true,model:true,trim:true}}),
    loadTwin:getTwinHubData,
  });
  redirect(destination);
}
