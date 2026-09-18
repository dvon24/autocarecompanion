import { GarageServiceRecordsClient } from '@/components/maintenance/GarageServiceRecordsClient';
import { auth } from '@/lib/auth';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { redirect } from 'next/navigation';

export default async function ServiceRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/garage/${encodeURIComponent(id)}/records`)}`);
  if (!(await canUsePersonalVehicle(session.user.id, id))) redirect('/account');
  return <GarageServiceRecordsClient />;
}
