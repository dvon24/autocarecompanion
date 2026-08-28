import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin-guard';
import type { AdminOverviewData } from './admin-overview';

export async function getAdminOverviewResponse(
  load: () => Promise<AdminOverviewData>,
  dependencies: {
    authorize?: typeof requireFounder;
    reportError?: (message: string, error: unknown) => void;
  } = {},
) {
  const denied = await (dependencies.authorize ?? requireFounder)();
  if (denied) return denied;

  try {
    return NextResponse.json(await load());
  } catch (error) {
    (dependencies.reportError ?? console.error)('Admin overview error:', error);
    return NextResponse.json({ error: 'Failed to build Admin overview' }, { status: 500 });
  }
}
