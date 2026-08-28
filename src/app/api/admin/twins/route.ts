import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { getAdminTwinDefinitions } from '@/lib/vehicle-twin-catalog';

export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) return NextResponse.json({error:'Not authorized'}, {status:403});
  return NextResponse.json({twins:getAdminTwinDefinitions()});
}
