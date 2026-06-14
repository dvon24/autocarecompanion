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

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  // App-store compliance: the native shell (Au7oApp WebView) must NOT render
  // an in-WebView Stripe checkout — Apple/Google require their own billing
  // for in-app digital purchases. When we detect the app we show a
  // store-safe informational state instead. This is keyed on the UA marker,
  // NOT screen size — a phone *browser* is plain web and Stripe is fine
  // there (that's most of our traffic). `?app=1` previews the app state in
  // a normal browser so it's testable on a phone without the build.
  const ua = h.get('user-agent') || '';
  const sp = await searchParams;
  const appMode = ua.includes('Au7oApp') || sp.app === '1';
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
      appMode={appMode}
    />
  );
}
