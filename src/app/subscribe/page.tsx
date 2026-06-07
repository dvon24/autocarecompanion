import { headers } from 'next/headers';
import { SubscribeClient } from '@/components/subscribe/SubscribeClient';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';

/**
 * /subscribe — server entry. Reads Vercel's edge-geo header so the
 * client renders the right state on first paint (no flicker). The
 * actual UI + checkout dispatch is in SubscribeClient.
 *
 * Local dev (no Vercel header) renders as "allowed" so the flow stays
 * testable end-to-end without spoofing.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pick your plan · Au7o',
  description: 'Free · Plus $14.99/mo · Pro $24.99/mo. Cancel anytime.',
};

export default async function SubscribePage() {
  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  return (
    <SubscribeClient
      country={country}
      regionAllowed={isAllowedSubscriptionRegion(country)}
    />
  );
}
