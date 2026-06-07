import { headers } from 'next/headers';
import { SubscribeClient } from '@/components/subscribe/SubscribeClient';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { auth } from '@/lib/auth';

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
  // Founder + ops bypass — signed-in users whose login email is on the
  // allow-list see the regular checkout buttons even from outside the
  // US so the flow is QA-able. Anonymous + non-bypass users hit the
  // geo gate.
  const session = await auth().catch(() => null);
  const email = session?.user?.email ?? null;
  return (
    <SubscribeClient
      country={country}
      regionAllowed={isAllowedSubscriptionRegion(country, email)}
    />
  );
}
