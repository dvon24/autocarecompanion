import { TwinHero } from '@/components/home/TwinHero';
import { TwinPlayground } from '@/components/twin/stage/TwinPlayground';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const metadata = { robots: { index: false, follow: false } };

/**
 * Preview for the ported "Split" hero before it replaces the live homepage.
 * Production header and footer wrap it so the page reads end-to-end the way
 * it will ship. Sign in is omitted — this page's one job is the reservation.
 */
export default function HeroPreviewPage() {
  return (
    <>
      <SiteHeader showSignIn={false} ctaLabel="Reserve my spot" ctaShortLabel="Reserve" ctaHref="#reserve" />
      <TwinHero stage={<TwinPlayground />} />
      <SiteFooter />
    </>
  );
}
