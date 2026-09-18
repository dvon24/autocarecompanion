import { NextResponse } from 'next/server';
import type { prisma as Database } from './db';
import { entitlementSelect } from './product-entitlements';
import { billingReturnState } from './billing-return';
import { getLiveTwinForVehicle, resolveTwinTransmissionBranch } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { getBillingEnrollmentReview } from './billing-enrollment-review';

export function createBillingStatusHandler(deps: {
  auth: () => Promise<{ user?: { id?: string } } | null>;
  prisma: Pick<typeof Database, 'user' | 'billingAttempt' | 'vehicle' | '$queryRaw'>;
}) {
return async function GET(request: Request) {
  const session = await deps.auth();
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!session?.user?.id) return NextResponse.json({ error: 'sign_in_required' }, { status: 401, headers });
  const userId = session.user.id;
  const params = new URL(request.url).searchParams;
  const product = params.get('product') === 'hub' || params.get('intent') === 'upgrade' ? 'hub' : 'visual';
  const account = await deps.prisma.user.findUnique({ where: { id: userId }, select: entitlementSelect });
  const review = await getBillingEnrollmentReview(deps.prisma, userId, account?.subscriptionId);
  if (review?.state === 'review_required') return NextResponse.json(billingReturnState(account, product, null, true), { headers });
  let vehicleId: string | null = null;
  // Explicit invalid targets never silently fall through to another stored car.
  if (params.has('vehicleId')) vehicleId = params.get('vehicleId');
  else if (product === 'hub') {
    const upgrades = account?.subscriptionId
      ? await deps.prisma.$queryRaw<{ vehicleId: string }[]>`SELECT "vehicleId" FROM "HubUpgradeAttempt" WHERE "userId" = ${userId} AND "subscriptionId" = ${account.subscriptionId}` : [];
    if (upgrades.length) vehicleId = upgrades[0].vehicleId;
    else vehicleId = (await deps.prisma.billingAttempt.findUnique({ where: { userId }, select: { vehicleId: true } }))?.vehicleId || null;
  }
  // Never silently choose a different car. Account remains the fallback.
  const candidate = product === 'hub' && vehicleId ? await deps.prisma.vehicle.findFirst({ where: { id: vehicleId, userId } }) : null;
  const twin = candidate && getLiveTwinForVehicle(candidate);
  const branch = twin && candidate && resolveTwinTransmissionBranch(twin, candidate.transmission, candidate);
  const vehicle = candidate && twin && getTwinByFulfillmentId(twin.id)?.ownerReady
    && candidate.currentMileage && branch?.options.length && (!branch.requiresChoice || branch.branch) ? candidate : null;
  const attempt = product === 'visual' ? await deps.prisma.billingAttempt.findUnique({ where: { userId }, select: { returnTo: true, product: true } }) : null;
  return NextResponse.json(billingReturnState(account, product, vehicle, false, attempt?.product === 'visual' ? attempt.returnTo : null), { headers });
};
}
