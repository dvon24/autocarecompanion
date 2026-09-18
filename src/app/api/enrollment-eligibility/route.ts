import { NextResponse } from 'next/server';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return NextResponse.json(
    { eligible: isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country')), accountEnrollmentEnabled: publicEnrollmentEnabled() && isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country')) },
    { headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
    } },
  );
}
